import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * Robust Environment Variable Fallback
 * Prevents build crashes when environment variables are missing during CI/CD
 */
function getEnv(name: string, isRequired = false): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    if (isRequired && typeof window === 'undefined') {
      console.warn(`[Supabase Config] Missing required environment variable: ${name}`);
      // Fallback for build phase only, actual runtime will still fail gracefully
      return 'missing-env-fallback';
    }
    return '';
  }
  return value;
}

const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL', true);
const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', true);
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');

// OpenAI Instance
export const openai = new OpenAI({ 
  apiKey: OPENAI_API_KEY || 'no-key-fallback' 
});

// Admin Supabase Client (Server-side Only)
export const supabaseAdmin: SupabaseClient = createClient(
  SUPABASE_URL,
  SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY, // Fallback to anon if service role missing
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

/**
 * Creates a standard Supabase client with optional token
 * Safe for both Client and Server components
 */
export function createSupabaseClient(token?: string | null): SupabaseClient {
  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  return createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers },
    auth: { 
      autoRefreshToken: typeof window !== 'undefined', 
      persistSession: typeof window !== 'undefined',
      detectSessionInUrl: typeof window !== 'undefined'
    }
  });
}

/**
 * Extract Bearer Token from Request Headers
 */
export function getBearerToken(headers: Headers): string | null {
  const auth = headers.get('authorization') || headers.get('Authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) return parts[1];
  return null;
}

/**
 * Strict Admin Check for Server-side Routes
 */
export async function requireAdmin(headers: Headers): Promise<{ userId: string }> {
  const token = getBearerToken(headers);
  if (!token) {
    const error = new Error('Unauthorized: No token provided');
    (error as any).status = 401;
    throw error;
  }
  
  const supabase = createSupabaseClient(token);
  const { data: userData, error: userError } = await supabase.auth.getUser();
  
  if (userError || !userData?.user) {
    const error = new Error('Unauthorized: Invalid or expired token');
    (error as any).status = 401;
    throw error;
  }
  
  const userId = userData.user.id;
  const { data: profile, error: profileError } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single();
    
  if (profileError || !profile || profile.role !== 'admin') {
    const error = new Error('Forbidden: Admin access required');
    (error as any).status = 403;
    throw error;
  }
  
  return { userId };
}

export function getEmbeddingModel(): string {
  return process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
}

export function getChatModel(): string {
  return process.env.OPENAI_CHAT_MODEL || 'gpt-4o';
}

import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * Robust Environment Variable Access
 * Prevents build-time crashes by providing valid fallbacks for static analysis.
 */
function getEnv(name: string, isRequired = false): string {
  const value = process.env[name];
  if (!value || value.trim() === '') {
    if (isRequired && typeof window === 'undefined') {
      // Return a valid URL format for Supabase to prevent initialization crash
      if (name.includes('URL')) return 'https://placeholder-project.supabase.co';
      // Return a valid JWT-like format for keys to prevent validation errors
      if (name.includes('KEY')) return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.static-fallback';
      return 'static-build-fallback';
    }
    return '';
  }
  return value;
}

export const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL', true);
export const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', true);
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');

/**
 * OpenAI Instance (Server-only lazy getter)
 */
let _openai: OpenAI | null = null;
export const getOpenAI = () => {
  if (typeof window !== 'undefined') throw new Error('OpenAI client cannot be used in the browser');
  if (!_openai) {
    _openai = new OpenAI({ apiKey: OPENAI_API_KEY || 'no-key-provided' });
  }
  return _openai;
};

// Exporting proxy to maintain backward compatibility in API routes
export const openai = (typeof window === 'undefined') ? new Proxy({} as OpenAI, {
  get: (_, prop) => (getOpenAI() as any)[prop]
}) : null as unknown as OpenAI;

/**
 * Admin Supabase Client (Server-only lazy getter)
 */
let _supabaseAdmin: SupabaseClient | null = null;
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') throw new Error('Supabase Admin client cannot be used in the browser');
  if (!_supabaseAdmin) {
    _supabaseAdmin = createClient(
      SUPABASE_URL,
      SUPABASE_SERVICE_ROLE_KEY || SUPABASE_ANON_KEY,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    );
  }
  return _supabaseAdmin;
};

// Proxy for backward compatibility
export const supabaseAdmin = (typeof window === 'undefined') ? new Proxy({} as SupabaseClient, {
  get: (_, prop) => (getSupabaseAdmin() as any)[prop]
}) : null as unknown as SupabaseClient;

/**
 * createSupabaseClient
 * Universal client creator for both Client and Server components.
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
 * getBearerToken
 * Helper to extract JWT from Authorization header.
 */
export function getBearerToken(headers: Headers): string | null {
  const auth = headers.get('authorization') || headers.get('Authorization');
  if (!auth) return null;
  const parts = auth.split(' ');
  if (parts.length === 2 && /^bearer$/i.test(parts[0])) return parts[1];
  return null;
}

/**
 * requireAdmin
 * Strict server-side check for admin role.
 */
export async function requireAdmin(headers: Headers): Promise<{ userId: string }> {
  const token = getBearerToken(headers);
  if (!token) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }
  
  const supabase = createSupabaseClient(token);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }
  
  const { data: profile, error: profileError } = await getSupabaseAdmin()
    .from('users')
    .select('role')
    .eq('id', user.id)
    .single();
    
  if (profileError || !profile || profile.role !== 'admin') {
    const error = new Error('Forbidden');
    (error as any).status = 403;
    throw error;
  }
  
  return { userId: user.id };
}

/**
 * requireAuth
 * Simplified check for any authenticated user.
 */
export async function requireAuth(headers: Headers): Promise<{ userId: string }> {
  const token = getBearerToken(headers);
  if (!token) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }
  
  const supabase = createSupabaseClient(token);
  const { data: { user }, error: userError } = await supabase.auth.getUser();
  
  if (userError || !user) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }
  
  return { userId: user.id };
}

export function getEmbeddingModel(): string {
  return process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
}

export function getChatModel(): string {
  return process.env.OPENAI_CHAT_MODEL || 'gpt-4o';
}

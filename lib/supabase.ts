import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * Ultra-Robust Environment Variable Access
 * Ensures Supabase initialization doesn't crash even if env vars are completely missing.
 */
function getEnv(name: string, isRequired = false): string {
  const value = process.env[name];
  
  // If the value is truly missing or empty
  if (!value || value.trim() === '') {
    // During build/static analysis or in browser without env vars
    if (isRequired) {
      if (name.includes('URL')) {
        // Must be a valid URL format for Supabase to not throw "supabaseUrl is required"
        return 'https://placeholder-project.supabase.co';
      }
      if (name.includes('KEY')) {
        // Must be a valid JWT-like format for Supabase to not throw during validation
        return 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.static-fallback-key';
      }
      return 'static-build-fallback';
    }
    return '';
  }
  return value;
}

// Global Configs
export const SUPABASE_URL = getEnv('NEXT_PUBLIC_SUPABASE_URL', true);
export const SUPABASE_ANON_KEY = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY', true);
const SUPABASE_SERVICE_ROLE_KEY = getEnv('SUPABASE_SERVICE_ROLE_KEY');
const OPENAI_API_KEY = getEnv('OPENAI_API_KEY');

/**
 * OpenAI Instance (Server-only)
 */
let _openai: OpenAI | null = null;
export const getOpenAI = () => {
  if (typeof window !== 'undefined') return null;
  if (!_openai) {
    _openai = new OpenAI({ apiKey: OPENAI_API_KEY || 'no-key-provided' });
  }
  return _openai;
};

export const openai = (typeof window === 'undefined') ? new Proxy({} as OpenAI, {
  get: (_, prop) => {
    const instance = getOpenAI();
    return instance ? (instance as any)[prop] : undefined;
  }
}) : null as unknown as OpenAI;

/**
 * Admin Supabase Client (Server-only)
 */
let _supabaseAdmin: SupabaseClient | null = null;
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') return null;
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

export const supabaseAdmin = (typeof window === 'undefined') ? new Proxy({} as SupabaseClient, {
  get: (_, prop) => {
    const instance = getSupabaseAdmin();
    return instance ? (instance as any)[prop] : undefined;
  }
}) : null as unknown as SupabaseClient;

/**
 * createSupabaseClient
 * Main entry point for Supabase client creation.
 * It is now wrapped in a try-catch and returns a safe placeholder if it fails.
 */
export function createSupabaseClient(token?: string | null): SupabaseClient {
  try {
    const headers: Record<string, string> = {};
    if (token) headers['Authorization'] = `Bearer ${token}`;
    
    // Ensure we never pass an empty string to createClient
    const url = SUPABASE_URL && SUPABASE_URL.startsWith('http') ? SUPABASE_URL : 'https://placeholder.supabase.co';
    const key = SUPABASE_ANON_KEY && SUPABASE_ANON_KEY.length > 20 ? SUPABASE_ANON_KEY : 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';

    return createClient(url, key, {
      global: { headers },
      auth: { 
        autoRefreshToken: typeof window !== 'undefined', 
        persistSession: typeof window !== 'undefined',
        detectSessionInUrl: typeof window !== 'undefined'
      }
    });
  } catch (error) {
    console.error('[Supabase Client] Failed to initialize:', error);
    // Return a dummy client to prevent the entire React app from crashing
    return createClient('https://placeholder.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder');
  }
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
  
  const adminClient = getSupabaseAdmin();
  if (!adminClient) {
    throw new Error('Admin client not available on client-side');
  }

  const { data: profile, error: profileError } = await adminClient
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

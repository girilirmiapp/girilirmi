import { createBrowserClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

/**
 * Global Configuration with Fallbacks
 * This ensures the app doesn't crash if environment variables are missing.
 * Placeholders follow the user-requested pattern.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key';
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || '';

/**
 * createSupabaseClient (Client Component Helper)
 * Used in browser-side code to maintain session state.
 */
export function createSupabaseClient(): SupabaseClient {
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
}

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

// Proxy for backward compatibility in API routes
export const openai = (typeof window === 'undefined') ? new Proxy({} as OpenAI, {
  get: (_, prop) => {
    const instance = getOpenAI();
    return (instance as any)[prop];
  }
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
  get: (_, prop) => {
    const instance = getSupabaseAdmin();
    return (instance as any)[prop];
  }
}) : null as unknown as SupabaseClient;

/**
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
 * requireAdmin (Server-side check)
 */
export async function requireAdmin(headers: Headers): Promise<{ userId: string }> {
  const token = getBearerToken(headers);
  if (!token) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
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
 * requireAuth (Server-side check)
 */
export async function requireAuth(headers: Headers): Promise<{ userId: string }> {
  const token = getBearerToken(headers);
  if (!token) {
    const error = new Error('Unauthorized');
    (error as any).status = 401;
    throw error;
  }
  
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } }
  });
  
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

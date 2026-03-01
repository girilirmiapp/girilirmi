import { createBrowserClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Enforce environment variables
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Throw an error during build if client-side vars are missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Application cannot start.');
}

/**
 * createSupabaseClient (Client Component Helper)
 * This is the primary way to interact with Supabase from the browser.
 * It's a singleton instance that's safe to use across components.
 */
let supabaseClient: SupabaseClient | undefined;

export function createSupabaseClientComponent(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }
  supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

/**
 * OpenAI Instance (Server-only lazy getter)
 * Throws an error if server-side key is missing.
 */
let _openai: OpenAI | null = null;
export const getOpenAI = () => {
  if (typeof window !== 'undefined') {
    throw new Error('OpenAI client cannot be used in the browser.');
  }
  if (!_openai) {
    if (!OPENAI_API_KEY) {
      throw new Error('CRITICAL: OPENAI_API_KEY is not set for server-side operations.');
    }
    _openai = new OpenAI({ apiKey: OPENAI_API_KEY });
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
 * Throws an error if server-side key is missing.
 */
let _supabaseAdmin: SupabaseClient | null = null;
export const getSupabaseAdmin = () => {
  if (typeof window !== 'undefined') {
    throw new Error('Supabase Admin client cannot be used in the browser.');
  }
  if (!_supabaseAdmin) {
    if (!SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set for admin operations.');
    }
    _supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
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
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (profileError || profile?.role !== 'admin') {
    const error = new Error('Forbidden');
    (error as any).status = 403;
    throw error;
  }
  
  return { userId: user.id };
}

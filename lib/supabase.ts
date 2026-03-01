import { createBrowserClient } from '@supabase/ssr';
import { createClient, type SupabaseClient } from '@supabase/supabase-js';
import OpenAI from 'openai';

// Enforce and export environment variables with strict type casting
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;

// Throw an error during build if client-side vars are missing
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('CRITICAL: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY are not set. Application cannot start.');
}

/**
 * Creates a Supabase client for client-side usage in Next.js 14 App Router.
 * This function ensures a singleton instance is used throughout the app.
 * @returns {SupabaseClient} A Supabase client instance.
 */
let supabaseClient: SupabaseClient | undefined;

export function createSupabaseClientComponent(): SupabaseClient {
  if (supabaseClient) {
    return supabaseClient;
  }
  supabaseClient = createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY);
  return supabaseClient;
}

// Legacy export for backward compatibility
export const createSupabaseClient = createSupabaseClientComponent;


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
    const apiKey = process.env.OPENAI_API_KEY;
    if (!apiKey) {
      throw new Error('CRITICAL: OPENAI_API_KEY is not set for server-side operations.');
    }
    _openai = new OpenAI({ apiKey });
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
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey) {
      throw new Error('CRITICAL: SUPABASE_SERVICE_ROLE_KEY is not set for admin operations.');
    }
    _supabaseAdmin = createClient(SUPABASE_URL, serviceKey, {
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


// Dummy exports for functions that might be expected by other files
// These should be implemented properly or removed if not needed
export const getEmbeddingModel = () => {
  console.warn("getEmbeddingModel is not implemented");
  return "text-embedding-ada-002";
};

export const getChatModel = () => {
  console.warn("getChatModel is not implemented");
  return "gpt-3.5-turbo";
};

export async function requireAdmin(headers: Headers): Promise<{ userId: string }> {
  console.warn("requireAdmin is a mock implementation");
  return { userId: "mock-admin-user-id" };
}

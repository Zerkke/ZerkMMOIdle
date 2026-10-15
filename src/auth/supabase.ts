// src/auth/supabase.ts
// Cliente Supabase (singleton). Le as credenciais do .env.local.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

if (!url || !key) {
  console.warn('[Zerk Auth] Supabase nao configurado. Verifica o .env.local');
}

export const supabase: SupabaseClient | null = (url && key)
  ? createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: false,
      },
    })
  : null;

export function isSupabaseConfigured(): boolean {
  return supabase !== null;
}
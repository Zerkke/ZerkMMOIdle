// src/auth/session.ts
// Funcoes de autenticacao: signUp, signIn, signOut, getUser.
// Todas devolvem resultados seguros (nunca lancam excecoes).

import type { User, Session } from '@supabase/supabase-js';
import { supabase } from './supabase';

export interface AuthResult {
  readonly ok: boolean;
  readonly message: string;
  readonly user?: User | undefined;
}

export async function signUp(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Supabase nao configurado.' };
  try {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) return { ok: false, message: error.message };
    const msg = data.session
      ? 'Conta criada e sessao iniciada.'
      : 'Conta criada. Verifica o email se necessario.';
    return { ok: true, message: msg, user: data.user ?? undefined };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
}

export async function signIn(email: string, password: string): Promise<AuthResult> {
  if (!supabase) return { ok: false, message: 'Supabase nao configurado.' };
  try {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { ok: false, message: error.message };
    return { ok: true, message: 'Login efetuado.', user: data.user ?? undefined };
  } catch (e) {
    return { ok: false, message: String(e) };
  }
}

export async function signOut(): Promise<void> {
  if (!supabase) return;
  await supabase.auth.signOut();
}

export async function getCurrentUser(): Promise<User | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getUser();
  return data.user ?? null;
}

export async function getSession(): Promise<Session | null> {
  if (!supabase) return null;
  const { data } = await supabase.auth.getSession();
  return data.session ?? null;
}

export function onAuthChange(cb: (user: User | null) => void): () => void {
  if (!supabase) return () => { /* no-op */ };
  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    cb(session?.user ?? null);
  });
  return () => data.subscription.unsubscribe();
}
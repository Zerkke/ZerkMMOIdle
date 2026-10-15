// src/auth/cloud-save.ts
// Guarda/carrega o save do jogador na tabela cloud_saves do Supabase.

import { supabase } from './supabase';
import type { GameServices } from '../services/game-services';

type Snapshot = ReturnType<GameServices['toSnapshot']>;

export async function loadCloudSave(userId: string): Promise<Snapshot | null> {
  if (!supabase) return null;
  try {
    const { data, error } = await supabase
      .from('cloud_saves')
      .select('save_data')
      .eq('user_id', userId)
      .maybeSingle();
    if (error) {
      console.warn('[Zerk Cloud] load falhou:', error.message);
      return null;
    }
    if (!data || !data.save_data) return null;
    return data.save_data as Snapshot;
  } catch (e) {
    console.error('[Zerk Cloud] load excecao:', e);
    return null;
  }
}

export async function saveCloudSave(userId: string, snapshot: Snapshot): Promise<boolean> {
  if (!supabase) return false;
  try {
    const { error } = await supabase
      .from('cloud_saves')
      .upsert({
        user_id: userId,
        save_data: snapshot,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    if (error) {
      console.warn('[Zerk Cloud] save falhou:', error.message);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[Zerk Cloud] save excecao:', e);
    return false;
  }
}
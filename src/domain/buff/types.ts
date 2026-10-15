import type { BuffId, ItemId } from '../ids';
import { BALANCE } from '../../data/balance.config';

export type BuffKind =
  | 'attack-power' | 'defense-power' | 'crit-chance'
  | 'gather-yield' | 'gather-speed' | 'craft-speed'
  | 'hp-regen' | 'resource-regen'
  | 'ap-bonus' | 'dp-bonus';

export interface BuffDefinition {
  readonly id: BuffId;
  readonly name: string;
  readonly description: string;
  readonly kind: BuffKind;
  readonly magnitude: number;
  readonly durationMs: number;
  readonly sourceItemId: ItemId | null;
}

export interface ActiveBuff {
  readonly buffId: BuffId;
  readonly kind: BuffKind;
  readonly magnitude: number;
  readonly appliedAt: number;
  readonly expiresAt: number;
}

export const MAX_ACTIVE_BUFFS = BALANCE.buffs.maxActiveBuffs;

export interface ApplyResult {
  readonly applied: boolean;
  readonly refreshed: boolean;
  readonly reason: string | null;
}
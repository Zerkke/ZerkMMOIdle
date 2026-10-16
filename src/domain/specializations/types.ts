import type { DerivedStats } from '../attributes';

export type SpecializationId =
  | 'berserker'
  | 'guardian'
  | 'arcanist'
  | 'bloodlord'
  | 'specialist';

export interface SpecializationModifiers {
  readonly apMultiplier?: number;
  readonly dpMultiplier?: number;
  readonly hpMultiplier?: number;
  readonly resourceMultiplier?: number;
  readonly attackMultiplier?: number;
  readonly defenseMultiplier?: number;
  readonly critChanceBonus?: number;
  readonly critDamageBonus?: number;
  readonly lifestealBonus?: number;
  readonly hpRegenBonus?: number;
  readonly damageReductionBonus?: number;
  readonly xpBonus?: number;
  readonly silverBonus?: number;
}

export interface SpecializationUnlockTalent {
  readonly talentId: string;
  readonly minRank: number;
}

export interface SpecializationUnlock {
  readonly characterLevel: number;
  readonly talents: readonly SpecializationUnlockTalent[];
}

export interface SpecializationDefinition {
  readonly id: SpecializationId;
  readonly name: string;
  readonly description: string;
  readonly lore: string;
  readonly icon: string;
  readonly accentColor: string;
  readonly unlock: SpecializationUnlock;
  readonly modifiers: SpecializationModifiers;
  readonly perkLabels: readonly string[];
  readonly drawbackLabels: readonly string[];
}

export interface SpecializationState {
  readonly active: SpecializationId | null;
  readonly changeCount: number;
  readonly lastChangeAt: number;
}

export interface SpecializationTreeDef {
  readonly order: readonly SpecializationId[];
  readonly specs: readonly SpecializationDefinition[];
}

export function emptySpecializationState(): SpecializationState {
  return { active: null, changeCount: 0, lastChangeAt: 0 };
}

export type { DerivedStats };
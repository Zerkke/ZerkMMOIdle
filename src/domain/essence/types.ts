import type { ItemId } from '../ids';
import type { EquipmentSlotId } from '../equipment';

export type EssenceKind =
  | 'power' | 'vitality' | 'guard'
  | 'precision' | 'blood' | 'fortune';

export type EssenceTier = 1 | 2 | 3;

export interface EssenceBonusBundle {
  readonly ap: number;
  readonly dp: number;
  readonly maxHp: number;
  readonly critChance: number;
  readonly lifesteal: number;
  readonly bonusSilver: number;
}

/** Uma essencia concreta. Level sempre >= 1. */
export interface EssenceInstance {
  readonly itemId: ItemId;
  readonly level: number;
}

export interface EssenceDefinition {
  readonly kind: EssenceKind;
  readonly tier: EssenceTier;
  readonly itemId: ItemId;
  readonly name: string;
  readonly description: string;
  readonly compatibleSlots: readonly EquipmentSlotId[] | 'any';
  readonly bonus: EssenceBonusBundle;
  readonly maxStackPerItem: number;
}

/** Material consumido num upgrade. */
export interface UpgradeCostMaterial {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export interface UpgradeCost {
  readonly silver: number;
  readonly materials: readonly UpgradeCostMaterial[];
}

/** Efeito desbloqueado a um nivel minimo. */
export interface EssenceUnlock {
  readonly level: number;
  readonly bonus: Partial<EssenceBonusBundle>;
  readonly description: string;
}

export interface EssenceEvolutionConfig {
  readonly maxLevel: number;
  readonly levelMultipliers: readonly number[];
  readonly upgradeCostsByLevel: readonly UpgradeCost[];
  readonly unlocks: readonly EssenceUnlock[];
}

export const EMPTY_ESSENCE_BONUS: EssenceBonusBundle = {
  ap: 0, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0,
};
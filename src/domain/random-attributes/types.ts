import type { EquipmentSlotId } from '../equipment';

export type RandomAttributeKind =
  | 'attack' | 'max-hp' | 'defense'
  | 'crit-chance' | 'crit-damage'
  | 'bonus-xp' | 'bonus-silver'
  | 'gather-yield';

export type RandomAttributeUnit = 'flat' | 'percent';

export interface RandomAttributeRoll {
  readonly kind: RandomAttributeKind;
  readonly value: number;
}

export interface RandomAttributeDefinition {
  readonly kind: RandomAttributeKind;
  readonly name: string;
  readonly description: string;
  readonly unit: RandomAttributeUnit;
  readonly minBase: number;
  readonly maxBase: number;
  readonly levelScale: number;
  readonly compatibleSlots: readonly EquipmentSlotId[] | 'any';
}

export interface RarityRollProfile {
  readonly minCount: number;
  readonly maxCount: number;
  readonly powerMultiplier: number;
}

export const RARITY_PROFILES: Readonly<Record<string, RarityRollProfile>> = {
  common:    { minCount: 0, maxCount: 1, powerMultiplier: 1.0 },
  uncommon:  { minCount: 1, maxCount: 2, powerMultiplier: 1.5 },
  rare:      { minCount: 2, maxCount: 3, powerMultiplier: 2.2 },
  epic:      { minCount: 3, maxCount: 4, powerMultiplier: 3.5 },
  legendary: { minCount: 4, maxCount: 5, powerMultiplier: 5.5 },
};

export interface RandomBonusBundle {
  readonly attack: number;
  readonly maxHp: number;
  readonly defense: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly bonusXp: number;
  readonly bonusSilver: number;
  readonly gatherYield: number;
}

export const EMPTY_BONUS_BUNDLE: RandomBonusBundle = {
  attack: 0, maxHp: 0, defense: 0,
  critChance: 0, critDamage: 0,
  bonusXp: 0, bonusSilver: 0, gatherYield: 0,
};
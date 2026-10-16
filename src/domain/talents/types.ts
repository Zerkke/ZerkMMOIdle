export type TalentBranch = 'offense' | 'defense' | 'utility' | 'sustain';

export type TalentEffect =
  | { readonly kind: 'ap'; readonly value: number }
  | { readonly kind: 'dp'; readonly value: number }
  | { readonly kind: 'max-hp'; readonly value: number }
  | { readonly kind: 'crit-chance'; readonly value: number }
  | { readonly kind: 'crit-damage'; readonly value: number }
  | { readonly kind: 'lifesteal'; readonly value: number }
  | { readonly kind: 'hp-regen'; readonly value: number }
  | { readonly kind: 'attack'; readonly value: number }
  | { readonly kind: 'defense'; readonly value: number }
  | { readonly kind: 'damage-reduction'; readonly value: number }
  | { readonly kind: 'gather-yield'; readonly value: number }
  | { readonly kind: 'xp-bonus'; readonly value: number }
  | { readonly kind: 'silver-bonus'; readonly value: number };

export interface TalentDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly branch: TalentBranch;
  readonly icon: string;
  readonly maxRank: number;
  readonly requiredCharacterLevel: number;
  readonly prerequisites: readonly string[];
  readonly costPerRank: readonly number[];
  readonly effect: TalentEffect;
}

export interface TalentState {
  readonly ranks: Readonly<Record<string, number>>;
  readonly respecCount: number;
}

export interface TalentTreeDef {
  readonly branchOrder: readonly TalentBranch[];
  readonly branchLabels: Readonly<Record<TalentBranch, string>>;
  readonly branchColors: Readonly<Record<TalentBranch, string>>;
  readonly talents: readonly TalentDefinition[];
}

export interface TalentBonusBundle {
  readonly ap: number;
  readonly dp: number;
  readonly maxHp: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly lifesteal: number;
  readonly hpRegen: number;
  readonly attack: number;
  readonly defense: number;
  readonly damageReduction: number;
  readonly gatherYield: number;
  readonly xpBonus: number;
  readonly silverBonus: number;
}

export const EMPTY_TALENT_BONUS: TalentBonusBundle = {
  ap: 0, dp: 0, maxHp: 0, critChance: 0, critDamage: 0,
  lifesteal: 0, hpRegen: 0, attack: 0, defense: 0,
  damageReduction: 0, gatherYield: 0, xpBonus: 0, silverBonus: 0,
};

export function emptyTalentState(): TalentState {
  return { ranks: {}, respecCount: 0 };
}
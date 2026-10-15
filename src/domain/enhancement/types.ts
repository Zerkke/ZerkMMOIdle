import type { ItemId } from '../ids';

export type EnhancementCategory = 'weapon' | 'armor' | 'accessory' | 'tool';

export type FailureOutcome =
  | { readonly kind: 'nothing' }
  | { readonly kind: 'downgrade'; readonly by: number }
  | { readonly kind: 'destroy' };

export interface CostEntry {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export interface EnhancementCost {
  readonly silver: number;
  readonly materials: readonly CostEntry[];
}

export interface EnhancementLevelConfig {
  readonly targetLevel: number;      // nivel alvo (ex: +5)
  readonly successChance: number;    // 0..1
  readonly cost: EnhancementCost;
  readonly failureOutcome: FailureOutcome;
}

export interface EnhancementRule {
  readonly category: EnhancementCategory;
  readonly maxLevel: number;
  readonly levels: readonly EnhancementLevelConfig[];
}

export interface EnhancementPreview {
  readonly itemId: ItemId;
  readonly currentLevel: number;
  readonly targetLevel: number;
  readonly maxLevel: number;
  readonly successChance: number;
  readonly cost: EnhancementCost;
  readonly failureOutcome: FailureOutcome;
  readonly canAfford: boolean;
  readonly missingSilver: number;
  readonly missingMaterials: readonly CostEntry[];
  readonly alreadyMax: boolean;
}

export interface EnhancementResult {
  readonly success: boolean;
  readonly destroyed: boolean;
  readonly previousLevel: number;
  readonly newLevel: number;
  readonly consumed: EnhancementCost;
  readonly usedProtection: boolean;
  readonly timestamp: number;
}

export interface EnhancementHistoryEntry {
  readonly itemId: ItemId;
  readonly previousLevel: number;
  readonly attemptedLevel: number;
  readonly success: boolean;
  readonly destroyed: boolean;
  readonly usedProtection: boolean;
  readonly timestamp: number;
}

export type Rng = () => number;

/** Multiplicador de custo aplicado por item (baseado em valor/raridade). */
export type CostMultiplier = number;
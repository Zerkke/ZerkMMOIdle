export type TutorialTrigger =
  | { readonly kind: 'kill-monster'; readonly monsterId: string | null; readonly count: number }
  | { readonly kind: 'gather-node'; readonly nodeId: string | null; readonly count: number }
  | { readonly kind: 'craft-recipe'; readonly recipeId: string; readonly count: number }
  | { readonly kind: 'equip-slot'; readonly slotId: string }
  | { readonly kind: 'enhance-level'; readonly minLevel: number }
  | { readonly kind: 'buy-item'; readonly itemId: string }
  | { readonly kind: 'plant-crop'; readonly count: number }
  | { readonly kind: 'harvest-crop'; readonly count: number }
  | { readonly kind: 'reach-level'; readonly level: number }
  | { readonly kind: 'enter-zone'; readonly zoneId: string };

export interface TutorialStep {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly trigger: TutorialTrigger;
  readonly rewardSilver: number;
  readonly rewardXp: number;
}

export interface TutorialProgressEntry {
  readonly stepId: string;
  readonly completed: boolean;
  readonly currentCount: number;
  readonly completedAt: number | null;
}

export interface TutorialState {
  readonly entries: readonly TutorialProgressEntry[];
  readonly rewardClaimed: readonly string[]; // ids ja recompensados
}
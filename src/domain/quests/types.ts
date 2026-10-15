import type { ItemId, QuestId } from '../ids';

export type QuestStatus = 'locked' | 'available' | 'active' | 'completed';

export type QuestObjectiveKind =
  | 'kill-monster' | 'gather-node' | 'craft-recipe'
  | 'reach-level' | 'reach-profession-level'
  | 'enter-zone' | 'equip-slot' | 'buy-item'
  | 'plant-crop' | 'harvest-crop' | 'enhance-level';

export interface QuestObjective {
  readonly id: string;
  readonly kind: QuestObjectiveKind;
  readonly targetId: string | null;
  readonly targetCount: number;
  readonly description: string;
}

export interface QuestRewardItem {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export interface QuestDefinition {
  readonly id: QuestId;
  readonly name: string;
  readonly description: string;
  readonly category: 'main' | 'side';
  readonly requiredLevel: number;
  readonly prerequisiteQuestId: QuestId | null;
  readonly objectives: readonly QuestObjective[];
  readonly rewardSilver: number;
  readonly rewardXp: number;
  readonly rewardItems: readonly QuestRewardItem[];
}

export interface QuestObjectiveProgress {
  readonly objectiveId: string;
  readonly currentCount: number;
}

export interface QuestState {
  readonly questId: QuestId;
  readonly status: QuestStatus;
  readonly progress: readonly QuestObjectiveProgress[];
  readonly startedAt: number | null;
  readonly completedAt: number | null;
  readonly rewardClaimed: boolean;
}

export interface QuestEvent {
  readonly kind: QuestObjectiveKind;
  readonly targetId: string | null;
  readonly amount: number;
}
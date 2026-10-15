import type { ItemId, NodeId, ProfessionId, RecipeId, ZoneId } from '../ids';
import type { ToolCategory } from '../content';

export type Rng = () => number;

export interface LootTableEntry {
  readonly itemId: ItemId;
  readonly chance: number;
  readonly minQuantity: number;
  readonly maxQuantity: number;
}

export type NodeKind = 'gathering' | 'fishing' | 'hunting' | 'crop';

export interface GatheringNode {
  readonly id: NodeId;
  readonly name: string;
  readonly description: string;
  readonly professionId: ProfessionId;
  readonly zoneId: ZoneId;
  readonly kind: NodeKind;
  readonly requiredTool: ToolCategory | null;
  readonly requiredLevel: number;
  readonly baseTimeMs: number;
  readonly baseExp: number;
  readonly loot: readonly LootTableEntry[];
}

export interface RecipeInput {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export interface RecipeOutput {
  readonly itemId: ItemId;
  readonly quantity: number;
  readonly chance: number;
}

export type RecipeKind = 'processing' | 'crafting' | 'cooking' | 'alchemy';

export interface Recipe {
  readonly id: RecipeId;
  readonly name: string;
  readonly description: string;
  readonly kind: RecipeKind;
  readonly professionId: ProfessionId;
  readonly requiredLevel: number;
  readonly inputs: readonly RecipeInput[];
  readonly outputs: readonly RecipeOutput[];
  readonly silverCost: number;
  readonly baseTimeMs: number;
  readonly baseExp: number;
  readonly maxBatches: number;
}

export interface ProfessionDefinition {
  readonly id: ProfessionId;
  readonly name: string;
  readonly description: string;
  readonly maxLevel: number;
  readonly masteryPerLevel: number;
}

export interface ProfessionState {
  readonly level: number;
  readonly experience: number;
  readonly mastery: number;
}

export function newProfessionState(): ProfessionState {
  return { level: 1, experience: 0, mastery: 0 };
}

export function experienceToNextProfessionLevel(level: number, maxLevel: number): number {
  if (level >= maxLevel) return Number.POSITIVE_INFINITY;
  return 50 + (level - 1) * 30;
}

export interface ActivityState {
  readonly kind: 'gathering' | 'production';
  readonly targetId: string;
  readonly startedAt: number;
  readonly endsAt: number;
  readonly batches: number;
  readonly cycleMs: number;
  readonly completedActions: number;
  readonly expectedActions: number;
}

export interface ToolSnapshot {
  readonly toolCategory: ToolCategory;
  readonly enhancementLevel: number;
  readonly durability: number;
  readonly maxDurability: number;
}

export interface ToolRequirement {
  readonly required: ToolCategory | null;
  readonly present: boolean;
  readonly matches: boolean;
  readonly durability: number | null;
}

export function evaluateToolRequirement(
  required: ToolCategory | null,
  equipped: ToolSnapshot | null,
): ToolRequirement {
  if (!required) return { required: null, present: true, matches: true, durability: null };
  if (!equipped) return { required, present: false, matches: false, durability: null };
  if (equipped.toolCategory !== required) {
    return { required, present: true, matches: false, durability: equipped.durability };
  }
  return { required, present: true, matches: true, durability: equipped.durability };
}
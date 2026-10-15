import type { ItemId } from '../ids';
import type { GatheringNode, LootTableEntry, Rng, ToolSnapshot } from './types';

export interface GatheringYield {
  readonly drops: readonly { itemId: ItemId; quantity: number }[];
  readonly expGained: number;
  readonly durabilityCost: number;
}

export function rollNodeLoot(
  loot: readonly LootTableEntry[],
  rng: Rng,
  yieldMultiplier: number,
): readonly { itemId: ItemId; quantity: number }[] {
  const drops: { itemId: ItemId; quantity: number }[] = [];
  for (const entry of loot) {
    const chance = Math.min(1, entry.chance * yieldMultiplier);
    if (rng() >= chance) continue;
    const span = entry.maxQuantity - entry.minQuantity + 1;
    const qty = entry.minQuantity + Math.floor(rng() * span);
    drops.push({ itemId: entry.itemId, quantity: qty });
  }
  return drops;
}

export function performGatherAction(args: {
  readonly node: GatheringNode;
  readonly tool: ToolSnapshot | null;
  readonly mastery: number;
  readonly professionLevel: number;
  readonly rng: Rng;
}): GatheringYield | null {
  const { node, tool, mastery, professionLevel, rng } = args;
  if (node.requiredTool !== null) {
    if (!tool) return null;
    if (tool.toolCategory !== node.requiredTool) return null;
    if (((tool.durability ?? 100) ?? 100) <= 0) return null;
  }
  const yieldMultiplier = 1 + mastery * 0.005;
  const drops = rollNodeLoot(node.loot, rng, yieldMultiplier);
  const levelBonus = 1 + Math.max(0, professionLevel - 1) * 0.02;
  const expGained = Math.max(1, Math.floor(node.baseExp * levelBonus));
  const durabilityCost = tool ? 1 : 0;
  return { drops, expGained, durabilityCost };
}

export function effectiveActionTimeMs(
  baseMs: number,
  mastery: number,
  tool: ToolSnapshot | null,
): number {
  const masteryReduction = Math.min(0.4, mastery * 0.001);
  const toolBonus = tool ? Math.min(0.2, tool.enhancementLevel * 0.02) : 0;
  const factor = 1 - masteryReduction - toolBonus;
  return Math.max(200, Math.floor(baseMs * factor));
}
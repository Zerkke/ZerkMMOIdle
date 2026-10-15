import type { SeededRng } from './rng';
import { MAX_SIM_ITERATIONS } from './types';

export interface GatheringIdleInput {
  readonly cycleMs: number;
  readonly expPerCycle: number;
  readonly loot: readonly {
    readonly itemId: string;
    readonly chance: number;
    readonly min: number;
    readonly max: number;
  }[];
  readonly toolDurability: number;
  readonly durabilityPerCycle: number;
  readonly inventoryFreeSlots: number;
}

export interface GatheringIdleOutcome {
  readonly actions: number;
  readonly xpGained: number;
  readonly loot: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly durabilitySpent: number;
  readonly stoppedReason: 'completed' | 'tool-broken' | 'inventory-full' | 'iteration-cap';
}

export function simulateGathering(input: GatheringIdleInput, elapsedMs: number, rng: SeededRng): GatheringIdleOutcome {
  if (input.cycleMs <= 0) {
    return { actions: 0, xpGained: 0, loot: [], durabilitySpent: 0, stoppedReason: 'completed' };
  }

  const maxActions = Math.floor(elapsedMs / input.cycleMs);
  const cap = Math.min(maxActions, MAX_SIM_ITERATIONS);
  const lootTotals = new Map<string, number>();
  let actions = 0;
  let durability = input.toolDurability;

  for (let i = 0; i < cap; i++) {
    if (input.durabilityPerCycle > 0) {
      if (durability < input.durabilityPerCycle) {
        return {
          actions, xpGained: actions * input.expPerCycle,
          loot: mapLoot(lootTotals), durabilitySpent: input.toolDurability - durability,
          stoppedReason: 'tool-broken',
        };
      }
      durability -= input.durabilityPerCycle;
    }

    for (const entry of input.loot) {
      if (rng.next() < entry.chance) {
        const span = entry.max - entry.min + 1;
        const qty = entry.min + Math.floor(rng.next() * span);
        lootTotals.set(entry.itemId, (lootTotals.get(entry.itemId) ?? 0) + qty);
      }
    }

    actions++;
  }

  // Inventario cheio: aproximacao (cada item ocupa 1 slot se for novo)
  const distinctItems = lootTotals.size;
  const stoppedReason = maxActions > cap ? 'iteration-cap'
    : distinctItems > input.inventoryFreeSlots ? 'inventory-full'
    : 'completed';

  return {
    actions,
    xpGained: actions * input.expPerCycle,
    loot: mapLoot(lootTotals),
    durabilitySpent: input.toolDurability - durability,
    stoppedReason,
  };
}

function mapLoot(m: Map<string, number>): { itemId: string; quantity: number }[] {
  const out: { itemId: string; quantity: number }[] = [];
  for (const [itemId, quantity] of m) out.push({ itemId, quantity });
  return out;
}
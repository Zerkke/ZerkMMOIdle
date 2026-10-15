import type { ItemId } from '../ids';
import type { LootEntry } from '../content';

export interface LootDrop {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export type Rng = () => number;

export function rollLoot(entries: readonly LootEntry[], rng: Rng): readonly LootDrop[] {
  const drops: LootDrop[] = [];
  for (const entry of entries) {
    if (rng() < entry.chance) {
      const span = entry.maxQuantity - entry.minQuantity + 1;
      const qty = entry.minQuantity + Math.floor(rng() * span);
      drops.push({ itemId: entry.itemId, quantity: qty });
    }
  }
  return drops;
}
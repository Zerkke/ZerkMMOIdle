import type { ItemId } from './ids';
import type { ItemStack } from './item-instance';
import { sameStack } from './item-instance';

export interface AddResult { readonly added: number; readonly leftover: number; }
export interface RemoveResult { readonly removed: number; readonly missing: number; }

export type InventoryOpError =
  | 'invalid-quantity' | 'slot-out-of-range' | 'slot-empty'
  | 'no-target-slot' | 'merge-not-possible';

export class Inventory {
  private readonly slots: (ItemStack | null)[];

  constructor(readonly capacity: number, initial: readonly (ItemStack | null)[] = []) {
    if (!Number.isInteger(capacity) || capacity <= 0) {
      throw new Error('Capacidade invalida.');
    }
    this.slots = new Array(capacity).fill(null);
    for (let i = 0; i < Math.min(capacity, initial.length); i++) {
      const entry = initial[i];
      this.slots[i] = entry ? { ...entry } : null;
    }
  }

  add(
    itemId: ItemId,
    quantity: number,
    maxStack: number,
    enhancementLevel = 0,
    durability: number | null = null,
    randomAttributes: readonly import('./random-attributes/types').RandomAttributeRoll[] | null = null,
    essences: readonly import('./essence/types').EssenceInstance[] | null = null,
    essenceLevel: number | null = null,
  ): AddResult {
    if (!Number.isInteger(quantity) || quantity <= 0) return { added: 0, leftover: quantity };
    if (!Number.isInteger(maxStack) || maxStack <= 0) return { added: 0, leftover: quantity };

    let remaining = quantity;
    const probe: ItemStack = { itemId, quantity, enhancementLevel, durability, randomAttributes, essences: essences as readonly (import('./essence/types').EssenceInstance | null)[] | null, essenceLevel };

    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      const slot = this.slots[i];
      if (slot && sameStack(slot, probe) && slot.quantity < maxStack) {
        const room = maxStack - slot.quantity;
        const toAdd = Math.min(room, remaining);
        this.slots[i] = { ...slot, quantity: slot.quantity + toAdd };
        remaining -= toAdd;
      }
    }
    for (let i = 0; i < this.slots.length && remaining > 0; i++) {
      if (this.slots[i] === null) {
        const toAdd = Math.min(maxStack, remaining);
        this.slots[i] = { itemId, quantity: toAdd, enhancementLevel, durability, randomAttributes, essences: essences as readonly (import('./essence/types').EssenceInstance | null)[] | null, essenceLevel };
        remaining -= toAdd;
      }
    }
    return { added: quantity - remaining, leftover: remaining };
  }

  remove(itemId: ItemId, quantity: number, enhancementLevel = 0): RemoveResult {
    if (!Number.isInteger(quantity) || quantity <= 0) return { removed: 0, missing: quantity };
    let toRemove = quantity;
    let removed = 0;
    for (let i = this.slots.length - 1; i >= 0 && toRemove > 0; i--) {
      const slot = this.slots[i];
      if (!slot || slot.itemId !== itemId || slot.enhancementLevel !== enhancementLevel) continue;
      const take = Math.min(slot.quantity, toRemove);
      const remaining = slot.quantity - take;
      this.slots[i] = remaining > 0 ? { ...slot, quantity: remaining } : null;
      toRemove -= take;
      removed += take;
    }
    return { removed, missing: toRemove };
  }

  removeAt(slotIndex: number): ItemStack | null {
    if (!this.inRange(slotIndex)) return null;
    const slot = this.slots[slotIndex];
    if (!slot) return null;
    this.slots[slotIndex] = null;
    return slot;
  }

  setAt(slotIndex: number, stack: ItemStack | null): void {
    if (!this.inRange(slotIndex)) return;
    this.slots[slotIndex] = stack ? { ...stack } : null;
  }

  split(slotIndex: number, quantity: number): InventoryOpError | null {
    if (!this.inRange(slotIndex)) return 'slot-out-of-range';
    const slot = this.slots[slotIndex];
    if (!slot) return 'slot-empty';
    if (!Number.isInteger(quantity) || quantity <= 0 || quantity >= slot.quantity) {
      return 'invalid-quantity';
    }
    const empty = this.slots.findIndex((s, i) => s === null && i !== slotIndex);
    if (empty < 0) return 'no-target-slot';
    this.slots[slotIndex] = { ...slot, quantity: slot.quantity - quantity };
    this.slots[empty] = { ...slot, quantity };
    return null;
  }

  move(fromIndex: number, toIndex: number): InventoryOpError | null {
    if (!this.inRange(fromIndex) || !this.inRange(toIndex)) return 'slot-out-of-range';
    if (fromIndex === toIndex) return null;
    const from = this.slots[fromIndex];
    if (!from) return 'slot-empty';
    const to = this.slots[toIndex];
    if (!to) {
      this.slots[toIndex] = from;
      this.slots[fromIndex] = null;
      return null;
    }
    if (sameStack(from, to)) {
      this.slots[toIndex] = { ...to, quantity: to.quantity + from.quantity };
      this.slots[fromIndex] = null;
      return null;
    }
    this.slots[fromIndex] = to;
    this.slots[toIndex] = from;
    return null;
  }

  count(itemId: ItemId, enhancementLevel?: number): number {
    let total = 0;
    for (const slot of this.slots) {
      if (!slot || slot.itemId !== itemId) continue;
      if (enhancementLevel !== undefined && slot.enhancementLevel !== enhancementLevel) continue;
      total += slot.quantity;
    }
    return total;
  }

  list(): readonly (ItemStack | null)[] { return this.slots.slice(); }
  usedSlots(): number { return this.slots.filter((s) => s !== null).length; }
  private inRange(index: number): boolean {
    return Number.isInteger(index) && index >= 0 && index < this.slots.length;
  }
}
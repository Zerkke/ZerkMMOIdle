import { describe, it, expect } from 'vitest';
import { sameStack, makeStack } from '../../src/domain/item-instance';
import { asItemId } from '../../src/domain/ids';
import { Inventory } from '../../src/domain/inventory';

const A = asItemId('item.a');

describe('ItemStack', () => {
  it('sameStack compara itemId e enhancementLevel', () => {
    expect(sameStack(makeStack(A, 1, 0), makeStack(A, 5, 0))).toBe(true);
    expect(sameStack(makeStack(A, 1, 0), makeStack(A, 1, 1))).toBe(false);
  });
});

describe('Inventory com enhancementLevel', () => {
  it('nao funde stacks com niveis diferentes', () => {
    const inv = new Inventory(5);
    inv.add(A, 3, 99, 0);
    inv.add(A, 3, 99, 1);
    expect(inv.usedSlots()).toBe(2);
    expect(inv.count(A, 0)).toBe(3);
    expect(inv.count(A, 1)).toBe(3);
  });

  it('funde stacks com mesmo nivel', () => {
    const inv = new Inventory(5);
    inv.add(A, 3, 99, 0);
    inv.add(A, 3, 99, 0);
    expect(inv.usedSlots()).toBe(1);
    expect(inv.count(A, 0)).toBe(6);
  });

  it('remove apenas stacks do nivel especificado', () => {
    const inv = new Inventory(5);
    inv.add(A, 3, 99, 0);
    inv.add(A, 3, 99, 1);
    const r = inv.remove(A, 2, 1);
    expect(r.removed).toBe(2);
    expect(inv.count(A, 1)).toBe(1);
    expect(inv.count(A, 0)).toBe(3);
  });
});
import { describe, it, expect } from 'vitest';
import { Inventory } from '../../src/domain/inventory';
import { asItemId } from '../../src/domain/ids';

const A = asItemId('item.a');
const B = asItemId('item.b');

describe('Inventory.add', () => {
  it('adiciona quantidade simples', () => {
    const inv = new Inventory(5);
    const r = inv.add(A, 10, 99);
    expect(r.added).toBe(10);
    expect(inv.count(A)).toBe(10);
  });

  it('empilha em multiplos slots quando excede maxStack', () => {
    const inv = new Inventory(5);
    inv.add(A, 250, 100);
    expect(inv.usedSlots()).toBe(3);
  });

  it('devolve leftover quando cheio', () => {
    const inv = new Inventory(2);
    const r = inv.add(A, 1000, 10);
    expect(r.added).toBe(20);
    expect(r.leftover).toBe(980);
  });

  it('rejeita quantidade invalida', () => {
    const inv = new Inventory(5);
    expect(inv.add(A, -1, 99).added).toBe(0);
    expect(inv.add(A, 0, 99).added).toBe(0);
    expect(inv.add(A, 1.5, 99).added).toBe(0);
  });

  it('nao funde com niveis diferentes', () => {
    const inv = new Inventory(5);
    inv.add(A, 3, 99, 0);
    inv.add(A, 3, 99, 1);
    expect(inv.usedSlots()).toBe(2);
  });
});

describe('Inventory.remove', () => {
  it('remove parcialmente', () => {
    const inv = new Inventory(5);
    inv.add(A, 10, 99);
    const r = inv.remove(A, 4);
    expect(r.removed).toBe(4);
    expect(inv.count(A)).toBe(6);
  });

  it('missing quando pedir mais', () => {
    const inv = new Inventory(5);
    inv.add(A, 3, 99);
    const r = inv.remove(A, 10);
    expect(r.removed).toBe(3);
    expect(r.missing).toBe(7);
  });
});

describe('Inventory.split', () => {
  it('divide slot valido', () => {
    const inv = new Inventory(5);
    inv.add(A, 10, 99);
    expect(inv.split(0, 4)).toBeNull();
    expect(inv.count(A)).toBe(10);
    expect(inv.usedSlots()).toBe(2);
  });

  it('rejeita quantidade invalida', () => {
    const inv = new Inventory(5);
    inv.add(A, 10, 99);
    expect(inv.split(0, 0)).toBe('invalid-quantity');
    expect(inv.split(0, 10)).toBe('invalid-quantity');
  });

  it('rejeita slot vazio', () => {
    const inv = new Inventory(5);
    expect(inv.split(0, 1)).toBe('slot-empty');
  });
});

describe('Inventory.move', () => {
  it('move para vazio', () => {
    const inv = new Inventory(5);
    inv.add(A, 5, 99);
    expect(inv.move(0, 2)).toBeNull();
    expect(inv.list()[2]?.itemId).toBe(A);
  });

  it('merge com mesmo item e nivel', () => {
    const inv = new Inventory(5);
    inv.add(A, 10, 99);
    inv.split(0, 3);
    expect(inv.move(1, 0)).toBeNull();
    expect(inv.list()[0]?.quantity).toBe(10);
  });

  it('swap quando itens diferentes', () => {
    const inv = new Inventory(5);
    inv.add(A, 3, 99);
    inv.add(B, 1, 99);
    expect(inv.move(0, 1)).toBeNull();
    expect(inv.list()[0]?.itemId).toBe(B);
  });
});

describe('Inventory.removeAt / setAt', () => {
  it('remove stack inteiro', () => {
    const inv = new Inventory(5);
    inv.add(A, 3, 99, 2);
    const stack = inv.removeAt(0);
    expect(stack?.enhancementLevel).toBe(2);
    expect(inv.usedSlots()).toBe(0);
  });

  it('setAt substitui', () => {
    const inv = new Inventory(5);
    inv.setAt(2, { itemId: A, quantity: 1, enhancementLevel: 5, durability: null, randomAttributes: null, essences: null, essenceLevel: null });
    expect(inv.list()[2]?.enhancementLevel).toBe(5);
  });

  it('preserva durability em add', () => {
    const inv = new Inventory(5);
    inv.add(A, 1, 1, 0, 50);
    expect(inv.list()[0]?.durability).toBe(50);
  });
});
import { describe, it, expect } from 'vitest';
import { Equipment } from '../../src/domain/equipment';
import { asItemId } from '../../src/domain/ids';
import { makeStack } from '../../src/domain/item-instance';

describe('Equipment', () => {
  it('equipa em slot vazio', () => {
    const e = new Equipment();
    expect(e.equip('weapon', makeStack(asItemId('item.sword'), 1, 0))).toBeNull();
    expect(e.get('weapon')?.itemId).toBe('item.sword');
  });

  it('preserva enhancementLevel', () => {
    const e = new Equipment();
    e.equip('weapon', makeStack(asItemId('item.sword'), 1, 7));
    expect(e.get('weapon')?.enhancementLevel).toBe(7);
  });

  it('rejeita slot ocupado', () => {
    const e = new Equipment();
    e.equip('weapon', makeStack(asItemId('item.sword'), 1, 0));
    expect(e.equip('weapon', makeStack(asItemId('item.bow'), 1, 0))).toBe('slot-occupied');
  });

  it('desequipa devolve stack', () => {
    const e = new Equipment();
    e.equip('weapon', makeStack(asItemId('item.sword'), 1, 3));
    const s = e.unequip('weapon');
    expect(s?.enhancementLevel).toBe(3);
    expect(e.get('weapon')).toBeUndefined();
  });
});
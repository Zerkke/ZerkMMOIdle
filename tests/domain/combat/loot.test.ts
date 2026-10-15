import { describe, it, expect } from 'vitest';
import { rollLoot } from '../../../src/domain/combat/loot';
import { asItemId } from '../../../src/domain/ids';
import type { LootEntry } from '../../../src/domain/content';

const ENTRY: LootEntry = {
  itemId: asItemId('item.x'),
  chance: 0.5,
  minQuantity: 1,
  maxQuantity: 3,
};

describe('rollLoot', () => {
  it('devolve vazio quando rng sempre alto (falha chance)', () => {
    const rng = () => 0.99;
    expect(rollLoot([ENTRY], rng)).toHaveLength(0);
  });

  it('devolve o item quando rng sempre baixo', () => {
    const rng = () => 0.01;
    const drops = rollLoot([ENTRY], rng);
    expect(drops).toHaveLength(1);
    expect(drops[0]?.itemId).toBe('item.x');
  });

  it('quantidade respeita intervalo [min, max]', () => {
    // rng: 0.01 (passa chance), 0.0 -> qty=1, 0.99 -> qty=3
    const rngSeq = [0.01, 0.0, 0.01, 0.99];
    let i = 0;
    const rng = () => rngSeq[i++] ?? 0;
    const d1 = rollLoot([ENTRY], rng);
    const d2 = rollLoot([ENTRY], rng);
    expect(d1[0]?.quantity).toBe(1);
    expect(d2[0]?.quantity).toBe(3);
  });

  it('nunca duplica o mesmo item se chance falhar', () => {
    const rng = () => 0.99;
    const drops = rollLoot([ENTRY, ENTRY, ENTRY], rng);
    expect(drops).toHaveLength(0);
  });
});
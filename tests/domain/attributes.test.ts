import { describe, it, expect } from 'vitest';
import { addAttributes, addPower, deriveStats, ZERO_ATTRIBUTES, ZERO_POWER } from '../../src/domain/attributes';

describe('attributes', () => {
  it('soma atributos', () => {
    const a = { strength: 1, agility: 2, intelligence: 3, vitality: 4 };
    const b = { strength: 10, agility: 20, intelligence: 30, vitality: 40 };
    expect(addAttributes(a, b)).toEqual({ strength: 11, agility: 22, intelligence: 33, vitality: 44 });
  });

  it('soma power', () => {
    expect(addPower({ attackPower: 5, defensePower: 3 }, { attackPower: 2, defensePower: 7 }))
      .toEqual({ attackPower: 7, defensePower: 10 });
  });

  it('deriva stats com zero', () => {
    const d = deriveStats(ZERO_ATTRIBUTES, ZERO_POWER);
    expect(d.maxHp).toBe(50);
    expect(d.attack).toBe(5);
    expect(d.ap).toBe(0);
    expect(d.dp).toBe(0);
  });

  it('deriva stats com atributos e AP/DP', () => {
    const attrs = { strength: 10, agility: 10, intelligence: 5, vitality: 10 };
    const power = { attackPower: 20, defensePower: 15 };
    const d = deriveStats(attrs, power);
    expect(d.maxHp).toBe(150);
    expect(d.maxResource).toBe(45);
    expect(d.ap).toBe(20 + 15);
    expect(d.dp).toBe(15 + 12);
    expect(d.criticalChance).toBeCloseTo(0.05);
  });
});
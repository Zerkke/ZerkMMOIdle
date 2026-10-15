import { describe, it, expect } from 'vitest';
import { computeDamage } from '../../../src/domain/combat/damage';

// rng = 1.0 nunca e < critChance (a menos que critChance > 1)
const noCrit = () => 1.0;
// rng = 0.0 e sempre < critChance se critChance > 0
const alwaysCrit = () => 0.0;

describe('computeDamage', () => {
  it('dano minimo 1 com defesa alta', () => {
    const r = computeDamage({ attack: 1, multiplier: 1, defense: 10000, critChance: 0, rng: noCrit });
    expect(r.damage).toBe(1);
    expect(r.crit).toBe(false);
  });

  it('aplica multiplicador', () => {
    const normal = computeDamage({ attack: 100, multiplier: 1, defense: 0, critChance: 0, rng: noCrit });
    const skill = computeDamage({ attack: 100, multiplier: 2, defense: 0, critChance: 0, rng: noCrit });
    expect(skill.damage).toBe(normal.damage * 2);
  });

  it('aplica critico 1.5x', () => {
    const normal = computeDamage({ attack: 100, multiplier: 1, defense: 0, critChance: 0, rng: noCrit });
    const crit = computeDamage({ attack: 100, multiplier: 1, defense: 0, critChance: 1, rng: alwaysCrit });
    expect(crit.crit).toBe(true);
    expect(crit.damage).toBe(Math.floor(normal.damage * 1.5));
  });

  it('mitigacao reduz dano mas nunca abaixo de 1', () => {
    const r = computeDamage({ attack: 100, multiplier: 1, defense: 100, critChance: 0, rng: noCrit });
    expect(r.damage).toBeGreaterThan(0);
    expect(r.damage).toBeLessThan(100);
  });
});
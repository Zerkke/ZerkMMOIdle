import { describe, it, expect } from 'vitest';
import { tickCombat, newCombatState } from '../../../src/domain/combat/engine';
import type { PlayerCombatInput, MonsterCombatInput, CombatConfig } from '../../../src/domain/combat/types';

const rng0 = () => 0.99;

function makePlayer(overrides: Partial<PlayerCombatInput> = {}): PlayerCombatInput {
  return {
    attack: 100,
    defense: 10,
    critChance: 0,
    critDamageMultiplier: 1.5,
    maxHp: 1000,
    maxResource: 100,
    resourceRegenPerSec: 0,
    attackIntervalMs: 1000,
    skills: [],
    ...overrides,
  };
}

function makeMonster(overrides: Partial<MonsterCombatInput> = {}): MonsterCombatInput {
  return {
    attack: 1,
    defense: 0,
    maxHp: 100000,
    attackIntervalMs: 100000,
    ...overrides,
  };
}

const config: CombatConfig = {
  autoMode: true, useSkills: false, strategy: 'aggressive', skillPriority: [],
};

describe('Lifesteal em combate', () => {
  it('sem lifesteal: HP nao sobe ao atacar', () => {
    const player = makePlayer({ attack: 50 });
    const monster = makeMonster();
    const state = newCombatState(0, player, monster);
    const result = tickCombat({
      state, deltaMs: 1100, player, monster, config, rng: rng0,
    });
    expect(result.state.playerHp).toBe(player.maxHp);
  });

  it('lifesteal 10%: HP sobe 10% do dano causado', () => {
    const player = makePlayer({ attack: 50, maxHp: 1000, lifesteal: 0.1 });
    const monster = makeMonster({ defense: 0 });
    const state = { ...newCombatState(0, player, monster), playerHp: 500 };
    const result = tickCombat({
      state, deltaMs: 1100, player, monster, config, rng: rng0,
    });
    // dano = 50; lifesteal = 5
    expect(result.state.playerHp).toBe(505);
  });

  it('lifesteal nunca excede maxHp', () => {
    const player = makePlayer({ attack: 1000, maxHp: 200, lifesteal: 0.5 });
    const monster = makeMonster({ defense: 0, maxHp: 100000 });
    const state = { ...newCombatState(0, player, monster), playerHp: 190 };
    const result = tickCombat({
      state, deltaMs: 1100, player, monster, config, rng: rng0,
    });
    expect(result.state.playerHp).toBeLessThanOrEqual(200);
  });

  it('lifesteal 3.7% (valor tipico de essencia)', () => {
    const player = makePlayer({ attack: 100, maxHp: 1000, lifesteal: 0.037 });
    const monster = makeMonster({ defense: 0 });
    const state = { ...newCombatState(0, player, monster), playerHp: 500 };
    const result = tickCombat({
      state, deltaMs: 1100, player, monster, config, rng: rng0,
    });
    // dano = 100; heal = floor(100 * 0.037) = 3
    expect(result.state.playerHp).toBe(503);
  });

  it('lifesteal soma com heal de skill', () => {
    // Sem skill -> apenas lifesteal
    const player = makePlayer({ attack: 50, maxHp: 1000, lifesteal: 0.2 });
    const monster = makeMonster();
    const state = { ...newCombatState(0, player, monster), playerHp: 500 };
    const result = tickCombat({
      state, deltaMs: 1100, player, monster, config, rng: rng0,
    });
    expect(result.state.playerHp).toBe(510);
  });
});
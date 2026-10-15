import { describe, it, expect } from 'vitest';
import { tickCombat, newCombatState } from '../../../src/domain/combat/engine';
import { DEFAULT_COMBAT_CONFIG } from '../../../src/domain/combat/types';
import type { PlayerCombatInput, MonsterCombatInput } from '../../../src/domain/combat/types';

const PLAYER: PlayerCombatInput = {
  attack: 100, defense: 5, critChance: 0, critDamageMultiplier: 1.5, maxHp: 200, maxResource: 50,
  resourceRegenPerSec: 0, attackIntervalMs: 500, skills: [],
};
const MONSTER: MonsterCombatInput = {
  attack: 3, defense: 0, maxHp: 30, attackIntervalMs: 2000,
};
const noCrit = () => 0.99;

describe('agregacao Idle do motor', () => {
  it('um unico tick grande produz o mesmo resultado que varios ticks pequenos', () => {
    const s0 = newCombatState(0, PLAYER, MONSTER);
    const big = tickCombat({
      state: s0, deltaMs: 5000, player: PLAYER, monster: MONSTER,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });

    let s = s0;
    for (let i = 0; i < 5; i++) {
      const r = tickCombat({
        state: s, deltaMs: 1000, player: PLAYER, monster: MONSTER,
        config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
      });
      s = r.state;
    }

    // Ambos devem terminar em vitoria (monstro com 30 HP e ataque 100 = 3 hits)
    expect(big.state.outcome).toBe('victory');
    expect(s.outcome).toBe('victory');
  });

  it('vitoria so dispara uma vez por monstro', () => {
    const s0 = newCombatState(0, PLAYER, MONSTER);
    const { events } = tickCombat({
      state: s0, deltaMs: 10000, player: PLAYER, monster: MONSTER,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });
    const victories = events.filter((e) => e.kind === 'victory');
    expect(victories).toHaveLength(1);
  });
});
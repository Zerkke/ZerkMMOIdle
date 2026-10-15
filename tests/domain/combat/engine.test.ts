import { describe, it, expect } from 'vitest';
import { newCombatState, tickCombat } from '../../../src/domain/combat/engine';
import { DEFAULT_COMBAT_CONFIG } from '../../../src/domain/combat/types';
import type { PlayerCombatInput, MonsterCombatInput } from '../../../src/domain/combat/types';

const PLAYER: PlayerCombatInput = {
  attack: 30,
  defense: 5,
  critChance: 0,
  critDamageMultiplier: 1.5,
  maxHp: 200,
  maxResource: 50,
  resourceRegenPerSec: 0,
  attackIntervalMs: 1000,
  skills: [],
};

const MONSTER: MonsterCombatInput = {
  attack: 5,
  defense: 0,
  maxHp: 40,
  attackIntervalMs: 2000,
};

const noCrit = () => 1.0;

describe('combat engine', () => {
  it('estado inicial tem monstro com HP max', () => {
    const s = newCombatState(0, PLAYER, MONSTER);
    expect(s.monsterHp).toBe(40);
    expect(s.playerHp).toBe(200);
    expect(s.outcome).toBe('ongoing');
  });

  it('avanca um round e aplica dano no monstro', () => {
    const s0 = newCombatState(0, PLAYER, MONSTER);
    const { state, events } = tickCombat({
      state: s0, deltaMs: 1000, player: PLAYER, monster: MONSTER,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });
    expect(state.monsterHp).toBeLessThan(40);
    expect(events.some((e) => e.kind === 'player-basic')).toBe(true);
  });

  it('vitoria quando monstro morre', () => {
    const s0 = newCombatState(0, PLAYER, MONSTER);
    const { state, events } = tickCombat({
      state: s0, deltaMs: 10000, player: PLAYER, monster: MONSTER,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });
    expect(state.outcome).toBe('victory');
    expect(state.monsterHp).toBe(0);
    expect(events.some((e) => e.kind === 'victory')).toBe(true);
  });

  it('derrota quando jogador morre', () => {
    const weakPlayer: PlayerCombatInput = { ...PLAYER, maxHp: 5, defense: 0 };
    const strongMonster: MonsterCombatInput = { ...MONSTER, attack: 100, maxHp: 9999 };
    const s0 = newCombatState(0, weakPlayer, strongMonster);
    const { state, events } = tickCombat({
      state: s0, deltaMs: 10000, player: weakPlayer, monster: strongMonster,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });
    expect(state.outcome).toBe('defeat');
    expect(state.playerHp).toBe(0);
    expect(events.some((e) => e.kind === 'defeat')).toBe(true);
  });

  it('HP nunca fica negativo', () => {
    // Jogador com ataque baixo para NAO matar o monstro antes deste atacar.
    // Monstro com HP enorme para sobreviver varios turnos.
    const weakPlayer: PlayerCombatInput = { ...PLAYER, attack: 1, maxHp: 10, defense: 0 };
    const strongMonster: MonsterCombatInput = { ...MONSTER, attack: 9999, maxHp: 99999 };
    const s0 = newCombatState(0, weakPlayer, strongMonster);

    const { state } = tickCombat({
      state: s0, deltaMs: 3000, player: weakPlayer, monster: strongMonster,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });

    expect(state.playerHp).toBe(0);
    expect(state.playerHp).toBeGreaterThanOrEqual(0);
  });

  it('HP do monstro nunca fica negativo', () => {
    const strongPlayer: PlayerCombatInput = { ...PLAYER, attack: 9999 };
    const s0 = newCombatState(0, strongPlayer, MONSTER);
    const { state } = tickCombat({
      state: s0, deltaMs: 1000, player: strongPlayer, monster: MONSTER,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });
    expect(state.monsterHp).toBe(0);
    expect(state.outcome).toBe('victory');
  });

  it('nao avanca se outcome nao for ongoing', () => {
    const s0 = { ...newCombatState(0, PLAYER, MONSTER), outcome: 'victory' as const };
    const { state, events } = tickCombat({
      state: s0, deltaMs: 1000, player: PLAYER, monster: MONSTER,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });
    expect(state).toBe(s0);
    expect(events).toHaveLength(0);
  });

  it('ignora deltaMs <= 0', () => {
    const s0 = newCombatState(0, PLAYER, MONSTER);
    const { events } = tickCombat({
      state: s0, deltaMs: 0, player: PLAYER, monster: MONSTER,
      config: DEFAULT_COMBAT_CONFIG, rng: noCrit,
    });
    expect(events).toHaveLength(0);
  });
});
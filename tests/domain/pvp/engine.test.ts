import { describe, it, expect } from 'vitest';
import { applyElo, expectedScore, canChallenge, applyDailyReset } from '../../../src/domain/pvp/elo';
import { simulateDuel, makeDeterministicRng, validateSnapshot } from '../../../src/domain/pvp/engine';
import type { PvpSnapshot } from '../../../src/domain/pvp/types';
import { PVP_SNAPSHOT_VERSION, DEFAULT_PVP_CONFIG } from '../../../src/domain/pvp/types';

function makeSnap(name: string, lvl: number, hp: number, atk: number, def: number): PvpSnapshot {
  return {
    version: PVP_SNAPSHOT_VERSION,
    characterName: name, characterLevel: lvl, specId: null,
    maxHp: hp, maxResource: 100, attack: atk, defense: def,
    ap: atk, dp: def, critChance: 0, critDamage: 0, lifesteal: 0,
    damageReduction: 0, hpRegenPerSec: 0, attackIntervalMs: 1000,
    resourceRegenPerSec: 3, skills: [],
  };
}

describe('pvp elo', () => {
  it('expectedScore igual em ratings iguais = 0.5', () => {
    expect(expectedScore(1000, 1000)).toBeCloseTo(0.5);
  });
  it('expectedScore maior para rating mais alto', () => {
    expect(expectedScore(1400, 1000)).toBeGreaterThan(0.5);
  });
  it('applyElo vitoria ganha pontos', () => {
    const r = applyElo(1000, 1000, true, 32);
    expect(r.deltaA).toBe(16);
    expect(r.newA).toBe(1016);
    expect(r.deltaB).toBe(-16);
  });
  it('applyElo derrota perde pontos', () => {
    const r = applyElo(1000, 1000, false, 32);
    expect(r.deltaA).toBe(-16);
  });
  it('canChallenge ok se diff <= range', () => {
    expect(canChallenge(1000, 1400, DEFAULT_PVP_CONFIG).ok).toBe(true);
    expect(canChallenge(1000, 1600, DEFAULT_PVP_CONFIG).reason).toBe('out-of-range');
  });
  it('applyDailyReset limpa apos 24h', () => {
    const r = applyDailyReset({ dailyAttacksUsed: 5, dailyResetAt: 1000 }, 1000 + 25 * 60 * 60 * 1000, DEFAULT_PVP_CONFIG);
    expect(r.dailyAttacksUsed).toBe(0);
  });
});

describe('pvp simulateDuel', () => {
  it('determinismo: mesma seed = mesmo resultado', () => {
    const a = makeSnap('A', 10, 1000, 50, 10);
    const b = makeSnap('B', 10, 1000, 50, 10);
    const r1 = simulateDuel(a, b, makeDeterministicRng(a, b, 42), 0);
    const r2 = simulateDuel(a, b, makeDeterministicRng(a, b, 42), 0);
    expect(r1.outcome).toBe(r2.outcome);
    expect(r1.playerHp).toBe(r2.playerHp);
    expect(r1.monsterHp).toBe(r2.monsterHp);
  });
  it('atacante forte ganha sempre', () => {
    const fortes = makeSnap('A', 50, 10000, 500, 200);
    const fraco = makeSnap('B', 10, 500, 10, 0);
    const r = simulateDuel(fortes, fraco, makeDeterministicRng(fortes, fraco, 1), 0);
    expect(r.outcome).toBe('victory');
  });
  it('atacante fraco perde', () => {
    const fraco = makeSnap('A', 5, 200, 5, 0);
    const forte = makeSnap('B', 50, 50000, 500, 300);
    const r = simulateDuel(fraco, forte, makeDeterministicRng(fraco, forte, 1), 0);
    expect(r.outcome).toBe('defeat');
  });
  it('validateSnapshot aceita snapshot valido', () => {
    expect(validateSnapshot(makeSnap('A', 10, 1000, 50, 10))).toBe(true);
  });
  it('validateSnapshot rejeita invalido', () => {
    expect(validateSnapshot(null)).toBe(false);
    expect(validateSnapshot({})).toBe(false);
  });
});
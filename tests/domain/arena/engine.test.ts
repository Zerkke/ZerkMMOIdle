import { describe, it, expect } from 'vitest';
import {
  applyFight, applyReset, canFight, getOpponent, tierForRating, validateArenaConfig,
} from '../../../src/domain/arena/engine';
import type { ArenaOpponentDef, ArenaState } from '../../../src/domain/arena/types';
import { DEFAULT_ARENA_CONFIG, emptyArenaState } from '../../../src/domain/arena/types';
import { ARENA_OPPONENTS } from '../../../src/data/arena.data';

const OPP: ArenaOpponentDef = {
  id: 'o.test', name: 'T', description: '',
  icon: 'sword', accentColor: '#e8a848',
  tier: 'bronze', rating: 1000, level: 10,
  stats: { maxHp: 100, attack: 10, defense: 1, ap: 10, dp: 5, critChance: 0, critDamage: 0, lifesteal: 0, damageReduction: 0, attackIntervalMs: 1000 },
  entryCost: 100,
  rewards: { silver: 500, xp: 200, ratingWin: 25, ratingLoss: 10 },
};

describe('arena engine', () => {
  it('tierForRating devolve tiers corretos', () => {
    expect(tierForRating(500)).toBe('bronze');
    expect(tierForRating(1000)).toBe('silver');
    expect(tierForRating(1400)).toBe('gold');
    expect(tierForRating(1800)).toBe('platinum');
    expect(tierForRating(2400)).toBe('diamond');
  });

  it('canFight passa em estado limpo', () => {
    const s = emptyArenaState();
    const r = canFight(s, OPP, 1000, 1000, DEFAULT_ARENA_CONFIG);
    expect(r.ok).toBe(true);
  });

  it('canFight falha sem prata', () => {
    const s = emptyArenaState();
    const r = canFight(s, OPP, 10, 1000, DEFAULT_ARENA_CONFIG);
    expect(r.reason).toBe('not-enough-silver');
  });

  it('canFight falha fora do range de rating', () => {
    const s = { ...emptyArenaState(), rating: 200 };
    const r = canFight(s, { ...OPP, rating: 2000 }, 10000, 1000, DEFAULT_ARENA_CONFIG);
    expect(r.reason).toBe('out-of-range');
  });

  it('canFight falha apos limite diario', () => {
    const s = { ...emptyArenaState(), fightsToday: 5, lastResetAt: 1000 };
    const r = canFight(s, OPP, 10000, 2000, DEFAULT_ARENA_CONFIG);
    expect(r.reason).toBe('daily-limit');
  });

  it('applyReset limpa contador apos 24h', () => {
    const s = { ...emptyArenaState(), fightsToday: 5, lastResetAt: 1000 };
    const after = applyReset(s, 1000 + 25 * 60 * 60 * 1000, DEFAULT_ARENA_CONFIG);
    expect(after.fightsToday).toBe(0);
  });

  it('applyFight vitoria: ganha rating, silver, xp', () => {
    const s = emptyArenaState();
    const r = applyFight({ state: s, opponent: OPP, won: true, nowMs: 5000, config: DEFAULT_ARENA_CONFIG });
    expect(r.rewards.ratingDelta).toBe(25);
    expect(r.rewards.ratingAfter).toBe(1025);
    expect(r.rewards.silver).toBe(500);
    expect(r.rewards.xp).toBe(200);
    expect(r.state.totalWins).toBe(1);
  });

  it('applyFight derrota: perde rating, sem recompensa', () => {
    const s = emptyArenaState();
    const r = applyFight({ state: s, opponent: OPP, won: false, nowMs: 5000, config: DEFAULT_ARENA_CONFIG });
    expect(r.rewards.ratingDelta).toBe(-10);
    expect(r.rewards.ratingAfter).toBe(990);
    expect(r.rewards.silver).toBe(0);
    expect(r.state.totalLosses).toBe(1);
  });

  it('applyFight rating nunca fica negativo', () => {
    const s = { ...emptyArenaState(), rating: 5 };
    const r = applyFight({ state: s, opponent: OPP, won: false, nowMs: 5000, config: DEFAULT_ARENA_CONFIG });
    expect(r.state.rating).toBeGreaterThanOrEqual(0);
  });

  it('applyFight guarda historico limitado a 20', () => {
    let state: ArenaState = emptyArenaState();
    for (let i = 0; i < 30; i++) {
      state = applyFight({ state, opponent: OPP, won: true, nowMs: i * 1000, config: DEFAULT_ARENA_CONFIG }).state;
    }
    expect(state.history).toHaveLength(20);
  });

  it('getOpponent encontra por id', () => {
    expect(getOpponent(ARENA_OPPONENTS, 'arena.aprendiz-ferro')?.name).toBe('Aprendiz de Ferro');
    expect(getOpponent(ARENA_OPPONENTS, 'nope')).toBeUndefined();
  });

  it('validateArenaConfig: dados reais sao validos', () => {
    expect(validateArenaConfig(ARENA_OPPONENTS)).toHaveLength(0);
  });

  it('ARENA_OPPONENTS tem 5 adversarios em tiers distintos', () => {
    expect(ARENA_OPPONENTS).toHaveLength(5);
    const tiers = new Set(ARENA_OPPONENTS.map((o) => o.tier));
    expect(tiers.size).toBe(5);
  });
});
import { describe, it, expect } from 'vitest';
import {
  computeSeasonReward, getPreviousSeasonId, getSeasonInfo, isValidSeasonId,
  markCurrentUser, seasonForTimestamp, sortRankings, tierForRating,
} from '../../../src/domain/rankings/engine';
import { DEFAULT_RANKINGS_CONFIG } from '../../../src/domain/rankings/types';
import { SEASON_REWARD_TABLE } from '../../../src/data/rankings.data';

const ANCHOR = DEFAULT_RANKINGS_CONFIG.seasonAnchorMs;
const MS_DAY = 24 * 60 * 60 * 1000;
const MS_30D = 30 * MS_DAY;

describe('rankings season', () => {
  it('no anchor -> S1', () => {
    const r = seasonForTimestamp(ANCHOR, DEFAULT_RANKINGS_CONFIG);
    expect(r.id).toBe('S1');
    expect(r.number).toBe(1);
  });
  it('30 dias depois -> S2', () => {
    const r = seasonForTimestamp(ANCHOR + MS_30D, DEFAULT_RANKINGS_CONFIG);
    expect(r.id).toBe('S2');
  });
  it('getSeasonInfo calcula daysRemaining', () => {
    const info = getSeasonInfo(ANCHOR + 15 * MS_DAY, DEFAULT_RANKINGS_CONFIG);
    expect(info.id).toBe('S1');
    expect(info.daysRemaining).toBe(15);
    expect(info.isCurrent).toBe(true);
  });
  it('getPreviousSeasonId', () => {
    expect(getPreviousSeasonId('S5')).toBe('S4');
    expect(getPreviousSeasonId('S1')).toBe('S1');
  });
});

describe('tiers', () => {
  it('thresholds corretos', () => {
    expect(tierForRating(500)).toBe('bronze');
    expect(tierForRating(1000)).toBe('silver');
    expect(tierForRating(1400)).toBe('gold');
    expect(tierForRating(1800)).toBe('platinum');
    expect(tierForRating(2200)).toBe('diamond');
  });
});

describe('sortRankings', () => {
  it('ordena por rating desc', () => {
    const entries = [
      { userId: 'a', characterName: 'A', characterLevel: 10, rating: 1000, peakRating: 1000, wins: 5, losses: 3, updatedAt: 1000 },
      { userId: 'b', characterName: 'B', characterLevel: 10, rating: 1500, peakRating: 1500, wins: 10, losses: 2, updatedAt: 2000 },
    ];
    const sorted = sortRankings(entries);
    expect(sorted[0]?.userId).toBe('b');
    expect(sorted[0]?.rank).toBe(1);
    expect(sorted[1]?.rank).toBe(2);
  });
  it('desempate por wins', () => {
    const entries = [
      { userId: 'a', characterName: 'A', characterLevel: 10, rating: 1000, peakRating: 1000, wins: 5, losses: 3, updatedAt: 1000 },
      { userId: 'b', characterName: 'B', characterLevel: 10, rating: 1000, peakRating: 1000, wins: 10, losses: 3, updatedAt: 2000 },
    ];
    const sorted = sortRankings(entries);
    expect(sorted[0]?.userId).toBe('b');
  });
  it('desempate por losses asc', () => {
    const entries = [
      { userId: 'a', characterName: 'A', characterLevel: 10, rating: 1000, peakRating: 1000, wins: 5, losses: 5, updatedAt: 1000 },
      { userId: 'b', characterName: 'B', characterLevel: 10, rating: 1000, peakRating: 1000, wins: 5, losses: 2, updatedAt: 2000 },
    ];
    const sorted = sortRankings(entries);
    expect(sorted[0]?.userId).toBe('b');
  });
  it('tier atribuido', () => {
    const sorted = sortRankings([
      { userId: 'a', characterName: 'A', characterLevel: 10, rating: 2200, peakRating: 2200, wins: 0, losses: 0, updatedAt: 0 },
    ]);
    expect(sorted[0]?.tier).toBe('diamond');
  });
});

describe('markCurrentUser', () => {
  it('marca so o user certo', () => {
    const entries = sortRankings([
      { userId: 'a', characterName: 'A', characterLevel: 10, rating: 1000, peakRating: 1000, wins: 0, losses: 0, updatedAt: 0 },
      { userId: 'b', characterName: 'B', characterLevel: 10, rating: 900, peakRating: 900, wins: 0, losses: 0, updatedAt: 0 },
    ]);
    const marked = markCurrentUser(entries, 'b');
    expect(marked[0]?.isCurrentUser).toBe(false);
    expect(marked[1]?.isCurrentUser).toBe(true);
  });
});

describe('computeSeasonReward', () => {
  it('rank 1 ganha bonus maximo', () => {
    const r = computeSeasonReward({ finalTier: 'diamond', finalRank: 1, seasonNumber: 1 }, SEASON_REWARD_TABLE);
    expect(r.label).toBe('Campeao da Temporada');
    expect(r.silver).toBeGreaterThan(250000);
  });
  it('rank 10 ganha bonus top10', () => {
    const r = computeSeasonReward({ finalTier: 'gold', finalRank: 10, seasonNumber: 1 }, SEASON_REWARD_TABLE);
    expect(r.label).toBe('Top 10 da Temporada');
  });
  it('rank 100 so tier base', () => {
    const r = computeSeasonReward({ finalTier: 'silver', finalRank: 100, seasonNumber: 1 }, SEASON_REWARD_TABLE);
    expect(r.label).toContain('Prata');
    expect(r.silver).toBe(2500);
  });
});

describe('isValidSeasonId', () => {
  it('aceita formato S1..Sn', () => {
    expect(isValidSeasonId('S1')).toBe(true);
    expect(isValidSeasonId('S42')).toBe(true);
    expect(isValidSeasonId('foo')).toBe(false);
  });
});
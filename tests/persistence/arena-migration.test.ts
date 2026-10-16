import { describe, it, expect } from 'vitest';
import { migrateToLatest } from '../../src/persistence/save-migrations';
import { emptySave } from '../../src/persistence/save-schema';

describe('arena migration v15 -> v16', () => {
  it('v16 vazio tem rating 1000', () => {
    const s = migrateToLatest(emptySave(0));
    expect(s.schemaVersion).toBe(17);
    expect(s.arena.rating).toBe(1000);
    expect(s.arena.history).toEqual([]);
  });
  it('v15 sem arena ganha bloco default', () => {
    const v15 = { ...emptySave(0), schemaVersion: 15 } as Record<string, unknown>;
    delete v15['arena'];
    const s = migrateToLatest(v15);
    expect(s.arena.rating).toBe(1000);
  });
  it('preserva arena valida', () => {
    const v15 = {
      ...emptySave(0),
      schemaVersion: 15,
      arena: {
        rating: 1500, peakRating: 1700, fightsToday: 2, lastResetAt: 1000,
        totalWins: 8, totalLosses: 3,
        history: [{ foughtAt: 500, opponentId: 'x', opponentName: 'X', won: true, ratingBefore: 1400, ratingAfter: 1500, silverGained: 1000, xpGained: 400 }],
      },
    };
    const s = migrateToLatest(v15);
    expect(s.arena.rating).toBe(1500);
    expect(s.arena.history).toHaveLength(1);
  });
  it('descarta valores invalidos', () => {
    const v15 = {
      ...emptySave(0),
      schemaVersion: 15,
      arena: {
        rating: -100, peakRating: NaN, fightsToday: -5,
        lastResetAt: NaN, totalWins: -1, totalLosses: -1,
        history: 'invalid',
      },
    };
    const s = migrateToLatest(v15);
    expect(s.arena.rating).toBe(1000);
    expect(s.arena.history).toEqual([]);
  });
});
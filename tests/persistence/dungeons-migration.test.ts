import { describe, it, expect } from 'vitest';
import { migrateToLatest } from '../../src/persistence/save-migrations';
import { emptySave } from '../../src/persistence/save-schema';

describe('dungeons migration v14 -> v15', () => {
  it('v15 vazio tem dungeons com active null', () => {
    const s = migrateToLatest(emptySave(0));
    expect(s.schemaVersion).toBe(15);
    expect(s.dungeons.active).toBeNull();
    expect(s.dungeons.results).toEqual({});
  });
  it('v14 sem dungeons ganha bloco vazio', () => {
    const v14 = { ...emptySave(0), schemaVersion: 14 } as Record<string, unknown>;
    delete v14['dungeons'];
    const s = migrateToLatest(v14);
    expect(s.schemaVersion).toBe(15);
    expect(s.dungeons.active).toBeNull();
  });
  it('preserva results validos', () => {
    const v14 = {
      ...emptySave(0),
      schemaVersion: 14,
      dungeons: {
        active: null,
        results: {
          'dungeon.slime-nest': { dungeonId: 'dungeon.slime-nest', completions: 3, bestTimeMs: 45000, firstClearedAt: 100, lastClearedAt: 500 },
        },
      },
    };
    const s = migrateToLatest(v14);
    expect(s.dungeons.results['dungeon.slime-nest']?.completions).toBe(3);
    expect(s.dungeons.results['dungeon.slime-nest']?.bestTimeMs).toBe(45000);
  });
  it('descarta valores invalidos', () => {
    const v14 = {
      ...emptySave(0),
      schemaVersion: 14,
      dungeons: {
        active: { dungeonId: 123, waveIndex: -1, monsterIndex: NaN, startedAt: NaN, totalKills: -5 },
        results: { x: { completions: -1, bestTimeMs: NaN } },
      },
    };
    const s = migrateToLatest(v14);
    expect(s.dungeons.active).toBeNull();
    expect(s.dungeons.results['x']?.completions).toBe(0);
    expect(s.dungeons.results['x']?.bestTimeMs).toBeNull();
  });
});
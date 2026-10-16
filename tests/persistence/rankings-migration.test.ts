import { describe, it, expect } from 'vitest';
import { migrateToLatest } from '../../src/persistence/save-migrations';
import { emptySave } from '../../src/persistence/save-schema';

describe('rankings migration v17 -> v18', () => {
  it('v18 vazio tem rankings default', () => {
    const s = migrateToLatest(emptySave(0));
    expect(s.schemaVersion).toBe(18);
    expect(s.rankings.lastSeenSeasonId).toBeNull();
    expect(s.rankings.pendingSeasonReward).toBeNull();
  });
  it('v17 sem rankings ganha bloco default', () => {
    const v17 = { ...emptySave(0), schemaVersion: 17 } as Record<string, unknown>;
    delete v17['rankings'];
    const s = migrateToLatest(v17);
    expect(s.rankings.lastSeenSeasonId).toBeNull();
  });
});
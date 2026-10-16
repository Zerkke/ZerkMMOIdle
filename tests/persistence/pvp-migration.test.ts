import { describe, it, expect } from 'vitest';
import { migrateToLatest } from '../../src/persistence/save-migrations';
import { emptySave } from '../../src/persistence/save-schema';

describe('pvp migration v16 -> v17', () => {
  it('v17 vazio tem pvp default', () => {
    const s = migrateToLatest(emptySave(0));
    expect(s.schemaVersion).toBe(18);
    expect(s.pvp.registeredBuild).toBeNull();
    expect(s.pvp.localRating).toBe(1000);
  });
  it('v16 sem pvp ganha bloco default', () => {
    const v16 = { ...emptySave(0), schemaVersion: 16 } as Record<string, unknown>;
    delete v16['pvp'];
    const s = migrateToLatest(v16);
    expect(s.pvp.localRating).toBe(1000);
  });
});
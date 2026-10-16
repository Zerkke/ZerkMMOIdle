import { describe, it, expect } from 'vitest';
import { migrateToLatest } from '../../src/persistence/save-migrations';
import { emptySave } from '../../src/persistence/save-schema';

describe('specialization migration v13 -> v14', () => {
  it('v14 vazio tem specialization null', () => {
    const s = migrateToLatest(emptySave(0));
    expect(s.schemaVersion).toBe(15);
    expect(s.specialization.active).toBeNull();
  });

  it('v13 sem specialization ganha bloco vazio', () => {
    const v13 = { ...emptySave(0), schemaVersion: 13 } as Record<string, unknown>;
    delete v13['specialization'];
    const s = migrateToLatest(v13);
    expect(s.schemaVersion).toBe(15);
    expect(s.specialization.active).toBeNull();
  });

  it('preserva spec ativa valida de v13', () => {
    const v13 = {
      ...emptySave(0),
      schemaVersion: 13,
      specialization: { active: 'berserker', changeCount: 3, lastChangeAt: 12345 },
    };
    const s = migrateToLatest(v13);
    expect(s.specialization.active).toBe('berserker');
    expect(s.specialization.changeCount).toBe(3);
  });

  it('descarta active invalido', () => {
    const v13 = {
      ...emptySave(0),
      schemaVersion: 13,
      specialization: { active: 123, changeCount: -1, lastChangeAt: NaN },
    };
    const s = migrateToLatest(v13);
    expect(s.specialization.active).toBeNull();
    expect(s.specialization.changeCount).toBe(0);
    expect(s.specialization.lastChangeAt).toBe(0);
  });
});
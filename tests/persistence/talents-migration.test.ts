import { describe, it, expect } from 'vitest';
import { migrateToLatest } from '../../src/persistence/save-migrations';
import { emptySave } from '../../src/persistence/save-schema';

describe('talents migration v12 -> v13', () => {
  it('v13 vazio tem talents com ranks vazios', () => {
    const s = migrateToLatest(emptySave(0));
    expect(s.schemaVersion).toBe(18);
    expect(s.talents.ranks).toEqual({});
    expect(s.talents.respecCount).toBe(0);
  });

  it('v12 sem talents ganha bloco vazio', () => {
    const v12 = {
      ...emptySave(0),
      schemaVersion: 12,
    } as Record<string, unknown>;
    delete v12['talents'];
    const s = migrateToLatest(v12);
    expect(s.schemaVersion).toBe(18);
    expect(s.talents.ranks).toEqual({});
  });

  it('preserva ranks validos de v12', () => {
    const v12 = {
      ...emptySave(0),
      schemaVersion: 12,
      talents: { ranks: { 'talent.ferrumancer.ferocity': 3 }, respecCount: 1 },
    };
    const s = migrateToLatest(v12);
    expect(s.talents.ranks['talent.ferrumancer.ferocity']).toBe(3);
    expect(s.talents.respecCount).toBe(1);
  });

  it('descarta valores invalidos em v12', () => {
    const v12 = {
      ...emptySave(0),
      schemaVersion: 12,
      talents: { ranks: { 'a': -1, 'b': NaN, 'c': 2.9, 'd': 'x' }, respecCount: -5 },
    };
    const s = migrateToLatest(v12);
    expect(s.talents.ranks['a']).toBeUndefined();
    expect(s.talents.ranks['b']).toBeUndefined();
    expect(s.talents.ranks['c']).toBe(2);
    expect(s.talents.ranks['d']).toBeUndefined();
    expect(s.talents.respecCount).toBe(0);
  });
});
import { describe, it, expect } from 'vitest';
import { migrateToLatest, SaveParseError } from '../../src/persistence/save-migrations';
import { emptySave } from '../../src/persistence/save-schema';

describe('migrateToLatest', () => {
  it('aceita save v12 valido', () => {
    expect(migrateToLatest(emptySave(Date.now()))).toBeDefined();
  });

  it('migra v1 -> v12', () => {
    const v1 = {
      schemaVersion: 1, savedAt: 12345,
      character: {
        id: 'x', name: 'N', classId: 'class.ferrumancer', createdAt: 0,
        level: 1, experience: 0, silver: 0, progressionPoints: 0,
        hp: 100, resource: 50, unlocks: [],
      },
      inventory: { capacity: 40, slots: [{ itemId: 'item.a', quantity: 5 }] },
      equipment: { slots: { weapon: 'item.sword' } },
    };
    const r = migrateToLatest(v1);
    expect(r.schemaVersion).toBe(15);
    expect(r.inventory.slots[0]?.enhancementLevel).toBe(0);
    expect(r.inventory.slots[0]?.randomAttributes).toBe(null);
    expect(r.inventory.slots[0]?.essences).toBe(null);
    expect(r.inventory.slots[0]?.essenceLevel).toBe(null);
    expect(r.buffs).toEqual([]);
    expect(r.quests).toEqual([]);
  });

  it('migra v5 -> v12', () => {
    const v5 = {
      schemaVersion: 5, savedAt: 12345,
      character: emptySave(0).character,
      inventory: { capacity: 40, slots: [] },
      equipment: { slots: {} },
      combat: null,
      combatConfig: { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
      enhancementHistory: [],
      professionStates: {},
      activity: null,
      buffs: [],
      farm: [],
    };
    const r = migrateToLatest(v5);
    expect(r.schemaVersion).toBe(15);
    expect(r.warehouse.capacity).toBe(100);
  });

  it('migra v8 -> v12', () => {
    const v8 = {
      schemaVersion: 8, savedAt: 12345,
      character: emptySave(0).character,
      inventory: { capacity: 40, slots: [{ itemId: 'item.a', quantity: 3, enhancementLevel: 2, durability: null }] },
      warehouse: { capacity: 100, slots: [] },
      equipment: { slots: {} },
      combat: null,
      combatConfig: { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
      enhancementHistory: [],
      professionStates: {},
      activity: null,
      buffs: [], farm: [], transactions: [],
      idleSetup: null, lastIdleReport: null, tutorial: null,
    };
    const r = migrateToLatest(v8);
    expect(r.schemaVersion).toBe(15);
    expect(r.inventory.slots[0]?.enhancementLevel).toBe(2);
  });

  it('migra v10 -> v12 preservando randomAttributes', () => {
    const v10 = {
      schemaVersion: 10, savedAt: 12345,
      character: emptySave(0).character,
      inventory: {
        capacity: 40,
        slots: [{
          itemId: 'item.a', quantity: 5, enhancementLevel: 0, durability: null,
          randomAttributes: [{ kind: 'attack', value: 5 }],
        }],
      },
      warehouse: { capacity: 100, slots: [] },
      equipment: { slots: {} },
      combat: null,
      combatConfig: { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
      enhancementHistory: [],
      professionStates: {}, activity: null,
      buffs: [], farm: [], transactions: [],
      idleSetup: null, lastIdleReport: null, tutorial: null, quests: [],
    };
    const r = migrateToLatest(v10);
    expect(r.schemaVersion).toBe(15);
    expect(r.inventory.slots[0]?.randomAttributes?.[0]?.kind).toBe('attack');
  });

  it('migra v11 -> v12 convertendo essences ID em instance', () => {
    const v11 = {
      schemaVersion: 11, savedAt: 12345,
      character: emptySave(0).character,
      inventory: {
        capacity: 40,
        slots: [{
          itemId: 'item.weapon.test', quantity: 1, enhancementLevel: 0, durability: null,
          randomAttributes: null,
          essences: ['item.essence.power.t1', null],
        }],
      },
      warehouse: { capacity: 100, slots: [] },
      equipment: { slots: {} },
      combat: null,
      combatConfig: { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
      enhancementHistory: [],
      professionStates: {}, activity: null,
      buffs: [], farm: [], transactions: [],
      idleSetup: null, lastIdleReport: null, tutorial: null, quests: [],
    };
    const r = migrateToLatest(v11);
    expect(r.schemaVersion).toBe(15);
    const ess = r.inventory.slots[0]?.essences;
    expect(ess).toBeDefined();
    expect(ess?.[0]?.itemId).toBe('item.essence.power.t1');
    expect(ess?.[0]?.level).toBe(1);
  });

  it('rejeita invalido', () => {
    expect(() => migrateToLatest(null)).toThrow(SaveParseError);
    expect(() => migrateToLatest({ savedAt: 0 })).toThrow(SaveParseError);
    expect(() => migrateToLatest({ schemaVersion: 99 })).toThrow(SaveParseError);
  });
});
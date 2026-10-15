import { describe, it, expect } from 'vitest';
import { applyEssence, removeEssence, sumEssenceBonuses, isEssenceCompatible, countInstalledEssences, essencesEqual } from '../../src/domain/essence/engine';
import type { EssenceDefinition, EssenceEvolutionConfig, EssenceInstance } from '../../src/domain/essence/types';
import type { ItemDefinition, ItemRarity } from '../../src/domain/content';
import type { ItemStack } from '../../src/domain/item-instance';
import { asItemId } from '../../src/domain/ids';

function makeWeapon(rarity: ItemRarity = 'rare', essenceSlots = 1): ItemDefinition {
  return {
    id: asItemId('item.weapon.test'),
    name: 'Test Sword', description: '',
    category: 'weapon', rarity, maxStack: 1, sellPrice: 1,
    equipSlot: 'weapon', attributeBonuses: { strength: 0, agility: 0, intelligence: 0, vitality: 0 },
    attackPower: 5, defensePower: 0, requiredLevel: 1,
    enhanceable: true, protectionItemId: null,
    toolCategory: null, maxDurability: 0,
    appliesBuffId: null, seedForNodeId: null,
    essenceSlots, essenceKind: null, essenceTier: null,
  };
}
function makeArmor(): ItemDefinition {
  return { ...makeWeapon('rare'), id: asItemId('item.armor.test'), category: 'armor', equipSlot: 'armor' };
}

const POWER_ESSENCE: EssenceDefinition = {
  kind: 'power', tier: 1,
  itemId: asItemId('item.essence.power.t1'),
  name: 'Poder T1', description: '',
  compatibleSlots: ['weapon', 'ring1', 'ring2'],
  bonus: { ap: 5, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0 },
  maxStackPerItem: 1,
};
const VITALITY_ESSENCE: EssenceDefinition = {
  kind: 'vitality', tier: 1,
  itemId: asItemId('item.essence.vitality.t1'),
  name: 'Vida T1', description: '',
  compatibleSlots: ['armor', 'helmet'],
  bonus: { ap: 0, dp: 0, maxHp: 20, critChance: 0, lifesteal: 0, bonusSilver: 0 },
  maxStackPerItem: 1,
};
const CFG: EssenceEvolutionConfig = {
  maxLevel: 5,
  levelMultipliers: [1.0, 1.2, 1.4, 1.6, 1.8],
  upgradeCostsByLevel: [
    { silver: 100, materials: [] },
    { silver: 200, materials: [] },
    { silver: 300, materials: [] },
    { silver: 400, materials: [] },
  ],
  unlocks: [],
};

function makeStack(itemId = 'item.weapon.test'): ItemStack {
  return {
    itemId: asItemId(itemId), quantity: 1, enhancementLevel: 0,
    durability: null, randomAttributes: null, essences: null, essenceLevel: null,
  };
}
function inst(id: string, lvl = 1): EssenceInstance {
  return { itemId: asItemId(id), level: lvl };
}

describe('applyEssence', () => {
  it('aplica essencia em slot vazio', () => {
    const r = applyEssence({
      item: makeStack(), itemDef: makeWeapon(),
      instance: inst('item.essence.power.t1', 1), essenceDef: POWER_ESSENCE,
      slotIndex: 0, playerSilver: 1000, cost: 0,
    });
    expect(r.ok).toBe(true);
    expect(r.newItem?.essences?.[0]?.itemId).toBe('item.essence.power.t1');
    expect(r.newItem?.essences?.[0]?.level).toBe(1);
  });
  it('rejeita item sem slots', () => {
    const r = applyEssence({
      item: makeStack(), itemDef: makeWeapon('common', 0),
      instance: inst('item.essence.power.t1'), essenceDef: POWER_ESSENCE,
      slotIndex: 0, playerSilver: 1000, cost: 0,
    });
    expect(r.error).toBe('item-not-equippable');
  });
  it('rejeita slot ocupado', () => {
    const s: ItemStack = { ...makeStack(), essences: [inst('item.essence.power.t1', 1)] };
    const r = applyEssence({
      item: s, itemDef: makeWeapon(),
      instance: inst('item.essence.power.t1'), essenceDef: POWER_ESSENCE,
      slotIndex: 0, playerSilver: 1000, cost: 0,
    });
    expect(r.error).toBe('slot-occupied');
  });
  it('rejeita essencia incompativel', () => {
    const r = applyEssence({
      item: makeStack('item.armor.test'), itemDef: makeArmor(),
      instance: inst('item.essence.power.t1'), essenceDef: POWER_ESSENCE,
      slotIndex: 0, playerSilver: 1000, cost: 0,
    });
    expect(r.error).toBe('incompatible-slot');
  });
  it('rejeita prata insuficiente', () => {
    const r = applyEssence({
      item: makeStack(), itemDef: makeWeapon(),
      instance: inst('item.essence.power.t1'), essenceDef: POWER_ESSENCE,
      slotIndex: 0, playerSilver: 10, cost: 100,
    });
    expect(r.error).toBe('not-enough-silver');
  });
  it('rejeita slot fora do range', () => {
    const r = applyEssence({
      item: makeStack(), itemDef: makeWeapon(),
      instance: inst('item.essence.power.t1'), essenceDef: POWER_ESSENCE,
      slotIndex: 5, playerSilver: 1000, cost: 0,
    });
    expect(r.error).toBe('slot-out-of-range');
  });
  it('impede duplicar alem do stack limit', () => {
    const s: ItemStack = { ...makeStack(), essences: [inst('item.essence.power.t1'), null] };
    const r = applyEssence({
      item: s, itemDef: makeWeapon('rare', 2),
      instance: inst('item.essence.power.t1'), essenceDef: POWER_ESSENCE,
      slotIndex: 1, playerSilver: 1000, cost: 0,
    });
    expect(r.error).toBe('stack-limit-reached');
  });
});

describe('removeEssence', () => {
  it('remove e devolve instance', () => {
    const s: ItemStack = { ...makeStack(), essences: [inst('item.essence.power.t1', 2)] };
    const r = removeEssence({
      item: s, itemDef: makeWeapon(), slotIndex: 0, playerSilver: 1000, cost: 50,
    });
    expect(r.ok).toBe(true);
    expect(r.removedInstance?.itemId).toBe('item.essence.power.t1');
    expect(r.removedInstance?.level).toBe(2);
    expect(r.newItem?.essences?.[0]).toBe(null);
  });
  it('rejeita remover de vazio', () => {
    const r = removeEssence({
      item: makeStack(), itemDef: makeWeapon(), slotIndex: 0, playerSilver: 1000, cost: 50,
    });
    expect(r.error).toBe('essence-not-equipped');
  });
  it('rejeita sem prata', () => {
    const s: ItemStack = { ...makeStack(), essences: [inst('item.essence.power.t1')] };
    const r = removeEssence({ item: s, itemDef: makeWeapon(), slotIndex: 0, playerSilver: 10, cost: 50 });
    expect(r.error).toBe('not-enough-silver');
  });
});

describe('isEssenceCompatible', () => {
  it('compativel', () => {
    expect(isEssenceCompatible(POWER_ESSENCE, makeWeapon())).toBe(true);
    expect(isEssenceCompatible(VITALITY_ESSENCE, makeArmor())).toBe(true);
  });
  it('incompativel', () => {
    expect(isEssenceCompatible(POWER_ESSENCE, makeArmor())).toBe(false);
    expect(isEssenceCompatible(VITALITY_ESSENCE, makeWeapon())).toBe(false);
  });
});

describe('sumEssenceBonuses (com evolution)', () => {
  it('soma bonus L1', () => {
    const map = new Map([[POWER_ESSENCE.itemId, POWER_ESSENCE], [VITALITY_ESSENCE.itemId, VITALITY_ESSENCE]]);
    const cfgs = new Map([['power.t1', CFG], ['vitality.t1', CFG]]);
    const items: ItemStack[] = [
      { ...makeStack(), essences: [inst('item.essence.power.t1', 1)] },
      { ...makeStack('item.armor.test'), essences: [inst('item.essence.vitality.t1', 1)] },
    ];
    const b = sumEssenceBonuses(items, map, cfgs);
    expect(b.ap).toBe(5);
    expect(b.maxHp).toBe(20);
  });
  it('soma bonus L5 com multiplicador 1.8', () => {
    const map = new Map([[POWER_ESSENCE.itemId, POWER_ESSENCE]]);
    const cfgs = new Map([['power.t1', CFG]]);
    const items: ItemStack[] = [{ ...makeStack(), essences: [inst('item.essence.power.t1', 5)] }];
    const b = sumEssenceBonuses(items, map, cfgs);
    expect(b.ap).toBe(Math.round(5 * 1.8));
  });
});

describe('helpers', () => {
  it('countInstalledEssences', () => {
    expect(countInstalledEssences(null)).toBe(0);
    expect(countInstalledEssences({ ...makeStack(), essences: [inst('item.essence.power.t1'), null] })).toBe(1);
  });
  it('essencesEqual', () => {
    expect(essencesEqual(null, null)).toBe(true);
    expect(essencesEqual([], [])).toBe(true);
    expect(essencesEqual([inst('item.essence.power.t1', 1)], [inst('item.essence.power.t1', 1)])).toBe(true);
    expect(essencesEqual([inst('item.essence.power.t1', 1)], [inst('item.essence.power.t1', 2)])).toBe(false);
  });
});
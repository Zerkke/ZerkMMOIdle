import { describe, it, expect } from 'vitest';
import { enhancementBonuses, enhancedPower, enhancedAttributes } from '../../../src/domain/enhancement/bonus';
import type { ItemDefinition } from '../../../src/domain/content';
import { asItemId } from '../../../src/domain/ids';

function mockItem(overrides: Partial<ItemDefinition> = {}): ItemDefinition {
  return {
    id: asItemId('item.mock.sword'),
    name: 'Mock Sword',
    description: 'test',
    category: 'weapon',
    rarity: 'rare',
    maxStack: 1,
    sellPrice: 100,
    equipSlot: 'weapon',
    attributeBonuses: { strength: 10, agility: 5, intelligence: 0, vitality: 8 },
    attackPower: 20,
    defensePower: 0,
    requiredLevel: 1,
    enhanceable: true,
    protectionItemId: null,
    toolCategory: null,
    maxDurability: 0,
    appliesBuffId: null,
    seedForNodeId: null,
    essenceSlots: 1,
    essenceKind: null,
    essenceTier: null,
    ...overrides,
  };
}

describe('enhancementBonuses â€” progressao multi-camada', () => {
  it('nivel 0 devolve tudo a zero', () => {
    const b = enhancementBonuses(mockItem(), 0);
    expect(b.attackPower).toBe(0);
    expect(b.hp).toBe(0);
    expect(b.critChance).toBe(0);
    expect(b.milestoneName).toBeNull();
  });

  it('cada nivel adiciona AP, HP, crit e regen', () => {
    const l1 = enhancementBonuses(mockItem(), 1);
    const l5 = enhancementBonuses(mockItem(), 5);
    const l10 = enhancementBonuses(mockItem(), 10);
    expect(l1.attackPower).toBeGreaterThan(0);
    expect(l5.attackPower).toBeGreaterThan(l1.attackPower * 3);
    expect(l10.attackPower).toBeGreaterThan(l5.attackPower * 1.5);
    expect(l1.critChance).toBeGreaterThan(0);
    expect(l10.hpRegen).toBeGreaterThan(l1.hpRegen * 5);
  });

  it('HP escala com vitalidade base', () => {
    const fraco = enhancementBonuses(mockItem({ attributeBonuses: { strength: 0, agility: 0, intelligence: 0, vitality: 5 } }), 10);
    const forte = enhancementBonuses(mockItem({ attributeBonuses: { strength: 0, agility: 0, intelligence: 0, vitality: 50 } }), 10);
    expect(forte.hp).toBeGreaterThan(fraco.hp * 5);
  });

  it('marco em +10 comeca a dar rolls extra', () => {
    const l9  = enhancementBonuses(mockItem(), 9);
    const l10 = enhancementBonuses(mockItem(), 10);
    expect(l9.extraRolls).toBe(0);
    expect(l10.extraRolls).toBe(1);
    expect(l10.milestoneName).toBe('Aperfeicoado');
  });

  it('marcos sao CUMULATIVOS (cada um soma)', () => {
    const l15 = enhancementBonuses(mockItem(), 15);
    // +10 da 1 roll, +15 da 1 roll => 2 no total ao +15
    expect(l15.extraRolls).toBe(2);
    // +15 da 1 slot de essencia extra (o +10 nao da slots)
    expect(l15.extraEssenceSlots).toBe(1);
    expect(l15.milestoneName).toBe('Lendario');
  });

  it('marco maximo em +20 da o pack completo', () => {
    const l20 = enhancementBonuses(mockItem(), 20);
    // 0 + 1 + 1 + 2 = 4 rolls extra
    expect(l20.extraRolls).toBe(4);
    // 0 + 0 + 1 + 1 = 2 slots de essencia extra
    expect(l20.extraEssenceSlots).toBe(2);
    expect(l20.milestoneName).toBe('Transcendente');
    // E os status base tambem estao muito altos
    expect(l20.attackPower).toBeGreaterThan(0);
    expect(l20.critChance).toBeGreaterThanOrEqual(0.1); // >10%
    expect(l20.hpRegen).toBeGreaterThan(9);
  });

  it('backward-compat: enhancedPower e enhancedAttributes continuam a funcionar', () => {
    const item = mockItem();
    const p = enhancedPower(item, 5);
    const a = enhancedAttributes(item, 5);
    const b = enhancementBonuses(item, 5);
    expect(p.attackPower).toBe(b.attackPower);
    expect(a.strength).toBe(b.strength);
  });
});
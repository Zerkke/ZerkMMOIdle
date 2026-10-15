import { describe, it, expect } from 'vitest';
import { enhancementBonuses } from '../../../src/domain/enhancement/bonus';
import type { ItemDefinition } from '../../../src/domain/content';
import { asItemId } from '../../../src/domain/ids';
import { deriveStats, ZERO_ATTRIBUTES, ZERO_POWER } from '../../../src/domain/attributes';

function mockItem(): ItemDefinition {
  return {
    id: asItemId('item.mock'), name: 'M', description: 't',
    category: 'weapon', rarity: 'rare', maxStack: 1, sellPrice: 500,
    equipSlot: 'weapon', attributeBonuses: { strength: 10, agility: 5, intelligence: 0, vitality: 10 },
    attackPower: 30, defensePower: 10, requiredLevel: 1, enhanceable: true,
    protectionItemId: null, toolCategory: null, maxDurability: 0,
    appliesBuffId: null, seedForNodeId: null, essenceSlots: 0,
    essenceKind: null, essenceTier: null,
  };
}

describe('Turbo de melhoramento', () => {
  it('+10 da crit chance >= 15%', () => {
    const b = enhancementBonuses(mockItem(), 10);
    expect(b.critChance).toBeGreaterThanOrEqual(0.15);
  });
  it('+10 da lifesteal >= 8%', () => {
    const b = enhancementBonuses(mockItem(), 10);
    expect(b.lifesteal).toBeGreaterThanOrEqual(0.08);
  });
  it('+20 da reducao de dano >= 20% (cap 30%)', () => {
    const b = enhancementBonuses(mockItem(), 20);
    expect(b.damageReduction).toBeGreaterThanOrEqual(0.20);
    expect(b.damageReduction).toBeLessThanOrEqual(0.30);
  });
});

describe('damageReduction integrado em deriveStats', () => {
  it('enhancementDamageReduction soma ao damageReduction final', () => {
    const sem = deriveStats(ZERO_ATTRIBUTES, ZERO_POWER);
    const com = deriveStats(ZERO_ATTRIBUTES, ZERO_POWER, { enhancementDamageReduction: 0.25 });
    expect(com.damageReduction).toBeGreaterThan(sem.damageReduction);
    expect(com.damageReduction).toBeLessThanOrEqual(90);
  });
  it('cap global de 90% nunca e excedido', () => {
    const d = deriveStats({ strength: 0, agility: 0, intelligence: 0, vitality: 500 }, ZERO_POWER, { enhancementDamageReduction: 0.5 });
    expect(d.damageReduction).toBeLessThanOrEqual(90);
  });
});
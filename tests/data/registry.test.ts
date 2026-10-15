import { describe, it, expect } from 'vitest';
import { buildContentRegistry, createDemoRegistry } from '../../src/data/registry';
import { asItemId, asMonsterId, asProfessionId } from '../../src/domain/ids';
import type { ItemDefinition, MonsterDefinition, ZoneDefinition } from '../../src/domain/content';

function makeItem(overrides: Partial<ItemDefinition> = {}): ItemDefinition {
  return {
    id: asItemId('item.x'), name: 'A', description: 'A',
    category: 'material', rarity: 'common', maxStack: 1, sellPrice: 1,
    equipSlot: null, attributeBonuses: null,
    attackPower: 0, defensePower: 0, requiredLevel: 1,
    enhanceable: false, protectionItemId: null,
    toolCategory: null, maxDurability: 0,
    appliesBuffId: null, seedForNodeId: null,
    essenceSlots: 0, essenceKind: null, essenceTier: null,
    ...overrides,
  };
}

function makeMonster(overrides: Partial<MonsterDefinition> = {}): MonsterDefinition {
  return {
    id: asMonsterId('monster.x'), name: 'M', description: 'M',
    level: 1, maxHp: 10, attack: 1, defense: 0, attackIntervalMs: 2000,
    expReward: 1, silverReward: 1,
    loot: [],
    isBoss: false, bossTier: 0,
    ...overrides,
  };
}

function makeZone(overrides: Partial<ZoneDefinition> = {}): ZoneDefinition {
  return {
    id: 'zone.x' as never, name: 'Z', description: 'Z',
    kind: 'combat',
    minLevel: 1,
    monsters: [],
    activities: [],
    unlockedBy: { kind: 'default' },
    parentZoneId: null,
    bossId: null,
    isExpansion: false,
    ...overrides,
  };
}

const EMPTY_INPUT = {
  items: [], classes: [], monsters: [], zones: [], skills: [],
  professions: [], nodes: [], recipes: [], buffs: [],
} as const;

describe('Registo de conteudo (demo)', () => {
  it('constroi o registo sem erros', () => {
    const r = createDemoRegistry();
    expect(r.items.size).toBeGreaterThan(0);
    expect(r.classes.size).toBeGreaterThanOrEqual(3);
    expect(r.monsters.size).toBeGreaterThan(0);
    expect(r.zones.size).toBeGreaterThan(0);
    expect(r.skills.size).toBeGreaterThan(0);
    expect(r.enhancementRules.length).toBeGreaterThan(0);
  });

  it('encontra profissoes', () => {
    const r = createDemoRegistry();
    expect(r.getProfession(asProfessionId('profession.mining'))).toBeDefined();
  });

  it('encontra nos', () => {
    const r = createDemoRegistry();
    expect(r.getNode('node.iron-vein' as never)).toBeDefined();
  });

  it('encontra receitas', () => {
    const r = createDemoRegistry();
    expect(r.getRecipe('recipe.iron-ingot' as never)).toBeDefined();
  });

  it('tem bosses registados', () => {
    const r = createDemoRegistry();
    const bosses = Array.from(r.monsters.values()).filter((m) => m.isBoss);
    expect(bosses.length).toBeGreaterThanOrEqual(3);
  });

  it('tem zonas em arvore (parentZoneId valido)', () => {
    const r = createDemoRegistry();
    let rootCount = 0;
    for (const z of r.zones.values()) {
      if (z.parentZoneId === null) rootCount++;
    }
    expect(rootCount).toBeGreaterThanOrEqual(1);
  });
});

describe('Validacao do registo', () => {
  it('rejeita ID de item duplicado', () => {
    const dup = makeItem();
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      items: [dup, dup],
    })).toThrow(/duplicado/i);
  });

  it('rejeita maxStack invalido', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      items: [makeItem({ maxStack: 0 })],
    })).toThrow(/maxStack/i);
  });

  it('rejeita monstro com drop para item inexistente', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      monsters: [makeMonster({
        loot: [{ itemId: asItemId('item.fantasma'), chance: 0.5, minQuantity: 1, maxQuantity: 1 }],
      })],
    })).toThrow(/inexistente/i);
  });

  it('rejeita zona com monstro inexistente', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      zones: [makeZone({ monsters: ['monster.fantasma' as never] })],
    })).toThrow(/inexistente/i);
  });

  it('rejeita node com profissao inexistente', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      nodes: [{
        id: 'node.bad' as never, name: 'N', description: '',
        professionId: asProfessionId('profession.fantasma'),
        zoneId: 'zone.bad' as never,
        kind: 'gathering' as const,
        requiredTool: null, requiredLevel: 1,
        baseTimeMs: 1000, baseExp: 1, loot: [],
      }],
    })).toThrow(/inexistente/i);
  });

  it('rejeita zona boss sem bossId', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      zones: [makeZone({ kind: 'boss', bossId: null })],
    })).toThrow(/bossId/i);
  });

  it('rejeita boss com tier 0', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      monsters: [makeMonster({ isBoss: true, bossTier: 0 })],
    })).toThrow(/bossTier/i);
  });

  it('rejeita monstro normal com tier != 0', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      monsters: [makeMonster({ isBoss: false, bossTier: 2 })],
    })).toThrow(/bossTier/i);
  });

  it('rejeita zona com parentZoneId inexistente', () => {
    expect(() => buildContentRegistry({
      ...EMPTY_INPUT,
      zones: [makeZone({ parentZoneId: 'zone.fantasma' as never })],
    })).toThrow(/inexistente/i);
  });
});
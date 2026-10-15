import { describe, it, expect } from 'vitest';
import { NPC_SHOP, findShopEntry } from '../../src/data/npc-shop.data';
import { DEMO_MONSTERS } from '../../src/data/monsters.data';
import { DEMO_RECIPES } from '../../src/data/recipes.data';
import { ITEMS } from '../../src/data/items.data';
import { asItemId } from '../../src/domain/ids';

describe('Acessibilidade dos tiers', () => {
  it('loja vende os 4 tiers principais', () => {
    expect(findShopEntry(asItemId('item.weapon.iron-sword'))).toBeDefined();
    expect(findShopEntry(asItemId('item.weapon.steel-sword'))).toBeDefined();
    expect(findShopEntry(asItemId('item.weapon.mithril-blade'))).toBeDefined();
    expect(findShopEntry(asItemId('item.weapon.adamant-sword'))).toBeDefined();
  });

  it('loja tem precos crescentes por tier', () => {
    const ferro  = findShopEntry(asItemId('item.weapon.iron-sword'))?.buyPrice ?? 0;
    const aco    = findShopEntry(asItemId('item.weapon.steel-sword'))?.buyPrice ?? 0;
    const mithril = findShopEntry(asItemId('item.weapon.mithril-blade'))?.buyPrice ?? 0;
    expect(aco).toBeGreaterThan(ferro * 3);
    expect(mithril).toBeGreaterThan(aco * 3);
  });

  it('bosses existentes dropam itens de tier', () => {
    const loboAlfa = DEMO_MONSTERS.find((m) => m.id === 'monster.boss.ash-wolf-alpha');
    expect(loboAlfa?.loot.some((l) => l.itemId === 'item.weapon.iron-sword')).toBe(true);
  });

  it('novos bosses end-game existem no registry', () => {
    const abyss    = DEMO_MONSTERS.find((m) => m.id === 'monster.boss.abyss-lord');
    const devourer = DEMO_MONSTERS.find((m) => m.id === 'monster.boss.world-devourer');
    const chaos    = DEMO_MONSTERS.find((m) => m.id === 'monster.boss.chaos-avatar');
    const god      = DEMO_MONSTERS.find((m) => m.id === 'monster.boss.forgotten-god');
    expect(abyss?.level).toBe(30);
    expect(devourer?.level).toBe(45);
    expect(chaos?.level).toBe(60);
    expect(god?.level).toBe(80);
  });

  it('Deus Esquecido dropa a Lamina Divina', () => {
    const god = DEMO_MONSTERS.find((m) => m.id === 'monster.boss.forgotten-god');
    expect(god?.loot.some((l) => l.itemId === 'item.weapon.divine-blade')).toBe(true);
  });

  it('Avatar do Caos dropa Espada do Dragao', () => {
    const chaos = DEMO_MONSTERS.find((m) => m.id === 'monster.boss.chaos-avatar');
    expect(chaos?.loot.some((l) => l.itemId === 'item.weapon.dragon-sword')).toBe(true);
  });

  it('receitas de craft produzem as armas de tier', () => {
    const espadaFerro = DEMO_RECIPES.find((r) => r.id === 'recipe.iron-sword');
    const espadaAco   = DEMO_RECIPES.find((r) => r.id === 'recipe.steel-sword');
    const laminaMith  = DEMO_RECIPES.find((r) => r.id === 'recipe.mithril-blade');
    expect(espadaFerro?.outputs[0]?.itemId).toBe('item.weapon.iron-sword');
    expect(espadaAco?.outputs[0]?.itemId).toBe('item.weapon.steel-sword');
    expect(laminaMith?.outputs[0]?.itemId).toBe('item.weapon.mithril-blade');
  });

  it('receitas de craft requerem nivel coerente com o tier', () => {
    const espadaFerro = DEMO_RECIPES.find((r) => r.id === 'recipe.iron-sword');
    const espadaAco   = DEMO_RECIPES.find((r) => r.id === 'recipe.steel-sword');
    expect(espadaFerro?.requiredLevel).toBe(10);
    expect(espadaAco?.requiredLevel).toBe(20);
  });

  it('todos os itens de loja existem no registry', () => {
    for (const entry of NPC_SHOP) {
      const item = ITEMS.find((i) => i.id === entry.itemId);
      expect(item, 'Loja refere item inexistente: ' + entry.itemId).toBeDefined();
    }
  });

  it('todos os drops de monstro existem no registry', () => {
    for (const mob of DEMO_MONSTERS) {
      for (const drop of mob.loot) {
        const item = ITEMS.find((i) => i.id === drop.itemId);
        expect(item, 'Drop refere item inexistente: ' + drop.itemId).toBeDefined();
      }
    }
  });

  it('todas as receitas usam itens que existem no registry', () => {
    for (const recipe of DEMO_RECIPES) {
      for (const input of recipe.inputs) {
        const item = ITEMS.find((i) => i.id === input.itemId);
        expect(item, 'Receita ' + recipe.id + ' usa input inexistente: ' + input.itemId).toBeDefined();
      }
      for (const output of recipe.outputs) {
        const item = ITEMS.find((i) => i.id === output.itemId);
        expect(item, 'Receita ' + recipe.id + ' produz item inexistente: ' + output.itemId).toBeDefined();
      }
    }
  });
});
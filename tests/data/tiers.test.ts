import { describe, it, expect } from 'vitest';
import { ITEMS } from '../../src/data/items.data';
import { asItemId } from '../../src/domain/ids';

function find(id: string) {
  return ITEMS.find((i) => i.id === asItemId(id));
}

describe('Tiers de equipamento — progressao', () => {
  it('Tier Ferro (Nv 11) existe com AP/DP significativos', () => {
    const espada = find('item.weapon.iron-sword');
    const peitoral = find('item.armor.iron-breastplate');
    expect(espada?.attackPower).toBe(35);
    expect(espada?.requiredLevel).toBe(11);
    expect(peitoral?.defensePower).toBe(28);
  });

  it('Tier Aco (Nv 21) e mais forte que Ferro', () => {
    const ferro = find('item.weapon.iron-sword');
    const aco   = find('item.weapon.steel-sword');
    expect(aco?.attackPower).toBeGreaterThan((ferro?.attackPower ?? 0) * 2);
    expect(aco?.requiredLevel).toBe(21);
  });

  it('Tiers sao progressivos (cada um >= 2x o anterior)', () => {
    const ferro    = find('item.weapon.iron-sword')?.attackPower ?? 0;
    const aco      = find('item.weapon.steel-sword')?.attackPower ?? 0;
    const mithril  = find('item.weapon.mithril-blade')?.attackPower ?? 0;
    const adamant  = find('item.weapon.adamant-sword')?.attackPower ?? 0;
    const dragao   = find('item.weapon.dragon-sword')?.attackPower ?? 0;
    const divino   = find('item.weapon.divine-blade')?.attackPower ?? 0;
    expect(aco).toBeGreaterThan(ferro * 2);
    expect(mithril).toBeGreaterThan(aco * 2);
    expect(adamant).toBeGreaterThan(mithril * 2);
    expect(dragao).toBeGreaterThan(adamant * 2);
    expect(divino).toBeGreaterThan(dragao * 2);
  });

  it('Espada do Dragao tem bonus especiais (HP, crit, regen, lifesteal)', () => {
    const espada = find('item.weapon.dragon-sword');
    expect(espada?.bonusHp).toBeGreaterThan(1000);
    expect(espada?.bonusCritChance).toBeGreaterThan(0);
    expect(espada?.bonusHpRegen).toBeGreaterThan(10);
    expect(espada?.bonusLifesteal).toBeGreaterThan(0);
    expect(espada?.rarity).toBe('legendary');
  });

  it('Lamina Divina e o item mais forte do jogo', () => {
    const divina = find('item.weapon.divine-blade');
    expect(divina?.attackPower).toBe(2600);
    expect(divina?.requiredLevel).toBe(71);
    expect(divina?.rarity).toBe('legendary');
    expect(divina?.bonusHp).toBeGreaterThan(5000);
  });

  it('Armadura do Tita tem o maior HP do jogo', () => {
    const titan = find('item.armor.titan-armor');
    expect(titan?.bonusHp).toBe(12000);
    expect(titan?.defensePower).toBe(1600);
  });

  it('Escudo do Vazio combina defesa e lifesteal', () => {
    const escudo = find('item.offhand.void-shield');
    expect(escudo?.defensePower).toBe(1400);
    expect(escudo?.bonusLifesteal).toBeGreaterThan(0);
    expect(escudo?.bonusHpRegen).toBeGreaterThan(50);
  });

  it('Todos os itens novos tem requiredLevel coerente com tier', () => {
    const esperados: Record<string, number> = {
      'item.weapon.iron-sword': 11,
      'item.weapon.steel-sword': 21,
      'item.weapon.mithril-blade': 31,
      'item.weapon.adamant-sword': 41,
      'item.weapon.dragon-sword': 51,
      'item.weapon.divine-blade': 71,
    };
    for (const [id, lvl] of Object.entries(esperados)) {
      expect(find(id)?.requiredLevel).toBe(lvl);
    }
  });
});
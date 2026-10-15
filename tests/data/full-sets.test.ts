import { describe, it, expect } from 'vitest';
import { ITEMS } from '../../src/data/items.data';
import { asItemId } from '../../src/domain/ids';

function find(id: string) {
  return ITEMS.find((i) => i.id === asItemId(id));
}

const TIERS = [
  { name: 'Ferro',     suffix: 'iron',    lvl: 11 },
  { name: 'Aco',       suffix: 'steel',   lvl: 21 },
  { name: 'Mithril',   suffix: 'mithril', lvl: 31 },
  { name: 'Adamante',  suffix: 'adamant', lvl: 41 },
  { name: 'Dragao',    suffix: 'dragon',  lvl: 51 },
  { name: 'Divino',    suffix: 'divine',  lvl: 71 },
];

describe('Conjuntos por tier — completude', () => {
  for (const tier of TIERS) {
    it(tier.name + ': tem acessorios (anel, brinco, colar)', () => {
      expect(find('item.ring.' + tier.suffix)?.equipSlot).toBe('ring1');
      expect(find('item.earring.' + tier.suffix)?.equipSlot).toBe('earring1');
      expect(find('item.necklace.' + tier.suffix)?.equipSlot).toBe('necklace');
    });
  }

  it('Ferro tem luvas e botas', () => {
    expect(find('item.armor.iron-gauntlets')).toBeDefined();
    expect(find('item.armor.iron-boots')).toBeDefined();
  });

  it('Aco tem luvas e botas', () => {
    expect(find('item.armor.steel-gauntlets')).toBeDefined();
    expect(find('item.armor.steel-boots')).toBeDefined();
  });

  it('Mithril tem conjunto completo (elmo, luvas, botas)', () => {
    expect(find('item.armor.mithril-helm')).toBeDefined();
    expect(find('item.armor.mithril-gauntlets')).toBeDefined();
    expect(find('item.armor.mithril-boots')).toBeDefined();
  });

  it('Adamante tem conjunto completo (elmo, luvas, botas)', () => {
    expect(find('item.armor.adamant-helm')).toBeDefined();
    expect(find('item.armor.adamant-gauntlets')).toBeDefined();
    expect(find('item.armor.adamant-boots')).toBeDefined();
  });

  it('Dragao tem luvas e botas com bonus especiais', () => {
    expect(find('item.armor.dragon-gauntlets')?.bonusHp).toBeGreaterThan(0);
    expect(find('item.armor.dragon-boots')?.bonusHp).toBeGreaterThan(0);
  });

  it('Divino tem conjunto completo com bonus massivos', () => {
    expect(find('item.armor.divine-helm')?.bonusHp).toBe(3000);
    expect(find('item.armor.divine-gauntlets')?.bonusHp).toBe(2200);
    expect(find('item.armor.divine-boots')?.bonusHp).toBe(2500);
    expect(find('item.ring.divine')?.bonusHp).toBe(2000);
    expect(find('item.earring.divine')?.bonusLifesteal).toBe(0.05);
  });

  it('todos os itens novos tem requiredLevel correto', () => {
    for (const tier of TIERS) {
      expect(find('item.ring.' + tier.suffix)?.requiredLevel).toBe(tier.lvl);
      expect(find('item.earring.' + tier.suffix)?.requiredLevel).toBe(tier.lvl);
      expect(find('item.necklace.' + tier.suffix)?.requiredLevel).toBe(tier.lvl);
    }
  });

  it('progressao monotona: anel Divino e o mais forte', () => {
    const ferro   = find('item.ring.iron')?.attackPower ?? 0;
    const aco     = find('item.ring.steel')?.attackPower ?? 0;
    const mithril = find('item.ring.mithril')?.attackPower ?? 0;
    const adamant = find('item.ring.adamant')?.attackPower ?? 0;
    const dragao  = find('item.ring.dragon')?.attackPower ?? 0;
    const divino  = find('item.ring.divine')?.attackPower ?? 0;
    expect(aco).toBeGreaterThan(ferro * 2);
    expect(mithril).toBeGreaterThan(aco * 2);
    expect(adamant).toBeGreaterThan(mithril * 2);
    expect(dragao).toBeGreaterThan(adamant * 2);
    expect(divino).toBeGreaterThan(dragao * 2);
  });
});
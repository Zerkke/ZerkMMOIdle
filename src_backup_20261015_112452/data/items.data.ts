import { asBuffId, asItemId, asNodeId } from '../domain/ids';
import type { ItemDefinition } from '../domain/content';
import { ESSENCES } from './essences.data';

const NO_BONUS = { strength: 0, agility: 0, intelligence: 0, vitality: 0 };
const BASE = {
  equipSlot: null, attributeBonuses: null as null,
  attackPower: 0, defensePower: 0, requiredLevel: 1,
  enhanceable: false, protectionItemId: null as null,
  toolCategory: null as null, maxDurability: 0,
  appliesBuffId: null, seedForNodeId: null,
  essenceSlots: 0, essenceKind: null as null, essenceTier: null as null,
} as const;

function mat(id: string, name: string, desc: string, sellPrice: number, rarity: ItemDefinition['rarity'] = 'common'): ItemDefinition {
  return { ...BASE, id: asItemId(id), name, description: desc, category: 'material', rarity, maxStack: 999, sellPrice };
}
function seed(id: string, name: string, forNodeId: string, sellPrice: number): ItemDefinition {
  return { ...BASE, id: asItemId(id), name, description: '[DEMO] Semente para ' + forNodeId + '.', category: 'seed', rarity: 'common', maxStack: 99, sellPrice, seedForNodeId: asNodeId(forNodeId) };
}
function crop(id: string, name: string, sellPrice: number): ItemDefinition {
  return { ...BASE, id: asItemId(id), name, description: '[DEMO] Colheita fresca.', category: 'crop', rarity: 'common', maxStack: 999, sellPrice };
}
function fish(id: string, name: string, rarity: ItemDefinition['rarity'], sellPrice: number): ItemDefinition {
  return { ...BASE, id: asItemId(id), name, description: '[DEMO] Peixe.', category: 'fish', rarity, maxStack: 999, sellPrice };
}
function meat(id: string, name: string, rarity: ItemDefinition['rarity'], sellPrice: number): ItemDefinition {
  return { ...BASE, id: asItemId(id), name, description: '[DEMO] Carne ou couro.', category: 'meat', rarity, maxStack: 999, sellPrice };
}
function consumable(id: string, name: string, desc: string, sellPrice: number, buffId: string | null): ItemDefinition {
  return { ...BASE, id: asItemId(id), name, description: desc, category: 'consumable', rarity: 'common', maxStack: 99, sellPrice, appliesBuffId: buffId ? asBuffId(buffId) : null };
}
function tool(id: string, name: string, desc: string, cat: 'pickaxe' | 'axe' | 'sickle' | 'fishing_rod' | 'skin_knife', dur: number, price: number): ItemDefinition {
  return { ...BASE, id: asItemId(id), name, description: desc, category: 'tool', rarity: 'common', maxStack: 1, sellPrice: price,
    equipSlot: 'tool', attributeBonuses: { ...NO_BONUS }, enhanceable: true, toolCategory: cat, maxDurability: dur };
}
function equippable(
  id: string, name: string, desc: string,
  cat: 'weapon' | 'armor' | 'accessory',
  slot: ItemDefinition['equipSlot'],
  rarity: ItemDefinition['rarity'],
  price: number, ap: number, dp: number,
  attrs: Partial<typeof NO_BONUS>, reqLvl: number,
): ItemDefinition {
  // Essence slots por raridade (Fase 17)
  const slots = rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : rarity === 'rare' ? 1 : 0;
  return { ...BASE, id: asItemId(id), name, description: desc, category: cat, rarity, maxStack: 1, sellPrice: price,
    equipSlot: slot, attributeBonuses: { ...NO_BONUS, ...attrs }, attackPower: ap, defensePower: dp,
    requiredLevel: reqLvl, enhanceable: true, essenceSlots: slots };
}
function essenceItem(e: typeof ESSENCES[number]): ItemDefinition {
  return {
    ...BASE,
    id: e.itemId,
    name: e.name,
    description: e.description,
    category: 'essence',
    rarity: e.tier === 3 ? 'epic' : e.tier === 2 ? 'rare' : 'uncommon',
    // Fase 18: essencias tem nivel individual, nao se podem empilhar.
    maxStack: 1,
    sellPrice: 100 * e.tier,
    essenceKind: e.kind,
    essenceTier: e.tier,
  };
}

export const ITEMS: readonly ItemDefinition[] = [
  // Materiais base
  mat('item.ore.iron', 'Minerio de Ferro', '[DEMO] Fragmento de ferro.', 5),
  mat('item.ore.copper', 'Minerio de Cobre', '[DEMO] Fragmento de cobre.', 3),
  mat('item.wood.pine', 'Madeira de Pinheiro', '[DEMO] Tronco de pinheiro.', 4),
  mat('item.wood.oak', 'Madeira de Carvalho', '[DEMO] Tronco resistente.', 8, 'uncommon'),
  mat('item.herb.mint', 'Erva-Menta', '[DEMO] Planta aromatica.', 3),
  mat('item.herb.lavender', 'Lavanda', '[DEMO] Flor calmante.', 6, 'uncommon'),
  mat('item.ingot.iron', 'Barra de Ferro', '[DEMO] Ferro fundido.', 20, 'uncommon'),
  mat('item.plank.pine', 'Tabua de Pinheiro', '[DEMO] Tabua processada.', 12),

  // Sementes
  seed('item.seed.wheat', 'Semente de Trigo', 'node.crop.wheat', 5),
  seed('item.seed.carrot', 'Semente de Cenoura', 'node.crop.carrot', 6),
  seed('item.seed.herb', 'Semente de Erva', 'node.crop.mint', 8),

  // Colheitas
  crop('item.crop.wheat', 'Trigo', 6),
  crop('item.crop.carrot', 'Cenoura', 7),
  crop('item.crop.mint-fresh', 'Erva-Menta Fresca', 10),

  // Peixes
  fish('item.fish.sardine', 'Sardinha', 'common', 6),
  fish('item.fish.trout', 'Truta', 'uncommon', 14),
  fish('item.fish.golden-koi', 'Koi Dourado', 'rare', 80),

  // Carnes / couros
  meat('item.meat.rabbit', 'Carne de Coelho', 'common', 5),
  meat('item.meat.boar', 'Carne de Javali', 'uncommon', 12),
  meat('item.hide.boar', 'Pele de Javali', 'uncommon', 15),
  meat('item.hide.wolf', 'Pele de Lobo', 'rare', 30),

  // Consumiveis
  consumable('item.potion.small', 'Pocao Menor', 'Restaura HP.', 20, 'buff.potion.hp-small'),
  consumable('item.potion.mana', 'Pocao de Foco', 'Recupera recurso.', 25, 'buff.potion.resource-small'),
  consumable('item.food.stew', 'Guisado', 'Reforca o ataque.', 40, 'buff.food.attack'),
  consumable('item.food.bread', 'Pao de Trigo', 'Acelera a recolha.', 30, 'buff.food.gather-speed'),
  consumable('item.elixir.processing', 'Elixir de Oficio', 'Acelera o processamento.', 55, 'buff.elixir.craft-speed'),
  consumable('item.elixir.crit', 'Elixir da Precisao', 'Aumenta o critico.', 70, 'buff.elixir.crit'),
  consumable('item.elixir.ap', 'Elixir de Poder', 'Aumenta o AP durante 60s.', 90, 'buff.elixir.ap'),
  consumable('item.elixir.dp', 'Elixir de Guarda', 'Aumenta o DP durante 60s.', 90, 'buff.elixir.dp'),

  // Ferramentas
  tool('item.tool.pickaxe', 'Picareta de Ferro', '[DEMO] Mineracao.', 'pickaxe', 100, 100),
  tool('item.tool.axe', 'Machado de Ferro', '[DEMO] Corte.', 'axe', 100, 100),
  tool('item.tool.sickle', 'Foice de Ferro', '[DEMO] Recolha.', 'sickle', 100, 100),
  tool('item.tool.fishing-rod', 'Cana de Pesca', '[DEMO] Pesca.', 'fishing_rod', 80, 120),
  tool('item.tool.skin-knife', 'Faca de Esfolar', '[DEMO] Caca.', 'skin_knife', 60, 140),

  // Armas
  equippable('item.weapon.short-sword', 'Espada Curta', '[DEMO] Espada simples.', 'weapon', 'weapon', 'uncommon', 200, 8, 0, { strength: 5 }, 1),
  equippable('item.weapon.hunting-bow', 'Arco de Caca', '[DEMO] Arco leve.', 'weapon', 'weapon', 'uncommon', 220, 7, 0, { agility: 6 }, 3),
  equippable('item.weapon.iron-greatsword', 'Espadao de Ferro', '[DEMO] Arma pesada.', 'weapon', 'weapon', 'rare', 800, 18, 0, { strength: 10 }, 5),

  // Armaduras
  equippable('item.armor.leather-vest', 'Colete de Couro', '[DEMO] Protecao leve.', 'armor', 'armor', 'common', 150, 0, 8, { vitality: 3 }, 1),
  equippable('item.armor.iron-helm', 'Elmo de Ferro', '[DEMO] Elmo robusto.', 'armor', 'helmet', 'uncommon', 180, 0, 5, { vitality: 4 }, 2),
  equippable('item.armor.leather-gloves', 'Luvas de Couro', '[DEMO] Luvas leves.', 'armor', 'gloves', 'common', 90, 0, 3, { agility: 2 }, 1),
  equippable('item.armor.leather-boots', 'Botas de Couro', '[DEMO] Botas leves.', 'armor', 'boots', 'common', 110, 0, 4, { agility: 2 }, 1),
  equippable('item.offhand.wood-shield', 'Escudo de Madeira', '[DEMO] Escudo basico.', 'armor', 'offhand', 'common', 100, 0, 6, { vitality: 2 }, 1),

  // Acessorios
  equippable('item.ring.bronze', 'Anel de Bronze', '[DEMO] Anel simples.', 'accessory', 'ring1', 'common', 80, 2, 0, { agility: 1 }, 1),
  equippable('item.earring.silver', 'Brinco de Prata', '[DEMO] Brinco leve.', 'accessory', 'earring1', 'common', 70, 0, 1, { intelligence: 2 }, 1),
  equippable('item.necklace.copper', 'Colar de Cobre', '[DEMO] Colar simples.', 'accessory', 'necklace', 'common', 90, 0, 2, { vitality: 2 }, 1),

  // Essencias (Fase 17)
  ...ESSENCES.map(essenceItem),
];

export const STARTING_INVENTORY: readonly { readonly itemId: string; readonly quantity: number }[] = [
  { itemId: 'item.weapon.short-sword', quantity: 1 },
  { itemId: 'item.armor.leather-vest', quantity: 1 },
  { itemId: 'item.tool.pickaxe', quantity: 1 },
  { itemId: 'item.tool.axe', quantity: 1 },
  { itemId: 'item.tool.sickle', quantity: 1 },
  { itemId: 'item.tool.fishing-rod', quantity: 1 },
  { itemId: 'item.tool.skin-knife', quantity: 1 },
  { itemId: 'item.potion.small', quantity: 5 },
  { itemId: 'item.seed.wheat', quantity: 6 },
  { itemId: 'item.seed.carrot', quantity: 6 },
  { itemId: 'item.seed.herb', quantity: 4 },
  { itemId: 'item.ore.iron', quantity: 10 },
  { itemId: 'item.wood.pine', quantity: 5 },
  { itemId: 'item.herb.mint', quantity: 5 },
];
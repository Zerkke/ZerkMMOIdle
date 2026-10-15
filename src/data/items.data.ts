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
  bonuses: Partial<{ hp: number; critChance: number; critDamage: number; hpRegen: number; lifesteal: number }> = {},
): ItemDefinition {
  // Essence slots por raridade (Fase 17)
  const slots = rarity === 'legendary' ? 3 : rarity === 'epic' ? 2 : rarity === 'rare' ? 1 : 0;
  return { ...BASE, id: asItemId(id), name, description: desc, category: cat, rarity, maxStack: 1, sellPrice: price,
    equipSlot: slot, attributeBonuses: { ...NO_BONUS, ...attrs }, attackPower: ap, defensePower: dp,
    requiredLevel: reqLvl, enhanceable: true, essenceSlots: slots,
    bonusHp: bonuses.hp,
    bonusCritChance: bonuses.critChance,
    bonusCritDamage: bonuses.critDamage,
    bonusHpRegen: bonuses.hpRegen,
    bonusLifesteal: bonuses.lifesteal };
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

  // Itens de protecao para melhoramento
  {
    ...BASE,
    id: asItemId('item.protection.stone'),
    name: 'Pedra de Protecao',
    description: 'Evita a destruicao do item quando um melhoramento falha. Consumida automaticamente.',
    category: 'material', rarity: 'epic', maxStack: 99, sellPrice: 5000,
  },

  // Trash loot (vendavel no NPC, escala com tier)
  mat('item.trash.tooth', 'Dente de Gosma', 'Restos de monstros fracos. Vendavel.', 3),
  mat('item.trash.rag', 'Pele Rasgada', 'Retalhos de couro arruinado.', 8),
  mat('item.trash.bone', 'Osso Antigo', 'Restos de um guerreiro esquecido.', 25),
  mat('item.trash.shard', 'Cristal Fragmentado', 'Estilhaco de cristal magico.', 80),
  mat('item.trash.scale', 'Escama Negra', 'Escama de criatura das sombras.', 250),
  mat('item.trash.relic', 'Reliquia Perdida', 'Reliquia de um deus esquecido.', 800),

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

  /* ==================== TIER FERRO (Nv 11) ==================== */
  equippable('item.weapon.iron-sword',      'Espada de Ferro',      'Lamina forjada em ferro.',             'weapon',    'weapon',    'uncommon',  1200,  35,   0, { strength: 14, vitality: 4 },  11),
  equippable('item.armor.iron-breastplate', 'Peitoral de Ferro',    'Protecao solida contra golpes.',       'armor',     'armor',     'uncommon',  1400,   0,  28, { vitality: 12, strength: 4 },  11),
  equippable('item.armor.iron-helm-t2',     'Elmo de Ferro Reforcado','Elmo pesado mas resistente.',         'armor',     'helmet',    'uncommon',   900,   0,  14, { vitality: 8 },                 11),
  equippable('item.offhand.iron-shield',    'Escudo de Ferro',      'Barreira solida contra ataques.',      'armor',     'offhand',   'uncommon',  1100,   0,  22, { vitality: 10 },                11),

  /* ==================== TIER ACO (Nv 21) ==================== */
  equippable('item.weapon.steel-sword',     'Espada de Aco',        'Corte afiado e duradouro.',            'weapon',    'weapon',    'rare',      3800,  90,   0, { strength: 30, agility: 8 },   21),
  equippable('item.armor.steel-cuirass',    'Couraca de Aco',       'Protecao equilibrada para veteranos.', 'armor',     'armor',     'rare',      4200,   0,  65, { vitality: 28, strength: 8 },  21),
  equippable('item.armor.steel-helm',       'Elmo de Aco',          'Cabeca protegida com precisao.',       'armor',     'helmet',    'rare',      2600,   0,  32, { vitality: 18 },                21),
  equippable('item.offhand.steel-shield',   'Escudo de Aco',        'Defesa que aguenta cercos.',           'armor',     'offhand',   'rare',      3200,   0,  55, { vitality: 22, strength: 4 },  21),

  /* ==================== TIER MITHRIL (Nv 31) ==================== */
  equippable('item.weapon.mithril-blade',   'Lamina de Mithril',    'Ligeira e mortal.',                    'weapon',    'weapon',    'epic',     11000, 220,   0, { strength: 65, agility: 20 },  31),
  equippable('item.armor.mithril-plate',    'Armadura de Mithril',  'Leve, mas resistente como pedra.',     'armor',     'armor',     'epic',     12000,   0, 150, { vitality: 55, agility: 15 },  31),
  equippable('item.offhand.mithril-shield', 'Escudo de Mithril',    'Peso reduzido, defesa maxima.',        'armor',     'offhand',   'epic',      9500,   0, 130, { vitality: 48 },                31),

  /* ==================== TIER ADAMANTE (Nv 41) ==================== */
  equippable('item.weapon.adamant-sword',   'Espada de Adamante',   'Corta metal como papel.',              'weapon',    'weapon',    'epic',     30000, 500,   0, { strength: 130, agility: 40 }, 41),
  equippable('item.armor.adamant-armor',    'Armadura de Adamante', 'Indestrutivel em combate.',            'armor',     'armor',     'epic',     32000,   0, 340, { vitality: 120, strength: 30 },41),
  equippable('item.offhand.adamant-shield', 'Escudo de Adamante',   'Barreira lendaria.',                   'armor',     'offhand',   'epic',     26000,   0, 300, { vitality: 100 },               41),

  /* ==================== TIER DRAGAO (Nv 51) END-GAME ==================== */
  equippable('item.weapon.dragon-sword',    'Espada do Dragao Eterno', 'Forjada com escamas de dragao. Pulsacao vital.', 'weapon', 'weapon',  'legendary', 120000, 1100, 0, { strength: 300, agility: 80 }, 51,
    { hp: 1500, critChance: 0.08, critDamage: 0.35, hpRegen: 25, lifesteal: 0.05 }),
  equippable('item.armor.dragon-plate',     'Peitoral do Dragao',   'Escamas que regeneram o portador.',    'armor',     'armor',     'legendary', 140000, 0, 720, { vitality: 260, strength: 60 }, 51,
    { hp: 2500, hpRegen: 30, critDamage: 0.1 }),
  equippable('item.offhand.dragon-shield',  'Escudo do Dragao',     'Aura protetora ancestral.',            'armor',     'offhand',   'legendary', 110000, 0, 640, { vitality: 220 },                51,
    { hp: 1800, hpRegen: 20, critChance: 0.03 }),
  equippable('item.armor.dragon-helm',      'Elmo do Dragao',       'Olhar que perfura armaduras.',         'armor',     'helmet',    'legendary',  90000, 0, 380, { vitality: 160, agility: 40 },  51,
    { hp: 1200, critChance: 0.05, critDamage: 0.15 }),

  /* ==================== TIER DIVINO (Nv 71) END-GAME FINAL ==================== */
  equippable('item.weapon.divine-blade',    'Lamina Divina Eterna', 'Nao pertence a este mundo.',           'weapon',    'weapon',    'legendary', 500000, 2600, 0, { strength: 700, agility: 200, vitality: 150 }, 71,
    { hp: 6000, critChance: 0.15, critDamage: 0.8, hpRegen: 80, lifesteal: 0.12 }),
  equippable('item.armor.titan-armor',      'Armadura do Tita Primordial', 'Forca de um deus antigo.',      'armor',     'armor',     'legendary', 550000, 0, 1600, { vitality: 650, strength: 200 }, 71,
    { hp: 12000, hpRegen: 120, critDamage: 0.2 }),
  equippable('item.offhand.void-shield',    'Escudo do Vazio Absoluto', 'Devolve o dano ao vazio.',         'armor',     'offhand',   'legendary', 480000, 0, 1400, { vitality: 550, strength: 150 }, 71,
    { hp: 9000, hpRegen: 90, critChance: 0.08, lifesteal: 0.06 }),

  /* ==================== TIER FERRO Ã¢â‚¬â€ CONJUNTO COMPLETO (Nv 11) ==================== */
  equippable('item.armor.iron-gauntlets',  'Manoplas de Ferro',    'Luvas reforcadas de ferro.',      'armor',     'gloves',   'uncommon',   700,   0,   9, { vitality: 6, strength: 3 },  11),
  equippable('item.armor.iron-boots',      'Botas de Ferro',       'Botas pesadas e resistentes.',    'armor',     'boots',    'uncommon',   850,   0,  11, { vitality: 7, strength: 2 },  11),
  equippable('item.ring.iron',             'Anel de Ferro',        'Anel forjado em ferro.',          'accessory', 'ring1',    'uncommon',   550,   7,   2, { strength: 5, vitality: 2 },  11),
  equippable('item.earring.iron',          'Brinco de Ferro',      'Brinco robusto de ferro.',        'accessory', 'earring1', 'uncommon',   500,   3,   3, { agility: 4, vitality: 2 },   11),
  equippable('item.necklace.iron',         'Colar de Ferro',       'Colar com pingente de ferro.',    'accessory', 'necklace', 'uncommon',   600,   5,   5, { vitality: 5 },                11),

  /* ==================== TIER ACO Ã¢â‚¬â€ CONJUNTO COMPLETO (Nv 21) ==================== */
  equippable('item.armor.steel-gauntlets', 'Manoplas de Aco',      'Luvas forjadas em aco.',          'armor',     'gloves',   'rare',      2200,   0,  22, { vitality: 14, strength: 8 }, 21),
  equippable('item.armor.steel-boots',     'Botas de Aco',         'Botas pesadas de aco.',           'armor',     'boots',    'rare',      2600,   0,  25, { vitality: 15, strength: 5 }, 21),
  equippable('item.ring.steel',            'Anel de Aco',          'Anel com gema de aco polido.',    'accessory', 'ring1',    'rare',      1800,  18,   5, { strength: 12, agility: 6 },  21),
  equippable('item.earring.steel',         'Brinco de Aco',        'Brinco com detalhe em aco.',      'accessory', 'earring1', 'rare',      1600,   9,   7, { agility: 10, vitality: 4 },  21),
  equippable('item.necklace.steel',        'Colar de Aco',         'Colar com pingente de aco.',      'accessory', 'necklace', 'rare',      1900,  14,  12, { vitality: 12, strength: 4 }, 21),

  /* ==================== TIER MITHRIL Ã¢â‚¬â€ CONJUNTO COMPLETO (Nv 31) ==================== */
  equippable('item.armor.mithril-helm',     'Elmo de Mithril',     'Elmo leve mas impenetravel.',     'armor',     'helmet',   'epic',      7500,   0,  95, { vitality: 42, agility: 10 }, 31),
  equippable('item.armor.mithril-gauntlets','Manoplas de Mithril', 'Luvas lendarias e leves.',        'armor',     'gloves',   'epic',      7000,   0,  58, { vitality: 30, agility: 14 }, 31),
  equippable('item.armor.mithril-boots',    'Botas de Mithril',    'Botas leves com grande defesa.',  'armor',     'boots',    'epic',      8000,   0,  62, { vitality: 34, agility: 12 }, 31),
  equippable('item.ring.mithril',           'Anel de Mithril',     'Anel com brilho prateado.',       'accessory', 'ring1',    'epic',      6000,  55,  15, { strength: 30, agility: 18 }, 31),
  equippable('item.earring.mithril',        'Brinco de Mithril',   'Brinco de pureza incomparavel.',  'accessory', 'earring1', 'epic',      5500,  30,  20, { agility: 24, vitality: 15 }, 31),
  equippable('item.necklace.mithril',       'Colar de Mithril',    'Colar reluzente e magico.',       'accessory', 'necklace', 'epic',      6500,  40,  30, { vitality: 32, agility: 12 }, 31),

  /* ==================== TIER ADAMANTE Ã¢â‚¬â€ CONJUNTO COMPLETO (Nv 41) ==================== */
  equippable('item.armor.adamant-helm',     'Elmo de Adamante',    'Elmo que abala montanhas.',       'armor',     'helmet',   'epic',     22000,   0, 210, { vitality: 95, strength: 30 }, 41),
  equippable('item.armor.adamant-gauntlets','Manoplas de Adamante', 'Luvas com forca brutal.',        'armor',     'gloves',   'epic',     20000,   0, 130, { vitality: 75, strength: 22 }, 41),
  equippable('item.armor.adamant-boots',    'Botas de Adamante',   'Botas de guerra indestrutiveis.', 'armor',     'boots',    'epic',     24000,   0, 145, { vitality: 80, strength: 18 }, 41),
  equippable('item.ring.adamant',           'Anel de Adamante',    'Anel com nucleo adamantino.',     'accessory', 'ring1',    'epic',     18000, 120,  35, { strength: 70, agility: 30 },  41),
  equippable('item.earring.adamant',        'Brinco de Adamante',  'Brinco pesado de adamante.',      'accessory', 'earring1', 'epic',     17000,  70,  45, { agility: 55, vitality: 25 },  41),
  equippable('item.necklace.adamant',       'Colar de Adamante',   'Colar que ainda guarda calor.',   'accessory', 'necklace', 'epic',     19000,  90,  70, { vitality: 72, strength: 20 }, 41),

  /* ==================== TIER DRAGAO Ã¢â‚¬â€ CONJUNTO COMPLETO (Nv 51) END-GAME ==================== */
  equippable('item.armor.dragon-gauntlets', 'Manoplas do Dragao',  'Garras de dragao em forma de manopla.', 'armor', 'gloves',   'legendary',  80000, 0, 260, { vitality: 130, strength: 50 }, 51,
    { hp: 700, hpRegen: 8, critChance: 0.02 }),
  equippable('item.armor.dragon-boots',     'Botas do Dragao',     'Botas forjadas com escamas anciÃƒÂ£s.',    'armor', 'boots',    'legendary',  95000, 0, 280, { vitality: 140, agility: 40 },  51,
    { hp: 900, hpRegen: 10 }),
  equippable('item.ring.dragon',            'Anel do Dragao',      'Anel pulsante com coracao de dragao.',  'accessory', 'ring1',    'legendary',  70000, 320, 90, { strength: 160, agility: 60 },  51,
    { hp: 600, critChance: 0.03, critDamage: 0.2 }),
  equippable('item.earring.dragon',         'Brinco do Dragao',    'Brinco que sussurra poder antigo.',     'accessory', 'earring1', 'legendary',  65000, 180, 110, { agility: 130, vitality: 70 },  51,
    { hp: 500, critDamage: 0.15 }),
  equippable('item.necklace.dragon',        'Colar do Dragao',     'Reliquia com escama eterna.',           'accessory', 'necklace', 'legendary',  75000, 240, 160, { vitality: 150, strength: 40 }, 51,
    { hp: 800, hpRegen: 12 }),

  /* ==================== TIER DIVINO Ã¢â‚¬â€ CONJUNTO COMPLETO (Nv 71) END-GAME FINAL ==================== */
  equippable('item.armor.divine-helm',      'Elmo Divino',         'Coroa de um deus guerreiro.',           'armor',     'helmet',   'legendary', 280000, 0, 750, { vitality: 380, strength: 120 }, 71,
    { hp: 3000, hpRegen: 40, critChance: 0.04 }),
  equippable('item.armor.divine-gauntlets', 'Manoplas Divinas',    'MÃƒÂ£os que moldam o destino.',            'armor',     'gloves',   'legendary', 250000, 0, 430, { vitality: 260, strength: 100 }, 71,
    { hp: 2200, critChance: 0.05, critDamage: 0.25 }),
  equippable('item.armor.divine-boots',     'Botas Divinas',       'Passos que ecoam na eternidade.',       'armor',     'boots',    'legendary', 260000, 0, 470, { vitality: 300, agility: 80 },   71,
    { hp: 2500, hpRegen: 35 }),
  equippable('item.ring.divine',            'Anel Divino',         'Anel forjado com luz do cosmos.',       'accessory', 'ring1',    'legendary', 240000, 850, 240, { strength: 400, agility: 150 },  71,
    { hp: 2000, critChance: 0.08, critDamage: 0.45 }),
  equippable('item.earring.divine',         'Brinco Divino',       'Brinco que cura o portador.',           'accessory', 'earring1', 'legendary', 220000, 500, 280, { agility: 320, vitality: 180 },  71,
    { hp: 1800, hpRegen: 25, lifesteal: 0.05 }),
  equippable('item.necklace.divine',        'Colar Divino',        'Reliquia dos tempos primordiais.',      'accessory', 'necklace', 'legendary', 260000, 620, 380, { vitality: 420, strength: 90 },  71,
    { hp: 2800, hpRegen: 50, critDamage: 0.3 }),

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
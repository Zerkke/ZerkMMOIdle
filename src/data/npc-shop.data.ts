import { asItemId } from '../domain/ids';
import type { ItemId } from '../domain/ids';

export interface NpcShopEntry {
  readonly itemId: ItemId;
  readonly buyPrice: number;    // quanto o NPC cobra por 1 unidade
  readonly stockPerPlayer: number; // quanto stock virtual o NPC tem (nao persistido)
}

/**
 * Catalogo da loja do NPC.
 * - `buyPrice` e o preco que o NPC cobra ao jogador.
 * - O NPC COMPRA ao jogador por `item.sellPrice * 0.5` (metade).
 * - Isto cria um sumidouro de moeda sempre que o jogador compra, e uma fonte
 *   moderada (50% do valor nominal) quando vende.
 */
export const NPC_SHOP: readonly NpcShopEntry[] = [
  // Consumiveis (essenciais)
  { itemId: asItemId('item.potion.small'), buyPrice: 40, stockPerPlayer: 999 },
  { itemId: asItemId('item.potion.mana'), buyPrice: 50, stockPerPlayer: 999 },
  { itemId: asItemId('item.food.bread'), buyPrice: 45, stockPerPlayer: 999 },

  // Sementes
  { itemId: asItemId('item.seed.wheat'), buyPrice: 20, stockPerPlayer: 999 },
  { itemId: asItemId('item.seed.carrot'), buyPrice: 25, stockPerPlayer: 999 },
  { itemId: asItemId('item.seed.herb'), buyPrice: 35, stockPerPlayer: 999 },

  // Ferramentas (reposicao)
  { itemId: asItemId('item.tool.pickaxe'), buyPrice: 250, stockPerPlayer: 5 },
  { itemId: asItemId('item.tool.axe'), buyPrice: 250, stockPerPlayer: 5 },
  { itemId: asItemId('item.tool.sickle'), buyPrice: 250, stockPerPlayer: 5 },
  { itemId: asItemId('item.tool.fishing-rod'), buyPrice: 300, stockPerPlayer: 5 },
  { itemId: asItemId('item.tool.skin-knife'), buyPrice: 320, stockPerPlayer: 5 },

  // Armas e equipamento base
  { itemId: asItemId('item.weapon.short-sword'), buyPrice: 500, stockPerPlayer: 3 },
  { itemId: asItemId('item.armor.leather-vest'), buyPrice: 400, stockPerPlayer: 3 },
  { itemId: asItemId('item.armor.leather-gloves'), buyPrice: 250, stockPerPlayer: 3 },
  { itemId: asItemId('item.armor.leather-boots'), buyPrice: 300, stockPerPlayer: 3 },
  { itemId: asItemId('item.offhand.wood-shield'), buyPrice: 280, stockPerPlayer: 3 },
  { itemId: asItemId('item.ring.bronze'), buyPrice: 220, stockPerPlayer: 3 },
  { itemId: asItemId('item.earring.silver'), buyPrice: 200, stockPerPlayer: 3 },
  { itemId: asItemId('item.necklace.copper'), buyPrice: 240, stockPerPlayer: 3 },
  // ==================== TIER FERRO (Nv 11) ====================
  { itemId: asItemId('item.weapon.iron-sword'),      buyPrice: 3000,  stockPerPlayer: 3 },
  { itemId: asItemId('item.armor.iron-breastplate'), buyPrice: 3500,  stockPerPlayer: 3 },
  { itemId: asItemId('item.armor.iron-helm-t2'),     buyPrice: 2200,  stockPerPlayer: 3 },
  { itemId: asItemId('item.offhand.iron-shield'),    buyPrice: 2800,  stockPerPlayer: 3 },

  // ==================== TIER ACO (Nv 21) ====================
  { itemId: asItemId('item.weapon.steel-sword'),     buyPrice: 12000, stockPerPlayer: 2 },
  { itemId: asItemId('item.armor.steel-cuirass'),    buyPrice: 13000, stockPerPlayer: 2 },
  { itemId: asItemId('item.armor.steel-helm'),       buyPrice: 8000,  stockPerPlayer: 2 },
  { itemId: asItemId('item.offhand.steel-shield'),   buyPrice: 10000, stockPerPlayer: 2 },

  // ==================== TIER MITHRIL (Nv 31) ====================
  { itemId: asItemId('item.weapon.mithril-blade'),   buyPrice: 45000, stockPerPlayer: 1 },
  { itemId: asItemId('item.armor.mithril-plate'),    buyPrice: 48000, stockPerPlayer: 1 },
  { itemId: asItemId('item.offhand.mithril-shield'), buyPrice: 38000, stockPerPlayer: 1 },

  // ==================== TIER ADAMANTE (Nv 41) ====================
  { itemId: asItemId('item.weapon.adamant-sword'),   buyPrice: 130000, stockPerPlayer: 1 },
  { itemId: asItemId('item.armor.adamant-armor'),    buyPrice: 140000, stockPerPlayer: 1 },
  { itemId: asItemId('item.offhand.adamant-shield'), buyPrice: 110000, stockPerPlayer: 1 },
  // ==================== CONJUNTO FERRO (Nv 11) ====================
  { itemId: asItemId('item.armor.iron-gauntlets'),   buyPrice: 1800,  stockPerPlayer: 3 },
  { itemId: asItemId('item.armor.iron-boots'),       buyPrice: 2200,  stockPerPlayer: 3 },
  { itemId: asItemId('item.ring.iron'),              buyPrice: 1400,  stockPerPlayer: 4 },
  { itemId: asItemId('item.earring.iron'),           buyPrice: 1200,  stockPerPlayer: 4 },
  { itemId: asItemId('item.necklace.iron'),          buyPrice: 1500,  stockPerPlayer: 4 },

  // ==================== CONJUNTO ACO (Nv 21) ====================
  { itemId: asItemId('item.armor.steel-gauntlets'),  buyPrice: 7000,  stockPerPlayer: 2 },
  { itemId: asItemId('item.armor.steel-boots'),      buyPrice: 8000,  stockPerPlayer: 2 },
  { itemId: asItemId('item.ring.steel'),             buyPrice: 5500,  stockPerPlayer: 3 },
  { itemId: asItemId('item.earring.steel'),          buyPrice: 5000,  stockPerPlayer: 3 },
  { itemId: asItemId('item.necklace.steel'),         buyPrice: 6000,  stockPerPlayer: 3 },

  // ==================== CONJUNTO MITHRIL (Nv 31) ====================
  { itemId: asItemId('item.armor.mithril-helm'),     buyPrice: 28000, stockPerPlayer: 1 },
  { itemId: asItemId('item.armor.mithril-gauntlets'),buyPrice: 26000, stockPerPlayer: 1 },
  { itemId: asItemId('item.armor.mithril-boots'),    buyPrice: 30000, stockPerPlayer: 1 },
  { itemId: asItemId('item.ring.mithril'),           buyPrice: 22000, stockPerPlayer: 2 },
  { itemId: asItemId('item.earring.mithril'),        buyPrice: 20000, stockPerPlayer: 2 },
  { itemId: asItemId('item.necklace.mithril'),       buyPrice: 24000, stockPerPlayer: 2 },

  // ==================== CONJUNTO ADAMANTE (Nv 41) ====================
  { itemId: asItemId('item.armor.adamant-helm'),     buyPrice: 80000,  stockPerPlayer: 1 },
  { itemId: asItemId('item.armor.adamant-gauntlets'),buyPrice: 75000,  stockPerPlayer: 1 },
  { itemId: asItemId('item.armor.adamant-boots'),    buyPrice: 85000,  stockPerPlayer: 1 },
  { itemId: asItemId('item.ring.adamant'),           buyPrice: 65000,  stockPerPlayer: 1 },
  { itemId: asItemId('item.earring.adamant'),        buyPrice: 60000,  stockPerPlayer: 1 },
  { itemId: asItemId('item.necklace.adamant'),       buyPrice: 70000,  stockPerPlayer: 1 },

  // Protecao de melhoramento
  { itemId: asItemId('item.protection.stone'), buyPrice: 8000, stockPerPlayer: 20 },
];

export function findShopEntry(itemId: ItemId): NpcShopEntry | undefined {
  return NPC_SHOP.find((e) => e.itemId === itemId);
}

/** Preco que o NPC paga ao jogador por 1 unidade do item. */
export function npcBuybackPrice(itemSellPrice: number): number {
  return Math.max(1, Math.floor(itemSellPrice * 0.5));
}
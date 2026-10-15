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
];

export function findShopEntry(itemId: ItemId): NpcShopEntry | undefined {
  return NPC_SHOP.find((e) => e.itemId === itemId);
}

/** Preco que o NPC paga ao jogador por 1 unidade do item. */
export function npcBuybackPrice(itemSellPrice: number): number {
  return Math.max(1, Math.floor(itemSellPrice * 0.5));
}
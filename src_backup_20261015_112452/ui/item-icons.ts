import type { IconName } from './icons';

export interface ItemVisual {
  readonly icon: IconName;
  readonly tint: string;
}

/**
 * Mapa de itemId -> visual especifico.
 * Cai para fallback por categoria se nao houver entrada exacta.
 */
const ITEM_VISUALS: Record<string, ItemVisual> = {
  // Minerios
  'item.ore.iron': { icon: 'ore', tint: '#8a7a6a' },
  'item.ore.copper': { icon: 'ore', tint: '#b8763a' },

  // Madeiras
  'item.wood.pine': { icon: 'plank', tint: '#8a6a3a' },
  'item.wood.oak': { icon: 'plank', tint: '#6a4a2a' },
  'item.plank.pine': { icon: 'plank', tint: '#a08050' },

  // Ervas
  'item.herb.mint': { icon: 'leaf', tint: '#6ab87a' },
  'item.herb.lavender': { icon: 'flower', tint: '#a86ec8' },

  // Barras
  'item.ingot.iron': { icon: 'ingot', tint: '#a8a8b0' },

  // Sementes / colheitas
  'item.seed.wheat': { icon: 'seed', tint: '#d4b85a' },
  'item.seed.carrot': { icon: 'seed', tint: '#d4804e' },
  'item.seed.herb': { icon: 'seed', tint: '#6ab87a' },
  'item.crop.wheat': { icon: 'wheat', tint: '#e8c878' },
  'item.crop.carrot': { icon: 'apple', tint: '#e89040' },
  'item.crop.mint-fresh': { icon: 'leaf', tint: '#a8e0b8' },

  // Peixes
  'item.fish.sardine': { icon: 'fish', tint: '#b8c8d8' },
  'item.fish.trout': { icon: 'fish', tint: '#d898a8' },
  'item.fish.golden-koi': { icon: 'fish', tint: '#e8c878' },

  // Carnes / couros
  'item.meat.rabbit': { icon: 'meat', tint: '#d8a0a8' },
  'item.meat.boar': { icon: 'meat', tint: '#b87878' },
  'item.hide.boar': { icon: 'cloth', tint: '#8a6a4a' },
  'item.hide.wolf': { icon: 'cloth', tint: '#5a5a6a' },

  // Consumiveis
  'item.potion.small': { icon: 'flask', tint: '#d84848' },
  'item.potion.mana': { icon: 'flask', tint: '#4878d8' },
  'item.food.stew': { icon: 'bowl', tint: '#a07030' },
  'item.food.bread': { icon: 'bread', tint: '#d4a86a' },
  'item.elixir.processing': { icon: 'flask', tint: '#8ad4a8' },
  'item.elixir.crit': { icon: 'flask', tint: '#e8c848' },

  // Ferramentas
  'item.tool.pickaxe': { icon: 'pickaxe', tint: '#a8b8c8' },
  'item.tool.axe': { icon: 'axe', tint: '#a8b8c8' },
  'item.tool.sickle': { icon: 'sword', tint: '#a8b8c8' },
  'item.tool.fishing-rod': { icon: 'fish', tint: '#a8b8c8' },
  'item.tool.skin-knife': { icon: 'sword', tint: '#a8b8c8' },

  // Armas
  'item.weapon.short-sword': { icon: 'sword', tint: '#d0d0e0' },
  'item.weapon.hunting-bow': { icon: 'bow', tint: '#8a6a3a' },
  'item.weapon.iron-greatsword': { icon: 'swords', tint: '#d0d0e0' },

  // Armaduras
  'item.armor.leather-vest': { icon: 'armor', tint: '#a07450' },
  'item.armor.iron-helm': { icon: 'armor', tint: '#a8b0b8' },
  'item.armor.leather-gloves': { icon: 'armor', tint: '#a07450' },
  'item.armor.leather-boots': { icon: 'armor', tint: '#a07450' },
  'item.offhand.wood-shield': { icon: 'shield', tint: '#8a6a3a' },

  // Acessorios
  'item.ring.bronze': { icon: 'ring', tint: '#c89040' },
  'item.earring.silver': { icon: 'ring', tint: '#d0d0d8' },
  'item.necklace.copper': { icon: 'ring', tint: '#b8763a' },
};

const CATEGORY_FALLBACKS: Record<string, ItemVisual> = {
  material: { icon: 'ore', tint: '#8a8a9a' },
  consumable: { icon: 'flask', tint: '#a86060' },
  weapon: { icon: 'sword', tint: '#c0c0d0' },
  armor: { icon: 'armor', tint: '#8a8a9a' },
  accessory: { icon: 'ring', tint: '#c8a850' },
  tool: { icon: 'hammer', tint: '#a8b8c8' },
  seed: { icon: 'seed', tint: '#d4b85a' },
  crop: { icon: 'apple', tint: '#d4804e' },
  fish: { icon: 'fish', tint: '#b8c8d8' },
  meat: { icon: 'meat', tint: '#b87878' },
};

export function getItemVisual(itemId: string, category: string): ItemVisual {
  return ITEM_VISUALS[itemId] ?? CATEGORY_FALLBACKS[category] ?? { icon: 'chest', tint: '#8a8a9a' };
}

/* ==================== Raridade ==================== */

export interface RarityVisual {
  readonly border: string;
  readonly glow: string;
  readonly label: string;
}

const RARITY_VISUALS: Record<string, RarityVisual> = {
  common: { border: 'rgba(154, 140, 184, 0.4)', glow: 'transparent', label: 'Comum' },
  uncommon: { border: 'rgba(106, 184, 122, 0.7)', glow: 'rgba(106, 184, 122, 0.18)', label: 'Incomum' },
  rare: { border: 'rgba(90, 159, 212, 0.85)', glow: 'rgba(90, 159, 212, 0.25)', label: 'Raro' },
  epic: { border: 'rgba(168, 98, 204, 0.9)', glow: 'rgba(168, 98, 204, 0.32)', label: 'Epico' },
  legendary: { border: 'rgba(232, 168, 70, 1)', glow: 'rgba(232, 168, 70, 0.4)', label: 'Lendario' },
};

export function getRarityVisual(rarity: string): RarityVisual {
  return RARITY_VISUALS[rarity] ?? RARITY_VISUALS.common!;
}
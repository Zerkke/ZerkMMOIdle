import { asItemId, asProfessionId, asRecipeId } from '../domain/ids';
import type { Recipe } from '../domain/lifeskill/types';

export const DEMO_RECIPES: readonly Recipe[] = [
  // ============ PROCESSAMENTO ============
  {
    id: asRecipeId('recipe.iron-ingot'), name: 'Fundir Ferro', description: 'Transforma minerio em barra.',
    kind: 'processing', professionId: asProfessionId('profession.processing'), requiredLevel: 1,
    inputs: [{ itemId: asItemId('item.ore.iron'), quantity: 3 }],
    outputs: [{ itemId: asItemId('item.ingot.iron'), quantity: 1, chance: 1.0 }],
    silverCost: 10, baseTimeMs: 1500, baseExp: 6, maxBatches: 50,
  },
  {
    id: asRecipeId('recipe.pine-plank'), name: 'Serra de Pinheiro', description: 'Corta madeira em tabuas.',
    kind: 'processing', professionId: asProfessionId('profession.processing'), requiredLevel: 1,
    inputs: [{ itemId: asItemId('item.wood.pine'), quantity: 2 }],
    outputs: [{ itemId: asItemId('item.plank.pine'), quantity: 1, chance: 1.0 }],
    silverCost: 5, baseTimeMs: 1000, baseExp: 4, maxBatches: 50,
  },

  // ============ CRAFTING: FERRAMENTAS ============
  {
    id: asRecipeId('recipe.tool-pickaxe'), name: 'Picareta de Ferro', description: 'Ferramenta essencial para mineracao.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 1,
    inputs: [
      { itemId: asItemId('item.wood.pine'), quantity: 4 },
      { itemId: asItemId('item.ingot.iron'), quantity: 3 },
    ],
    outputs: [{ itemId: asItemId('item.tool.pickaxe'), quantity: 1, chance: 1.0 }],
    silverCost: 80, baseTimeMs: 4000, baseExp: 20, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.tool-axe'), name: 'Machado de Ferro', description: 'Ferramenta essencial para corte de madeira.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 1,
    inputs: [
      { itemId: asItemId('item.wood.pine'), quantity: 4 },
      { itemId: asItemId('item.ingot.iron'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.tool.axe'), quantity: 1, chance: 1.0 }],
    silverCost: 60, baseTimeMs: 3500, baseExp: 18, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.tool-sickle'), name: 'Foice de Ferro', description: 'Ferramenta essencial para herbalismo.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 1,
    inputs: [
      { itemId: asItemId('item.wood.pine'), quantity: 3 },
      { itemId: asItemId('item.ingot.iron'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.tool.sickle'), quantity: 1, chance: 1.0 }],
    silverCost: 50, baseTimeMs: 3000, baseExp: 15, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.tool-fishing-rod'), name: 'Cana de Pesca', description: 'Ferramenta essencial para pesca.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 1,
    inputs: [
      { itemId: asItemId('item.wood.pine'), quantity: 5 },
      { itemId: asItemId('item.ingot.iron'), quantity: 1 },
    ],
    outputs: [{ itemId: asItemId('item.tool.fishing-rod'), quantity: 1, chance: 1.0 }],
    silverCost: 40, baseTimeMs: 2500, baseExp: 12, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.tool-skin-knife'), name: 'Faca de Esfolar', description: 'Ferramenta essencial para caca.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 1,
    inputs: [
      { itemId: asItemId('item.wood.pine'), quantity: 2 },
      { itemId: asItemId('item.ingot.iron'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.tool.skin-knife'), quantity: 1, chance: 1.0 }],
    silverCost: 55, baseTimeMs: 3000, baseExp: 16, maxBatches: 5,
  },

  // ============ CRAFTING: EQUIPAMENTO ============
  {
    id: asRecipeId('recipe.leather-vest'), name: 'Colete de Couro', description: 'Costura um colete.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 1,
    inputs: [
      { itemId: asItemId('item.plank.pine'), quantity: 2 },
      { itemId: asItemId('item.herb.mint'), quantity: 3 },
    ],
    outputs: [{ itemId: asItemId('item.armor.leather-vest'), quantity: 1, chance: 1.0 }],
    silverCost: 50, baseTimeMs: 3000, baseExp: 15, maxBatches: 10,
  },
  {
    id: asRecipeId('recipe.short-sword'), name: 'Espada Curta', description: 'Forja uma espada.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 2,
    inputs: [
      { itemId: asItemId('item.ingot.iron'), quantity: 3 },
      { itemId: asItemId('item.wood.pine'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.weapon.short-sword'), quantity: 1, chance: 1.0 }],
    silverCost: 120, baseTimeMs: 5000, baseExp: 30, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.wood-shield'), name: 'Escudo de Madeira', description: 'Escudo basico de madeira.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 1,
    inputs: [
      { itemId: asItemId('item.plank.pine'), quantity: 3 },
      { itemId: asItemId('item.hide.boar'), quantity: 1 },
    ],
    outputs: [{ itemId: asItemId('item.offhand.wood-shield'), quantity: 1, chance: 1.0 }],
    silverCost: 60, baseTimeMs: 3000, baseExp: 18, maxBatches: 5,
  },

  // ============ COZINHA ============
  {
    id: asRecipeId('recipe.bread'), name: 'Pao de Trigo', description: 'Pao simples que acelera a recolha.',
    kind: 'cooking', professionId: asProfessionId('profession.cooking'), requiredLevel: 1,
    inputs: [{ itemId: asItemId('item.crop.wheat'), quantity: 3 }],
    outputs: [{ itemId: asItemId('item.food.bread'), quantity: 1, chance: 1.0 }],
    silverCost: 15, baseTimeMs: 2000, baseExp: 8, maxBatches: 20,
  },
  {
    id: asRecipeId('recipe.stew'), name: 'Guisado Forte', description: 'Reforca o ataque.',
    kind: 'cooking', professionId: asProfessionId('profession.cooking'), requiredLevel: 3,
    inputs: [
      { itemId: asItemId('item.meat.rabbit'), quantity: 2 },
      { itemId: asItemId('item.crop.carrot'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.food.stew'), quantity: 1, chance: 1.0 }],
    silverCost: 30, baseTimeMs: 3500, baseExp: 18, maxBatches: 10,
  },
  {
    id: asRecipeId('recipe.boar-feast'), name: 'Banquete de Javali', description: 'Comida robusta em quantidade.',
    kind: 'cooking', professionId: asProfessionId('profession.cooking'), requiredLevel: 5,
    inputs: [
      { itemId: asItemId('item.meat.boar'), quantity: 3 },
      { itemId: asItemId('item.crop.carrot'), quantity: 3 },
    ],
    outputs: [{ itemId: asItemId('item.food.stew'), quantity: 3, chance: 1.0 }],
    silverCost: 80, baseTimeMs: 5000, baseExp: 40, maxBatches: 5,
  },

  // ============ ALQUIMIA ============
  {
    id: asRecipeId('recipe.potion-small'), name: 'Pocao Menor', description: 'Recupera HP.',
    kind: 'alchemy', professionId: asProfessionId('profession.alchemy'), requiredLevel: 1,
    inputs: [{ itemId: asItemId('item.herb.mint'), quantity: 2 }],
    outputs: [{ itemId: asItemId('item.potion.small'), quantity: 1, chance: 1.0 }],
    silverCost: 15, baseTimeMs: 1500, baseExp: 6, maxBatches: 20,
  },
  {
    id: asRecipeId('recipe.potion-mana'), name: 'Pocao de Foco', description: 'Recupera recurso.',
    kind: 'alchemy', professionId: asProfessionId('profession.alchemy'), requiredLevel: 2,
    inputs: [
      { itemId: asItemId('item.herb.lavender'), quantity: 2 },
      { itemId: asItemId('item.crop.mint-fresh'), quantity: 1 },
    ],
    outputs: [{ itemId: asItemId('item.potion.mana'), quantity: 1, chance: 1.0 }],
    silverCost: 25, baseTimeMs: 2000, baseExp: 12, maxBatches: 15,
  },
  {
    id: asRecipeId('recipe.elixir-crit'), name: 'Elixir da Precisao', description: 'Aumenta o critico.',
    kind: 'alchemy', professionId: asProfessionId('profession.alchemy'), requiredLevel: 4,
    inputs: [
      { itemId: asItemId('item.herb.lavender'), quantity: 3 },
      { itemId: asItemId('item.fish.golden-koi'), quantity: 1 },
    ],
    outputs: [{ itemId: asItemId('item.elixir.crit'), quantity: 1, chance: 0.9 }],
    silverCost: 60, baseTimeMs: 4000, baseExp: 35, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.elixir-processing'), name: 'Elixir de Oficio', description: 'Acelera o processamento.',
    kind: 'alchemy', professionId: asProfessionId('profession.alchemy'), requiredLevel: 3,
    inputs: [
      { itemId: asItemId('item.hide.boar'), quantity: 2 },
      { itemId: asItemId('item.herb.lavender'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.elixir.processing'), quantity: 1, chance: 1.0 }],
    silverCost: 45, baseTimeMs: 3000, baseExp: 22, maxBatches: 8,
  },
  // ============ CRAFTING: TIER FERRO (Nv 11) ============
  {
    id: asRecipeId('recipe.iron-sword'), name: 'Espada de Ferro', description: 'Forja uma espada de ferro.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 10,
    inputs: [
      { itemId: asItemId('item.ingot.iron'), quantity: 8 },
      { itemId: asItemId('item.plank.pine'), quantity: 4 },
    ],
    outputs: [{ itemId: asItemId('item.weapon.iron-sword'), quantity: 1, chance: 1.0 }],
    silverCost: 500, baseTimeMs: 8000, baseExp: 80, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.iron-breastplate'), name: 'Peitoral de Ferro', description: 'Forja um peitoral.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 10,
    inputs: [
      { itemId: asItemId('item.ingot.iron'), quantity: 12 },
      { itemId: asItemId('item.hide.boar'), quantity: 3 },
    ],
    outputs: [{ itemId: asItemId('item.armor.iron-breastplate'), quantity: 1, chance: 1.0 }],
    silverCost: 700, baseTimeMs: 10000, baseExp: 100, maxBatches: 5,
  },
  {
    id: asRecipeId('recipe.iron-shield'), name: 'Escudo de Ferro', description: 'Forja um escudo.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 10,
    inputs: [
      { itemId: asItemId('item.ingot.iron'), quantity: 10 },
      { itemId: asItemId('item.plank.pine'), quantity: 5 },
    ],
    outputs: [{ itemId: asItemId('item.offhand.iron-shield'), quantity: 1, chance: 1.0 }],
    silverCost: 600, baseTimeMs: 9000, baseExp: 90, maxBatches: 5,
  },

  // ============ CRAFTING: TIER ACO (Nv 21) ============
  {
    id: asRecipeId('recipe.steel-sword'), name: 'Espada de Aco', description: 'Forja uma espada de aco.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 20,
    inputs: [
      { itemId: asItemId('item.weapon.iron-sword'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 25 },
      { itemId: asItemId('item.ore.copper'), quantity: 15 },
    ],
    outputs: [{ itemId: asItemId('item.weapon.steel-sword'), quantity: 1, chance: 1.0 }],
    silverCost: 3000, baseTimeMs: 15000, baseExp: 250, maxBatches: 3,
  },
  {
    id: asRecipeId('recipe.steel-cuirass'), name: 'Couraca de Aco', description: 'Forja uma couraca.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 20,
    inputs: [
      { itemId: asItemId('item.armor.iron-breastplate'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 30 },
      { itemId: asItemId('item.hide.wolf'), quantity: 5 },
    ],
    outputs: [{ itemId: asItemId('item.armor.steel-cuirass'), quantity: 1, chance: 1.0 }],
    silverCost: 3500, baseTimeMs: 18000, baseExp: 300, maxBatches: 3,
  },
  {
    id: asRecipeId('recipe.steel-shield'), name: 'Escudo de Aco', description: 'Forja um escudo de aco.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 20,
    inputs: [
      { itemId: asItemId('item.offhand.iron-shield'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 20 },
      { itemId: asItemId('item.plank.pine'), quantity: 10 },
    ],
    outputs: [{ itemId: asItemId('item.offhand.steel-shield'), quantity: 1, chance: 1.0 }],
    silverCost: 2800, baseTimeMs: 16000, baseExp: 280, maxBatches: 3,
  },

  // ============ CRAFTING: TIER MITHRIL (Nv 31) ============
  {
    id: asRecipeId('recipe.mithril-blade'), name: 'Lamina de Mithril', description: 'Forja uma lamina lendaria.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 30,
    inputs: [
      { itemId: asItemId('item.weapon.steel-sword'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 60 },
      { itemId: asItemId('item.essence.power.t2'), quantity: 3 },
    ],
    outputs: [{ itemId: asItemId('item.weapon.mithril-blade'), quantity: 1, chance: 1.0 }],
    silverCost: 15000, baseTimeMs: 25000, baseExp: 800, maxBatches: 2,
  },
  {
    id: asRecipeId('recipe.mithril-plate'), name: 'Armadura de Mithril', description: 'Forja uma armadura.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 30,
    inputs: [
      { itemId: asItemId('item.armor.steel-cuirass'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 70 },
      { itemId: asItemId('item.essence.guard.t2'), quantity: 3 },
    ],
    outputs: [{ itemId: asItemId('item.armor.mithril-plate'), quantity: 1, chance: 1.0 }],
    silverCost: 18000, baseTimeMs: 28000, baseExp: 900, maxBatches: 2,
  },

  // ============ CRAFTING: TIER ADAMANTE (Nv 41) ============
  {
    id: asRecipeId('recipe.adamant-sword'), name: 'Espada de Adamante', description: 'Forja uma espada indestrutivel.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 40,
    inputs: [
      { itemId: asItemId('item.weapon.mithril-blade'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 150 },
      { itemId: asItemId('item.essence.power.t3'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.weapon.adamant-sword'), quantity: 1, chance: 0.9 }],
    silverCost: 50000, baseTimeMs: 40000, baseExp: 2500, maxBatches: 2,
  },
  {
    id: asRecipeId('recipe.adamant-armor'), name: 'Armadura de Adamante', description: 'Forja uma armadura impenetravel.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 40,
    inputs: [
      { itemId: asItemId('item.armor.mithril-plate'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 180 },
      { itemId: asItemId('item.essence.guard.t3'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.armor.adamant-armor'), quantity: 1, chance: 0.9 }],
    silverCost: 55000, baseTimeMs: 45000, baseExp: 2800, maxBatches: 2,
  },
  {
    id: asRecipeId('recipe.adamant-shield'), name: 'Escudo de Adamante', description: 'Forja um escudo lendario.',
    kind: 'crafting', professionId: asProfessionId('profession.crafting'), requiredLevel: 40,
    inputs: [
      { itemId: asItemId('item.offhand.mithril-shield'), quantity: 1 },
      { itemId: asItemId('item.ingot.iron'), quantity: 140 },
      { itemId: asItemId('item.essence.guard.t3'), quantity: 2 },
    ],
    outputs: [{ itemId: asItemId('item.offhand.adamant-shield'), quantity: 1, chance: 0.9 }],
    silverCost: 45000, baseTimeMs: 38000, baseExp: 2200, maxBatches: 2,
  },
];
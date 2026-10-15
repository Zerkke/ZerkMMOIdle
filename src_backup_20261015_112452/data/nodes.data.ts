import { asItemId, asNodeId, asProfessionId, asZoneId } from '../domain/ids';
import type { GatheringNode } from '../domain/lifeskill/types';

export const DEMO_NODES: readonly GatheringNode[] = [
  // Mineracao
  {
    id: asNodeId('node.iron-vein'), name: 'Veio de Ferro', description: '[DEMO] Deposito de ferro.',
    professionId: asProfessionId('profession.mining'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'gathering', requiredTool: 'pickaxe', requiredLevel: 1, baseTimeMs: 2500, baseExp: 5,
    loot: [
      { itemId: asItemId('item.ore.iron'), chance: 1.0, minQuantity: 1, maxQuantity: 2 },
      { itemId: asItemId('item.ore.copper'), chance: 0.25, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  // Corte
  {
    id: asNodeId('node.pine-tree'), name: 'Pinheiro', description: '[DEMO] Arvore comum.',
    professionId: asProfessionId('profession.woodcutting'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'gathering', requiredTool: 'axe', requiredLevel: 1, baseTimeMs: 3000, baseExp: 5,
    loot: [
      { itemId: asItemId('item.wood.pine'), chance: 1.0, minQuantity: 1, maxQuantity: 2 },
      { itemId: asItemId('item.wood.oak'), chance: 0.15, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  // Herbalismo
  {
    id: asNodeId('node.mint-patch'), name: 'Mato de Menta', description: '[DEMO] Erva aromatica.',
    professionId: asProfessionId('profession.herbalism'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'gathering', requiredTool: 'sickle', requiredLevel: 1, baseTimeMs: 2000, baseExp: 4,
    loot: [
      { itemId: asItemId('item.herb.mint'), chance: 1.0, minQuantity: 1, maxQuantity: 3 },
      { itemId: asItemId('item.herb.lavender'), chance: 0.12, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  // Pesca
  {
    id: asNodeId('node.fishing-pond'), name: 'Lago Calmo', description: '[DEMO] Agua doce.',
    professionId: asProfessionId('profession.fishing'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'fishing', requiredTool: 'fishing_rod', requiredLevel: 1, baseTimeMs: 3500, baseExp: 6,
    loot: [
      { itemId: asItemId('item.fish.sardine'), chance: 0.9, minQuantity: 1, maxQuantity: 2 },
      { itemId: asItemId('item.fish.trout'), chance: 0.3, minQuantity: 1, maxQuantity: 1 },
      { itemId: asItemId('item.fish.golden-koi'), chance: 0.02, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  {
    id: asNodeId('node.fishing-river'), name: 'Rio Rapido', description: '[DEMO] Agua corrente.',
    professionId: asProfessionId('profession.fishing'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'fishing', requiredTool: 'fishing_rod', requiredLevel: 3, baseTimeMs: 4500, baseExp: 10,
    loot: [
      { itemId: asItemId('item.fish.trout'), chance: 0.8, minQuantity: 1, maxQuantity: 2 },
      { itemId: asItemId('item.fish.golden-koi'), chance: 0.06, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  // Caca
  {
    id: asNodeId('node.rabbit-field'), name: 'Campo de Coelhos', description: '[DEMO] Caca menor.',
    professionId: asProfessionId('profession.hunting'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'hunting', requiredTool: 'skin_knife', requiredLevel: 1, baseTimeMs: 3000, baseExp: 6,
    loot: [
      { itemId: asItemId('item.meat.rabbit'), chance: 1.0, minQuantity: 1, maxQuantity: 2 },
    ],
  },
  {
    id: asNodeId('node.boar-woods'), name: 'Bosque dos Javalis', description: '[DEMO] Caca media.',
    professionId: asProfessionId('profession.hunting'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'hunting', requiredTool: 'skin_knife', requiredLevel: 3, baseTimeMs: 4500, baseExp: 12,
    loot: [
      { itemId: asItemId('item.meat.boar'), chance: 0.9, minQuantity: 1, maxQuantity: 2 },
      { itemId: asItemId('item.hide.boar'), chance: 0.4, minQuantity: 1, maxQuantity: 1 },
    ],
  },
  // Culturas (usados pela agricultura, nao por gathering direto)
  {
    id: asNodeId('node.crop.wheat'), name: 'Trigo', description: '[DEMO] Cultura de trigo.',
    professionId: asProfessionId('profession.agriculture'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'crop', requiredTool: null, requiredLevel: 1, baseTimeMs: 60000, baseExp: 8,
    loot: [{ itemId: asItemId('item.crop.wheat'), chance: 1.0, minQuantity: 2, maxQuantity: 4 }],
  },
  {
    id: asNodeId('node.crop.carrot'), name: 'Cenoura', description: '[DEMO] Cultura de cenoura.',
    professionId: asProfessionId('profession.agriculture'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'crop', requiredTool: null, requiredLevel: 1, baseTimeMs: 45000, baseExp: 6,
    loot: [{ itemId: asItemId('item.crop.carrot'), chance: 1.0, minQuantity: 2, maxQuantity: 4 }],
  },
  {
    id: asNodeId('node.crop.mint'), name: 'Erva Cultivada', description: '[DEMO] Cultura de erva.',
    professionId: asProfessionId('profession.agriculture'), zoneId: asZoneId('zone.ash-valley'),
    kind: 'crop', requiredTool: null, requiredLevel: 2, baseTimeMs: 90000, baseExp: 12,
    loot: [{ itemId: asItemId('item.crop.mint-fresh'), chance: 1.0, minQuantity: 3, maxQuantity: 5 }],
  },
];
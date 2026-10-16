import type { DungeonDefinition } from '../domain/dungeons/types';

export const DUNGEONS: readonly DungeonDefinition[] = [
  {
    id: 'dungeon.slime-nest',
    name: 'Ninho das Gosmas',
    description: 'Caverna humida infestada de gosmas. Nivel de entrada para aventureiros.',
    icon: 'droplet',
    accentColor: '#6ab87a',
    requiredLevel: 8,
    recommendedAp: 30,
    recommendedDp: 20,
    entryCost: 200,
    timeLimitMs: 5 * 60 * 1000,
    waves: [
      {
        label: 'Enxame',
        isBoss: false,
        monsters: [
          { monsterId: 'monster.slime-iron', count: 3 },
          { monsterId: 'monster.forest-crawler', count: 2 },
        ],
      },
      {
        label: 'Guardas',
        isBoss: false,
        monsters: [
          { monsterId: 'monster.ash-wolf', count: 3 },
        ],
      },
      {
        label: 'Lider',
        isBoss: true,
        monsters: [
          { monsterId: 'monster.boss.ash-wolf-alpha', count: 1 },
        ],
      },
    ],
    completionSilver: 800,
    completionXp: 400,
    completionLoot: [
      { itemId: 'item.ore.iron', chance: 1.0, minQuantity: 5, maxQuantity: 10 },
      { itemId: 'item.herb.mint', chance: 0.6, minQuantity: 3, maxQuantity: 6 },
    ],
    firstClearBonus: {
      silver: 500,
      xp: 200,
      items: [{ itemId: 'item.weapon.iron-sword', quantity: 1 }],
    },
  },
  {
    id: 'dungeon.crystal-depths',
    name: 'Profundezas de Cristal',
    description: 'Cavernas onde a luz se torna arma. Golems e arainhas guardam o trono.',
    icon: 'gem',
    accentColor: '#6a9ad8',
    requiredLevel: 18,
    recommendedAp: 90,
    recommendedDp: 55,
    entryCost: 2000,
    timeLimitMs: 8 * 60 * 1000,
    waves: [
      {
        label: 'Primeira Barreira',
        isBoss: false,
        monsters: [
          { monsterId: 'monster.stone-golem', count: 2 },
          { monsterId: 'monster.crystal-spider', count: 3 },
        ],
      },
      {
        label: 'Emboscada',
        isBoss: false,
        monsters: [
          { monsterId: 'monster.crystal-spider', count: 5 },
        ],
      },
      {
        label: 'Anciao',
        isBoss: false,
        monsters: [
          { monsterId: 'monster.ancient-wyrm', count: 2 },
        ],
      },
      {
        label: 'Rainha',
        isBoss: true,
        monsters: [
          { monsterId: 'monster.boss.crystal-queen', count: 1 },
        ],
      },
    ],
    completionSilver: 6000,
    completionXp: 2500,
    completionLoot: [
      { itemId: 'item.ingot.iron', chance: 1.0, minQuantity: 5, maxQuantity: 12 },
      { itemId: 'item.essence.power.t1', chance: 0.4, minQuantity: 1, maxQuantity: 2 },
    ],
    firstClearBonus: {
      silver: 4000,
      xp: 1500,
      items: [{ itemId: 'item.weapon.iron-greatsword', quantity: 1 }],
    },
  },
  {
    id: 'dungeon.ruined-throne',
    name: 'Trono em Ruinas',
    description: 'O ultimo reduto dos antigos campeoes. Requer preparacao seria.',
    icon: 'flame',
    accentColor: '#c85858',
    requiredLevel: 30,
    recommendedAp: 220,
    recommendedDp: 140,
    entryCost: 15000,
    timeLimitMs: 12 * 60 * 1000,
    waves: [
      {
        label: 'Guardas Mortos',
        isBoss: false,
        monsters: [
          { monsterId: 'monster.ruin-skeleton', count: 4 },
        ],
      },
      {
        label: 'Cavalaria Amaldicoada',
        isBoss: false,
        monsters: [
          { monsterId: 'monster.cursed-knight', count: 3 },
        ],
      },
      {
        label: 'Campeao',
        isBoss: true,
        monsters: [
          { monsterId: 'monster.boss.citadel-warlord', count: 1 },
        ],
      },
    ],
    completionSilver: 40000,
    completionXp: 12000,
    completionLoot: [
      { itemId: 'item.trash.scale', chance: 1.0, minQuantity: 8, maxQuantity: 15 },
      { itemId: 'item.essence.power.t2', chance: 0.5, minQuantity: 1, maxQuantity: 2 },
      { itemId: 'item.essence.guard.t2', chance: 0.4, minQuantity: 1, maxQuantity: 2 },
    ],
    firstClearBonus: {
      silver: 25000,
      xp: 8000,
      items: [{ itemId: 'item.weapon.steel-sword', quantity: 1 }],
    },
  },
];
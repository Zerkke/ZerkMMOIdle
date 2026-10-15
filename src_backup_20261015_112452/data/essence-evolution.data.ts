import { asItemId } from '../domain/ids';
import type {
  EssenceEvolutionConfig,
  EssenceKind,
  EssenceUnlock,
  UpgradeCost,
} from '../domain/essence/types';

const IRON = asItemId('item.ore.iron');
const LAVENDER = asItemId('item.herb.lavender');
const INGOT = asItemId('item.ingot.iron');
const GOLDEN = asItemId('item.fish.golden-koi');

/**
 * Custos de upgrade por tier (chave = tier 1/2/3).
 * Array indexado pelo nivel ATUAL da essencia.
 * upgradeCostsByLevel[0] = custo de L1 -> L2.
 */
const COSTS_TIER_1: readonly UpgradeCost[] = [
  { silver: 200, materials: [{ itemId: IRON, quantity: 3 }] },
  { silver: 500, materials: [{ itemId: IRON, quantity: 6 }] },
  { silver: 1200, materials: [{ itemId: INGOT, quantity: 2 }] },
  { silver: 3000, materials: [{ itemId: INGOT, quantity: 4 }, { itemId: LAVENDER, quantity: 3 }] },
];

const COSTS_TIER_2: readonly UpgradeCost[] = [
  { silver: 600, materials: [{ itemId: INGOT, quantity: 2 }] },
  { silver: 1500, materials: [{ itemId: INGOT, quantity: 4 }] },
  { silver: 3500, materials: [{ itemId: INGOT, quantity: 6 }, { itemId: LAVENDER, quantity: 4 }] },
  { silver: 8000, materials: [{ itemId: INGOT, quantity: 10 }, { itemId: LAVENDER, quantity: 8 }] },
];

const COSTS_TIER_3: readonly UpgradeCost[] = [
  { silver: 1500, materials: [{ itemId: INGOT, quantity: 4 }] },
  { silver: 4000, materials: [{ itemId: INGOT, quantity: 8 }, { itemId: LAVENDER, quantity: 4 }] },
  { silver: 10000, materials: [{ itemId: INGOT, quantity: 12 }, { itemId: LAVENDER, quantity: 8 }] },
  { silver: 25000, materials: [{ itemId: GOLDEN, quantity: 2 }, { itemId: INGOT, quantity: 20 }] },
];

const LEVEL_MULTIPLIERS = [1.0, 1.2, 1.4, 1.6, 1.8] as const;

/** Unlocks por kind (L3 + L5). */
const UNLOCKS_BY_KIND: Readonly<Record<EssenceKind, readonly EssenceUnlock[]>> = {
  power: [
    { level: 3, bonus: { ap: 3 }, description: 'L3: +3 AP adicional' },
    { level: 5, bonus: { ap: 8, critChance: 0.01 }, description: 'L5: +8 AP e +1% critico' },
  ],
  vitality: [
    { level: 3, bonus: { maxHp: 15 }, description: 'L3: +15 HP adicional' },
    { level: 5, bonus: { maxHp: 40, lifesteal: 0.005 }, description: 'L5: +40 HP e +0.5% lifesteal' },
  ],
  guard: [
    { level: 3, bonus: { dp: 3 }, description: 'L3: +3 DP adicional' },
    { level: 5, bonus: { dp: 8, maxHp: 20 }, description: 'L5: +8 DP e +20 HP' },
  ],
  precision: [
    { level: 3, bonus: { critChance: 0.005 }, description: 'L3: +0.5% critico' },
    { level: 5, bonus: { critChance: 0.01 }, description: 'L5: +1% critico' },
  ],
  blood: [
    { level: 3, bonus: { lifesteal: 0.005 }, description: 'L3: +0.5% lifesteal' },
    { level: 5, bonus: { lifesteal: 0.01, ap: 5 }, description: 'L5: +1% lifesteal e +5 AP' },
  ],
  fortune: [
    { level: 3, bonus: { bonusSilver: 0.02 }, description: 'L3: +2% prata' },
    { level: 5, bonus: { bonusSilver: 0.04 }, description: 'L5: +4% prata' },
  ],
};

function buildConfig(kind: EssenceKind, tier: 1 | 2 | 3): EssenceEvolutionConfig {
  const costs = tier === 1 ? COSTS_TIER_1 : tier === 2 ? COSTS_TIER_2 : COSTS_TIER_3;
  return {
    maxLevel: 5,
    levelMultipliers: LEVEL_MULTIPLIERS,
    upgradeCostsByLevel: costs,
    unlocks: UNLOCKS_BY_KIND[kind],
  };
}

export const ESSENCE_EVOLUTION: Readonly<Record<string, EssenceEvolutionConfig>> = (() => {
  const out: Record<string, EssenceEvolutionConfig> = {};
  for (const kind of ['power', 'vitality', 'guard', 'precision', 'blood', 'fortune'] as const) {
    out[kind + '.t1'] = buildConfig(kind, 1);
    out[kind + '.t2'] = buildConfig(kind, 2);
    out[kind + '.t3'] = buildConfig(kind, 3);
  }
  return out;
})();

export function findEvolutionConfig(kind: EssenceKind, tier: 1 | 2 | 3): EssenceEvolutionConfig | undefined {
  return ESSENCE_EVOLUTION[kind + '.t' + tier];
}
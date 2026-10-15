import type {
  EssenceBonusBundle,
  EssenceDefinition,
  EssenceEvolutionConfig,
  EssenceInstance,
  UpgradeCost,
} from './types';

function scale(base: EssenceBonusBundle, factor: number): EssenceBonusBundle {
  return {
    ap: Math.round(base.ap * factor),
    dp: Math.round(base.dp * factor),
    maxHp: Math.round(base.maxHp * factor),
    critChance: Math.round(base.critChance * factor * 10000) / 10000,
    lifesteal: Math.round(base.lifesteal * factor * 10000) / 10000,
    bonusSilver: Math.round(base.bonusSilver * factor * 10000) / 10000,
  };
}

function add(a: EssenceBonusBundle, b: Partial<EssenceBonusBundle>): EssenceBonusBundle {
  return {
    ap: a.ap + (b.ap ?? 0),
    dp: a.dp + (b.dp ?? 0),
    maxHp: a.maxHp + (b.maxHp ?? 0),
    critChance: a.critChance + (b.critChance ?? 0),
    lifesteal: a.lifesteal + (b.lifesteal ?? 0),
    bonusSilver: a.bonusSilver + (b.bonusSilver ?? 0),
  };
}

export function bonusAtLevel(
  def: EssenceDefinition,
  config: EssenceEvolutionConfig,
  level: number,
): EssenceBonusBundle {
  const lvl = Math.max(1, Math.min(config.maxLevel, Math.floor(level)));
  const factor = config.levelMultipliers[lvl - 1] ?? 1;
  let total = scale(def.bonus, factor);

  for (const unlock of config.unlocks) {
    if (unlock.level <= lvl) total = add(total, unlock.bonus);
  }
  return total;
}

export interface UpgradeCheck {
  readonly ok: boolean;
  readonly error: string | null;
  readonly fromLevel: number;
  readonly toLevel: number;
  readonly cost: UpgradeCost | null;
}

export function checkUpgrade(
  instance: EssenceInstance,
  config: EssenceEvolutionConfig,
  playerSilver: number,
  materialCounts: ReadonlyMap<string, number>,
): UpgradeCheck {
  const fromLevel = instance.level;
  const toLevel = fromLevel + 1;

  if (fromLevel >= config.maxLevel) {
    return { ok: false, error: 'max-level', fromLevel, toLevel: fromLevel, cost: null };
  }
  const cost = config.upgradeCostsByLevel[fromLevel - 1];
  if (!cost) {
    return { ok: false, error: 'no-config', fromLevel, toLevel, cost: null };
  }
  if (playerSilver < cost.silver) {
    return { ok: false, error: 'not-enough-silver', fromLevel, toLevel, cost };
  }
  for (const m of cost.materials) {
    if ((materialCounts.get(m.itemId as string) ?? 0) < m.quantity) {
      return { ok: false, error: 'not-enough-materials', fromLevel, toLevel, cost };
    }
  }
  return { ok: true, error: null, fromLevel, toLevel, cost };
}

export const SACRIFICE_REQUIRED = 3;

export interface SacrificeCheck {
  readonly ok: boolean;
  readonly error: string | null;
  readonly resultLevel: number;
}

export function checkSacrifice(
  instances: readonly EssenceInstance[],
  maxLevel: number,
): SacrificeCheck {
  if (instances.length !== SACRIFICE_REQUIRED) {
    return { ok: false, error: 'wrong-count', resultLevel: 0 };
  }
  const first = instances[0];
  if (!first) return { ok: false, error: 'empty', resultLevel: 0 };
  const sameItem = instances.every((i) => i.itemId === first.itemId);
  if (!sameItem) return { ok: false, error: 'mismatch-item', resultLevel: 0 };
  const sameLevel = instances.every((i) => i.level === first.level);
  if (!sameLevel) return { ok: false, error: 'mismatch-level', resultLevel: 0 };
  if (first.level >= maxLevel) {
    return { ok: false, error: 'max-level', resultLevel: first.level };
  }
  return { ok: true, error: null, resultLevel: first.level + 1 };
}

export function sacrificeCost(level: number): number {
  return 100 * level * level;
}
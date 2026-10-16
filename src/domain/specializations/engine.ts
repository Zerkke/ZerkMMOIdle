import type { DerivedStats } from '../attributes';
import { BALANCE } from '../../data/balance.config';
import type {
  SpecializationDefinition,
  SpecializationModifiers,
  SpecializationState,
} from './types';

export type UnlockCheckError =
  | 'unknown-spec'
  | 'level-too-low'
  | 'missing-talent'
  | 'already-active';

export interface UnlockCheck {
  readonly ok: boolean;
  readonly reason: UnlockCheckError | null;
  readonly missingTalents: readonly { talentId: string; required: number; current: number }[];
}

export interface UnlockCheckOptions {
  readonly characterLevel: number;
  readonly getTalentRank: (talentId: string) => number;
  readonly activeSpec: SpecializationDefinition | null;
}

export function checkUnlock(
  spec: SpecializationDefinition,
  opts: UnlockCheckOptions,
): UnlockCheck {
  if (opts.activeSpec?.id === spec.id) {
    return { ok: false, reason: 'already-active', missingTalents: [] };
  }
  if (opts.characterLevel < spec.unlock.characterLevel) {
    return { ok: false, reason: 'level-too-low', missingTalents: [] };
  }
  const missing: { talentId: string; required: number; current: number }[] = [];
  for (const t of spec.unlock.talents) {
    const rank = opts.getTalentRank(t.talentId);
    if (rank < t.minRank) missing.push({ talentId: t.talentId, required: t.minRank, current: rank });
  }
  if (missing.length > 0) {
    return { ok: false, reason: 'missing-talent', missingTalents: missing };
  }
  return { ok: true, reason: null, missingTalents: [] };
}

/**
 * Aplica modificadores de especializacao aos stats derivados.
 * Funcao pura: devolve DerivedStats novo, sem mutar.
 * Ordem: multiplicadores primeiro, depois somas aditivas (crit, lifesteal).
 * Cap: crit chance respeita BALANCE.combat.maxCritChance; DR cap em 90.
 */
export function applySpecializationModifiers(
  base: DerivedStats,
  mods: SpecializationModifiers,
): DerivedStats {
  const m = mods;
  const maxHp = Math.floor(base.maxHp * (m.hpMultiplier ?? 1));
  const maxResource = Math.floor(base.maxResource * (m.resourceMultiplier ?? 1));
  const ap = Math.max(0, Math.floor(base.ap * (m.apMultiplier ?? 1)));
  const dp = Math.max(0, Math.floor(base.dp * (m.dpMultiplier ?? 1)));
  const attack = Math.max(1, Math.floor(base.attack * (m.attackMultiplier ?? 1)));
  const defense = Math.max(0, Math.floor(base.defense * (m.defenseMultiplier ?? 1)));

  const critRaw = base.criticalChance + (m.critChanceBonus ?? 0);
  const criticalChance = Math.min(BALANCE.combat.maxCritChance, Math.max(0, critRaw));

  const lifesteal = Math.max(0, base.lifesteal + (m.lifestealBonus ?? 0));
  const hpRegenPerSec = Math.max(0, base.hpRegenPerSec + (m.hpRegenBonus ?? 0));
  const critDamage = base.critDamage + (m.critDamageBonus ?? 0);
  const dr = Math.min(90, Math.max(0, base.damageReduction + (m.damageReductionBonus ?? 0)));

  return {
    maxHp,
    maxResource,
    attack,
    defense,
    ap,
    dp,
    criticalChance,
    lifesteal,
    hpRegenPerSec,
    critDamage,
    damageReduction: dr,
    resistances: base.resistances,
  };
}

export function findSpec(
  tree: { specs: readonly SpecializationDefinition[] },
  id: string,
): SpecializationDefinition | undefined {
  return tree.specs.find((s) => s.id === id);
}

export function getActiveSpec(
  tree: { specs: readonly SpecializationDefinition[] },
  state: SpecializationState,
): SpecializationDefinition | null {
  if (!state.active) return null;
  return findSpec(tree, state.active) ?? null;
}

export function activateSpec(
  state: SpecializationState,
  specId: SpecializationDefinition['id'],
  nowMs: number,
): SpecializationState {
  return {
    active: specId,
    changeCount: state.changeCount + 1,
    lastChangeAt: nowMs,
  };
}

export function deactivateSpec(state: SpecializationState, nowMs: number): SpecializationState {
  return {
    active: null,
    changeCount: state.changeCount + 1,
    lastChangeAt: nowMs,
  };
}
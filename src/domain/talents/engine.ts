import type {
  TalentBonusBundle,
  TalentDefinition,
  TalentEffect,
  TalentState,
} from './types';
import { EMPTY_TALENT_BONUS } from './types';

export type TalentLearnError =
  | 'unknown-talent'
  | 'max-rank'
  | 'not-enough-points'
  | 'missing-prerequisite'
  | 'level-too-low';

export interface CanLearnResult {
  readonly ok: boolean;
  readonly reason: TalentLearnError | null;
  readonly nextRankCost: number;
  readonly currentRank: number;
  readonly nextRank: number;
}

export function getRank(state: TalentState, talentId: string): number {
  return state.ranks[talentId] ?? 0;
}

export function totalPointsSpent(
  state: TalentState,
  defs: readonly TalentDefinition[],
): number {
  let total = 0;
  for (const def of defs) {
    const rank = getRank(state, def.id);
    for (let i = 0; i < rank; i++) total += def.costPerRank[i] ?? 0;
  }
  return total;
}

export function canLearn(
  state: TalentState,
  talentId: string,
  defs: readonly TalentDefinition[],
  availablePoints: number,
  characterLevel: number,
): CanLearnResult {
  const def = defs.find((d) => d.id === talentId);
  if (!def) {
    return { ok: false, reason: 'unknown-talent', nextRankCost: 0, currentRank: 0, nextRank: 0 };
  }
  const currentRank = getRank(state, talentId);
  const nextRank = currentRank + 1;
  if (currentRank >= def.maxRank) {
    return { ok: false, reason: 'max-rank', nextRankCost: 0, currentRank, nextRank: currentRank };
  }
  if (characterLevel < def.requiredCharacterLevel) {
    return { ok: false, reason: 'level-too-low', nextRankCost: 0, currentRank, nextRank };
  }
  for (const prereq of def.prerequisites) {
    if (getRank(state, prereq) <= 0) {
      return { ok: false, reason: 'missing-prerequisite', nextRankCost: 0, currentRank, nextRank };
    }
  }
  const nextRankCost = def.costPerRank[nextRank - 1] ?? 0;
  if (availablePoints < nextRankCost) {
    return { ok: false, reason: 'not-enough-points', nextRankCost, currentRank, nextRank };
  }
  return { ok: true, reason: null, nextRankCost, currentRank, nextRank };
}

export function learn(
  state: TalentState,
  talentId: string,
  defs: readonly TalentDefinition[],
  availablePoints: number,
  characterLevel: number,
): TalentState | null {
  const check = canLearn(state, talentId, defs, availablePoints, characterLevel);
  if (!check.ok) return null;
  const newRanks = { ...state.ranks, [talentId]: check.nextRank };
  return { ...state, ranks: newRanks };
}

export function resetTalents(state: TalentState): TalentState {
  return { ranks: {}, respecCount: state.respecCount + 1 };
}

export function getBonuses(
  state: TalentState,
  defs: readonly TalentDefinition[],
): TalentBonusBundle {
  const acc: { -readonly [K in keyof TalentBonusBundle]: number } = { ...EMPTY_TALENT_BONUS };
  for (const def of defs) {
    const rank = getRank(state, def.id);
    if (rank <= 0) continue;
    applyEffect(acc, def.effect, rank);
  }
  return acc;
}

function applyEffect(
  acc: { -readonly [K in keyof TalentBonusBundle]: number },
  effect: TalentEffect,
  rank: number,
): void {
  const value = effect.value * rank;
  switch (effect.kind) {
    case 'ap': acc.ap += value; break;
    case 'dp': acc.dp += value; break;
    case 'max-hp': acc.maxHp += value; break;
    case 'crit-chance': acc.critChance += value; break;
    case 'crit-damage': acc.critDamage += value; break;
    case 'lifesteal': acc.lifesteal += value; break;
    case 'hp-regen': acc.hpRegen += value; break;
    case 'attack': acc.attack += value; break;
    case 'defense': acc.defense += value; break;
    case 'damage-reduction': acc.damageReduction += value; break;
    case 'gather-yield': acc.gatherYield += value; break;
    case 'xp-bonus': acc.xpBonus += value; break;
    case 'silver-bonus': acc.silverBonus += value; break;
  }
}

export interface TreeValidationIssue {
  readonly talentId: string;
  readonly message: string;
}

export function validateTree(defs: readonly TalentDefinition[]): TreeValidationIssue[] {
  const issues: TreeValidationIssue[] = [];
  const byId = new Map<string, TalentDefinition>();
  for (const def of defs) {
    if (byId.has(def.id)) issues.push({ talentId: def.id, message: 'ID duplicado' });
    byId.set(def.id, def);
    if (def.maxRank < 1) issues.push({ talentId: def.id, message: 'maxRank < 1' });
    if (def.costPerRank.length !== def.maxRank) {
      issues.push({ talentId: def.id, message: 'costPerRank incompativel com maxRank' });
    }
  }
  for (const def of defs) {
    for (const p of def.prerequisites) {
      if (!byId.has(p)) issues.push({ talentId: def.id, message: 'Prerequisito inexistente: ' + p });
    }
  }
  const visited = new Set<string>();
  const stack = new Set<string>();
  const dfs = (id: string): boolean => {
    if (stack.has(id)) return true;
    if (visited.has(id)) return false;
    visited.add(id);
    stack.add(id);
    const def = byId.get(id);
    if (def) for (const p of def.prerequisites) if (dfs(p)) return true;
    stack.delete(id);
    return false;
  };
  for (const def of defs) {
    if (dfs(def.id)) issues.push({ talentId: def.id, message: 'Ciclo de prerequisitos' });
  }
  return issues;
}
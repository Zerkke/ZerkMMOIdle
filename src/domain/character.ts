import type { ClassId } from './ids';
import type { Attributes } from './attributes';
import { BALANCE } from '../data/balance.config';

export interface CharacterState {
  readonly id: string;
  readonly name: string;
  readonly classId: ClassId;
  readonly createdAt: number;
  readonly level: number;
  readonly experience: number;
  readonly silver: number;
  readonly progressionPoints: number;
  readonly hp: number;
  readonly resource: number;
  readonly unlocks: ReadonlySet<string>;
}

export const MAX_LEVEL = 50;

/** XP necessaria para subir do nivel atual para o seguinte. */
export function experienceToNextLevel(level: number): number {
  return BALANCE.character.xpToNextLevel(level);
}

export interface ExperienceResult {
  readonly state: CharacterState;
  readonly leveledUp: number;
}

export function applyExperience(state: CharacterState, amount: number): ExperienceResult {
  if (!Number.isFinite(amount) || amount <= 0) return { state, leveledUp: 0 };
  let exp = state.experience + Math.floor(amount);
  let level = state.level;
  let points = state.progressionPoints;
  let leveledUp = 0;

  while (level < MAX_LEVEL) {
    const needed = experienceToNextLevel(level);
    if (exp < needed) break;
    exp -= needed;
    level += 1;
    points += BALANCE.character.progressionPointsPerLevel;
    leveledUp += 1;
  }

  if (level >= MAX_LEVEL) exp = 0;

  return {
    state: { ...state, level, experience: exp, progressionPoints: points },
    leveledUp,
  };
}

export function spendProgressionPoint(
  state: CharacterState,
  _attribute: keyof Attributes,
): CharacterState | null {
  if (state.progressionPoints <= 0) return null;
  return { ...state, progressionPoints: state.progressionPoints - 1 };
}

export function addSilver(state: CharacterState, amount: number): CharacterState {
  if (!Number.isFinite(amount)) return state;
  const next = Math.max(0, state.silver + Math.floor(amount));
  return { ...state, silver: next };
}

export function spendSilver(state: CharacterState, amount: number): CharacterState | null {
  if (!Number.isInteger(amount) || amount <= 0) return null;
  if (state.silver < amount) return null;
  return { ...state, silver: state.silver - amount };
}

export function addUnlock(state: CharacterState, key: string): CharacterState {
  if (state.unlocks.has(key)) return state;
  const next = new Set(state.unlocks);
  next.add(key);
  return { ...state, unlocks: next };
}

/** Multiplicador de XP ganha por nivel (evita grind excessivo). */
export function xpRewardMultiplier(level: number): number {
  return BALANCE.character.xpRewardMultiplier(level);
}

/** Multiplicador de prata ganha por nivel. */
export function silverRewardMultiplier(level: number): number {
  return BALANCE.character.silverRewardMultiplier(level);
}
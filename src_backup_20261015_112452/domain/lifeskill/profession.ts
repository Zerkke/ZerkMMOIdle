import type { ProfessionState } from './types';
import { experienceToNextProfessionLevel } from './types';

export interface LevelUpResult {
  readonly state: ProfessionState;
  readonly levelsGained: number;
}

export function addProfessionExperience(
  state: ProfessionState,
  amount: number,
  maxLevel: number,
  masteryPerLevel: number,
): LevelUpResult {
  if (!Number.isFinite(amount) || amount <= 0) return { state, levelsGained: 0 };
  let exp = state.experience + Math.floor(amount);
  let level = state.level;
  let mastery = state.mastery;
  let gained = 0;

  while (level < maxLevel) {
    const needed = experienceToNextProfessionLevel(level, maxLevel);
    if (exp < needed) break;
    exp -= needed;
    level += 1;
    mastery += masteryPerLevel;
    gained += 1;
  }

  if (level >= maxLevel) exp = 0;

  return { state: { level, experience: exp, mastery }, levelsGained: gained };
}

export function masteryYieldMultiplier(mastery: number): number {
  return 1 + mastery * 0.005;
}
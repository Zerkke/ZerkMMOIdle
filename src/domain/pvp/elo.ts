import type { PvpConfig } from './types';

export function expectedScore(ratingA: number, ratingB: number): number {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

export interface EloChange {
  readonly newA: number;
  readonly newB: number;
  readonly deltaA: number;
  readonly deltaB: number;
}

export function applyElo(
  ratingA: number,
  ratingB: number,
  aWon: boolean,
  kFactor: number,
): EloChange {
  const expectedA = expectedScore(ratingA, ratingB);
  const expectedB = 1 - expectedA;
  const actualA = aWon ? 1 : 0;
  const actualB = 1 - actualA;
  const deltaA = Math.round(kFactor * (actualA - expectedA));
  const deltaB = Math.round(kFactor * (actualB - expectedB));
  return {
    newA: Math.max(0, ratingA + deltaA),
    newB: Math.max(0, ratingB + deltaB),
    deltaA,
    deltaB,
  };
}

export function canChallenge(
  attackerRating: number,
  defenderRating: number,
  config: PvpConfig,
): { ok: boolean; reason: string | null } {
  const diff = Math.abs(attackerRating - defenderRating);
  if (diff > config.ratingRange) return { ok: false, reason: 'out-of-range' };
  return { ok: true, reason: null };
}

export function applyDailyReset(
  state: { dailyAttacksUsed: number; dailyResetAt: number },
  nowMs: number,
  config: PvpConfig,
): { dailyAttacksUsed: number; dailyResetAt: number } {
  if (state.dailyResetAt === 0) return { dailyAttacksUsed: 0, dailyResetAt: nowMs };
  if (nowMs - state.dailyResetAt >= config.dailyResetMs) {
    return { dailyAttacksUsed: 0, dailyResetAt: nowMs };
  }
  return state;
}
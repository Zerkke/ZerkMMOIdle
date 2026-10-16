import type { PendingSeasonReward, RankTier, RankingEntry, RankingsConfig, SeasonInfo } from './types';

export const TIER_ORDER: readonly RankTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
export const TIER_LABELS: Readonly<Record<RankTier, string>> = {
  bronze: 'Bronze', silver: 'Prata', gold: 'Ouro', platinum: 'Platina', diamond: 'Diamante',
};
export const TIER_COLORS: Readonly<Record<RankTier, string>> = {
  bronze: '#a07050', silver: '#a8b8c8', gold: '#e8c977', platinum: '#a8e8ff', diamond: '#d84ae8',
};
export const TIER_THRESHOLDS: Readonly<Record<RankTier, number>> = {
  bronze: 0, silver: 1000, gold: 1400, platinum: 1800, diamond: 2200,
};

export function tierForRating(rating: number): RankTier {
  if (rating >= TIER_THRESHOLDS.diamond) return 'diamond';
  if (rating >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (rating >= TIER_THRESHOLDS.gold) return 'gold';
  if (rating >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

export function seasonNumberFromId(seasonId: string): number {
  const m = /^S(\d+)$/.exec(seasonId);
  return m ? Number(m[1]) : 1;
}

export function seasonIdFromNumber(n: number): string {
  return 'S' + Math.max(1, Math.floor(n));
}

export function seasonForTimestamp(nowMs: number, config: RankingsConfig): { id: string; number: number } {
  const elapsed = nowMs - config.seasonAnchorMs;
  const n = elapsed < 0 ? 1 : Math.floor(elapsed / config.seasonDurationMs) + 1;
  return { id: seasonIdFromNumber(n), number: n };
}

export function getSeasonInfo(nowMs: number, config: RankingsConfig): SeasonInfo {
  const { id, number } = seasonForTimestamp(nowMs, config);
  const startMs = config.seasonAnchorMs + (number - 1) * config.seasonDurationMs;
  const endMs = startMs + config.seasonDurationMs;
  const daysRemaining = Math.max(0, Math.ceil((endMs - nowMs) / (24 * 60 * 60 * 1000)));
  return { id, number, name: 'Temporada ' + number, startsAt: startMs, endsAt: endMs, isCurrent: nowMs >= startMs && nowMs < endMs, daysRemaining };
}

export function getPreviousSeasonId(currentId: string): string {
  const n = seasonNumberFromId(currentId);
  return seasonIdFromNumber(Math.max(1, n - 1));
}

export function sortRankings(entries: readonly Omit<RankingEntry, 'rank' | 'tier' | 'isCurrentUser'>[]): RankingEntry[] {
  const sorted = [...entries].sort((a, b) => {
    if (b.rating !== a.rating) return b.rating - a.rating;
    if (b.wins !== a.wins) return b.wins - a.wins;
    if (a.losses !== b.losses) return a.losses - b.losses;
    return a.updatedAt - b.updatedAt;
  });
  return sorted.map((e, idx) => ({
    rank: idx + 1, userId: e.userId, characterName: e.characterName, characterLevel: e.characterLevel,
    rating: e.rating, peakRating: e.peakRating, wins: e.wins, losses: e.losses,
    tier: tierForRating(e.rating), updatedAt: e.updatedAt, isCurrentUser: false,
  }));
}

export function markCurrentUser(entries: readonly RankingEntry[], userId: string): RankingEntry[] {
  return entries.map((e) => ({ ...e, isCurrentUser: e.userId === userId }));
}

export interface RewardTable {
  readonly silverByTier: Readonly<Record<RankTier, number>>;
  readonly xpByTier: Readonly<Record<RankTier, number>>;
  readonly bonusTop10: number;
  readonly bonusTop3: number;
  readonly bonusRank1: number;
}

export function computeSeasonReward(args: { finalTier: RankTier; finalRank: number | null; seasonNumber: number }, table: RewardTable): { silver: number; xp: number; label: string } {
  let silver = table.silverByTier[args.finalTier] ?? 0;
  let xp = table.xpByTier[args.finalTier] ?? 0;
  let label = 'Participacao';
  if (args.finalRank === 1) {
    silver += table.bonusRank1; xp += table.bonusRank1; label = 'Campeao da Temporada';
  } else if (args.finalRank !== null && args.finalRank <= 3) {
    silver += table.bonusTop3; xp += table.bonusTop3; label = 'Top 3 da Temporada';
  } else if (args.finalRank !== null && args.finalRank <= 10) {
    silver += table.bonusTop10; xp += table.bonusTop10; label = 'Top 10 da Temporada';
  } else {
    label = 'Recompensa de ' + TIER_LABELS[args.finalTier];
  }
  return { silver, xp, label };
}

export function isValidSeasonId(id: string): boolean { return /^S\d+$/.test(id); }
export function shouldShowPendingReward(state: { pendingSeasonReward: PendingSeasonReward | null }): boolean {
  return state.pendingSeasonReward !== null;
}
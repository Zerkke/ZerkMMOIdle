export type RankTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface SeasonInfo {
  readonly id: string;
  readonly number: number;
  readonly name: string;
  readonly startsAt: number;
  readonly endsAt: number;
  readonly isCurrent: boolean;
  readonly daysRemaining: number;
}

export interface RankingEntry {
  readonly rank: number;
  readonly userId: string;
  readonly characterName: string;
  readonly characterLevel: number;
  readonly rating: number;
  readonly peakRating: number;
  readonly wins: number;
  readonly losses: number;
  readonly tier: RankTier;
  readonly updatedAt: number;
  readonly isCurrentUser: boolean;
}

export interface PendingSeasonReward {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly finalRating: number;
  readonly finalTier: RankTier;
  readonly finalRank: number | null;
  readonly silver: number;
  readonly xp: number;
  readonly label: string;
}

export interface MySeasonResult {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly finalRating: number;
  readonly finalTier: RankTier;
  readonly finalRank: number | null;
  readonly wins: number;
  readonly losses: number;
  readonly rewardClaimed: boolean;
}

export interface RankingsState {
  readonly lastSeenSeasonId: string | null;
  readonly pendingSeasonReward: PendingSeasonReward | null;
}

export function emptyRankingsState(): RankingsState {
  return { lastSeenSeasonId: null, pendingSeasonReward: null };
}

export interface RankingsConfig {
  readonly seasonDurationMs: number;
  readonly seasonAnchorMs: number;
  readonly topN: number;
  readonly tieBreakUpdatedAtAsc: boolean;
}

export const DEFAULT_RANKINGS_CONFIG: RankingsConfig = {
  seasonDurationMs: 30 * 24 * 60 * 60 * 1000,
  seasonAnchorMs: Date.UTC(2026, 0, 1, 0, 0, 0),
  topN: 100,
  tieBreakUpdatedAtAsc: true,
};
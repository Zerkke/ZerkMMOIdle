import { supabase, isSupabaseConfigured } from '../auth/supabase';
import type {
  MySeasonResult,
  PendingSeasonReward,
  RankingsConfig,
  RankingEntry,
  SeasonInfo,
} from '../domain/rankings/types';
import {
  computeSeasonReward,
  getPreviousSeasonId,
  getSeasonInfo,
  markCurrentUser,
  seasonForTimestamp,
  sortRankings,
  tierForRating,
  type RewardTable,
} from '../domain/rankings/engine';

export interface RankingsView {
  readonly season: SeasonInfo;
  readonly entries: readonly RankingEntry[];
  readonly myEntry: RankingEntry | null;
  readonly myHistory: readonly MySeasonResult[];
  readonly isMockMode: boolean;
  readonly pendingReward: PendingSeasonReward | null;
}

interface RawRow {
  readonly user_id?: string;
  readonly character_name?: string;
  readonly character_level?: number;
  readonly rating?: number;
  readonly peak_rating?: number;
  readonly wins?: number;
  readonly losses?: number;
  readonly updated_at?: string;
}

interface RawSeasonRow {
  readonly season_id?: string;
  readonly final_rating?: number;
  readonly final_tier?: string;
  readonly final_rank?: number | null;
  readonly wins?: number;
  readonly losses?: number;
  readonly reward_claimed?: boolean;
}

export interface RankingsServiceOptions {
  readonly getUserId: () => string | null;
  readonly config: RankingsConfig;
  readonly rewardTable: RewardTable;
}

export class RankingsService {
  private authUserId: string | null = null;
  private supabaseFailed = false;

  constructor(private readonly opts: RankingsServiceOptions) {}

  isMockMode(): boolean {
    return this.supabaseFailed || !isSupabaseConfigured() || !supabase;
  }

  private async resolveUserId(): Promise<string | null> {
    if (this.authUserId) return this.authUserId;
    if (this.isMockMode() || !supabase) {
      const fallback = this.opts.getUserId();
      this.authUserId = fallback;
      return fallback;
    }
    try {
      const { data } = await supabase.auth.getSession();
      const uid = data.session?.user.id ?? null;
      this.authUserId = uid;
      return uid;
    } catch {
      return null;
    }
  }

  getSeason(nowMs: number): SeasonInfo {
    return getSeasonInfo(nowMs, this.opts.config);
  }

  seasonIdFor(nowMs: number): string {
    return seasonForTimestamp(nowMs, this.opts.config).id;
  }

  previousSeason(currentId: string): string {
    return getPreviousSeasonId(currentId);
  }

  async loadRankings(_nowMs: number): Promise<readonly RankingEntry[]> {
    const userId = await this.resolveUserId();
    if (this.isMockMode() || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('pvp_builds')
        .select('user_id, character_name, character_level, rating, peak_rating, wins, losses, updated_at')
        .order('rating', { ascending: false })
        .order('wins', { ascending: false })
        .order('losses', { ascending: true })
        .limit(this.opts.config.topN);

      if (error || !data) {
        console.warn('[Zerk Rankings] Falha ao carregar:', error?.message);
        this.supabaseFailed = true;
        return [];
      }

      const rows = data as RawRow[];
      const parsed = rows.map((r) => ({
        userId: String(r.user_id ?? ''),
        characterName: String(r.character_name ?? ''),
        characterLevel: Number(r.character_level ?? 1),
        rating: Number(r.rating ?? 1000),
        peakRating: Number(r.peak_rating ?? 1000),
        wins: Number(r.wins ?? 0),
        losses: Number(r.losses ?? 0),
        updatedAt: new Date(String(r.updated_at ?? '')).getTime() || 0,
      }));

      const sorted = sortRankings(parsed);
      return userId ? markCurrentUser(sorted, userId) : sorted;
    } catch (e) {
      console.warn('[Zerk Rankings] Excepcao:', e);
      this.supabaseFailed = true;
      return [];
    }
  }

  async loadMyHistory(): Promise<readonly MySeasonResult[]> {
    const userId = await this.resolveUserId();
    if (!userId || this.isMockMode() || !supabase) return [];

    try {
      const { data, error } = await supabase
        .from('pvp_season_results')
        .select('season_id, final_rating, final_tier, final_rank, wins, losses, reward_claimed')
        .eq('user_id', userId)
        .order('season_id', { ascending: false })
        .limit(12);

      if (error || !data) return [];
      const rows = data as RawSeasonRow[];
      return rows.map((r) => ({
        seasonId: String(r.season_id ?? ''),
        seasonName: 'Temporada ' + String(r.season_id ?? '').replace(/^S/, ''),
        finalRating: Number(r.final_rating ?? 1000),
        finalTier: tierForRating(Number(r.final_rating ?? 1000)),
        finalRank: r.final_rank ?? null,
        wins: Number(r.wins ?? 0),
        losses: Number(r.losses ?? 0),
        rewardClaimed: r.reward_claimed === true,
      }));
    } catch {
      return [];
    }
  }

  async snapshotSeasonEnd(previousSeasonId: string, _nowMs: number): Promise<PendingSeasonReward | null> {
    const userId = await this.resolveUserId();
    if (!userId || this.isMockMode() || !supabase) return null;

    const { data: existing } = await supabase
      .from('pvp_season_results')
      .select('final_rating, final_rank, reward_claimed')
      .eq('user_id', userId)
      .eq('season_id', previousSeasonId)
      .maybeSingle();

    if (existing) {
      const ex = existing as RawSeasonRow;
      if (ex.reward_claimed) return null;
      return this.buildPendingReward(previousSeasonId, Number(ex.final_rating ?? 1000), ex.final_rank ?? null);
    }

    const { data: mine } = await supabase
      .from('pvp_builds')
      .select('rating, peak_rating, wins, losses, character_name, character_level')
      .eq('user_id', userId)
      .maybeSingle();

    if (!mine) return null;

    const m = mine as RawRow;
    const finalRating = Number(m.rating ?? 1000);
    const finalTier = tierForRating(finalRating);

    const { count: higherCount } = await supabase
      .from('pvp_builds')
      .select('*', { count: 'exact', head: true })
      .gt('rating', finalRating);
    const rank = (higherCount ?? 0) + 1;

    const { error } = await supabase.from('pvp_season_results').insert({
      user_id: userId,
      season_id: previousSeasonId,
      character_name: String(m.character_name ?? ''),
      final_rating: finalRating,
      final_tier: finalTier,
      final_rank: rank,
      wins: Number(m.wins ?? 0),
      losses: Number(m.losses ?? 0),
      reward_claimed: false,
    });

    if (error) {
      console.warn('[Zerk Rankings] Falha ao gravar resultado:', error.message);
      return null;
    }

    return this.buildPendingReward(previousSeasonId, finalRating, rank);
  }

  private buildPendingReward(seasonId: string, finalRating: number, finalRank: number | null): PendingSeasonReward {
    const tier = tierForRating(finalRating);
    const num = Number(seasonId.replace(/^S/, '')) || 1;
    const reward = computeSeasonReward(
      { finalTier: tier, finalRank, seasonNumber: num },
      this.opts.rewardTable,
    );
    return {
      seasonId,
      seasonName: 'Temporada ' + num,
      finalRating,
      finalTier: tier,
      finalRank,
      silver: reward.silver,
      xp: reward.xp,
      label: reward.label,
    };
  }

  async claimSeasonReward(seasonId: string): Promise<boolean> {
    const userId = await this.resolveUserId();
    if (!userId || this.isMockMode() || !supabase) return false;

    const { error } = await supabase
      .from('pvp_season_results')
      .update({ reward_claimed: true, reward_claimed_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('season_id', seasonId)
      .eq('reward_claimed', false);

    if (error) {
      console.warn('[Zerk Rankings] Falha ao marcar recompensa:', error.message);
      return false;
    }
    return true;
  }
}
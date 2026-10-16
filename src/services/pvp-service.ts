import { supabase, isSupabaseConfigured } from '../auth/supabase';
import type {
  PvpBuildRecord,
  PvpConfig,
  PvpHistoryEntry,
  PvpSnapshot,
  PvpState,
} from '../domain/pvp/types';
import { emptyPvpState } from '../domain/pvp/types';
import {
  applyDailyReset,
  applyElo,
  canChallenge,
} from '../domain/pvp/elo';
import {
  makeDeterministicRng,
  simulateDuel,
} from '../domain/pvp/engine';
import { MOCK_PVP_OPPONENTS } from '../data/pvp.data';

export interface PvpOpponentView {
  readonly userId: string;
  readonly characterName: string;
  readonly characterLevel: number;
  readonly rating: number;
  readonly wins: number;
  readonly losses: number;
  readonly isMock: boolean;
  readonly inRange: boolean;
  readonly canChallenge: boolean;
}

export interface PvpView {
  readonly registered: boolean;
  readonly registeredAt: number | null;
  readonly rating: number;
  readonly peakRating: number;
  readonly wins: number;
  readonly losses: number;
  readonly dailyAttacksUsed: number;
  readonly dailyAttacksMax: number;
  readonly opponents: readonly PvpOpponentView[];
  readonly history: readonly PvpHistoryEntry[];
  readonly isMockMode: boolean;
}

export interface PvpFightResult {
  readonly defender: PvpOpponentView;
  readonly won: boolean;
  readonly ratingDelta: number;
  readonly ratingAfter: number;
  readonly log: readonly string[];
}

export interface PvpServiceOptions {
  readonly getCurrentSnapshot: () => PvpSnapshot;
  readonly getUserId: () => string;
  readonly rngSalt: () => number;
  readonly now: () => number;
}

export class PvpService {
  private state: PvpState;
  private cachedOpponents: PvpBuildRecord[] | null = null;
  private supabaseFailed = false;

  constructor(
    private readonly config: PvpConfig,
    private readonly opts: PvpServiceOptions,
    initialState: PvpState = emptyPvpState(),
  ) {
    this.state = initialState;
  }

  getState(): PvpState { return this.state; }
  setState(state: PvpState): void { this.state = state; }

  isMockMode(): boolean { return this.supabaseFailed || !isSupabaseConfigured() || !supabase; }

  isRegistered(): boolean { return this.state.registeredBuild !== null; }

  /** Regista a build atual como defensiva. Em modo real, envia ao Supabase. */
  async registerBuild(): Promise<{ ok: boolean; error: string | null }> {
    const snap = this.opts.getCurrentSnapshot();
    if (!snap) return { ok: false, error: 'sem-snapshot' };

    const now = this.opts.now();
    if (this.isMockMode()) {
      this.state = {
        ...this.state,
        registeredBuild: { ...snap },
        registeredAt: now,
      };
      return { ok: true, error: null };
    }

    const userId = this.opts.getUserId();
    if (!userId) return { ok: false, error: 'sem-user' };

    try {
      const { error } = await supabase!
        .from('pvp_builds')
        .upsert({
          user_id: userId,
          snapshot: snap,
          snapshot_version: snap.version,
          character_name: snap.characterName,
          character_level: snap.characterLevel,
          updated_at: new Date(now).toISOString(),
        }, { onConflict: 'user_id' });

      if (error) {
        console.warn('[Zerk PvP] Supabase falhou, a usar mock local:', error.message);
        this.supabaseFailed = true;
        this.state = { ...this.state, registeredBuild: { ...snap }, registeredAt: now };
        return { ok: true, error: null };
      }
      this.state = { ...this.state, registeredBuild: { ...snap }, registeredAt: now };
      return { ok: true, error: null };
    } catch (e) {
      console.warn('[Zerk PvP] Excepcao Supabase, a usar mock local:', e);
      this.supabaseFailed = true;
      this.state = { ...this.state, registeredBuild: { ...snap }, registeredAt: now };
      return { ok: true, error: null };
    }
  }

  /** Carrega lista de adversarios elegiveis. */
  async loadOpponents(): Promise<readonly PvpBuildRecord[]> {
    if (this.isMockMode()) {
      this.cachedOpponents = [...MOCK_PVP_OPPONENTS];
      return this.cachedOpponents;
    }
    const userId = this.opts.getUserId();
    if (!userId) return [];
    try {
      const { data, error } = await supabase!
        .from('pvp_builds')
        .select('user_id, snapshot, character_name, character_level, rating, peak_rating, wins, losses, updated_at')
        .neq('user_id', userId)
        .limit(50);
      if (error || !data) {
        console.warn('[Zerk PvP] Supabase load falhou, a usar mock local:', error?.message ?? 'sem dados');
        this.supabaseFailed = true;
        this.cachedOpponents = [...MOCK_PVP_OPPONENTS];
        return this.cachedOpponents;
      }
      const mapped: PvpBuildRecord[] = (data as unknown[]).map((row) => {
        const r = row as Record<string, unknown>;
        return {
          userId: String(r['user_id'] ?? ''),
          characterName: String(r['character_name'] ?? ''),
          characterLevel: Number(r['character_level'] ?? 1),
          rating: Number(r['rating'] ?? 1000),
          peakRating: Number(r['peak_rating'] ?? 1000),
          wins: Number(r['wins'] ?? 0),
          losses: Number(r['losses'] ?? 0),
          snapshot: r['snapshot'] as PvpSnapshot,
          updatedAt: new Date(String(r['updated_at'] ?? '')).getTime() || 0,
        };
      });
      this.cachedOpponents = mapped;
      return mapped;
    } catch (e) {
      console.warn('[Zerk PvP] Excepcao load, a usar mock local:', e);
      this.supabaseFailed = true;
      this.cachedOpponents = [...MOCK_PVP_OPPONENTS];
      return this.cachedOpponents;
    }
  }

  buildView(opponents: readonly PvpBuildRecord[]): PvpView {
    const now = this.opts.now();
    const reset = applyDailyReset(
      { dailyAttacksUsed: this.state.dailyAttacksUsed, dailyResetAt: this.state.dailyResetAt },
      now,
      this.config,
    );
    const dailyAtLimit = reset.dailyAttacksUsed >= this.config.dailyAttacks;
    const rating = this.state.localRating;

    const oppViews: PvpOpponentView[] = opponents.map((o) => {
      const range = canChallenge(rating, o.rating, this.config);
      return {
        userId: o.userId,
        characterName: o.characterName,
        characterLevel: o.characterLevel,
        rating: o.rating,
        wins: o.wins,
        losses: o.losses,
        isMock: this.isMockMode(),
        inRange: range.ok,
        canChallenge: range.ok && !dailyAtLimit,
      };
    });
    oppViews.sort((a, b) => Math.abs(a.rating - rating) - Math.abs(b.rating - rating));

    return {
      registered: this.isRegistered(),
      registeredAt: this.state.registeredAt,
      rating,
      peakRating: this.state.localPeakRating,
      wins: this.state.localWins,
      losses: this.state.localLosses,
      dailyAttacksUsed: reset.dailyAttacksUsed,
      dailyAttacksMax: this.config.dailyAttacks,
      opponents: oppViews,
      history: this.state.history,
      isMockMode: this.isMockMode(),
    };
  }

  /** Corre uma luta contra adversario. Devolve resultado e estado actualizado. */
  async fight(_defenderUserId: string, opponent: PvpBuildRecord): Promise<PvpFightResult | null> {
    const now = this.opts.now();
    const reset = applyDailyReset(
      { dailyAttacksUsed: this.state.dailyAttacksUsed, dailyResetAt: this.state.dailyResetAt },
      now,
      this.config,
    );
    if (reset.dailyAttacksUsed >= this.config.dailyAttacks) return null;

    const attacker = this.state.registeredBuild ?? this.opts.getCurrentSnapshot();
    if (!attacker) return null;

    const range = canChallenge(this.state.localRating, opponent.rating, this.config);
    if (!range.ok) return null;

    const seed = this.opts.rngSalt();
    const rng = makeDeterministicRng(attacker, opponent.snapshot, seed);
    const duel = simulateDuel(attacker, opponent.snapshot, rng, now);
    const won = duel.outcome === 'victory';

    const elo = applyElo(this.state.localRating, opponent.rating, won, this.config.kFactor);
    const entry: PvpHistoryEntry = {
      foughtAt: now,
      defenderId: opponent.userId,
      defenderName: opponent.characterName,
      won,
      attackerRatingBefore: this.state.localRating,
      attackerRatingAfter: elo.newA,
      defenderRatingBefore: opponent.rating,
      defenderRatingAfter: elo.newB,
    };
    const history = [entry, ...this.state.history].slice(0, this.config.maxHistory);

    this.state = {
      ...this.state,
      dailyAttacksUsed: reset.dailyAttacksUsed + 1,
      dailyResetAt: reset.dailyResetAt,
      localRating: elo.newA,
      localPeakRating: Math.max(this.state.localPeakRating, elo.newA),
      localWins: this.state.localWins + (won ? 1 : 0),
      localLosses: this.state.localLosses + (won ? 0 : 1),
      history,
    };

    const log: string[] = [
      'Dano causado: ' + duel.totalPlayerDamage,
      'Dano recebido: ' + duel.totalMonsterDamage,
      won ? 'VITORIA' : 'DERROTA',
      'Rating: ' + this.state.localRating + ' (' + (elo.deltaA >= 0 ? '+' : '') + elo.deltaA + ')',
    ];

    return {
      defender: {
        userId: opponent.userId,
        characterName: opponent.characterName,
        characterLevel: opponent.characterLevel,
        rating: opponent.rating,
        wins: opponent.wins,
        losses: opponent.losses,
        isMock: this.isMockMode(),
        inRange: true,
        canChallenge: true,
      },
      won,
      ratingDelta: elo.deltaA,
      ratingAfter: elo.newA,
      log,
    };
  }
}
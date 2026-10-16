import type {
  ArenaConfig,
  ArenaFightRewards,
  ArenaHistoryEntry,
  ArenaOpponentDef,
  ArenaState,
  ArenaTier,
} from './types';

export const TIER_ORDER: readonly ArenaTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

export const TIER_LABELS: Readonly<Record<ArenaTier, string>> = {
  bronze: 'Bronze',
  silver: 'Prata',
  gold: 'Ouro',
  platinum: 'Platina',
  diamond: 'Diamante',
};

export const TIER_COLORS: Readonly<Record<ArenaTier, string>> = {
  bronze: '#a07050',
  silver: '#a8b8c8',
  gold: '#e8c977',
  platinum: '#a8e8ff',
  diamond: '#d84ae8',
};

export const TIER_THRESHOLDS: Readonly<Record<ArenaTier, number>> = {
  bronze: 0,
  silver: 1000,
  gold: 1400,
  platinum: 1800,
  diamond: 2200,
};

export function tierForRating(rating: number): ArenaTier {
  if (rating >= TIER_THRESHOLDS.diamond) return 'diamond';
  if (rating >= TIER_THRESHOLDS.platinum) return 'platinum';
  if (rating >= TIER_THRESHOLDS.gold) return 'gold';
  if (rating >= TIER_THRESHOLDS.silver) return 'silver';
  return 'bronze';
}

export interface FightCheck {
  readonly ok: boolean;
  readonly reason: string | null;
}

export function canFight(
  state: ArenaState,
  opponent: ArenaOpponentDef,
  playerSilver: number,
  nowMs: number,
  config: ArenaConfig,
): FightCheck {
  const needsReset = nowMs - state.lastResetAt >= config.dailyResetMs;
  if (!needsReset && state.fightsToday >= config.fightsPerDay) {
    return { ok: false, reason: 'daily-limit' };
  }
  const diff = Math.abs(opponent.rating - state.rating);
  if (diff > config.ratingRange) {
    return { ok: false, reason: 'out-of-range' };
  }
  if (playerSilver < opponent.entryCost) {
    return { ok: false, reason: 'not-enough-silver' };
  }
  return { ok: true, reason: null };
}

export function applyReset(state: ArenaState, nowMs: number, config: ArenaConfig): ArenaState {
  if (state.lastResetAt === 0) return { ...state, lastResetAt: nowMs };
  if (nowMs - state.lastResetAt >= config.dailyResetMs) {
    return { ...state, fightsToday: 0, lastResetAt: nowMs };
  }
  return state;
}

export interface ApplyFightArgs {
  readonly state: ArenaState;
  readonly opponent: ArenaOpponentDef;
  readonly won: boolean;
  readonly nowMs: number;
  readonly config: ArenaConfig;
}

export function applyFight(args: ApplyFightArgs): { state: ArenaState; rewards: ArenaFightRewards } {
  const { state, opponent, won, nowMs, config } = args;
  const ratingBefore = state.rating;
  const delta = won ? opponent.rewards.ratingWin : -opponent.rewards.ratingLoss;
  const ratingAfter = Math.max(0, ratingBefore + delta);
  const silver = won ? opponent.rewards.silver : 0;
  const xp = won ? opponent.rewards.xp : 0;

  const entry: ArenaHistoryEntry = {
    foughtAt: nowMs,
    opponentId: opponent.id,
    opponentName: opponent.name,
    won,
    ratingBefore,
    ratingAfter,
    silverGained: silver,
    xpGained: xp,
  };
  const history = [entry, ...state.history].slice(0, config.maxHistory);

  return {
    state: {
      ...state,
      rating: ratingAfter,
      peakRating: Math.max(state.peakRating, ratingAfter),
      fightsToday: state.fightsToday + 1,
      lastResetAt: state.lastResetAt === 0 ? nowMs : state.lastResetAt,
      totalWins: state.totalWins + (won ? 1 : 0),
      totalLosses: state.totalLosses + (won ? 0 : 1),
      history,
    },
    rewards: {
      silver,
      xp,
      ratingDelta: delta,
      ratingBefore,
      ratingAfter,
    },
  };
}

export function getOpponent(
  defs: readonly ArenaOpponentDef[],
  id: string,
): ArenaOpponentDef | undefined {
  return defs.find((d) => d.id === id);
}

export function validateArenaConfig(defs: readonly ArenaOpponentDef[]): readonly string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const d of defs) {
    if (ids.has(d.id)) issues.push('ID duplicado: ' + d.id);
    ids.add(d.id);
    if (d.entryCost < 0) issues.push(d.id + ': entryCost negativo');
    if (d.rewards.silver < 0) issues.push(d.id + ': rewards.silver negativo');
    if (d.stats.maxHp <= 0) issues.push(d.id + ': maxHp <= 0');
  }
  return issues;
}
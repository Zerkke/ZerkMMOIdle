export type ArenaTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface ArenaOpponentStats {
  readonly maxHp: number;
  readonly attack: number;
  readonly defense: number;
  readonly ap: number;
  readonly dp: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly lifesteal: number;
  readonly damageReduction: number;
  readonly attackIntervalMs: number;
}

export interface ArenaOpponentRewards {
  readonly silver: number;
  readonly xp: number;
  readonly ratingWin: number;
  readonly ratingLoss: number;
}

export interface ArenaOpponentDef {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly accentColor: string;
  readonly tier: ArenaTier;
  readonly rating: number;
  readonly level: number;
  readonly stats: ArenaOpponentStats;
  readonly entryCost: number;
  readonly rewards: ArenaOpponentRewards;
}

export interface ArenaHistoryEntry {
  readonly foughtAt: number;
  readonly opponentId: string;
  readonly opponentName: string;
  readonly won: boolean;
  readonly ratingBefore: number;
  readonly ratingAfter: number;
  readonly silverGained: number;
  readonly xpGained: number;
}

export interface ArenaState {
  readonly rating: number;
  readonly peakRating: number;
  readonly fightsToday: number;
  readonly lastResetAt: number;
  readonly totalWins: number;
  readonly totalLosses: number;
  readonly history: readonly ArenaHistoryEntry[];
}

export interface ArenaConfig {
  readonly startingRating: number;
  readonly fightsPerDay: number;
  readonly dailyResetMs: number;
  readonly ratingRange: number;
  readonly maxHistory: number;
}

export const DEFAULT_ARENA_CONFIG: ArenaConfig = {
  startingRating: 1000,
  fightsPerDay: 5,
  dailyResetMs: 24 * 60 * 60 * 1000,
  ratingRange: 400,
  maxHistory: 20,
};

export function emptyArenaState(): ArenaState {
  return {
    rating: DEFAULT_ARENA_CONFIG.startingRating,
    peakRating: DEFAULT_ARENA_CONFIG.startingRating,
    fightsToday: 0,
    lastResetAt: 0,
    totalWins: 0,
    totalLosses: 0,
    history: [],
  };
}

export interface ArenaFightRewards {
  readonly silver: number;
  readonly xp: number;
  readonly ratingDelta: number;
  readonly ratingBefore: number;
  readonly ratingAfter: number;
}

export interface ArenaFightResult {
  readonly opponent: ArenaOpponentDef;
  readonly won: boolean;
  readonly rewards: ArenaFightRewards;
  readonly combatLog: readonly string[];
}
export const PVP_SNAPSHOT_VERSION = 1;

export interface PvpSnapshotSkill {
  readonly id: string;
  readonly kind: 'damage' | 'heal';
  readonly cooldownMs: number;
  readonly resourceCost: number;
  readonly multiplier: number;
}

export interface PvpSnapshot {
  readonly version: number;
  readonly characterName: string;
  readonly characterLevel: number;
  readonly specId: string | null;
  readonly maxHp: number;
  readonly maxResource: number;
  readonly attack: number;
  readonly defense: number;
  readonly ap: number;
  readonly dp: number;
  readonly critChance: number;
  readonly critDamage: number;
  readonly lifesteal: number;
  readonly damageReduction: number;
  readonly hpRegenPerSec: number;
  readonly attackIntervalMs: number;
  readonly resourceRegenPerSec: number;
  readonly skills: readonly PvpSnapshotSkill[];
}

export interface PvpBuildRecord {
  readonly userId: string;              // em mock: 'local'
  readonly characterName: string;
  readonly characterLevel: number;
  readonly rating: number;
  readonly peakRating: number;
  readonly wins: number;
  readonly losses: number;
  readonly snapshot: PvpSnapshot;
  readonly updatedAt: number;
}

export interface PvpHistoryEntry {
  readonly foughtAt: number;
  readonly defenderId: string;
  readonly defenderName: string;
  readonly won: boolean;
  readonly attackerRatingBefore: number;
  readonly attackerRatingAfter: number;
  readonly defenderRatingBefore: number;
  readonly defenderRatingAfter: number;
}

export interface PvpState {
  readonly registeredBuild: PvpSnapshot | null;
  readonly registeredAt: number | null;
  readonly dailyAttacksUsed: number;
  readonly dailyResetAt: number;
  readonly localRating: number;
  readonly localPeakRating: number;
  readonly localWins: number;
  readonly localLosses: number;
  readonly history: readonly PvpHistoryEntry[];
}

export interface PvpConfig {
  readonly dailyAttacks: number;
  readonly dailyResetMs: number;
  readonly ratingRange: number;
  readonly kFactor: number;
  readonly maxHistory: number;
  readonly startingRating: number;
}

export const DEFAULT_PVP_CONFIG: PvpConfig = {
  dailyAttacks: 5,
  dailyResetMs: 24 * 60 * 60 * 1000,
  ratingRange: 500,
  kFactor: 32,
  maxHistory: 20,
  startingRating: 1000,
};

export function emptyPvpState(): PvpState {
  return {
    registeredBuild: null,
    registeredAt: null,
    dailyAttacksUsed: 0,
    dailyResetAt: 0,
    localRating: DEFAULT_PVP_CONFIG.startingRating,
    localPeakRating: DEFAULT_PVP_CONFIG.startingRating,
    localWins: 0,
    localLosses: 0,
    history: [],
  };
}
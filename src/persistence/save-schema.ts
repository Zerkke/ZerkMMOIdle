export const SAVE_SCHEMA_VERSION = 18;

export interface CharacterSnapshotV1 {
  readonly id: string;
  readonly name: string;
  readonly classId: string;
  readonly createdAt: number;
  readonly level: number;
  readonly experience: number;
  readonly silver: number;
  readonly progressionPoints: number;
  readonly hp: number;
  readonly resource: number;
  readonly unlocks: readonly string[];
}

export interface RandomAttributeRollSnapshot {
  readonly kind: string;
  readonly value: number;
}

export interface EssenceInstanceSnapshot {
  readonly itemId: string;
  readonly level: number;
}

export interface ItemStackSnapshot {
  readonly itemId: string;
  readonly quantity: number;
  readonly enhancementLevel: number;
  readonly durability: number | null;
  readonly randomAttributes: readonly RandomAttributeRollSnapshot[] | null;
  readonly essences: readonly (EssenceInstanceSnapshot | null)[] | null;
  readonly essenceLevel: number | null;
}

export interface InventorySnapshot {
  readonly capacity: number;
  readonly slots: readonly (ItemStackSnapshot | null)[];
}

export interface EquipmentSnapshot {
  readonly slots: Readonly<Record<string, ItemStackSnapshot>>;
}

export interface CombatSnapshot {
  readonly zoneId: string;
  readonly monsterId: string;
  readonly timeMs: number;
  readonly playerHp: number;
  readonly playerResource: number;
  readonly playerNextAttackAt: number;
  readonly playerSkillReadyAt: Readonly<Record<string, number>>;
  readonly monsterHp: number;
  readonly monsterNextAttackAt: number;
}

export interface CombatConfigSnapshot {
  readonly autoMode: boolean;
  readonly useSkills: boolean;
  readonly strategy: string;
  readonly skillPriority: readonly string[];
}

export interface EnhancementHistorySnapshot {
  readonly itemId: string;
  readonly previousLevel: number;
  readonly attemptedLevel: number;
  readonly success: boolean;
  readonly destroyed: boolean;
  readonly usedProtection: boolean;
  readonly timestamp: number;
}

export interface ProfessionStateSnapshot {
  readonly level: number;
  readonly experience: number;
  readonly mastery: number;
}

export interface ActivitySnapshot {
  readonly kind: 'gathering' | 'production';
  readonly targetId: string;
  readonly startedAt: number;
  readonly cycleMs: number;
  readonly batches: number;
  readonly completedActions: number;
}

export interface ActiveBuffSnapshot {
  readonly buffId: string;
  readonly kind: string;
  readonly magnitude: number;
  readonly appliedAt: number;
  readonly expiresAt: number;
}

export interface FarmPlotSnapshot {
  readonly id: number;
  readonly cropNodeId: string | null;
  readonly plantedAt: number;
  readonly readyAt: number;
}

export interface TransactionSnapshot {
  readonly id: number;
  readonly category: string;
  readonly silverDelta: number;
  readonly itemDeltas: readonly { readonly itemId: string; readonly delta: number }[];
  readonly label: string;
  readonly timestamp: number;
}

export interface IdleConfigSnapshot {
  readonly kind: 'combat' | 'gathering' | 'production';
  readonly targetId: string;
  readonly batchesPerCycle: number;
  readonly autoHpItemId: string | null;
  readonly autoHpThreshold: number;
}

export interface IdleReportSnapshot {
  readonly startedAt: number;
  readonly endedAt: number;
  readonly simulatedMs: number;
  readonly cappedMs: number;
  readonly wasCapped: boolean;
  readonly config: IdleConfigSnapshot;
  readonly outcome: string;
  readonly xpGained: number;
  readonly silverGained: number;
  readonly loot: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly kills: number;
  readonly actions: number;
  readonly batches: number;
  readonly consumablesUsed: number;
  readonly notes: string;
}

export interface TutorialProgressSnapshot {
  readonly stepId: string;
  readonly completed: boolean;
  readonly currentCount: number;
  readonly completedAt: number | null;
}

export interface TutorialStateSnapshot {
  readonly entries: readonly TutorialProgressSnapshot[];
  readonly rewardClaimed: readonly string[];
}

export interface QuestObjectiveProgressSnapshot {
  readonly objectiveId: string;
  readonly currentCount: number;
}

export interface QuestStateSnapshot {
  readonly questId: string;
  readonly status: string;
  readonly progress: readonly QuestObjectiveProgressSnapshot[];
  readonly startedAt: number | null;
  readonly completedAt: number | null;
  readonly rewardClaimed: boolean;
}

export interface SaveV12 {
  readonly schemaVersion: 12;
  readonly savedAt: number;
  readonly character: CharacterSnapshotV1;
  readonly inventory: InventorySnapshot;
  readonly warehouse: InventorySnapshot;
  readonly equipment: EquipmentSnapshot;
  readonly combat: CombatSnapshot | null;
  readonly combatConfig: CombatConfigSnapshot;
  readonly enhancementHistory: readonly EnhancementHistorySnapshot[];
  readonly professionStates: Readonly<Record<string, ProfessionStateSnapshot>>;
  readonly activity: ActivitySnapshot | null;
  readonly buffs: readonly ActiveBuffSnapshot[];
  readonly farm: readonly FarmPlotSnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
  readonly idleSetup: IdleConfigSnapshot | null;
  readonly lastIdleReport: IdleReportSnapshot | null;
  readonly tutorial: TutorialStateSnapshot | null;
  readonly quests: readonly QuestStateSnapshot[];
}

export interface TalentStateSnapshot {
  readonly ranks: Readonly<Record<string, number>>;
  readonly respecCount: number;
}

export interface SaveV13 {
  readonly schemaVersion: 13;
  readonly savedAt: number;
  readonly character: CharacterSnapshotV1;
  readonly inventory: InventorySnapshot;
  readonly warehouse: InventorySnapshot;
  readonly equipment: EquipmentSnapshot;
  readonly combat: CombatSnapshot | null;
  readonly combatConfig: CombatConfigSnapshot;
  readonly enhancementHistory: readonly EnhancementHistorySnapshot[];
  readonly professionStates: Readonly<Record<string, ProfessionStateSnapshot>>;
  readonly activity: ActivitySnapshot | null;
  readonly buffs: readonly ActiveBuffSnapshot[];
  readonly farm: readonly FarmPlotSnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
  readonly idleSetup: IdleConfigSnapshot | null;
  readonly lastIdleReport: IdleReportSnapshot | null;
  readonly tutorial: TutorialStateSnapshot | null;
  readonly quests: readonly QuestStateSnapshot[];
  readonly talents: TalentStateSnapshot;
}

export interface SpecializationStateSnapshot {
  readonly active: string | null;
  readonly changeCount: number;
  readonly lastChangeAt: number;
}

export interface SaveV14 {
  readonly schemaVersion: 14;
  readonly savedAt: number;
  readonly character: CharacterSnapshotV1;
  readonly inventory: InventorySnapshot;
  readonly warehouse: InventorySnapshot;
  readonly equipment: EquipmentSnapshot;
  readonly combat: CombatSnapshot | null;
  readonly combatConfig: CombatConfigSnapshot;
  readonly enhancementHistory: readonly EnhancementHistorySnapshot[];
  readonly professionStates: Readonly<Record<string, ProfessionStateSnapshot>>;
  readonly activity: ActivitySnapshot | null;
  readonly buffs: readonly ActiveBuffSnapshot[];
  readonly farm: readonly FarmPlotSnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
  readonly idleSetup: IdleConfigSnapshot | null;
  readonly lastIdleReport: IdleReportSnapshot | null;
  readonly tutorial: TutorialStateSnapshot | null;
  readonly quests: readonly QuestStateSnapshot[];
  readonly talents: TalentStateSnapshot;
  readonly specialization: SpecializationStateSnapshot;
}

export interface DungeonRunSnapshot {
  readonly dungeonId: string;
  readonly startedAt: number;
  readonly waveIndex: number;
  readonly monsterIndex: number;
  readonly totalKills: number;
}

export interface DungeonBestResultSnapshot {
  readonly dungeonId: string;
  readonly completions: number;
  readonly bestTimeMs: number | null;
  readonly firstClearedAt: number | null;
  readonly lastClearedAt: number | null;
}

export interface DungeonsStateSnapshot {
  readonly active: DungeonRunSnapshot | null;
  readonly results: Readonly<Record<string, DungeonBestResultSnapshot>>;
}

export interface SaveV15 {
  readonly schemaVersion: 15;
  readonly savedAt: number;
  readonly character: CharacterSnapshotV1;
  readonly inventory: InventorySnapshot;
  readonly warehouse: InventorySnapshot;
  readonly equipment: EquipmentSnapshot;
  readonly combat: CombatSnapshot | null;
  readonly combatConfig: CombatConfigSnapshot;
  readonly enhancementHistory: readonly EnhancementHistorySnapshot[];
  readonly professionStates: Readonly<Record<string, ProfessionStateSnapshot>>;
  readonly activity: ActivitySnapshot | null;
  readonly buffs: readonly ActiveBuffSnapshot[];
  readonly farm: readonly FarmPlotSnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
  readonly idleSetup: IdleConfigSnapshot | null;
  readonly lastIdleReport: IdleReportSnapshot | null;
  readonly tutorial: TutorialStateSnapshot | null;
  readonly quests: readonly QuestStateSnapshot[];
  readonly talents: TalentStateSnapshot;
  readonly specialization: SpecializationStateSnapshot;
  readonly dungeons: DungeonsStateSnapshot;
}

export interface ArenaHistorySnapshot {
  readonly foughtAt: number;
  readonly opponentId: string;
  readonly opponentName: string;
  readonly won: boolean;
  readonly ratingBefore: number;
  readonly ratingAfter: number;
  readonly silverGained: number;
  readonly xpGained: number;
}

export interface ArenaStateSnapshot {
  readonly rating: number;
  readonly peakRating: number;
  readonly fightsToday: number;
  readonly lastResetAt: number;
  readonly totalWins: number;
  readonly totalLosses: number;
  readonly history: readonly ArenaHistorySnapshot[];
}

export interface SaveV16 {
  readonly schemaVersion: 16;
  readonly savedAt: number;
  readonly character: CharacterSnapshotV1;
  readonly inventory: InventorySnapshot;
  readonly warehouse: InventorySnapshot;
  readonly equipment: EquipmentSnapshot;
  readonly combat: CombatSnapshot | null;
  readonly combatConfig: CombatConfigSnapshot;
  readonly enhancementHistory: readonly EnhancementHistorySnapshot[];
  readonly professionStates: Readonly<Record<string, ProfessionStateSnapshot>>;
  readonly activity: ActivitySnapshot | null;
  readonly buffs: readonly ActiveBuffSnapshot[];
  readonly farm: readonly FarmPlotSnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
  readonly idleSetup: IdleConfigSnapshot | null;
  readonly lastIdleReport: IdleReportSnapshot | null;
  readonly tutorial: TutorialStateSnapshot | null;
  readonly quests: readonly QuestStateSnapshot[];
  readonly talents: TalentStateSnapshot;
  readonly specialization: SpecializationStateSnapshot;
  readonly dungeons: DungeonsStateSnapshot;
  readonly arena: ArenaStateSnapshot;
}

export interface PvpSnapshotSnapshot {
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
  readonly skills: readonly {
    readonly id: string;
    readonly kind: 'damage' | 'heal';
    readonly cooldownMs: number;
    readonly resourceCost: number;
    readonly multiplier: number;
  }[];
}

export interface PvpHistorySnapshot {
  readonly foughtAt: number;
  readonly defenderId: string;
  readonly defenderName: string;
  readonly won: boolean;
  readonly attackerRatingBefore: number;
  readonly attackerRatingAfter: number;
  readonly defenderRatingBefore: number;
  readonly defenderRatingAfter: number;
}

export interface PvpStateSnapshot {
  readonly registeredBuild: PvpSnapshotSnapshot | null;
  readonly registeredAt: number | null;
  readonly dailyAttacksUsed: number;
  readonly dailyResetAt: number;
  readonly localRating: number;
  readonly localPeakRating: number;
  readonly localWins: number;
  readonly localLosses: number;
  readonly history: readonly PvpHistorySnapshot[];
}

export interface SaveV17 {
  readonly schemaVersion: 17;
  readonly savedAt: number;
  readonly character: CharacterSnapshotV1;
  readonly inventory: InventorySnapshot;
  readonly warehouse: InventorySnapshot;
  readonly equipment: EquipmentSnapshot;
  readonly combat: CombatSnapshot | null;
  readonly combatConfig: CombatConfigSnapshot;
  readonly enhancementHistory: readonly EnhancementHistorySnapshot[];
  readonly professionStates: Readonly<Record<string, ProfessionStateSnapshot>>;
  readonly activity: ActivitySnapshot | null;
  readonly buffs: readonly ActiveBuffSnapshot[];
  readonly farm: readonly FarmPlotSnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
  readonly idleSetup: IdleConfigSnapshot | null;
  readonly lastIdleReport: IdleReportSnapshot | null;
  readonly tutorial: TutorialStateSnapshot | null;
  readonly quests: readonly QuestStateSnapshot[];
  readonly talents: TalentStateSnapshot;
  readonly specialization: SpecializationStateSnapshot;
  readonly dungeons: DungeonsStateSnapshot;
  readonly arena: ArenaStateSnapshot;
  readonly pvp: PvpStateSnapshot;
}

export interface PendingSeasonRewardSnapshot {
  readonly seasonId: string;
  readonly seasonName: string;
  readonly finalRating: number;
  readonly finalTier: string;
  readonly finalRank: number | null;
  readonly silver: number;
  readonly xp: number;
  readonly label: string;
}

export interface RankingsStateSnapshot {
  readonly lastSeenSeasonId: string | null;
  readonly pendingSeasonReward: PendingSeasonRewardSnapshot | null;
}

export interface SaveV18 {
  readonly schemaVersion: 18;
  readonly savedAt: number;
  readonly character: CharacterSnapshotV1;
  readonly inventory: InventorySnapshot;
  readonly warehouse: InventorySnapshot;
  readonly equipment: EquipmentSnapshot;
  readonly combat: CombatSnapshot | null;
  readonly combatConfig: CombatConfigSnapshot;
  readonly enhancementHistory: readonly EnhancementHistorySnapshot[];
  readonly professionStates: Readonly<Record<string, ProfessionStateSnapshot>>;
  readonly activity: ActivitySnapshot | null;
  readonly buffs: readonly ActiveBuffSnapshot[];
  readonly farm: readonly FarmPlotSnapshot[];
  readonly transactions: readonly TransactionSnapshot[];
  readonly idleSetup: IdleConfigSnapshot | null;
  readonly lastIdleReport: IdleReportSnapshot | null;
  readonly tutorial: TutorialStateSnapshot | null;
  readonly quests: readonly QuestStateSnapshot[];
  readonly talents: TalentStateSnapshot;
  readonly specialization: SpecializationStateSnapshot;
  readonly dungeons: DungeonsStateSnapshot;
  readonly arena: ArenaStateSnapshot;
  readonly pvp: PvpStateSnapshot;
  readonly rankings: RankingsStateSnapshot;
}

export type SaveLatest = SaveV18;

export function emptySave(savedAt: number): SaveV18 {
  return {
    schemaVersion: 18,
    savedAt,
    character: {
      id: 'local', name: 'Aventureiro', classId: 'class.ferrumancer',
      createdAt: savedAt, level: 1, experience: 0, silver: 0,
      progressionPoints: 0, hp: 150, resource: 40, unlocks: [],
    },
    inventory: { capacity: 40, slots: [] },
    warehouse: { capacity: 100, slots: [] },
    equipment: { slots: {} },
    combat: null,
    combatConfig: { autoMode: true, useSkills: true, strategy: 'aggressive', skillPriority: [] },
    enhancementHistory: [],
    professionStates: {},
    activity: null,
    buffs: [],
    farm: [],
    transactions: [],
    idleSetup: null,
    lastIdleReport: null,
    tutorial: null,
    quests: [],
    talents: { ranks: {}, respecCount: 0 },
    specialization: { active: null, changeCount: 0, lastChangeAt: 0 },
    dungeons: { active: null, results: {} },
    arena: {
      rating: 1000,
      peakRating: 1000,
      fightsToday: 0,
      lastResetAt: 0,
      totalWins: 0,
      totalLosses: 0,
      history: [],
    },
    pvp: {
      registeredBuild: null,
      registeredAt: null,
      dailyAttacksUsed: 0,
      dailyResetAt: 0,
      localRating: 1000,
      localPeakRating: 1000,
      localWins: 0,
      localLosses: 0,
      history: [],
    },
    rankings: {
      lastSeenSeasonId: null,
      pendingSeasonReward: null,
    },
  };
}
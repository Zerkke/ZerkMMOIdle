export interface DungeonWaveEntry {
  readonly monsterId: string;
  readonly count: number;
}

export interface DungeonWave {
  readonly label: string;
  readonly monsters: readonly DungeonWaveEntry[];
  readonly isBoss: boolean;
}

export interface DungeonLootEntry {
  readonly itemId: string;
  readonly chance: number;
  readonly minQuantity: number;
  readonly maxQuantity: number;
}

export interface DungeonFirstClearBonus {
  readonly silver: number;
  readonly xp: number;
  readonly items: readonly { readonly itemId: string; readonly quantity: number }[];
}

export interface DungeonDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly icon: string;
  readonly accentColor: string;
  readonly requiredLevel: number;
  readonly recommendedAp: number;
  readonly recommendedDp: number;
  readonly entryCost: number;
  readonly timeLimitMs: number | null;
  readonly waves: readonly DungeonWave[];
  readonly completionSilver: number;
  readonly completionXp: number;
  readonly completionLoot: readonly DungeonLootEntry[];
  readonly firstClearBonus: DungeonFirstClearBonus | null;
}

export interface DungeonRunState {
  readonly dungeonId: string;
  readonly startedAt: number;
  readonly waveIndex: number;
  readonly monsterIndex: number;
  readonly totalKills: number;
}

export interface DungeonBestResult {
  readonly dungeonId: string;
  readonly completions: number;
  readonly bestTimeMs: number | null;
  readonly firstClearedAt: number | null;
  readonly lastClearedAt: number | null;
}

export interface DungeonsState {
  readonly active: DungeonRunState | null;
  readonly results: Readonly<Record<string, DungeonBestResult>>;
}

export function emptyDungeonsState(): DungeonsState {
  return { active: null, results: {} };
}
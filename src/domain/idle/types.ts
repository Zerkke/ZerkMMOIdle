import type { ItemId, NodeId, RecipeId, ZoneId } from '../ids';
import { BALANCE } from '../../data/balance.config';

export type IdleActivityKind = 'combat' | 'gathering' | 'production';

export interface IdleCombatConfig { readonly kind: 'combat'; readonly zoneId: ZoneId; }
export interface IdleGatheringConfig { readonly kind: 'gathering'; readonly nodeId: NodeId; }
export interface IdleProductionConfig { readonly kind: 'production'; readonly recipeId: RecipeId; readonly batchesPerCycle: number; }
export type IdleConfig = IdleCombatConfig | IdleGatheringConfig | IdleProductionConfig;

export interface IdleSetup {
  readonly activity: IdleConfig;
  readonly autoHpItemId: ItemId | null;
  readonly autoHpThreshold: number;
}

export type IdleOutcome =
  | 'completed' | 'stopped-no-tool' | 'stopped-tool-broken'
  | 'stopped-inventory-full' | 'stopped-dead' | 'stopped-no-materials' | 'stopped-no-hp-item';

export interface IdleLootEntry {
  readonly itemId: string;
  readonly quantity: number;
}

export interface IdleReport {
  readonly startedAt: number;
  readonly endedAt: number;
  readonly simulatedMs: number;
  readonly cappedMs: number;
  readonly wasCapped: boolean;
  readonly config: IdleConfig;
  readonly outcome: IdleOutcome;
  readonly xpGained: number;
  readonly silverGained: number;
  readonly loot: readonly IdleLootEntry[];
  readonly kills: number;
  readonly actions: number;
  readonly batches: number;
  readonly consumablesUsed: number;
  readonly notes: string;
}

export const MAX_OFFLINE_MS = BALANCE.idle.maxOfflineMs;
export const MAX_CLOCK_SKEW_MS = BALANCE.idle.maxClockSkewMs;
export const MAX_SIM_ITERATIONS = BALANCE.idle.maxSimIterations;
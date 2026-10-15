import type { ZoneId } from '../ids';

export type ZoneAccess = 'unlocked' | 'locked-level' | 'locked-quest';

export interface ZoneAccessInfo {
  readonly zoneId: ZoneId;
  readonly access: ZoneAccess;
  readonly reason: string;
  readonly currentLevel: number;
  readonly requiredLevel: number | null;
  readonly requiredQuestId: string | null;
}

export interface ZoneTreeNode {
  readonly zoneId: ZoneId;
  readonly depth: number;
  readonly children: readonly ZoneTreeNode[];
}
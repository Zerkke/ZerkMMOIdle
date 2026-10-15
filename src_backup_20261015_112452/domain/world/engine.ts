import type { ZoneDefinition } from '../content';
import type { ZoneId } from '../ids';
import type { ZoneAccessInfo, ZoneTreeNode } from './types';

export function evaluateZoneAccess(
  zone: ZoneDefinition,
  playerLevel: number,
  completedQuestIds: ReadonlySet<string>,
): ZoneAccessInfo {
  const cond = zone.unlockedBy;

  if (cond.kind === 'default') {
    return {
      zoneId: zone.id, access: 'unlocked', reason: 'Acesso inicial',
      currentLevel: playerLevel, requiredLevel: null, requiredQuestId: null,
    };
  }

  if (cond.kind === 'level') {
    if (playerLevel >= cond.value) {
      return {
        zoneId: zone.id, access: 'unlocked', reason: 'Nivel ' + playerLevel,
        currentLevel: playerLevel, requiredLevel: cond.value, requiredQuestId: null,
      };
    }
    return {
      zoneId: zone.id, access: 'locked-level',
      reason: 'Requer nivel ' + cond.value + ' (tens ' + playerLevel + ')',
      currentLevel: playerLevel, requiredLevel: cond.value, requiredQuestId: null,
    };
  }

  // cond.kind === 'quest'
  if (completedQuestIds.has(cond.questId)) {
    return {
      zoneId: zone.id, access: 'unlocked', reason: 'Missao completada',
      currentLevel: playerLevel, requiredLevel: null, requiredQuestId: cond.questId,
    };
  }
  return {
    zoneId: zone.id, access: 'locked-quest',
    reason: 'Requer completar missao',
    currentLevel: playerLevel, requiredLevel: null, requiredQuestId: cond.questId,
  };
}

/** Constroi arvore de zonas (raizes -> filhos). */
export function buildZoneTree(zones: readonly ZoneDefinition[]): readonly ZoneTreeNode[] {
  const byParent = new Map<string, ZoneDefinition[]>();
  const roots: ZoneDefinition[] = [];

  for (const z of zones) {
    if (z.parentZoneId === null) {
      roots.push(z);
    } else {
      const list = byParent.get(z.parentZoneId as string) ?? [];
      list.push(z);
      byParent.set(z.parentZoneId as string, list);
    }
  }

  function build(zone: ZoneDefinition, depth: number): ZoneTreeNode {
    const children = byParent.get(zone.id as string) ?? [];
    return {
      zoneId: zone.id,
      depth,
      children: children.map((c) => build(c, depth + 1)),
    };
  }

  return roots.map((r) => build(r, 0));
}

export function listZonesWithAccess(
  zones: readonly ZoneDefinition[],
  playerLevel: number,
  completedQuestIds: ReadonlySet<string>,
): readonly ZoneAccessInfo[] {
  return zones.map((z) => evaluateZoneAccess(z, playerLevel, completedQuestIds));
}

export function zoneAccessMap(
  zones: readonly ZoneDefinition[],
  playerLevel: number,
  completedQuestIds: ReadonlySet<string>,
): ReadonlyMap<ZoneId, ZoneAccessInfo> {
  const m = new Map<ZoneId, ZoneAccessInfo>();
  for (const z of zones) m.set(z.id, evaluateZoneAccess(z, playerLevel, completedQuestIds));
  return m;
}
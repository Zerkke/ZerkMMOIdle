import type { QuestDefinition, QuestEvent, QuestObjective, QuestObjectiveProgress, QuestState, QuestStatus } from './types';

export function newQuestStates(definitions: readonly QuestDefinition[]): QuestState[] {
  return definitions.map((d) => ({
    questId: d.id,
    status: 'locked' as QuestStatus,
    progress: d.objectives.map((o) => ({ objectiveId: o.id, currentCount: 0 })),
    startedAt: null,
    completedAt: null,
    rewardClaimed: false,
  }));
}

export function evaluateAvailability(
  states: readonly QuestState[],
  definitions: readonly QuestDefinition[],
  playerLevel: number,
): QuestState[] {
  const completedIds = new Set(states.filter((s) => s.status === 'completed').map((s) => s.questId as string));

  return states.map((s) => {
    if (s.status === 'active' || s.status === 'completed') return s;
    const def = definitions.find((d) => d.id === s.questId);
    if (!def) return s;

    const levelOk = playerLevel >= def.requiredLevel;
    const prereqOk = def.prerequisiteQuestId === null
      || completedIds.has(def.prerequisiteQuestId as string);

    const shouldBeAvailable = levelOk && prereqOk;
    if (shouldBeAvailable && s.status === 'locked') {
      return { ...s, status: 'available' as QuestStatus };
    }
    if (!shouldBeAvailable && s.status === 'available') {
      return { ...s, status: 'locked' as QuestStatus };
    }
    return s;
  });
}

export function acceptQuest(states: readonly QuestState[], questId: string, nowMs: number): QuestState[] {
  return states.map((s) => {
    if (s.questId !== questId) return s;
    if (s.status !== 'available') return s;
    return { ...s, status: 'active' as QuestStatus, startedAt: nowMs };
  });
}

export function isQuestComplete(state: QuestState, def: QuestDefinition): boolean {
  if (state.status !== 'active') return false;
  return def.objectives.every((o) => {
    const p = state.progress.find((pp) => pp.objectiveId === o.id);
    return p !== undefined && p.currentCount >= o.targetCount;
  });
}

export function applyQuestEvent(
  states: readonly QuestState[],
  definitions: readonly QuestDefinition[],
  event: QuestEvent,
): { states: QuestState[]; newlyCompleted: readonly string[] } {
  const newlyCompleted: string[] = [];
  const next = states.map((s) => {
    if (s.status !== 'active') return s;
    const def = definitions.find((d) => d.id === s.questId);
    if (!def) return s;

    const newProgress: QuestObjectiveProgress[] = s.progress.map((p) => {
      const obj = def.objectives.find((o) => o.id === p.objectiveId);
      if (!obj) return p;
      if (obj.kind !== event.kind) return p;
      if (obj.targetId !== null && obj.targetId !== event.targetId) return p;
      if (p.currentCount >= obj.targetCount) return p;
      const nextCount = Math.min(obj.targetCount, p.currentCount + event.amount);
      return { ...p, currentCount: nextCount };
    });

    const nextState: QuestState = { ...s, progress: newProgress };
    if (isQuestComplete(nextState, def)) {
      newlyCompleted.push(s.questId as string);
      return { ...nextState, status: 'completed' as QuestStatus, completedAt: Date.now() };
    }
    return nextState;
  });

  return { states: next, newlyCompleted };
}

export function claimReward(states: readonly QuestState[], questId: string): QuestState[] {
  return states.map((s) => {
    if (s.questId !== questId) return s;
    if (s.status !== 'completed') return s;
    if (s.rewardClaimed) return s;
    return { ...s, rewardClaimed: true };
  });
}

export function getObjectiveProgress(state: QuestState, objective: QuestObjective): number {
  return state.progress.find((p) => p.objectiveId === objective.id)?.currentCount ?? 0;
}

export function listByStatus(
  states: readonly QuestState[],
  definitions: readonly QuestDefinition[],
  status: QuestState['status'],
): { state: QuestState; def: QuestDefinition }[] {
  const out: { state: QuestState; def: QuestDefinition }[] = [];
  for (const s of states) {
    if (s.status !== status) continue;
    const def = definitions.find((d) => d.id === s.questId);
    if (def) out.push({ state: s, def });
  }
  return out;
}
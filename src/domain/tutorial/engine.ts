import type { TutorialProgressEntry, TutorialState, TutorialStep, TutorialTrigger } from './types';

export function newTutorialState(steps: readonly TutorialStep[]): TutorialState {
  return {
    entries: steps.map((s) => ({
      stepId: s.id,
      completed: false,
      currentCount: 0,
      completedAt: null,
    })),
    rewardClaimed: [],
  };
}

/** Devolve o proximo passo nao completado (ou null). */
export function currentStep(state: TutorialState, steps: readonly TutorialStep[]): TutorialStep | null {
  for (const step of steps) {
    const entry = state.entries.find((e) => e.stepId === step.id);
    if (entry && !entry.completed) return step;
  }
  return null;
}

export interface TriggerEvent {
  readonly kind: TutorialTrigger['kind'];
  readonly targetId: string | null;
  readonly amount: number;
}

/** Aplica um evento ao tutorial. Devolve o novo estado + passos completados. */
export function applyTutorialEvent(
  state: TutorialState,
  steps: readonly TutorialStep[],
  event: TriggerEvent,
  nowMs: number,
): { state: TutorialState; newlyCompleted: readonly TutorialStep[] } {
  const newlyCompleted: TutorialStep[] = [];
  const step = currentStep(state, steps);
  if (!step) return { state, newlyCompleted };

  const trigger = step.trigger;
  if (trigger.kind !== event.kind) return { state, newlyCompleted };

  // Filtros adicionais por tipo
  if (trigger.kind === 'kill-monster' && trigger.monsterId !== null) {
    if (trigger.monsterId !== event.targetId) return { state, newlyCompleted };
  }
  if (trigger.kind === 'gather-node' && trigger.nodeId !== null) {
    if (trigger.nodeId !== event.targetId) return { state, newlyCompleted };
  }
  if (trigger.kind === 'craft-recipe') {
    if (trigger.recipeId !== event.targetId) return { state, newlyCompleted };
  }
  if (trigger.kind === 'buy-item') {
    if (trigger.itemId !== event.targetId) return { state, newlyCompleted };
  }
  if (trigger.kind === 'enter-zone') {
    if (trigger.zoneId !== event.targetId) return { state, newlyCompleted };
  }

  // Atualizar contagem
  const newEntries: TutorialProgressEntry[] = [];
  let stepCompleted = false;
  for (const entry of state.entries) {
    if (entry.stepId !== step.id) {
      newEntries.push(entry);
      continue;
    }
    const nextCount = entry.currentCount + event.amount;
    const targetCount = getTargetCount(trigger);
    if (nextCount >= targetCount) {
      newEntries.push({ ...entry, currentCount: targetCount, completed: true, completedAt: nowMs });
      stepCompleted = true;
    } else {
      newEntries.push({ ...entry, currentCount: nextCount });
    }
  }

  const newState: TutorialState = { ...state, entries: newEntries };
  if (stepCompleted) {
    newlyCompleted.push(step);
  }
  return { state: newState, newlyCompleted };
}

function getTargetCount(trigger: TutorialTrigger): number {
  if (trigger.kind === 'kill-monster') return trigger.count;
  if (trigger.kind === 'gather-node') return trigger.count;
  if (trigger.kind === 'craft-recipe') return trigger.count;
  if (trigger.kind === 'plant-crop') return trigger.count;
  if (trigger.kind === 'harvest-crop') return trigger.count;
  if (trigger.kind === 'enhance-level') return 1;
  if (trigger.kind === 'equip-slot') return 1;
  if (trigger.kind === 'buy-item') return 1;
  if (trigger.kind === 'reach-level') return 1;
  if (trigger.kind === 'enter-zone') return 1;
  return 1;
}

export function markRewardClaimed(state: TutorialState, stepId: string): TutorialState {
  if (state.rewardClaimed.includes(stepId)) return state;
  return { ...state, rewardClaimed: [...state.rewardClaimed, stepId] };
}
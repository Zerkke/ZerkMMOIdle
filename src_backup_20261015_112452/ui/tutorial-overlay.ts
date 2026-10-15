import type { GameServices } from '../services/game-services';

export function renderTutorialOverlay(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'tutorial-overlay';

  const step = services.getCurrentTutorialStep();
  if (!step) {
    root.classList.add('tutorial-overlay--done');
    return root;
  }

  const state = services.getTutorialState();
  const entry = state.entries.find((e) => e.stepId === step.id);
  const currentCount = entry?.currentCount ?? 0;
  const targetCount = getTargetCount(step);

  const label = document.createElement('div');
  label.className = 'tutorial-overlay__label';
  label.textContent = 'OBJETIVO ATUAL';
  root.appendChild(label);

  const title = document.createElement('div');
  title.className = 'tutorial-overlay__title';
  title.textContent = step.title;
  root.appendChild(title);

  const desc = document.createElement('div');
  desc.className = 'tutorial-overlay__desc';
  desc.textContent = step.description;
  root.appendChild(desc);

  if (targetCount > 1) {
    const progress = document.createElement('div');
    progress.className = 'tutorial-overlay__progress';
    progress.textContent = currentCount + ' / ' + targetCount;
    root.appendChild(progress);
  }

  const reward = document.createElement('div');
  reward.className = 'tutorial-overlay__reward';
  reward.textContent = 'Recompensa: ' + step.rewardSilver + ' prata + ' + step.rewardXp + ' XP';
  root.appendChild(reward);

  return root;
}

function getTargetCount(step: NonNullable<ReturnType<GameServices['getCurrentTutorialStep']>>): number {
  const t = step.trigger;
  if (t.kind === 'kill-monster' || t.kind === 'gather-node' || t.kind === 'craft-recipe'
      || t.kind === 'plant-crop' || t.kind === 'harvest-crop') return t.count;
  return 1;
}
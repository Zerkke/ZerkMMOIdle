import type { GameServices } from '../services/game-services';
import type { QuestState, QuestDefinition, QuestObjective } from '../domain/quests/types';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';
import { getItemVisual } from './item-icons';

type QuestFilter = 'active' | 'available' | 'completed';
let currentFilter: QuestFilter = 'active';

export function renderQuestsPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content quest-sheet';

  root.appendChild(renderPanelHeader({
    icon: 'scroll',
    title: 'Missoes',
    subtitle: 'Completa objetivos e recebe recompensas',
  }));

  // Counts
  const activeCount = services.getQuestsByStatus('active').length;
  const availCount = services.getQuestsByStatus('available').length;
  const completedCount = services.getQuestsByStatus('completed').length;

  // Filter tabs
  const filterRow = document.createElement('div');
  filterRow.className = 'quest-tabs';
  const filters: { id: QuestFilter; label: string; count: number; color: string }[] = [
    { id: 'active', label: 'Ativas', count: activeCount, color: '#e8c977' },
    { id: 'available', label: 'Disponiveis', count: availCount, color: '#6ab87a' },
    { id: 'completed', label: 'Concluidas', count: completedCount, color: '#6a9ad8' },
  ];
  for (const f of filters) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'quest-tab' + (currentFilter === f.id ? ' quest-tab--active' : '');
    b.style.setProperty('--tab-color', f.color);
    const lbl = document.createElement('span');
    lbl.textContent = f.label;
    b.appendChild(lbl);
    const badge = document.createElement('span');
    badge.className = 'quest-tab__badge';
    badge.textContent = String(f.count);
    b.appendChild(badge);
    b.addEventListener('click', () => {
      currentFilter = f.id;
      rerender(services, root);
    });
    filterRow.appendChild(b);
  }
  root.appendChild(filterRow);

  // List
  const list = services.getQuestsByStatus(currentFilter);
  if (list.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'quest-empty';
    empty.textContent = currentFilter === 'active' ? 'Sem missoes ativas. Aceita uma missao disponivel.'
      : currentFilter === 'available' ? 'Sem missoes disponiveis. Sobe de nivel ou completa as atuais.'
      : 'Ainda nao concluis-te nenhuma missao.';
    root.appendChild(empty);
    return root;
  }

  const grid = document.createElement('div');
  grid.className = 'quest-grid';
  for (const q of list) grid.appendChild(renderQuestCard(services, q.state, q.def, root));
  root.appendChild(grid);

  return root;
}

function renderQuestCard(
  services: GameServices,
  state: QuestState,
  def: QuestDefinition,
  root: HTMLElement,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'quest-card quest-card--' + state.status;

  const cat = def.category === 'main' ? 'principal' : 'secundaria';
  card.classList.add('quest-card--' + cat);

  // Header
  const header = document.createElement('div');
  header.className = 'quest-card__head';

  const titleBox = document.createElement('div');
  titleBox.className = 'quest-card__title-box';

  const name = document.createElement('div');
  name.className = 'quest-card__name';
  name.textContent = def.name;
  titleBox.appendChild(name);

  const desc = document.createElement('div');
  desc.className = 'quest-card__desc';
  desc.textContent = def.description;
  titleBox.appendChild(desc);

  header.appendChild(titleBox);

  const badge = document.createElement('div');
  badge.className = 'quest-card__badge';
  badge.textContent = def.category === 'main' ? 'PRINCIPAL' : 'SECUNDARIA';
  header.appendChild(badge);

  card.appendChild(header);

  // Objetivos
  const objList = document.createElement('div');
  objList.className = 'quest-objs';
  let totalProgress = 0;
  let totalTargets = 0;
  for (const obj of def.objectives) {
    const p = state.progress.find((x) => x.objectiveId === obj.id)?.currentCount ?? 0;
    totalProgress += Math.min(p, obj.targetCount);
    totalTargets += obj.targetCount;
    objList.appendChild(renderObjective(state, obj));
  }
  card.appendChild(objList);

  // Progress bar total
  const pct = totalTargets > 0 ? (totalProgress / totalTargets) * 100 : 0;
  const track = document.createElement('div');
  track.className = 'quest-card__track';
  const fill = document.createElement('div');
  fill.className = 'quest-card__fill';
  fill.style.width = pct + '%';
  if (pct >= 100) fill.classList.add('quest-card__fill--done');
  track.appendChild(fill);
  card.appendChild(track);

  const pctLabel = document.createElement('div');
  pctLabel.className = 'quest-card__pct';
  pctLabel.textContent = Math.round(pct) + '% completo';
  card.appendChild(pctLabel);

  // Recompensas
  const reward = document.createElement('div');
  reward.className = 'quest-rewards';

  if (def.rewardXp > 0) reward.appendChild(rewardChip('level-up', def.rewardXp + ' XP', '#6ab87a'));
  if (def.rewardSilver > 0) reward.appendChild(rewardChip('coin', def.rewardSilver + ' prata', '#e8c977'));
  for (const item of def.rewardItems) {
    const iDef = services.registry.getItem(item.itemId);
    const visual = getItemVisual(item.itemId as string, iDef?.category ?? 'material');
    reward.appendChild(rewardChip(visual.icon, (iDef?.name ?? item.itemId) + ' x' + item.quantity, visual.tint));
  }
  if (reward.children.length > 0) card.appendChild(reward);

  // AÃ§Ãµes
  if (state.status === 'available') {
    card.appendChild(buildBtn('ACEITAR MISSAO', 'check', true, () => {
      services.acceptQuestById(def.id as string);
      rerender(services, root);
    }));
  } else if (state.status === 'completed' && !state.rewardClaimed) {
    card.appendChild(buildBtn('RECLAMAR RECOMPENSA', 'sparkles', true, () => {
      services.claimQuestReward(def.id as string);
      rerender(services, root);
    }));
  } else if (state.status === 'completed' && state.rewardClaimed) {
    const done = document.createElement('div');
    done.className = 'quest-done';
    done.appendChild(createIcon('check', 14));
    const t = document.createElement('span');
    t.textContent = 'CONCLUIDA';
    done.appendChild(t);
    card.appendChild(done);
  }

  return card;
}

function buildBtn(label: string, icon: 'check' | 'sparkles' | 'play', primary: boolean, onClick: () => void): HTMLElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'quest-btn' + (primary ? ' quest-btn--primary' : '');
  b.appendChild(createIcon(icon, 14));
  const t = document.createElement('span');
  t.textContent = label;
  b.appendChild(t);
  b.addEventListener('click', onClick);
  return b;
}

function rewardChip(icon: IconName, text: string, color: string): HTMLElement {
  const chip = document.createElement('span');
  chip.className = 'quest-reward-chip';
  chip.style.setProperty('--reward-color', color);
  chip.appendChild(createIcon(icon, 12));
  const t = document.createElement('span');
  t.textContent = text;
  chip.appendChild(t);
  return chip;
}

function renderObjective(state: QuestState, obj: QuestObjective): HTMLElement {
  const row = document.createElement('div');
  row.className = 'quest-obj';

  const progress = state.progress.find((p) => p.objectiveId === obj.id)?.currentCount ?? 0;
  const done = progress >= obj.targetCount;
  row.classList.add(done ? 'quest-obj--done' : 'quest-obj--pending');

  const marker = document.createElement('span');
  marker.className = 'quest-obj__marker';
  if (done) {
    marker.appendChild(createIcon('check', 12));
  } else {
    marker.textContent = '';
  }
  row.appendChild(marker);

  const text = document.createElement('span');
  text.className = 'quest-obj__text';
  text.textContent = obj.description;
  row.appendChild(text);

  if (obj.targetCount > 1) {
    const count = document.createElement('span');
    count.className = 'quest-obj__count';
    count.textContent = progress + '/' + obj.targetCount;
    row.appendChild(count);
  }

  return row;
}

function rerender(services: GameServices, container: HTMLElement): void {
  const fresh = renderQuestsPanel(services);
  container.replaceWith(fresh);
}
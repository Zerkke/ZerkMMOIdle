import type { GameServices } from '../services/game-services';
import type { QuestState, QuestDefinition, QuestObjective } from '../domain/quests/types';

let currentFilter: 'active' | 'available' | 'completed' = 'active';

export function renderQuestsPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  const header = document.createElement('h2');
  header.textContent = 'Missoes';
  root.appendChild(header);

  const filterRow = document.createElement('div');
  filterRow.className = 'quest-filters';

  const filters: { id: typeof currentFilter; label: string }[] = [
    { id: 'active', label: 'Ativas' },
    { id: 'available', label: 'Disponiveis' },
    { id: 'completed', label: 'Concluidas' },
  ];

  for (const f of filters) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'action-button' + (currentFilter === f.id ? ' action-button--active' : '');
    btn.textContent = f.label;
    btn.addEventListener('click', () => {
      currentFilter = f.id;
      rerender(services, root);
    });
    filterRow.appendChild(btn);
  }
  root.appendChild(filterRow);

  const counts = document.createElement('p');
  counts.className = 'muted';
  const activeCount = services.getQuestsByStatus('active').length;
  const availCount = services.getQuestsByStatus('available').length;
  const completedCount = services.getQuestsByStatus('completed').length;
  counts.textContent = activeCount + ' ativas | ' + availCount + ' disponiveis | ' + completedCount + ' concluidas';
  root.appendChild(counts);

  const list = services.getQuestsByStatus(currentFilter);
  if (list.length === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-state panel-state--empty';
    empty.textContent = currentFilter === 'active' ? 'Sem missoes ativas. Aceita uma missao disponivel.'
      : currentFilter === 'available' ? 'Sem missoes disponiveis. Sobe de nivel ou completa as atuais.'
      : 'Ainda nao concluis-te nenhuma missao.';
    root.appendChild(empty);
    return root;
  }

  for (const { state, def } of list) {
    root.appendChild(renderQuestCard(services, state, def, root));
  }

  return root;
}

function renderQuestCard(services: GameServices, state: QuestState, def: QuestDefinition, root: HTMLElement): HTMLElement {
  const card = document.createElement('div');
  card.className = 'quest-card quest-card--' + state.status;

  const header = document.createElement('div');
  header.className = 'quest-card__header';

  const name = document.createElement('h3');
  name.textContent = def.name;
  header.appendChild(name);

  const cat = document.createElement('span');
  cat.className = 'quest-card__category';
  cat.textContent = def.category === 'main' ? 'Principal' : 'Secundaria';
  header.appendChild(cat);

  card.appendChild(header);

  const desc = document.createElement('p');
  desc.className = 'quest-card__desc';
  desc.textContent = def.description;
  card.appendChild(desc);

  const objList = document.createElement('div');
  objList.className = 'quest-objectives';
  for (const obj of def.objectives) {
    objList.appendChild(renderObjective(state, obj));
  }
  card.appendChild(objList);

  const reward = document.createElement('div');
  reward.className = 'quest-rewards';
  const rewardLabel = document.createElement('span');
  rewardLabel.className = 'quest-rewards__label';
  rewardLabel.textContent = 'Recompensa:';
  reward.appendChild(rewardLabel);

  if (def.rewardSilver > 0) {
    const s = document.createElement('span');
    s.className = 'quest-reward__silver';
    s.textContent = def.rewardSilver + ' prata';
    reward.appendChild(s);
  }
  if (def.rewardXp > 0) {
    const x = document.createElement('span');
    x.className = 'quest-reward__xp';
    x.textContent = def.rewardXp + ' XP';
    reward.appendChild(x);
  }
  for (const item of def.rewardItems) {
    const iDef = services.registry.getItem(item.itemId);
    const i = document.createElement('span');
    i.className = 'quest-reward__item';
    i.textContent = (iDef?.name ?? item.itemId) + ' x' + item.quantity;
    reward.appendChild(i);
  }
  card.appendChild(reward);

  const actions = document.createElement('div');
  actions.className = 'quest-actions';

  if (state.status === 'available') {
    const accept = document.createElement('button');
    accept.type = 'button';
    accept.className = 'action-button action-button--primary';
    accept.textContent = 'Aceitar';
    accept.addEventListener('click', () => {
      services.acceptQuestById(def.id as string);
      rerender(services, root);
    });
    actions.appendChild(accept);
  } else if (state.status === 'completed' && !state.rewardClaimed) {
    const claim = document.createElement('button');
    claim.type = 'button';
    claim.className = 'action-button action-button--primary quest-claim';
    claim.textContent = 'Reclamar recompensa';
    claim.addEventListener('click', () => {
      services.claimQuestReward(def.id as string);
      rerender(services, root);
    });
    actions.appendChild(claim);
  } else if (state.status === 'completed' && state.rewardClaimed) {
    const done = document.createElement('span');
    done.className = 'quest-done-badge';
    done.textContent = 'Concluida';
    actions.appendChild(done);
  }

  if (actions.children.length > 0) card.appendChild(actions);

  return card;
}

function renderObjective(state: QuestState, obj: QuestObjective): HTMLElement {
  const row = document.createElement('div');
  row.className = 'quest-objective';

  const progress = state.progress.find((p) => p.objectiveId === obj.id)?.currentCount ?? 0;
  const done = progress >= obj.targetCount;
  row.classList.add(done ? 'quest-objective--done' : 'quest-objective--pending');

  const marker = document.createElement('span');
  marker.className = 'quest-objective__marker';
  marker.textContent = done ? 'OK' : '-';
  row.appendChild(marker);

  const text = document.createElement('span');
  text.className = 'quest-objective__text';
  text.textContent = obj.description;
  row.appendChild(text);

  if (obj.targetCount > 1) {
    const count = document.createElement('span');
    count.className = 'quest-objective__count';
    count.textContent = progress + '/' + obj.targetCount;
    row.appendChild(count);
  }

  return row;
}

function rerender(services: GameServices, container: HTMLElement): void {
  const fresh = renderQuestsPanel(services);
  container.replaceWith(fresh);
}
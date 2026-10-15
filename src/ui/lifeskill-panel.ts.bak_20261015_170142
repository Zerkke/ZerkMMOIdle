import type { GameServices } from '../services/game-services';
import type { GatheringNode } from '../domain/lifeskill/types';
import type { ProfessionId } from '../domain/ids';
import { asNodeId } from '../domain/ids';
import { renderPanelHeader, renderSectionTitle } from './panel-header';
import { createButton } from './button';
import { createIcon } from './icons';

export function renderLifeskillPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'pickaxe',
    title: 'Lifeskills',
    subtitle: 'Recolhe recursos pelo mundo',
  }));

  const activity = services.getActivity();
  if (activity) {
    root.appendChild(renderActivity(services, activity));
    return root;
  }

  root.appendChild(renderSectionTitle('Profissoes'));

  const profGrid = document.createElement('div');
  profGrid.className = 'prof-grid';
  for (const prof of services.registry.professions.values()) {
    const state = services.getProfessionState(prof.id);
    const card = document.createElement('div');
    card.className = 'prof-card';

    const name = document.createElement('div');
    name.className = 'prof-card__name';
    name.textContent = prof.name;
    card.appendChild(name);

    const info = document.createElement('div');
    info.className = 'prof-card__info';
    info.textContent = 'Nivel ' + state.level + '  ·  XP ' + state.experience + '  ·  Mastery ' + state.mastery;
    card.appendChild(info);

    profGrid.appendChild(card);
  }
  root.appendChild(profGrid);

  root.appendChild(renderSectionTitle('Ferramenta equipada'));

  const tool = services.getEquippedTool();
  const toolInfo = document.createElement('div');
  toolInfo.className = 'info-grid';
  if (tool) {
    toolInfo.appendChild(row('Categoria', tool.toolCategory));
    toolInfo.appendChild(row('Nivel', '+' + tool.enhancementLevel));
    toolInfo.appendChild(row('Durabilidade', tool.durability + ' / ' + tool.maxDurability));
  } else {
    const warn = document.createElement('p');
    warn.className = 'muted';
    warn.textContent = 'Nenhuma ferramenta equipada. Equipa uma no slot "tool".';
    toolInfo.appendChild(warn);
  }
  root.appendChild(toolInfo);

  root.appendChild(renderSectionTitle('Nos de recolha'));

  const byProf = new Map<ProfessionId, GatheringNode[]>();
  for (const node of services.registry.nodes.values()) {
    if (node.kind === 'crop') continue;
    const list = byProf.get(node.professionId) ?? [];
    list.push(node);
    byProf.set(node.professionId, list);
  }

  for (const [profId, nodes] of byProf) {
    const prof = services.registry.getProfession(profId);
    const profHeader = document.createElement('h4');
    profHeader.className = 'lifeskill-subhead';
    profHeader.textContent = prof?.name ?? profId;
    root.appendChild(profHeader);

    for (const node of nodes) {
      const card = document.createElement('div');
      card.className = 'node-card';

      const n = document.createElement('h3');
      n.textContent = node.name;
      card.appendChild(n);

      const d = document.createElement('p');
      d.textContent = node.description;
      card.appendChild(d);

      const meta = document.createElement('p');
      meta.className = 'muted';
      meta.textContent = 'Nivel ' + node.requiredLevel + '  ·  ' + (node.baseTimeMs / 1000).toFixed(1) + 's por acao  ·  Ferramenta: ' + (node.requiredTool ?? '—');
      card.appendChild(meta);

      const check = services.canGatherAt(asNodeId(node.id as string));

      card.appendChild(createButton({
        label: 'Recolher x5',
        icon: 'pickaxe',
        variant: check.ok ? 'primary' : 'default',
        disabled: !check.ok,
        title: check.reason ?? '',
        onClick: () => { services.startGathering(asNodeId(node.id as string), 5); },
      }));

      if (!check.ok && check.reason) {
        const reason = document.createElement('p');
        reason.className = 'node-warning';
        reason.textContent = check.reason;
        card.appendChild(reason);
      }

      root.appendChild(card);
    }
  }

  return root;
}

function renderActivity(services: GameServices, activity: NonNullable<ReturnType<GameServices['getActivity']>>): HTMLElement {
  const box = document.createElement('div');
  box.className = 'activity-box';

  const h = document.createElement('h3');
  h.textContent = activity.kind === 'gathering' ? 'A recolher' : 'A produzir';
  box.appendChild(h);

  const name = document.createElement('p');
  name.className = 'activity-box__name';
  name.textContent = activity.targetName;
  box.appendChild(name);

  const progress = Math.min(1, activity.completedActions / activity.batches);
  const track = document.createElement('div');
  track.className = 'bar__track';
  const fill = document.createElement('div');
  fill.className = 'bar__fill';
  fill.style.width = (progress * 100).toFixed(1) + '%';
  track.appendChild(fill);
  box.appendChild(track);

  const info = document.createElement('div');
  info.className = 'info-grid';
  info.appendChild(row('Acoes', activity.completedActions + ' / ' + activity.batches));
  info.appendChild(row('Por acao', (activity.cycleMs / 1000).toFixed(1) + 's'));
  box.appendChild(info);

  box.appendChild(createButton({
    label: 'Cancelar',
    icon: 'close',
    variant: 'danger',
    onClick: () => services.cancelActivity(),
  }));

  return box;
}

function row(label: string, value: string): HTMLElement {
  const r = document.createElement('div');
  r.className = 'info-row';
  const l = document.createElement('span');
  l.className = 'info-row__label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'info-row__value';
  v.textContent = value;
  r.appendChild(l);
  r.appendChild(v);
  return r;
}

void createIcon;
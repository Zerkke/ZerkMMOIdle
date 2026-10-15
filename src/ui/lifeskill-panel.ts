import type { GameServices } from '../services/game-services';
import type { GatheringNode } from '../domain/lifeskill/types';
import type { ProfessionId } from '../domain/ids';
import { asNodeId } from '../domain/ids';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';

export function renderLifeskillPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content life-sheet';

  root.appendChild(renderPanelHeader({
    icon: 'pickaxe',
    title: 'Lifeskills',
    subtitle: 'Recolhe recursos pelo mundo',
  }));

  const activity = services.getActivity();
  if (activity) {
    root.appendChild(buildActiveActivity(services, activity));
    return root;
  }

  root.appendChild(sectionTitle('Profissoes'));
  root.appendChild(buildProfessions(services));

  root.appendChild(sectionTitle('Ferramenta equipada'));
  root.appendChild(buildTool(services));

  root.appendChild(sectionTitle('Nos de recolha'));
  root.appendChild(buildNodes(services));

  return root;
}

// ============================================================
// Activity in progress
// ============================================================
function buildActiveActivity(
  services: GameServices,
  activity: NonNullable<ReturnType<GameServices['getActivity']>>,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'life-active';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'life-active__icon';
  iconWrap.appendChild(createIcon(activity.kind === 'gathering' ? 'pickaxe' : 'anvil', 56));
  box.appendChild(iconWrap);

  const title = document.createElement('div');
  title.className = 'life-active__title';
  title.textContent = activity.kind === 'gathering' ? 'A RECOLHER' : 'A PRODUZIR';
  box.appendChild(title);

  const name = document.createElement('div');
  name.className = 'life-active__name';
  name.textContent = activity.targetName;
  box.appendChild(name);

  const progress = Math.min(1, activity.completedActions / Math.max(1, activity.batches));
  const track = document.createElement('div');
  track.className = 'life-active__track';
  const fill = document.createElement('div');
  fill.className = 'life-active__fill';
  fill.style.width = (progress * 100).toFixed(1) + '%';
  track.appendChild(fill);
  box.appendChild(track);

  const pct = document.createElement('div');
  pct.className = 'life-active__pct';
  pct.textContent = (progress * 100).toFixed(0) + '%';
  box.appendChild(pct);

  const info = document.createElement('div');
  info.className = 'life-active__info';
  info.appendChild(infoLine('Acoes', activity.completedActions + ' / ' + activity.batches));
  info.appendChild(infoLine('Por acao', (activity.cycleMs / 1000).toFixed(1) + 's'));
  box.appendChild(info);

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'life-cancel';
  cancel.appendChild(createIcon('close', 14));
  const lbl = document.createElement('span');
  lbl.textContent = 'CANCELAR';
  cancel.appendChild(lbl);
  cancel.addEventListener('click', () => services.cancelActivity());
  box.appendChild(cancel);

  return box;
}

// ============================================================
// Professions grid
// ============================================================
const PROF_ICONS: Record<string, IconName> = {
  'profession.mining': 'pickaxe',
  'profession.woodcutting': 'axe',
  'profession.herbalism': 'leaf',
  'profession.fishing': 'fish',
  'profession.hunting': 'bow',
  'profession.crafting': 'anvil',
  'profession.cooking': 'bowl',
  'profession.alchemy': 'flask',
  'profession.agriculture': 'wheat',
  'profession.processing': 'hammer',
};

const PROF_COLORS: Record<string, string> = {
  'profession.mining': '#8a9aa8',
  'profession.woodcutting': '#8a6a3a',
  'profession.herbalism': '#6ab87a',
  'profession.fishing': '#6a9ad8',
  'profession.hunting': '#a86ec8',
  'profession.crafting': '#e8a848',
  'profession.cooking': '#d8a868',
  'profession.alchemy': '#d84848',
  'profession.agriculture': '#d8c878',
  'profession.processing': '#a8b8c8',
};

function buildProfessions(services: GameServices): HTMLElement {
  const grid = document.createElement('div');
  grid.className = 'life-profs';

  for (const prof of services.registry.professions.values()) {
    const state = services.getProfessionState(prof.id);
    const icon = PROF_ICONS[prof.id as string] ?? 'briefcase';
    const color = PROF_COLORS[prof.id as string] ?? '#e8c977';

    const card = document.createElement('div');
    card.className = 'life-prof';
    card.style.setProperty('--prof-color', color);

    const ic = document.createElement('div');
    ic.className = 'life-prof__icon';
    ic.appendChild(createIcon(icon, 26));
    card.appendChild(ic);

    const name = document.createElement('div');
    name.className = 'life-prof__name';
    name.textContent = prof.name;
    card.appendChild(name);

    const lvl = document.createElement('div');
    lvl.className = 'life-prof__level';
    lvl.textContent = 'NIVEL ' + state.level;
    card.appendChild(lvl);

    const xp = document.createElement('div');
    xp.className = 'life-prof__xp';
    xp.textContent = 'XP ' + state.experience + ' - Mastery ' + state.mastery;
    card.appendChild(xp);

    grid.appendChild(card);
  }
  return grid;
}

// ============================================================
// Tool
// ============================================================
function buildTool(services: GameServices): HTMLElement {
  const tool = services.getEquippedTool();
  const wrap = document.createElement('div');
  wrap.className = 'life-tool';

  if (!tool) {
    const warn = document.createElement('div');
    warn.className = 'life-tool__empty';
    warn.textContent = 'Nenhuma ferramenta equipada. Equipa uma no slot "tool".';
    wrap.appendChild(warn);
    return wrap;
  }

  const toolIcon: IconName = tool.toolCategory === 'pickaxe' ? 'pickaxe' : tool.toolCategory === 'axe' ? 'axe' : tool.toolCategory === 'fishing_rod' ? 'fish' : tool.toolCategory === 'sickle' ? 'leaf' : 'hammer';
  const ic = document.createElement('div');
  ic.className = 'life-tool__icon';
  ic.appendChild(createIcon(toolIcon, 36));
  wrap.appendChild(ic);

  const info = document.createElement('div');
  info.className = 'life-tool__info';
  const t = document.createElement('div');
  t.className = 'life-tool__name';
  t.textContent = tool.toolCategory.replace(/_/g, ' ') + ' +' + tool.enhancementLevel;
  info.appendChild(t);
  const sub = document.createElement('div');
  sub.className = 'life-tool__sub';
  sub.textContent = 'Categoria: ' + tool.toolCategory;
  info.appendChild(sub);
  wrap.appendChild(info);

  const dur = document.createElement('div');
  dur.className = 'life-tool__dur';
  const durPct = tool.maxDurability > 0 ? tool.durability / tool.maxDurability : 0;
  dur.classList.add(durPct < 0.25 ? 'life-tool__dur--low' : durPct < 0.5 ? 'life-tool__dur--mid' : 'life-tool__dur--ok');
  dur.innerHTML = '<b>' + tool.durability + '</b> / ' + tool.maxDurability;
  wrap.appendChild(dur);

  return wrap;
}

// ============================================================
// Nodes
// ============================================================
function buildNodes(services: GameServices): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'life-nodes';

  const byProf = new Map<ProfessionId, GatheringNode[]>();
  for (const node of services.registry.nodes.values()) {
    if (node.kind === 'crop') continue;
    const list = byProf.get(node.professionId) ?? [];
    list.push(node);
    byProf.set(node.professionId, list);
  }

  for (const [profId, nodes] of byProf) {
    const prof = services.registry.getProfession(profId);
    const head = document.createElement('div');
    head.className = 'life-nodes__head';
    head.textContent = prof?.name ?? profId;
    wrap.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'life-nodes__grid';

    for (const node of nodes) {
      const check = services.canGatherAt(asNodeId(node.id as string));
      const ok = check.ok;
      const color = PROF_COLORS[profId as string] ?? '#e8c977';

      const card = document.createElement('div');
      card.className = 'life-node' + (ok ? '' : ' life-node--locked');
      card.style.setProperty('--node-color', color);

      const iconWrap = document.createElement('div');
      iconWrap.className = 'life-node__icon';
      iconWrap.appendChild(createIcon(PROF_ICONS[profId as string] ?? 'ore', 32));
      card.appendChild(iconWrap);

      const name = document.createElement('div');
      name.className = 'life-node__name';
      name.textContent = node.name;
      card.appendChild(name);

      const meta = document.createElement('div');
      meta.className = 'life-node__meta';
      meta.textContent = 'Nv ' + node.requiredLevel + ' - ' + (node.baseTimeMs / 1000).toFixed(1) + 's';
      card.appendChild(meta);

      if (!ok && check.reason) {
        const reason = document.createElement('div');
        reason.className = 'life-node__reason';
        reason.textContent = check.reason;
        card.appendChild(reason);
      }

      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'life-node__btn' + (ok ? ' life-node__btn--ok' : '');
      btn.disabled = !ok;
      btn.appendChild(createIcon('pickaxe', 12));
      const lbl = document.createElement('span');
      lbl.textContent = 'RECOLHER x5';
      btn.appendChild(lbl);
      btn.addEventListener('click', () => services.startGathering(asNodeId(node.id as string), 5));
      card.appendChild(btn);

      grid.appendChild(card);
    }
    wrap.appendChild(grid);
  }

  return wrap;
}

// ============================================================
// Sections
// ============================================================
function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'life-section';
  el.textContent = text;
  return el;
}

function infoLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'life-info-line';
  const l = document.createElement('span');
  l.className = 'life-info-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'life-info-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}
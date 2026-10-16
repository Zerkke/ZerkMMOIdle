import type { GameServices } from '../services/game-services';
import type { TalentNodeView } from '../services/talents-service';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';

export function renderTalentsPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content talents-panel';

  root.appendChild(renderPanelHeader({
    icon: 'sparkles',
    title: 'Talentos',
    subtitle: 'Investe pontos para especializar o teu Ferrumancer',
  }));

  const view = services.getTalentsService().buildView();

  // Barra de estado
  const bar = document.createElement('div');
  bar.className = 'talents-status';
  bar.appendChild(statusChip('Pontos disponiveis', String(view.availablePoints), 'sparkles', '#6ab87a'));
  bar.appendChild(statusChip('Pontos gastos', String(view.spentPoints), 'check', '#6a9ad8'));
  bar.appendChild(statusChip('Resets feitos', String(view.respecCount), 'hourglass', '#a86ec8'));
  root.appendChild(bar);

  // Respec
  const respecRow = document.createElement('div');
  respecRow.className = 'talents-respec';
  const respecBtn = document.createElement('button');
  respecBtn.type = 'button';
  respecBtn.className = 'talents-respec__btn';
  respecBtn.disabled = view.spentPoints === 0;
  respecBtn.appendChild(createIcon('close', 14));
  const rl = document.createElement('span');
  rl.textContent = 'RESETAR TALENTOS (' + view.respecCost + ' prata)';
  respecBtn.appendChild(rl);
  respecBtn.addEventListener('click', () => {
    if (!window.confirm('Resetar todos os talentos? Custa ' + view.respecCost + ' prata.')) return;
    const r = services.respecTalents();
    if (r.ok) rerender(services, root);
  });
  respecRow.appendChild(respecBtn);
  root.appendChild(respecRow);

  // Ramos
  const branchesWrap = document.createElement('div');
  branchesWrap.className = 'talents-branches';
  for (const branch of view.branches) {
    branchesWrap.appendChild(renderBranch(services, branch, root));
  }
  root.appendChild(branchesWrap);

  return root;
}

function renderBranch(
  services: GameServices,
  branch: { branch: string; label: string; color: string; nodes: readonly TalentNodeView[] },
  root: HTMLElement,
): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'talents-branch';
  wrap.style.setProperty('--branch-color', branch.color);

  const head = document.createElement('div');
  head.className = 'talents-branch__head';
  const h = document.createElement('span');
  h.textContent = branch.label;
  head.appendChild(h);
  wrap.appendChild(head);

  const grid = document.createElement('div');
  grid.className = 'talents-branch__grid';

  for (const node of branch.nodes) {
    grid.appendChild(renderNode(services, node, root));
  }

  wrap.appendChild(grid);
  return wrap;
}

function renderNode(services: GameServices, node: TalentNodeView, root: HTMLElement): HTMLElement {
  const card = document.createElement('div');
  card.className = 'talent-node';
  if (node.rank > 0) card.classList.add('talent-node--invested');
  if (node.canLearnResult.ok) card.classList.add('talent-node--available');
  if (!node.prerequisitesOk) card.classList.add('talent-node--locked');

  const head = document.createElement('div');
  head.className = 'talent-node__head';

  const ic = document.createElement('div');
  ic.className = 'talent-node__icon';
  ic.appendChild(createIcon(node.def.icon as IconName, 22));
  head.appendChild(ic);

  const name = document.createElement('div');
  name.className = 'talent-node__name';
  name.textContent = node.def.name;
  head.appendChild(name);

  const rank = document.createElement('div');
  rank.className = 'talent-node__rank';
  rank.textContent = node.rank + '/' + node.def.maxRank;
  head.appendChild(rank);

  card.appendChild(head);

  const desc = document.createElement('p');
  desc.className = 'talent-node__desc';
  desc.textContent = node.def.description;
  card.appendChild(desc);

  // Efeito por rank
  const effect = document.createElement('div');
  effect.className = 'talent-node__effect';
  effect.textContent = describeEffect(node);
  card.appendChild(effect);

  // Prereqs
  if (node.def.prerequisites.length > 0) {
    const preq = document.createElement('div');
    preq.className = 'talent-node__prereq';
    for (const p of node.def.prerequisites) {
      const has = services.getTalentsService().getRank(p) > 0;
      const chip = document.createElement('span');
      chip.className = 'talent-prereq-chip' + (has ? ' talent-prereq-chip--ok' : '');
      chip.textContent = prettyId(p);
      preq.appendChild(chip);
    }
    card.appendChild(preq);
  }

  // Ação
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'talent-node__btn';
  if (!node.canLearnResult.ok) {
    btn.disabled = true;
    const reasonMap: Record<string, string> = {
      'max-rank': 'MAX',
      'not-enough-points': 'SEM PONTOS',
      'missing-prerequisite': 'PREREQ',
      'level-too-low': 'NIVEL ' + node.def.requiredCharacterLevel,
      'unknown-talent': 'ERRO',
    };
    btn.textContent = reasonMap[node.canLearnResult.reason ?? ''] ?? 'BLOQUEADO';
  } else {
    btn.textContent = '+' + node.canLearnResult.nextRankCost;
    btn.addEventListener('click', () => {
      if (services.spendTalentPoint(node.def.id)) rerender(services, root);
    });
  }
  card.appendChild(btn);

  return card;
}

function describeEffect(node: TalentNodeView): string {
  const e = node.def.effect;
  const perRank = e.value;
  const current = perRank * node.rank;
  const next = perRank * (node.rank + 1);
  const fmt = (v: number): string => {
    switch (e.kind) {
      case 'crit-chance':
      case 'crit-damage':
      case 'lifesteal':
      case 'damage-reduction':
      case 'gather-yield':
      case 'xp-bonus':
      case 'silver-bonus':
        return (v * 100).toFixed(2) + '%';
      case 'hp-regen':
        return v.toFixed(1) + '/s';
      default:
        return '+' + v;
    }
  };
  if (node.rank >= node.def.maxRank) return 'Atual: ' + fmt(current);
  if (node.rank === 0) return 'Proximo: ' + fmt(next);
  return 'Atual: ' + fmt(current) + ' -> ' + fmt(next);
}

function statusChip(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const chip = document.createElement('div');
  chip.className = 'talents-status__chip';
  chip.style.setProperty('--chip-color', color);
  chip.appendChild(createIcon(icon, 16));
  const l = document.createElement('span');
  l.className = 'talents-status__label';
  l.textContent = label;
  chip.appendChild(l);
  const v = document.createElement('span');
  v.className = 'talents-status__value';
  v.textContent = value;
  chip.appendChild(v);
  return chip;
}

function prettyId(id: string): string {
  const parts = id.split('.');
  const last = parts[parts.length - 1] ?? id;
  return last.replace(/-/g, ' ');
}

function rerender(services: GameServices, container: HTMLElement): void {
  const fresh = renderTalentsPanel(services);
  container.replaceWith(fresh);
}
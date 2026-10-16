import type { GameServices } from '../services/game-services';
import { renderPanelHeader } from './panel-header';
import { renderPvpPanel } from './pvp-panel';
import { createIcon, type IconName } from './icons';
import type { ArenaOpponentView } from '../services/arena-service';
import type { ArenaFightResult } from '../domain/arena/types';

type ArenaTab = 'ai' | 'pvp';

let activeArenaTab: ArenaTab = 'ai';

export function renderArenaPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content arena-panel';

  root.appendChild(renderPanelHeader({
    icon: 'flame',
    title: 'Arena',
    subtitle: 'Combate contra IA ou contra outras builds de jogadores.',
  }));

  // Sub-tabs
  const tabs = document.createElement('div');
  tabs.className = 'arena-subtabs';
  const defs: { id: ArenaTab; label: string; icon: IconName }[] = [
    { id: 'ai', label: 'Contra IA', icon: 'sparkles' },
    { id: 'pvp', label: 'Contra Jogadores', icon: 'swords' },
  ];
  for (const t of defs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'arena-subtab' + (activeArenaTab === t.id ? ' arena-subtab--active' : '');
    b.appendChild(createIcon(t.icon, 16));
    const lbl = document.createElement('span');
    lbl.textContent = t.label;
    b.appendChild(lbl);
    b.addEventListener('click', () => {
      activeArenaTab = t.id;
      const fresh = renderArenaPanel(services);
      root.replaceWith(fresh);
    });
    tabs.appendChild(b);
  }
  root.appendChild(tabs);

  const content = document.createElement('div');
  content.className = 'arena-content';
  if (activeArenaTab === 'ai') {
    content.appendChild(renderAiArena(services));
  } else {
    content.appendChild(renderPvpPanel(services));
  }
  root.appendChild(content);

  return root;
}

function renderAiArena(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'arena-ai-content';

  const svc = services.getArenaService();
  const view = svc.buildView(Date.now());
  const tierColor = tierColorFor(view.tier);

  const status = document.createElement('div');
  status.className = 'arena-status';
  status.style.setProperty('--tier-color', tierColor);
  status.appendChild(chip('Rating', String(view.rating), 'level-up', tierColor));
  status.appendChild(chip('Escalao', tierLabel(view.tier), 'shield', tierColor));
  status.appendChild(chip('Recorde', String(view.peakRating), 'sparkles', '#e8c977'));
  status.appendChild(chip('Lutas hoje', view.fightsToday + ' / ' + view.fightsPerDay, 'hourglass', '#6a9ad8'));
  status.appendChild(chip('V / D', view.totalWins + ' / ' + view.totalLosses, 'sword', '#6ab87a'));
  root.appendChild(status);

  root.appendChild(sectionTitle('Adversarios'));
  const grid = document.createElement('div');
  grid.className = 'arena-grid';
  for (const v of view.opponents) grid.appendChild(buildOpponentCard(services, v, root));
  root.appendChild(grid);

  if (view.history.length > 0) {
    root.appendChild(sectionTitle('Historico'));
    const list = document.createElement('div');
    list.className = 'arena-history';
    for (const h of view.history) {
      const row = document.createElement('div');
      row.className = 'arena-history__row' + (h.won ? ' arena-history__row--win' : ' arena-history__row--loss');
      const d = new Date(h.foughtAt);
      const dateStr = d.toLocaleDateString('pt-PT') + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
      const delta = h.ratingAfter - h.ratingBefore;
      const sign = delta >= 0 ? '+' : '';
      row.innerHTML =
        '<span class="arena-history__date">' + dateStr + '</span>' +
        '<span class="arena-history__name">' + (h.won ? 'V ' : 'D ') + h.opponentName + '</span>' +
        '<span class="arena-history__delta">' + sign + delta + ' rating</span>';
      list.appendChild(row);
    }
    root.appendChild(list);
  }

  return root;
}

function buildOpponentCard(
  services: GameServices,
  v: ArenaOpponentView,
  root: HTMLElement,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'arena-card';
  card.style.setProperty('--opp-color', v.def.accentColor);
  if (!v.inRange) card.classList.add('arena-card--out-of-range');
  if (!v.canFight.ok && v.inRange) card.classList.add('arena-card--locked');

  const head = document.createElement('div');
  head.className = 'arena-card__head';
  const ic = document.createElement('div');
  ic.className = 'arena-card__icon';
  ic.appendChild(createIcon(v.def.icon as IconName, 28));
  head.appendChild(ic);
  const name = document.createElement('div');
  name.className = 'arena-card__name';
  name.textContent = v.def.name;
  head.appendChild(name);
  const tier = document.createElement('div');
  tier.className = 'arena-card__tier';
  tier.textContent = tierLabel(v.def.tier);
  head.appendChild(tier);
  card.appendChild(head);

  const desc = document.createElement('p');
  desc.className = 'arena-card__desc';
  desc.textContent = v.def.description;
  card.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 'arena-card__meta';
  meta.appendChild(metaChip('level-up', 'Nv ' + v.def.level));
  meta.appendChild(metaChip('shield', 'Rating ' + v.def.rating));
  meta.appendChild(metaChip('coin', v.def.entryCost + ' prata'));
  card.appendChild(meta);

  const stats = document.createElement('div');
  stats.className = 'arena-card__stats';
  stats.appendChild(statLine('HP', String(v.def.stats.maxHp)));
  stats.appendChild(statLine('ATQ', String(v.def.stats.attack)));
  stats.appendChild(statLine('DEF', String(v.def.stats.defense)));
  stats.appendChild(statLine('CRIT', (v.def.stats.critChance * 100).toFixed(0) + '%'));
  card.appendChild(stats);

  const reward = document.createElement('div');
  reward.className = 'arena-card__reward';
  reward.textContent = 'Ganho: +' + v.def.rewards.silver + ' prata, +' + v.def.rewards.xp + ' XP, ' + v.def.rewards.ratingWin + ' rating';
  card.appendChild(reward);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'arena-card__btn';
  if (!v.inRange) {
    btn.disabled = true;
    btn.textContent = 'FORA DO ALCANCE';
  } else if (v.canFight.ok) {
    btn.textContent = 'DESAFIAR';
    btn.addEventListener('click', () => {
      if (!window.confirm('Desafiar ' + v.def.name + '? Custa ' + v.def.entryCost + ' prata.')) return;
      const result = services.fightArena(v.def.id);
      if (result) showResultModal(services, result, root);
    });
  } else {
    btn.disabled = true;
    const reasonMap: Record<string, string> = {
      'daily-limit': 'SEM LUTAS HOJE',
      'out-of-range': 'FORA DO ALCANCE',
      'not-enough-silver': 'SEM PRATA',
    };
    btn.textContent = reasonMap[v.canFight.reason ?? ''] ?? 'BLOQUEADO';
  }
  card.appendChild(btn);

  return card;
}

function showResultModal(services: GameServices, r: ArenaFightResult, root: HTMLElement): void {
  const existing = document.querySelector('.arena-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'arena-modal';
  modal.classList.add(r.won ? 'arena-modal--win' : 'arena-modal--loss');

  const backdrop = document.createElement('div');
  backdrop.className = 'arena-modal__backdrop';
  backdrop.addEventListener('click', () => modal.remove());
  modal.appendChild(backdrop);

  const box = document.createElement('div');
  box.className = 'arena-modal__box';

  const title = document.createElement('div');
  title.className = 'arena-modal__title';
  title.textContent = r.won ? 'VITORIA' : 'DERROTA';
  box.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'arena-modal__sub';
  sub.textContent = 'vs ' + r.opponent.name;
  box.appendChild(sub);

  const lines = document.createElement('div');
  lines.className = 'arena-modal__lines';
  for (const l of r.combatLog) {
    const el = document.createElement('div');
    el.className = 'arena-modal__line';
    el.textContent = l;
    lines.appendChild(el);
  }
  box.appendChild(lines);

  const rewards = document.createElement('div');
  rewards.className = 'arena-modal__rewards';
  if (r.won) {
    rewards.appendChild(rewardLine('coin', '+' + r.rewards.silver + ' prata'));
    rewards.appendChild(rewardLine('level-up', '+' + r.rewards.xp + ' XP'));
  } else {
    const el = document.createElement('div');
    el.className = 'arena-modal__no-reward';
    el.textContent = 'Sem recompensas (derrota).';
    rewards.appendChild(el);
  }
  const delta = r.rewards.ratingDelta;
  const sign = delta >= 0 ? '+' : '';
  rewards.appendChild(rewardLine('sparkles', sign + delta + ' rating (' + r.rewards.ratingBefore + ' -> ' + r.rewards.ratingAfter + ')'));
  box.appendChild(rewards);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'arena-modal__btn';
  btn.textContent = 'FECHAR';
  btn.addEventListener('click', () => {
    modal.remove();
    const fresh = renderArenaPanel(services);
    root.closest('.arena-content')?.replaceWith(fresh.querySelector('.arena-content') ?? fresh);
  });
  box.appendChild(btn);

  modal.appendChild(box);
  document.body.appendChild(modal);
}

function rewardLine(icon: IconName, text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'arena-modal__reward-line';
  el.appendChild(createIcon(icon, 14));
  const t = document.createElement('span');
  t.textContent = text;
  el.appendChild(t);
  return el;
}

function tierColorFor(tier: string): string {
  switch (tier) {
    case 'bronze': return '#a07050';
    case 'silver': return '#a8b8c8';
    case 'gold': return '#e8c977';
    case 'platinum': return '#a8e8ff';
    case 'diamond': return '#d84ae8';
    default: return '#e8c977';
  }
}

function tierLabel(tier: string): string {
  switch (tier) {
    case 'bronze': return 'Bronze';
    case 'silver': return 'Prata';
    case 'gold': return 'Ouro';
    case 'platinum': return 'Platina';
    case 'diamond': return 'Diamante';
    default: return tier;
  }
}

function chip(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'arena-chip';
  el.style.setProperty('--chip-color', color);
  el.appendChild(createIcon(icon, 16));
  const l = document.createElement('span');
  l.className = 'arena-chip__label';
  l.textContent = label;
  el.appendChild(l);
  const v = document.createElement('span');
  v.className = 'arena-chip__value';
  v.textContent = value;
  el.appendChild(v);
  return el;
}

function metaChip(icon: IconName, text: string): HTMLElement {
  const chip = document.createElement('span');
  chip.className = 'arena-meta-chip';
  chip.appendChild(createIcon(icon, 11));
  const t = document.createElement('span');
  t.textContent = text;
  chip.appendChild(t);
  return chip;
}

function statLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'arena-stat';
  const l = document.createElement('span');
  l.className = 'arena-stat__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'arena-stat__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'arena-section';
  el.textContent = text;
  return el;
}
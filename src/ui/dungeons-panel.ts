import type { GameServices } from '../services/game-services';
import type { DungeonView, DungeonRunView } from '../services/dungeons-service';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';

export function renderDungeonsPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content dng-panel';

  root.appendChild(renderPanelHeader({
    icon: 'flame',
    title: 'Dungeons',
    subtitle: 'Desafios sequenciais com recompensas unicas',
  }));

  const svc = services.getDungeonsService();
  const runView = svc.buildRunView(Date.now());

  if (runView) {
    root.appendChild(buildActiveRun(services, runView, root));
    return root;
  }

  root.appendChild(sectionTitle('Disponiveis'));
  const list = svc.buildListView();
  const grid = document.createElement('div');
  grid.className = 'dng-grid';
  for (const v of list) grid.appendChild(buildDungeonCard(services, v, root));
  root.appendChild(grid);

  return root;
}

function buildDungeonCard(services: GameServices, v: DungeonView, root: HTMLElement): HTMLElement {
  const card = document.createElement('div');
  card.className = 'dng-card';
  card.style.setProperty('--dng-color', v.def.accentColor);
  if (!v.canStart.ok) card.classList.add('dng-card--locked');

  const head = document.createElement('div');
  head.className = 'dng-card__head';
  const ic = document.createElement('div');
  ic.className = 'dng-card__icon';
  ic.appendChild(createIcon(v.def.icon as IconName, 28));
  head.appendChild(ic);
  const name = document.createElement('div');
  name.className = 'dng-card__name';
  name.textContent = v.def.name;
  head.appendChild(name);
  card.appendChild(head);

  const desc = document.createElement('p');
  desc.className = 'dng-card__desc';
  desc.textContent = v.def.description;
  card.appendChild(desc);

  const meta = document.createElement('div');
  meta.className = 'dng-card__meta';
  meta.appendChild(metaChip('level-up', 'Nv ' + v.def.requiredLevel));
  meta.appendChild(metaChip('flame', v.def.waves.length + ' waves'));
  meta.appendChild(metaChip('coin', v.def.entryCost + ' prata'));
  if (v.def.timeLimitMs) {
    const min = Math.floor(v.def.timeLimitMs / 60000);
    meta.appendChild(metaChip('hourglass', min + ' min'));
  }
  card.appendChild(meta);

  const recs = document.createElement('div');
  recs.className = 'dng-card__recs';
  const ap = services.getDerivedStats().ap;
  const dp = services.getDerivedStats().dp;
  recs.appendChild(recLine('AP ' + ap + ' / ' + v.def.recommendedAp, ap >= v.def.recommendedAp));
  recs.appendChild(recLine('DP ' + dp + ' / ' + v.def.recommendedDp, dp >= v.def.recommendedDp));
  card.appendChild(recs);

  if (v.best) {
    const best = document.createElement('div');
    best.className = 'dng-card__best';
    best.appendChild(bestLine('Conclusoes', String(v.best.completions)));
    if (v.best.bestTimeMs !== null) {
      best.appendChild(bestLine('Melhor tempo', formatDuration(v.best.bestTimeMs)));
    }
    card.appendChild(best);
  }

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dng-card__btn';
  if (v.canStart.ok) {
    btn.textContent = 'ENTRAR';
    btn.addEventListener('click', () => {
      if (!window.confirm('Entrar em ' + v.def.name + '? Custa ' + v.def.entryCost + ' prata.')) return;
      if (services.startDungeon(v.def.id)) rerender(services, root);
    });
  } else {
    btn.disabled = true;
    const reasonMap: Record<string, string> = {
      'unknown-dungeon': 'ERRO',
      'already-active': 'JA ATIVA',
      'level-too-low': 'REQUER NIVEL ' + v.def.requiredLevel,
      'not-enough-silver': 'SEM PRATA',
    };
    btn.textContent = reasonMap[v.canStart.reason ?? ''] ?? 'BLOQUEADA';
  }
  card.appendChild(btn);

  return card;
}

function buildActiveRun(
  services: GameServices,
  r: DungeonRunView,
  root: HTMLElement,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'dng-active';
  box.style.setProperty('--dng-color', r.def.accentColor);

  const head = document.createElement('div');
  head.className = 'dng-active__head';
  const ic = document.createElement('div');
  ic.className = 'dng-active__icon';
  ic.appendChild(createIcon(r.def.icon as IconName, 42));
  head.appendChild(ic);
  const info = document.createElement('div');
  info.className = 'dng-active__info';
  const t = document.createElement('div');
  t.className = 'dng-active__title';
  t.textContent = r.def.name;
  info.appendChild(t);
  const s = document.createElement('div');
  s.className = 'dng-active__subtitle';
  s.textContent = 'Wave ' + r.waveIndex + ' / ' + r.totalWaves + ' - ' + r.waveLabel;
  info.appendChild(s);
  head.appendChild(info);
  box.appendChild(head);

  // Progresso da wave
  const waveTrack = document.createElement('div');
  waveTrack.className = 'dng-active__track';
  const waveFill = document.createElement('div');
  waveFill.className = 'dng-active__fill';
  waveFill.style.width = Math.min(100, (r.waveProgress / Math.max(1, r.waveSize)) * 100) + '%';
  waveTrack.appendChild(waveFill);
  box.appendChild(waveTrack);
  const waveLabel = document.createElement('div');
  waveLabel.className = 'dng-active__progress-label';
  waveLabel.textContent = 'Wave ' + r.waveIndex + ': ' + r.waveProgress + ' / ' + r.waveSize + ' abates';
  box.appendChild(waveLabel);

  // Progresso total
  const totalTrack = document.createElement('div');
  totalTrack.className = 'dng-active__track dng-active__track--total';
  const totalFill = document.createElement('div');
  totalFill.className = 'dng-active__fill dng-active__fill--total';
  totalFill.style.width = Math.min(100, (r.totalKills / Math.max(1, r.totalMonsters)) * 100) + '%';
  totalTrack.appendChild(totalFill);
  box.appendChild(totalTrack);
  const totalLabel = document.createElement('div');
  totalLabel.className = 'dng-active__progress-label';
  totalLabel.textContent = 'Total: ' + r.totalKills + ' / ' + r.totalMonsters;
  box.appendChild(totalLabel);

  // Timer
  if (r.timeLimitMs !== null && r.remainingMs !== null) {
    const pct = r.remainingMs / r.timeLimitMs;
    const timer = document.createElement('div');
    timer.className = 'dng-active__timer';
    if (pct < 0.2) timer.classList.add('dng-active__timer--urgent');
    timer.textContent = 'Tempo restante: ' + formatDuration(r.remainingMs);
    box.appendChild(timer);
  }

  const infoGrid = document.createElement('div');
  infoGrid.className = 'dng-active__grid';
  infoGrid.appendChild(infoLine('Monstro atual', r.monsterId));
  infoGrid.appendChild(infoLine('Tempo decorrido', formatDuration(r.elapsedMs)));
  box.appendChild(infoGrid);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'dng-active__btn';
  btn.textContent = 'ABANDONAR';
  btn.addEventListener('click', () => {
    if (!window.confirm('Abandonar ' + r.def.name + '? Perdes a entrada paga.')) return;
    services.abandonDungeon();
    rerender(services, root);
  });
  box.appendChild(btn);

  return box;
}

function metaChip(icon: IconName, text: string): HTMLElement {
  const chip = document.createElement('span');
  chip.className = 'dng-meta-chip';
  chip.appendChild(createIcon(icon, 11));
  const t = document.createElement('span');
  t.textContent = text;
  chip.appendChild(t);
  return chip;
}

function recLine(label: string, ok: boolean): HTMLElement {
  const row = document.createElement('div');
  row.className = 'dng-rec' + (ok ? ' dng-rec--ok' : ' dng-rec--bad');
  const dot = document.createElement('span');
  dot.className = 'dng-rec__dot';
  row.appendChild(dot);
  const t = document.createElement('span');
  t.textContent = label;
  row.appendChild(t);
  return row;
}

function bestLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'dng-best-line';
  const l = document.createElement('span');
  l.className = 'dng-best-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'dng-best-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

function infoLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'dng-info-line';
  const l = document.createElement('span');
  l.className = 'dng-info-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'dng-info-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'dng-section';
  el.textContent = text;
  return el;
}

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m > 0) return m + 'm ' + s + 's';
  return s + 's';
}

function rerender(services: GameServices, container: HTMLElement): void {
  container.replaceWith(renderDungeonsPanel(services));
}
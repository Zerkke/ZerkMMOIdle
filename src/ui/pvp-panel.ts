import type { GameServices } from '../services/game-services';
import type { PvpOpponentView, PvpFightResult } from '../services/pvp-service';
import type { PvpBuildRecord } from '../domain/pvp/types';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';

let cachedOpponents: readonly PvpBuildRecord[] = [];
let lastFetch = 0;
let loaded = false;

export function renderPvpPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'pvp-panel-content';

  const header = renderPanelHeader({
    icon: 'swords',
    title: 'PvP Assincrono',
    subtitle: 'Desafia builds registadas. Assincrono — o defensor nao precisa de estar online.',
  });
  root.appendChild(header);

  const pvp = services.getPvpService();
  const view = pvp.buildView(cachedOpponents);

  const status = document.createElement('div');
  status.className = 'pvp-status';
  status.appendChild(chip('Rating', String(view.rating), 'level-up', '#e8c977'));
  status.appendChild(chip('Recorde', String(view.peakRating), 'sparkles', '#a86ec8'));
  status.appendChild(chip('V / D', view.wins + ' / ' + view.losses, 'sword', '#6ab87a'));
  status.appendChild(chip('Lutas hoje', view.dailyAttacksUsed + ' / ' + view.dailyAttacksMax, 'hourglass', '#6a9ad8'));
  if (view.isMockMode) {
    const mockChip = document.createElement('div');
    mockChip.className = 'pvp-mock-chip';
    mockChip.textContent = 'MODO MOCK (Supabase nao configurado)';
    status.appendChild(mockChip);
  }
  root.appendChild(status);

  root.appendChild(buildRegisterRow(services, view.registered, view.registeredAt, root));

  root.appendChild(sectionTitle('Adversarios elegiveis'));
  if (!loaded) {
    const empty = document.createElement('div');
    empty.className = 'pvp-empty';
    empty.textContent = 'A carregar adversarios...';
    root.appendChild(empty);
    void refreshOpponents(services, root);
  } else if (view.opponents.length === 0) {
    const empty = document.createElement('div');
    empty.className = 'pvp-empty';
    empty.textContent = 'Sem adversarios elegiveis. Volta mais tarde.';
    root.appendChild(empty);
  } else {
    const grid = document.createElement('div');
    grid.className = 'pvp-grid';
    for (const o of view.opponents) {
      grid.appendChild(buildOpponentCard(services, o, cachedOpponents, root));
    }
    root.appendChild(grid);
  }

  if (view.history.length > 0) {
    root.appendChild(sectionTitle('Historico'));
    const list = document.createElement('div');
    list.className = 'pvp-history';
    for (const h of view.history) {
      const row = document.createElement('div');
      row.className = 'pvp-history__row' + (h.won ? ' pvp-history__row--win' : ' pvp-history__row--loss');
      const d = new Date(h.foughtAt);
      const dateStr = d.toLocaleDateString('pt-PT') + ' ' + d.toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' });
      const delta = h.attackerRatingAfter - h.attackerRatingBefore;
      const sign = delta >= 0 ? '+' : '';
      row.innerHTML =
        '<span class="pvp-history__date">' + dateStr + '</span>' +
        '<span class="pvp-history__name">' + (h.won ? 'V ' : 'D ') + h.defenderName + '</span>' +
        '<span class="pvp-history__delta">' + sign + delta + ' rating</span>';
      list.appendChild(row);
    }
    root.appendChild(list);
  }

  return root;
}

async function refreshOpponents(services: GameServices, root: HTMLElement): Promise<void> {
  if (Date.now() - lastFetch < 5000) return;
  lastFetch = Date.now();
  const opps = await services.getPvpService().loadOpponents();
  cachedOpponents = opps;
  loaded = true;
  const fresh = renderPvpPanel(services);
  root.replaceWith(fresh);
}

function buildRegisterRow(
  services: GameServices,
  registered: boolean,
  registeredAt: number | null,
  root: HTMLElement,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'pvp-register';
  if (registered) box.classList.add('pvp-register--done');

  const info = document.createElement('div');
  info.className = 'pvp-register__info';
  const title = document.createElement('div');
  title.className = 'pvp-register__title';
  title.textContent = registered ? 'BUILD REGISTADA' : 'SEM BUILD REGISTADA';
  info.appendChild(title);
  const sub = document.createElement('div');
  sub.className = 'pvp-register__sub';
  if (registered && registeredAt) {
    const d = new Date(registeredAt);
    sub.textContent = 'Ultima actualizacao: ' + d.toLocaleString('pt-PT');
  } else {
    sub.textContent = 'Regista a tua build actual para seres desafiado por outros jogadores.';
  }
  info.appendChild(sub);
  box.appendChild(info);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pvp-register__btn';
  btn.textContent = registered ? 'ACTUALIZAR BUILD' : 'REGISTAR BUILD';
  btn.addEventListener('click', () => {
    void (async (): Promise<void> => {
      btn.disabled = true;
      btn.textContent = 'A processar...';
      const ok = await services.registerPvpBuild();
      btn.disabled = false;
      if (ok) {
        const fresh = renderPvpPanel(services);
        root.replaceWith(fresh);
      } else {
        btn.textContent = 'FALHOU — TENTAR NOVAMENTE';
      }
    })();
  });
  box.appendChild(btn);

  return box;
}

function buildOpponentCard(
  services: GameServices,
  o: PvpOpponentView,
  opponents: readonly PvpBuildRecord[],
  root: HTMLElement,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'pvp-card';
  if (!o.inRange) card.classList.add('pvp-card--out-of-range');
  if (!o.canChallenge && o.inRange) card.classList.add('pvp-card--locked');

  const head = document.createElement('div');
  head.className = 'pvp-card__head';
  const ic = document.createElement('div');
  ic.className = 'pvp-card__icon';
  ic.appendChild(createIcon('user', 26));
  head.appendChild(ic);
  const name = document.createElement('div');
  name.className = 'pvp-card__name';
  name.textContent = o.characterName;
  head.appendChild(name);
  card.appendChild(head);

  const meta = document.createElement('div');
  meta.className = 'pvp-card__meta';
  meta.appendChild(metaChip('level-up', 'Nv ' + o.characterLevel));
  meta.appendChild(metaChip('shield', 'Rating ' + o.rating));
  meta.appendChild(metaChip('sword', 'V/D: ' + o.wins + '/' + o.losses));
  card.appendChild(meta);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pvp-card__btn';
  if (!o.inRange) {
    btn.disabled = true;
    btn.textContent = 'FORA DO ALCANCE';
  } else if (o.canChallenge) {
    btn.textContent = 'DESAFIAR';
    btn.addEventListener('click', () => {
      const opponent = opponents.find((x) => x.userId === o.userId);
      if (!opponent) return;
      void (async (): Promise<void> => {
        const result = await services.getPvpService().fight(o.userId, opponent);
        if (result) showPvpResultModal(services, result, root);
      })();
    });
  } else {
    btn.disabled = true;
    btn.textContent = 'LIMITE DIARIO';
  }
  card.appendChild(btn);

  return card;
}

function showPvpResultModal(services: GameServices, r: PvpFightResult, root: HTMLElement): void {
  const existing = document.querySelector('.pvp-modal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.className = 'pvp-modal';
  modal.classList.add(r.won ? 'pvp-modal--win' : 'pvp-modal--loss');

  const backdrop = document.createElement('div');
  backdrop.className = 'pvp-modal__backdrop';
  backdrop.addEventListener('click', () => modal.remove());
  modal.appendChild(backdrop);

  const box = document.createElement('div');
  box.className = 'pvp-modal__box';

  const title = document.createElement('div');
  title.className = 'pvp-modal__title';
  title.textContent = r.won ? 'VITORIA' : 'DERROTA';
  box.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'pvp-modal__sub';
  sub.textContent = 'vs ' + r.defender.characterName + ' (Nv ' + r.defender.characterLevel + ')';
  box.appendChild(sub);

  const log = document.createElement('div');
  log.className = 'pvp-modal__log';
  for (const l of r.log) {
    const el = document.createElement('div');
    el.className = 'pvp-modal__line';
    el.textContent = l;
    log.appendChild(el);
  }
  box.appendChild(log);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'pvp-modal__btn';
  btn.textContent = 'FECHAR';
  btn.addEventListener('click', () => {
    modal.remove();
    cachedOpponents = [];
    loaded = false;
    lastFetch = 0;
    const fresh = renderPvpPanel(services);
    root.replaceWith(fresh);
  });
  box.appendChild(btn);

  modal.appendChild(box);
  document.body.appendChild(modal);
}

function chip(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'pvp-chip';
  el.style.setProperty('--chip-color', color);
  el.appendChild(createIcon(icon, 16));
  const l = document.createElement('span');
  l.className = 'pvp-chip__label';
  l.textContent = label;
  el.appendChild(l);
  const v = document.createElement('span');
  v.className = 'pvp-chip__value';
  v.textContent = value;
  el.appendChild(v);
  return el;
}

function metaChip(icon: IconName, text: string): HTMLElement {
  const chip = document.createElement('span');
  chip.className = 'pvp-meta-chip';
  chip.appendChild(createIcon(icon, 11));
  const t = document.createElement('span');
  t.textContent = text;
  chip.appendChild(t);
  return chip;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'pvp-section';
  el.textContent = text;
  return el;
}
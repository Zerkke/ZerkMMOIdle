import type { GameServices } from '../services/game-services';
import { createIcon } from './icons';
import type { IconName } from './icons';

export function renderActivityBanner(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'activity-banner';

  const combat = services.getCombatSession();
  const activity = services.getActivity();

  if (combat) {
    root.classList.add('activity-banner--combat');
    renderCombat(services, root, combat);
  } else if (activity) {
    root.classList.add('activity-banner--lifeskill');
    renderLifeskill(services, root, activity);
  } else {
    root.classList.add('activity-banner--idle');
    renderIdle(root);
  }

  return root;
}

/** Atualiza valores in-place (evita reconstruir o DOM). */
export function updateActivityBanner(services: GameServices): void {
  const combat = services.getCombatSession();
  const activity = services.getActivity();

  if (combat) {
    setLiveText('banner-monster-name', combat.monsterName);
    setLiveText('banner-monster-hp', combat.monsterHp + ' / ' + combat.monsterMaxHp);
    setLiveFill('banner-monster-hp-fill', combat.monsterMaxHp > 0 ? (combat.monsterHp / combat.monsterMaxHp) * 100 : 0);
    setLiveText('banner-session', 'Sessao: ' + combat.kills + ' abates  ·  +' + combat.totalXp + ' XP  ·  +' + combat.totalSilver + ' prata');

    const playerHp = services.getCurrentPlayerHp();
    const playerMax = services.getDerivedStats().maxHp;
    setLiveText('banner-player-hp', playerHp + ' / ' + playerMax);
    setLiveFill('banner-player-hp-fill', playerMax > 0 ? (playerHp / playerMax) * 100 : 0);
    return;
  }

  if (activity) {
    setLiveText('banner-activity-sub', activity.kind === 'gathering'
      ? 'A recolher  ·  ' + activity.completedActions + ' / ' + activity.batches + ' acoes'
      : 'A produzir  ·  ' + activity.completedActions + ' / ' + activity.batches + ' lotes');
    const pct = activity.batches > 0 ? (activity.completedActions / activity.batches) * 100 : 0;
    setLiveFill('banner-progress-fill', pct);
    setLiveText('banner-progress-text', pct.toFixed(0) + '%');
  }
}

function setLiveText(key: string, value: string): void {
  const el = document.querySelector('[data-live="' + key + '"]');
  if (el) el.textContent = value;
}

function setLiveFill(key: string, pct: number): void {
  const el = document.querySelector('[data-live="' + key + '"]') as HTMLElement | null;
  if (el) el.style.width = Math.max(0, Math.min(100, pct)).toFixed(1) + '%';
}

/* ==================== COMBATE ==================== */

function renderCombat(
  services: GameServices,
  root: HTMLElement,
  combat: NonNullable<ReturnType<GameServices['getCombatSession']>>,
): void {
  const left = document.createElement('div');
  left.className = 'activity-banner__left';

  const icon = buildIconBox('sword', 'activity-banner__icon--combat');
  left.appendChild(icon);

  const info = document.createElement('div');
  info.className = 'activity-banner__info';

  const title = document.createElement('div');
  title.className = 'activity-banner__title';
  title.setAttribute('data-live', 'banner-monster-name');
  title.textContent = combat.monsterName;
  info.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'activity-banner__sub';
  sub.setAttribute('data-live', 'banner-session');
  sub.textContent = 'Sessao: ' + combat.kills + ' abates  ·  +' + combat.totalXp + ' XP  ·  +' + combat.totalSilver + ' prata';
  info.appendChild(sub);

  left.appendChild(info);
  root.appendChild(left);

  const right = document.createElement('div');
  right.className = 'activity-banner__right';

  const monsterMax = combat.monsterMaxHp;
  const monsterPct = monsterMax > 0 ? (combat.monsterHp / monsterMax) * 100 : 0;
  right.appendChild(buildBar('shield', 'Inimigo', combat.monsterHp + ' / ' + combat.monsterMaxHp, monsterPct, 'enemy', 'banner-monster-hp', 'banner-monster-hp-fill'));

  const playerHp = services.getCurrentPlayerHp();
  const playerMaxHp = services.getDerivedStats().maxHp;
  const playerPct = playerMaxHp > 0 ? (playerHp / playerMaxHp) * 100 : 0;
  right.appendChild(buildBar('shield', 'Tu', playerHp + ' / ' + playerMaxHp, playerPct, 'player', 'banner-player-hp', 'banner-player-hp-fill'));

  root.appendChild(right);
}

/* ==================== LIFESKILL ==================== */

function renderLifeskill(
  services: GameServices,
  root: HTMLElement,
  activity: NonNullable<ReturnType<GameServices['getActivity']>>,
): void {
  const isGathering = activity.kind === 'gathering';
  const iconName: IconName = isGathering ? 'pickaxe' : 'anvil';

  const left = document.createElement('div');
  left.className = 'activity-banner__left';

  const icon = buildIconBox(iconName, 'activity-banner__icon--lifeskill');
  left.appendChild(icon);

  const info = document.createElement('div');
  info.className = 'activity-banner__info';

  const title = document.createElement('div');
  title.className = 'activity-banner__title';
  title.textContent = activity.targetName;
  info.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'activity-banner__sub';
  sub.setAttribute('data-live', 'banner-activity-sub');
  sub.textContent = isGathering
    ? 'A recolher  ·  ' + activity.completedActions + ' / ' + activity.batches + ' acoes'
    : 'A produzir  ·  ' + activity.completedActions + ' / ' + activity.batches + ' lotes';
  info.appendChild(sub);

  left.appendChild(info);
  root.appendChild(left);

  const right = document.createElement('div');
  right.className = 'activity-banner__right';

  const pct = activity.batches > 0 ? (activity.completedActions / activity.batches) * 100 : 0;
  right.appendChild(buildBar('sparkles', 'Progresso', pct.toFixed(0) + '%', pct, 'progress', 'banner-progress-text', 'banner-progress-fill'));

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'action-button action-button--danger';
  const cancelIcon = createIcon('close', 14);
  cancel.appendChild(cancelIcon);
  const cancelText = document.createElement('span');
  cancelText.textContent = 'Cancelar';
  cancel.appendChild(cancelText);
  cancel.addEventListener('click', () => services.cancelActivity());
  right.appendChild(cancel);

  root.appendChild(right);
}

/* ==================== IDLE ==================== */

function renderIdle(root: HTMLElement): void {
  const left = document.createElement('div');
  left.className = 'activity-banner__left';

  const icon = buildIconBox('hourglass', 'activity-banner__icon--idle');
  left.appendChild(icon);

  const info = document.createElement('div');
  info.className = 'activity-banner__info';

  const title = document.createElement('div');
  title.className = 'activity-banner__title';
  title.textContent = 'Sem atividade';
  info.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'activity-banner__sub';
  sub.textContent = 'Vai a Combate ou Lifeskills para comecares a agir. Configura Idle para progresso offline.';
  info.appendChild(sub);

  left.appendChild(info);
  root.appendChild(left);
}

/* ==================== HELPERS ==================== */

function buildIconBox(name: IconName, variantClass: string): HTMLElement {
  const box = document.createElement('div');
  box.className = 'activity-banner__icon ' + variantClass;
  box.appendChild(createIcon(name, 28));
  return box;
}

function buildBar(
  iconName: IconName,
  label: string,
  textValue: string,
  pct: number,
  variant: 'enemy' | 'player' | 'progress',
  liveTextKey: string,
  liveFillKey: string,
): HTMLElement {
  const row = document.createElement('div');
  row.className = 'activity-banner__bar-row';

  const labelWrap = document.createElement('span');
  labelWrap.className = 'activity-banner__bar-label';
  labelWrap.appendChild(createIcon(iconName, 12));
  const lt = document.createElement('span');
  lt.textContent = label;
  labelWrap.appendChild(lt);
  row.appendChild(labelWrap);

  const track = document.createElement('div');
  track.className = 'activity-banner__bar-track';

  const fill = document.createElement('div');
  fill.className = 'activity-banner__bar-fill activity-banner__bar-fill--' + variant;
  fill.setAttribute('data-live', liveFillKey);
  fill.style.width = Math.max(0, Math.min(100, pct)).toFixed(1) + '%';
  track.appendChild(fill);
  row.appendChild(track);

  const text = document.createElement('span');
  text.className = 'activity-banner__bar-text';
  text.setAttribute('data-live', liveTextKey);
  text.textContent = textValue;
  row.appendChild(text);

  return row;
}
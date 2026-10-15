import type { GameServices } from '../services/game-services';
import { createIcon } from './icons';

export function renderResourceBar(services: GameServices): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'resource-bar';
  const c = services.getCharacter();

  bar.appendChild(resourceItem('coin', 'Prata', String(c.silver), 'silver'));
  bar.appendChild(resourceItem('level-up', 'Nivel', String(c.level), 'level'));
  bar.appendChild(resourceItem('sparkles', 'Experiencia', c.experience + ' / ' + services.getExperienceToNext(), 'xp'));

  return bar;
}

/** Atualiza valores in-place (evita reconstruir o DOM). */
export function updateResourceBar(services: GameServices): void {
  const c = services.getCharacter();
  setLiveText('silver', String(c.silver));
  setLiveText('level', String(c.level));
  setLiveText('xp', c.experience + ' / ' + services.getExperienceToNext());
}

function setLiveText(key: string, value: string): void {
  const el = document.querySelector('[data-live="' + key + '"]');
  if (el) el.textContent = value;
}

function resourceItem(
  iconName: 'coin' | 'level-up' | 'sparkles',
  label: string,
  value: string,
  liveKey: string,
): HTMLElement {
  const el = document.createElement('div');
  el.className = 'resource-bar__item';

  const top = document.createElement('span');
  top.className = 'resource-bar__label';

  const icon = createIcon(iconName, 12);
  icon.setAttribute('class', 'resource-bar__icon');
  top.appendChild(icon);

  const lbl = document.createElement('span');
  lbl.textContent = label;
  top.appendChild(lbl);

  const v = document.createElement('span');
  v.className = 'resource-bar__value';
  v.setAttribute('data-live', liveKey);
  v.textContent = value;

  el.appendChild(top);
  el.appendChild(v);
  return el;
}
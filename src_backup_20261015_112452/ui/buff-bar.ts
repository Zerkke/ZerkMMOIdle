import type { GameServices } from '../services/game-services';

export function renderBuffBar(services: GameServices): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'buff-bar';
  const now = Date.now();
  const buffs = services.getActiveBuffs();
  if (buffs.length === 0) return bar;

  for (const b of buffs) {
    const def = services.registry.getBuff(b.buffId);
    const remaining = Math.max(0, b.expiresAt - now);
    const chip = document.createElement('div');
    chip.className = 'buff-chip';
    chip.title = def?.description ?? b.buffId;

    const name = document.createElement('span');
    name.className = 'buff-chip__name';
    name.textContent = def?.name ?? b.buffId;
    chip.appendChild(name);

    const time = document.createElement('span');
    time.className = 'buff-chip__time';
    time.setAttribute('data-buff-time', b.buffId as string);
    time.textContent = formatDuration(remaining);
    chip.appendChild(time);

    bar.appendChild(chip);
  }
  return bar;
}

function formatDuration(ms: number): string {
  const totalSec = Math.ceil(ms / 1000);
  const min = Math.floor(totalSec / 60);
  const sec = totalSec % 60;
  if (min > 0) return min + 'm' + sec.toString().padStart(2, '0') + 's';
  return sec + 's';
}
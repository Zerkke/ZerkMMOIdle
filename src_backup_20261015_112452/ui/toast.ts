import { createIcon } from './icons';
import type { IconName } from './icons';

export type ToastLevel = 'info' | 'warn' | 'error';

let container: HTMLElement | null = null;

function ensureContainer(): HTMLElement {
  if (container && document.body.contains(container)) return container;
  container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    document.body.appendChild(container);
  }
  return container;
}

function iconFor(level: ToastLevel): IconName {
  if (level === 'error') return 'alert';
  if (level === 'warn') return 'alert';
  return 'sparkles';
}

export function toast(message: string, level: ToastLevel = 'info', durationMs = 2800): void {
  const host = ensureContainer();
  const el = document.createElement('div');
  el.className = 'toast toast--' + level;

  const icon = createIcon(iconFor(level), 16);
  icon.setAttribute('class', 'toast__icon');
  el.appendChild(icon);

  const text = document.createElement('span');
  text.className = 'toast__text';
  text.textContent = message;
  el.appendChild(text);

  host.appendChild(el);

  requestAnimationFrame(() => el.classList.add('toast--visible'));

  window.setTimeout(() => {
    el.classList.remove('toast--visible');
    window.setTimeout(() => el.remove(), 250);
  }, durationMs);
}
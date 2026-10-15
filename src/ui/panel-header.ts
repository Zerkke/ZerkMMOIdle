import { createIcon } from './icons';
import type { IconName } from './icons';

export interface PanelHeaderOptions {
  readonly icon: IconName;
  readonly title: string;
  readonly subtitle?: string;
}

/** Cabecalho decorado para paineis (icone grande + titulo + subtitulo). */
export function renderPanelHeader(opts: PanelHeaderOptions): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-header';

  const iconBox = document.createElement('div');
  iconBox.className = 'panel-header__icon';
  iconBox.appendChild(createIcon(opts.icon, 26));
  root.appendChild(iconBox);

  const text = document.createElement('div');
  text.className = 'panel-header__text';

  const title = document.createElement('h2');
  title.className = 'panel-header__title';
  title.textContent = opts.title;
  text.appendChild(title);

  if (opts.subtitle) {
    const sub = document.createElement('p');
    sub.className = 'panel-header__sub';
    sub.textContent = opts.subtitle;
    text.appendChild(sub);
  }

  root.appendChild(text);

  const deco = document.createElement('div');
  deco.className = 'panel-header__deco';
  root.appendChild(deco);

  return root;
}

/** Pequeno separador de seccao com titulo. */
export function renderSectionTitle(label: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'section-title';
  const text = document.createElement('span');
  text.textContent = label;
  el.appendChild(text);
  return el;
}
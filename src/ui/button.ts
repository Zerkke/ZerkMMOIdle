import { createIcon } from './icons';
import type { IconName } from './icons';

export interface ButtonOptions {
  readonly label: string;
  readonly icon?: IconName;
  readonly variant?: 'default' | 'primary' | 'danger';
  readonly disabled?: boolean;
  readonly onClick: () => void;
  readonly title?: string;
}

export function createButton(opts: ButtonOptions): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn';
  if (opts.variant === 'primary') btn.classList.add('btn--primary');
  if (opts.variant === 'danger') btn.classList.add('btn--danger');
  if (opts.disabled) btn.disabled = true;
  if (opts.title) btn.title = opts.title;

  if (opts.icon) {
    const icon = createIcon(opts.icon, 15);
    icon.setAttribute('class', 'btn__icon');
    btn.appendChild(icon);
  }

  const text = document.createElement('span');
  text.className = 'btn__label';
  text.textContent = opts.label;
  btn.appendChild(text);

  btn.addEventListener('click', opts.onClick);
  return btn;
}

/** Botao compacto so com icone (para toolbars / contadores +/-). */
export function createIconButton(icon: IconName, onClick: () => void, title?: string): HTMLButtonElement {
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'btn btn--icon';
  if (title) btn.title = title;
  btn.appendChild(createIcon(icon, 14));
  btn.addEventListener('click', onClick);
  return btn;
}
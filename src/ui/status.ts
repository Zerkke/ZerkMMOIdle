export type PanelState =
  | { kind: 'loading'; message: string }
  | { kind: 'error'; message: string }
  | { kind: 'empty'; message: string }
  | { kind: 'ready' };

export function renderPanelState(state: PanelState): HTMLElement {
  const el = document.createElement('div');
  el.className = 'panel-state';
  if (state.kind === 'ready') return el;
  el.classList.add(`panel-state--${state.kind}`);
  el.textContent = state.message;
  return el;
}

export function comingSoon(label: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'panel-state panel-state--empty';

  const title = document.createElement('strong');
  title.textContent = label;
  el.appendChild(title);

  const message = document.createElement('p');
  message.textContent = 'Em desenvolvimento. Sera implementado numa fase seguinte.';
  el.appendChild(message);

  return el;
}
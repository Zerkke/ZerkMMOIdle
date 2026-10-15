type FloatingKind = 'silver' | 'xp' | 'item' | 'damage';

const COLORS: Record<FloatingKind, string> = {
  silver: '#d4a24e',
  xp: '#7ad4ff',
  item: '#a8e0b8',
  damage: '#ffb8c8',
};

let host: HTMLElement | null = null;

function ensureHost(): HTMLElement {
  if (host && document.body.contains(host)) return host;
  host = document.getElementById('floating-text-host');
  if (!host) {
    host = document.createElement('div');
    host.id = 'floating-text-host';
    document.body.appendChild(host);
  }
  return host;
}

export function floatText(text: string, kind: FloatingKind = 'silver'): void {
  const container = ensureHost();
  const el = document.createElement('div');
  el.className = 'floating-text floating-text--' + kind;
  el.style.color = COLORS[kind];
  el.textContent = text;

  const offsetX = Math.floor(Math.random() * 60) - 30;
  el.style.setProperty('--dx', offsetX + 'px');

  container.appendChild(el);
  window.setTimeout(() => el.remove(), 1800);
}
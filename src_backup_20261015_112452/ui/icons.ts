export type IconName =
  | 'sword' | 'pickaxe' | 'hammer' | 'hourglass'
  | 'coin' | 'sparkles' | 'level-up' | 'shield'
  | 'scroll' | 'flask' | 'seed' | 'fish'
  | 'meat' | 'book' | 'home' | 'cart'
  | 'briefcase' | 'chest' | 'anvil' | 'apple'
  | 'chevron-right' | 'chevron-down' | 'plus' | 'minus'
  | 'check' | 'close' | 'alert' | 'play' | 'pause'
  | 'wheat' | 'droplet' | 'leaf' | 'flame'
  | 'ore' | 'ingot' | 'plank' | 'tree'
  | 'flower' | 'bowl' | 'ring' | 'armor'
  | 'bow' | 'gem' | 'cloth' | 'bread'
  | 'user' | 'swords' | 'axe';

const PATHS: Record<IconName, string> = {
  sword: '<path d="M14.5 17.5 3 6V3h3l11.5 11.5"/><path d="M13 19l6-6"/><path d="M16 16l4 4"/><path d="M19 21l2-2"/>',
  pickaxe: '<path d="m14 12-8.5 8.5a2.12 2.12 0 1 1-3-3L11 9"/><path d="M15 13 9 7l4-4 6 6h3a8 8 0 0 1-7 7Z"/>',
  hammer: '<path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h2.47l2.26 1.91"/>',
  hourglass: '<path d="M5 22h14"/><path d="M5 2h14"/><path d="M17 22v-4.172a2 2 0 0 0-.586-1.414L12 12l-4.414 4.414A2 2 0 0 0 7 17.828V22"/><path d="M7 2v4.172a2 2 0 0 0 .586 1.414L12 12l4.414-4.414A2 2 0 0 0 17 6.172V2"/>',
  coin: '<circle cx="8" cy="8" r="6"/><path d="M18.09 10.37A6 6 0 1 1 10.34 18"/><path d="M7 6h1v4"/><path d="m16.71 13.88.7.71-2.82 2.82"/>',
  sparkles: '<path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/>',
  'level-up': '<path d="m5 12 7-7 7 7"/><path d="M12 19V5"/>',
  shield: '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
  scroll: '<path d="M8 21h12a2 2 0 0 0 2-2v-2H10v2a2 2 0 1 1-4 0V5a2 2 0 1 0-4 0v3h4"/><path d="M19 17V5a2 2 0 0 0-2-2H4"/>',
  flask: '<path d="M10 2v7.31"/><path d="M14 9.3V1.99"/><path d="M8.5 2h7"/><path d="M14 9.3a6.5 6.5 0 1 1-4 0"/><path d="M5.52 16h12.96"/>',
  seed: '<path d="M12 22V2"/><path d="M12 6a5 5 0 0 1 5 5H7a5 5 0 0 1 5-5Z"/><path d="M12 14a5 5 0 0 0-5 5h10a5 5 0 0 0-5-5Z"/>',
  fish: '<path d="M6.5 12c.94-3.46 4.94-6 8.5-6 3.56 0 6.06 2.54 7 6-.94 3.47-3.44 6-7 6s-7.56-2.53-8.5-6Z"/><path d="M18 12v.5"/><path d="M16 6.5a.5.5 0 0 0 0 .5"/><path d="M4 4v16l5-8Z"/>',
  meat: '<path d="M12.62 2.61a3.5 3.5 0 0 1 5.5 3.68c1.19 1.08 1.84 2.44 1.84 4.21 0 3.5-3.58 6.5-7.96 6.5S4 14 4 10.5c0-1.77.65-3.13 1.84-4.21a3.5 3.5 0 0 1 5.5-3.68c.4.2.86.2 1.28 0Z"/>',
  book: '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
  home: '<path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 22V12h6v10"/>',
  cart: '<circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/>',
  briefcase: '<rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>',
  chest: '<path d="M3 8v10a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V8"/><path d="M3 8V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M3 8h18"/><path d="M9 12h6"/><circle cx="12" cy="12" r="1"/>',
  anvil: '<path d="M7 10h10a2 2 0 0 0 2-2 2 2 0 0 0-2-2h-1l-1-2H7v6Z"/><path d="M9 22v-6h6v6"/><path d="M5 22h14"/>',
  apple: '<path d="M12 6a4 4 0 0 0-4 4v6a4 4 0 0 0 8 0v-6a4 4 0 0 0-4-4Z"/><path d="M12 6V2"/><path d="M12 4a3 3 0 0 1 3 3"/>',
  'chevron-right': '<path d="m9 18 6-6-6-6"/>',
  'chevron-down': '<path d="m6 9 6 6 6-6"/>',
  plus: '<path d="M5 12h14"/><path d="M12 5v14"/>',
  minus: '<path d="M5 12h14"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  alert: '<circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/>',
  play: '<polygon points="6 3 20 12 6 21 6 3"/>',
  pause: '<rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/>',
  wheat: '<path d="M2 22 16 8"/><path d="M3.47 12.53 5 11l1.53 1.53a3.5 3.5 0 0 1 0 4.94L5 19l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M7.47 8.53 9 7l1.53 1.53a3.5 3.5 0 0 1 0 4.94L9 15l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/><path d="M11.47 4.53 13 3l1.53 1.53a3.5 3.5 0 0 1 0 4.94L13 11l-1.53-1.53a3.5 3.5 0 0 1 0-4.94Z"/>',
  droplet: '<path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-3.5-4-4-6.5c-.5 2.5-2 4.9-4 6.5C6 11.1 5 13 5 15a7 7 0 0 0 7 7z"/>',
  leaf: '<path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z"/><path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12"/>',
  flame: '<path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5Z"/>',
  ore: '<path d="M8 4 3 12l4 8h10l4-8-5-8Z"/><circle cx="9" cy="11" r="1.2" fill="currentColor"/><circle cx="14" cy="14" r="1.2" fill="currentColor"/><circle cx="13" cy="9" r="0.9" fill="currentColor"/>',
  ingot: '<path d="M3 14 5 6h14l2 8"/><path d="M3 14h18l-2 6H5Z"/><path d="M8 10h8"/>',
  plank: '<rect x="3" y="6" width="18" height="12" rx="1"/><path d="M3 10h18"/><path d="M3 14h18"/><path d="M8 6v12"/>',
  tree: '<path d="m12 2-7 10h4l-3 6h12l-3-6h4Z"/><path d="M12 18v4"/><path d="M9 22h6"/>',
  flower: '<circle cx="12" cy="12" r="2.5"/><path d="M12 4v3"/><path d="M12 17v3"/><path d="M4 12h3"/><path d="M17 12h3"/><path d="m6.5 6.5 2 2"/><path d="m15.5 15.5 2 2"/><path d="m6.5 17.5 2-2"/><path d="m15.5 8.5 2-2"/>',
  bowl: '<path d="M2 12h20a10 10 0 0 1-20 0Z"/><path d="M7 8c0-3 2-5 5-5s5 2 5 5"/>',
  ring: '<circle cx="12" cy="14" r="6"/><path d="m9 8 3-4 3 4"/><path d="M9.5 5.5 12 8l2.5-2.5"/>',
  armor: '<path d="M5 4v8a7 7 0 0 0 14 0V4Z"/><path d="M5 4h14"/><path d="M12 4v10"/>',
  bow: '<path d="M5 20 20 5"/><path d="M14 3h7v7"/><path d="m14 10 3-3"/><path d="M4 21 15 10"/>',
  gem: '<path d="m6 3 12 0 4 6-10 12L2 9Z"/><path d="M2 9h20"/><path d="M12 3v18"/>',
  cloth: '<path d="M6 3 2 7l4 4 1-1v10h10V10l1 1 4-4-4-4c-1 1-2 1-3 0s-2-1-3 0-2 1-3 0Z"/>',
  bread: '<path d="M3 11a5 4 0 0 1 5-4h8a5 4 0 0 1 5 4v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2Z"/><path d="M8 12v-3"/><path d="M12 12v-3"/><path d="M16 12v-3"/>',
  user: '<circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>',
  swords: '<path d="M3 6V3h3l11.5 11.5"/><path d="M6 3 17.5 14.5"/><path d="M20 21v-3h-3L5.5 6.5"/><path d="M21 6V3h-3L6.5 14.5"/>',
  axe: '<path d="M14 12 3.5 22.5"/><path d="m14 8 6 6-4 4-6-6Z"/><path d="m15 3 3-1 4 4-1 3Z"/>',
};

export function createIcon(name: IconName, size = 16, className?: string): SVGElement {
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('viewBox', '0 0 24 24');
  svg.setAttribute('width', String(size));
  svg.setAttribute('height', String(size));
  svg.setAttribute('fill', 'none');
  svg.setAttribute('stroke', 'currentColor');
  svg.setAttribute('stroke-width', '2');
  svg.setAttribute('stroke-linecap', 'round');
  svg.setAttribute('stroke-linejoin', 'round');
  svg.setAttribute('aria-hidden', 'true');
  if (className) svg.setAttribute('class', className);
  svg.innerHTML = PATHS[name];
  return svg;
}

export function createIconLabel(name: IconName, label: string, size = 16, gap = 6): HTMLElement {
  const wrap = document.createElement('span');
  wrap.className = 'icon-label';
  wrap.style.display = 'inline-flex';
  wrap.style.alignItems = 'center';
  wrap.style.gap = gap + 'px';
  const icon = createIcon(name, size);
  wrap.appendChild(icon);
  const text = document.createElement('span');
  text.textContent = label;
  wrap.appendChild(text);
  return wrap;
}
import type { GameServices } from '../services/game-services';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';

export function renderCharacterSheet(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content ficha-sheet';

  root.appendChild(renderPanelHeader({
    icon: 'user',
    title: 'Ficha',
    subtitle: 'Resumo completo do teu personagem',
  }));

  const c = services.getCharacter();
  const cls = services.registry.getClass(c.classId);
  const d = services.getDerivedStats();
  const base = services.getBaseAttributes();
  const bonus = services.getEquipmentBonuses();
  const total = services.getTotalAttributes();
  const breakdown = services.getPowerBreakdown();
  const xpNext = services.getExperienceToNext();

  const body = document.createElement('div');
  body.className = 'ficha-body';

  body.appendChild(buildPortrait(c, cls?.name ?? '—', xpNext));
  body.appendChild(buildCenter(base, bonus, total, c, cls?.name ?? '—', xpNext));
  body.appendChild(buildStats(d));

  root.appendChild(body);

  // Secção inferior: breakdown AP/DP
  root.appendChild(sectionTitle('Detalhe de poder'));
  const powers = document.createElement('div');
  powers.className = 'ficha-powers';
  powers.appendChild(powerBlock('PODER OFENSIVO (AP)', breakdown.ap, '#e8a848', 'sword'));
  powers.appendChild(powerBlock('PODER DEFENSIVO (DP)', breakdown.dp, '#6a9ad8', 'shield'));
  root.appendChild(powers);

  return root;
}

function buildPortrait(c: ReturnType<GameServices['getCharacter']>, className: string, xpNext: number): HTMLElement {
  const col = document.createElement('div');
  col.className = 'ficha-col ficha-col--portrait';

  const frame = document.createElement('div');
  frame.className = 'ficha-portrait';
  const avatar = document.createElement('div');
  avatar.className = 'ficha-portrait__avatar';
  avatar.appendChild(createIcon('user', 110));
  frame.appendChild(avatar);
  col.appendChild(frame);

  const nameEl = document.createElement('div');
  nameEl.className = 'ficha-portrait__name';
  nameEl.textContent = c.name;
  col.appendChild(nameEl);

  const classEl = document.createElement('div');
  classEl.className = 'ficha-portrait__class';
  classEl.textContent = className;
  col.appendChild(classEl);

  const levelBadge = document.createElement('div');
  levelBadge.className = 'ficha-portrait__level';
  levelBadge.textContent = 'NIVEL ' + c.level;
  col.appendChild(levelBadge);

  const xpBar = document.createElement('div');
  xpBar.className = 'ficha-portrait__xp-bar';
  const xpFill = document.createElement('div');
  xpFill.className = 'ficha-portrait__xp-fill';
  const pct = xpNext > 0 ? Math.min(100, (c.experience / xpNext) * 100) : 0;
  xpFill.style.width = pct + '%';
  xpBar.appendChild(xpFill);
  col.appendChild(xpBar);

  const xpText = document.createElement('div');
  xpText.className = 'ficha-portrait__xp-text';
  xpText.textContent = c.experience.toLocaleString('pt-PT') + ' / ' + xpNext.toLocaleString('pt-PT') + ' XP';
  col.appendChild(xpText);

  return col;
}

function buildCenter(
  base: ReturnType<GameServices['getBaseAttributes']>,
  bonus: ReturnType<GameServices['getEquipmentBonuses']>,
  total: ReturnType<GameServices['getTotalAttributes']>,
  c: ReturnType<GameServices['getCharacter']>,
  className: string,
  xpNext: number,
): HTMLElement {
  const col = document.createElement('div');
  col.className = 'ficha-col ficha-col--center';

  col.appendChild(sectionTitle('Atributos basicos'));

  const attrGrid = document.createElement('div');
  attrGrid.className = 'ficha-attr-grid';
  attrGrid.appendChild(attrCard('Forca', 'swords', '#e8a848', base.strength, bonus.strength, total.strength));
  attrGrid.appendChild(attrCard('Agilidade', 'bow', '#6ab87a', base.agility, bonus.agility, total.agility));
  attrGrid.appendChild(attrCard('Inteligencia', 'book', '#6a9ad8', base.intelligence, bonus.intelligence, total.intelligence));
  attrGrid.appendChild(attrCard('Vitalidade', 'shield', '#d84848', base.vitality, bonus.vitality, total.vitality));
  col.appendChild(attrGrid);

  col.appendChild(sectionTitle('Informacao'));

  const infoGrid = document.createElement('div');
  infoGrid.className = 'ficha-info-grid';
  infoGrid.appendChild(infoLine('Nome', c.name));
  infoGrid.appendChild(infoLine('Classe', className));
  infoGrid.appendChild(infoLine('Nivel', String(c.level)));
  infoGrid.appendChild(infoLine('Experiencia', c.experience + ' / ' + xpNext));
  infoGrid.appendChild(infoLine('Prata', c.silver.toLocaleString('pt-PT')));
  infoGrid.appendChild(infoLine('HP atual', String(c.hp)));
  col.appendChild(infoGrid);

  return col;
}

function buildStats(d: ReturnType<GameServices['getDerivedStats']>): HTMLElement {
  const col = document.createElement('div');
  col.className = 'ficha-col ficha-col--right';

  col.appendChild(sectionTitle('Poder'));

  const powerRow = document.createElement('div');
  powerRow.className = 'ficha-power-row';
  powerRow.appendChild(powerCard('AP', String(d.ap), 'sword', '#e8a848'));
  powerRow.appendChild(powerCard('DP', String(d.dp), 'shield', '#6a9ad8'));
  col.appendChild(powerRow);

  col.appendChild(sectionTitle('Estatisticas'));

  const statsGrid = document.createElement('div');
  statsGrid.className = 'ficha-stats-grid';
  statsGrid.appendChild(statLine('Ataque', String(d.attack), 'sword', '#e8a848'));
  statsGrid.appendChild(statLine('Defesa', String(d.defense), 'shield', '#6a9ad8'));
  statsGrid.appendChild(statLine('Critico', (d.criticalChance * 100).toFixed(1) + '%', 'sparkles', '#e8c977'));
  statsGrid.appendChild(statLine('Dano critico', (d.critDamage * 100).toFixed(1) + '%', 'sparkles', '#a86ec8'));
  statsGrid.appendChild(statLine('HP maximo', String(d.maxHp), 'shield', '#d84848'));
  statsGrid.appendChild(statLine('Recurso', String(d.maxResource), 'flask', '#4878d8'));
  if (d.hpRegenPerSec > 0) statsGrid.appendChild(statLine('Regen HP', d.hpRegenPerSec.toFixed(1) + '/s', 'leaf', '#6ab87a'));
  if (d.lifesteal > 0) statsGrid.appendChild(statLine('Roubo de vida', (d.lifesteal * 100).toFixed(1) + '%', 'sparkles', '#a86ec8'));
  col.appendChild(statsGrid);

  return col;
}

function powerBlock(
  label: string,
  b: { base: number; equipment: number; rolls: number; buffs: number; scaling: number; total: number },
  color: string,
  icon: IconName,
): HTMLElement {
  const block = document.createElement('div');
  block.className = 'ficha-power-block';
  block.style.setProperty('--power-color', color);

  const head = document.createElement('div');
  head.className = 'ficha-power-block__head';
  const ic = document.createElement('div');
  ic.className = 'ficha-power-block__icon';
  ic.appendChild(createIcon(icon, 22));
  head.appendChild(ic);
  const lbl = document.createElement('div');
  lbl.className = 'ficha-power-block__label';
  lbl.textContent = label;
  head.appendChild(lbl);
  const total = document.createElement('div');
  total.className = 'ficha-power-block__total';
  total.textContent = String(b.total);
  head.appendChild(total);
  block.appendChild(head);

  const lines = document.createElement('div');
  lines.className = 'ficha-power-block__lines';
  lines.appendChild(powerLine('Base', '+' + b.base));
  lines.appendChild(powerLine('Equipamento', '+' + b.equipment));
  lines.appendChild(powerLine('Rolls', '+' + b.rolls));
  lines.appendChild(powerLine('Buffs', '+' + b.buffs));
  if (Math.abs(b.scaling - 1) > 0.001) lines.appendChild(powerLine('Escala de classe', 'x' + b.scaling.toFixed(2)));
  block.appendChild(lines);

  return block;
}

function powerLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'ficha-power-line';
  const l = document.createElement('span');
  l.className = 'ficha-power-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'ficha-power-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'ficha-section';
  el.textContent = text;
  return el;
}

function attrCard(label: string, icon: IconName, color: string, base: number, bonus: number, total: number): HTMLElement {
  const card = document.createElement('div');
  card.className = 'ficha-attr-card';
  card.style.setProperty('--attr-color', color);

  const ic = document.createElement('div');
  ic.className = 'ficha-attr-card__icon';
  ic.appendChild(createIcon(icon, 22));
  card.appendChild(ic);

  const lab = document.createElement('div');
  lab.className = 'ficha-attr-card__label';
  lab.textContent = label;
  card.appendChild(lab);

  const val = document.createElement('div');
  val.className = 'ficha-attr-card__value';
  val.textContent = String(total);
  card.appendChild(val);

  const meta = document.createElement('div');
  meta.className = 'ficha-attr-card__meta';
  meta.textContent = bonus > 0 ? base + ' (+' + bonus + ')' : String(base);
  card.appendChild(meta);

  return card;
}

function powerCard(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'ficha-power-card';
  card.style.setProperty('--power-color', color);
  const ic = document.createElement('div');
  ic.className = 'ficha-power-card__icon';
  ic.appendChild(createIcon(icon, 28));
  card.appendChild(ic);
  const lab = document.createElement('div');
  lab.className = 'ficha-power-card__label';
  lab.textContent = label;
  card.appendChild(lab);
  const val = document.createElement('div');
  val.className = 'ficha-power-card__value';
  val.textContent = value;
  card.appendChild(val);
  return card;
}

function infoLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'ficha-info-line';
  const l = document.createElement('span');
  l.className = 'ficha-info-line__label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'ficha-info-line__value';
  v.textContent = value;
  row.appendChild(l);
  row.appendChild(v);
  return row;
}

function statLine(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'ficha-stat-line';
  row.style.setProperty('--stat-color', color);
  const ic = document.createElement('div');
  ic.className = 'ficha-stat-line__icon';
  ic.appendChild(createIcon(icon, 16));
  row.appendChild(ic);
  const l = document.createElement('span');
  l.className = 'ficha-stat-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'ficha-stat-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}
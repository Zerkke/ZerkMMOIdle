import type { GameServices } from '../services/game-services';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';

type CharacterState = ReturnType<GameServices['getCharacter']>;
type DerivedStats = ReturnType<GameServices['getDerivedStats']>;
type Attrs = ReturnType<GameServices['getTotalAttributes']>;

export function renderCharacterPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content char-sheet';

  root.appendChild(renderPanelHeader({
    icon: 'user',
    title: 'Personagem',
    subtitle: 'Estado atual do teu heroi',
  }));

  const c = services.getCharacter();
  const cls = services.registry.getClass(c.classId);
  const d = services.getDerivedStats();
  const base = services.getBaseAttributes();
  const bonus = services.getEquipmentBonuses();
  const total = services.getTotalAttributes();
  const xpNext = services.getExperienceToNext();

  const body = document.createElement('div');
  body.className = 'char-body';
  body.appendChild(buildPortrait(c, cls?.name ?? '—', xpNext));
  body.appendChild(buildCenter(base, bonus, total, c, cls?.name ?? '—', xpNext));
  body.appendChild(buildStats(d));
  root.appendChild(body);

  return root;
}

function buildPortrait(c: CharacterState, className: string, xpNext: number): HTMLElement {
  const col = document.createElement('div');
  col.className = 'char-col char-col--portrait';

  const frame = document.createElement('div');
  frame.className = 'char-portrait';
  const avatar = document.createElement('div');
  avatar.className = 'char-portrait__avatar';
  avatar.appendChild(createIcon('user', 96));
  frame.appendChild(avatar);
  col.appendChild(frame);

  const nameEl = document.createElement('div');
  nameEl.className = 'char-portrait__name';
  nameEl.textContent = c.name;
  col.appendChild(nameEl);

  const classEl = document.createElement('div');
  classEl.className = 'char-portrait__class';
  classEl.textContent = className;
  col.appendChild(classEl);

  const levelBadge = document.createElement('div');
  levelBadge.className = 'char-portrait__level';
  levelBadge.textContent = 'NIVEL ' + c.level;
  col.appendChild(levelBadge);

  const xpBar = document.createElement('div');
  xpBar.className = 'char-portrait__xp-bar';
  const xpFill = document.createElement('div');
  xpFill.className = 'char-portrait__xp-fill';
  const pct = xpNext > 0 ? Math.min(100, (c.experience / xpNext) * 100) : 0;
  xpFill.style.width = pct + '%';
  xpBar.appendChild(xpFill);
  col.appendChild(xpBar);

  const xpText = document.createElement('div');
  xpText.className = 'char-portrait__xp-text';
  xpText.textContent = c.experience.toLocaleString('pt-PT') + ' / ' + xpNext.toLocaleString('pt-PT') + ' XP';
  col.appendChild(xpText);

  return col;
}

function buildCenter(
  base: Attrs,
  bonus: Attrs,
  total: Attrs,
  c: CharacterState,
  className: string,
  xpNext: number,
): HTMLElement {
  const col = document.createElement('div');
  col.className = 'char-col char-col--center';

  col.appendChild(sectionTitle('Atributos basicos'));

  const attrGrid = document.createElement('div');
  attrGrid.className = 'char-attr-grid';
  attrGrid.appendChild(buildAttrCard('Forca', 'swords', '#e8a848', base.strength, bonus.strength, total.strength));
  attrGrid.appendChild(buildAttrCard('Agilidade', 'bow', '#6ab87a', base.agility, bonus.agility, total.agility));
  attrGrid.appendChild(buildAttrCard('Inteligencia', 'book', '#6a9ad8', base.intelligence, bonus.intelligence, total.intelligence));
  attrGrid.appendChild(buildAttrCard('Vitalidade', 'shield', '#d84848', base.vitality, bonus.vitality, total.vitality));
  col.appendChild(attrGrid);

  col.appendChild(sectionTitle('Informacao'));

  const infoGrid = document.createElement('div');
  infoGrid.className = 'char-info-grid';
  infoGrid.appendChild(infoLine('Nome', c.name));
  infoGrid.appendChild(infoLine('Classe', className));
  infoGrid.appendChild(infoLine('Nivel', String(c.level)));
  infoGrid.appendChild(infoLine('Experiencia', c.experience + ' / ' + xpNext));
  infoGrid.appendChild(infoLine('Prata', c.silver.toLocaleString('pt-PT')));
  infoGrid.appendChild(infoLine('HP atual', String(c.hp)));
  col.appendChild(infoGrid);

  return col;
}

function buildStats(d: DerivedStats): HTMLElement {
  const col = document.createElement('div');
  col.className = 'char-col char-col--right';

  col.appendChild(sectionTitle('Poder'));

  const powerRow = document.createElement('div');
  powerRow.className = 'char-power-row';
  powerRow.appendChild(powerCard('AP', String(d.ap), 'sword', '#e8a848'));
  powerRow.appendChild(powerCard('DP', String(d.dp), 'shield', '#6a9ad8'));
  col.appendChild(powerRow);

  col.appendChild(sectionTitle('Estatisticas'));

  const statsGrid = document.createElement('div');
  statsGrid.className = 'char-stats-grid';
  statsGrid.appendChild(statLine('Ataque', String(d.attack), 'sword', '#e8a848'));
  statsGrid.appendChild(statLine('Defesa', String(d.defense), 'shield', '#6a9ad8'));
  statsGrid.appendChild(statLine('Critico', (d.criticalChance * 100).toFixed(1) + '%', 'sparkles', '#e8c977'));
  statsGrid.appendChild(statLine('HP maximo', String(d.maxHp), 'shield', '#d84848'));
  statsGrid.appendChild(statLine('Recurso', String(d.maxResource), 'flask', '#4878d8'));
  if (d.lifesteal > 0) statsGrid.appendChild(statLine('Roubo de vida', (d.lifesteal * 100).toFixed(1) + '%', 'sparkles', '#a86ec8'));
  col.appendChild(statsGrid);

  return col;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'char-section-title';
  el.textContent = text;
  return el;
}

function buildAttrCard(label: string, icon: IconName, color: string, base: number, bonus: number, total: number): HTMLElement {
  const card = document.createElement('div');
  card.className = 'char-attr-card';
  card.style.setProperty('--attr-color', color);

  const ic = document.createElement('div');
  ic.className = 'char-attr-card__icon';
  ic.appendChild(createIcon(icon, 22));
  card.appendChild(ic);

  const lab = document.createElement('div');
  lab.className = 'char-attr-card__label';
  lab.textContent = label;
  card.appendChild(lab);

  const val = document.createElement('div');
  val.className = 'char-attr-card__value';
  val.textContent = String(total);
  card.appendChild(val);

  const meta = document.createElement('div');
  meta.className = 'char-attr-card__meta';
  meta.textContent = bonus > 0 ? 'base ' + base + ' (+' + bonus + ')' : 'base ' + base;
  card.appendChild(meta);

  return card;
}

function powerCard(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'char-power-card';
  card.style.setProperty('--power-color', color);
  const ic = document.createElement('div');
  ic.className = 'char-power-card__icon';
  ic.appendChild(createIcon(icon, 28));
  card.appendChild(ic);
  const lab = document.createElement('div');
  lab.className = 'char-power-card__label';
  lab.textContent = label;
  card.appendChild(lab);
  const val = document.createElement('div');
  val.className = 'char-power-card__value';
  val.textContent = value;
  card.appendChild(val);
  return card;
}

function infoLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'char-info-line';
  const l = document.createElement('span');
  l.className = 'char-info-line__label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'char-info-line__value';
  v.textContent = value;
  row.appendChild(l);
  row.appendChild(v);
  return row;
}

function statLine(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'char-stat-line';
  row.style.setProperty('--stat-color', color);
  const ic = document.createElement('div');
  ic.className = 'char-stat-line__icon';
  ic.appendChild(createIcon(icon, 16));
  row.appendChild(ic);
  const l = document.createElement('span');
  l.className = 'char-stat-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'char-stat-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}
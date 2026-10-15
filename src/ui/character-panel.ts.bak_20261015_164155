import type { GameServices } from '../services/game-services';
import { renderPanelHeader, renderSectionTitle } from './panel-header';

export function renderCharacterPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'user',
    title: 'Personagem',
    subtitle: 'Estado atual do teu heroi',
  }));

  const c = services.getCharacter();
  const cls = services.registry.getClass(c.classId);

  root.appendChild(renderSectionTitle('Informacao'));

  const info = document.createElement('div');
  info.className = 'info-grid';
  info.appendChild(row('Nome', c.name));
  info.appendChild(row('Classe', cls?.name ?? '—'));
  info.appendChild(row('Nivel', String(c.level)));
  info.appendChild(row('Experiencia', c.experience + ' / ' + services.getExperienceToNext()));
  info.appendChild(row('HP', String(c.hp)));
  info.appendChild(row('Recurso', String(c.resource)));
  info.appendChild(row('Prata', String(c.silver)));
  root.appendChild(info);

  root.appendChild(renderSectionTitle('Poder'));

  const breakdown = services.getPowerBreakdown();
  const power = document.createElement('div');
  power.className = 'power-breakdown';

  power.appendChild(powerBlock('Poder ofensivo (AP)', breakdown.ap));
  power.appendChild(powerBlock('Poder defensivo (DP)', breakdown.dp));
  root.appendChild(power);

  root.appendChild(renderSectionTitle('Atributos'));

  const base = services.getBaseAttributes();
  const bonus = services.getEquipmentBonuses();
  const total = services.getTotalAttributes();
  const attrs = document.createElement('div');
  attrs.className = 'info-grid';
  attrs.appendChild(attrRow('Forca', base.strength, bonus.strength, total.strength));
  attrs.appendChild(attrRow('Agilidade', base.agility, bonus.agility, total.agility));
  attrs.appendChild(attrRow('Inteligencia', base.intelligence, bonus.intelligence, total.intelligence));
  attrs.appendChild(attrRow('Vitalidade', base.vitality, bonus.vitality, total.vitality));
  root.appendChild(attrs);

  root.appendChild(renderSectionTitle('Derivados'));

  const d = services.getDerivedStats();
  const dGrid = document.createElement('div');
  dGrid.className = 'info-grid';
  dGrid.appendChild(row('HP maximo', String(d.maxHp)));
  dGrid.appendChild(row('Recurso maximo', String(d.maxResource)));
  dGrid.appendChild(row('Dano efetivo', String(d.attack)));
  dGrid.appendChild(row('Mitigacao', String(d.defense)));
  dGrid.appendChild(row('Critico', (d.criticalChance * 100).toFixed(1) + '%'));
  root.appendChild(dGrid);

  return root;
}

function powerBlock(label: string, b: { base: number; equipment: number; rolls: number; buffs: number; scaling: number; total: number }): HTMLElement {
  const el = document.createElement('div');
  el.className = 'power-block';

  const title = document.createElement('div');
  title.className = 'power-block__title';
  title.textContent = label;
  el.appendChild(title);

  const total = document.createElement('div');
  total.className = 'power-block__total';
  total.textContent = String(b.total);
  el.appendChild(total);

  const lines = document.createElement('div');
  lines.className = 'power-block__lines';
  lines.appendChild(subRow('Base', '+' + b.base));
  lines.appendChild(subRow('Equipamento', '+' + b.equipment));
  lines.appendChild(subRow('Rolls', '+' + b.rolls));
  lines.appendChild(subRow('Buffs', '+' + b.buffs));
  if (Math.abs(b.scaling - 1) > 0.001) {
    lines.appendChild(subRow('Escala de classe', 'x' + b.scaling.toFixed(2)));
  }
  el.appendChild(lines);

  return el;
}

function subRow(label: string, value: string): HTMLElement {
  const r = document.createElement('div');
  r.className = 'power-block__sub';
  const l = document.createElement('span');
  l.textContent = label;
  const v = document.createElement('span');
  v.textContent = value;
  r.appendChild(l);
  r.appendChild(v);
  return r;
}

function row(label: string, value: string): HTMLElement {
  const r = document.createElement('div');
  r.className = 'info-row';
  const l = document.createElement('span');
  l.className = 'info-row__label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'info-row__value';
  v.textContent = value;
  r.appendChild(l);
  r.appendChild(v);
  return r;
}

function attrRow(label: string, _base: number, bonus: number, total: number): HTMLElement {
  return row(label, bonus > 0 ? total + ' (+' + bonus + ')' : String(total));
}
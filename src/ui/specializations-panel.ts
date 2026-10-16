import type { GameServices } from '../services/game-services';
import type { SpecializationView } from '../services/specializations-service';
import type { SpecializationId } from '../domain/specializations/types';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';

export function renderSpecializationsPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content spec-panel';

  root.appendChild(renderPanelHeader({
    icon: 'flame',
    title: 'Especializacoes',
    subtitle: 'Escolhe um caminho. Nao podes ter dois.',
  }));

  const svc = services.getSpecializationsService();
  const active = svc.getActive();
  const view = svc.buildView();

  const status = document.createElement('div');
  status.className = 'spec-status';
  if (active) {
    status.classList.add('spec-status--active');
    status.style.setProperty('--spec-color', active.accentColor);
    const ic = document.createElement('div');
    ic.className = 'spec-status__icon';
    ic.appendChild(createIcon(active.icon as IconName, 36));
    status.appendChild(ic);
    const body = document.createElement('div');
    body.className = 'spec-status__body';
    const t = document.createElement('div');
    t.className = 'spec-status__title';
    t.textContent = 'ATIVA: ' + active.name;
    body.appendChild(t);
    const d = document.createElement('div');
    d.className = 'spec-status__desc';
    d.textContent = active.description;
    body.appendChild(d);
    status.appendChild(body);
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'spec-status__off';
    btn.textContent = 'DESATIVAR';
    btn.addEventListener('click', () => {
      if (!window.confirm('Desativar ' + active.name + '? So podes reativar pagando 500 prata.')) return;
      services.deactivateSpecialization();
      rerender(services, root);
    });
    status.appendChild(btn);
  } else {
    status.classList.add('spec-status--empty');
    const t = document.createElement('div');
    t.className = 'spec-status__title';
    t.textContent = 'SEM ESPECIALIZACAO';
    status.appendChild(t);
    const d = document.createElement('div');
    d.className = 'spec-status__desc';
    d.textContent = 'Escolhe uma especializacao abaixo. A primeira e gratuita.';
    status.appendChild(d);
  }
  root.appendChild(status);

  root.appendChild(sectionTitle('Comparacao de stats'));
  root.appendChild(buildComparison(services, view));

  root.appendChild(sectionTitle('Especializacoes disponiveis'));
  const grid = document.createElement('div');
  grid.className = 'spec-grid';
  for (const v of view) grid.appendChild(buildCard(services, v, root));
  root.appendChild(grid);

  return root;
}

function simulate(
  base: ReturnType<GameServices['getDerivedStats']>,
  mods: import('../domain/specializations/types').SpecializationModifiers,
): ReturnType<GameServices['getDerivedStats']> {
  const maxHp = Math.floor(base.maxHp * (mods.hpMultiplier ?? 1));
  const maxResource = Math.floor(base.maxResource * (mods.resourceMultiplier ?? 1));
  const ap = Math.max(0, Math.floor(base.ap * (mods.apMultiplier ?? 1)));
  const dp = Math.max(0, Math.floor(base.dp * (mods.dpMultiplier ?? 1)));
  const attack = Math.max(1, Math.floor(base.attack * (mods.attackMultiplier ?? 1)));
  const defense = Math.max(0, Math.floor(base.defense * (mods.defenseMultiplier ?? 1)));
  const criticalChance = Math.min(0.9, Math.max(0, base.criticalChance + (mods.critChanceBonus ?? 0)));
  const lifesteal = Math.max(0, base.lifesteal + (mods.lifestealBonus ?? 0));
  const hpRegenPerSec = Math.max(0, base.hpRegenPerSec + (mods.hpRegenBonus ?? 0));
  const critDamage = base.critDamage + (mods.critDamageBonus ?? 0);
  const damageReduction = Math.min(90, Math.max(0, base.damageReduction + (mods.damageReductionBonus ?? 0)));
  return { maxHp, maxResource, attack, defense, ap, dp, criticalChance, lifesteal, hpRegenPerSec, critDamage, damageReduction, resistances: base.resistances };
}

function buildComparison(services: GameServices, view: readonly SpecializationView[]): HTMLElement {
  const current = services.getDerivedStats();
  const wrap = document.createElement('div');
  wrap.className = 'spec-compare';

  const table = document.createElement('table');
  table.className = 'spec-compare__table';

  const thead = document.createElement('thead');
  const hr = document.createElement('tr');
  const empty = document.createElement('th');
  empty.textContent = 'Stat';
  hr.appendChild(empty);
  const cur = document.createElement('th');
  cur.textContent = 'Atual';
  cur.classList.add('spec-compare__col--current');
  hr.appendChild(cur);
  for (const v of view) {
    const th = document.createElement('th');
    th.textContent = v.def.name;
    th.style.color = v.def.accentColor;
    if (v.active) th.classList.add('spec-compare__col--active');
    hr.appendChild(th);
  }
  thead.appendChild(hr);
  table.appendChild(thead);

  type StatRow = { label: string; get: (d: ReturnType<GameServices['getDerivedStats']>) => number; fmt: (n: number) => string };
  const rows: StatRow[] = [
    { label: 'AP', get: (d) => d.ap, fmt: (n) => String(n) },
    { label: 'DP', get: (d) => d.dp, fmt: (n) => String(n) },
    { label: 'Ataque', get: (d) => d.attack, fmt: (n) => String(n) },
    { label: 'HP max', get: (d) => d.maxHp, fmt: (n) => String(n) },
    { label: 'Critico', get: (d) => d.criticalChance, fmt: (n) => (n * 100).toFixed(1) + '%' },
    { label: 'Lifesteal', get: (d) => d.lifesteal, fmt: (n) => (n * 100).toFixed(1) + '%' },
    { label: 'DR', get: (d) => d.damageReduction, fmt: (n) => n.toFixed(1) + '%' },
  ];

  const tbody = document.createElement('tbody');
  for (const row of rows) {
    const tr = document.createElement('tr');
    const th = document.createElement('td');
    th.className = 'spec-compare__label';
    th.textContent = row.label;
    tr.appendChild(th);

    const tdc = document.createElement('td');
    tdc.textContent = row.fmt(row.get(current));
    tdc.className = 'spec-compare__col--current';
    tr.appendChild(tdc);

    for (const v of view) {
      const simulated = simulate(current, v.def.modifiers);
      const td = document.createElement('td');
      td.textContent = row.fmt(row.get(simulated));
      if (v.active) td.classList.add('spec-compare__col--active');
      const curVal = row.get(current);
      const simVal = row.get(simulated);
      if (simVal > curVal * 1.001) td.classList.add('spec-compare__cell--up');
      else if (simVal < curVal * 0.999) td.classList.add('spec-compare__cell--down');
      tr.appendChild(td);
    }
    tbody.appendChild(tr);
  }
  table.appendChild(tbody);
  wrap.appendChild(table);
  return wrap;
}

function buildCard(services: GameServices, v: SpecializationView, root: HTMLElement): HTMLElement {
  const card = document.createElement('div');
  card.className = 'spec-card';
  card.style.setProperty('--spec-color', v.def.accentColor);
  if (v.active) card.classList.add('spec-card--active');
  if (!v.unlock.ok && !v.active) card.classList.add('spec-card--locked');

  const head = document.createElement('div');
  head.className = 'spec-card__head';
  const ic = document.createElement('div');
  ic.className = 'spec-card__icon';
  ic.appendChild(createIcon(v.def.icon as IconName, 28));
  head.appendChild(ic);
  const name = document.createElement('div');
  name.className = 'spec-card__name';
  name.textContent = v.def.name;
  head.appendChild(name);
  if (v.active) {
    const badge = document.createElement('div');
    badge.className = 'spec-card__badge';
    badge.textContent = 'ATIVA';
    head.appendChild(badge);
  }
  card.appendChild(head);

  const lore = document.createElement('p');
  lore.className = 'spec-card__lore';
  lore.textContent = v.def.lore;
  card.appendChild(lore);

  const desc = document.createElement('p');
  desc.className = 'spec-card__desc';
  desc.textContent = v.def.description;
  card.appendChild(desc);

  if (v.def.perkLabels.length > 0) {
    const perks = document.createElement('div');
    perks.className = 'spec-card__perks';
    for (const p of v.def.perkLabels) {
      const chip = document.createElement('span');
      chip.className = 'spec-chip spec-chip--perk';
      chip.textContent = p;
      perks.appendChild(chip);
    }
    card.appendChild(perks);
  }
  if (v.def.drawbackLabels.length > 0) {
    const dbs = document.createElement('div');
    dbs.className = 'spec-card__drawbacks';
    for (const d of v.def.drawbackLabels) {
      const chip = document.createElement('span');
      chip.className = 'spec-chip spec-chip--drawback';
      chip.textContent = d;
      dbs.appendChild(chip);
    }
    card.appendChild(dbs);
  }

  const reqs = document.createElement('div');
  reqs.className = 'spec-card__reqs';
  const lvlOk = services.getCharacter().level >= v.def.unlock.characterLevel;
  reqs.appendChild(reqLine('Nivel ' + v.def.unlock.characterLevel, lvlOk));
  for (const t of v.def.unlock.talents) {
    const rank = services.getTalentsService().getRank(t.talentId);
    const ok = rank >= t.minRank;
    reqs.appendChild(reqLine(prettyId(t.talentId) + ' ' + rank + '/' + t.minRank, ok));
  }
  card.appendChild(reqs);

  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'spec-card__btn';
  if (v.active) {
    btn.textContent = 'ATIVA';
    btn.disabled = true;
  } else if (v.unlock.ok) {
    const cost = services.getSpecializationsService().getActiveId() ? 500 : 0;
    btn.textContent = cost > 0 ? 'ATIVAR (' + cost + ' prata)' : 'ATIVAR (GRATIS)';
    btn.addEventListener('click', () => {
      if (cost > 0 && !window.confirm('Trocar para ' + v.def.name + '? Custa ' + cost + ' prata.')) return;
      if (services.activateSpecialization(v.def.id as SpecializationId)) rerender(services, root);
    });
  } else {
    btn.disabled = true;
    const reasonMap: Record<string, string> = {
      'level-too-low': 'NIVEL INSUFICIENTE',
      'missing-talent': 'FALTAM TALENTOS',
      'unknown-spec': 'ERRO',
      'already-active': 'ATIVA',
    };
    btn.textContent = reasonMap[v.unlock.reason ?? ''] ?? 'BLOQUEADA';
  }
  card.appendChild(btn);

  return card;
}

function reqLine(label: string, ok: boolean): HTMLElement {
  const row = document.createElement('div');
  row.className = 'spec-req' + (ok ? ' spec-req--ok' : ' spec-req--bad');
  const dot = document.createElement('span');
  dot.className = 'spec-req__dot';
  row.appendChild(dot);
  const t = document.createElement('span');
  t.className = 'spec-req__text';
  t.textContent = label;
  row.appendChild(t);
  return row;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'spec-section';
  el.textContent = text;
  return el;
}

function prettyId(id: string): string {
  const parts = id.split('.');
  return (parts[parts.length - 1] ?? id).replace(/-/g, ' ');
}

function rerender(services: GameServices, container: HTMLElement): void {
  const fresh = renderSpecializationsPanel(services);
  container.replaceWith(fresh);
}
import type { GameServices } from '../services/game-services';
import type { CombatEvent } from '../domain/combat';
import { asZoneId } from '../domain/ids';
import { computeZoneScaling } from '../domain/zones';
import { renderPanelHeader } from './panel-header';
import { createButton } from './button';
import { createIcon, type IconName } from './icons';

export function renderCombatPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content combat-sheet';

  const session = services.getCombatSession();
  const derived = services.getDerivedStats();
  const hp = services.getCurrentPlayerHp();
  const resource = services.getCurrentPlayerResource();

  root.appendChild(renderPanelHeader({
    icon: 'swords',
    title: 'Combate',
    subtitle: session ? 'Em combate: ' + session.monsterName : 'Escolhe uma zona para comecar',
  }));

  root.appendChild(vitalsStrip(hp, derived.maxHp, resource, derived.maxResource));

  if (!session) {
    root.appendChild(buildZoneList(services));
    return root;
  }

  const body = document.createElement('div');
  body.className = 'combat-body';

  // ============= CENTRO: arena + acoes + log =============
  const center = document.createElement('div');
  center.className = 'combat-center';

  center.appendChild(buildArena(session));

  const cfg = services.getCombatConfig();
  const actions = document.createElement('div');
  actions.className = 'combat-actions';
  actions.appendChild(createButton({ label: 'Parar', icon: 'pause', variant: 'danger', onClick: () => services.stopCombat() }));
  actions.appendChild(createButton({
    label: cfg.autoMode ? 'Auto ON' : 'Auto OFF',
    icon: cfg.autoMode ? 'check' : 'close',
    variant: cfg.autoMode ? 'primary' : 'default',
    onClick: () => services.setCombatConfig({ autoMode: !cfg.autoMode }),
  }));
  actions.appendChild(createButton({
    label: cfg.useSkills ? 'Skills ON' : 'Skills OFF',
    icon: 'sparkles',
    variant: cfg.useSkills ? 'primary' : 'default',
    onClick: () => services.setCombatConfig({ useSkills: !cfg.useSkills }),
  }));
  actions.appendChild(createButton({
    label: 'Estrategia: ' + cfg.strategy,
    icon: 'shield',
    onClick: () => {
      const order: Array<'aggressive' | 'balanced' | 'defensive'> = ['aggressive', 'balanced', 'defensive'];
      const idx = order.indexOf(cfg.strategy);
      const next = order[(idx + 1) % order.length] ?? 'aggressive';
      services.setCombatConfig({ strategy: next });
    },
  }));
  center.appendChild(actions);

  center.appendChild(sectionTitle('Registo'));
  const log = document.createElement('div');
  log.className = 'combat-log';
  const recent = [...session.log].reverse();
  for (const ev of recent) log.appendChild(logEntry(ev));
  center.appendChild(log);

  body.appendChild(center);

  // ============= LATERAL: sessao + loot =============
  const side = document.createElement('aside');
  side.className = 'combat-side';

  side.appendChild(sectionTitle('Sessao'));
  const sessGrid = document.createElement('div');
  sessGrid.className = 'combat-side__grid';
  sessGrid.appendChild(sideStat('Abates', String(session.kills), 'swords', '#e8c977'));
  sessGrid.appendChild(sideStat('XP ganho', '+' + session.totalXp, 'level-up', '#6ab87a'));
  sessGrid.appendChild(sideStat('Prata ganha', '+' + session.totalSilver, 'coin', '#e8a848'));
  side.appendChild(sessGrid);

  if (session.loot.size > 0) {
    side.appendChild(sectionTitle('Loot da sessao'));
    const lootList = document.createElement('div');
    lootList.className = 'combat-loot';
    for (const [itemId, qty] of session.loot) {
      const def = services.registry.getItem(itemId);
      const row = document.createElement('div');
      row.className = 'combat-loot__row';
      const n = document.createElement('span');
      n.className = 'combat-loot__name';
      n.textContent = def?.name ?? itemId;
      const q = document.createElement('span');
      q.className = 'combat-loot__qty';
      q.textContent = 'x' + qty;
      row.appendChild(n);
      row.appendChild(q);
      lootList.appendChild(row);
    }
    side.appendChild(lootList);
  }

  body.appendChild(side);
  root.appendChild(body);
  return root;
}

// ============================================================
// Vitals (HP + Recurso)
// ============================================================
function vitalsStrip(hp: number, maxHp: number, resource: number, maxResource: number): HTMLElement {
  const strip = document.createElement('div');
  strip.className = 'combat-vitals';
  strip.appendChild(barBlock('Vida', hp, maxHp, 'hp'));
  strip.appendChild(barBlock('Recurso', resource, maxResource, 'resource'));
  return strip;
}

function barBlock(label: string, current: number, max: number, kind: 'hp' | 'resource' | 'enemy'): HTMLElement {
  const block = document.createElement('div');
  block.className = 'bar bar--' + kind;

  const head = document.createElement('div');
  head.className = 'bar__head';
  const l = document.createElement('span');
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'bar__value';
  v.textContent = current + ' / ' + max;
  head.appendChild(l);
  head.appendChild(v);

  const track = document.createElement('div');
  track.className = 'bar__track';
  const fill = document.createElement('div');
  fill.className = 'bar__fill';
  const pct = max > 0 ? Math.max(0, Math.min(100, (current / max) * 100)) : 0;
  fill.style.width = pct + '%';
  track.appendChild(fill);

  block.appendChild(head);
  block.appendChild(track);
  return block;
}

// ============================================================
// Arena
// ============================================================
function buildArena(session: ReturnType<GameServices['getCombatSession']> & object): HTMLElement {
  const arena = document.createElement('div');
  arena.className = 'combat-arena';

  const monster = document.createElement('div');
  monster.className = 'combat-arena__side combat-arena__side--monster';

  const mName = document.createElement('div');
  mName.className = 'combat-arena__name';
  mName.textContent = session.monsterName;
  monster.appendChild(mName);

  const mIcon = document.createElement('div');
  mIcon.className = 'combat-arena__sprite';
  mIcon.appendChild(createIcon('swords', 64));
  monster.appendChild(mIcon);

  monster.appendChild(barBlock('HP', session.monsterHp, session.monsterMaxHp, 'enemy'));
  arena.appendChild(monster);

  const vs = document.createElement('div');
  vs.className = 'combat-arena__vs';
  vs.textContent = 'VS';
  arena.appendChild(vs);

  const player = document.createElement('div');
  player.className = 'combat-arena__side combat-arena__side--player';

  const pName = document.createElement('div');
  pName.className = 'combat-arena__name';
  pName.textContent = 'Tu';
  player.appendChild(pName);

  const pIcon = document.createElement('div');
  pIcon.className = 'combat-arena__sprite';
  pIcon.appendChild(createIcon('user', 64));
  player.appendChild(pIcon);

  arena.appendChild(player);

  return arena;
}

// ============================================================
// Sections
// ============================================================
function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'combat-section';
  el.textContent = text;
  return el;
}

function sideStat(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'combat-side__stat';
  row.style.setProperty('--stat-color', color);
  const ic = document.createElement('div');
  ic.className = 'combat-side__stat-icon';
  ic.appendChild(createIcon(icon, 18));
  row.appendChild(ic);
  const l = document.createElement('span');
  l.className = 'combat-side__stat-label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'combat-side__stat-value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

// ============================================================
// Log
// ============================================================
function logEntry(event: CombatEvent): HTMLElement {
  const el = document.createElement('div');
  el.className = 'combat-log__entry combat-log__entry--' + event.kind;
  switch (event.kind) {
    case 'player-basic':
      el.textContent = 'Atacas: ' + event.damage + (event.crit ? ' (CRITICO)' : '');
      break;
    case 'player-skill':
      el.textContent = event.heal > 0
        ? 'Skill cura: +' + event.heal + ' HP'
        : 'Skill: ' + event.damage + (event.crit ? ' (CRITICO)' : '');
      break;
    case 'monster-basic':
      el.textContent = 'Inimigo ataca: ' + event.damage;
      break;
    case 'victory': el.textContent = 'VITORIA'; break;
    case 'defeat': el.textContent = 'DERROTA'; break;
  }
  return el;
}

// ============================================================
// Zonas (sem combate ativo)
// ============================================================
function buildZoneList(services: GameServices): HTMLElement {
  const wrap = document.createElement('div');
  wrap.appendChild(sectionTitle('Zonas disponiveis'));

  const char = services.getCharacter();
  const derived = services.getDerivedStats();
  const list = document.createElement('div');
  list.className = 'combat-zones';

  for (const zone of services.registry.zones.values()) {
    const card = document.createElement('div');
    card.className = 'combat-zone-card';

    const name = document.createElement('h3');
    name.textContent = zone.name;
    card.appendChild(name);

    const desc = document.createElement('p');
    desc.className = 'combat-zone-card__desc';
    desc.textContent = zone.description;
    card.appendChild(desc);

    const level = document.createElement('div');
    level.className = 'combat-zone-card__level';
    level.textContent = 'Nivel minimo: ' + zone.minLevel;
    card.appendChild(level);

    const scaling = computeZoneScaling(derived.ap, derived.dp, zone);
    if (scaling.requiredAp > 0 || scaling.requiredDp > 0) {
      const req = document.createElement('div');
      req.className = 'combat-zone-card__req';
      const apOk = derived.ap >= scaling.requiredAp;
      const dpOk = derived.dp >= scaling.requiredDp;
      req.innerHTML =
        'Requer <b class="' + (apOk ? 'ok' : 'bad') + '">AP ' + derived.ap + '/' + scaling.requiredAp + '</b>' +
        ' e <b class="' + (dpOk ? 'ok' : 'bad') + '">DP ' + derived.dp + '/' + scaling.requiredDp + '</b>';
      card.appendChild(req);

      const status = document.createElement('div');
      status.className = 'combat-zone-card__status combat-zone-card__status--' + scaling.status;
      status.textContent = scaling.description;
      card.appendChild(status);
    }

    const canEnter = char.level >= zone.minLevel;
    const btn = createButton({
      label: canEnter ? 'Entrar' : 'Requer nivel ' + zone.minLevel,
      icon: canEnter ? 'play' : 'alert',
      variant: canEnter ? 'primary' : 'default',
      disabled: !canEnter,
      onClick: () => { services.startCombat(asZoneId(zone.id as string)); },
    });
    card.appendChild(btn);

    list.appendChild(card);
  }
  wrap.appendChild(list);
  return wrap;
}
import type { GameServices } from '../services/game-services';
import type { IdleSetup, IdleReport } from '../domain/idle/types';
import { asNodeId, asRecipeId, asZoneId } from '../domain/ids';
import { renderPanelHeader } from './panel-header';
import { createIcon } from './icons';

export function renderIdlePanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content idle-sheet';

  root.appendChild(renderPanelHeader({
    icon: 'hourglass',
    title: 'Modo Idle',
    subtitle: 'Progresso automatico quando fechas o jogo (max 8h)',
  }));

  const setup = services.getIdleSetup();

  const body = document.createElement('div');
  body.className = 'idle-body';

  // ---- Coluna esquerda: configuracao ----
  const leftCol = document.createElement('div');
  leftCol.className = 'idle-left';

  leftCol.appendChild(sectionTitle('Atividade'));

  const kindRow = document.createElement('div');
  kindRow.className = 'idle-kinds';
  const kinds: { id: 'combat' | 'gathering' | 'production'; label: string; icon: 'swords' | 'pickaxe' | 'anvil' }[] = [
    { id: 'combat', label: 'Combate', icon: 'swords' },
    { id: 'gathering', label: 'Recolha', icon: 'pickaxe' },
    { id: 'production', label: 'Producao', icon: 'anvil' },
  ];
  for (const k of kinds) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'idle-kind' + (setup?.activity.kind === k.id ? ' idle-kind--active' : '');
    btn.appendChild(createIcon(k.icon, 18));
    const lbl = document.createElement('span');
    lbl.textContent = k.label;
    btn.appendChild(lbl);
    btn.addEventListener('click', () => {
      const current = services.getIdleSetup();
      let next: IdleSetup | null = null;
      if (k.id === 'combat') {
        const zone = services.registry.zones.values().next().value;
        if (zone) next = { activity: { kind: 'combat', zoneId: asZoneId(zone.id as string) }, autoHpItemId: current?.autoHpItemId ?? null, autoHpThreshold: current?.autoHpThreshold ?? 0.3 };
      } else if (k.id === 'gathering') {
        let node = null;
        for (const n of services.registry.nodes.values()) {
          if (n.kind !== 'crop') { node = n; break; }
        }
        if (node) next = { activity: { kind: 'gathering', nodeId: asNodeId(node.id as string) }, autoHpItemId: current?.autoHpItemId ?? null, autoHpThreshold: current?.autoHpThreshold ?? 0.3 };
      } else {
        const recipe = services.registry.recipes.values().next().value;
        if (recipe) next = { activity: { kind: 'production', recipeId: asRecipeId(recipe.id as string), batchesPerCycle: 1 }, autoHpItemId: current?.autoHpItemId ?? null, autoHpThreshold: current?.autoHpThreshold ?? 0.3 };
      }
      services.setIdleSetup(next);
      rerender(services, root);
    });
    kindRow.appendChild(btn);
  }
  leftCol.appendChild(kindRow);

  if (setup) {
    leftCol.appendChild(sectionTitle('Alvo'));

    const targetList = document.createElement('div');
    targetList.className = 'idle-targets';

    if (setup.activity.kind === 'combat') {
      for (const zone of services.registry.zones.values()) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'idle-target' + (setup.activity.zoneId === zone.id ? ' idle-target--selected' : '');
        btn.appendChild(createIcon('swords', 14));
        const txt = document.createElement('span');
        txt.textContent = zone.name + ' (Nv. ' + zone.minLevel + ')';
        btn.appendChild(txt);
        btn.addEventListener('click', () => {
          services.setIdleSetup({ ...setup, activity: { kind: 'combat', zoneId: asZoneId(zone.id as string) } });
          rerender(services, root);
        });
        targetList.appendChild(btn);
      }
    } else if (setup.activity.kind === 'gathering') {
      for (const node of services.registry.nodes.values()) {
        if (node.kind === 'crop') continue;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'idle-target' + (setup.activity.nodeId === node.id ? ' idle-target--selected' : '');
        btn.appendChild(createIcon('pickaxe', 14));
        const txt = document.createElement('span');
        txt.textContent = node.name;
        btn.appendChild(txt);
        btn.addEventListener('click', () => {
          services.setIdleSetup({ ...setup, activity: { kind: 'gathering', nodeId: asNodeId(node.id as string) } });
          rerender(services, root);
        });
        targetList.appendChild(btn);
      }
    } else {
      for (const recipe of services.registry.recipes.values()) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'idle-target' + (setup.activity.recipeId === recipe.id ? ' idle-target--selected' : '');
        btn.appendChild(createIcon('anvil', 14));
        const txt = document.createElement('span');
        txt.textContent = recipe.name + ' (' + recipe.kind + ')';
        btn.appendChild(txt);
        btn.addEventListener('click', () => {
          const batches = setup.activity.kind === 'production' ? setup.activity.batchesPerCycle : 1;
          services.setIdleSetup({ ...setup, activity: { kind: 'production', recipeId: asRecipeId(recipe.id as string), batchesPerCycle: batches } });
          rerender(services, root);
        });
        targetList.appendChild(btn);
      }
    }
    leftCol.appendChild(targetList);

    if (setup.activity.kind === 'combat') {
      leftCol.appendChild(sectionTitle('Auto-pocao'));
      const info = document.createElement('div');
      info.className = 'idle-info';
      info.appendChild(createIcon('flask', 16));
      const txt = document.createElement('span');
      txt.textContent = 'Pocoes de HP no inventario serao usadas automaticamente quando o HP baixar abaixo de ' + Math.round((setup.autoHpThreshold ?? 0.3) * 100) + '%.';
      info.appendChild(txt);
      leftCol.appendChild(info);
    }

    const disable = document.createElement('button');
    disable.type = 'button';
    disable.className = 'idle-disable';
    disable.appendChild(createIcon('close', 14));
    const dl = document.createElement('span');
    dl.textContent = 'DESLIGAR MODO IDLE';
    disable.appendChild(dl);
    disable.addEventListener('click', () => {
      services.setIdleSetup(null);
      rerender(services, root);
    });
    leftCol.appendChild(disable);
  } else {
    const empty = document.createElement('div');
    empty.className = 'idle-empty';
    empty.textContent = 'Escolhe uma atividade acima para configurar.';
    leftCol.appendChild(empty);
  }

  body.appendChild(leftCol);

  // ---- Coluna direita: estado + relatorio ----
  const rightCol = document.createElement('div');
  rightCol.className = 'idle-right';

  rightCol.appendChild(sectionTitle('Estado'));

  const status = document.createElement('div');
  status.className = 'idle-status';
  if (setup) {
    status.classList.add('idle-status--active');
    const dot = document.createElement('span');
    dot.className = 'idle-status__dot';
    status.appendChild(dot);
    const txt = document.createElement('span');
    txt.textContent = 'ATIVO';
    status.appendChild(txt);
  } else {
    status.classList.add('idle-status--inactive');
    const dot = document.createElement('span');
    dot.className = 'idle-status__dot';
    status.appendChild(dot);
    const txt = document.createElement('span');
    txt.textContent = 'INATIVO';
    status.appendChild(txt);
  }
  rightCol.appendChild(status);

  if (setup) {
    const info = document.createElement('div');
    info.className = 'idle-summary';
    info.appendChild(summaryLine('Atividade', setup.activity.kind === 'combat' ? 'Combate' : setup.activity.kind === 'gathering' ? 'Recolha' : 'Producao'));
    if (setup.activity.kind === 'combat') {
      const z = services.registry.zones.get(setup.activity.zoneId);
      info.appendChild(summaryLine('Zona', z?.name ?? setup.activity.zoneId));
    } else if (setup.activity.kind === 'gathering') {
      const n = services.registry.nodes.get(setup.activity.nodeId);
      info.appendChild(summaryLine('Recurso', n?.name ?? setup.activity.nodeId));
    } else {
      const r = services.registry.recipes.get(setup.activity.recipeId);
      info.appendChild(summaryLine('Receita', r?.name ?? setup.activity.recipeId));
    }
    info.appendChild(summaryLine('Limite offline', '8h maximo'));
    rightCol.appendChild(info);
  }

  const report = services.getLastIdleReport();
  if (report) {
    rightCol.appendChild(sectionTitle('Ultimo relatorio'));
    rightCol.appendChild(buildReport(services, report, root));
  } else {
    const hint = document.createElement('div');
    hint.className = 'idle-hint';
    hint.textContent = 'Sem relatorio recente. Fecha o jogo com o modo idle ativo e volta mais tarde.';
    rightCol.appendChild(hint);
  }

  body.appendChild(rightCol);

  root.appendChild(body);
  return root;
}

function buildReport(services: GameServices, report: IdleReport, root: HTMLElement): HTMLElement {
  const box = document.createElement('div');
  box.className = 'idle-report';

  if (report.wasCapped) {
    const cap = document.createElement('div');
    cap.className = 'idle-report__cap';
    cap.textContent = 'AVISO: tempo limitado a 8h maximo';
    box.appendChild(cap);
  }

  const grid = document.createElement('div');
  grid.className = 'idle-report__grid';
  grid.appendChild(statCard('Duracao', formatDuration(report.simulatedMs), 'hourglass', '#e8c977'));
  grid.appendChild(statCard('XP', '+' + report.xpGained, 'level-up', '#6ab87a'));
  grid.appendChild(statCard('Prata', (report.silverGained >= 0 ? '+' : '') + report.silverGained, 'coin', '#e8a848'));
  if (report.kills > 0) grid.appendChild(statCard('Abates', String(report.kills), 'swords', '#d84848'));
  if (report.actions > 0) grid.appendChild(statCard('Acoes', String(report.actions), 'pickaxe', '#6a9ad8'));
  if (report.batches > 0) grid.appendChild(statCard('Lotes', String(report.batches), 'anvil', '#a86ec8'));
  if (report.consumablesUsed > 0) grid.appendChild(statCard('Consumiveis', String(report.consumablesUsed), 'flask', '#d84848'));
  box.appendChild(grid);

  const outcome = document.createElement('div');
  outcome.className = 'idle-report__outcome';
  outcome.textContent = 'Resultado: ' + report.outcome;
  box.appendChild(outcome);

  if (report.loot.length > 0) {
    const lootTitle = document.createElement('div');
    lootTitle.className = 'idle-section-title';
    lootTitle.textContent = 'Materiais obtidos';
    box.appendChild(lootTitle);

    const lootList = document.createElement('div');
    lootList.className = 'idle-loot';
    for (const l of report.loot) {
      const def = services.registry.getItem(l.itemId as never);
      const row = document.createElement('div');
      row.className = 'idle-loot__row';
      const n = document.createElement('span');
      n.className = 'idle-loot__name';
      n.textContent = def?.name ?? l.itemId;
      const q = document.createElement('span');
      q.className = 'idle-loot__qty';
      q.textContent = 'x' + l.quantity;
      row.appendChild(n);
      row.appendChild(q);
      lootList.appendChild(row);
    }
    box.appendChild(lootList);
  }

  if (report.notes) {
    const notes = document.createElement('p');
    notes.className = 'idle-report__notes';
    notes.textContent = report.notes;
    box.appendChild(notes);
  }

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'idle-report__dismiss';
  dismiss.textContent = 'Fechar relatorio';
  dismiss.addEventListener('click', () => {
    services.clearLastIdleReport();
    rerender(services, root);
  });
  box.appendChild(dismiss);

  return box;
}

function statCard(label: string, value: string, icon: 'hourglass' | 'level-up' | 'coin' | 'swords' | 'pickaxe' | 'anvil' | 'flask', color: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'idle-stat';
  card.style.setProperty('--stat-color', color);
  const ic = document.createElement('div');
  ic.className = 'idle-stat__icon';
  ic.appendChild(createIcon(icon, 16));
  card.appendChild(ic);
  const l = document.createElement('div');
  l.className = 'idle-stat__label';
  l.textContent = label;
  card.appendChild(l);
  const v = document.createElement('div');
  v.className = 'idle-stat__value';
  v.textContent = value;
  card.appendChild(v);
  return card;
}

function summaryLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'idle-summary__line';
  const l = document.createElement('span');
  l.className = 'idle-summary__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'idle-summary__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'idle-section';
  el.textContent = text;
  return el;
}

function formatDuration(ms: number): string {
  const sec = Math.floor(ms / 1000);
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (h > 0) return h + 'h ' + m + 'm';
  if (m > 0) return m + 'm ' + (sec % 60) + 's';
  return sec + 's';
}

function rerender(services: GameServices, container: HTMLElement): void {
  const fresh = renderIdlePanel(services);
  container.replaceWith(fresh);
}
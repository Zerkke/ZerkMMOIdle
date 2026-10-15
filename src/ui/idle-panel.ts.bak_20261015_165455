import type { GameServices } from '../services/game-services';
import type { IdleSetup, IdleReport } from '../domain/idle/types';
import { asNodeId, asRecipeId, asZoneId } from '../domain/ids';

export function renderIdlePanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  const header = document.createElement('h2');
  header.textContent = 'Modo Idle';
  root.appendChild(header);

  const intro = document.createElement('p');
  intro.className = 'muted';
  intro.textContent = 'Configura o que o personagem faz quando fechas o jogo. Ao regressar, o tempo decorrido e simulado (maximo 8h).';
  root.appendChild(intro);

  const setup = services.getIdleSetup();

  const kindTitle = document.createElement('h3');
  kindTitle.textContent = 'Atividade';
  root.appendChild(kindTitle);

  const kindRow = document.createElement('div');
  kindRow.className = 'idle-kind-row';
  const kinds: ('combat' | 'gathering' | 'production')[] = ['combat', 'gathering', 'production'];
  for (const k of kinds) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'action-button' + (setup?.activity.kind === k ? ' action-button--active' : '');
    btn.textContent = k === 'combat' ? 'Combate' : k === 'gathering' ? 'Recolha' : 'Producao';
    btn.addEventListener('click', () => {
      const current = services.getIdleSetup();
      let next: IdleSetup | null = null;
      if (k === 'combat') {
        const zone = services.registry.zones.values().next().value;
        if (zone) next = { activity: { kind: 'combat', zoneId: asZoneId(zone.id as string) }, autoHpItemId: current?.autoHpItemId ?? null, autoHpThreshold: current?.autoHpThreshold ?? 0.3 };
      } else if (k === 'gathering') {
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
  root.appendChild(kindRow);

  if (setup) {
    const targetTitle = document.createElement('h3');
    targetTitle.textContent = 'Alvo';
    root.appendChild(targetTitle);

    const targetList = document.createElement('div');
    targetList.className = 'idle-target-list';

    if (setup.activity.kind === 'combat') {
      for (const zone of services.registry.zones.values()) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'idle-target' + (setup.activity.zoneId === zone.id ? ' idle-target--selected' : '');
        btn.textContent = zone.name + ' (Nv. ' + zone.minLevel + ')';
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
        btn.textContent = node.name;
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
        btn.textContent = recipe.name + ' (' + recipe.kind + ')';
        btn.addEventListener('click', () => {
          const batches = setup.activity.kind === 'production' ? setup.activity.batchesPerCycle : 1;
          services.setIdleSetup({ ...setup, activity: { kind: 'production', recipeId: asRecipeId(recipe.id as string), batchesPerCycle: batches } });
          rerender(services, root);
        });
        targetList.appendChild(btn);
      }
    }
    root.appendChild(targetList);

    if (setup.activity.kind === 'combat') {
      const hpTitle = document.createElement('h3');
      hpTitle.textContent = 'Auto-pocao';
      root.appendChild(hpTitle);

      const hpInfo = document.createElement('p');
      hpInfo.className = 'muted';
      hpInfo.textContent = 'Pocoes de HP no inventario serao usadas automaticamente quando o HP baixar.';
      root.appendChild(hpInfo);
    }

    const disable = document.createElement('button');
    disable.type = 'button';
    disable.className = 'action-button action-button--danger';
    disable.textContent = 'Desligar modo idle';
    disable.addEventListener('click', () => {
      services.setIdleSetup(null);
      rerender(services, root);
    });
    root.appendChild(disable);
  } else {
    const empty = document.createElement('p');
    empty.className = 'muted';
    empty.textContent = 'Escolhe uma atividade acima para configurar.';
    root.appendChild(empty);
  }

  const report = services.getLastIdleReport();
  if (report) {
    root.appendChild(renderReport(services, report, root));
  }

  return root;
}

function renderReport(services: GameServices, report: IdleReport, root: HTMLElement): HTMLElement {
  const box = document.createElement('div');
  box.className = 'idle-report';

  const h = document.createElement('h3');
  h.textContent = 'Ultimo relatorio offline';
  box.appendChild(h);

  const grid = document.createElement('div');
  grid.className = 'info-grid';
  grid.appendChild(row('Duracao simulada', formatDuration(report.simulatedMs)));
  if (report.wasCapped) grid.appendChild(row('AVISO', 'Limitado a 8h maximo'));
  grid.appendChild(row('Resultado', report.outcome));
  grid.appendChild(row('XP', '+' + report.xpGained));
  grid.appendChild(row('Prata', (report.silverGained >= 0 ? '+' : '') + report.silverGained));
  if (report.kills > 0) grid.appendChild(row('Abates', String(report.kills)));
  if (report.actions > 0) grid.appendChild(row('Acoes', String(report.actions)));
  if (report.batches > 0) grid.appendChild(row('Lotes', String(report.batches)));
  if (report.consumablesUsed > 0) grid.appendChild(row('Consumiveis', String(report.consumablesUsed)));
  box.appendChild(grid);

  if (report.loot.length > 0) {
    const lootTitle = document.createElement('h4');
    lootTitle.className = 'idle-report__sub';
    lootTitle.textContent = 'Materiais obtidos';
    box.appendChild(lootTitle);

    const lootList = document.createElement('div');
    lootList.className = 'info-grid';
    for (const l of report.loot) {
      const def = services.registry.getItem(l.itemId as never);
      lootList.appendChild(row(def?.name ?? l.itemId, 'x' + l.quantity));
    }
    box.appendChild(lootList);
  }

  const notes = document.createElement('p');
  notes.className = 'muted';
  notes.textContent = report.notes;
  box.appendChild(notes);

  const dismiss = document.createElement('button');
  dismiss.type = 'button';
  dismiss.className = 'action-button';
  dismiss.textContent = 'Fechar relatorio';
  dismiss.addEventListener('click', () => {
    services.clearLastIdleReport();
    rerender(services, root);
  });
  box.appendChild(dismiss);

  return box;
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
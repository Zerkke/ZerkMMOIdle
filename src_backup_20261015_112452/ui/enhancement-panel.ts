import type { GameServices } from '../services/game-services';
import type { EnhancementPreview } from '../domain/enhancement/types';
import { renderPanelHeader, renderSectionTitle } from './panel-header';
import { createButton } from './button';
import { renderItemCell, renderEmptyCell } from './item-cell';

let selectedSlot: number | null = null;

export function renderEnhancementPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'anvil',
    title: 'Melhoramentos',
    subtitle: 'Aumenta o poder dos teus equipamentos',
  }));

  root.appendChild(renderSectionTitle('Itens melhoraveis'));

  const inv = services.getInventory();
  const slots = inv.list();
  const grid = document.createElement('div');
  grid.className = 'item-grid';

  let countEnh = 0;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) continue;
    const def = services.registry.getItem(slot.itemId);
    if (!def || !def.enhanceable) continue;
    countEnh++;

    grid.appendChild(renderItemCell({
      itemId: slot.itemId as string,
      itemName: def.name,
      itemCategory: def.category,
      itemRarity: def.rarity,
      quantity: slot.quantity,
      enhancementLevel: slot.enhancementLevel,
      onClick: () => {
        selectedSlot = selectedSlot === i ? null : i;
        rerender(services, root);
      },
    }));
  }

  if (countEnh === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-state panel-state--empty';
    empty.textContent = 'Nenhum item melhoravel no inventario.';
    root.appendChild(empty);
  } else {
    root.appendChild(grid);
  }

  if (selectedSlot !== null) {
    const preview = services.previewEnhancement(selectedSlot, false);
    if (preview) {
      root.appendChild(renderPreview(services, selectedSlot, preview, root));
    }
  }

  const history = services.getEnhancementHistory();
  if (history.length > 0) {
    root.appendChild(renderSectionTitle('Historico recente'));
    const hList = document.createElement('div');
    hList.className = 'enh-history';
    for (const h of history) {
      const def = services.registry.getItem(h.itemId);
      const name = def?.name ?? h.itemId;
      const e = document.createElement('div');
      e.className = 'enh-history__entry' + (h.success ? ' enh-history__entry--ok' : ' enh-history__entry--fail');
      let text = name + ' +' + h.previousLevel + ' → +' + h.attemptedLevel + ': ';
      if (h.success) text += 'SUCESSO';
      else if (h.destroyed) text += 'DESTRUIDO';
      else if (h.usedProtection) text += 'FALHA (protegido)';
      else text += 'FALHA';
      e.textContent = text;
      hList.appendChild(e);
    }
    root.appendChild(hList);
  }

  return root;
}

function renderPreview(
  services: GameServices,
  slotIndex: number,
  p: EnhancementPreview,
  root: HTMLElement,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'enh-preview';

  if (p.alreadyMax) {
    const max = document.createElement('p');
    max.textContent = 'Nivel maximo atingido (+' + p.maxLevel + ').';
    box.appendChild(max);
    return box;
  }

  const def = services.registry.getItem(p.itemId);
  root.appendChild(renderSectionTitle('Preview'));
  const title = document.createElement('h3');
  title.textContent = (def?.name ?? p.itemId) + ' +' + p.currentLevel + ' → +' + p.targetLevel;
  box.appendChild(title);

  const rows = document.createElement('div');
  rows.className = 'info-grid';
  rows.appendChild(row('Chance de sucesso', (p.successChance * 100).toFixed(1) + '%'));
  rows.appendChild(row('Custo (prata)', String(p.cost.silver)));
  for (const m of p.cost.materials) {
    const mDef = services.registry.getItem(m.itemId);
    rows.appendChild(row('Material: ' + (mDef?.name ?? m.itemId), String(m.quantity)));
  }
  rows.appendChild(row('Falha resulta em', describeFailure(p.failureOutcome)));
  box.appendChild(rows);

  if (!p.canAfford) {
    const warn = document.createElement('p');
    warn.className = 'enh-warning';
    warn.textContent = 'Falta: ' + (p.missingSilver > 0 ? p.missingSilver + ' prata. ' : '') + p.missingMaterials.length + ' materiais.';
    box.appendChild(warn);
  }

  const actions = document.createElement('div');
  actions.className = 'action-row';

  actions.appendChild(createButton({
    label: 'Confirmar melhoramento',
    icon: 'anvil',
    variant: 'primary',
    disabled: !p.canAfford,
    onClick: () => {
      const itemName = def?.name ?? p.itemId;
      if (!window.confirm('Tentar melhorar ' + itemName + ' para +' + p.targetLevel + '?')) return;
      services.enhanceFromInventorySlot(slotIndex, false);
      selectedSlot = null;
      rerender(services, root);
    },
  }));

  actions.appendChild(createButton({
    label: 'Cancelar',
    icon: 'close',
    onClick: () => { selectedSlot = null; rerender(services, root); },
  }));

  box.appendChild(actions);
  return box;
}

function describeFailure(o: EnhancementPreview['failureOutcome']): string {
  switch (o.kind) {
    case 'nothing': return 'Nada acontece';
    case 'downgrade': return 'Desce ' + o.by + ' nivel(is)';
    case 'destroy': return 'Item destruido';
  }
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

function rerender(services: GameServices, container: HTMLElement): void {
  const fresh = renderEnhancementPanel(services);
  container.replaceWith(fresh);
}

void renderEmptyCell;
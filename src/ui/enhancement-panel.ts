import type { GameServices } from '../services/game-services';
import type { EnhancementPreview } from '../domain/enhancement/types';
import { enhancementBonuses } from '../domain/enhancement/bonus';
import { renderPanelHeader } from './panel-header';
import { createIcon } from './icons';
import { renderItemCell } from './item-cell';

let selectedSlot: number | null = null;

export function renderEnhancementPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content enh-sheet';

  root.appendChild(renderPanelHeader({
    icon: 'anvil',
    title: 'Melhoramentos',
    subtitle: 'Aumenta o poder dos teus equipamentos',
  }));

  const body = document.createElement('div');
  body.className = 'enh-body';

  // ---- Coluna esquerda: grelha ----
  const leftCol = document.createElement('div');
  leftCol.className = 'enh-left';
  leftCol.appendChild(sectionTitle('Itens melhoraveis'));

  const inv = services.getInventory();
  const slots = inv.list();
  const grid = document.createElement('div');
  grid.className = 'enh-grid';

  let countEnh = 0;
  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) continue;
    const def = services.registry.getItem(slot.itemId);
    if (!def || !def.enhanceable) continue;
    countEnh++;

    const cell = renderItemCell({
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
    });
    if (selectedSlot === i) cell.classList.add('item-cell--selected');
    grid.appendChild(cell);
  }

  if (countEnh === 0) {
    const empty = document.createElement('p');
    empty.className = 'enh-empty';
    empty.textContent = 'Nenhum item melhoravel no inventario.';
    leftCol.appendChild(empty);
  } else {
    leftCol.appendChild(grid);
  }
  body.appendChild(leftCol);

  // ---- Coluna direita: preview ----
  const rightCol = document.createElement('div');
  rightCol.className = 'enh-right';

  if (selectedSlot !== null) {
    const preview = services.previewEnhancement(selectedSlot, false);
    if (preview) {
      rightCol.appendChild(buildPreview(services, selectedSlot, preview, root));
    } else {
      const hint = document.createElement('div');
      hint.className = 'enh-right__hint';
      hint.textContent = 'Este item nao pode ser melhorado.';
      rightCol.appendChild(hint);
    }
  } else {
    const hint = document.createElement('div');
    hint.className = 'enh-right__hint';
    hint.textContent = 'Seleciona um item para ver o preview do proximo nivel.';
    rightCol.appendChild(hint);
  }
  body.appendChild(rightCol);

  root.appendChild(body);

  // ---- Historico ----
  const history = services.getEnhancementHistory();
  if (history.length > 0) {
    root.appendChild(sectionTitle('Historico recente'));
    const hList = document.createElement('div');
    hList.className = 'enh-history';
    for (const h of history) {
      const def = services.registry.getItem(h.itemId);
      const name = def?.name ?? h.itemId;
      const e = document.createElement('div');
      e.className = 'enh-history__entry' + (h.success ? ' enh-history__entry--ok' : ' enh-history__entry--fail');
      let text = name + ' +' + h.previousLevel + ' -> +' + h.attemptedLevel + ': ';
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

// ============================================================
// Preview
// ============================================================
function buildPreview(
  services: GameServices,
  slotIndex: number,
  p: EnhancementPreview,
  root: HTMLElement,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'enh-preview';

  const def = services.registry.getItem(p.itemId);
  if (!def) {
    const err = document.createElement('div');
    err.textContent = 'Item nao encontrado.';
    box.appendChild(err);
    return box;
  }

  // Header
  const header = document.createElement('div');
  header.className = 'enh-preview__header';

  const nameEl = document.createElement('div');
  nameEl.className = 'enh-preview__name';
  nameEl.textContent = def.name;
  header.appendChild(nameEl);

  const levelEl = document.createElement('div');
  levelEl.className = 'enh-preview__level';
  levelEl.innerHTML = '<b>+' + p.currentLevel + '</b> <span>→</span> <em>+' + p.targetLevel + '</em>';
  header.appendChild(levelEl);
  box.appendChild(header);

  if (p.alreadyMax) {
    const max = document.createElement('div');
    max.className = 'enh-preview__max';
    max.textContent = 'Nivel maximo atingido (+' + p.maxLevel + ')';
    box.appendChild(max);
    return box;
  }

  // Diff de stats
  const cur = enhancementBonuses(def, p.currentLevel);
  const nxt = enhancementBonuses(def, p.targetLevel);

  const diff = document.createElement('div');
  diff.className = 'enh-diff';
  diff.appendChild(diffTitle('Bonus que ganhas com o melhoramento'));

  const rows = [
    { label: 'AP', from: cur.attackPower, to: nxt.attackPower, color: '#e8a848', fmt: (v: number) => '+' + v },
    { label: 'DP', from: cur.defensePower, to: nxt.defensePower, color: '#6a9ad8', fmt: (v: number) => '+' + v },
    { label: 'HP', from: cur.hp, to: nxt.hp, color: '#d84848', fmt: (v: number) => '+' + v },
    { label: 'Critico', from: cur.critChance, to: nxt.critChance, color: '#e8c977', fmt: (v: number) => '+' + (v * 100).toFixed(1) + '%' },
    { label: 'Dano critico', from: cur.critDamage, to: nxt.critDamage, color: '#a86ec8', fmt: (v: number) => '+' + (v * 100).toFixed(1) + '%' },
    { label: 'Regen HP/s', from: cur.hpRegen, to: nxt.hpRegen, color: '#6ab87a', fmt: (v: number) => '+' + v.toFixed(1) + '/s' },
    { label: 'Roubo de vida', from: cur.lifesteal, to: nxt.lifesteal, color: '#a86ec8', fmt: (v: number) => '+' + (v * 100).toFixed(2) + '%' },
  ];

  let shown = 0;
  for (const r of rows) {
    if (r.from === 0 && r.to === 0) continue;
    shown++;
    const row = document.createElement('div');
    row.className = 'enh-diff__row';
    row.style.setProperty('--diff-color', r.color);

    const lbl = document.createElement('span');
    lbl.className = 'enh-diff__label';
    lbl.textContent = r.label;
    row.appendChild(lbl);

    const fromEl = document.createElement('span');
    fromEl.className = 'enh-diff__from';
    fromEl.textContent = r.fmt(r.from);
    row.appendChild(fromEl);

    const arrow = document.createElement('span');
    arrow.className = 'enh-diff__arrow';
    arrow.textContent = '→';
    row.appendChild(arrow);

    const toEl = document.createElement('span');
    toEl.className = 'enh-diff__to';
    toEl.textContent = r.fmt(r.to);
    row.appendChild(toEl);

    diff.appendChild(row);
  }
  if (shown === 0) {
    const none = document.createElement('div');
    none.className = 'enh-diff__none';
    none.textContent = 'Sem bonus adicionais neste nivel.';
    diff.appendChild(none);
  }
  box.appendChild(diff);

  // Chance de sucesso
  const chance = document.createElement('div');
  chance.className = 'enh-chance';
  const chanceLabel = document.createElement('div');
  chanceLabel.className = 'enh-chance__label';
  const pct = (p.successChance * 100);
  chanceLabel.innerHTML = 'Chance de sucesso <b>' + pct.toFixed(1) + '%</b>';
  chance.appendChild(chanceLabel);

  const chanceTrack = document.createElement('div');
  chanceTrack.className = 'enh-chance__track';
  const chanceFill = document.createElement('div');
  chanceFill.className = 'enh-chance__fill';
  chanceFill.style.width = Math.max(0, Math.min(100, pct)) + '%';
  if (pct >= 75) chanceFill.classList.add('enh-chance__fill--high');
  else if (pct >= 40) chanceFill.classList.add('enh-chance__fill--mid');
  else chanceFill.classList.add('enh-chance__fill--low');
  chanceTrack.appendChild(chanceFill);
  chance.appendChild(chanceTrack);
  box.appendChild(chance);

  // Custo
  const cost = document.createElement('div');
  cost.className = 'enh-cost';
  cost.appendChild(diffTitle('Custo'));

  const silverRow = document.createElement('div');
  silverRow.className = 'enh-cost__row';
  silverRow.appendChild(createIcon('coin', 14));
  const silverLbl = document.createElement('span');
  silverLbl.innerHTML = '<b>' + p.cost.silver.toLocaleString('pt-PT') + '</b> prata';
  silverRow.appendChild(silverLbl);
  cost.appendChild(silverRow);

  for (const m of p.cost.materials) {
    const mDef = services.registry.getItem(m.itemId);
    const mRow = document.createElement('div');
    mRow.className = 'enh-cost__row';
    mRow.appendChild(createIcon('ore', 14));
    const mLbl = document.createElement('span');
    mLbl.innerHTML = '<b>' + m.quantity + '</b>× ' + (mDef?.name ?? m.itemId);
    mRow.appendChild(mLbl);
    cost.appendChild(mRow);
  }
  box.appendChild(cost);

  // Falha
  const failKind = p.failureOutcome.kind;
  const fail = document.createElement('div');
  fail.className = 'enh-fail enh-fail--' + failKind;
  const failIcon = document.createElement('span');
  failIcon.className = 'enh-fail__icon';
  if (failKind === 'destroy') failIcon.textContent = '!!';
  else if (failKind === 'downgrade') failIcon.textContent = 'v';
  else failIcon.textContent = 'i';
  fail.appendChild(failIcon);
  const failText = document.createElement('span');
  failText.className = 'enh-fail__text';
  failText.textContent = 'Se falhar: ' + describeFailure(p.failureOutcome);
  fail.appendChild(failText);
  box.appendChild(fail);

  // Falta recursos
  if (!p.canAfford) {
    const warn = document.createElement('div');
    warn.className = 'enh-warning';
    let txt = 'Faltam recursos: ';
    if (p.missingSilver > 0) txt += p.missingSilver + ' prata. ';
    if (p.missingMaterials.length > 0) txt += p.missingMaterials.length + ' materiais.';
    warn.textContent = txt;
    box.appendChild(warn);
  }

  // Acoes
  const actions = document.createElement('div');
  actions.className = 'enh-actions';

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'enh-action enh-action--primary';
  confirmBtn.disabled = !p.canAfford;
  confirmBtn.appendChild(createIcon('anvil', 16));
  const cLbl = document.createElement('span');
  cLbl.textContent = 'MELHORAR PARA +' + p.targetLevel;
  confirmBtn.appendChild(cLbl);
  confirmBtn.addEventListener('click', () => {
    if (!window.confirm('Tentar melhorar ' + def.name + ' para +' + p.targetLevel + '?')) return;
    services.enhanceFromInventorySlot(slotIndex, false);
    selectedSlot = null;
    rerender(services, root);
  });
  actions.appendChild(confirmBtn);

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'enh-action';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.addEventListener('click', () => {
    selectedSlot = null;
    rerender(services, root);
  });
  actions.appendChild(cancelBtn);

  box.appendChild(actions);
  return box;
}

function diffTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'enh-section-title';
  el.textContent = text;
  return el;
}

function sectionTitle(text: string): HTMLElement {
  const el = document.createElement('div');
  el.className = 'enh-section';
  el.textContent = text;
  return el;
}

function describeFailure(o: EnhancementPreview['failureOutcome']): string {
  switch (o.kind) {
    case 'nothing': return 'Nada acontece';
    case 'downgrade': return 'Desce ' + o.by + ' nivel(is)';
    case 'destroy': return 'Item destruido';
  }
}

function rerender(services: GameServices, container: HTMLElement): void {
  const fresh = renderEnhancementPanel(services);
  container.replaceWith(fresh);
}
import type { GameServices } from '../services/game-services';
import { renderPanelHeader } from './panel-header';
import { createIcon } from './icons';
import { getItemVisual, getRarityVisual } from './item-icons';
import { npcBuybackPrice } from '../data/npc-shop.data';
import type { ItemId } from '../domain/ids';
import type { ItemDefinition } from '../domain/content';

type ShopTab = 'buy' | 'sell';
type ShopFilter = 'all' | 'equip' | 'consumable' | 'material' | 'trash';
type ShopSort = 'type' | 'price-asc' | 'price-desc' | 'name';

interface Candidate {
  readonly kind: ShopTab;
  readonly itemId: ItemId;
  readonly def: ItemDefinition;
  readonly unitPrice: number;
  readonly maxQty: number;
  readonly slotIndex: number;
  readonly enhLevel: number;
}

export function renderNpcShopPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content shop-sheet';

  let activeTab: ShopTab = 'buy';
  let filter: ShopFilter = 'all';
  let sort: ShopSort = 'type';

  const rerender = (): void => {
    root.innerHTML = '';
    root.appendChild(renderPanelHeader({
      icon: 'cart',
      title: 'Mercador',
      subtitle: 'Compra e vende items por prata',
    }));

    root.appendChild(buildHeaderBar(services));

    // Tabs
    const tabs = document.createElement('div');
    tabs.className = 'shop-tabs';
    const tabsDef: { id: ShopTab; label: string; icon: 'cart' | 'coin' }[] = [
      { id: 'buy', label: 'COMPRAR', icon: 'cart' },
      { id: 'sell', label: 'VENDER', icon: 'coin' },
    ];
    for (const t of tabsDef) {
      const count = collectCandidates(services, t.id).length;
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'shop-tab' + (activeTab === t.id ? ' shop-tab--active' : '');
      b.appendChild(createIcon(t.icon, 14));
      const lbl = document.createElement('span');
      lbl.textContent = t.label;
      b.appendChild(lbl);
      const badge = document.createElement('span');
      badge.className = 'shop-tab__badge';
      badge.textContent = String(count);
      b.appendChild(badge);
      b.addEventListener('click', () => { activeTab = t.id; rerender(); });
      tabs.appendChild(b);
    }
    root.appendChild(tabs);

    // Filters + sort
    const filt = document.createElement('div');
    filt.className = 'shop-filters';
    const filtersDef: { id: ShopFilter; label: string }[] = [
      { id: 'all', label: 'Tudo' },
      { id: 'equip', label: 'Equipamento' },
      { id: 'consumable', label: 'Consumiveis' },
      { id: 'material', label: 'Materiais' },
      { id: 'trash', label: 'Trash' },
    ];
    for (const f of filtersDef) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'shop-filter' + (filter === f.id ? ' shop-filter--active' : '');
      b.textContent = f.label;
      b.addEventListener('click', () => { filter = f.id; rerender(); });
      filt.appendChild(b);
    }
    root.appendChild(filt);

    const sortBar = document.createElement('div');
    sortBar.className = 'shop-sorts';
    const sortLabel = document.createElement('span');
    sortLabel.className = 'shop-sorts__label';
    sortLabel.textContent = 'Ordenar:';
    sortBar.appendChild(sortLabel);
    const sortsDef: { id: ShopSort; label: string }[] = [
      { id: 'type', label: 'Tipo' },
      { id: 'price-asc', label: 'Preco baixo' },
      { id: 'price-desc', label: 'Preco alto' },
      { id: 'name', label: 'Nome' },
    ];
    for (const s of sortsDef) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'shop-sort' + (sort === s.id ? ' shop-sort--active' : '');
      b.textContent = s.label;
      b.addEventListener('click', () => { sort = s.id; rerender(); });
      sortBar.appendChild(b);
    }
    root.appendChild(sortBar);

    // Grid
    const all = collectCandidates(services, activeTab);
    const list = all
      .filter((c) => passesFilter(c.def, filter))
      .sort((a, b) => compareCandidates(a, b, sort));

    const grid = document.createElement('div');
    grid.className = 'shop-grid';
    if (list.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'shop-empty';
      empty.textContent = 'Nada para mostrar com esses filtros.';
      grid.appendChild(empty);
    } else {
      for (const c of list) grid.appendChild(buildCard(c, () => openModal(services, c, rerender)));
    }
    root.appendChild(grid);
  };

  rerender();
  return root;
}

// ============================================================
// Header bar (wallet)
// ============================================================
function buildHeaderBar(services: GameServices): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'shop-silver-bar';
  bar.appendChild(createIcon('coin', 16));
  const char = services.getCharacter();
  const lbl = document.createElement('span');
  lbl.className = 'shop-silver-bar__label';
  lbl.innerHTML = 'Tens <b>' + char.silver.toLocaleString('pt-PT') + '</b> prata';
  bar.appendChild(lbl);
  return bar;
}

// ============================================================
// Card
// ============================================================
function buildCard(c: Candidate, onClick: () => void): HTMLElement {
  const card = document.createElement('button');
  card.type = 'button';
  card.className = 'shop-card';
  card.style.setProperty('--rarity-border', getRarityVisual(c.def.rarity).border);
  card.style.setProperty('--rarity-glow', getRarityVisual(c.def.rarity).glow);

  const visual = getItemVisual(c.itemId as string, c.def.category);

  const iconWrap = document.createElement('div');
  iconWrap.className = 'shop-card__icon';
  iconWrap.style.color = visual.tint;
  iconWrap.appendChild(createIcon(visual.icon, 44));
  card.appendChild(iconWrap);

  if (c.enhLevel > 0) {
    const enh = document.createElement('div');
    enh.className = 'shop-card__enh';
    enh.textContent = '+' + c.enhLevel;
    card.appendChild(enh);
  }

  const name = document.createElement('div');
  name.className = 'shop-card__name';
  name.textContent = c.def.name;
  card.appendChild(name);

  const price = document.createElement('div');
  price.className = 'shop-card__price' + (c.kind === 'sell' ? ' shop-card__price--sell' : '');
  price.appendChild(createIcon('coin', 12));
  const pv = document.createElement('span');
  pv.textContent = c.unitPrice.toLocaleString('pt-PT');
  price.appendChild(pv);
  card.appendChild(price);

  card.addEventListener('click', onClick);
  return card;
}

// ============================================================
// Modal
// ============================================================
function openModal(services: GameServices, c: Candidate, onDone: () => void): void {
  const existing = document.querySelector('.shop-modal');
  if (existing) existing.remove();

  let qty = 1;

  const modal = document.createElement('div');
  modal.className = 'shop-modal';

  const backdrop = document.createElement('div');
  backdrop.className = 'shop-modal__backdrop';
  backdrop.addEventListener('click', () => modal.remove());
  modal.appendChild(backdrop);

  const box = document.createElement('div');
  box.className = 'shop-modal__box';
  box.style.setProperty('--rarity-border', getRarityVisual(c.def.rarity).border);
  box.style.setProperty('--rarity-glow', getRarityVisual(c.def.rarity).glow);

  const closeBtn = document.createElement('button');
  closeBtn.type = 'button';
  closeBtn.className = 'shop-modal__close';
  closeBtn.textContent = 'x';
  closeBtn.addEventListener('click', () => modal.remove());
  box.appendChild(closeBtn);

  const visual = getItemVisual(c.itemId as string, c.def.category);
  const hero = document.createElement('div');
  hero.className = 'shop-modal__hero';
  hero.style.color = visual.tint;
  hero.appendChild(createIcon(visual.icon, 72));
  box.appendChild(hero);

  const nameEl = document.createElement('h3');
  nameEl.className = 'shop-modal__name';
  nameEl.textContent = c.def.name;
  box.appendChild(nameEl);

  const meta = document.createElement('div');
  meta.className = 'shop-modal__meta';
  meta.textContent = getRarityVisual(c.def.rarity).label + ' - ' + c.unitPrice.toLocaleString('pt-PT') + ' prata / unidade';
  box.appendChild(meta);

  const attrs = document.createElement('div');
  attrs.className = 'shop-modal__attrs';
  if (c.def.attackPower > 0) attrs.appendChild(statPill('AP', '+' + c.def.attackPower));
  if (c.def.defensePower > 0) attrs.appendChild(statPill('DP', '+' + c.def.defensePower));
  const ab = c.def.attributeBonuses;
  if (ab) {
    if (ab.strength) attrs.appendChild(statPill('FOR', '+' + ab.strength));
    if (ab.agility) attrs.appendChild(statPill('AGI', '+' + ab.agility));
    if (ab.intelligence) attrs.appendChild(statPill('INT', '+' + ab.intelligence));
    if (ab.vitality) attrs.appendChild(statPill('VIT', '+' + ab.vitality));
  }
  if (attrs.children.length > 0) box.appendChild(attrs);

  // Qty
  const qtySection = document.createElement('div');
  qtySection.className = 'shop-modal__section';
  const qtyLabel = document.createElement('div');
  qtyLabel.className = 'shop-modal__section-label';
  qtyLabel.textContent = 'Quantidade';
  qtySection.appendChild(qtyLabel);

  const qtyRow = document.createElement('div');
  qtyRow.className = 'shop-modal__qty';

  const input = document.createElement('input');
  input.type = 'number';
  input.className = 'shop-modal__qty-input';
  input.value = String(qty);
  input.min = '1';
  input.max = String(c.maxQty);

  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'shop-modal__qty-btn';
  minus.textContent = '-';
  minus.addEventListener('click', () => {
    qty = Math.max(1, qty - 1);
    input.value = String(qty);
    updateTotal();
  });
  qtyRow.appendChild(minus);
  qtyRow.appendChild(input);
  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'shop-modal__qty-btn';
  plus.textContent = '+';
  plus.addEventListener('click', () => {
    qty = Math.min(c.maxQty, qty + 1);
    input.value = String(qty);
    updateTotal();
  });
  qtyRow.appendChild(plus);
  qtySection.appendChild(qtyRow);

  input.addEventListener('input', () => {
    const v = parseInt(input.value, 10);
    qty = Math.max(1, Math.min(c.maxQty, Number.isFinite(v) ? v : 1));
    updateTotal();
  });

  const quick = document.createElement('div');
  quick.className = 'shop-modal__quick';
  const quickValues = [1, 5, 10, c.maxQty];
  const quickLabels = ['x1', 'x5', 'x10', 'Max'];
  for (let i = 0; i < quickValues.length; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'shop-modal__quick-btn';
    b.textContent = quickLabels[i] ?? ('x' + quickValues[i]);
    b.addEventListener('click', () => {
      qty = Math.max(1, Math.min(c.maxQty, quickValues[i] ?? 1));
      input.value = String(qty);
      updateTotal();
    });
    quick.appendChild(b);
  }
  qtySection.appendChild(quick);
  box.appendChild(qtySection);

  const totalRow = document.createElement('div');
  totalRow.className = 'shop-modal__total';
  box.appendChild(totalRow);

  const actions = document.createElement('div');
  actions.className = 'shop-modal__actions';

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.className = 'shop-modal__cancel';
  cancelBtn.textContent = 'Cancelar';
  cancelBtn.addEventListener('click', () => modal.remove());
  actions.appendChild(cancelBtn);

  const confirmBtn = document.createElement('button');
  confirmBtn.type = 'button';
  confirmBtn.className = 'shop-modal__confirm' + (c.kind === 'sell' ? ' shop-modal__confirm--sell' : '');
  confirmBtn.textContent = c.kind === 'buy' ? 'Comprar' : 'Vender';
  actions.appendChild(confirmBtn);
  box.appendChild(actions);

  const updateTotal = (): void => {
    const total = qty * c.unitPrice;
    const char = services.getCharacter();
    if (c.kind === 'buy') {
      const ok = total <= char.silver;
      totalRow.innerHTML = 'Total: <b>' + total.toLocaleString('pt-PT') + '</b> prata';
      totalRow.classList.toggle('shop-modal__total--error', !ok);
      confirmBtn.disabled = !ok;
    } else {
      totalRow.innerHTML = 'Recebes: <b>' + total.toLocaleString('pt-PT') + '</b> prata';
      confirmBtn.disabled = false;
    }
  };

  confirmBtn.addEventListener('click', () => {
    if (c.kind === 'buy') {
      if (services.buyFromNpc(c.itemId, qty)) { modal.remove(); onDone(); }
    } else {
      if (services.sellToNpc(c.slotIndex, qty)) { modal.remove(); onDone(); }
    }
  });

  updateTotal();
  modal.appendChild(box);
  document.body.appendChild(modal);
}

function statPill(label: string, value: string): HTMLElement {
  const p = document.createElement('span');
  p.className = 'shop-modal__pill';
  const l = document.createElement('b');
  l.textContent = label;
  p.appendChild(l);
  const v = document.createElement('span');
  v.textContent = value;
  p.appendChild(v);
  return p;
}

// ============================================================
// Helpers
// ============================================================
function collectCandidates(services: GameServices, tab: ShopTab): Candidate[] {
  const out: Candidate[] = [];
  if (tab === 'buy') {
    for (const entry of services.getShopCatalog()) {
      const def = services.registry.getItem(entry.itemId);
      if (!def) continue;
      out.push({ kind: 'buy', itemId: entry.itemId, def, unitPrice: entry.buyPrice, maxQty: 999, slotIndex: -1, enhLevel: 0 });
    }
  } else {
    const slots = services.getInventory().list();
    for (let i = 0; i < slots.length; i++) {
      const s = slots[i];
      if (!s) continue;
      const def = services.registry.getItem(s.itemId);
      if (!def || def.sellPrice <= 0) continue;
      out.push({ kind: 'sell', itemId: s.itemId, def, unitPrice: npcBuybackPrice(def.sellPrice), maxQty: s.quantity, slotIndex: i, enhLevel: s.enhancementLevel });
    }
  }
  return out;
}

function passesFilter(def: ItemDefinition, f: ShopFilter): boolean {
  if (f === 'all') return true;
  if (f === 'trash') return (def.id as string).indexOf('item.trash.') === 0;
  if (f === 'equip') return def.category === 'weapon' || def.category === 'armor' || def.category === 'accessory' || def.category === 'tool';
  if (f === 'consumable') return def.category === 'consumable';
  if (f === 'material') return def.category === 'material' || def.category === 'seed' || def.category === 'crop' || def.category === 'fish' || def.category === 'meat';
  return true;
}

function compareCandidates(a: Candidate, b: Candidate, mode: ShopSort): number {
  if (mode === 'name') return a.def.name.localeCompare(b.def.name);
  if (mode === 'price-asc') return a.unitPrice - b.unitPrice;
  if (mode === 'price-desc') return b.unitPrice - a.unitPrice;
  if (a.def.category !== b.def.category) return a.def.category.localeCompare(b.def.category);
  return a.def.name.localeCompare(b.def.name);
}
import type { GameServices } from '../services/game-services';
import { isEquippable, isTool, type ItemDefinition } from '../domain/content';
import { asItemId } from '../domain/ids';
import { renderPanelHeader } from './panel-header';
import { renderItemCell } from './item-cell';
import { createIcon } from './icons';

type InvFilter = 'all' | 'equip' | 'material' | 'consumable' | 'essence';
type InvSort = 'type' | 'rarity' | 'name';

const RARITY_ORDER: Record<string, number> = {
  common: 0, uncommon: 1, rare: 2, epic: 3, legendary: 4,
};

interface SlotView {
  readonly index: number;
  readonly itemId: string;
  readonly quantity: number;
  readonly enhancementLevel: number;
  readonly randomAttributes: readonly unknown[] | null;
  readonly essences: readonly (string | null)[] | null;
  readonly durability: number | null;
  readonly def: ItemDefinition;
}

export function renderInventoryPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content inv-panel';

  let filter: InvFilter = 'all';
  let sort: InvSort = 'type';
  let selectedIndex: number | null = null;

  const rerender = (): void => {
    root.innerHTML = '';
    root.appendChild(renderPanelHeader({
      icon: 'briefcase',
      title: 'Inventario',
      subtitle: 'Arsenal, materiais e recursos',
    }));
    root.appendChild(buildToolbar(services, filter, sort,
      (f) => { filter = f; rerender(); },
      (s) => { sort = s; rerender(); },
    ));

    const body = document.createElement('div');
    body.className = 'inv-body';

    const items = collectItems(services, filter, sort);

    const gridWrap = document.createElement('div');
    gridWrap.className = 'inv-grid-wrap';
    const grid = document.createElement('div');
    grid.className = 'inv-grid';

    if (items.length === 0) {
      const empty = document.createElement('div');
      empty.className = 'inv-empty';
      empty.textContent = 'Sem itens que correspondam aos filtros.';
      grid.appendChild(empty);
    } else {
      for (const view of items) {
        const cell = buildItemCell(services, view, selectedIndex === view.index, () => {
          selectedIndex = selectedIndex === view.index ? null : view.index;
          rerender();
        });
        grid.appendChild(cell);
      }
    }
    gridWrap.appendChild(grid);
    body.appendChild(gridWrap);

    const selected = selectedIndex !== null
      ? items.find((x) => x.index === selectedIndex) ?? null
      : null;
    body.appendChild(buildDetailPanel(services, selected));

    root.appendChild(body);
    root.appendChild(buildBottomBar(services, rerender));
  };

  rerender();
  return root;
}

// ============================================================
// Toolbar (filtros + sort)
// ============================================================
function buildToolbar(
  services: GameServices,
  filter: InvFilter,
  sort: InvSort,
  onFilter: (f: InvFilter) => void,
  onSort: (s: InvSort) => void,
): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'inv-toolbar';

  const used = services.getInventory().usedSlots();
  const cap = services.getInventory().capacity;
  const count = document.createElement('div');
  count.className = 'inv-count';
  count.innerHTML = '<b>' + used + '</b> / ' + cap + ' slots';
  bar.appendChild(count);

  const filt = document.createElement('div');
  filt.className = 'inv-filters';
  const filters: { id: InvFilter; label: string }[] = [
    { id: 'all', label: 'Tudo' },
    { id: 'equip', label: 'Equip' },
    { id: 'material', label: 'Mats' },
    { id: 'consumable', label: 'Cons' },
    { id: 'essence', label: 'Ess' },
  ];
  for (const f of filters) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'inv-filter' + (filter === f.id ? ' inv-filter--active' : '');
    b.textContent = f.label;
    b.addEventListener('click', () => onFilter(f.id));
    filt.appendChild(b);
  }
  bar.appendChild(filt);

  const sortWrap = document.createElement('div');
  sortWrap.className = 'inv-sorts';
  const label = document.createElement('span');
  label.className = 'inv-sorts__label';
  label.textContent = 'Ordenar:';
  sortWrap.appendChild(label);
  const sorts: { id: InvSort; label: string }[] = [
    { id: 'type', label: 'Tipo' },
    { id: 'rarity', label: 'Raridade' },
    { id: 'name', label: 'Nome' },
  ];
  for (const s of sorts) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'inv-sort' + (sort === s.id ? ' inv-sort--active' : '');
    b.textContent = s.label;
    b.addEventListener('click', () => onSort(s.id));
    sortWrap.appendChild(b);
  }
  bar.appendChild(sortWrap);

  return bar;
}

// ============================================================
// Grid de items
// ============================================================
function collectItems(services: GameServices, filter: InvFilter, sort: InvSort): SlotView[] {
  const inv = services.getInventory();
  const slots = inv.list();
  const out: SlotView[] = [];
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    const def = services.registry.getItem(s.itemId);
    if (!def) continue;
    if (!passesFilter(def, filter)) continue;
    out.push({
      index: i,
      itemId: s.itemId as string,
      quantity: s.quantity,
      enhancementLevel: s.enhancementLevel,
      randomAttributes: s.randomAttributes,
      essences: s.essences ? s.essences.map((e) => e ? (e.itemId as string) : null) : null,
      durability: isTool(def) ? s.durability : null,
      def,
    });
  }
  out.sort((a, b) => compareItems(a.def, b.def, sort));
  return out;
}

function buildItemCell(
  services: GameServices,
  view: SlotView,
  selected: boolean,
  onClick: () => void,
): HTMLElement {
  let compareAp = 0;
  let compareDp = 0;
  if (view.def.equipSlot) {
    const eq = services.getEquipment().get(view.def.equipSlot);
    if (eq) {
      const eqDef = services.registry.getItem(eq.itemId);
      if (eqDef) { compareAp = eqDef.attackPower; compareDp = eqDef.defensePower; }
    }
  }

  const cell = renderItemCell({
    itemId: view.itemId,
    itemName: view.def.name,
    itemCategory: view.def.category,
    itemRarity: view.def.rarity,
    quantity: view.quantity,
    enhancementLevel: view.enhancementLevel,
    durability: view.durability,
    maxDurability: view.durability !== null ? view.def.maxDurability : undefined,
    randomAttributes: view.randomAttributes as never,
    essences: view.essences,
    ap: view.def.attackPower,
    dp: view.def.defensePower,
    compareAp, compareDp,
    onClick,
  });
  if (selected) cell.classList.add('item-cell--selected');
  return cell;
}

// ============================================================
// Detail panel
// ============================================================
function buildDetailPanel(services: GameServices, view: SlotView | null): HTMLElement {
  const aside = document.createElement('aside');
  aside.className = 'inv-detail';

  if (!view) {
    const hint = document.createElement('div');
    hint.className = 'inv-detail__empty';
    hint.textContent = 'Clica num item para ver os detalhes.';
    aside.appendChild(hint);
    return aside;
  }

  const def = view.def;
  const title = document.createElement('div');
  title.className = 'inv-detail__title';
  title.textContent = def.name + (view.enhancementLevel > 0 ? ' +' + view.enhancementLevel : '');
  aside.appendChild(title);

  const sub = document.createElement('div');
  sub.className = 'inv-detail__sub';
  sub.textContent = 'Raridade: ' + def.rarity + ' Â· Qtd: ' + view.quantity;
  aside.appendChild(sub);

  const stats = document.createElement('div');
  stats.className = 'inv-detail__stats';
  if (def.attackPower > 0) stats.appendChild(detailLine('AP', '+' + def.attackPower, '#e8a848'));
  if (def.defensePower > 0) stats.appendChild(detailLine('DP', '+' + def.defensePower, '#6a9ad8'));
  const ab = def.attributeBonuses;
  if (ab) {
    if (ab.strength) stats.appendChild(detailLine('Forca', '+' + ab.strength, '#e8a848'));
    if (ab.agility) stats.appendChild(detailLine('Agilidade', '+' + ab.agility, '#6ab87a'));
    if (ab.intelligence) stats.appendChild(detailLine('Inteligencia', '+' + ab.intelligence, '#6a9ad8'));
    if (ab.vitality) stats.appendChild(detailLine('Vitalidade', '+' + ab.vitality, '#d84848'));
  }
  if (stats.children.length > 0) aside.appendChild(stats);

  const desc = document.createElement('p');
  desc.className = 'inv-detail__desc';
  desc.textContent = def.description;
  aside.appendChild(desc);

  const actions = document.createElement('div');
  actions.className = 'inv-detail__actions';

  if (def.appliesBuffId) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'inv-action inv-action--primary';
    b.textContent = 'Usar';
    b.addEventListener('click', () => services.consumeItem(view.index));
    actions.appendChild(b);
  }
  if (isEquippable(def)) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'inv-action inv-action--primary';
    b.textContent = 'Equipar';
    b.addEventListener('click', () => services.equipFromInventory(view.index));
    actions.appendChild(b);
  }

  const sell = document.createElement('button');
  sell.type = 'button';
  sell.className = 'inv-action inv-action--sell';
  sell.textContent = 'Vender 1';
  sell.addEventListener('click', () => services.sellToNpc(view.index, 1));
  actions.appendChild(sell);

  aside.appendChild(actions);
  return aside;
}

function detailLine(label: string, value: string, color: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'inv-detail__line';
  row.style.setProperty('--line-color', color);
  const l = document.createElement('span');
  l.className = 'inv-detail__line-label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'inv-detail__line-value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

// ============================================================
// Bottom bar
// ============================================================
function buildBottomBar(services: GameServices, rerender: () => void): HTMLElement {
  const bar = document.createElement('div');
  bar.className = 'inv-bottom';

  bar.appendChild(buildBottomBtn('Organizar', 'briefcase', () => {
    // organizado
    rerender();
  }));

  bar.appendChild(buildBottomBtn('Expandir', 'plus', () => {
    // expansao em breve
  }));

  bar.appendChild(buildBottomBtn('Vender lixo', 'coin', () => {
    const inv = services.getInventory();
    const slots = inv.list();
    let sold = 0;
    for (let i = slots.length - 1; i >= 0; i--) {
      const s = slots[i];
      if (!s) continue;
      const def = services.registry.getItem(s.itemId);
      if (!def) continue;
      if (def.rarity !== 'common') continue;
      if (s.enhancementLevel > 0) continue;
      if (s.randomAttributes && s.randomAttributes.length > 0) continue;
      if (s.essences && s.essences.some((e) => e !== null)) continue;
      if (isEquippable(def)) continue;
      if (services.sellToNpc(i, s.quantity)) sold++;
    }
    // vendidos: ' + sold
    rerender();
  }, true));

  bar.appendChild(buildBottomBtn('Forjar', 'anvil', () => {
    // forja em breve
  }));

  return bar;
}

function buildBottomBtn(label: string, icon: 'briefcase' | 'plus' | 'coin' | 'anvil', onClick: () => void, accent = false): HTMLElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'inv-bottom__btn' + (accent ? ' inv-bottom__btn--accent' : '');
  b.appendChild(createIcon(icon, 14));
  const t = document.createElement('span');
  t.textContent = label;
  b.appendChild(t);
  b.addEventListener('click', onClick);
  return b;
}

// ============================================================
// Helpers
// ============================================================
function passesFilter(def: ItemDefinition, filter: InvFilter): boolean {
  if (filter === 'all') return true;
  if (filter === 'equip') return def.category === 'weapon' || def.category === 'armor' || def.category === 'accessory' || def.category === 'tool';
  if (filter === 'material') return def.category === 'material' || def.category === 'seed' || def.category === 'crop' || def.category === 'fish' || def.category === 'meat';
  if (filter === 'consumable') return def.category === 'consumable';
  if (filter === 'essence') return def.category === 'essence';
  return true;
}

function compareItems(a: ItemDefinition, b: ItemDefinition, mode: InvSort): number {
  if (mode === 'name') return a.name.localeCompare(b.name);
  if (mode === 'rarity') {
    const ra = RARITY_ORDER[a.rarity] ?? 0;
    const rb = RARITY_ORDER[b.rarity] ?? 0;
    if (rb !== ra) return rb - ra;
    return a.name.localeCompare(b.name);
  }
  if (a.category !== b.category) return a.category.localeCompare(b.category);
  const ra = RARITY_ORDER[a.rarity] ?? 0;
  const rb = RARITY_ORDER[b.rarity] ?? 0;
  if (rb !== ra) return rb - ra;
  return a.name.localeCompare(b.name);
}

void asItemId;
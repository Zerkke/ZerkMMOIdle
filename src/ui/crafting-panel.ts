import type { GameServices } from '../services/game-services';
import { asRecipeId } from '../domain/ids';
import type { RecipeKind, Recipe } from '../domain/lifeskill/types';
import { renderPanelHeader } from './panel-header';
import { createIcon, type IconName } from './icons';
import { getItemVisual } from './item-icons';

const batchState = new Map<string, number>();
const filterState = new Map<string, string>();

interface PanelCfg {
  readonly icon: IconName;
  readonly title: string;
  readonly subtitle: string;
  readonly kindLabels: Partial<Record<RecipeKind, string>>;
  readonly kindColors: Partial<Record<RecipeKind, string>>;
}

export function renderCraftingPanel(services: GameServices): HTMLElement {
  return buildPanel(services, ['processing', 'crafting'], {
    icon: 'anvil',
    title: 'Crafting',
    subtitle: 'Transforma materiais em equipamento',
    kindLabels: { processing: 'Processamento', crafting: 'Crafting' },
    kindColors: { processing: '#a8b8c8', crafting: '#e8a848' },
  });
}

export function renderCookingPanel(services: GameServices): HTMLElement {
  return buildPanel(services, ['cooking', 'alchemy'], {
    icon: 'bowl',
    title: 'Cozinha e Alquimia',
    subtitle: 'Prepara comida e pocoes',
    kindLabels: { cooking: 'Cozinha', alchemy: 'Alquimia' },
    kindColors: { cooking: '#d8a868', alchemy: '#a86ec8' },
  });
}

function buildPanel(services: GameServices, kinds: RecipeKind[], cfg: PanelCfg): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content craft-sheet';
  root.appendChild(renderPanelHeader({ icon: cfg.icon, title: cfg.title, subtitle: cfg.subtitle }));

  const activity = services.getActivity();
  if (activity) {
    root.appendChild(buildActiveActivity(services, activity));
    return root;
  }

  const filterKey = kinds.join('|');
  const activeFilter = filterState.get(filterKey) ?? 'all';

  // Filtros
  const filterRow = document.createElement('div');
  filterRow.className = 'craft-filters';
  const filterDefs: { id: string; label: string }[] = [
    { id: 'all', label: 'Todas' },
    ...kinds.map((k) => ({ id: k, label: cfg.kindLabels[k] ?? k })),
  ];
  for (const f of filterDefs) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'craft-filter' + (activeFilter === f.id ? ' craft-filter--active' : '');
    b.textContent = f.label;
    b.addEventListener('click', () => {
      filterState.set(filterKey, f.id);
      rerender(services, root, kinds, cfg);
    });
    filterRow.appendChild(b);
  }
  root.appendChild(filterRow);

  // Receitas (agrupadas por kind)
  const visibleKinds = activeFilter === 'all' ? kinds : [activeFilter as RecipeKind];

  for (const kind of visibleKinds) {
    const recipes = Array.from(services.registry.recipes.values()).filter((r) => r.kind === kind);
    if (recipes.length === 0) continue;

    const head = document.createElement('div');
    head.className = 'craft-head';
    head.textContent = cfg.kindLabels[kind] ?? kind;
    root.appendChild(head);

    const grid = document.createElement('div');
    grid.className = 'craft-grid';
    for (const recipe of recipes) {
      grid.appendChild(buildRecipeCard(services, recipe, root, kinds, cfg));
    }
    root.appendChild(grid);
  }

  return root;
}

// ============================================================
// Card de receita
// ============================================================
function buildRecipeCard(
  services: GameServices,
  recipe: Recipe,
  root: HTMLElement,
  kinds: RecipeKind[],
  cfg: PanelCfg,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'craft-card';

  const kindColor = cfg.kindColors[recipe.kind] ?? '#e8c977';
  card.style.setProperty('--kind-color', kindColor);

  // Header (ícone do output + nome + subtítulo)
  const head = document.createElement('div');
  head.className = 'craft-card__head';

  const firstOutput = recipe.outputs[0];
  const outDef = firstOutput ? services.registry.getItem(firstOutput.itemId) : null;
  const visual = firstOutput ? getItemVisual(firstOutput.itemId as string, outDef?.category ?? 'material') : { icon: 'chest' as IconName, tint: '#e8c977' };

  const iconWrap = document.createElement('div');
  iconWrap.className = 'craft-card__icon';
  iconWrap.style.color = visual.tint;
  iconWrap.appendChild(createIcon(visual.icon, 32));
  head.appendChild(iconWrap);

  const titleBox = document.createElement('div');
  titleBox.className = 'craft-card__title-box';
  const name = document.createElement('div');
  name.className = 'craft-card__name';
  name.textContent = recipe.name;
  titleBox.appendChild(name);
  const sub = document.createElement('div');
  sub.className = 'craft-card__sub';
  sub.textContent = recipe.description;
  titleBox.appendChild(sub);
  head.appendChild(titleBox);
  card.appendChild(head);

  // Meta (nível / tempo / prata)
  const meta = document.createElement('div');
  meta.className = 'craft-card__meta';
  meta.appendChild(metaChip('level-up', 'Nv ' + recipe.requiredLevel));
  meta.appendChild(metaChip('hourglass', (recipe.baseTimeMs / 1000).toFixed(1) + 's'));
  meta.appendChild(metaChip('coin', recipe.silverCost + ' prata'));
  card.appendChild(meta);

  // Inputs
  const batches = batchState.get(recipe.id as string) ?? 1;
  const inputs = document.createElement('div');
  inputs.className = 'craft-card__inputs';
  for (const inp of recipe.inputs) {
    const def = services.registry.getItem(inp.itemId);
    const have = services.getInventory().count(inp.itemId);
    const need = inp.quantity * batches;
    const ok = have >= need;
    const chip = document.createElement('div');
    chip.className = 'craft-chip' + (ok ? '' : ' craft-chip--missing');
    const iv = getItemVisual(inp.itemId as string, def?.category ?? 'material');
    const cIcon = document.createElement('span');
    cIcon.className = 'craft-chip__icon';
    cIcon.style.color = iv.tint;
    cIcon.appendChild(createIcon(iv.icon, 12));
    chip.appendChild(cIcon);
    const cName = document.createElement('span');
    cName.className = 'craft-chip__name';
    cName.textContent = def?.name ?? (inp.itemId as string);
    chip.appendChild(cName);
    const cQty = document.createElement('span');
    cQty.className = 'craft-chip__qty';
    cQty.textContent = have + '/' + need;
    chip.appendChild(cQty);
    inputs.appendChild(chip);
  }
  card.appendChild(inputs);

  // Outputs
  const outputs = document.createElement('div');
  outputs.className = 'craft-card__outputs';
  for (const out of recipe.outputs) {
    const def = services.registry.getItem(out.itemId);
    const chip = document.createElement('div');
    chip.className = 'craft-chip craft-chip--output';
    const ov = getItemVisual(out.itemId as string, def?.category ?? 'material');
    const cIcon = document.createElement('span');
    cIcon.className = 'craft-chip__icon';
    cIcon.style.color = ov.tint;
    cIcon.appendChild(createIcon(ov.icon, 12));
    chip.appendChild(cIcon);
    const cName = document.createElement('span');
    cName.className = 'craft-chip__name';
    cName.textContent = def?.name ?? (out.itemId as string);
    chip.appendChild(cName);
    const cQty = document.createElement('span');
    cQty.className = 'craft-chip__qty';
    cQty.textContent = 'x' + (out.quantity * batches);
    chip.appendChild(cQty);
    outputs.appendChild(chip);
  }
  card.appendChild(outputs);

  // Batches selector
  const batchRow = document.createElement('div');
  batchRow.className = 'craft-batches';

  const minus = document.createElement('button');
  minus.type = 'button';
  minus.className = 'craft-batch-btn';
  minus.textContent = '-';
  minus.addEventListener('click', () => {
    batchState.set(recipe.id as string, Math.max(1, batches - 1));
    rerender(services, root, kinds, cfg);
  });
  batchRow.appendChild(minus);

  const num = document.createElement('span');
  num.className = 'craft-batch-num';
  num.textContent = String(batches);
  batchRow.appendChild(num);

  const plus = document.createElement('button');
  plus.type = 'button';
  plus.className = 'craft-batch-btn';
  plus.textContent = '+';
  plus.addEventListener('click', () => {
    batchState.set(recipe.id as string, Math.min(recipe.maxBatches, batches + 1));
    rerender(services, root, kinds, cfg);
  });
  batchRow.appendChild(plus);

  const quick = document.createElement('div');
  quick.className = 'craft-quick';
  const quickVals = [1, 5, 10, recipe.maxBatches];
  const quickLbls = ['x1', 'x5', 'x10', 'Max'];
  for (let i = 0; i < quickVals.length; i++) {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'craft-quick-btn';
    b.textContent = quickLbls[i] ?? ('x' + quickVals[i]);
    b.addEventListener('click', () => {
      batchState.set(recipe.id as string, Math.max(1, Math.min(recipe.maxBatches, quickVals[i] ?? 1)));
      rerender(services, root, kinds, cfg);
    });
    quick.appendChild(b);
  }
  batchRow.appendChild(quick);
  card.appendChild(batchRow);

  // Botão produzir
  const check = services.validateRecipeForPlayer(asRecipeId(recipe.id as string), batches);
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.className = 'craft-btn' + (check && check.canStart ? ' craft-btn--ok' : '');
  btn.disabled = !check || !check.canStart;
  btn.appendChild(createIcon('play', 14));
  const lbl = document.createElement('span');
  lbl.textContent = 'PRODUZIR x' + batches;
  btn.appendChild(lbl);
  btn.addEventListener('click', () => {
    services.startProduction(asRecipeId(recipe.id as string), batches);
    batchState.delete(recipe.id as string);
  });
  card.appendChild(btn);

  if (check && !check.canStart && check.reason) {
    const warn = document.createElement('div');
    warn.className = 'craft-warn';
    warn.textContent = check.reason;
    card.appendChild(warn);
  }

  return card;
}

// ============================================================
// Activity em curso
// ============================================================
function buildActiveActivity(
  services: GameServices,
  activity: NonNullable<ReturnType<GameServices['getActivity']>>,
): HTMLElement {
  const box = document.createElement('div');
  box.className = 'life-active';

  const iconWrap = document.createElement('div');
  iconWrap.className = 'life-active__icon';
  iconWrap.appendChild(createIcon(activity.kind === 'gathering' ? 'pickaxe' : 'anvil', 56));
  box.appendChild(iconWrap);

  const title = document.createElement('div');
  title.className = 'life-active__title';
  title.textContent = activity.kind === 'gathering' ? 'A RECOLHER' : 'A PRODUZIR';
  box.appendChild(title);

  const name = document.createElement('div');
  name.className = 'life-active__name';
  name.textContent = activity.targetName;
  box.appendChild(name);

  const progress = Math.min(1, activity.completedActions / Math.max(1, activity.batches));
  const track = document.createElement('div');
  track.className = 'life-active__track';
  const fill = document.createElement('div');
  fill.className = 'life-active__fill';
  fill.style.width = (progress * 100).toFixed(1) + '%';
  track.appendChild(fill);
  box.appendChild(track);

  const pct = document.createElement('div');
  pct.className = 'life-active__pct';
  pct.textContent = (progress * 100).toFixed(0) + '%';
  box.appendChild(pct);

  const info = document.createElement('div');
  info.className = 'life-active__info';
  info.appendChild(infoLine('Acoes', activity.completedActions + ' / ' + activity.batches));
  info.appendChild(infoLine('Por acao', (activity.cycleMs / 1000).toFixed(1) + 's'));
  box.appendChild(info);

  const cancel = document.createElement('button');
  cancel.type = 'button';
  cancel.className = 'life-cancel';
  cancel.appendChild(createIcon('close', 14));
  const lbl = document.createElement('span');
  lbl.textContent = 'CANCELAR';
  cancel.appendChild(lbl);
  cancel.addEventListener('click', () => services.cancelActivity());
  box.appendChild(cancel);

  return box;
}

function metaChip(icon: IconName, text: string): HTMLElement {
  const chip = document.createElement('span');
  chip.className = 'craft-meta-chip';
  chip.appendChild(createIcon(icon, 11));
  const t = document.createElement('span');
  t.textContent = text;
  chip.appendChild(t);
  return chip;
}

function infoLine(label: string, value: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'life-info-line';
  const l = document.createElement('span');
  l.className = 'life-info-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'life-info-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

function rerender(services: GameServices, container: HTMLElement, kinds: RecipeKind[], cfg: PanelCfg): void {
  const fresh = buildPanel(services, kinds, cfg);
  container.replaceWith(fresh);
}
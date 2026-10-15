import type { GameServices } from '../services/game-services';
import { asRecipeId } from '../domain/ids';
import type { RecipeKind, Recipe } from '../domain/lifeskill/types';
import { renderPanelHeader, renderSectionTitle } from './panel-header';
import { createButton, createIconButton } from './button';
import { createIcon } from './icons';

let selectedBatches = 1;

export function renderCraftingPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'anvil',
    title: 'Crafting',
    subtitle: 'Transforma materiais em equipamento',
  }));

  const activity = services.getActivity();
  if (activity) {
    const busy = document.createElement('p');
    busy.className = 'muted';
    busy.textContent = 'Ocupado: ' + activity.targetName + '. Termina ou cancela a atividade atual.';
    root.appendChild(busy);
    return root;
  }

  const kinds: RecipeKind[] = ['processing', 'crafting'];
  for (const kind of kinds) {
    root.appendChild(renderSectionTitle(kind === 'processing' ? 'Processamento' : 'Crafting'));
    const recipes = Array.from(services.registry.recipes.values()).filter((r) => r.kind === kind);
    if (recipes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Nenhuma receita disponivel.';
      root.appendChild(empty);
      continue;
    }
    for (const recipe of recipes) root.appendChild(renderRecipeCard(services, recipe, root));
  }

  return root;
}

export function renderCookingPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'bowl',
    title: 'Cozinha e Alquimia',
    subtitle: 'Prepara comida e pocoes',
  }));

  const activity = services.getActivity();
  if (activity) {
    const busy = document.createElement('p');
    busy.className = 'muted';
    busy.textContent = 'Ocupado: ' + activity.targetName + '.';
    root.appendChild(busy);
    return root;
  }

  const kinds: RecipeKind[] = ['cooking', 'alchemy'];
  for (const kind of kinds) {
    root.appendChild(renderSectionTitle(kind === 'cooking' ? 'Cozinha' : 'Alquimia'));
    const recipes = Array.from(services.registry.recipes.values()).filter((r) => r.kind === kind);
    if (recipes.length === 0) {
      const empty = document.createElement('p');
      empty.className = 'muted';
      empty.textContent = 'Nenhuma receita disponivel.';
      root.appendChild(empty);
      continue;
    }
    for (const recipe of recipes) root.appendChild(renderRecipeCard(services, recipe, root));
  }

  return root;
}

function renderRecipeCard(
  services: GameServices,
  recipe: Recipe,
  root: HTMLElement,
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'recipe-card';

  const header = document.createElement('div');
  header.className = 'recipe-card__header';

  const iconBox = document.createElement('div');
  iconBox.className = 'recipe-card__icon';
  const kindIcon = recipe.kind === 'cooking' ? 'bowl'
    : recipe.kind === 'alchemy' ? 'flask'
    : recipe.kind === 'processing' ? 'anvil' : 'hammer';
  iconBox.appendChild(createIcon(kindIcon, 22));
  header.appendChild(iconBox);

  const titleBox = document.createElement('div');
  const n = document.createElement('h4');
  n.textContent = recipe.name;
  titleBox.appendChild(n);
  const d = document.createElement('p');
  d.className = 'muted';
  d.textContent = recipe.description;
  titleBox.appendChild(d);
  header.appendChild(titleBox);

  card.appendChild(header);

  const meta = document.createElement('p');
  meta.className = 'muted';
  meta.textContent = 'Nivel ' + recipe.requiredLevel + '  ·  ' + (recipe.baseTimeMs / 1000).toFixed(1) + 's por lote  ·  ' + recipe.silverCost + ' prata';
  card.appendChild(meta);

  const inputList = document.createElement('div');
  inputList.className = 'recipe-io';
  for (const inp of recipe.inputs) {
    const def = services.registry.getItem(inp.itemId);
    const have = services.getInventory().count(inp.itemId);
    const need = inp.quantity * selectedBatches;
    const ok = have >= need;
    const li = document.createElement('span');
    li.className = 'recipe-io__item' + (ok ? '' : ' recipe-io__item--missing');
    li.textContent = (def?.name ?? inp.itemId) + ': ' + have + '/' + need;
    inputList.appendChild(li);
  }
  card.appendChild(inputList);

  const outputList = document.createElement('div');
  outputList.className = 'recipe-io recipe-io--output';
  for (const out of recipe.outputs) {
    const def = services.registry.getItem(out.itemId);
    const span = document.createElement('span');
    span.className = 'recipe-io__item';
    span.textContent = (def?.name ?? out.itemId) + ' x' + out.quantity * selectedBatches;
    outputList.appendChild(span);
  }
  card.appendChild(outputList);

  const batchRow = document.createElement('div');
  batchRow.className = 'recipe-batches';

  const batchLabel = document.createElement('span');
  batchLabel.textContent = 'Lotes:';
  batchRow.appendChild(batchLabel);

  batchRow.appendChild(createIconButton('minus', () => {
    selectedBatches = Math.max(1, selectedBatches - 1);
    rerender(services, root);
  }, 'Menos'));

  const num = document.createElement('span');
  num.className = 'recipe-batches__num';
  num.textContent = String(selectedBatches);
  batchRow.appendChild(num);

  batchRow.appendChild(createIconButton('plus', () => {
    selectedBatches = Math.min(recipe.maxBatches, selectedBatches + 1);
    rerender(services, root);
  }, 'Mais'));

  card.appendChild(batchRow);

  const check = services.validateRecipeForPlayer(asRecipeId(recipe.id as string), selectedBatches);
  const startBtn = createButton({
    label: 'Produzir ' + selectedBatches + 'x',
    icon: 'play',
    variant: 'primary',
    disabled: !check || !check.canStart,
    onClick: () => {
      services.startProduction(asRecipeId(recipe.id as string), selectedBatches);
      selectedBatches = 1;
    },
  });
  card.appendChild(startBtn);

  if (check && !check.canStart && check.reason) {
    const warn = document.createElement('p');
    warn.className = 'node-warning';
    warn.textContent = check.reason;
    card.appendChild(warn);
  }

  return card;
}

function rerender(services: GameServices, container: HTMLElement): void {
  const isCooking = container.querySelector('.panel-header__title')?.textContent === 'Cozinha e Alquimia';
  const fresh = isCooking ? renderCookingPanel(services) : renderCraftingPanel(services);
  container.replaceWith(fresh);
}
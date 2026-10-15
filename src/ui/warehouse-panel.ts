import type { GameServices } from '../services/game-services';
import { isTool } from '../domain/content';
import { renderPanelHeader, renderSectionTitle } from './panel-header';
import { renderItemCell, renderEmptyCell } from './item-cell';

export function renderWarehousePanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'chest',
    title: 'Armazem',
    subtitle: 'Espaco partilhado de items',
  }));

  root.appendChild(renderSectionTitle('Inventario'));
  root.appendChild(renderGrid(services, true));

  root.appendChild(renderSectionTitle('Armazem'));
  root.appendChild(renderGrid(services, false));

  return root;
}

function renderGrid(services: GameServices, isInventory: boolean): HTMLElement {
  const source = isInventory ? services.getInventory() : services.getWarehouse();
  const slots = source.list();
  const grid = document.createElement('div');
  grid.className = 'item-grid';

  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) { grid.appendChild(renderEmptyCell()); continue; }
    const def = services.registry.getItem(s.itemId);
    if (!def) { grid.appendChild(renderEmptyCell()); continue; }

    grid.appendChild(renderItemCell({
      itemId: s.itemId as string,
      itemName: def.name,
      itemCategory: def.category,
      itemRarity: def.rarity,
      quantity: s.quantity,
      enhancementLevel: s.enhancementLevel,
      durability: isTool(def) ? s.durability : null,
      maxDurability: isTool(def) ? def.maxDurability : undefined,
      onClick: () => {
        if (isInventory) services.transferToWarehouse(i, s.quantity);
        else services.transferFromWarehouse(i, s.quantity);
      },
      title: (isInventory ? 'Guardar ' : 'Retirar ') + def.name + ' x' + s.quantity,
    }));
  }

  const info = document.createElement('p');
  info.className = 'muted';
  info.textContent = source.usedSlots() + ' / ' + source.capacity + ' slots usados';
  const wrap = document.createElement('div');
  wrap.appendChild(grid);
  wrap.appendChild(info);
  return wrap;
}
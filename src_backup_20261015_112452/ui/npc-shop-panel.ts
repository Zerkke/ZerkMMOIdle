import type { GameServices } from '../services/game-services';
import { renderPanelHeader, renderSectionTitle } from './panel-header';
import { renderItemCell } from './item-cell';
import { createButton } from './button';
import { createIcon } from './icons';
import { npcBuybackPrice } from '../data/npc-shop.data';

export function renderNpcShopPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'cart',
    title: 'Mercador',
    subtitle: 'Compra e vende items por prata',
  }));

  const char = services.getCharacter();

  root.appendChild(renderSectionTitle('Comprar'));
  const buyGrid = document.createElement('div');
  buyGrid.className = 'shop-grid';

  for (const entry of services.getShopCatalog()) {
    const def = services.registry.getItem(entry.itemId);
    if (!def) continue;

    const cellWrap = document.createElement('div');
    cellWrap.className = 'shop-item';

    const cell = renderItemCell({
      itemId: entry.itemId as string,
      itemName: def.name,
      itemCategory: def.category,
      itemRarity: def.rarity,
      quantity: 1,
      onClick: () => { services.buyFromNpc(entry.itemId, 1); },
      title: def.name + ' — ' + entry.buyPrice + ' prata',
    });
    cellWrap.appendChild(cell);

    const price = document.createElement('div');
    price.className = 'shop-item__price';
    const coin = createIcon('coin', 11);
    price.appendChild(coin);
    price.appendChild(document.createTextNode(String(entry.buyPrice)));
    cellWrap.appendChild(price);

    buyGrid.appendChild(cellWrap);
  }
  root.appendChild(buyGrid);

  root.appendChild(renderSectionTitle('Vender'));

  const inv = services.getInventory();
  const slots = inv.list();
  const sellGrid = document.createElement('div');
  sellGrid.className = 'shop-grid';
  let sellableCount = 0;

  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    const def = services.registry.getItem(s.itemId);
    if (!def || def.sellPrice <= 0) continue;
    sellableCount++;

    const cellWrap = document.createElement('div');
    cellWrap.className = 'shop-item';

    const cell = renderItemCell({
      itemId: s.itemId as string,
      itemName: def.name,
      itemCategory: def.category,
      itemRarity: def.rarity,
      quantity: s.quantity,
      enhancementLevel: s.enhancementLevel,
      onClick: () => { services.sellToNpc(i, 1); },
      title: 'Clica para vender 1',
    });
    cellWrap.appendChild(cell);

    const price = document.createElement('div');
    price.className = 'shop-item__price shop-item__price--sell';
    const coin = createIcon('coin', 11);
    price.appendChild(coin);
    price.appendChild(document.createTextNode(String(npcBuybackPrice(def.sellPrice))));
    cellWrap.appendChild(price);

    sellGrid.appendChild(cellWrap);
  }

  if (sellableCount === 0) {
    const empty = document.createElement('p');
    empty.className = 'panel-state panel-state--empty';
    empty.textContent = 'Nada para vender.';
    root.appendChild(empty);
  } else {
    root.appendChild(sellGrid);
  }

  const hint = document.createElement('p');
  hint.className = 'muted';
  hint.textContent = 'Tens ' + char.silver + ' prata.';
  root.appendChild(hint);

  return root;
}

void createButton;
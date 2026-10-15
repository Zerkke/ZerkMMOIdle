import type { GameServices } from '../services/game-services';
import { isEquippable, isTool } from '../domain/content';
import { asItemId } from '../domain/ids';
import { renderItemCell, renderEmptyCell } from './item-cell';

export function renderInventoryPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  const header = document.createElement('h2');
  header.textContent = 'Inventario';
  root.appendChild(header);

  const inv = services.getInventory();
  const slots = inv.list();

  const used = inv.usedSlots();
  const cap = inv.capacity;
  const stats = document.createElement('p');
  stats.className = 'muted';
  stats.textContent = used + ' / ' + cap + ' slots ocupados';
  root.appendChild(stats);

  const grid = document.createElement('div');
  grid.className = 'item-grid';

  for (let i = 0; i < slots.length; i++) {
    const slot = slots[i];
    if (!slot) {
      grid.appendChild(renderEmptyCell());
      continue;
    }
    const def = services.registry.getItem(slot.itemId);
    if (!def) {
      grid.appendChild(renderEmptyCell());
      continue;
    }

    let compareAp = 0;
    let compareDp = 0;
    if (def.equipSlot) {
      const equipped = services.getEquipment().get(def.equipSlot);
      if (equipped) {
        const eqDef = services.registry.getItem(equipped.itemId);
        if (eqDef) {
          compareAp = eqDef.attackPower;
          compareDp = eqDef.defensePower;
        }
      }
    }

    const cell = renderItemCell({
      itemId: slot.itemId as string,
      itemName: def.name,
      itemCategory: def.category,
      itemRarity: def.rarity,
      quantity: slot.quantity,
      enhancementLevel: slot.enhancementLevel,
      durability: isTool(def) ? slot.durability : null,
      maxDurability: isTool(def) ? def.maxDurability : undefined,
      randomAttributes: slot.randomAttributes,
      essences: slot.essences ? slot.essences.map((e) => e ? (e.itemId as string) : null) : null,
      ap: def.attackPower,
      dp: def.defensePower,
      compareAp,
      compareDp,
      onClick: () => handleSlotClick(services, i),
    });

    if (isEquippable(def)) cell.classList.add('item-cell--equippable');
    if (def.appliesBuffId) cell.classList.add('item-cell--consumable');

    grid.appendChild(cell);
  }

  root.appendChild(grid);

  const hint = document.createElement('p');
  hint.className = 'muted';
  hint.textContent = 'Clica para equipar (equipaveis), usar (consumiveis) ou dividir (materiais).';
  root.appendChild(hint);

  const actions = document.createElement('div');
  actions.className = 'inventory-actions';
  actions.appendChild(debugButton('+5 Minerio', () => services.addItem(asItemId('item.ore.iron'), 5)));
  actions.appendChild(debugButton('+100 Prata', () => services.grantSilverDebug(100)));
  root.appendChild(actions);

  return root;
}

function debugButton(label: string, fn: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 'action-button';
  b.textContent = label;
  b.addEventListener('click', fn);
  return b;
}

function handleSlotClick(services: GameServices, index: number): void {
  const slot = services.getInventory().list()[index];
  if (!slot) return;
  const def = services.registry.getItem(slot.itemId);
  if (!def) return;
  if (def.appliesBuffId) { services.consumeItem(index); return; }
  if (isEquippable(def)) services.equipFromInventory(index);
  else services.splitSlot(index, 1);
}
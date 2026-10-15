import { createIcon } from './icons';
import { getItemVisual, getRarityVisual } from './item-icons';
import { formatRandomAttribute } from '../domain/random-attributes/engine';
import { RANDOM_ATTRIBUTES } from '../data/random-attributes.data';
import type { RandomAttributeRoll } from '../domain/random-attributes/types';

export interface ItemCellOptions {
  readonly itemId: string;
  readonly itemName: string;
  readonly itemCategory: string;
  readonly itemRarity: string;
  readonly quantity: number;
  readonly enhancementLevel?: number | undefined;
  readonly durability?: number | null | undefined;
  readonly maxDurability?: number | undefined;
  readonly randomAttributes?: readonly RandomAttributeRoll[] | null | undefined;
  readonly essences?: readonly (string | null)[] | null | undefined;
  readonly ap?: number | undefined;
  readonly dp?: number | undefined;
  readonly compareAp?: number | undefined;
  readonly compareDp?: number | undefined;
  readonly onClick?: (() => void) | undefined;
  readonly disabled?: boolean | undefined;
  readonly title?: string | undefined;
}

export function renderItemCell(opts: ItemCellOptions): HTMLElement {
  const cell = document.createElement('button');
  cell.type = 'button';
  cell.className = 'item-cell';

  const visual = getItemVisual(opts.itemId, opts.itemCategory);
  const rarity = getRarityVisual(opts.itemRarity);

  cell.style.setProperty('--rarity-border', rarity.border);
  cell.style.setProperty('--rarity-glow', rarity.glow);

  if (opts.disabled) {
    cell.setAttribute('disabled', 'true');
    cell.classList.add('item-cell--disabled');
  }

  const iconWrap = document.createElement('div');
  iconWrap.className = 'item-cell__icon';
  iconWrap.style.color = visual.tint;
  iconWrap.appendChild(createIcon(visual.icon, 32));
  cell.appendChild(iconWrap);

  const name = document.createElement('div');
  name.className = 'item-cell__name';
  name.textContent = opts.itemName;
  cell.appendChild(name);

  if (opts.enhancementLevel && opts.enhancementLevel > 0) {
    const enh = document.createElement('div');
    enh.className = 'item-cell__enh';
    enh.textContent = '+' + opts.enhancementLevel;
    cell.appendChild(enh);
    cell.classList.add('item-cell--enhanced');
  }

  const essencesList = opts.essences ?? null;
  const essCount = essencesList ? essencesList.filter((e) => e !== null).length : 0;
  const rolls = opts.randomAttributes ?? null;
  const rollCount = rolls ? rolls.length : 0;
  if (rollCount > 0) {
    const badge = document.createElement('div');
    badge.className = 'item-cell__rolls';
    badge.textContent = 'R' + rollCount;
    cell.appendChild(badge);
    cell.classList.add('item-cell--rolled');
  }

  if (essCount > 0) {
    const eb = document.createElement('div');
    eb.className = 'item-cell__essences';
    eb.textContent = 'E' + essCount;
    cell.appendChild(eb);
    cell.classList.add('item-cell--essenced');
  }

  if (opts.quantity > 1) {
    const qty = document.createElement('div');
    qty.className = 'item-cell__qty';
    qty.textContent = 'x' + opts.quantity;
    cell.appendChild(qty);
  }

  if (opts.durability !== null && opts.durability !== undefined && opts.maxDurability) {
    const dur = document.createElement('div');
    dur.className = 'item-cell__dur';
    dur.textContent = opts.durability + '/' + opts.maxDurability;
    cell.appendChild(dur);
    const pct = opts.maxDurability > 0 ? opts.durability / opts.maxDurability : 0;
    if (pct < 0.25) cell.classList.add('item-cell--low-dur');
  }

  const tipLines: string[] = [opts.itemName];
  if (opts.enhancementLevel && opts.enhancementLevel > 0) tipLines[0] += ' +' + opts.enhancementLevel;
  tipLines.push('Raridade: ' + rarity.label);
  if (opts.quantity > 1) tipLines.push('Quantidade: ' + opts.quantity);
  if (opts.ap !== undefined && opts.ap > 0) tipLines.push('AP: +' + opts.ap);
  if (opts.dp !== undefined && opts.dp > 0) tipLines.push('DP: +' + opts.dp);
  if (opts.compareAp !== undefined || opts.compareDp !== undefined) {
    const dAp = (opts.ap ?? 0) - (opts.compareAp ?? 0);
    const dDp = (opts.dp ?? 0) - (opts.compareDp ?? 0);
    if (dAp !== 0) tipLines.push('Delta AP: ' + (dAp > 0 ? '+' : '') + dAp);
    if (dDp !== 0) tipLines.push('Delta DP: ' + (dDp > 0 ? '+' : '') + dDp);
  }
  if (rolls && rolls.length > 0) {
    tipLines.push('---');
    for (const r of rolls) tipLines.push('- ' + formatRandomAttribute(r, RANDOM_ATTRIBUTES));
  }
  cell.title = opts.title ?? tipLines.join('\n');

  if (opts.onClick) cell.addEventListener('click', opts.onClick);
  return cell;
}

export function renderEmptyCell(): HTMLElement {
  const cell = document.createElement('div');
  cell.className = 'item-cell item-cell--empty';
  return cell;
}
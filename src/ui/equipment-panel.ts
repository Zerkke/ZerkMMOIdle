import type { GameServices } from '../services/game-services';
import { EQUIP_SLOTS, type EquipmentSlotId } from '../domain/equipment';
import type { ItemId } from '../domain/ids';
import type { EssenceDefinition, EssenceInstance } from '../domain/essence/types';
import { formatEssenceBonus } from '../domain/essence/engine';
import { bonusAtLevel } from '../domain/essence/evolution';
import { ESSENCE_EVOLUTION } from '../data/essence-evolution.data';
import { renderPanelHeader } from './panel-header';
import { renderItemCell } from './item-cell';
import { createIcon, type IconName } from './icons';
import { createButton } from './button';

const SLOT_GRID_AREA: Record<string, string> = {
  helmet: 'helmet',
  necklace: 'necklace',
  weapon: 'weapon',
  offhand: 'offhand',
  armor: 'armor',
  gloves: 'gloves',
  boots: 'boots',
  ring1: 'ring1',
  ring2: 'ring2',
  earring1: 'earring1',
  earring2: 'earring2',
  tool: 'tool',
};

export function renderEquipmentPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content eq-panel';

  root.appendChild(renderPanelHeader({
    icon: 'shield',
    title: 'Equipamento',
    subtitle: 'Arsenal e essencias',
  }));

  const body = document.createElement('div');
  body.className = 'eq-body';

  // ---- Coluna esquerda: gear ----
  body.appendChild(buildGearColumn(services));

  // ---- Coluna direita: side ----
  body.appendChild(buildSideColumn(services));

  root.appendChild(body);
  return root;
}

// ============================================================
// Gear column
// ============================================================
function buildGearColumn(services: GameServices): HTMLElement {
  const wrap = document.createElement('div');
  wrap.className = 'eq-gear-wrap';

  const gear = document.createElement('div');
  gear.className = 'eq-gear';

  // Silhueta central
  const silh = document.createElement('div');
  silh.className = 'eq-silhouette';
  const silhInner = document.createElement('div');
  silhInner.className = 'eq-silhouette__inner';
  silhInner.appendChild(createIcon('user', 130));
  silh.appendChild(silhInner);
  gear.appendChild(silh);

  const equip = services.getEquipment();

  for (const slot of EQUIP_SLOTS) {
    const wrapCell = document.createElement('div');
    wrapCell.className = 'eq-cell eq-cell--' + slot.id;
    wrapCell.style.gridArea = SLOT_GRID_AREA[slot.id] ?? slot.id;

    const label = document.createElement('div');
    label.className = 'eq-cell__label';
    label.textContent = slot.label;
    wrapCell.appendChild(label);

    const stack = equip.get(slot.id);
    if (stack) {
      const def = services.registry.getItem(stack.itemId);
      if (def) {
        const cell = renderItemCell({
          itemId: stack.itemId as string,
          itemName: def.name,
          itemCategory: def.category,
          itemRarity: def.rarity,
          quantity: 1,
          enhancementLevel: stack.enhancementLevel,
          randomAttributes: stack.randomAttributes,
          essences: stack.essences ? stack.essences.map((e) => e ? (e.itemId as string) : null) : null,
          ap: def.attackPower,
          dp: def.defensePower,
          onClick: () => services.unequipToInventory(slot.id),
          title: slot.label + ': ' + def.name + ' (clica para desequipar)',
        });
        cell.classList.add('eq-cell__item');
        wrapCell.appendChild(cell);

        if (def.essenceSlots > 0) {
          const essRow = document.createElement('div');
          essRow.className = 'eq-cell__ess';
          for (let i = 0; i < def.essenceSlots; i++) {
            const installed = stack.essences ? stack.essences[i] : null;
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'eq-ess-chip';
            if (installed) {
              chip.classList.add('eq-ess-chip--filled');
              const eDef = services.getEssenceDefinitionForItem(installed.itemId);
              chip.textContent = 'L' + installed.level;
              if (eDef) {
                const cfg = ESSENCE_EVOLUTION[eDef.kind + '.t' + eDef.tier];
                const bonus = cfg ? bonusAtLevel(eDef, cfg, installed.level) : eDef.bonus;
                chip.title = eDef.name + ' L' + installed.level + ': ' + formatEssenceBonus(bonus);
              }
              chip.addEventListener('click', () => {
                services.removeEssenceFromEquipped(slot.id as EquipmentSlotId, i);
              });
            } else {
              chip.classList.add('eq-ess-chip--empty');
              chip.textContent = '+';
              chip.title = 'Vazio';
            }
            essRow.appendChild(chip);
          }
          wrapCell.appendChild(essRow);
        }
      }
    } else {
      const empty = document.createElement('div');
      empty.className = 'eq-cell__empty';
      empty.appendChild(createIcon(slotIconFor(slot.id), 26));
      wrapCell.appendChild(empty);
    }

    gear.appendChild(wrapCell);
  }

  wrap.appendChild(gear);
  return wrap;
}

// ============================================================
// Side column
// ============================================================
function buildSideColumn(services: GameServices): HTMLElement {
  const side = document.createElement('div');
  side.className = 'eq-side';

  const power = services.getEquipmentPower();
  const powerCard = document.createElement('div');
  powerCard.className = 'eq-power';
  powerCard.appendChild(powerStat('AP', '+' + power.attackPower, 'sword', '#e8a848'));
  powerCard.appendChild(powerStat('DP', '+' + power.defensePower, 'shield', '#6a9ad8'));
  side.appendChild(powerCard);

  // Aplicar essências
  const targets = findEquippedWithEmptySlots(services);
  const essencesInInv = findEssencesInInventory(services);
  if (targets.length > 0 && essencesInInv.length > 0) {
    side.appendChild(sideSection('Aplicar essencias'));
    const list = document.createElement('div');
    list.className = 'eq-ess-list';
    for (const inv of essencesInInv) {
      for (const target of targets) {
        const row = document.createElement('div');
        row.className = 'eq-ess-row';
        const info = document.createElement('span');
        info.className = 'eq-ess-row__info';
        info.textContent = inv.def.name + ' L' + inv.instance.level + ' → ' + target.itemName + ' #' + (target.essenceSlotIndex + 1);
        row.appendChild(info);
        const cost = services.getEssenceApplyCost(inv.def);
        row.appendChild(createButton({
          label: cost > 0 ? 'Aplicar (' + cost + 'p)' : 'Aplicar',
          icon: 'sparkles',
          variant: 'primary',
          onClick: () => { services.applyEssenceToEquipped(target.equipmentSlot, target.essenceSlotIndex, inv.instance); },
        }));
        list.appendChild(row);
      }
    }
    side.appendChild(list);
  }

  // Melhorar essências
  const upgradeable = findUpgradeableEssences(services);
  if (upgradeable.length > 0) {
    side.appendChild(sideSection('Melhorar essencias'));
    const list = document.createElement('div');
    list.className = 'eq-ess-list';
    for (const e of upgradeable) {
      const row = document.createElement('div');
      row.className = 'eq-ess-row';
      const info = document.createElement('span');
      info.className = 'eq-ess-row__info';
      let txt = e.def.name + ' L' + e.instance.level;
      if (e.upgrade.ok && e.upgrade.cost) {
        txt += ' → L' + e.upgrade.toLevel + ' | ' + e.upgrade.cost.silver + 'p';
      } else {
        txt += ' | ' + (e.upgrade.error ?? 'nao melhoravel');
      }
      info.textContent = txt;
      row.appendChild(info);
      row.appendChild(createButton({
        label: 'Melhorar',
        icon: 'anvil',
        variant: 'primary',
        disabled: !e.upgrade.ok,
        onClick: () => services.upgradeEssenceInInventory(e.slotIndex),
      }));
      row.appendChild(createButton({
        label: 'Sacrificar 3',
        icon: 'sparkles',
        disabled: !e.sacrifice.ok,
        onClick: () => services.sacrificeEssencesAt(e.slotIndex),
      }));
      list.appendChild(row);
    }
    side.appendChild(list);
  }

  // Bónus aleatórios
  const rand = services.getEquipmentRandomBonuses();
  const hasRandom = rand.attack > 0 || rand.maxHp > 0 || rand.defense > 0 ||
    rand.critChance > 0 || rand.critDamage > 0 || rand.bonusXp > 0 ||
    rand.bonusSilver > 0 || rand.gatherYield > 0;
  if (hasRandom) {
    side.appendChild(sideSection('Bonus aleatorios'));
    const grid = document.createElement('div');
    grid.className = 'eq-bonus-grid';
    if (rand.attack > 0) grid.appendChild(bonusLine('Ataque', '+' + rand.attack, '#e8a848'));
    if (rand.maxHp > 0) grid.appendChild(bonusLine('Vida', '+' + rand.maxHp, '#d84848'));
    if (rand.defense > 0) grid.appendChild(bonusLine('Defesa', '+' + rand.defense, '#6a9ad8'));
    if (rand.critChance > 0) grid.appendChild(bonusLine('Critico', '+' + (rand.critChance * 100).toFixed(1) + '%', '#e8c977'));
    if (rand.critDamage > 0) grid.appendChild(bonusLine('Dano critico', '+' + (rand.critDamage * 100).toFixed(1) + '%', '#a86ec8'));
    if (rand.bonusXp > 0) grid.appendChild(bonusLine('Bonus XP', '+' + (rand.bonusXp * 100).toFixed(1) + '%', '#6ab87a'));
    if (rand.bonusSilver > 0) grid.appendChild(bonusLine('Bonus prata', '+' + (rand.bonusSilver * 100).toFixed(1) + '%', '#e8c977'));
    if (rand.gatherYield > 0) grid.appendChild(bonusLine('Colheita', '+' + (rand.gatherYield * 100).toFixed(1) + '%', '#6ab87a'));
    side.appendChild(grid);
  }

  // Bónus de essências
  const ess = services.getEssenceBonuses();
  const hasEss = ess.ap > 0 || ess.dp > 0 || ess.maxHp > 0 ||
    ess.critChance > 0 || ess.lifesteal > 0 || ess.bonusSilver > 0;
  if (hasEss) {
    side.appendChild(sideSection('Bonus de essencias'));
    const grid = document.createElement('div');
    grid.className = 'eq-bonus-grid';
    if (ess.ap > 0) grid.appendChild(bonusLine('Ataque', '+' + ess.ap, '#e8a848'));
    if (ess.dp > 0) grid.appendChild(bonusLine('Defesa', '+' + ess.dp, '#6a9ad8'));
    if (ess.maxHp > 0) grid.appendChild(bonusLine('Vida', '+' + ess.maxHp, '#d84848'));
    if (ess.critChance > 0) grid.appendChild(bonusLine('Critico', '+' + (ess.critChance * 100).toFixed(1) + '%', '#e8c977'));
    if (ess.lifesteal > 0) grid.appendChild(bonusLine('Roubo de vida', '+' + (ess.lifesteal * 100).toFixed(1) + '%', '#a86ec8'));
    if (ess.bonusSilver > 0) grid.appendChild(bonusLine('Bonus prata', '+' + (ess.bonusSilver * 100).toFixed(1) + '%', '#e8c977'));
    side.appendChild(grid);
  }

  return side;
}

function sideSection(title: string): HTMLElement {
  const t = document.createElement('div');
  t.className = 'eq-section';
  t.textContent = title;
  return t;
}

function powerStat(label: string, value: string, icon: IconName, color: string): HTMLElement {
  const card = document.createElement('div');
  card.className = 'eq-power__card';
  card.style.setProperty('--power-color', color);
  const ic = document.createElement('div');
  ic.className = 'eq-power__icon';
  ic.appendChild(createIcon(icon, 22));
  card.appendChild(ic);
  const l = document.createElement('div');
  l.className = 'eq-power__label';
  l.textContent = label;
  card.appendChild(l);
  const v = document.createElement('div');
  v.className = 'eq-power__value';
  v.textContent = value;
  card.appendChild(v);
  return card;
}

function bonusLine(label: string, value: string, color: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'eq-bonus-line';
  row.style.setProperty('--bonus-color', color);
  const l = document.createElement('span');
  l.className = 'eq-bonus-line__label';
  l.textContent = label;
  row.appendChild(l);
  const v = document.createElement('span');
  v.className = 'eq-bonus-line__value';
  v.textContent = value;
  row.appendChild(v);
  return row;
}

// ============================================================
// Helpers (mantidos do original)
// ============================================================
interface EmptySlotTarget {
  readonly equipmentSlot: EquipmentSlotId;
  readonly essenceSlotIndex: number;
  readonly itemName: string;
}

function findEquippedWithEmptySlots(services: GameServices): readonly EmptySlotTarget[] {
  const out: EmptySlotTarget[] = [];
  const equip = services.getEquipment();
  for (const slotDef of EQUIP_SLOTS) {
    const stack = equip.get(slotDef.id);
    if (!stack) continue;
    const def = services.registry.getItem(stack.itemId);
    if (!def || def.essenceSlots <= 0) continue;
    for (let i = 0; i < def.essenceSlots; i++) {
      const installed = stack.essences ? stack.essences[i] : null;
      if (!installed) out.push({ equipmentSlot: slotDef.id, essenceSlotIndex: i, itemName: def.name });
    }
  }
  return out;
}

interface EssenceInInv {
  readonly itemId: ItemId;
  readonly def: EssenceDefinition;
  readonly instance: EssenceInstance;
  readonly slotIndex: number;
}

function findEssencesInInventory(services: GameServices): readonly EssenceInInv[] {
  const out: EssenceInInv[] = [];
  const slots = services.getInventory().list();
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    const def = services.getEssenceDefinitionForItem(s.itemId);
    if (def) out.push({ itemId: s.itemId, def, instance: { itemId: s.itemId, level: s.essenceLevel ?? 1 }, slotIndex: i });
  }
  return out;
}

interface UpgradeableEssence {
  readonly slotIndex: number;
  readonly def: EssenceDefinition;
  readonly instance: EssenceInstance;
  readonly upgrade: NonNullable<ReturnType<GameServices['checkEssenceUpgrade']>>;
  readonly sacrifice: NonNullable<ReturnType<GameServices['checkEssenceSacrifice']>>;
}

function findUpgradeableEssences(services: GameServices): readonly UpgradeableEssence[] {
  const out: UpgradeableEssence[] = [];
  const slots = services.getInventory().list();
  for (let i = 0; i < slots.length; i++) {
    const s = slots[i];
    if (!s) continue;
    const def = services.getEssenceDefinitionForItem(s.itemId);
    if (!def) continue;
    const up = services.checkEssenceUpgrade(i);
    const sac = services.checkEssenceSacrifice(i);
    if (!up || !sac) continue;
    out.push({ slotIndex: i, def, instance: { itemId: s.itemId, level: s.essenceLevel ?? 1 }, upgrade: up, sacrifice: sac });
  }
  return out;
}

function slotIconFor(slotId: string): IconName {
  if (slotId === 'weapon') return 'sword';
  if (slotId === 'offhand') return 'shield';
  if (slotId === 'ring1' || slotId === 'ring2') return 'ring';
  if (slotId === 'necklace' || slotId === 'earring1' || slotId === 'earring2') return 'ring';
  if (slotId === 'tool') return 'hammer';
  return 'armor';
}
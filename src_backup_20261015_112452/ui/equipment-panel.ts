import type { GameServices } from '../services/game-services';
import { EQUIP_SLOTS, type EquipmentSlotId } from '../domain/equipment';
import type { ItemId } from '../domain/ids';
import type { EssenceDefinition, EssenceInstance } from '../domain/essence/types';
import { formatEssenceBonus } from '../domain/essence/engine';
import { bonusAtLevel } from '../domain/essence/evolution';
import { ESSENCE_EVOLUTION } from '../data/essence-evolution.data';
import { renderPanelHeader, renderSectionTitle } from './panel-header';
import { renderItemCell } from './item-cell';
import { createIcon } from './icons';
import { createButton } from './button';

export function renderEquipmentPanel(services: GameServices): HTMLElement {
  const root = document.createElement('div');
  root.className = 'panel-content';

  root.appendChild(renderPanelHeader({
    icon: 'shield',
    title: 'Equipamento',
    subtitle: 'Arsenal e essencias',
  }));

  root.appendChild(renderSectionTitle('Slots'));

  const equip = services.getEquipment();
  const grid = document.createElement('div');
  grid.className = 'equip-grid';

  for (const slot of EQUIP_SLOTS) {
    const stack = equip.get(slot.id);
    const cellWrap = document.createElement('div');
    cellWrap.className = 'equip-slot';

    const label = document.createElement('div');
    label.className = 'equip-slot__label';
    label.textContent = slot.label;
    cellWrap.appendChild(label);

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
          title: 'Clica para desequipar',
        });
        cellWrap.appendChild(cell);

        if (def.essenceSlots > 0) {
          const essRow = document.createElement('div');
          essRow.className = 'equip-essence-row';
          for (let i = 0; i < def.essenceSlots; i++) {
            const installed = stack.essences ? stack.essences[i] : null;
            const chip = document.createElement('button');
            chip.type = 'button';
            chip.className = 'essence-chip';
            if (installed) {
              chip.classList.add('essence-chip--filled');
              const eDef = services.getEssenceDefinitionForItem(installed.itemId);
              chip.textContent = 'L' + installed.level;
              if (eDef) {
                const cfg = ESSENCE_EVOLUTION[eDef.kind + '.t' + eDef.tier];
                const bonus = cfg ? bonusAtLevel(eDef, cfg, installed.level) : eDef.bonus;
                chip.title = eDef.name + ' L' + installed.level + ': ' + formatEssenceBonus(bonus) + ' (clica para remover)';
              }
              chip.addEventListener('click', () => {
                services.removeEssenceFromEquipped(slot.id as EquipmentSlotId, i);
              });
            } else {
              chip.classList.add('essence-chip--empty');
              chip.textContent = '+';
              chip.title = 'Vazio';
            }
            essRow.appendChild(chip);
          }
          cellWrap.appendChild(essRow);
        }
      }
    } else {
      const empty = document.createElement('div');
      empty.className = 'equip-empty';
      const slotIcon = slotIconFor(slot.id);
      const ic = createIcon(slotIcon, 22);
      ic.setAttribute('class', 'equip-empty__icon');
      empty.appendChild(ic);
      cellWrap.appendChild(empty);
    }

    grid.appendChild(cellWrap);
  }
  root.appendChild(grid);

  const targets = findEquippedWithEmptySlots(services);
  const essencesInInv = findEssencesInInventory(services);
  if (targets.length > 0 && essencesInInv.length > 0) {
    root.appendChild(renderSectionTitle('Aplicar essencias'));
    const list = document.createElement('div');
    list.className = 'essence-apply-list';

    for (const inv of essencesInInv) {
      for (const target of targets) {
        const row = document.createElement('div');
        row.className = 'essence-apply-row';

        const info = document.createElement('span');
        info.className = 'essence-apply-info';
        info.textContent = inv.def.name + ' L' + inv.instance.level + '  ->  ' + target.itemName + ' (slot ' + (target.essenceSlotIndex + 1) + ')';
        row.appendChild(info);

        const cost = services.getEssenceApplyCost(inv.def);
        row.appendChild(createButton({
          label: cost > 0 ? 'Aplicar (' + cost + ' prata)' : 'Aplicar',
          icon: 'sparkles',
          variant: 'primary',
          onClick: () => {
            services.applyEssenceToEquipped(target.equipmentSlot, target.essenceSlotIndex, inv.instance);
          },
        }));

        list.appendChild(row);
      }
    }
    root.appendChild(list);
  }

  const upgradeable = findUpgradeableEssences(services);
  if (upgradeable.length > 0) {
    root.appendChild(renderSectionTitle('Melhorar essencias (inventario)'));
    const list = document.createElement('div');
    list.className = 'essence-apply-list';
    for (const e of upgradeable) {
      const row = document.createElement('div');
      row.className = 'essence-apply-row';
      const info = document.createElement('span');
      info.className = 'essence-apply-info';
      let txt = e.def.name + ' L' + e.instance.level;
      if (e.upgrade.ok && e.upgrade.cost) {
        txt += ' -> L' + e.upgrade.toLevel + ' | ' + e.upgrade.cost.silver + ' prata';
        if (e.upgrade.cost.materials.length > 0) {
          txt += ' + ' + e.upgrade.cost.materials.map((m: { itemId: ItemId; quantity: number }) => m.quantity + 'x ' + (services.registry.getItem(m.itemId)?.name ?? m.itemId)).join(', ');
        }
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
    root.appendChild(list);
  }

  root.appendChild(renderSectionTitle('Poder do equipamento'));
  const power = services.getEquipmentPower();
  const pGrid = document.createElement('div');
  pGrid.className = 'info-grid';
  pGrid.appendChild(row('Ataque base (AP)', '+' + power.attackPower));
  pGrid.appendChild(row('Defesa base (DP)', '+' + power.defensePower));
  root.appendChild(pGrid);

  const rand = services.getEquipmentRandomBonuses();
  const hasRandom = rand.attack > 0 || rand.maxHp > 0 || rand.defense > 0 ||
    rand.critChance > 0 || rand.critDamage > 0 || rand.bonusXp > 0 ||
    rand.bonusSilver > 0 || rand.gatherYield > 0;
  if (hasRandom) {
    root.appendChild(renderSectionTitle('Bonus aleatorios'));
    const rGrid = document.createElement('div');
    rGrid.className = 'info-grid';
    if (rand.attack > 0) rGrid.appendChild(row('Ataque', '+' + rand.attack));
    if (rand.maxHp > 0) rGrid.appendChild(row('Vida', '+' + rand.maxHp));
    if (rand.defense > 0) rGrid.appendChild(row('Defesa', '+' + rand.defense));
    if (rand.critChance > 0) rGrid.appendChild(row('Critico', '+' + (rand.critChance * 100).toFixed(1) + '%'));
    if (rand.critDamage > 0) rGrid.appendChild(row('Dano Critico', '+' + (rand.critDamage * 100).toFixed(1) + '%'));
    if (rand.bonusXp > 0) rGrid.appendChild(row('Bonus XP', '+' + (rand.bonusXp * 100).toFixed(1) + '%'));
    if (rand.bonusSilver > 0) rGrid.appendChild(row('Bonus Prata', '+' + (rand.bonusSilver * 100).toFixed(1) + '%'));
    if (rand.gatherYield > 0) rGrid.appendChild(row('Colheita', '+' + (rand.gatherYield * 100).toFixed(1) + '%'));
    root.appendChild(rGrid);
  }

  const ess = services.getEssenceBonuses();
  const hasEss = ess.ap > 0 || ess.dp > 0 || ess.maxHp > 0 ||
    ess.critChance > 0 || ess.lifesteal > 0 || ess.bonusSilver > 0;
  if (hasEss) {
    root.appendChild(renderSectionTitle('Bonus de essencias'));
    const eGrid = document.createElement('div');
    eGrid.className = 'info-grid';
    if (ess.ap > 0) eGrid.appendChild(row('Ataque', '+' + ess.ap));
    if (ess.dp > 0) eGrid.appendChild(row('Defesa', '+' + ess.dp));
    if (ess.maxHp > 0) eGrid.appendChild(row('Vida', '+' + ess.maxHp));
    if (ess.critChance > 0) eGrid.appendChild(row('Critico', '+' + (ess.critChance * 100).toFixed(1) + '%'));
    if (ess.lifesteal > 0) eGrid.appendChild(row('Roubo de vida', '+' + (ess.lifesteal * 100).toFixed(1) + '%'));
    if (ess.bonusSilver > 0) eGrid.appendChild(row('Bonus Prata', '+' + (ess.bonusSilver * 100).toFixed(1) + '%'));
    root.appendChild(eGrid);
  }

  return root;
}

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

function slotIconFor(slotId: string): 'sword' | 'shield' | 'armor' | 'ring' | 'hammer' | 'briefcase' {
  if (slotId === 'weapon') return 'sword';
  if (slotId === 'offhand') return 'shield';
  if (slotId === 'ring1' || slotId === 'ring2') return 'ring';
  if (slotId === 'necklace' || slotId === 'earring1' || slotId === 'earring2') return 'ring';
  if (slotId === 'tool') return 'hammer';
  return 'armor';
}

function row(label: string, value: string): HTMLElement {
  const r = document.createElement('div');
  r.className = 'info-row';
  const l = document.createElement('span');
  l.className = 'info-row__label';
  l.textContent = label;
  const v = document.createElement('span');
  v.className = 'info-row__value';
  v.textContent = value;
  r.appendChild(l);
  r.appendChild(v);
  return r;
}
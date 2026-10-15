import type { ItemId } from '../ids';
import type { ItemDefinition } from '../content';
import type { ItemStack } from '../item-instance';
import type {
  EssenceBonusBundle,
  EssenceDefinition,
  EssenceEvolutionConfig,
  EssenceInstance,
} from './types';
import { EMPTY_ESSENCE_BONUS } from './types';
import { bonusAtLevel } from './evolution';

function addBundle(a: EssenceBonusBundle, b: EssenceBonusBundle): EssenceBonusBundle {
  return {
    ap: a.ap + b.ap,
    dp: a.dp + b.dp,
    maxHp: a.maxHp + b.maxHp,
    critChance: a.critChance + b.critChance,
    lifesteal: a.lifesteal + b.lifesteal,
    bonusSilver: a.bonusSilver + b.bonusSilver,
  };
}

export function sumEssenceBonuses(
  items: readonly ItemStack[],
  essenceByItemId: ReadonlyMap<ItemId, EssenceDefinition>,
  evolutionConfigs: ReadonlyMap<string, EssenceEvolutionConfig>,
): EssenceBonusBundle {
  let total = EMPTY_ESSENCE_BONUS;
  for (const item of items) {
    if (!item.essences) continue;
    for (const inst of item.essences) {
      if (inst === null) continue;
      const def = essenceByItemId.get(inst.itemId);
      if (!def) continue;
      const cfgKey = def.kind + '.t' + def.tier;
      const cfg = evolutionConfigs.get(cfgKey);
      if (!cfg) {
        total = addBundle(total, def.bonus);
        continue;
      }
      total = addBundle(total, bonusAtLevel(def, cfg, inst.level));
    }
  }
  return total;
}

export function isEssenceCompatible(
  essenceDef: EssenceDefinition,
  itemDef: ItemDefinition,
): boolean {
  if (itemDef.essenceSlots <= 0) return false;
  if (essenceDef.compatibleSlots === 'any') return true;
  if (!itemDef.equipSlot) return false;
  return essenceDef.compatibleSlots.includes(itemDef.equipSlot);
}

export type EssenceOpError =
  | 'item-not-equippable' | 'essence-not-essence'
  | 'slot-out-of-range' | 'slot-occupied' | 'incompatible-slot'
  | 'not-enough-silver' | 'stack-limit-reached'
  | 'essence-not-equipped' | 'essence-mismatch';

export interface ApplyArgs {
  readonly item: ItemStack;
  readonly itemDef: ItemDefinition;
  readonly instance: EssenceInstance;
  readonly essenceDef: EssenceDefinition;
  readonly slotIndex: number;
  readonly playerSilver: number;
  readonly cost: number;
}

export interface ApplyResult {
  readonly ok: boolean;
  readonly error: EssenceOpError | null;
  readonly newItem?: ItemStack;
  readonly silverDelta?: number;
}

export function applyEssence(args: ApplyArgs): ApplyResult {
  const { item, itemDef, instance, essenceDef, slotIndex, playerSilver, cost } = args;

  if (itemDef.essenceSlots <= 0) return { ok: false, error: 'item-not-equippable' };
  if (slotIndex < 0 || slotIndex >= itemDef.essenceSlots) return { ok: false, error: 'slot-out-of-range' };
  if (!isEssenceCompatible(essenceDef, itemDef)) return { ok: false, error: 'incompatible-slot' };
  if (playerSilver < cost) return { ok: false, error: 'not-enough-silver' };

  const slots: (EssenceInstance | null)[] = item.essences
    ? item.essences.slice()
    : (new Array(itemDef.essenceSlots).fill(null) as (EssenceInstance | null)[]);

  while (slots.length < itemDef.essenceSlots) slots.push(null);
  if (slots[slotIndex] !== null && slots[slotIndex] !== undefined) return { ok: false, error: 'slot-occupied' };

  const existingCount = slots.filter((s) => s !== null && s.itemId === instance.itemId).length;
  if (existingCount >= essenceDef.maxStackPerItem) return { ok: false, error: 'stack-limit-reached' };

  slots[slotIndex] = { itemId: instance.itemId, level: instance.level };
  const newItem: ItemStack = { ...item, essences: slots };
  return { ok: true, error: null, newItem, silverDelta: -cost };
}

export interface RemoveArgs {
  readonly item: ItemStack;
  readonly itemDef: ItemDefinition;
  readonly slotIndex: number;
  readonly playerSilver: number;
  readonly cost: number;
}

export interface RemoveResult {
  readonly ok: boolean;
  readonly error: EssenceOpError | null;
  readonly newItem?: ItemStack;
  readonly removedInstance?: EssenceInstance;
  readonly silverDelta?: number;
}

export function removeEssence(args: RemoveArgs): RemoveResult {
  const { item, itemDef, slotIndex, playerSilver, cost } = args;
  if (itemDef.essenceSlots <= 0) return { ok: false, error: 'item-not-equippable' };
  if (slotIndex < 0 || slotIndex >= itemDef.essenceSlots) return { ok: false, error: 'slot-out-of-range' };
  if (playerSilver < cost) return { ok: false, error: 'not-enough-silver' };
  if (!item.essences) return { ok: false, error: 'essence-not-equipped' };

  const current = item.essences[slotIndex];
  if (current === null || current === undefined) return { ok: false, error: 'essence-not-equipped' };

  const slots = item.essences.slice();
  slots[slotIndex] = null;
  return {
    ok: true, error: null,
    newItem: { ...item, essences: slots },
    removedInstance: { itemId: current.itemId, level: current.level },
    silverDelta: -cost,
  };
}

export function countInstalledEssences(item: ItemStack | null): number {
  if (!item || !item.essences) return 0;
  return item.essences.filter((s) => s !== null).length;
}

export function essencesEqual(
  a: readonly (EssenceInstance | null)[] | null,
  b: readonly (EssenceInstance | null)[] | null,
): boolean {
  if (a === null && b === null) return true;
  if (a === null || b === null) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const ai = a[i] ?? null;
    const bi = b[i] ?? null;
    if (ai === null && bi === null) continue;
    if (ai === null || bi === null) return false;
    if (ai.itemId !== bi.itemId || ai.level !== bi.level) return false;
  }
  return true;
}

export function instanceKey(inst: EssenceInstance): string {
  return (inst.itemId as string) + '#' + inst.level;
}

/** Formata bonus de essencia para tooltips. */
export function formatEssenceBonus(b: EssenceBonusBundle): string {
  const parts: string[] = [];
  if (b.ap > 0) parts.push('+' + b.ap + ' AP');
  if (b.dp > 0) parts.push('+' + b.dp + ' DP');
  if (b.maxHp > 0) parts.push('+' + b.maxHp + ' HP');
  if (b.critChance > 0) parts.push('+' + (b.critChance * 100).toFixed(1) + '% crit');
  if (b.lifesteal > 0) parts.push('+' + (b.lifesteal * 100).toFixed(1) + '% lifesteal');
  if (b.bonusSilver > 0) parts.push('+' + (b.bonusSilver * 100).toFixed(1) + '% prata');
  return parts.join(' | ') || 'sem bonus';
}
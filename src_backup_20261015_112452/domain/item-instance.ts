import type { ItemId } from './ids';
import type { RandomAttributeRoll } from './random-attributes/types';
import { isRollsEqual } from './random-attributes/engine';
import type { EssenceInstance } from './essence/types';
import { essencesEqual } from './essence/engine';

export interface ItemStack {
  readonly itemId: ItemId;
  readonly quantity: number;
  readonly enhancementLevel: number;
  readonly durability: number | null;
  /** Atributos aleatorios (Fase 15). */
  readonly randomAttributes: readonly RandomAttributeRoll[] | null;
  /** Essencias instaladas neste equipamento (Fase 18 usa EssenceInstance). */
  readonly essences: readonly (EssenceInstance | null)[] | null;
  /** Nivel da essencia (Fase 18). So preenchido quando este item E uma essencia. */
  readonly essenceLevel: number | null;
}

export function makeStack(
  itemId: ItemId,
  quantity: number,
  enhancementLevel = 0,
  durability: number | null = null,
  randomAttributes: readonly RandomAttributeRoll[] | null = null,
  essences: readonly (EssenceInstance | null)[] | null = null,
  essenceLevel: number | null = null,
): ItemStack {
  return { itemId, quantity, enhancementLevel, durability, randomAttributes, essences, essenceLevel };
}

export function sameStack(a: ItemStack, b: ItemStack): boolean {
  if (a.itemId !== b.itemId) return false;
  if (a.enhancementLevel !== b.enhancementLevel) return false;
  if (a.essenceLevel !== b.essenceLevel) return false;
  if (!isRollsEqual(a.randomAttributes, b.randomAttributes)) return false;
  return essencesEqual(a.essences, b.essences);
}
import type { ItemId } from '../ids';
import type { Recipe, RecipeInput, RecipeOutput, Rng } from './types';

export interface ProductionCheck {
  readonly canStart: boolean;
  readonly missingInputs: readonly RecipeInput[];
  readonly missingSilver: number;
  readonly reason: string | null;
}

export interface MaterialBag {
  count(itemId: ItemId): number;
  consume(itemId: ItemId, quantity: number): boolean;
}

export interface Wallet {
  silver(): number;
  spendSilver(amount: number): boolean;
}

export function validateRecipe(
  recipe: Recipe,
  batchCount: number,
  bag: MaterialBag,
  wallet: Wallet,
): ProductionCheck {
  if (!Number.isInteger(batchCount) || batchCount <= 0 || batchCount > recipe.maxBatches) {
    return {
      canStart: false, missingInputs: [], missingSilver: 0,
      reason: `Numero de lotes invalido (max ${recipe.maxBatches}).`,
    };
  }
  const missing: RecipeInput[] = [];
  for (const input of recipe.inputs) {
    const required = input.quantity * batchCount;
    const available = bag.count(input.itemId);
    if (available < required) {
      missing.push({ itemId: input.itemId, quantity: required - available });
    }
  }
  const totalSilver = recipe.silverCost * batchCount;
  const missingSilver = Math.max(0, totalSilver - wallet.silver());
  if (missing.length > 0 || missingSilver > 0) {
    return {
      canStart: false, missingInputs: missing, missingSilver,
      reason: missingSilver > 0 ? `Faltam ${missingSilver} prata.` : `Faltam ${missing.length} tipos de material.`,
    };
  }
  return { canStart: true, missingInputs: [], missingSilver: 0, reason: null };
}

export function consumeInputs(
  recipe: Recipe,
  batchCount: number,
  bag: MaterialBag,
  wallet: Wallet,
): boolean {
  for (const input of recipe.inputs) {
    if (bag.count(input.itemId) < input.quantity * batchCount) return false;
  }
  if (wallet.silver() < recipe.silverCost * batchCount) return false;
  wallet.spendSilver(recipe.silverCost * batchCount);
  for (const input of recipe.inputs) {
    bag.consume(input.itemId, input.quantity * batchCount);
  }
  return true;
}

export function rollOutputs(
  outputs: readonly RecipeOutput[],
  batchCount: number,
  rng: Rng,
  yieldMultiplier: number,
): readonly { itemId: ItemId; quantity: number }[] {
  const results: { itemId: ItemId; quantity: number }[] = [];
  for (const out of outputs) {
    const effectiveChance = Math.min(1, out.chance * yieldMultiplier);
    if (rng() >= effectiveChance) continue;
    results.push({ itemId: out.itemId, quantity: out.quantity * batchCount });
  }
  return results;
}
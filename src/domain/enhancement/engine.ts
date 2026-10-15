import type { ItemId } from '../ids';
import type {
  EnhancementCost, EnhancementHistoryEntry, EnhancementResult, EnhancementRule, Rng,
} from './types';

export interface Wallet {
  silver(): number;
  spendSilver(amount: number): boolean;
}

export interface MaterialBag {
  count(itemId: ItemId): number;
  consume(itemId: ItemId, quantity: number): boolean;
}

export interface ProtectionBag {
  has(itemId: ItemId): boolean;
  consume(itemId: ItemId): boolean;
}

export interface AttemptArgs {
  readonly itemId: ItemId;
  readonly currentLevel: number;
  readonly rule: EnhancementRule;
  readonly wallet: Wallet;
  readonly bag: MaterialBag;
  readonly protectionItemId: ItemId | null;
  readonly protection: ProtectionBag | null;
  readonly rng: Rng;
  readonly nowMs: number;
  /** Multiplicador aplicado ao custo em prata (proporcional ao valor do item). Default 1. */
  readonly costMultiplier?: number | undefined;
}

export function attemptEnhancement(args: AttemptArgs): EnhancementResult | null {
  const { currentLevel, rule, wallet, bag, protectionItemId, protection, rng, nowMs } = args;
  const targetLevel = currentLevel + 1;
  if (targetLevel > rule.maxLevel) return null;
  const config = rule.levels.find((l) => l.targetLevel === targetLevel);
  if (!config) return null;

  const mult = args.costMultiplier ?? 1;
  const scaledSilver = Math.floor(config.cost.silver * mult);
  const effectiveCost = { ...config.cost, silver: scaledSilver };
  if (!checkCost(effectiveCost, wallet, bag)) return null;
  spendCost(effectiveCost, wallet, bag);

  const success = rng() < config.successChance;

  if (success) {
    return {
      success: true, destroyed: false,
      previousLevel: currentLevel, newLevel: targetLevel,
      consumed: effectiveCost, usedProtection: false, timestamp: nowMs,
    };
  }

  let outcome = config.failureOutcome;
  let usedProtection = false;

  if (outcome.kind === 'destroy' && protectionItemId && protection && protection.has(protectionItemId)) {
    protection.consume(protectionItemId);
    usedProtection = true;
    outcome = { kind: 'nothing' };
  }

  if (outcome.kind === 'nothing') {
    return {
      success: false, destroyed: false,
      previousLevel: currentLevel, newLevel: currentLevel,
      consumed: effectiveCost, usedProtection, timestamp: nowMs,
    };
  }
  if (outcome.kind === 'downgrade') {
    return {
      success: false, destroyed: false,
      previousLevel: currentLevel,
      newLevel: Math.max(0, currentLevel - outcome.by),
      consumed: effectiveCost, usedProtection, timestamp: nowMs,
    };
  }
  return {
    success: false, destroyed: true,
    previousLevel: currentLevel, newLevel: 0,
    consumed: effectiveCost, usedProtection: false, timestamp: nowMs,
  };
}

function checkCost(cost: EnhancementCost, wallet: Wallet, bag: MaterialBag): boolean {
  if (wallet.silver() < cost.silver) return false;
  for (const e of cost.materials) if (bag.count(e.itemId) < e.quantity) return false;
  return true;
}

function spendCost(cost: EnhancementCost, wallet: Wallet, bag: MaterialBag): void {
  wallet.spendSilver(cost.silver);
  for (const e of cost.materials) bag.consume(e.itemId, e.quantity);
}

export function pushHistory(
  history: readonly EnhancementHistoryEntry[],
  entry: EnhancementHistoryEntry,
  cap = 10,
): readonly EnhancementHistoryEntry[] {
  return [entry, ...history].slice(0, cap);
}
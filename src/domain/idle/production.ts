import type { SeededRng } from './rng';
import { MAX_SIM_ITERATIONS } from './types';

export interface ProductionIdleInput {
  readonly cycleMs: number;
  readonly batchesPerCycle: number;
  readonly expPerCycle: number;
  readonly inputsPerCycle: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly outputsPerCycle: readonly {
    readonly itemId: string;
    readonly chance: number;
    readonly quantity: number;
  }[];
  readonly inventory: ReadonlyMap<string, number>;
}

export interface ProductionIdleOutcome {
  readonly cycles: number;
  readonly batches: number;
  readonly xpGained: number;
  readonly consumed: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly produced: readonly { readonly itemId: string; readonly quantity: number }[];
  readonly stoppedReason: 'completed' | 'no-materials' | 'iteration-cap';
}

export function simulateProduction(input: ProductionIdleInput, elapsedMs: number, rng: SeededRng): ProductionIdleOutcome {
  if (input.cycleMs <= 0 || input.batchesPerCycle <= 0) {
    return { cycles: 0, batches: 0, xpGained: 0, consumed: [], produced: [], stoppedReason: 'completed' };
  }

  const maxCycles = Math.floor(elapsedMs / input.cycleMs);
  const cap = Math.min(maxCycles, MAX_SIM_ITERATIONS);

  const inventory = new Map(input.inventory);
  const consumedTotals = new Map<string, number>();
  const producedTotals = new Map<string, number>();

  let cycles = 0;
  for (let i = 0; i < cap; i++) {
    // Verificar inputs disponiveis
    let canProduce = true;
    for (const inp of input.inputsPerCycle) {
      const have = inventory.get(inp.itemId) ?? 0;
      if (have < inp.quantity) { canProduce = false; break; }
    }
    if (!canProduce) {
      return {
        cycles, batches: cycles * input.batchesPerCycle,
        xpGained: cycles * input.expPerCycle,
        consumed: mapTotals(consumedTotals), produced: mapTotals(producedTotals),
        stoppedReason: 'no-materials',
      };
    }

    // Consumir
    for (const inp of input.inputsPerCycle) {
      inventory.set(inp.itemId, (inventory.get(inp.itemId) ?? 0) - inp.quantity);
      consumedTotals.set(inp.itemId, (consumedTotals.get(inp.itemId) ?? 0) + inp.quantity);
    }

    // Produzir
    for (const out of input.outputsPerCycle) {
      if (rng.next() < out.chance) {
        inventory.set(out.itemId, (inventory.get(out.itemId) ?? 0) + out.quantity);
        producedTotals.set(out.itemId, (producedTotals.get(out.itemId) ?? 0) + out.quantity);
      }
    }

    cycles++;
  }

  const stoppedReason = maxCycles > cap ? 'iteration-cap' : 'completed';
  return {
    cycles, batches: cycles * input.batchesPerCycle,
    xpGained: cycles * input.expPerCycle,
    consumed: mapTotals(consumedTotals), produced: mapTotals(producedTotals),
    stoppedReason,
  };
}

function mapTotals(m: Map<string, number>): { itemId: string; quantity: number }[] {
  const out: { itemId: string; quantity: number }[] = [];
  for (const [itemId, quantity] of m) out.push({ itemId, quantity });
  return out;
}
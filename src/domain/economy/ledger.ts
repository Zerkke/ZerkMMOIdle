import type { Transaction, TransactionCategory, EconomyMetrics } from './types';
import { EMPTY_CATEGORY_METRICS } from './types';
import type { ItemId } from '../ids';

const DEFAULT_CAPACITY = 200;

export class TransactionLedger {
  private transactions: Transaction[] = [];
  private nextId = 1;

  constructor(private readonly capacity: number = DEFAULT_CAPACITY, initial: readonly Transaction[] = []) {
    if (initial.length > 0) {
      this.transactions = initial.slice(-capacity);
      const maxId = initial.reduce((m, t) => Math.max(m, t.id), 0);
      this.nextId = maxId + 1;
    }
  }

  record(
    category: TransactionCategory,
    silverDelta: number,
    itemDeltas: readonly { itemId: ItemId; delta: number }[],
    label: string,
    nowMs: number,
  ): Transaction {
    const t: Transaction = {
      id: this.nextId++,
      category,
      silverDelta,
      itemDeltas: itemDeltas.slice(),
      label,
      timestamp: nowMs,
    };
    this.transactions.push(t);
    if (this.transactions.length > this.capacity) {
      this.transactions = this.transactions.slice(-this.capacity);
    }
    return t;
  }

  list(): readonly Transaction[] { return this.transactions.slice(); }

  /** Métricas agregadas de todo o histórico (não só do que está em buffer). */
  metrics(): EconomyMetrics {
    const byCategory: Record<TransactionCategory, { income: number; expense: number }> = structuredClone(EMPTY_CATEGORY_METRICS);
    let totalIncome = 0;
    let totalExpense = 0;

    for (const t of this.transactions) {
      const cat = byCategory[t.category];
      if (t.silverDelta > 0) {
        cat.income += t.silverDelta;
        totalIncome += t.silverDelta;
      } else if (t.silverDelta < 0) {
        cat.expense += -t.silverDelta;
        totalExpense += -t.silverDelta;
      }
    }

    return {
      totalIncome,
      totalExpense,
      netSilver: totalIncome - totalExpense,
      byCategory,
    };
  }

  clear(): void {
    this.transactions = [];
    this.nextId = 1;
  }

  toSnapshot(): readonly Transaction[] { return this.transactions.slice(); }

  static fromSnapshot(snapshot: readonly Transaction[]): TransactionLedger {
    return new TransactionLedger(DEFAULT_CAPACITY, snapshot);
  }
}
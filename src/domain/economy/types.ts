import type { ItemId } from '../ids';

export type TransactionCategory =
  | 'combat' | 'sell' | 'buy' | 'crafting'
  | 'enhancement' | 'farm' | 'profession' | 'quest' | 'warehouse';

export interface Transaction {
  readonly id: number;
  readonly category: TransactionCategory;
  readonly silverDelta: number;
  readonly itemDeltas: readonly { readonly itemId: ItemId; readonly delta: number }[];
  readonly label: string;
  readonly timestamp: number;
}

export interface EconomyMetrics {
  readonly totalIncome: number;
  readonly totalExpense: number;
  readonly netSilver: number;
  readonly byCategory: Readonly<Record<TransactionCategory, {
    readonly income: number;
    readonly expense: number;
  }>>;
}

export const EMPTY_CATEGORY_METRICS = {
  combat: { income: 0, expense: 0 },
  sell: { income: 0, expense: 0 },
  buy: { income: 0, expense: 0 },
  crafting: { income: 0, expense: 0 },
  enhancement: { income: 0, expense: 0 },
  farm: { income: 0, expense: 0 },
  profession: { income: 0, expense: 0 },
  quest: { income: 0, expense: 0 },
  warehouse: { income: 0, expense: 0 },
} as const;
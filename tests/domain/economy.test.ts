import { describe, it, expect } from 'vitest';
import { TransactionLedger } from '../../src/domain/economy/ledger';
import { asItemId } from '../../src/domain/ids';

describe('TransactionLedger', () => {
  it('regista transacoes e incrementa id', () => {
    const l = new TransactionLedger();
    const t1 = l.record('combat', 10, [], 'Matou slime', 100);
    const t2 = l.record('sell', 5, [], 'Vendeu ferro', 200);
    expect(t1.id).toBe(1);
    expect(t2.id).toBe(2);
    expect(l.list()).toHaveLength(2);
  });

  it('agrega metricas por categoria', () => {
    const l = new TransactionLedger();
    l.record('combat', 100, [], 'a', 1);
    l.record('combat', 50, [], 'b', 2);
    l.record('buy', -30, [], 'c', 3);
    l.record('sell', 20, [], 'd', 4);
    const m = l.metrics();
    expect(m.totalIncome).toBe(170);
    expect(m.totalExpense).toBe(30);
    expect(m.netSilver).toBe(140);
    expect(m.byCategory.combat.income).toBe(150);
    expect(m.byCategory.buy.expense).toBe(30);
    expect(m.byCategory.sell.income).toBe(20);
  });

  it('respeita capacidade circular', () => {
    const l = new TransactionLedger(5);
    for (let i = 0; i < 10; i++) l.record('combat', i, [], 't' + i, i);
    expect(l.list()).toHaveLength(5);
    expect(l.list()[0]?.label).toBe('t5');
    expect(l.list()[4]?.label).toBe('t9');
  });

  it('fromSnapshot restaura transacoes e proximo id', () => {
    const orig = new TransactionLedger();
    orig.record('combat', 10, [], 'x', 1);
    orig.record('sell', 5, [], 'y', 2);
    const restored = TransactionLedger.fromSnapshot(orig.toSnapshot());
    expect(restored.list()).toHaveLength(2);
    const next = restored.record('buy', -1, [], 'z', 3);
    expect(next.id).toBe(3);
  });

  it('registra itemDeltas corretamente', () => {
    const l = new TransactionLedger();
    const t = l.record('sell', 10, [{ itemId: asItemId('item.x'), delta: -3 }], 'venda', 1);
    expect(t.itemDeltas).toHaveLength(1);
    expect(t.itemDeltas[0]?.delta).toBe(-3);
  });

  it('lida com transacao com silverDelta zero', () => {
    const l = new TransactionLedger();
    l.record('warehouse', 0, [], 'move', 1);
    const m = l.metrics();
    expect(m.totalIncome).toBe(0);
    expect(m.totalExpense).toBe(0);
    expect(m.netSilver).toBe(0);
  });
});
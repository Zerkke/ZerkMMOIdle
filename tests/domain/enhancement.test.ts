import { describe, it, expect } from 'vitest';
import { attemptEnhancement, pushHistory } from '../../src/domain/enhancement/engine';
import type { EnhancementRule, EnhancementHistoryEntry } from '../../src/domain/enhancement/types';
import { asItemId } from '../../src/domain/ids';

const ORE = asItemId('item.ore');

const RULE: EnhancementRule = {
  category: 'weapon',
  maxLevel: 3,
  levels: [
    { targetLevel: 1, successChance: 1.0, cost: { silver: 100, materials: [] }, failureOutcome: { kind: 'nothing' } },
    { targetLevel: 2, successChance: 0.5, cost: { silver: 200, materials: [{ itemId: ORE, quantity: 2 }] }, failureOutcome: { kind: 'downgrade', by: 1 } },
    { targetLevel: 3, successChance: 0.2, cost: { silver: 500, materials: [{ itemId: ORE, quantity: 5 }] }, failureOutcome: { kind: 'destroy' } },
  ],
};

function makeWallet(silver = 10000) {
  let s = silver;
  return {
    silver: () => s,
    spendSilver: (n: number) => { if (s < n) return false; s -= n; return true; },
  };
}

function makeBag(initial: Record<string, number> = {}) {
  const m = new Map(Object.entries(initial));
  return {
    count: (id: typeof ORE) => m.get(id as string) ?? 0,
    consume: (id: typeof ORE, q: number) => {
      const cur = m.get(id as string) ?? 0;
      if (cur < q) return false;
      m.set(id as string, cur - q);
      return true;
    },
  };
}

describe('enhancement engine', () => {
  it('sucesso aumenta nivel e consome custos', () => {
    const r = attemptEnhancement({
      itemId: asItemId('item.x'), currentLevel: 0, rule: RULE,
      wallet: makeWallet(), bag: makeBag(),
      protectionItemId: null, protection: null,
      rng: () => 0.0, nowMs: 1,
    });
    expect(r).not.toBeNull();
    expect(r?.success).toBe(true);
    expect(r?.newLevel).toBe(1);
  });

  it('falha com downgrade aplica reducao', () => {
    // currentLevel=1 vai para targetLevel=2, que tem downgrade
    const r = attemptEnhancement({
      itemId: asItemId('item.x'), currentLevel: 1, rule: RULE,
      wallet: makeWallet(), bag: makeBag({ 'item.ore': 10 }),
      protectionItemId: null, protection: null, rng: () => 0.99, nowMs: 1,
    });
    expect(r?.success).toBe(false);
    expect(r?.destroyed).toBe(false);
    expect(r?.newLevel).toBe(0);
  });

  it('falha com destroy destroi item', () => {
    // currentLevel=2 vai para targetLevel=3, que tem destroy
    const r = attemptEnhancement({
      itemId: asItemId('item.x'), currentLevel: 2, rule: RULE,
      wallet: makeWallet(), bag: makeBag({ 'item.ore': 10 }),
      protectionItemId: null, protection: null, rng: () => 0.99, nowMs: 1,
    });
    expect(r?.destroyed).toBe(true);
    expect(r?.newLevel).toBe(0);
  });

  it('protecao ativa transforma destroy em nothing e consome protecao', () => {
    let consumed = false;
    const protection = {
      has: () => true,
      consume: () => { consumed = true; return true; },
    };
    const r = attemptEnhancement({
      itemId: asItemId('item.x'), currentLevel: 2, rule: RULE,
      wallet: makeWallet(), bag: makeBag({ 'item.ore': 10 }),
      protectionItemId: asItemId('item.protect'), protection,
      rng: () => 0.99, nowMs: 1,
    });
    expect(r?.destroyed).toBe(false);
    expect(r?.usedProtection).toBe(true);
    expect(consumed).toBe(true);
    expect(r?.newLevel).toBe(2);
  });

  it('rejeita se sem prata', () => {
    const r = attemptEnhancement({
      itemId: asItemId('item.x'), currentLevel: 0, rule: RULE,
      wallet: makeWallet(0), bag: makeBag(),
      protectionItemId: null, protection: null, rng: () => 0.0, nowMs: 1,
    });
    expect(r).toBeNull();
  });

  it('rejeita se sem materiais', () => {
    const r = attemptEnhancement({
      itemId: asItemId('item.x'), currentLevel: 1, rule: RULE,
      wallet: makeWallet(), bag: makeBag({}),
      protectionItemId: null, protection: null, rng: () => 0.0, nowMs: 1,
    });
    expect(r).toBeNull();
  });

  it('rejeita acima do nivel maximo', () => {
    const r = attemptEnhancement({
      itemId: asItemId('item.x'), currentLevel: 3, rule: RULE,
      wallet: makeWallet(), bag: makeBag(),
      protectionItemId: null, protection: null, rng: () => 0.0, nowMs: 1,
    });
    expect(r).toBeNull();
  });
});

describe('pushHistory', () => {
  it('adiciona e mantem cap', () => {
    let h: readonly EnhancementHistoryEntry[] = [];
    for (let i = 0; i < 15; i++) {
      h = pushHistory(h, {
        itemId: asItemId('item.x'), previousLevel: i, attemptedLevel: i + 1,
        success: true, destroyed: false, usedProtection: false, timestamp: i,
      }, 10);
    }
    expect(h.length).toBe(10);
    expect(h[0]?.timestamp).toBe(14);
  });
});
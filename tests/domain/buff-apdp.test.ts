import { describe, it, expect } from 'vitest';
import { BuffManager } from '../../src/domain/buff/engine';
import { asBuffId, asItemId } from '../../src/domain/ids';
import type { BuffDefinition } from '../../src/domain/buff/types';

function def(id: string, kind: BuffDefinition['kind'], mag: number, durMs: number): BuffDefinition {
  return { id: asBuffId(id), name: id, description: '', kind, magnitude: mag, durationMs: durMs, sourceItemId: asItemId('item.x') };
}

describe('BuffManager — ap-bonus / dp-bonus', () => {
  it('ap-bonus aumenta modifier de ap', () => {
    const m = new BuffManager();
    m.apply(def('b.ap', 'ap-bonus', 15, 10000), 0);
    expect(m.modifier('ap-bonus')).toBe(15);
    expect(m.modifier('dp-bonus')).toBe(0);
  });

  it('dp-bonus aumenta modifier de dp', () => {
    const m = new BuffManager();
    m.apply(def('b.dp', 'dp-bonus', 20, 10000), 0);
    expect(m.modifier('dp-bonus')).toBe(20);
  });

  it('reaplicar renova (nao acumula magnitude)', () => {
    const m = new BuffManager();
    m.apply(def('b.ap', 'ap-bonus', 10, 1000), 0);
    m.apply(def('b.ap', 'ap-bonus', 10, 1000), 500);
    expect(m.modifier('ap-bonus')).toBe(10);
  });

  it('buff expira apos tick', () => {
    const m = new BuffManager();
    m.apply(def('b.ap', 'ap-bonus', 10, 1000), 0);
    m.tick(1500);
    expect(m.modifier('ap-bonus')).toBe(0);
  });
});
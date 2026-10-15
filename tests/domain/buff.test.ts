import { describe, it, expect } from 'vitest';
import { BuffManager } from '../../src/domain/buff/engine';
import { asBuffId } from '../../src/domain/ids';
import type { BuffDefinition } from '../../src/domain/buff/types';

function makeDef(id: string, kind: BuffDefinition['kind'], mag: number, dur: number): BuffDefinition {
  return { id: asBuffId(id), name: id, description: '', kind, magnitude: mag, durationMs: dur, sourceItemId: null };
}

describe('BuffManager', () => {
  it('aplica um buff novo', () => {
    const m = new BuffManager();
    const r = m.apply(makeDef('b1', 'attack-power', 10, 1000), 0);
    expect(r.applied).toBe(true);
    expect(r.refreshed).toBe(false);
    expect(m.list()).toHaveLength(1);
  });

  it('reaplicar o mesmo buff renova em vez de acumular', () => {
    const m = new BuffManager();
    m.apply(makeDef('b1', 'attack-power', 10, 1000), 0);
    m.apply(makeDef('b1', 'attack-power', 10, 1000), 500);
    expect(m.list()).toHaveLength(1);
    expect(m.list()[0]?.expiresAt).toBe(1500);
  });

  it('buffs diferentes de mesmo tipo acumulam magnitude', () => {
    const m = new BuffManager();
    m.apply(makeDef('b1', 'attack-power', 10, 1000), 0);
    m.apply(makeDef('b2', 'attack-power', 5, 1000), 0);
    expect(m.modifier('attack-power')).toBe(15);
  });

  it('respeita limite MAX_ACTIVE_BUFFS', () => {
    const m = new BuffManager();
    for (let i = 0; i < 8; i++) m.apply(makeDef('b' + i, 'attack-power', 1, 1000), 0);
    const r = m.apply(makeDef('b-overflow', 'attack-power', 1, 1000), 0);
    expect(r.applied).toBe(false);
    expect(m.list()).toHaveLength(8);
  });

  it('tick remove expirados', () => {
    const m = new BuffManager();
    m.apply(makeDef('b1', 'attack-power', 10, 1000), 0);
    m.apply(makeDef('b2', 'attack-power', 5, 2000), 0);
    const expired = m.tick(1500);
    expect(expired).toEqual(['b1']);
    expect(m.list()).toHaveLength(1);
  });

  it('modifier soma apenas do tipo pedido', () => {
    const m = new BuffManager();
    m.apply(makeDef('a', 'attack-power', 10, 1000), 0);
    m.apply(makeDef('b', 'crit-chance', 0.1, 1000), 0);
    expect(m.modifier('attack-power')).toBe(10);
    expect(m.modifier('crit-chance')).toBe(0.1);
  });

  it('fromSnapshot ignora expirados', () => {
    const m = BuffManager.fromSnapshot(
      [
        { buffId: asBuffId('b1'), kind: 'attack-power', magnitude: 10, appliedAt: 0, expiresAt: 500 },
        { buffId: asBuffId('b2'), kind: 'attack-power', magnitude: 10, appliedAt: 0, expiresAt: 5000 },
      ],
      1000,
    );
    expect(m.list()).toHaveLength(1);
  });
});
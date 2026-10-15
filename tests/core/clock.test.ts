import { describe, it, expect } from 'vitest';
import { FixedClock, SystemClock } from '../../src/core/clock';

describe('FixedClock', () => {
  it('devolve o valor inicial', () => {
    const clock = new FixedClock(1000);
    expect(clock.now()).toBe(1000);
  });

  it('avanca com advance()', () => {
    const clock = new FixedClock(1000);
    clock.advance(500);
    expect(clock.now()).toBe(1500);
  });

  it('permite definir o tempo com set()', () => {
    const clock = new FixedClock(0);
    clock.set(42);
    expect(clock.now()).toBe(42);
  });
});

describe('SystemClock', () => {
  it('devolve um timestamp razoavel', () => {
    const clock = new SystemClock();
    const t = clock.now();
    expect(typeof t).toBe('number');
    expect(t).toBeGreaterThan(1_500_000_000_000);
  });
});
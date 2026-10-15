/** RNG deterministico (xorshift32). Mesma seed -> mesma sequencia. */
export class SeededRng {
  private state: number;

  constructor(seed: number) {
    const s = (seed >>> 0) || 1;
    this.state = s;
  }

  next(): number {
    let x = this.state;
    x ^= x << 13; x >>>= 0;
    x ^= x >>> 17;
    x ^= x << 5; x >>>= 0;
    this.state = x;
    return this.state / 0x100000000;
  }

  nextInt(minInclusive: number, maxExclusive: number): number {
    if (maxExclusive <= minInclusive) return minInclusive;
    const span = maxExclusive - minInclusive;
    return minInclusive + Math.floor(this.next() * span);
  }

  saveState(): number { return this.state; }
}

/** Deriva uma seed deterministica a partir de (baseSeed, salt). */
export function deriveSeed(baseSeed: number, salt: number): number {
  let h = (baseSeed >>> 0) ^ 0x9E3779B9;
  h = Math.imul(h ^ (salt >>> 0), 0x85EBCA6B);
  h = (h ^ (h >>> 13)) >>> 0;
  return h;
}
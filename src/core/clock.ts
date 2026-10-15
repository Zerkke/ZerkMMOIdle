/**
 * Contrato de relogio. Permite substituir por um relogio fixo nos testes.
 */
export interface GameClock {
  now(): number;
}

export class SystemClock implements GameClock {
  now(): number {
    return Date.now();
  }
}

/** Relogio controlado para testes. */
export class FixedClock implements GameClock {
  private current: number;

  constructor(initialTime = 0) {
    this.current = initialTime;
  }

  now(): number {
    return this.current;
  }

  advance(ms: number): void {
    this.current += ms;
  }

  set(time: number): void {
    this.current = time;
  }
}
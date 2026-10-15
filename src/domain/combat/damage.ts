export interface DamageInput {
  readonly attack: number;
  readonly multiplier: number;
  readonly defense: number;
  readonly critChance: number;
  /** Multiplicador de critico. Default 1.5. */
  readonly critDamageMultiplier?: number;
  /** Reducao de dano percentual (0..100) vinda de DP (2a camada). Opcional. */
  readonly damageReduction?: number | undefined;
  readonly rng: () => number;
}

export interface DamageResult {
  readonly damage: number;
  readonly crit: boolean;
}

export function computeDamage(input: DamageInput): DamageResult {
  const base = input.attack * input.multiplier;
  const mitigation = input.defense / (input.defense + 100);
  const crit = input.rng() < input.critChance;
  const critMult = crit ? (input.critDamageMultiplier ?? 1.5) : 1;
  const drRaw = Math.max(0, Math.min(85, input.damageReduction ?? 0));
  const drMit = drRaw / 100;
  const raw = base * (1 - mitigation) * (1 - drMit) * critMult;
  const damage = Math.max(1, Math.floor(raw));
  return { damage, crit };
}
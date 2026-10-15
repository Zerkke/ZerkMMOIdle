import type { SkillId } from '../ids';
import type { SkillDefinition } from '../content';

export type CombatOutcome = 'ongoing' | 'victory' | 'defeat';
export type CombatStrategy = 'aggressive' | 'balanced' | 'defensive';

export interface CombatState {
  readonly timeMs: number;
  readonly playerHp: number;
  readonly playerResource: number;
  readonly playerNextAttackAt: number;
  readonly playerSkillReadyAt: ReadonlyMap<SkillId, number>;
  readonly monsterHp: number;
  readonly monsterNextAttackAt: number;
  readonly outcome: CombatOutcome;
}

export type CombatEvent =
  | { readonly kind: 'player-basic'; readonly damage: number; readonly crit: boolean }
  | { readonly kind: 'player-skill'; readonly skillId: SkillId; readonly damage: number; readonly heal: number; readonly crit: boolean }
  | { readonly kind: 'monster-basic'; readonly damage: number }
  | { readonly kind: 'victory' }
  | { readonly kind: 'defeat' };

export interface CombatConfig {
  readonly autoMode: boolean;
  readonly useSkills: boolean;
  readonly strategy: CombatStrategy;
  readonly skillPriority: readonly SkillId[];
}

export const DEFAULT_COMBAT_CONFIG: CombatConfig = {
  autoMode: true,
  useSkills: true,
  strategy: 'aggressive',
  skillPriority: [],
};

export interface PlayerCombatInput {
  readonly attack: number;
  readonly defense: number;
  /** Reducao de dano percentual (0..100) derivada de DP. Opcional. */
  readonly damageReduction?: number | undefined;
  readonly critChance: number;
  readonly critDamageMultiplier: number;
  readonly maxHp: number;
  readonly maxResource: number;
  readonly resourceRegenPerSec: number;
    /** Lifesteal (0..1). Cada hit recupera esta fracao do dano causado. Opcional. */
    readonly lifesteal?: number | undefined;
  readonly attackIntervalMs: number;
  readonly skills: readonly SkillDefinition[];
}

export interface MonsterCombatInput {
  readonly attack: number;
  readonly defense: number;
  readonly maxHp: number;
  readonly attackIntervalMs: number;
}

export interface TickInput {
  readonly state: CombatState;
  readonly deltaMs: number;
  readonly player: PlayerCombatInput;
  readonly monster: MonsterCombatInput;
  readonly config: CombatConfig;
  readonly rng: () => number;
}

export interface TickResult {
  readonly state: CombatState;
  readonly events: readonly CombatEvent[];
}
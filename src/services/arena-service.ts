import type { PlayerCombatInput, MonsterCombatInput } from '../domain/combat/types';
import { DEFAULT_COMBAT_CONFIG, newCombatState, tickCombat } from '../domain/combat';
import type {
  ArenaConfig,
  ArenaFightResult,
  ArenaOpponentDef,
  ArenaState,
  ArenaTier,
} from '../domain/arena/types';
import { emptyArenaState } from '../domain/arena/types';
import {
  applyFight,
  applyReset,
  canFight,
  getOpponent,
  tierForRating,
} from '../domain/arena/engine';
import type { FightCheck } from '../domain/arena/engine';

export interface ArenaOpponentView {
  readonly def: ArenaOpponentDef;
  readonly canFight: FightCheck;
  readonly inRange: boolean;
}

export interface ArenaView {
  readonly rating: number;
  readonly peakRating: number;
  readonly tier: ArenaTier;
  readonly fightsToday: number;
  readonly fightsPerDay: number;
  readonly totalWins: number;
  readonly totalLosses: number;
  readonly history: readonly import('../domain/arena/types').ArenaHistoryEntry[];
  readonly opponents: readonly ArenaOpponentView[];
}

export interface ArenaServiceOptions {
  readonly getPlayerCombatInput: () => PlayerCombatInput;
  readonly getSilver: () => number;
  readonly spendSilver: (amount: number) => boolean;
  readonly rng: () => number;
}

const ARENA_SIM_MS = 1_800_000;

export class ArenaService {
  private state: ArenaState;

  constructor(
    private readonly defs: readonly ArenaOpponentDef[],
    private readonly config: ArenaConfig,
    private readonly opts: ArenaServiceOptions,
    initialState: ArenaState = emptyArenaState(),
  ) {
    this.state = initialState;
  }

  getState(): ArenaState { return this.state; }
  setState(state: ArenaState): void { this.state = state; }

  getRating(): number { return this.state.rating; }
  getTier(): ArenaTier { return tierForRating(this.state.rating); }

  buildView(nowMs: number): ArenaView {
    const state = applyReset(this.state, nowMs, this.config);
    const opponents: ArenaOpponentView[] = this.defs.map((def) => {
      const inRange = Math.abs(def.rating - state.rating) <= this.config.ratingRange;
      return {
        def,
        inRange,
        canFight: canFight(state, def, this.opts.getSilver(), nowMs, this.config),
      };
    });
    return {
      rating: state.rating,
      peakRating: state.peakRating,
      tier: tierForRating(state.rating),
      fightsToday: state.fightsToday,
      fightsPerDay: this.config.fightsPerDay,
      totalWins: state.totalWins,
      totalLosses: state.totalLosses,
      history: state.history,
      opponents,
    };
  }

  fight(opponentId: string, nowMs: number): ArenaFightResult | null {
    const state = applyReset(this.state, nowMs, this.config);
    const opponent = getOpponent(this.defs, opponentId);
    if (!opponent) return null;
    const check = canFight(state, opponent, this.opts.getSilver(), nowMs, this.config);
    if (!check.ok) return null;
    if (!this.opts.spendSilver(opponent.entryCost)) return null;

    const player = this.opts.getPlayerCombatInput();
    const monster: MonsterCombatInput = {
      attack: opponent.stats.attack,
      defense: opponent.stats.defense,
      maxHp: opponent.stats.maxHp,
      attackIntervalMs: opponent.stats.attackIntervalMs,
    };
    const combatConfig = { ...DEFAULT_COMBAT_CONFIG, strategy: 'balanced' as const };
    const combatState = newCombatState(nowMs, player, monster);
    const tick = tickCombat({
      state: combatState,
      deltaMs: ARENA_SIM_MS,
      player,
      monster,
      config: combatConfig,
      rng: this.opts.rng,
    });

    const won = tick.state.outcome === 'victory';
    const applied = applyFight({ state, opponent, won, nowMs, config: this.config });
    this.state = applied.state;

    const log: string[] = [];
    let playerDmg = 0;
    let monsterDmg = 0;
    for (const ev of tick.events) {
      if (ev.kind === 'player-basic') playerDmg += ev.damage;
      else if (ev.kind === 'player-skill') playerDmg += ev.damage;
      else if (ev.kind === 'monster-basic') monsterDmg += ev.damage;
    }
    log.push('Dano total causado: ' + playerDmg);
    log.push('Dano total recebido: ' + monsterDmg);
    log.push(won ? 'VITORIA' : 'DERROTA');

    return {
      opponent,
      won,
      rewards: applied.rewards,
      combatLog: log,
    };
  }
}
import type {
  DungeonBestResult,
  DungeonDefinition,
  DungeonRunState,
  DungeonsState,
} from '../domain/dungeons/types';
import { emptyDungeonsState } from '../domain/dungeons/types';
import {
  advanceAfterKill,
  currentWave,
  elapsedMs,
  getBestResult,
  getDungeon,
  hasTimedOut,
  isFirstClear,
  newRun,
  totalMonsters,
  updateBestResult,
  waveSize,
} from '../domain/dungeons/engine';

export interface DungeonView {
  readonly def: DungeonDefinition;
  readonly best: DungeonBestResult | null;
  readonly canStart: { readonly ok: boolean; readonly reason: string | null };
}

export interface DungeonRunView {
  readonly def: DungeonDefinition;
  readonly waveIndex: number;
  readonly totalWaves: number;
  readonly waveLabel: string;
  readonly waveProgress: number;
  readonly waveSize: number;
  readonly monsterId: string;
  readonly totalKills: number;
  readonly totalMonsters: number;
  readonly elapsedMs: number;
  readonly timeLimitMs: number | null;
  readonly remainingMs: number | null;
}

export interface DungeonsServiceOptions {
  readonly getCharacterLevel: () => number;
  readonly getAp: () => number;
  readonly getDp: () => number;
  readonly getSilver: () => number;
  readonly spendSilver: (amount: number) => boolean;
}

export class DungeonsService {
  private state: DungeonsState;
  private defs: readonly DungeonDefinition[];

  constructor(
    defs: readonly DungeonDefinition[],
    private readonly opts: DungeonsServiceOptions,
    initialState: DungeonsState = emptyDungeonsState(),
  ) {
    this.defs = defs;
    this.state = initialState;
  }

  getState(): DungeonsState { return this.state; }
  setState(state: DungeonsState): void { this.state = state; }

  getActive(): { run: DungeonRunState; def: DungeonDefinition } | null {
    if (!this.state.active) return null;
    const def = getDungeon(this.defs, this.state.active.dungeonId);
    if (!def) return null;
    return { run: this.state.active, def };
  }

  isActive(): boolean { return this.state.active !== null; }

  canStart(dungeonId: string): { ok: boolean; reason: string | null } {
    const def = getDungeon(this.defs, dungeonId);
    if (!def) return { ok: false, reason: 'unknown-dungeon' };
    if (this.state.active) return { ok: false, reason: 'already-active' };
    if (this.opts.getCharacterLevel() < def.requiredLevel) return { ok: false, reason: 'level-too-low' };
    if (this.opts.getSilver() < def.entryCost) return { ok: false, reason: 'not-enough-silver' };
    return { ok: true, reason: null };
  }

  start(dungeonId: string, nowMs: number): { ok: boolean; run: DungeonRunState | null; reason: string | null } {
    const check = this.canStart(dungeonId);
    if (!check.ok) return { ok: false, run: null, reason: check.reason };
    const def = getDungeon(this.defs, dungeonId)!;
    if (def.entryCost > 0) {
      if (!this.opts.spendSilver(def.entryCost)) return { ok: false, run: null, reason: 'not-enough-silver' };
    }
    const run = newRun(def, nowMs);
    this.state = { ...this.state, active: run };
    return { ok: true, run, reason: null };
  }

  abandon(): void {
    this.state = { ...this.state, active: null };
  }

  /** Chama depois de uma kill. Devolve info sobre progresso. */
  recordKill(_nowMs: number): {
    readonly waveCleared: boolean;
    readonly dungeonComplete: boolean;
    readonly run: DungeonRunState | null;
    readonly def: DungeonDefinition | null;
  } {
    const active = this.getActive();
    if (!active) return { waveCleared: false, dungeonComplete: false, run: null, def: null };
    const result = advanceAfterKill(active.run, active.def);
    if (result.dungeonComplete) {
      // Nao atualiza results ainda - isso é feito em complete()
      this.state = { ...this.state, active: result.run };
      return { waveCleared: true, dungeonComplete: true, run: result.run, def: active.def };
    }
    this.state = { ...this.state, active: result.run };
    return { waveCleared: result.waveCleared, dungeonComplete: false, run: result.run, def: active.def };
  }

  /** Chama quando o dungeon e concluido. Regista best result e limpa run ativa. */
  complete(nowMs: number): {
    readonly def: DungeonDefinition;
    readonly elapsed: number;
    readonly isFirstClear: boolean;
    readonly best: DungeonBestResult;
  } | null {
    const active = this.getActive();
    if (!active) return null;
    const elapsed = elapsedMs(active.run, nowMs);
    const first = isFirstClear(this.state, active.def.id);
    const newBest = updateBestResult(this.state.results[active.def.id], active.def.id, elapsed, nowMs);
    const results = { ...this.state.results, [active.def.id]: newBest };
    this.state = { ...this.state, active: null, results };
    return { def: active.def, elapsed, isFirstClear: first, best: newBest };
  }

  /** Chama em tick para verificar timeout. Devolve true se expirou. */
  checkTimeout(nowMs: number): boolean {
    const active = this.getActive();
    if (!active) return false;
    if (hasTimedOut(active.run, active.def, nowMs)) {
      this.state = { ...this.state, active: null };
      return true;
    }
    return false;
  }

  buildListView(): readonly DungeonView[] {
    return this.defs.map((def) => ({
      def,
      best: getBestResult(this.state, def.id),
      canStart: this.canStart(def.id),
    }));
  }

  buildRunView(nowMs: number): DungeonRunView | null {
    const active = this.getActive();
    if (!active) return null;
    const wave = currentWave(active.run, active.def);
    if (!wave) return null;
    const size = waveSize(wave);
    const total = totalMonsters(active.def);
    const elapsed = elapsedMs(active.run, nowMs);
    const remaining = active.def.timeLimitMs === null ? null : Math.max(0, active.def.timeLimitMs - elapsed);
    const monsterId = this.getCurrentMonsterId() ?? '';
    return {
      def: active.def,
      waveIndex: active.run.waveIndex + 1,
      totalWaves: active.def.waves.length,
      waveLabel: wave.label,
      waveProgress: active.run.monsterIndex,
      waveSize: size,
      monsterId,
      totalKills: active.run.totalKills,
      totalMonsters: total,
      elapsedMs: elapsed,
      timeLimitMs: active.def.timeLimitMs,
      remainingMs: remaining,
    };
  }

  getCurrentMonsterId(): string | null {
    const active = this.getActive();
    if (!active) return null;
    const wave = currentWave(active.run, active.def);
    if (!wave) return null;
    let idx = active.run.monsterIndex;
    for (const entry of wave.monsters) {
      if (idx < entry.count) return entry.monsterId;
      idx -= entry.count;
    }
    return null;
  }

  getCurrentDungeon(): DungeonDefinition | null {
    const active = this.getActive();
    return active?.def ?? null;
  }
}
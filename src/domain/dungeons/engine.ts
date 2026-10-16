import type {
  DungeonDefinition,
  DungeonBestResult,
  DungeonRunState,
  DungeonsState,
  DungeonWave,
} from './types';

export function newRun(def: DungeonDefinition, nowMs: number): DungeonRunState {
  return {
    dungeonId: def.id,
    startedAt: nowMs,
    waveIndex: 0,
    monsterIndex: 0,
    totalKills: 0,
  };
}

export function currentWave(run: DungeonRunState, def: DungeonDefinition): DungeonWave | null {
  return def.waves[run.waveIndex] ?? null;
}

export function currentMonsterId(run: DungeonRunState, def: DungeonDefinition): string | null {
  const wave = currentWave(run, def);
  if (!wave) return null;
  let idx = run.monsterIndex;
  for (const entry of wave.monsters) {
    if (idx < entry.count) return entry.monsterId;
    idx -= entry.count;
  }
  return null;
}

export function waveSize(wave: DungeonWave): number {
  return wave.monsters.reduce((s, m) => s + m.count, 0);
}

export function totalMonsters(def: DungeonDefinition): number {
  let total = 0;
  for (const w of def.waves) total += waveSize(w);
  return total;
}

export interface AdvanceResult {
  readonly run: DungeonRunState;
  readonly waveCleared: boolean;
  readonly dungeonComplete: boolean;
}

export function advanceAfterKill(run: DungeonRunState, def: DungeonDefinition): AdvanceResult {
  const wave = currentWave(run, def);
  if (!wave) return { run, waveCleared: false, dungeonComplete: true };

  const size = waveSize(wave);
  const nextMonsterIndex = run.monsterIndex + 1;
  const nextTotalKills = run.totalKills + 1;

  if (nextMonsterIndex < size) {
    return {
      run: { ...run, monsterIndex: nextMonsterIndex, totalKills: nextTotalKills },
      waveCleared: false,
      dungeonComplete: false,
    };
  }

  const nextWaveIndex = run.waveIndex + 1;
  if (nextWaveIndex >= def.waves.length) {
    return {
      run: { ...run, waveIndex: nextWaveIndex, monsterIndex: 0, totalKills: nextTotalKills },
      waveCleared: true,
      dungeonComplete: true,
    };
  }

  return {
    run: { ...run, waveIndex: nextWaveIndex, monsterIndex: 0, totalKills: nextTotalKills },
    waveCleared: true,
    dungeonComplete: false,
  };
}

export function elapsedMs(run: DungeonRunState, nowMs: number): number {
  return Math.max(0, nowMs - run.startedAt);
}

export function hasTimedOut(run: DungeonRunState, def: DungeonDefinition, nowMs: number): boolean {
  if (def.timeLimitMs === null) return false;
  return elapsedMs(run, nowMs) > def.timeLimitMs;
}

export function updateBestResult(
  current: DungeonBestResult | undefined,
  dungeonId: string,
  elapsed: number,
  nowMs: number,
): DungeonBestResult {
  const base = current ?? {
    dungeonId,
    completions: 0,
    bestTimeMs: null,
    firstClearedAt: null,
    lastClearedAt: null,
  };
  return {
    dungeonId,
    completions: base.completions + 1,
    bestTimeMs: base.bestTimeMs === null ? elapsed : Math.min(base.bestTimeMs, elapsed),
    firstClearedAt: base.firstClearedAt ?? nowMs,
    lastClearedAt: nowMs,
  };
}

export function getBestResult(state: DungeonsState, dungeonId: string): DungeonBestResult | null {
  return state.results[dungeonId] ?? null;
}

export function isFirstClear(state: DungeonsState, dungeonId: string): boolean {
  const r = state.results[dungeonId];
  return !r || r.firstClearedAt === null;
}

export function validateDungeonConfig(defs: readonly DungeonDefinition[]): readonly string[] {
  const issues: string[] = [];
  const ids = new Set<string>();
  for (const d of defs) {
    if (ids.has(d.id)) issues.push('ID duplicado: ' + d.id);
    ids.add(d.id);
    if (d.waves.length === 0) issues.push(d.id + ': sem waves');
    let hasBoss = false;
    for (let i = 0; i < d.waves.length; i++) {
      const w = d.waves[i]!;
      if (w.monsters.length === 0) issues.push(d.id + ': wave ' + i + ' vazia');
      let waveTotal = 0;
      for (const m of w.monsters) {
        if (m.count < 1) issues.push(d.id + ': wave ' + i + ' com count < 1');
        waveTotal += m.count;
      }
      if (waveTotal < 1) issues.push(d.id + ': wave ' + i + ' sem monstros');
      if (w.isBoss) hasBoss = true;
    }
    if (!hasBoss) issues.push(d.id + ': sem wave de boss');
    if (d.entryCost < 0) issues.push(d.id + ': entryCost negativo');
    if (d.completionSilver < 0) issues.push(d.id + ': completionSilver negativo');
  }
  return issues;
}

export function getDungeon(
  defs: readonly DungeonDefinition[],
  id: string,
): DungeonDefinition | undefined {
  return defs.find((d) => d.id === id);
}
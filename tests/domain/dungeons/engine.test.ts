import { describe, it, expect } from 'vitest';
import {
  advanceAfterKill, currentMonsterId, elapsedMs,
  getBestResult, hasTimedOut, isFirstClear, newRun, totalMonsters, updateBestResult,
  validateDungeonConfig, waveSize,
} from '../../../src/domain/dungeons/engine';
import type { DungeonDefinition } from '../../../src/domain/dungeons/types';
import { DUNGEONS } from '../../../src/data/dungeons.data';
import { emptyDungeonsState } from '../../../src/domain/dungeons/types';

const DEF: DungeonDefinition = {
  id: 'd.test', name: 'T', description: '',
  icon: 'flame', accentColor: '#e8a848',
  requiredLevel: 1, recommendedAp: 0, recommendedDp: 0,
  entryCost: 0, timeLimitMs: null,
  waves: [
    { label: 'W1', isBoss: false, monsters: [{ monsterId: 'a', count: 2 }, { monsterId: 'b', count: 1 }] },
    { label: 'W2', isBoss: true, monsters: [{ monsterId: 'boss', count: 1 }] },
  ],
  completionSilver: 100, completionXp: 50, completionLoot: [], firstClearBonus: null,
};

describe('dungeons engine', () => {
  it('newRun comeca na wave 0, monsterIndex 0', () => {
    const r = newRun(DEF, 1000);
    expect(r.waveIndex).toBe(0);
    expect(r.monsterIndex).toBe(0);
    expect(r.totalKills).toBe(0);
  });

  it('waveSize soma counts', () => {
    expect(waveSize(DEF.waves[0]!)).toBe(3);
  });

  it('totalMonsters soma tudo', () => {
    expect(totalMonsters(DEF)).toBe(4);
  });

  it('currentMonsterId devolve o proximo monstro', () => {
    const r = newRun(DEF, 0);
    expect(currentMonsterId(r, DEF)).toBe('a');
    const r2 = { ...r, monsterIndex: 2 };
    expect(currentMonsterId(r2, DEF)).toBe('b');
    const r3 = { ...r, monsterIndex: 3 };
    expect(currentMonsterId(r3, DEF)).toBeNull();
  });

  it('advanceAfterKill avanca dentro da wave', () => {
    const r = newRun(DEF, 0);
    const r1 = advanceAfterKill(r, DEF);
    expect(r1.run.monsterIndex).toBe(1);
    expect(r1.waveCleared).toBe(false);
    expect(r1.dungeonComplete).toBe(false);
  });

  it('advanceAfterKill avanca de wave quando termina', () => {
    const r = { ...newRun(DEF, 0), monsterIndex: 2 };
    const r1 = advanceAfterKill(r, DEF);
    expect(r1.run.waveIndex).toBe(1);
    expect(r1.run.monsterIndex).toBe(0);
    expect(r1.waveCleared).toBe(true);
    expect(r1.dungeonComplete).toBe(false);
  });

  it('advanceAfterKill completa dungeon na ultima kill', () => {
    const r = { ...newRun(DEF, 0), waveIndex: 1, monsterIndex: 0 };
    const r1 = advanceAfterKill(r, DEF);
    expect(r1.dungeonComplete).toBe(true);
    expect(r1.run.totalKills).toBe(1);
  });

  it('elapsedMs calcula tempo', () => {
    const r = newRun(DEF, 1000);
    expect(elapsedMs(r, 3500)).toBe(2500);
  });

  it('hasTimedOut false sem timeLimit', () => {
    const r = newRun(DEF, 0);
    expect(hasTimedOut(r, DEF, 999999999)).toBe(false);
  });

  it('hasTimedOut true quando excede', () => {
    const def2 = { ...DEF, timeLimitMs: 5000 };
    const r = newRun(def2, 0);
    expect(hasTimedOut(r, def2, 6000)).toBe(true);
  });

  it('updateBestResult guarda melhor tempo e incrementa completions', () => {
    const r1 = updateBestResult(undefined, 'd.test', 5000, 1000);
    expect(r1.completions).toBe(1);
    expect(r1.bestTimeMs).toBe(5000);
    const r2 = updateBestResult(r1, 'd.test', 3000, 2000);
    expect(r2.completions).toBe(2);
    expect(r2.bestTimeMs).toBe(3000);
    const r3 = updateBestResult(r2, 'd.test', 8000, 3000);
    expect(r3.bestTimeMs).toBe(3000);
  });

  it('isFirstClear so true antes de qualquer clear', () => {
    const st = emptyDungeonsState();
    expect(isFirstClear(st, 'x')).toBe(true);
    const st2 = { ...st, results: { x: { dungeonId: 'x', completions: 1, bestTimeMs: 1000, firstClearedAt: 500, lastClearedAt: 500 } } };
    expect(isFirstClear(st2, 'x')).toBe(false);
  });

  it('getBestResult null quando nao existe', () => {
    expect(getBestResult(emptyDungeonsState(), 'x')).toBeNull();
  });

  it('validateDungeonConfig: DUNGEONS reais sao validos', () => {
    expect(validateDungeonConfig(DUNGEONS)).toHaveLength(0);
  });

  it('validateDungeonConfig: sem boss = erro', () => {
    const bad: DungeonDefinition = { ...DEF, waves: [{ label: 'w', isBoss: false, monsters: [{ monsterId: 'a', count: 1 }] }] };
    expect(validateDungeonConfig([bad]).some((i) => i.includes('sem wave de boss'))).toBe(true);
  });

  it('validateDungeonConfig: sem waves = erro', () => {
    const bad: DungeonDefinition = { ...DEF, waves: [] };
    expect(validateDungeonConfig([bad]).some((i) => i.includes('sem waves'))).toBe(true);
  });

  it('dungeons tem 3 definicoes com ids unicos', () => {
    expect(DUNGEONS).toHaveLength(3);
    expect(new Set(DUNGEONS.map((d) => d.id)).size).toBe(3);
  });
});


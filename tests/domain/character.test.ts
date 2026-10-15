import { describe, it, expect } from 'vitest';
import { applyExperience, addSilver, experienceToNextLevel, spendSilver, MAX_LEVEL } from '../../src/domain/character';
import { asClassId } from '../../src/domain/ids';

function makeChar() {
  return {
    id: 'x', name: 'A', classId: asClassId('class.ferrumancer'),
    createdAt: 0, level: 1, experience: 0, silver: 0,
    progressionPoints: 0, hp: 100, resource: 50,
    unlocks: new Set<string>(),
  };
}

describe('applyExperience', () => {
  it('acumula experiencia sem subir', () => {
    const r = applyExperience(makeChar(), 50);
    expect(r.state.experience).toBe(50);
    expect(r.state.level).toBe(1);
    expect(r.leveledUp).toBe(0);
  });

  it('sobe de nivel e acumula pontos', () => {
    const r = applyExperience(makeChar(), 500);
    expect(r.state.level).toBeGreaterThan(1);
    expect(r.leveledUp).toBeGreaterThan(0);
    expect(r.state.progressionPoints).toBe(r.leveledUp * 3);
  });

  it('ignora quantidade negativa', () => {
    const r = applyExperience(makeChar(), -100);
    expect(r.state.experience).toBe(0);
  });

  it('nao passa do nivel maximo', () => {
    const char = { ...makeChar(), level: MAX_LEVEL };
    const r = applyExperience(char, 1_000_000);
    expect(r.state.level).toBe(MAX_LEVEL);
  });
});

describe('silver', () => {
  it('adiciona', () => {
    const c = addSilver(makeChar(), 100);
    expect(c.silver).toBe(100);
  });
  it('gasta apenas se tiver', () => {
    const c = addSilver(makeChar(), 100);
    expect(spendSilver(c, 50)?.silver).toBe(50);
    expect(spendSilver(c, 999)).toBeNull();
  });
});

describe('experienceToNextLevel', () => {
  it('cresce com o nivel', () => {
    expect(experienceToNextLevel(2)).toBeGreaterThan(experienceToNextLevel(1));
  });
});
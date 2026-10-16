import { describe, it, expect } from 'vitest';
import {
  canLearn, getBonuses, getRank, learn, resetTalents, totalPointsSpent, validateTree,
} from '../../../src/domain/talents/engine';
import type { TalentDefinition, TalentState } from '../../../src/domain/talents/types';
import { emptyTalentState } from '../../../src/domain/talents/types';

function makeTalent(overrides: Partial<TalentDefinition> = {}): TalentDefinition {
  return {
    id: 'talent.x', name: 'X', description: '',
    branch: 'offense', icon: 'sword',
    maxRank: 3, requiredCharacterLevel: 1, prerequisites: [],
    costPerRank: [1, 1, 1],
    effect: { kind: 'ap', value: 5 },
    ...overrides,
  };
}

describe('talents engine', () => {
  it('getRank devolve 0 para talento nao investido', () => {
    expect(getRank(emptyTalentState(), 'talent.x')).toBe(0);
  });

  it('canLearn falha em talento inexistente', () => {
    const r = canLearn(emptyTalentState(), 'talent.nope', [makeTalent()], 100, 1);
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('unknown-talent');
  });

  it('canLearn falha com nivel insuficiente', () => {
    const t = makeTalent({ requiredCharacterLevel: 10 });
    const r = canLearn(emptyTalentState(), 'talent.x', [t], 100, 1);
    expect(r.reason).toBe('level-too-low');
  });

  it('canLearn falha sem pontos', () => {
    const r = canLearn(emptyTalentState(), 'talent.x', [makeTalent()], 0, 1);
    expect(r.reason).toBe('not-enough-points');
  });

  it('canLearn falha sem prerequisito', () => {
    const t = makeTalent({ prerequisites: ['talent.y'] });
    const r = canLearn(emptyTalentState(), 'talent.x', [t, makeTalent({ id: 'talent.y' })], 100, 1);
    expect(r.reason).toBe('missing-prerequisite');
  });

  it('learn sobe rank', () => {
    const s = learn(emptyTalentState(), 'talent.x', [makeTalent()], 10, 1);
    expect(s).not.toBeNull();
    expect(getRank(s!, 'talent.x')).toBe(1);
  });

  it('learn respeita maxRank', () => {
    let s: TalentState = emptyTalentState();
    const t = makeTalent({ maxRank: 2, costPerRank: [1, 1] });
    s = learn(s, 'talent.x', [t], 10, 1)!;
    s = learn(s, 'talent.x', [t], 10, 1)!;
    const s3 = learn(s, 'talent.x', [t], 10, 1);
    expect(s3).toBeNull();
  });

  it('totalPointsSpent soma corretamente', () => {
    let s: TalentState = emptyTalentState();
    const t = makeTalent({ maxRank: 3, costPerRank: [1, 2, 3] });
    s = learn(s, 'talent.x', [t], 100, 1)!;
    s = learn(s, 'talent.x', [t], 100, 1)!;
    expect(totalPointsSpent(s, [t])).toBe(3);
  });

  it('resetTalents limpa ranks e incrementa respecCount', () => {
    let s: TalentState = emptyTalentState();
    s = learn(s, 'talent.x', [makeTalent()], 10, 1)!;
    s = resetTalents(s);
    expect(s.ranks).toEqual({});
    expect(s.respecCount).toBe(1);
  });

  it('getBonuses soma multiplos talentos', () => {
    let s: TalentState = emptyTalentState();
    const t1 = makeTalent({ id: 'talent.a', effect: { kind: 'ap', value: 5 } });
    const t2 = makeTalent({ id: 'talent.b', effect: { kind: 'max-hp', value: 20 } });
    s = learn(s, 'talent.a', [t1, t2], 100, 1)!;
    s = learn(s, 'talent.b', [t1, t2], 100, 1)!;
    const b = getBonuses(s, [t1, t2]);
    expect(b.ap).toBe(5);
    expect(b.maxHp).toBe(20);
  });

  it('getBonuses aplica valor * rank', () => {
    let s: TalentState = emptyTalentState();
    const t = makeTalent({ maxRank: 5, costPerRank: [1, 1, 1, 1, 1], effect: { kind: 'ap', value: 3 } });
    s = learn(s, 'talent.x', [t], 100, 1)!;
    s = learn(s, 'talent.x', [t], 100, 1)!;
    s = learn(s, 'talent.x', [t], 100, 1)!;
    expect(getBonuses(s, [t]).ap).toBe(9);
  });

  it('validateTree deteta prerequisito inexistente', () => {
    const t = makeTalent({ prerequisites: ['talent.ghost'] });
    const issues = validateTree([t]);
    expect(issues.some((i) => i.message.includes('inexistente'))).toBe(true);
  });

  it('validateTree deteta ciclo', () => {
    const a = makeTalent({ id: 'a', prerequisites: ['b'] });
    const b = makeTalent({ id: 'b', prerequisites: ['a'] });
    const issues = validateTree([a, b]);
    expect(issues.some((i) => i.message.includes('Ciclo'))).toBe(true);
  });
});
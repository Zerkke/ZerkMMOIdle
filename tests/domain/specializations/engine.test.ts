import { describe, it, expect } from 'vitest';
import {
  applySpecializationModifiers,
  activateSpec,
  checkUnlock,
  deactivateSpec,
  findSpec,
  getActiveSpec,
} from '../../../src/domain/specializations/engine';
import { emptySpecializationState } from '../../../src/domain/specializations/types';
import { SPECIALIZATION_TREE } from '../../../src/data/specializations.data';

const berserker = findSpec(SPECIALIZATION_TREE, 'berserker')!;
const guardian = findSpec(SPECIALIZATION_TREE, 'guardian')!;
const specialist = findSpec(SPECIALIZATION_TREE, 'specialist')!;

const BASE = { maxHp: 1000, maxResource: 100, attack: 100, defense: 50, ap: 200, dp: 100, criticalChance: 0.1, lifesteal: 0, hpRegenPerSec: 0, critDamage: 0, damageReduction: 0, resistances: {} as Record<string, number> };

describe('specializations engine', () => {
  it('findSpec devolve spec valida', () => {
    expect(findSpec(SPECIALIZATION_TREE, 'berserker')).toBeDefined();
    expect(findSpec(SPECIALIZATION_TREE, 'nope')).toBeUndefined();
  });

  it('getActiveSpec null se estado vazio', () => {
    expect(getActiveSpec(SPECIALIZATION_TREE, emptySpecializationState())).toBeNull();
  });

  it('activateSpec define ativa e incrementa changeCount', () => {
    const s = activateSpec(emptySpecializationState(), 'berserker', 1000);
    expect(s.active).toBe('berserker');
    expect(s.changeCount).toBe(1);
    expect(s.lastChangeAt).toBe(1000);
  });

  it('deactivateSpec limpa ativa', () => {
    const s1 = activateSpec(emptySpecializationState(), 'berserker', 1000);
    const s2 = deactivateSpec(s1, 2000);
    expect(s2.active).toBeNull();
    expect(s2.changeCount).toBe(2);
  });

  it('checkUnlock falha com nivel insuficiente', () => {
    const r = checkUnlock(berserker, { characterLevel: 10, getTalentRank: () => 99, activeSpec: null });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('level-too-low');
  });

  it('checkUnlock falha com talento em falta', () => {
    const r = checkUnlock(berserker, { characterLevel: 20, getTalentRank: () => 0, activeSpec: null });
    expect(r.ok).toBe(false);
    expect(r.reason).toBe('missing-talent');
  });

  it('checkUnlock passa com tudo cumprido', () => {
    const r = checkUnlock(berserker, { characterLevel: 20, getTalentRank: () => 99, activeSpec: null });
    expect(r.ok).toBe(true);
  });

  it('checkUnlock falha se ja e a ativa', () => {
    const r = checkUnlock(berserker, { characterLevel: 20, getTalentRank: () => 99, activeSpec: berserker });
    expect(r.reason).toBe('already-active');
  });

  it('Berserker: +AP, -DP, -HP', () => {
    const out = applySpecializationModifiers(BASE, berserker.modifiers);
    expect(out.ap).toBeGreaterThan(BASE.ap);
    expect(out.dp).toBeLessThan(BASE.dp);
    expect(out.maxHp).toBeLessThan(BASE.maxHp);
    expect(out.critDamage).toBeGreaterThan(0);
  });

  it('Guardiao: +DP, +HP, -AP', () => {
    const out = applySpecializationModifiers(BASE, guardian.modifiers);
    expect(out.dp).toBeGreaterThan(BASE.dp);
    expect(out.maxHp).toBeGreaterThan(BASE.maxHp);
    expect(out.ap).toBeLessThan(BASE.ap);
    expect(out.damageReduction).toBeGreaterThan(0);
  });

  it('respeita cap de crit chance', () => {
    const b = { ...BASE, criticalChance: 0.89 };
    const out = applySpecializationModifiers(b, specialist.modifiers);
    expect(out.criticalChance).toBeLessThanOrEqual(0.9);
  });

  it('respeita cap de damageReduction', () => {
    const b = { ...BASE, damageReduction: 88 };
    const out = applySpecializationModifiers(b, guardian.modifiers);
    expect(out.damageReduction).toBeLessThanOrEqual(90);
  });

  it('nao muta o objeto base', () => {
    const snapshot = JSON.stringify(BASE);
    applySpecializationModifiers(BASE, berserker.modifiers);
    expect(JSON.stringify(BASE)).toBe(snapshot);
  });
});
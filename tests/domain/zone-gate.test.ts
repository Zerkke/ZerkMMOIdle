import { describe, it, expect } from 'vitest';
import { computeZoneScaling, checkZoneAccess } from '../../src/domain/zones';

const semReq  = { requiredAp: 0, requiredDp: 0 };
const ferro   = { requiredAp: 60, requiredDp: 35 };
const dragao  = { requiredAp: 180, requiredDp: 120 };

describe('computeZoneScaling — escala de dano por AP/DP', () => {
  it('zona sem requisitos: multiplicadores 1.0', () => {
    const s = computeZoneScaling(0, 0, semReq);
    expect(s.damageDealtMult).toBe(1);
    expect(s.damageTakenMult).toBe(1);
  });

  it('exatamente nos requisitos: ok, tudo 1.0', () => {
    const s = computeZoneScaling(60, 35, ferro);
    expect(s.status).toBe('ok');
    expect(s.damageDealtMult).toBe(1);
    expect(s.damageTakenMult).toBe(1);
  });

  it('metade dos requisitos: dano x0.5 e recebido x2.0', () => {
    const s = computeZoneScaling(30, 17.5, ferro);
    expect(s.damageDealtMult).toBeCloseTo(0.5, 1);
    expect(s.damageTakenMult).toBeCloseTo(2.0, 1);
    expect(s.status).toBe('severely-weak');
  });

  it('AP 1.5x mas DP 1.0x: ratioMedio = 1.0 (o pior manda)', () => {
    const s = computeZoneScaling(90, 35, ferro);
    expect(s.ratioMedio).toBeCloseTo(1.0, 2);
  });

  it('2x requisitos: overpowered', () => {
    const s = computeZoneScaling(120, 70, ferro);
    expect(s.status).toBe('overpowered');
    expect(s.damageDealtMult).toBe(2.0);
    expect(s.damageTakenMult).toBe(0.5);
  });

  it('muito subequipado: caps aplicados (0.4 e 2.5)', () => {
    const s = computeZoneScaling(1, 1, ferro);
    expect(s.damageDealtMult).toBe(0.4);
    expect(s.damageTakenMult).toBe(2.5);
    expect(s.status).toBe('severely-weak');
  });

  it('personagem fraco na zona Dragao: blocked convertido em escala', () => {
    const s = computeZoneScaling(39, 40, dragao);
    expect(s.status).toBe('severely-weak');
    expect(s.damageDealtMult).toBeLessThan(0.5);
    expect(s.damageTakenMult).toBeGreaterThan(2.0);
  });

  it('bem equipado: bonus de dano', () => {
    const s = computeZoneScaling(300, 200, dragao);
    expect(s.status).toBe('strong');
    expect(s.damageDealtMult).toBeGreaterThan(1.2);
    expect(s.damageTakenMult).toBeLessThan(1);
  });

  it('build com essencias pode tornar overpowered', () => {
    const s = computeZoneScaling(500, 350, dragao);
    expect(s.status).toBe('overpowered');
  });
});

describe('checkZoneAccess — nunca bloqueia', () => {
  it('sempre devolve ok mesmo subequipado', () => {
    const r = checkZoneAccess(1, 1, dragao);
    expect(r.ok).toBe(true);
    expect(r.reason).toBeNull();
  });

  it('devolve scaling no resultado', () => {
    const r = checkZoneAccess(60, 35, ferro);
    expect(r.scaling.status).toBe('ok');
  });
});
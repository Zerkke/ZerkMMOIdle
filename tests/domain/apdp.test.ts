import { describe, it, expect } from 'vitest';
import { deriveStats, ZERO_ATTRIBUTES, ZERO_POWER } from '../../src/domain/attributes';
import { BALANCE } from '../../src/data/balance.config';

describe('deriveStats — fonte unica de AP/DP', () => {
  it('com tudo zero, AP/DP sao zero', () => {
    const d = deriveStats(ZERO_ATTRIBUTES, ZERO_POWER);
    expect(d.ap).toBe(0);
    expect(d.dp).toBe(0);
  });

  it('AP = strength * fator + attackPower', () => {
    const C = BALANCE.character;
    const d = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, { attackPower: 20, defensePower: 0 });
    expect(d.ap).toBe(Math.floor(10 * C.apFromStrength) + 20);
  });

  it('DP = vitality * fator + defensePower', () => {
    const C = BALANCE.character;
    const d = deriveStats({ strength: 0, agility: 0, intelligence: 0, vitality: 8 }, { attackPower: 0, defensePower: 15 });
    expect(d.dp).toBe(Math.floor(8 * C.dpFromVitality) + 15);
  });

  it('buffAp adiciona AP antes do scaling', () => {
    const base = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, ZERO_POWER);
    const buffed = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, ZERO_POWER, { buffAp: 15 });
    expect(buffed.ap).toBe(base.ap + 15);
  });

  it('buffDp adiciona DP antes do scaling', () => {
    const base = deriveStats(ZERO_ATTRIBUTES, { attackPower: 0, defensePower: 10 });
    const buffed = deriveStats(ZERO_ATTRIBUTES, { attackPower: 0, defensePower: 10 }, { buffDp: 20 });
    expect(buffed.dp).toBe(base.dp + 20);
  });

  it('apScaling multiplica o AP apos buffs', () => {
    const base = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, ZERO_POWER);
    const scaled = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, ZERO_POWER, { apScaling: 1.15 });
    expect(scaled.ap).toBe(Math.floor(base.ap * 1.15));
  });

  it('dpScaling multiplica o DP apos buffs', () => {
    const base = deriveStats(ZERO_ATTRIBUTES, { attackPower: 0, defensePower: 20 });
    const scaled = deriveStats(ZERO_ATTRIBUTES, { attackPower: 0, defensePower: 20 }, { dpScaling: 0.85 });
    expect(scaled.dp).toBe(Math.floor(base.dp * 0.85));
  });

  it('attack deriva de AP', () => {
    const C = BALANCE.character;
    const d = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, ZERO_POWER);
    const expected = C.attackBase + Math.floor(d.ap * C.attackFromAp);
    expect(d.attack).toBe(expected);
  });

  it('defense deriva de DP', () => {
    const C = BALANCE.character;
    const d = deriveStats(ZERO_ATTRIBUTES, { attackPower: 0, defensePower: 30 });
    const expected = Math.floor(d.dp * C.defenseFromDp);
    expect(d.defense).toBe(expected);
  });

  it('buffAttack soma ao attack final sem mexer em AP', () => {
    const base = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, ZERO_POWER);
    const buffed = deriveStats({ strength: 10, agility: 0, intelligence: 0, vitality: 0 }, ZERO_POWER, { buffAttack: 12 });
    expect(buffed.attack).toBe(base.attack + 12);
    expect(buffed.ap).toBe(base.ap);
  });

  it('extraMaxHp soma ao maxHp', () => {
    const base = deriveStats({ strength: 0, agility: 0, intelligence: 0, vitality: 10 }, ZERO_POWER);
    const ext = deriveStats({ strength: 0, agility: 0, intelligence: 0, vitality: 10 }, ZERO_POWER, { extraMaxHp: 25 });
    expect(ext.maxHp).toBe(base.maxHp + 25);
  });

  it('crit chance respeita o cap', () => {
    const d = deriveStats({ strength: 0, agility: 1000, intelligence: 0, vitality: 0 }, ZERO_POWER);
    expect(d.criticalChance).toBeLessThanOrEqual(BALANCE.combat.maxCritChance);
  });

  it('scaling negativo nao produz AP/DP negativo', () => {
    const d = deriveStats(
      { strength: 100, agility: 0, intelligence: 0, vitality: 100 },
      { attackPower: 1000, defensePower: 1000 },
      { apScaling: -1, dpScaling: -1 },
    );
    expect(d.ap).toBeGreaterThanOrEqual(0);
    expect(d.dp).toBeGreaterThanOrEqual(0);
  });

  it('cada bonus aplicado exatamente uma vez', () => {
    const C = BALANCE.character;
    const buffAp = 10;
    const apScaling = 1.2;
    const d = deriveStats(
      { strength: 5, agility: 0, intelligence: 0, vitality: 0 },
      { attackPower: 8, defensePower: 0 },
      { buffAp, apScaling },
    );
    const expected = Math.floor((Math.floor(5 * C.apFromStrength) + 8 + buffAp) * apScaling);
    expect(d.ap).toBe(expected);
  });
});

describe('especializacao de classe', () => {
  it('Ferrumancer (AP 1.0 / DP 1.1) vs Umbra (AP 1.15 / DP 0.85)', () => {
    const attrs = { strength: 10, agility: 10, intelligence: 4, vitality: 10 };
    const power = { attackPower: 20, defensePower: 20 };
    const ferrumancer = deriveStats(attrs, power, { apScaling: 1.0, dpScaling: 1.1 });
    const umbra = deriveStats(attrs, power, { apScaling: 1.15, dpScaling: 0.85 });
    expect(umbra.ap).toBeGreaterThan(ferrumancer.ap);
    expect(umbra.dp).toBeLessThan(ferrumancer.dp);
  });
});
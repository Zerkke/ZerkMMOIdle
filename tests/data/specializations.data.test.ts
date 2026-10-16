import { describe, it, expect } from 'vitest';
import { SPECIALIZATION_TREE, SPECIALIZATIONS } from '../../src/data/specializations.data';
import { TALENTS } from '../../src/data/talents.data';

describe('specializations data', () => {
  it('tem 5 especializacoes', () => {
    expect(SPECIALIZATIONS).toHaveLength(5);
  });

  it('order bate com specs', () => {
    expect(SPECIALIZATION_TREE.order).toHaveLength(SPECIALIZATIONS.length);
    for (const id of SPECIALIZATION_TREE.order) {
      expect(SPECIALIZATIONS.find((s) => s.id === id)).toBeDefined();
    }
  });

  it('cada spec tem perk e (exceto specialist) drawback', () => {
    for (const s of SPECIALIZATIONS) {
      expect(s.perkLabels.length).toBeGreaterThan(0);
      if (s.id !== 'specialist') expect(s.drawbackLabels.length).toBeGreaterThan(0);
    }
  });

  it('IDs sao unicos', () => {
    const ids = new Set(SPECIALIZATIONS.map((s) => s.id));
    expect(ids.size).toBe(SPECIALIZATIONS.length);
  });

  it('todos os prereqs apontam para talentos existentes', () => {
    const talentIds = new Set(TALENTS.map((t) => t.id));
    for (const s of SPECIALIZATIONS) {
      for (const t of s.unlock.talents) {
        expect(talentIds.has(t.talentId), 'Spec ' + s.id + ' refere talento inexistente: ' + t.talentId).toBe(true);
      }
    }
  });

  it('cada spec tem accent color valida', () => {
    for (const s of SPECIALIZATIONS) {
      expect(s.accentColor).toMatch(/^#[0-9a-f]{6}$/i);
    }
  });
});
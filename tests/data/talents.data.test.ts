import { describe, it, expect } from 'vitest';
import { TALENT_TREE, TALENTS } from '../../src/data/talents.data';
import { validateTree } from '../../src/domain/talents/engine';

describe('talents.data', () => {
  it('TALENT_TREE tem 4 ramos definidos', () => {
    expect(TALENT_TREE.branchOrder).toHaveLength(4);
    expect(TALENT_TREE.branchOrder).toEqual(['offense', 'defense', 'utility', 'sustain']);
  });

  it('todos os ramos tem label e cor', () => {
    for (const b of TALENT_TREE.branchOrder) {
      expect(TALENT_TREE.branchLabels[b]).toBeTruthy();
      expect(TALENT_TREE.branchColors[b]).toMatch(/^#/);
    }
  });

  it('TALENT_TREE nao tem erros de validacao', () => {
    const issues = validateTree(TALENTS);
    if (issues.length > 0) {
      console.error('Issues:', issues);
    }
    expect(issues).toHaveLength(0);
  });

  it('cada ramo tem pelo menos 1 talento', () => {
    for (const b of TALENT_TREE.branchOrder) {
      expect(TALENTS.some((t) => t.branch === b)).toBe(true);
    }
  });

  it('todos os talents tem id namespaced', () => {
    for (const t of TALENTS) {
      expect(t.id.startsWith('talent.ferrumancer.')).toBe(true);
    }
  });

  it('todos os talentos tem costPerRank com tamanho maxRank', () => {
    for (const t of TALENTS) {
      expect(t.costPerRank.length).toBe(t.maxRank);
    }
  });
});
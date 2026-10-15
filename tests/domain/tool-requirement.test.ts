import { describe, it, expect } from 'vitest';
import { evaluateToolRequirement } from '../../src/domain/lifeskill/types';
import type { ToolSnapshot } from '../../src/domain/lifeskill/types';

const PICKAXE: ToolSnapshot = { toolCategory: 'pickaxe', enhancementLevel: 0, durability: 10, maxDurability: 100 };

describe('evaluateToolRequirement', () => {
  it('sem requisito passa sempre', () => {
    const r = evaluateToolRequirement(null, null);
    expect(r.matches).toBe(true);
    expect(r.required).toBeNull();
  });
  it('com requisito e sem ferramenta falha', () => {
    const r = evaluateToolRequirement('pickaxe', null);
    expect(r.matches).toBe(false);
    expect(r.present).toBe(false);
  });
  it('com requisito e ferramenta errada falha', () => {
    const r = evaluateToolRequirement('axe', PICKAXE);
    expect(r.matches).toBe(false);
    expect(r.present).toBe(true);
  });
  it('com requisito e ferramenta certa passa', () => {
    const r = evaluateToolRequirement('pickaxe', PICKAXE);
    expect(r.matches).toBe(true);
  });
});
import { describe, it, expect } from 'vitest';
import { asItemId, asNodeId, asProfessionId, asZoneId } from '../../src/domain/ids';
import { effectiveActionTimeMs, performGatherAction, rollNodeLoot } from '../../src/domain/lifeskill/gathering';
import { addProfessionExperience, masteryYieldMultiplier } from '../../src/domain/lifeskill/profession';
import { validateRecipe, consumeInputs, rollOutputs } from '../../src/domain/lifeskill/production';
import type { GatheringNode, Recipe, ToolSnapshot } from '../../src/domain/lifeskill/types';

const NODE: GatheringNode = {
  id: asNodeId('n.x'), name: 'N', description: '',
  professionId: asProfessionId('profession.mining'),
  zoneId: asZoneId('zone.x'),
  kind: 'gathering',
  requiredTool: 'pickaxe', requiredLevel: 1, baseTimeMs: 2000, baseExp: 10,
  loot: [{ itemId: asItemId('item.ore'), chance: 1.0, minQuantity: 1, maxQuantity: 2 }],
};

const PICKAXE: ToolSnapshot = {
  toolCategory: 'pickaxe', enhancementLevel: 0, durability: 10, maxDurability: 100,
};

function rng01(): () => number {
  let i = 0;
  const seq = [0.5, 0.5];
  return () => seq[i++] ?? 0.5;
}

describe('rollNodeLoot', () => {
  it('devolve sempre com chance=1', () => {
    expect(rollNodeLoot(NODE.loot, () => 0.0, 1)).toHaveLength(1);
  });
  it('nunca devolve com chance=0', () => {
    expect(rollNodeLoot(NODE.loot, () => 0.99, 0)).toHaveLength(0);
  });
});

describe('performGatherAction', () => {
  it('exige ferramenta obrigatoria', () => {
    expect(performGatherAction({ node: NODE, tool: null, mastery: 0, professionLevel: 1, rng: rng01() })).toBeNull();
  });
  it('rejeita ferramenta errada', () => {
    const wrong: ToolSnapshot = { ...PICKAXE, toolCategory: 'axe' };
    expect(performGatherAction({ node: NODE, tool: wrong, mastery: 0, professionLevel: 1, rng: rng01() })).toBeNull();
  });
  it('rejeita ferramenta sem durabilidade', () => {
    const broken: ToolSnapshot = { ...PICKAXE, durability: 0 };
    expect(performGatherAction({ node: NODE, tool: broken, mastery: 0, professionLevel: 1, rng: rng01() })).toBeNull();
  });
  it('sucesso com ferramenta correta', () => {
    const r = performGatherAction({ node: NODE, tool: PICKAXE, mastery: 0, professionLevel: 1, rng: rng01() });
    expect(r).not.toBeNull();
    expect(r?.drops.length).toBeGreaterThan(0);
    expect(r?.durabilityCost).toBe(1);
  });
  it('no sem ferramenta obrigatoria aceita qualquer', () => {
    const freeNode: GatheringNode = { ...NODE, requiredTool: null };
    const r = performGatherAction({ node: freeNode, tool: null, mastery: 0, professionLevel: 1, rng: rng01() });
    expect(r).not.toBeNull();
    expect(r?.durabilityCost).toBe(0);
  });
  it('XP aumenta com nivel', () => {
    const r1 = performGatherAction({ node: NODE, tool: PICKAXE, mastery: 0, professionLevel: 1, rng: rng01() });
    const r10 = performGatherAction({ node: NODE, tool: PICKAXE, mastery: 0, professionLevel: 10, rng: rng01() });
    expect(r10?.expGained).toBeGreaterThan(r1?.expGained ?? 0);
  });
});

describe('effectiveActionTimeMs', () => {
  it('reduz com mastery', () => {
    expect(effectiveActionTimeMs(2000, 100, null)).toBeLessThan(effectiveActionTimeMs(2000, 0, null));
  });
  it('reduz com enhancement da ferramenta', () => {
    expect(effectiveActionTimeMs(2000, 0, { ...PICKAXE, enhancementLevel: 5 }))
      .toBeLessThan(effectiveActionTimeMs(2000, 0, PICKAXE));
  });
  it('nunca abaixo de 200ms', () => {
    expect(effectiveActionTimeMs(100, 1000, { ...PICKAXE, enhancementLevel: 100 })).toBe(200);
  });
});

describe('addProfessionExperience', () => {
  it('acumula sem subir', () => {
    const s = addProfessionExperience({ level: 1, experience: 0, mastery: 0 }, 10, 30, 10);
    expect(s.state.experience).toBe(10);
    expect(s.levelsGained).toBe(0);
  });
  it('sobe e ganha mastery', () => {
    const s = addProfessionExperience({ level: 1, experience: 0, mastery: 0 }, 1000, 30, 10);
    expect(s.state.level).toBeGreaterThan(1);
    expect(s.state.mastery).toBe(s.levelsGained * 10);
  });
  it('nao passa do maximo', () => {
    const s = addProfessionExperience({ level: 30, experience: 0, mastery: 290 }, 1e9, 30, 10);
    expect(s.state.level).toBe(30);
  });
});

describe('masteryYieldMultiplier', () => {
  it('aumenta linearmente', () => {
    expect(masteryYieldMultiplier(0)).toBe(1);
    expect(masteryYieldMultiplier(100)).toBeCloseTo(1.5);
  });
});

const RECIPE: Recipe = {
  id: 'recipe.x' as never, name: 'X', description: '',
  kind: 'crafting',
  professionId: asProfessionId('profession.crafting'),
  requiredLevel: 1,
  inputs: [{ itemId: asItemId('item.a'), quantity: 3 }],
  outputs: [{ itemId: asItemId('item.b'), quantity: 1, chance: 1.0 }],
  silverCost: 10, baseTimeMs: 1000, baseExp: 5, maxBatches: 10,
};

describe('production', () => {
  function bag(items: Record<string, number>) {
    const m = new Map(Object.entries(items));
    return {
      count: (id: ReturnType<typeof asItemId>) => m.get(id as string) ?? 0,
      consume: (id: ReturnType<typeof asItemId>, q: number) => {
        const cur = m.get(id as string) ?? 0;
        if (cur < q) return false;
        m.set(id as string, cur - q);
        return true;
      },
    };
  }
  function wallet(silver: number) {
    let s = silver;
    return { silver: () => s, spendSilver: (n: number) => { if (s < n) return false; s -= n; return true; } };
  }

  it('validateRecipe aceita quando tudo disponivel', () => {
    expect(validateRecipe(RECIPE, 1, bag({ 'item.a': 5 }), wallet(100)).canStart).toBe(true);
  });
  it('validateRecipe rejeita falta de material', () => {
    const r = validateRecipe(RECIPE, 5, bag({ 'item.a': 3 }), wallet(1000));
    expect(r.canStart).toBe(false);
    expect(r.missingInputs.length).toBe(1);
  });
  it('validateRecipe rejeita falta de prata', () => {
    const r = validateRecipe(RECIPE, 5, bag({ 'item.a': 20 }), wallet(0));
    expect(r.canStart).toBe(false);
    expect(r.missingSilver).toBe(50);
  });
  it('validateRecipe rejeita batches invalidos', () => {
    expect(validateRecipe(RECIPE, 0, bag({ 'item.a': 20 }), wallet(1000)).canStart).toBe(false);
    expect(validateRecipe(RECIPE, 100, bag({ 'item.a': 200 }), wallet(10000)).canStart).toBe(false);
  });
  it('consumeInputs retira material e prata', () => {
    const b = bag({ 'item.a': 10 });
    const w = wallet(100);
    expect(consumeInputs(RECIPE, 2, b, w)).toBe(true);
    expect(b.count(asItemId('item.a'))).toBe(4);
    expect(w.silver()).toBe(80);
  });
  it('consumeInputs falha se insuficiente e nao consome', () => {
    const b = bag({ 'item.a': 2 });
    const w = wallet(100);
    expect(consumeInputs(RECIPE, 2, b, w)).toBe(false);
    expect(b.count(asItemId('item.a'))).toBe(2);
    expect(w.silver()).toBe(100);
  });
  it('rollOutputs produz quando chance=1', () => {
    expect(rollOutputs(RECIPE.outputs, 3, () => 0.0, 1)[0]?.quantity).toBe(3);
  });
});
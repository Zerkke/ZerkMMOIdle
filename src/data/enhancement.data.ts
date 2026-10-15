import { asItemId } from '../domain/ids';
import type { EnhancementRule, EnhancementLevelConfig, EnhancementCost, FailureOutcome } from '../domain/enhancement/types';

const ORE = asItemId('item.ore.iron');
const HERB = asItemId('item.herb.mint');

function cost(silver: number, materials: { itemId: typeof ORE; quantity: number }[] = []): EnhancementCost {
  return { silver, materials };
}

function lv(targetLevel: number, successChance: number, silver: number, materials: { itemId: typeof ORE; quantity: number }[] = [], failureOutcome: FailureOutcome = { kind: 'nothing' }): EnhancementLevelConfig {
  return { targetLevel, successChance, cost: cost(silver, materials), failureOutcome };
}

// Arma — primeiros 5 niveis garantidos e baratos, depois fica desafiante
const WEAPON_RULE: EnhancementRule = {
  category: 'weapon',
  maxLevel: 15,
  levels: [
    lv(1, 1.0, 50),
    lv(2, 1.0, 100),
    lv(3, 1.0, 200),
    lv(4, 1.0, 400),
    lv(5, 1.0, 700, [{ itemId: ORE, quantity: 3 }]),
    lv(6, 0.85, 1200, [{ itemId: ORE, quantity: 5 }], { kind: 'downgrade', by: 1 }),
    lv(7, 0.7, 2000, [{ itemId: ORE, quantity: 8 }], { kind: 'downgrade', by: 1 }),
    lv(8, 0.55, 3500, [{ itemId: ORE, quantity: 12 }], { kind: 'downgrade', by: 1 }),
    lv(9, 0.4, 6000, [{ itemId: ORE, quantity: 18 }], { kind: 'downgrade', by: 1 }),
    lv(10, 0.3, 10000, [{ itemId: ORE, quantity: 25 }], { kind: 'downgrade', by: 1 }),
    lv(11, 0.22, 16000, [{ itemId: ORE, quantity: 35 }], { kind: 'destroy' }),
    lv(12, 0.15, 26000, [{ itemId: ORE, quantity: 50 }], { kind: 'destroy' }),
    lv(13, 0.1, 40000, [{ itemId: ORE, quantity: 70 }], { kind: 'destroy' }),
    lv(14, 0.06, 60000, [{ itemId: ORE, quantity: 95 }], { kind: 'destroy' }),
    lv(15, 0.03, 90000, [{ itemId: ORE, quantity: 130 }], { kind: 'destroy' }),
  ],
};

// Armadura — segura, so downgrade
const ARMOR_RULE: EnhancementRule = {
  category: 'armor',
  maxLevel: 15,
  levels: [
    lv(1, 1.0, 40),
    lv(2, 1.0, 80),
    lv(3, 1.0, 160),
    lv(4, 1.0, 320),
    lv(5, 0.95, 600),
    lv(6, 0.9, 1000, [], { kind: 'downgrade', by: 1 }),
    lv(7, 0.8, 1600, [], { kind: 'downgrade', by: 1 }),
    lv(8, 0.65, 2500, [], { kind: 'downgrade', by: 1 }),
    lv(9, 0.5, 4000, [], { kind: 'downgrade', by: 1 }),
    lv(10, 0.38, 6500, [], { kind: 'downgrade', by: 1 }),
    lv(11, 0.28, 10000, [], { kind: 'downgrade', by: 1 }),
    lv(12, 0.2, 16000, [], { kind: 'downgrade', by: 1 }),
    lv(13, 0.14, 25000, [], { kind: 'downgrade', by: 1 }),
    lv(14, 0.09, 40000, [], { kind: 'downgrade', by: 1 }),
    lv(15, 0.05, 60000, [], { kind: 'downgrade', by: 1 }),
  ],
};

// Acessorio — neutro
const ACCESSORY_RULE: EnhancementRule = {
  category: 'accessory',
  maxLevel: 10,
  levels: [
    lv(1, 1.0, 30),
    lv(2, 1.0, 60),
    lv(3, 0.95, 120),
    lv(4, 0.85, 250),
    lv(5, 0.75, 450, [], { kind: 'downgrade', by: 1 }),
    lv(6, 0.6, 800, [], { kind: 'downgrade', by: 1 }),
    lv(7, 0.45, 1400, [], { kind: 'downgrade', by: 2 }),
    lv(8, 0.32, 2400, [], { kind: 'downgrade', by: 2 }),
    lv(9, 0.2, 4000, [], { kind: 'downgrade', by: 2 }),
    lv(10, 0.12, 6500, [], { kind: 'downgrade', by: 2 }),
  ],
};

// Ferramenta — sempre segura
const TOOL_RULE: EnhancementRule = {
  category: 'tool',
  maxLevel: 5,
  levels: [
    lv(1, 1.0, 40, [{ itemId: HERB, quantity: 1 }]),
    lv(2, 0.9, 80, [{ itemId: HERB, quantity: 2 }]),
    lv(3, 0.8, 150, [{ itemId: HERB, quantity: 3 }]),
    lv(4, 0.65, 300, [{ itemId: HERB, quantity: 5 }]),
    lv(5, 0.45, 600, [{ itemId: HERB, quantity: 8 }]),
  ],
};

export const ENHANCEMENT_RULES: readonly EnhancementRule[] = [
  WEAPON_RULE, ARMOR_RULE, ACCESSORY_RULE, TOOL_RULE,
];

export function findRule(category: string): EnhancementRule | undefined {
  return ENHANCEMENT_RULES.find((r) => r.category === category);
}
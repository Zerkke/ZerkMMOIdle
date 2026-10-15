import { asItemId } from '../domain/ids';
import type { EssenceDefinition } from '../domain/essence/types';

/**
 * Definicoes de essencias. Cada essencia tem:
 * - Um item correspondente (categoria 'essence') cujo ID e referenciado aqui.
 * - Um bonus fixo por tier.
 * - Compatibilidade por slot de equipamento.
 * - Limite de stack por item (default 1).
 */
export const ESSENCES: readonly EssenceDefinition[] = [
  // ============ TIER 1 ============
  {
    kind: 'power', tier: 1,
    itemId: asItemId('item.essence.power.t1'),
    name: 'Essencia de Poder T1',
    description: 'Infunde forca ofensiva no equipamento.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'necklace', 'earring1', 'earring2'],
    bonus: { ap: 5, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'vitality', tier: 1,
    itemId: asItemId('item.essence.vitality.t1'),
    name: 'Essencia de Vida T1',
    description: 'Reforca a vitalidade do equipamento.',
    compatibleSlots: ['armor', 'helmet', 'gloves', 'boots', 'offhand', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 20, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'guard', tier: 1,
    itemId: asItemId('item.essence.guard.t1'),
    name: 'Essencia de Guarda T1',
    description: 'Aumenta a defesa do equipamento.',
    compatibleSlots: ['armor', 'helmet', 'gloves', 'boots', 'offhand', 'ring1', 'ring2'],
    bonus: { ap: 0, dp: 5, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'precision', tier: 1,
    itemId: asItemId('item.essence.precision.t1'),
    name: 'Essencia de Precisao T1',
    description: 'Aumenta a chance de critico.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'earring1', 'earring2', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0.01, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'blood', tier: 1,
    itemId: asItemId('item.essence.blood.t1'),
    name: 'Essencia de Sangue T1',
    description: 'Rouba vida ao atacar.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0.02, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'fortune', tier: 1,
    itemId: asItemId('item.essence.fortune.t1'),
    name: 'Essencia de Fortuna T1',
    description: 'Bonus de prata obtida.',
    compatibleSlots: 'any',
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0.03 },
    maxStackPerItem: 1,
  },

  // ============ TIER 2 ============
  {
    kind: 'power', tier: 2,
    itemId: asItemId('item.essence.power.t2'),
    name: 'Essencia de Poder T2',
    description: 'Infunde forca ofensiva superior.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'necklace', 'earring1', 'earring2'],
    bonus: { ap: 12, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'vitality', tier: 2,
    itemId: asItemId('item.essence.vitality.t2'),
    name: 'Essencia de Vida T2',
    description: 'Reforca intensamente a vitalidade.',
    compatibleSlots: ['armor', 'helmet', 'gloves', 'boots', 'offhand', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 50, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'guard', tier: 2,
    itemId: asItemId('item.essence.guard.t2'),
    name: 'Essencia de Guarda T2',
    description: 'Aumenta a defesa significativamente.',
    compatibleSlots: ['armor', 'helmet', 'gloves', 'boots', 'offhand', 'ring1', 'ring2'],
    bonus: { ap: 0, dp: 12, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'precision', tier: 2,
    itemId: asItemId('item.essence.precision.t2'),
    name: 'Essencia de Precisao T2',
    description: 'Aumenta bastante a chance de critico.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'earring1', 'earring2', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0.025, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'blood', tier: 2,
    itemId: asItemId('item.essence.blood.t2'),
    name: 'Essencia de Sangue T2',
    description: 'Rouba mais vida ao atacar.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0.05, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'fortune', tier: 2,
    itemId: asItemId('item.essence.fortune.t2'),
    name: 'Essencia de Fortuna T2',
    description: 'Bonus consideravel de prata obtida.',
    compatibleSlots: 'any',
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0.07 },
    maxStackPerItem: 1,
  },

  // ============ TIER 3 ============
  {
    kind: 'power', tier: 3,
    itemId: asItemId('item.essence.power.t3'),
    name: 'Essencia de Poder T3',
    description: 'Poder ofensivo brutal.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'necklace', 'earring1', 'earring2'],
    bonus: { ap: 25, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'vitality', tier: 3,
    itemId: asItemId('item.essence.vitality.t3'),
    name: 'Essencia de Vida T3',
    description: 'Vitalidade extraordinaria.',
    compatibleSlots: ['armor', 'helmet', 'gloves', 'boots', 'offhand', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 100, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'guard', tier: 3,
    itemId: asItemId('item.essence.guard.t3'),
    name: 'Essencia de Guarda T3',
    description: 'Defesa excecional.',
    compatibleSlots: ['armor', 'helmet', 'gloves', 'boots', 'offhand', 'ring1', 'ring2'],
    bonus: { ap: 0, dp: 25, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'precision', tier: 3,
    itemId: asItemId('item.essence.precision.t3'),
    name: 'Essencia de Precisao T3',
    description: 'Chance de critico muito elevada.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'earring1', 'earring2', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0.04, lifesteal: 0, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'blood', tier: 3,
    itemId: asItemId('item.essence.blood.t3'),
    name: 'Essencia de Sangue T3',
    description: 'Lifesteal poderoso.',
    compatibleSlots: ['weapon', 'ring1', 'ring2', 'necklace'],
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0.1, bonusSilver: 0 },
    maxStackPerItem: 1,
  },
  {
    kind: 'fortune', tier: 3,
    itemId: asItemId('item.essence.fortune.t3'),
    name: 'Essencia de Fortuna T3',
    description: 'Bonus enorme de prata obtida.',
    compatibleSlots: 'any',
    bonus: { ap: 0, dp: 0, maxHp: 0, critChance: 0, lifesteal: 0, bonusSilver: 0.15 },
    maxStackPerItem: 1,
  },
];

export function getEssenceByItemId(itemId: string): EssenceDefinition | undefined {
  return ESSENCES.find((e) => (e.itemId as string) === itemId);
}
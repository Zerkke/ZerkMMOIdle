import { asSkillId } from '../domain/ids';
import type { SkillDefinition } from '../domain/content';

export const DEMO_SKILLS: readonly SkillDefinition[] = [
  // Ferrumancer
  {
    id: asSkillId('skill.ferrumancer.cleave'),
    name: 'Golpe Cortante',
    description: 'Ataque pesado com multiplicador elevado.',
    kind: 'damage', cooldownMs: 3500, resourceCost: 15, multiplier: 2.0, requiredLevel: 1,
  },
  {
    id: asSkillId('skill.ferrumancer.earthshaker'),
    name: 'Rasga-Terra',
    description: 'Investida devastadora.',
    kind: 'damage', cooldownMs: 8000, resourceCost: 30, multiplier: 3.2, requiredLevel: 3,
  },
  {
    id: asSkillId('skill.ferrumancer.rally'),
    name: 'Brado de Ferro',
    description: 'Recupera 30% do HP maximo.',
    kind: 'heal', cooldownMs: 12000, resourceCost: 25, multiplier: 0.3, requiredLevel: 1,
  },

  // Umbra
  {
    id: asSkillId('skill.umbra.shadow-strike'),
    name: 'Golpe Sombrio',
    description: 'Ataque rapido das sombras.',
    kind: 'damage', cooldownMs: 2500, resourceCost: 12, multiplier: 2.2, requiredLevel: 1,
  },
  {
    id: asSkillId('skill.umbra.void-lash'),
    name: 'Chicote do Vazio',
    description: 'Ataque poderoso a longa distancia.',
    kind: 'damage', cooldownMs: 7000, resourceCost: 28, multiplier: 3.4, requiredLevel: 3,
  },
  {
    id: asSkillId('skill.umbra.vanish'),
    name: 'Desvanecer',
    description: 'Recupera 25% do HP maximo.',
    kind: 'heal', cooldownMs: 10000, resourceCost: 22, multiplier: 0.25, requiredLevel: 1,
  },

  // Pyromancer
  {
    id: asSkillId('skill.pyromancer.ember-bolt'),
    name: 'Dardo de Brasa',
    description: 'Projetil ardente com multiplicador magico.',
    kind: 'damage', cooldownMs: 2200, resourceCost: 14, multiplier: 2.4, requiredLevel: 1,
  },
  {
    id: asSkillId('skill.pyromancer.inferno'),
    name: 'Inferno',
    description: 'Explosao de fogo devastadora.',
    kind: 'damage', cooldownMs: 9000, resourceCost: 35, multiplier: 3.8, requiredLevel: 3,
  },
  {
    id: asSkillId('skill.pyromancer.flame-shield'),
    name: 'Escudo de Chamas',
    description: 'Regenera HP ao longo do tempo.',
    kind: 'heal', cooldownMs: 11000, resourceCost: 24, multiplier: 0.28, requiredLevel: 1,
  },
];
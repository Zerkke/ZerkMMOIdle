import { asClassId, asSkillId } from '../domain/ids';
import type { CharacterClass } from '../domain/content';

export const DEMO_CLASSES: readonly CharacterClass[] = [
  {
    id: asClassId('class.ferrumancer'),
    name: 'Ferrumancer',
    description: 'Guerreiro que canaliza forca bruta em ataques pesados.',
    baseHp: 200, baseResource: 80, resourceName: 'Furia',
    attributes: { strength: 12, agility: 6, intelligence: 4, vitality: 10 },
    skillIds: [
      asSkillId('skill.ferrumancer.cleave'),
      asSkillId('skill.ferrumancer.earthshaker'),
      asSkillId('skill.ferrumancer.rally'),
    ],
    apScaling: 1.0,
    dpScaling: 1.1,
  },
  {
    id: asClassId('class.umbra'),
    name: 'Umbra',
    description: 'Assassino agil que ataca pelas sombras.',
    baseHp: 140, baseResource: 100, resourceName: 'Sombra',
    attributes: { strength: 6, agility: 12, intelligence: 6, vitality: 6 },
    skillIds: [
      asSkillId('skill.umbra.shadow-strike'),
      asSkillId('skill.umbra.void-lash'),
      asSkillId('skill.umbra.vanish'),
    ],
    apScaling: 1.15,
    dpScaling: 0.85,
  },
  {
    id: asClassId('class.pyromancer'),
    name: 'Pyromancer',
    description: 'Mago que domina o fogo elementar.',
    baseHp: 150, baseResource: 120, resourceName: 'Mana',
    attributes: { strength: 4, agility: 6, intelligence: 14, vitality: 6 },
    skillIds: [
      asSkillId('skill.pyromancer.ember-bolt'),
      asSkillId('skill.pyromancer.inferno'),
      asSkillId('skill.pyromancer.flame-shield'),
    ],
    apScaling: 1.2,
    dpScaling: 0.75,
  },
];
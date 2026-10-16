import type { SpecializationDefinition, SpecializationTreeDef } from '../domain/specializations/types';

export const SPECIALIZATION_TREE: SpecializationTreeDef = {
  order: ['berserker', 'guardian', 'arcanist', 'bloodlord', 'specialist'],
  specs: [
    {
      id: 'berserker',
      name: 'Berserker',
      description: 'Guerreiro que troca defesa por dano brutal.',
      lore: 'Sobrepoderoso no ataque, fragil na defesa.',
      icon: 'flame',
      accentColor: '#e8503a',
      unlock: {
        characterLevel: 15,
        talents: [
          { talentId: 'talent.ferrumancer.ferocity', minRank: 3 },
          { talentId: 'talent.ferrumancer.execution', minRank: 2 },
        ],
      },
      modifiers: {
        apMultiplier: 1.20,
        hpMultiplier: 0.90,
        dpMultiplier: 0.75,
        critDamageBonus: 0.30,
      },
      perkLabels: ['+20% AP', '+30% dano critico'],
      drawbackLabels: ['-25% DP', '-10% HP maximo'],
    },
    {
      id: 'guardian',
      name: 'Guardiao',
      description: 'Muralha viva. Reduz dano e sobrevive a tudo.',
      lore: 'Aguenta o que ninguem aguenta.',
      icon: 'shield',
      accentColor: '#6a9ad8',
      unlock: {
        characterLevel: 15,
        talents: [
          { talentId: 'talent.ferrumancer.iron-skin', minRank: 3 },
          { talentId: 'talent.ferrumancer.vigor', minRank: 3 },
        ],
      },
      modifiers: {
        dpMultiplier: 1.30,
        hpMultiplier: 1.25,
        damageReductionBonus: 5,
        apMultiplier: 0.85,
        attackMultiplier: 0.85,
      },
      perkLabels: ['+30% DP', '+25% HP maximo', '+5% reducao de dano'],
      drawbackLabels: ['-15% AP', '-15% ataque'],
    },
    {
      id: 'arcanist',
      name: 'Arcanista',
      description: 'Canaliza poder magico em gestao de recursos.',
      lore: 'Mais mana, mais impacto, menos corpo.',
      icon: 'book',
      accentColor: '#a86ec8',
      unlock: {
        characterLevel: 15,
        talents: [
          { talentId: 'talent.ferrumancer.ferocity', minRank: 2 },
          { talentId: 'talent.ferrumancer.field-wisdom', minRank: 2 },
        ],
      },
      modifiers: {
        apMultiplier: 1.10,
        resourceMultiplier: 1.50,
        hpMultiplier: 0.85,
        dpMultiplier: 0.85,
      },
      perkLabels: ['+10% AP', '+50% recurso', 'Skill mais frequentes'],
      drawbackLabels: ['-15% HP maximo', '-15% DP'],
    },
    {
      id: 'bloodlord',
      name: 'Sanguinario',
      description: 'Recupera a vida que tira.',
      lore: 'Cada golpe alimenta o portador.',
      icon: 'droplet',
      accentColor: '#c84060',
      unlock: {
        characterLevel: 15,
        talents: [
          { talentId: 'talent.ferrumancer.bloodlust', minRank: 2 },
          { talentId: 'talent.ferrumancer.regeneration', minRank: 2 },
        ],
      },
      modifiers: {
        lifestealBonus: 0.06,
        hpRegenBonus: 3,
        apMultiplier: 0.90,
        hpMultiplier: 0.90,
      },
      perkLabels: ['+6% lifesteal', '+3 HP/s'],
      drawbackLabels: ['-10% AP', '-10% HP maximo'],
    },
    {
      id: 'specialist',
      name: 'Especialista',
      description: 'Tudo ligeiramente melhor. Sem risco, sem brilho.',
      lore: 'A escolha segura para quem ainda procura.',
      icon: 'sparkles',
      accentColor: '#6ab87a',
      unlock: {
        characterLevel: 20,
        talents: [],
      },
      modifiers: {
        apMultiplier: 1.05,
        dpMultiplier: 1.05,
        critChanceBonus: 0.02,
        xpBonus: 0.05,
        silverBonus: 0.05,
      },
      perkLabels: ['+5% AP e DP', '+2% critico', '+5% XP e prata'],
      drawbackLabels: [],
    },
  ],
};

export const SPECIALIZATIONS: readonly SpecializationDefinition[] = SPECIALIZATION_TREE.specs;
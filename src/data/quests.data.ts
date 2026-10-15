import { asItemId, asQuestId } from '../domain/ids';
import type { QuestDefinition } from '../domain/quests/types';

export const QUESTS: readonly QuestDefinition[] = [
  // 1. Tutorial de combate
  {
    id: asQuestId('quest.first-steps'),
    name: 'Primeiros Passos',
    description: 'Elimina 3 gosmas no Vale das Cinzas para ganhares confianca em combate.',
    category: 'main',
    requiredLevel: 1,
    prerequisiteQuestId: null,
    objectives: [
      { id: 'o1', kind: 'kill-monster', targetId: null, targetCount: 3, description: 'Elimina 3 monstros' },
    ],
    rewardSilver: 50,
    rewardXp: 30,
    rewardItems: [],
  },

  // 2. Introducao a mineracao
  {
    id: asQuestId('quest.miners-calling'),
    name: 'O Chamado do Mineiro',
    description: 'Recolhe minerio de ferro para comecares a forjar o teu equipamento.',
    category: 'main',
    requiredLevel: 1,
    prerequisiteQuestId: asQuestId('quest.first-steps'),
    objectives: [
      { id: 'o1', kind: 'gather-node', targetId: null, targetCount: 10, description: 'Recolhe 10 recursos' },
    ],
    rewardSilver: 80,
    rewardXp: 50,
    rewardItems: [{ itemId: asItemId('item.tool.pickaxe'), quantity: 1 }],
  },

  // 3. Primeira barra
  {
    id: asQuestId('quest.blacksmith-apprentice'),
    name: 'Aprendiz de Ferreiro',
    description: 'Funde 3 barras de ferro para provares as tuas capacidades de processamento.',
    category: 'main',
    requiredLevel: 1,
    prerequisiteQuestId: asQuestId('quest.miners-calling'),
    objectives: [
      { id: 'o1', kind: 'craft-recipe', targetId: 'recipe.iron-ingot', targetCount: 3, description: 'Produz 3 barras de ferro' },
    ],
    rewardSilver: 120,
    rewardXp: 80,
    rewardItems: [],
  },

  // 4. Forjar arma
  {
    id: asQuestId('quest.valley-sword'),
    name: 'Espada do Vale',
    description: 'Forja a tua propria Espada Curta.',
    category: 'main',
    requiredLevel: 2,
    prerequisiteQuestId: asQuestId('quest.blacksmith-apprentice'),
    objectives: [
      { id: 'o1', kind: 'craft-recipe', targetId: 'recipe.short-sword', targetCount: 1, description: 'Produz 1 Espada Curta' },
    ],
    rewardSilver: 150,
    rewardXp: 100,
    rewardItems: [],
  },

  // 5. Caca
  {
    id: asQuestId('quest.wolf-hunter'),
    name: 'Cacador de Lobos',
    description: 'Os Lobos de Cinzas tornaram-se um problema. Elimina 5.',
    category: 'side',
    requiredLevel: 3,
    prerequisiteQuestId: asQuestId('quest.first-steps'),
    objectives: [
      { id: 'o1', kind: 'kill-monster', targetId: null, targetCount: 5, description: 'Elimina 5 monstros' },
    ],
    rewardSilver: 100,
    rewardXp: 80,
    rewardItems: [{ itemId: asItemId('item.potion.small'), quantity: 5 }],
  },

  // 6. Agricultura
  {
    id: asQuestId('quest.farm-life'),
    name: 'Vida no Campo',
    description: 'Planta e colhe uma cultura para aprenderes agricultura.',
    category: 'side',
    requiredLevel: 1,
    prerequisiteQuestId: null,
    objectives: [
      { id: 'o1', kind: 'plant-crop', targetId: null, targetCount: 1, description: 'Planta uma semente' },
      { id: 'o2', kind: 'harvest-crop', targetId: null, targetCount: 1, description: 'Colhe uma cultura' },
    ],
    rewardSilver: 100,
    rewardXp: 70,
    rewardItems: [{ itemId: asItemId('item.seed.wheat'), quantity: 5 }],
  },

  // 7. Alquimia
  {
    id: asQuestId('quest.chemistry-101'),
    name: 'Licao de Alquimia',
    description: 'Prepara 3 Pocoes Menores para te preparares para os desafios futuros.',
    category: 'side',
    requiredLevel: 2,
    prerequisiteQuestId: asQuestId('quest.blacksmith-apprentice'),
    objectives: [
      { id: 'o1', kind: 'craft-recipe', targetId: 'recipe.potion-small', targetCount: 3, description: 'Produz 3 Pocoes Menores' },
    ],
    rewardSilver: 80,
    rewardXp: 60,
    rewardItems: [],
  },

  // 8. Melhoramento
  {
    id: asQuestId('quest.steel-yourself'),
    name: 'Aco Reforcado',
    description: 'Melhora um equipamento ate +3 para aumentares o teu poder de combate.',
    category: 'main',
    requiredLevel: 3,
    prerequisiteQuestId: asQuestId('quest.valley-sword'),
    objectives: [
      { id: 'o1', kind: 'enhance-level', targetId: null, targetCount: 1, description: 'Melhora um item com sucesso' },
      { id: 'o2', kind: 'enhance-level', targetId: null, targetCount: 1, description: 'Melhora um item com sucesso' },
      { id: 'o3', kind: 'enhance-level', targetId: null, targetCount: 1, description: 'Melhora um item com sucesso' },
    ],
    rewardSilver: 200,
    rewardXp: 150,
    rewardItems: [],
  },

  // 9. Chegar nivel 5
  {
    id: asQuestId('quest.beyond-valley'),
    name: 'Alem do Vale',
    description: 'Alcanca o nivel 5 para desbloqueares a entrada nas Cavernas de Cristal.',
    category: 'main',
    requiredLevel: 1,
    prerequisiteQuestId: asQuestId('quest.first-steps'),
    objectives: [
      { id: 'o1', kind: 'reach-level', targetId: null, targetCount: 1, description: 'Alcanca nivel 5' },
    ],
    rewardSilver: 250,
    rewardXp: 200,
    rewardItems: [],
  },

  // 10. Inimigos avancados
  {
    id: asQuestId('quest.golem-breaker'),
    name: 'Quebra-Golems',
    description: 'Entra nas Cavernas de Cristal e elimina 10 Golens de Pedra.',
    category: 'main',
    requiredLevel: 5,
    prerequisiteQuestId: asQuestId('quest.beyond-valley'),
    objectives: [
      { id: 'o1', kind: 'enter-zone', targetId: 'zone.crystal-caverns', targetCount: 1, description: 'Entra nas Cavernas de Cristal' },
      { id: 'o2', kind: 'kill-monster', targetId: null, targetCount: 10, description: 'Elimina 10 monstros' },
    ],
    rewardSilver: 500,
    rewardXp: 400,
    rewardItems: [{ itemId: asItemId('item.weapon.iron-greatsword'), quantity: 1 }],
  },
];
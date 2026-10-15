import { asProfessionId } from '../domain/ids';
import type { ProfessionDefinition } from '../domain/lifeskill/types';

export const DEMO_PROFESSIONS: readonly ProfessionDefinition[] = [
  { id: asProfessionId('profession.mining'), name: 'Mineracao', description: 'Extrai minerios.', maxLevel: 30, masteryPerLevel: 10 },
  { id: asProfessionId('profession.woodcutting'), name: 'Corte de Madeira', description: 'Recolhe madeira.', maxLevel: 30, masteryPerLevel: 10 },
  { id: asProfessionId('profession.herbalism'), name: 'Herbalismo', description: 'Recolhe ervas.', maxLevel: 30, masteryPerLevel: 10 },
  { id: asProfessionId('profession.agriculture'), name: 'Agricultura', description: 'Cultiva parcelas.', maxLevel: 30, masteryPerLevel: 10 },
  { id: asProfessionId('profession.fishing'), name: 'Pesca', description: 'Pesca em locais de agua.', maxLevel: 30, masteryPerLevel: 10 },
  { id: asProfessionId('profession.hunting'), name: 'Caca', description: 'Caca animais e esfola.', maxLevel: 30, masteryPerLevel: 10 },
  { id: asProfessionId('profession.processing'), name: 'Processamento', description: 'Refina materiais.', maxLevel: 30, masteryPerLevel: 8 },
  { id: asProfessionId('profession.crafting'), name: 'Crafting', description: 'Fabrica equipamento.', maxLevel: 30, masteryPerLevel: 8 },
  { id: asProfessionId('profession.cooking'), name: 'Cozinha', description: 'Prepara comida.', maxLevel: 30, masteryPerLevel: 8 },
  { id: asProfessionId('profession.alchemy'), name: 'Alquimia', description: 'Destila pocoes.', maxLevel: 30, masteryPerLevel: 8 },
];
import { asBuffId, asItemId } from '../domain/ids';
import type { BuffDefinition } from '../domain/buff/types';

export const DEMO_BUFFS: readonly BuffDefinition[] = [
  { id: asBuffId('buff.potion.hp-small'), name: 'Pocao Menor', description: 'Recupera 20 HP/s.', kind: 'hp-regen', magnitude: 20, durationMs: 5000, sourceItemId: asItemId('item.potion.small') },
  { id: asBuffId('buff.potion.resource-small'), name: 'Pocao de Foco', description: 'Recupera 10 recurso/s.', kind: 'resource-regen', magnitude: 10, durationMs: 5000, sourceItemId: asItemId('item.potion.mana') },
  { id: asBuffId('buff.food.attack'), name: 'Guisado Forte', description: '+15 ataque efetivo.', kind: 'attack-power', magnitude: 15, durationMs: 60000, sourceItemId: asItemId('item.food.stew') },
  { id: asBuffId('buff.food.gather-speed'), name: 'Refeicao Rapida', description: '-15% tempo de recolha.', kind: 'gather-speed', magnitude: 0.15, durationMs: 60000, sourceItemId: asItemId('item.food.bread') },
  { id: asBuffId('buff.elixir.craft-speed'), name: 'Mente de Oficio', description: '-20% tempo de processamento.', kind: 'craft-speed', magnitude: 0.2, durationMs: 60000, sourceItemId: asItemId('item.elixir.processing') },
  { id: asBuffId('buff.elixir.crit'), name: 'Precisao', description: '+10% critico.', kind: 'crit-chance', magnitude: 0.10, durationMs: 45000, sourceItemId: asItemId('item.elixir.crit') },
  { id: asBuffId('buff.elixir.ap'), name: 'Poder Marcial', description: '+15 AP durante 60s.', kind: 'ap-bonus', magnitude: 15, durationMs: 60000, sourceItemId: asItemId('item.elixir.ap') },
  { id: asBuffId('buff.elixir.dp'), name: 'Guarda de Ferro', description: '+15 DP durante 60s.', kind: 'dp-bonus', magnitude: 15, durationMs: 60000, sourceItemId: asItemId('item.elixir.dp') },
];
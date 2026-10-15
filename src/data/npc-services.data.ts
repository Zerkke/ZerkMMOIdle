import { asItemId, asZoneId } from '../domain/ids';
import type { ItemId, ZoneId } from '../domain/ids';

export type NpcServiceKind = 'heal-hp' | 'heal-resource' | 'repair-tool' | 'buy-item';

export interface NpcServiceDefinition {
  readonly id: string;
  readonly zoneId: ZoneId;
  readonly vendorName: string;
  readonly name: string;
  readonly description: string;
  readonly kind: NpcServiceKind;
  readonly costPerUnit: number;
  readonly itemId: ItemId | null;
}

export const NPC_SERVICES: readonly NpcServiceDefinition[] = [
  {
    id: 'service.taberneiro.heal',
    zoneId: asZoneId('zone.village'),
    vendorName: 'Taberneiro',
    name: 'Refeicao quente',
    description: 'Restaura o HP ao maximo.',
    kind: 'heal-hp',
    costPerUnit: 1,
    itemId: null,
  },
  {
    id: 'service.taberneiro.recover',
    zoneId: asZoneId('zone.village'),
    vendorName: 'Taberneiro',
    name: 'Descanso',
    description: 'Recupera o recurso de classe ao maximo.',
    kind: 'heal-resource',
    costPerUnit: 2,
    itemId: null,
  },
  {
    id: 'service.ferreiro.repair',
    zoneId: asZoneId('zone.village'),
    vendorName: 'Ferreiro',
    name: 'Reparar ferramenta',
    description: 'Restaura a durabilidade da ferramenta equipada.',
    kind: 'repair-tool',
    costPerUnit: 2,
    itemId: null,
  },
  {
    id: 'service.mercador.potion',
    zoneId: asZoneId('zone.village'),
    vendorName: 'Boticario',
    name: 'Pocao de HP',
    description: 'Compra 1 pocao por 30 prata.',
    kind: 'buy-item',
    costPerUnit: 30,
    itemId: asItemId('item.potion.small'),
  },
];

export function findServicesInZone(zoneId: ZoneId): readonly NpcServiceDefinition[] {
  return NPC_SERVICES.filter((s) => s.zoneId === zoneId);
}
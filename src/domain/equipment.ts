import type { ItemStack } from './item-instance';

export type EquipmentSlotId =
  | 'weapon' | 'offhand'
  | 'helmet' | 'armor' | 'gloves' | 'boots'
  | 'ring1' | 'ring2'
  | 'earring1' | 'earring2'
  | 'necklace'
  | 'tool';

export interface EquipSlotDefinition {
  readonly id: EquipmentSlotId;
  readonly label: string;
  readonly pairId: EquipmentSlotId | null;
}

export const EQUIP_SLOTS: readonly EquipSlotDefinition[] = [
  { id: 'weapon', label: 'Arma', pairId: null },
  { id: 'offhand', label: 'Mao secundaria', pairId: null },
  { id: 'helmet', label: 'Elmo', pairId: null },
  { id: 'armor', label: 'Peitoral', pairId: null },
  { id: 'gloves', label: 'Luvas', pairId: null },
  { id: 'boots', label: 'Botas', pairId: null },
  { id: 'ring1', label: 'Anel 1', pairId: 'ring2' },
  { id: 'ring2', label: 'Anel 2', pairId: 'ring1' },
  { id: 'earring1', label: 'Brinco 1', pairId: 'earring2' },
  { id: 'earring2', label: 'Brinco 2', pairId: 'earring1' },
  { id: 'necklace', label: 'Colar', pairId: null },
  { id: 'tool', label: 'Ferramenta', pairId: null },
];

export type EquipmentState = ReadonlyMap<EquipmentSlotId, ItemStack>;

export function emptyEquipment(): EquipmentState { return new Map(); }

export type EquipError = 'slot-occupied' | 'slot-empty' | 'slot-mismatch';

export class Equipment {
  private readonly slots: Map<EquipmentSlotId, ItemStack>;

  constructor(initial: EquipmentState = new Map()) {
    this.slots = new Map();
    for (const [k, v] of initial) this.slots.set(k, { ...v });
  }

  equip(slotId: EquipmentSlotId, stack: ItemStack): EquipError | null {
    if (this.slots.has(slotId)) return 'slot-occupied';
    this.slots.set(slotId, { ...stack });
    return null;
  }

  unequip(slotId: EquipmentSlotId): ItemStack | null {
    const item = this.slots.get(slotId);
    if (!item) return null;
    this.slots.delete(slotId);
    return { ...item };
  }

  get(slotId: EquipmentSlotId): ItemStack | undefined {
    const s = this.slots.get(slotId);
    return s ? { ...s } : undefined;
  }

  setSlot(slotId: EquipmentSlotId, stack: ItemStack): void {
    this.slots.set(slotId, { ...stack });
  }

  list(): EquipmentState { return new Map(this.slots); }

  clear(): void { this.slots.clear(); }
}
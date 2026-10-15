import type { ClassId, ItemId } from './ids';

/* ---------- Inventario ---------- */

export interface InventorySlot {
  readonly itemId: ItemId;
  readonly quantity: number;
}

export interface Inventory {
  add(itemId: ItemId, quantity: number): number;
  remove(itemId: ItemId, quantity: number): number;
  count(itemId: ItemId): number;
  list(): readonly InventorySlot[];
  capacity(): number;
  usedSlots(): number;
}

/* ---------- Progressao ---------- */

export interface Progression {
  level(): number;
  experience(): number;
  experienceToNext(): number;
  silver(): number;
  addExperience(amount: number): void;
  addSilver(amount: number): void;
  spendSilver(amount: number): boolean;
}

/* ---------- Personagem ---------- */

export interface CharacterIdentity {
  readonly name: string;
  readonly classId: ClassId;
  readonly createdAt: number;
}

export interface CharacterVitals {
  readonly hp: { current: number; max: number };
  readonly resource: { current: number; max: number; name: string };
  readonly attack: number;
  readonly defense: number;
}
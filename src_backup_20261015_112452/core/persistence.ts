/**
 * Contrato de persistencia. As implementacoes concretas (IndexedDB)
 * serao adicionadas numa fase futura. Esta fase usa uma versao em memoria.
 */
export interface SaveSlot {
  readonly id: string;
  readonly schemaVersion: number;
  readonly updatedAt: number;
  readonly payload: unknown;
}

export interface Persistence {
  save(slot: SaveSlot): Promise<void>;
  load(id: string): Promise<SaveSlot | null>;
  list(): Promise<readonly string[]>;
  remove(id: string): Promise<void>;
}

export class InMemoryPersistence implements Persistence {
  private readonly slots = new Map<string, SaveSlot>();

  async save(slot: SaveSlot): Promise<void> {
    this.slots.set(slot.id, slot);
  }

  async load(id: string): Promise<SaveSlot | null> {
    return this.slots.get(id) ?? null;
  }

  async list(): Promise<readonly string[]> {
    return Array.from(this.slots.keys());
  }

  async remove(id: string): Promise<void> {
    this.slots.delete(id);
  }
}
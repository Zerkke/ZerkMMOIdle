import type { Persistence, SaveSlot } from '../core/persistence';
import type { SaveLatest } from './save-schema';
import { SAVE_SCHEMA_VERSION, emptySave } from './save-schema';
import { migrateToLatest, SaveParseError } from './save-migrations';

export const DEFAULT_SLOT = 'default';

export class SaveBusyError extends Error {
  constructor() {
    super('Ja existe uma operacao de save em curso.');
    this.name = 'SaveBusyError';
  }
}

export class SaveManager {
  private inFlight = false;

  constructor(private readonly persistence: Persistence) {}

  private async withLock<T>(fn: () => Promise<T>): Promise<T> {
    if (this.inFlight) throw new SaveBusyError();
    this.inFlight = true;
    try {
      return await fn();
    } finally {
      this.inFlight = false;
    }
  }

  async save(save: SaveLatest, slotId: string = DEFAULT_SLOT): Promise<void> {
    return this.withLock(async () => {
      const slot: SaveSlot = {
        id: slotId,
        schemaVersion: SAVE_SCHEMA_VERSION,
        updatedAt: save.savedAt,
        payload: save,
      };
      await this.persistence.save(slot);
    });
  }

  async load(slotId: string = DEFAULT_SLOT): Promise<SaveLatest | null> {
    return this.withLock(async () => {
      const slot = await this.persistence.load(slotId);
      if (!slot) return null;
      try {
        return migrateToLatest(slot.payload);
      } catch (error) {
        if (error instanceof SaveParseError) {
          throw error;
        }
        throw new SaveParseError('Save corrompido.');
      }
    });
  }

  async loadOrCreateDefault(slotId: string = DEFAULT_SLOT): Promise<SaveLatest> {
    const existing = await this.load(slotId);
    if (existing) return existing;
    const fresh = emptySave(Date.now());
    await this.save(fresh, slotId);
    return fresh;
  }

  async remove(slotId: string = DEFAULT_SLOT): Promise<void> {
    return this.withLock(async () => {
      await this.persistence.remove(slotId);
    });
  }

  async list(): Promise<readonly string[]> {
    return this.persistence.list();
  }
}
import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { Persistence, SaveSlot } from '../core/persistence';

interface ZerkDb extends DBSchema {
  saves: {
    key: string;
    value: SaveSlot;
  };
}

const DB_NAME = 'zerk-idle';
const DB_VERSION = 1;
const STORE = 'saves';

export class IndexedDbPersistence implements Persistence {
  private dbPromise: Promise<IDBPDatabase<ZerkDb>> | null = null;

  private db(): Promise<IDBPDatabase<ZerkDb>> {
    if (!this.dbPromise) {
      this.dbPromise = openDB<ZerkDb>(DB_NAME, DB_VERSION, {
        upgrade(db) {
          if (!db.objectStoreNames.contains(STORE)) {
            db.createObjectStore(STORE, { keyPath: 'id' });
          }
        },
      });
    }
    return this.dbPromise;
  }

  async save(slot: SaveSlot): Promise<void> {
    const db = await this.db();
    await db.put(STORE, slot);
  }

  async load(id: string): Promise<SaveSlot | null> {
    const db = await this.db();
    const value = await db.get(STORE, id);
    return value ?? null;
  }

  async list(): Promise<readonly string[]> {
    const db = await this.db();
    return db.getAllKeys(STORE);
  }

  async remove(id: string): Promise<void> {
    const db = await this.db();
    await db.delete(STORE, id);
  }
}
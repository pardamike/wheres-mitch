import type { Records } from '../core/types';
import { DEFAULT_RECORDS } from '../game/records';
import {
  normalizeRecords,
  parseStoredRecords,
  RECORDS_STORAGE_KEY,
  serializeRecords,
} from './schema';

export interface StorageLike {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface RecordsStore {
  readonly available: boolean;
  load(): Records;
  save(records: Records): void;
  reset(): Records;
}

export interface RecordsStoreOptions {
  getStorage?: () => StorageLike | null;
}

function browserStorage(): StorageLike | null {
  if (typeof window === 'undefined') {
    return null;
  }
  return window.localStorage;
}

function clone(records: Records): Records {
  return { ...records };
}

class BrowserRecordsStore implements RecordsStore {
  private storage: StorageLike | null = null;
  private records = clone(DEFAULT_RECORDS);

  constructor(getStorage: () => StorageLike | null) {
    try {
      const storage = getStorage();
      if (!storage) {
        return;
      }
      const probeKey = `${RECORDS_STORAGE_KEY}:probe`;
      storage.setItem(probeKey, '1');
      storage.removeItem(probeKey);
      this.records = parseStoredRecords(storage.getItem(RECORDS_STORAGE_KEY));
      this.storage = storage;
    } catch {
      this.storage = null;
      this.records = clone(DEFAULT_RECORDS);
    }
  }

  get available(): boolean {
    return this.storage !== null;
  }

  load(): Records {
    return clone(this.records);
  }

  save(records: Records): void {
    this.records = normalizeRecords(records);
    if (!this.storage) {
      return;
    }
    try {
      this.storage.setItem(RECORDS_STORAGE_KEY, serializeRecords(this.records));
    } catch {
      this.storage = null;
    }
  }

  reset(): Records {
    this.records = clone(DEFAULT_RECORDS);
    if (this.storage) {
      try {
        this.storage.removeItem(RECORDS_STORAGE_KEY);
      } catch {
        this.storage = null;
      }
    }
    return this.load();
  }
}

export function createRecordsStore(options: RecordsStoreOptions = {}): RecordsStore {
  return new BrowserRecordsStore(options.getStorage ?? browserStorage);
}

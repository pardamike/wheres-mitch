import { describe, expect, it } from 'vitest';
import { DEFAULT_RECORDS } from '../../src/game/records';
import {
  parseStoredRecords,
  RECORDS_STORAGE_KEY,
  RECORDS_STORAGE_VERSION,
  serializeRecords,
} from '../../src/storage/schema';
import { createRecordsStore, type StorageLike } from '../../src/storage/storage';

class MemoryStorage implements StorageLike {
  readonly values = new Map<string, string>();
  private writes = 0;

  constructor(private readonly failAfterWrites = Number.POSITIVE_INFINITY) {}

  getItem(key: string): string | null {
    return this.values.get(key) ?? null;
  }

  setItem(key: string, value: string): void {
    this.writes += 1;
    if (this.writes > this.failAfterWrites) {
      throw new Error('Storage is unavailable');
    }
    this.values.set(key, value);
  }

  removeItem(key: string): void {
    this.values.delete(key);
  }
}

describe('versioned local records storage', () => {
  it('uses defaults for missing, corrupt, incompatible, and invalid values', () => {
    expect(parseStoredRecords(null)).toEqual(DEFAULT_RECORDS);
    expect(parseStoredRecords('{bad json')).toEqual(DEFAULT_RECORDS);
    expect(
      parseStoredRecords(
        JSON.stringify({
          version: RECORDS_STORAGE_VERSION + 1,
          bestRounds: 7,
        }),
      ),
    ).toEqual(DEFAULT_RECORDS);
    expect(
      parseStoredRecords(
        JSON.stringify({
          version: RECORDS_STORAGE_VERSION,
          bestRounds: -1,
          fastestFindMs: null,
          lifetimeCatches: 0,
          soundEnabled: true,
          reducedMotionOverride: 'system',
        }),
      ),
    ).toEqual(DEFAULT_RECORDS);
    expect(
      parseStoredRecords(
        JSON.stringify({
          version: RECORDS_STORAGE_VERSION,
          bestRounds: 1,
          fastestFindMs: null,
          lifetimeCatches: 1,
          soundEnabled: 'yes',
          reducedMotionOverride: 'always',
        }),
      ),
    ).toEqual(DEFAULT_RECORDS);
  });

  it('round-trips the documented local-only fields and bounds extreme values', () => {
    const raw = JSON.stringify({
      version: RECORDS_STORAGE_VERSION,
      bestRounds: 9_999_999,
      fastestFindMs: 1234.6,
      lifetimeCatches: 9_999_999_999,
      soundEnabled: false,
      reducedMotionOverride: 'reduce',
    });

    expect(parseStoredRecords(raw)).toEqual({
      bestRounds: 1_000_000,
      fastestFindMs: 1235,
      lifetimeCatches: 1_000_000_000,
      soundEnabled: false,
      reducedMotionOverride: 'reduce',
    });
    expect(parseStoredRecords(serializeRecords(DEFAULT_RECORDS))).toEqual(DEFAULT_RECORDS);
  });

  it('persists records under one versioned key and removes them on reset', () => {
    const storage = new MemoryStorage();
    const store = createRecordsStore({ getStorage: () => storage });
    const records = {
      bestRounds: 4,
      fastestFindMs: 1830,
      lifetimeCatches: 12,
      soundEnabled: false,
      reducedMotionOverride: 'full' as const,
    };

    expect(store.available).toBe(true);
    store.save(records);
    expect(parseStoredRecords(storage.getItem(RECORDS_STORAGE_KEY))).toEqual(records);
    expect(store.reset()).toEqual(DEFAULT_RECORDS);
    expect(storage.getItem(RECORDS_STORAGE_KEY)).toBeNull();
  });

  it('falls back to session memory when access or a later write fails', () => {
    const inaccessible = createRecordsStore({
      getStorage: () => {
        throw new Error('SecurityError');
      },
    });
    expect(inaccessible.available).toBe(false);
    expect(inaccessible.load()).toEqual(DEFAULT_RECORDS);
    expect(() => inaccessible.save({ ...DEFAULT_RECORDS, bestRounds: 3 })).not.toThrow();
    expect(inaccessible.load().bestRounds).toBe(3);

    const unreadable = createRecordsStore({
      getStorage: () => ({
        getItem: () => {
          throw new Error('Read denied');
        },
        setItem: () => undefined,
        removeItem: () => undefined,
      }),
    });
    expect(unreadable.available).toBe(false);

    const storage = new MemoryStorage(1);
    const store = createRecordsStore({ getStorage: () => storage });
    expect(store.available).toBe(true);
    store.save({ ...DEFAULT_RECORDS, bestRounds: 5 });
    expect(store.available).toBe(false);
    expect(store.load().bestRounds).toBe(5);
  });

  it('keeps reset safe when storage removal is denied', () => {
    let removals = 0;
    const store = createRecordsStore({
      getStorage: () => ({
        getItem: () => null,
        setItem: () => undefined,
        removeItem: () => {
          removals += 1;
          if (removals > 1) {
            throw new Error('Remove denied');
          }
        },
      }),
    });

    expect(store.available).toBe(true);
    expect(store.reset()).toEqual(DEFAULT_RECORDS);
    expect(store.available).toBe(false);
  });
});

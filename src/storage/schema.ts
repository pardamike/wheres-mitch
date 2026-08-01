import type { MotionMode, Records } from '../core/types';
import { DEFAULT_RECORDS, isMotionMode } from '../game/records';

export const RECORDS_STORAGE_KEY = 'wheres-mitch:records:v1';
export const RECORDS_STORAGE_VERSION = 1;

const MAX_BEST_ROUNDS = 1_000_000;
const MAX_FASTEST_FIND_MS = 86_400_000;
const MAX_LIFETIME_CATCHES = 1_000_000_000;

interface StoredRecordsV1 {
  version: typeof RECORDS_STORAGE_VERSION;
  bestRounds: number;
  fastestFindMs: number | null;
  lifetimeCatches: number;
  soundEnabled: boolean;
  reducedMotionOverride: MotionMode;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isNonNegativeInteger(value: unknown): value is number {
  return (
    typeof value === 'number' && Number.isFinite(value) && Number.isInteger(value) && value >= 0
  );
}

function clamp(value: number, maximum: number): number {
  return Math.min(value, maximum);
}

function defaultRecords(): Records {
  return { ...DEFAULT_RECORDS };
}

function parseStoredValue(value: unknown): Records | null {
  if (!isRecord(value) || value.version !== RECORDS_STORAGE_VERSION) {
    return null;
  }
  if (
    !isNonNegativeInteger(value.bestRounds) ||
    !isNonNegativeInteger(value.lifetimeCatches) ||
    typeof value.soundEnabled !== 'boolean' ||
    !isMotionMode(value.reducedMotionOverride)
  ) {
    return null;
  }
  if (
    value.fastestFindMs !== null &&
    (typeof value.fastestFindMs !== 'number' ||
      !Number.isFinite(value.fastestFindMs) ||
      value.fastestFindMs <= 0)
  ) {
    return null;
  }
  return {
    bestRounds: clamp(value.bestRounds, MAX_BEST_ROUNDS),
    fastestFindMs:
      value.fastestFindMs === null
        ? null
        : Math.min(Math.round(value.fastestFindMs), MAX_FASTEST_FIND_MS),
    lifetimeCatches: clamp(value.lifetimeCatches, MAX_LIFETIME_CATCHES),
    soundEnabled: value.soundEnabled,
    reducedMotionOverride: value.reducedMotionOverride,
  };
}

export function parseStoredRecords(raw: string | null): Records {
  if (raw === null) {
    return defaultRecords();
  }
  try {
    return parseStoredValue(JSON.parse(raw)) ?? defaultRecords();
  } catch {
    return defaultRecords();
  }
}

export function normalizeRecords(records: Records): Records {
  return (
    parseStoredValue({
      version: RECORDS_STORAGE_VERSION,
      bestRounds: records.bestRounds,
      fastestFindMs: records.fastestFindMs,
      lifetimeCatches: records.lifetimeCatches,
      soundEnabled: records.soundEnabled,
      reducedMotionOverride: records.reducedMotionOverride,
    }) ?? defaultRecords()
  );
}

export function serializeRecords(records: Records): string {
  const safe = normalizeRecords(records);
  const stored: StoredRecordsV1 = {
    version: RECORDS_STORAGE_VERSION,
    bestRounds: safe.bestRounds,
    fastestFindMs: safe.fastestFindMs,
    lifetimeCatches: safe.lifetimeCatches,
    soundEnabled: safe.soundEnabled,
    reducedMotionOverride: safe.reducedMotionOverride,
  };
  return JSON.stringify(stored);
}

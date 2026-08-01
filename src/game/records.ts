import type { MotionMode, Records } from '../core/types';

export const DEFAULT_RECORDS: Records = {
  bestRounds: 0,
  fastestFindMs: null,
  lifetimeCatches: 0,
  soundEnabled: true,
  reducedMotionOverride: 'system',
};

export function isMotionMode(value: unknown): value is MotionMode {
  return value === 'system' || value === 'reduce' || value === 'full';
}

export function cloneRecords(records: Records): Records {
  return { ...records };
}

export function recordSuccessfulCatch(records: Records, elapsedMs: number): Records {
  const fastestFindMs =
    Number.isFinite(elapsedMs) && elapsedMs > 0
      ? records.fastestFindMs === null || elapsedMs < records.fastestFindMs
        ? Math.round(elapsedMs)
        : records.fastestFindMs
      : records.fastestFindMs;

  return {
    ...records,
    fastestFindMs,
    lifetimeCatches: records.lifetimeCatches + 1,
  };
}

export function recordCompletedRounds(records: Records, completedRounds: number): Records {
  const validRounds =
    Number.isInteger(completedRounds) && completedRounds >= 0 ? completedRounds : 0;
  return {
    ...records,
    bestRounds: Math.max(records.bestRounds, validRounds),
  };
}

export function withSoundEnabled(records: Records, soundEnabled: boolean): Records {
  return { ...records, soundEnabled };
}

export function withMotionMode(records: Records, reducedMotionOverride: MotionMode): Records {
  return { ...records, reducedMotionOverride };
}

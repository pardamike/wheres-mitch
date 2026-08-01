import { describe, expect, it } from 'vitest';
import {
  DEFAULT_RECORDS,
  recordCompletedRounds,
  recordSuccessfulCatch,
  withMotionMode,
  withSoundEnabled,
} from '../../src/game/records';

describe('local record calculations', () => {
  it('keeps the higher completed-round record', () => {
    const record = recordCompletedRounds({ ...DEFAULT_RECORDS, bestRounds: 5 }, 3);
    expect(record.bestRounds).toBe(5);
    expect(recordCompletedRounds(record, 7).bestRounds).toBe(7);
  });

  it('records only valid faster successful finds and increments catches once', () => {
    const first = recordSuccessfulCatch(DEFAULT_RECORDS, 3_200);
    const slower = recordSuccessfulCatch(first, 3_800);
    const faster = recordSuccessfulCatch(slower, 2_100.4);
    const invalid = recordSuccessfulCatch(faster, Number.NaN);

    expect(first.fastestFindMs).toBe(3200);
    expect(slower.fastestFindMs).toBe(3200);
    expect(faster.fastestFindMs).toBe(2100);
    expect(invalid.fastestFindMs).toBe(2100);
    expect(invalid.lifetimeCatches).toBe(4);
  });

  it('keeps settings as immutable record values', () => {
    const muted = withSoundEnabled(DEFAULT_RECORDS, false);
    const reduced = withMotionMode(muted, 'reduce');

    expect(DEFAULT_RECORDS.soundEnabled).toBe(true);
    expect(reduced.soundEnabled).toBe(false);
    expect(reduced.reducedMotionOverride).toBe('reduce');
  });
});

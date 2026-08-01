import { describe, expect, it } from 'vitest';
import { createInitialState, reduceGame } from '../../src/core/reducer';

function readyPlayingState() {
  let state = reduceGame(createInitialState(), { type: 'START_RUN', runSeed: 324001 });
  state = reduceGame(state, { type: 'ROUND_READY', sceneId: 'washington', sceneSeed: 11 });
  return reduceGame(state, { type: 'ROUND_INTRO_COMPLETE' });
}

describe('ten-click game reducer', () => {
  it('starts a clean run with exactly ten attempts and no scene until ready', () => {
    const state = reduceGame(createInitialState(), { type: 'START_RUN', runSeed: 9 });

    expect(state.mode).toBe('round_intro');
    expect(state.round).toBe(1);
    expect(state.clicksRemaining).toBe(10);
    expect(state.completedRounds).toBe(0);
    expect(state.sceneId).toBeNull();
  });

  it('counts nine misses, then atomically locks the tenth miss into escape', () => {
    let state = readyPlayingState();
    for (let index = 0; index < 9; index += 1) {
      state = reduceGame(state, { type: 'MISS', x: index, y: index });
    }

    expect(state.mode).toBe('playing');
    expect(state.clicksRemaining).toBe(1);
    expect(state.totalAttempts).toBe(9);

    state = reduceGame(state, { type: 'MISS', x: 9, y: 9 });
    const locked = reduceGame(state, { type: 'MISS', x: 10, y: 10 });

    expect(state.mode).toBe('mitch_escape');
    expect(state.clicksRemaining).toBe(0);
    expect(state.totalAttempts).toBe(10);
    expect(locked).toEqual(state);
  });

  it('allows the last available click to catch Mitch without decrementing it', () => {
    let state = readyPlayingState();
    for (let index = 0; index < 9; index += 1) {
      state = reduceGame(state, { type: 'MISS', x: index, y: 5 });
    }

    state = reduceGame(state, { type: 'MITCH_CAUGHT' });

    expect(state.mode).toBe('player_capture');
    expect(state.clicksRemaining).toBe(1);
    expect(state.catches).toBe(1);
    expect(state.totalAttempts).toBe(10);
  });

  it('resets a completed round exactly once and ignores duplicate outcome events', () => {
    let state = reduceGame(readyPlayingState(), { type: 'MITCH_CAUGHT' });
    state = reduceGame(state, { type: 'CAPTURE_COMPLETE' });
    const duplicate = reduceGame(state, { type: 'CAPTURE_COMPLETE' });

    expect(state.mode).toBe('round_transition');
    expect(state.round).toBe(2);
    expect(state.completedRounds).toBe(1);
    expect(state.clicksRemaining).toBe(10);
    expect(duplicate).toEqual(state);
  });

  it('enters game over once the escape finishes and retains the final score', () => {
    let state = readyPlayingState();
    for (let index = 0; index < 10; index += 1) {
      state = reduceGame(state, { type: 'MISS', x: index, y: 0 });
    }
    state = reduceGame(state, { type: 'ESCAPE_COMPLETE' });

    expect(state.mode).toBe('game_over');
    expect(state.completedRounds).toBe(0);
    expect(state.totalAttempts).toBe(10);
  });

  it('pauses only playable states and restores the prior mode', () => {
    let state = readyPlayingState();
    state = reduceGame(state, { type: 'PAUSE' });
    expect(state.mode).toBe('paused');
    expect(state.pausedMode).toBe('playing');

    state = reduceGame(state, { type: 'RESUME' });
    expect(state.mode).toBe('playing');
    expect(state.pausedMode).toBeNull();
  });

  it('restarts a clean run while retaining records and settings', () => {
    let state = readyPlayingState();
    state = reduceGame(state, { type: 'SET_SOUND', enabled: false });
    state = reduceGame(state, { type: 'RESTART', runSeed: 99 });

    expect(state.runSeed).toBe(99);
    expect(state.round).toBe(1);
    expect(state.totalAttempts).toBe(0);
    expect(state.soundEnabled).toBe(false);
    expect(state.clicksRemaining).toBe(10);
  });
});

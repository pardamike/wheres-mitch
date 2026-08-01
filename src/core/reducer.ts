import type { GameEvent } from './events';
import type { GameMode, GameState, Records } from './types';
import { DEFAULT_RECORDS } from '../game/records';

const attemptsPerRound = 10;

function retainSettings(
  state: GameState,
): Pick<GameState, 'soundEnabled' | 'motionMode' | 'records'> {
  return {
    soundEnabled: state.soundEnabled,
    motionMode: state.motionMode,
    records: state.records,
  };
}

function createFreshRun(runSeed: number, state: GameState, requestedRound = 1): GameState {
  const round = Number.isInteger(requestedRound) && requestedRound >= 1 ? requestedRound : 1;
  return {
    ...retainSettings(state),
    mode: 'round_intro',
    pausedMode: null,
    runSeed: runSeed >>> 0,
    round,
    completedRounds: round - 1,
    clicksRemaining: attemptsPerRound,
    totalAttempts: 0,
    roundAttempts: 0,
    catches: 0,
    fastestRunFindMs: null,
    roundStartedAtMs: null,
    visibleRoundElapsedMs: 0,
    sceneId: null,
    sceneSeed: null,
    lastMiss: null,
    lastCaptureMs: null,
    outcomeToken: state.outcomeToken + 1,
  };
}

export function createInitialState(records: Records = DEFAULT_RECORDS): GameState {
  return {
    mode: 'title',
    pausedMode: null,
    runSeed: 0,
    round: 0,
    completedRounds: 0,
    clicksRemaining: attemptsPerRound,
    totalAttempts: 0,
    roundAttempts: 0,
    catches: 0,
    fastestRunFindMs: null,
    roundStartedAtMs: null,
    visibleRoundElapsedMs: 0,
    sceneId: null,
    sceneSeed: null,
    soundEnabled: records.soundEnabled,
    motionMode: records.reducedMotionOverride,
    records: { ...records },
    lastMiss: null,
    lastCaptureMs: null,
    outcomeToken: 0,
  };
}

function isPausable(mode: GameMode): mode is 'round_intro' | 'playing' {
  return mode === 'round_intro' || mode === 'playing';
}

function isExpectedSceneReadyState(mode: GameMode): mode is 'round_intro' | 'round_transition' {
  return mode === 'round_intro' || mode === 'round_transition';
}

export function reduceGame(state: GameState, event: GameEvent): GameState {
  switch (event.type) {
    case 'BOOT_COMPLETE':
      return state.mode === 'boot' ? { ...state, mode: 'title' } : state;

    case 'START_RUN':
      return state.mode === 'title' || state.mode === 'game_over'
        ? createFreshRun(event.runSeed, state, event.startingRound)
        : state;

    case 'ROUND_READY':
      if (!isExpectedSceneReadyState(state.mode)) {
        return state;
      }
      return {
        ...state,
        mode: 'round_intro',
        sceneId: event.sceneId,
        sceneSeed: event.sceneSeed >>> 0,
        visibleRoundElapsedMs: 0,
        roundStartedAtMs: null,
        roundAttempts: 0,
        lastMiss: null,
      };

    case 'ROUND_INTRO_COMPLETE':
      return state.mode === 'round_intro' && state.sceneId
        ? { ...state, mode: 'playing', roundStartedAtMs: 0, visibleRoundElapsedMs: 0 }
        : state;

    case 'TICK':
      return state.mode === 'playing' && Number.isFinite(event.deltaMs) && event.deltaMs > 0
        ? { ...state, visibleRoundElapsedMs: state.visibleRoundElapsedMs + event.deltaMs }
        : state;

    case 'MISS': {
      if (state.mode !== 'playing') {
        return state;
      }
      const clicksRemaining = Math.max(0, state.clicksRemaining - 1);
      const escaped = clicksRemaining === 0;
      return {
        ...state,
        mode: escaped ? 'mitch_escape' : state.mode,
        clicksRemaining,
        totalAttempts: state.totalAttempts + 1,
        roundAttempts: state.roundAttempts + 1,
        lastMiss: { x: event.x, y: event.y, id: state.totalAttempts + 1 },
        outcomeToken: escaped ? state.outcomeToken + 1 : state.outcomeToken,
      };
    }

    case 'MITCH_CAUGHT':
      return state.mode === 'playing'
        ? {
            ...state,
            mode: 'player_capture',
            catches: state.catches + 1,
            fastestRunFindMs:
              state.fastestRunFindMs === null ||
              state.visibleRoundElapsedMs < state.fastestRunFindMs
                ? state.visibleRoundElapsedMs
                : state.fastestRunFindMs,
            totalAttempts: state.totalAttempts + 1,
            roundAttempts: state.roundAttempts + 1,
            lastCaptureMs: state.visibleRoundElapsedMs,
            lastMiss: null,
            outcomeToken: state.outcomeToken + 1,
          }
        : state;

    case 'CAPTURE_COMPLETE':
      return state.mode === 'player_capture'
        ? {
            ...state,
            mode: 'round_transition',
            round: state.round + 1,
            completedRounds: state.completedRounds + 1,
            clicksRemaining: attemptsPerRound,
            roundAttempts: 0,
            visibleRoundElapsedMs: 0,
            roundStartedAtMs: null,
            sceneId: null,
            sceneSeed: null,
            lastMiss: null,
          }
        : state;

    case 'ESCAPE_COMPLETE':
      return state.mode === 'mitch_escape'
        ? { ...state, mode: 'game_over', lastMiss: null }
        : state;

    case 'PAUSE':
      return isPausable(state.mode) ? { ...state, mode: 'paused', pausedMode: state.mode } : state;

    case 'RESUME':
      return state.mode === 'paused' && state.pausedMode
        ? { ...state, mode: state.pausedMode, pausedMode: null }
        : state;

    case 'RESTART':
      return state.mode === 'boot'
        ? state
        : createFreshRun(event.runSeed, state, event.startingRound);

    case 'BACK_TO_TITLE':
      return state.mode === 'game_over' || state.mode === 'paused'
        ? {
            ...createInitialState(state.records),
            outcomeToken: state.outcomeToken + 1,
          }
        : state;

    case 'SET_SOUND':
      return { ...state, soundEnabled: event.enabled };

    case 'SET_MOTION':
      return { ...state, motionMode: event.mode };

    case 'SET_RECORDS':
      return {
        ...state,
        records: { ...event.records },
        soundEnabled: event.records.soundEnabled,
        motionMode: event.records.reducedMotionOverride,
      };

    default: {
      const exhaustive: never = event;
      return exhaustive;
    }
  }
}

export function isStageInteractive(state: GameState): boolean {
  return state.mode === 'playing' && state.clicksRemaining > 0;
}

import type { MotionMode, Records, SceneId } from './types';

export type GameEvent =
  | { type: 'BOOT_COMPLETE' }
  | { type: 'START_RUN'; runSeed: number; startingRound?: number }
  | { type: 'ROUND_READY'; sceneId: SceneId; sceneSeed: number }
  | { type: 'ROUND_INTRO_COMPLETE' }
  | { type: 'TICK'; deltaMs: number }
  | { type: 'MISS'; x: number; y: number }
  | { type: 'MITCH_CAUGHT' }
  | { type: 'CAPTURE_COMPLETE' }
  | { type: 'ESCAPE_COMPLETE' }
  | { type: 'PAUSE' }
  | { type: 'RESUME' }
  | { type: 'RESTART'; runSeed: number; startingRound?: number }
  | { type: 'BACK_TO_TITLE' }
  | { type: 'SET_SOUND'; enabled: boolean }
  | { type: 'SET_MOTION'; mode: MotionMode }
  | { type: 'SET_RECORDS'; records: Records };

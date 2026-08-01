export type GameMode =
  | 'boot'
  | 'title'
  | 'round_intro'
  | 'playing'
  | 'paused'
  | 'player_capture'
  | 'round_transition'
  | 'mitch_escape'
  | 'game_over';

export type SceneId = 'washington' | 'fair' | 'airport';
export type MotionMode = 'system' | 'reduce' | 'full';

export interface Records {
  bestRounds: number;
  fastestFindMs: number | null;
  lifetimeCatches: number;
  soundEnabled: boolean;
  reducedMotionOverride: MotionMode;
}

export interface Point {
  x: number;
  y: number;
}

export interface MissMarker extends Point {
  id: number;
}

export interface GameState {
  mode: GameMode;
  pausedMode: 'round_intro' | 'playing' | null;
  runSeed: number;
  round: number;
  completedRounds: number;
  clicksRemaining: number;
  totalAttempts: number;
  roundAttempts: number;
  catches: number;
  roundStartedAtMs: number | null;
  visibleRoundElapsedMs: number;
  sceneId: SceneId | null;
  sceneSeed: number | null;
  soundEnabled: boolean;
  motionMode: MotionMode;
  records: Records;
  lastMiss: MissMarker | null;
  lastCaptureMs: number | null;
  outcomeToken: number;
}

export interface DifficultyProfile {
  crowdCount: number;
  crowdSpeed: number;
  mitchSpeed: number;
  routeDecisionMs: number;
  dwellMs: number;
  peekMs: number;
  maxHiddenMs: number;
  hitboxScale: number;
}

export interface Vec2 {
  x: number;
  y: number;
}

export interface PathNode extends Vec2 {
  id: string;
  lane: number;
}

export interface HideSpot {
  id: string;
  position: Vec2;
  approachNodeId: string;
  occluderId?: string;
  revealRatio: number;
  weight: number;
}

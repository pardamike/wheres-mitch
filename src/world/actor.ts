import type { SeededRng } from '../core/rng';
import type { Vec2 } from '../core/types';
import type { BehaviorKind } from './scene';

export type CrowdAccessory = 'hat' | 'bag' | 'coffee' | 'camera' | 'none';
export type CrowdPose =
  'walk' | 'idle' | 'queue' | 'chat' | 'sit' | 'interact' | 'observe' | 'react';

export interface CrowdActor {
  id: string;
  routine: BehaviorKind;
  previousRoutine: BehaviorKind | null;
  pose: CrowdPose;
  position: Vec2;
  route: string[];
  routeCursor: number;
  currentNodeId: string;
  targetNodeId: string;
  speed: number;
  routineElapsedMs: number;
  routineDurationMs: number;
  reactionRemainingMs: number;
  facing: 1 | -1;
  depthLane: 'back' | 'mid' | 'front';
  scale: number;
  color: string;
  skin: string;
  hair: string;
  accessory: CrowdAccessory;
  phase: number;
  rng: SeededRng;
}

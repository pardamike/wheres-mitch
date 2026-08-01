import type { Vec2 } from '../../core/types';
import { clamp, easeInOutQuad, easeOutCubic, lerp } from '../art/shared';
import type { SequenceBeat, SequenceSnapshot } from './sequence';

export const captureBeats: readonly SequenceBeat<void>[] = [
  { id: 'recognition', durationMs: 250, reducedDurationMs: 100 },
  { id: 'tuck', durationMs: 500, reducedDurationMs: 180 },
  { id: 'dispatch', durationMs: 350, reducedDurationMs: 120 },
  { id: 'travel', durationMs: 1500, reducedDurationMs: 350 },
  { id: 'arrival', durationMs: 600, reducedDurationMs: 210 },
  { id: 'stamp', durationMs: 350, reducedDurationMs: 160 },
  { id: 'transition', durationMs: 450, reducedDurationMs: 160 },
];

export interface CapturePresentation {
  beatId: string | null;
  headline: string;
  caption: string;
  dimOpacity: number;
  spotlightOpacity: number;
  spotlightRadius: number;
  mitchPosition: Vec2;
  mitchScale: number;
  mitchRotation: number;
  tuckProgress: number;
  tubeOpacity: number;
  trailOpacity: number;
  capitolOpacity: number;
  capitolScale: number;
  stampOpacity: number;
  stampScale: number;
  starsOpacity: number;
}

function beatProgress(snapshot: SequenceSnapshot): number {
  return snapshot.beatDurationMs === 0
    ? 1
    : clamp(snapshot.beatElapsedMs / snapshot.beatDurationMs, 0, 1);
}

function quadraticPoint(start: Vec2, control: Vec2, end: Vec2, progress: number): Vec2 {
  const inverse = 1 - progress;
  return {
    x:
      inverse * inverse * start.x +
      2 * inverse * progress * control.x +
      progress * progress * end.x,
    y:
      inverse * inverse * start.y +
      2 * inverse * progress * control.y +
      progress * progress * end.y,
  };
}

export function getCapturePresentation(
  snapshot: SequenceSnapshot,
  origin: Vec2,
): CapturePresentation {
  const progress = beatProgress(snapshot);
  const finalPosition = { x: 1125, y: 575 };
  const base: CapturePresentation = {
    beatId: snapshot.beatId,
    headline: 'FOUND HIM!',
    caption: 'Back to work, Senator.',
    dimOpacity: 0.46,
    spotlightOpacity: 0.32,
    spotlightRadius: 230,
    mitchPosition: { ...origin },
    mitchScale: 0.55,
    mitchRotation: 0,
    tuckProgress: 0,
    tubeOpacity: 0,
    trailOpacity: 0,
    capitolOpacity: 0,
    capitolScale: 0.84,
    stampOpacity: 0,
    stampScale: 0.7,
    starsOpacity: 0,
  };

  switch (snapshot.beatId) {
    case 'recognition':
      base.spotlightRadius = lerp(150, 250, easeOutCubic(progress));
      break;
    case 'tuck':
      base.tuckProgress = easeInOutQuad(progress);
      base.spotlightRadius = 250;
      break;
    case 'dispatch':
      base.tuckProgress = 1;
      base.tubeOpacity = easeOutCubic(progress);
      base.trailOpacity = progress;
      base.capitolOpacity = progress * 0.65;
      base.capitolScale = lerp(0.84, 0.96, progress);
      base.mitchRotation = progress * 120;
      break;
    case 'travel': {
      const travel = easeInOutQuad(progress);
      base.tuckProgress = 1;
      base.tubeOpacity = 1;
      base.trailOpacity = 1;
      base.capitolOpacity = 1;
      base.capitolScale = 1;
      base.mitchPosition = quadraticPoint(origin, { x: 820, y: 170 }, finalPosition, travel);
      base.mitchScale = lerp(0.55, 0.31, travel);
      base.mitchRotation = travel * 1080;
      base.starsOpacity = 0.8;
      break;
    }
    case 'arrival':
      base.tuckProgress = 1;
      base.tubeOpacity = lerp(1, 0.3, progress);
      base.trailOpacity = lerp(1, 0, progress);
      base.capitolOpacity = 1;
      base.capitolScale = 1 + Math.sin(progress * Math.PI) * 0.06;
      base.mitchPosition = finalPosition;
      base.mitchScale = lerp(0.31, 0.19, progress);
      base.mitchRotation = 1080 + progress * 180;
      base.starsOpacity = 0.8 * (1 - progress);
      break;
    case 'stamp':
      base.tuckProgress = 1;
      base.capitolOpacity = 1;
      base.mitchPosition = finalPosition;
      base.mitchScale = 0.19;
      base.mitchRotation = 1260;
      base.stampOpacity = Math.min(1, progress * 2.5);
      base.stampScale = lerp(1.35, 1, easeOutCubic(progress));
      base.caption = 'Round cleared. The Capitol receipt is stamped.';
      break;
    case 'transition':
      base.tuckProgress = 1;
      base.capitolOpacity = 1 - progress;
      base.mitchPosition = finalPosition;
      base.mitchScale = 0.19;
      base.mitchRotation = 1260;
      base.stampOpacity = 1 - progress;
      base.stampScale = 1;
      base.dimOpacity = lerp(0.46, 0, progress);
      base.spotlightOpacity = lerp(0.32, 0, progress);
      base.caption = 'Round complete!';
      break;
    default:
      break;
  }
  return base;
}

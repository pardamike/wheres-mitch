import type { Vec2 } from '../../core/types';
import { clamp, easeInOutQuad, easeOutCubic, lerp } from '../art/shared';
import type { SequenceBeat, SequenceSnapshot } from './sequence';

const HELICOPTER_SCALE = 0.84;
const ROPE_ANCHOR_X = 157;
const ROPE_ANCHOR_Y = 145;

export const escapeBeats: readonly SequenceBeat<void>[] = [
  { id: 'lock', durationMs: 250, reducedDurationMs: 100 },
  { id: 'cash', durationMs: 550, reducedDurationMs: 160 },
  { id: 'approach', durationMs: 500, reducedDurationMs: 160 },
  { id: 'helicopter-entry', durationMs: 1400, reducedDurationMs: 400 },
  { id: 'rope', durationMs: 900, reducedDurationMs: 300 },
  { id: 'lift', durationMs: 1000, reducedDurationMs: 350 },
  { id: 'escape', durationMs: 900, reducedDurationMs: 250 },
  { id: 'resolve', durationMs: 600, reducedDurationMs: 180 },
];

export interface EscapePresentation {
  beatId: string | null;
  headline: string;
  caption: string;
  dimOpacity: number;
  mitchPosition: Vec2;
  mitchScale: number;
  tuckProgress: number;
  moneyOpacity: number;
  moneyScale: number;
  helicopterPosition: Vec2;
  helicopterOpacity: number;
  helicopterScale: number;
  rotorDegrees: number;
  ropeOpacity: number;
  ropeLength: number;
  loadOpacity: number;
  loadPosition: Vec2;
  loadRotation: number;
  windOpacity: number;
}

function beatProgress(snapshot: SequenceSnapshot): number {
  return snapshot.beatDurationMs === 0
    ? 1
    : clamp(snapshot.beatElapsedMs / snapshot.beatDurationMs, 0, 1);
}

function ropeLengthBetween(helicopter: Vec2, load: Vec2): number {
  return Math.max(0, (load.y - helicopter.y) / HELICOPTER_SCALE - ROPE_ANCHOR_Y);
}

function ropeAnchorX(helicopter: Vec2): number {
  return helicopter.x + ROPE_ANCHOR_X * HELICOPTER_SCALE;
}

export function getEscapePresentation(
  snapshot: SequenceSnapshot,
  origin: Vec2,
  landmarks: { entry: Vec2; exit: Vec2 } = {
    entry: { x: 1280, y: 108 },
    exit: { x: 0, y: 0 },
  },
): EscapePresentation {
  const progress = beatProgress(snapshot);
  const helicopterTarget = {
    x: origin.x - ROPE_ANCHOR_X * HELICOPTER_SCALE,
    y: landmarks.entry.y,
  };
  const helicopterEntry = { x: landmarks.entry.x + 260, y: landmarks.entry.y };
  const helicopterExit = { x: landmarks.exit.x - 620, y: landmarks.exit.y - 170 };
  const loadStart = { ...origin };
  const base: EscapePresentation = {
    beatId: snapshot.beatId,
    headline: 'MITCH GOT AWAY',
    caption: 'He had ten chances to be found.',
    dimOpacity: 0.5,
    mitchPosition: { ...origin },
    mitchScale: 0.55,
    tuckProgress: 0,
    moneyOpacity: 0,
    moneyScale: 0,
    helicopterPosition: helicopterEntry,
    helicopterOpacity: 0,
    helicopterScale: HELICOPTER_SCALE,
    rotorDegrees: 0,
    ropeOpacity: 0,
    ropeLength: 0,
    loadOpacity: 1,
    loadPosition: loadStart,
    loadRotation: 0,
    windOpacity: 0,
  };

  switch (snapshot.beatId) {
    case 'lock':
      base.caption = 'A very silly extraction is loading…';
      break;
    case 'cash':
      base.moneyOpacity = Math.min(1, progress * 3);
      base.moneyScale = lerp(0.2, 1, easeOutCubic(progress));
      base.caption = 'The bags appear from nowhere. Cartoon physics.';
      break;
    case 'approach':
      base.moneyOpacity = 1;
      base.moneyScale = 1;
      base.helicopterOpacity = progress * 0.35;
      base.windOpacity = progress;
      base.rotorDegrees = progress * 840;
      break;
    case 'helicopter-entry': {
      const entry = easeInOutQuad(progress);
      base.moneyOpacity = 1;
      base.moneyScale = 1;
      base.helicopterOpacity = 1;
      base.helicopterPosition = {
        x: lerp(helicopterEntry.x, helicopterTarget.x, entry),
        y: lerp(helicopterEntry.y - 30, helicopterTarget.y, entry),
      };
      base.rotorDegrees = 840 + progress * 2400;
      base.windOpacity = 1;
      base.caption = 'A cartoon helicopter arrives with impossible timing.';
      break;
    }
    case 'rope':
      base.moneyOpacity = 1;
      base.moneyScale = 1;
      base.helicopterOpacity = 1;
      base.helicopterPosition = helicopterTarget;
      base.rotorDegrees = 3240 + progress * 1800;
      base.ropeOpacity = 1;
      base.ropeLength = lerp(
        0,
        ropeLengthBetween(helicopterTarget, loadStart),
        easeOutCubic(progress),
      );
      base.windOpacity = 1;
      base.caption = 'The hook loops harmlessly around shell and bag straps.';
      break;
    case 'lift': {
      const lift = easeInOutQuad(progress);
      base.moneyOpacity = 1;
      base.moneyScale = 1;
      base.helicopterOpacity = 1;
      base.helicopterPosition = { x: helicopterTarget.x, y: lerp(helicopterTarget.y, -35, lift) };
      base.rotorDegrees = 5040 + progress * 2400;
      base.ropeOpacity = 1;
      base.loadPosition = {
        x: ropeAnchorX(base.helicopterPosition),
        y: lerp(origin.y, 110, lift),
      };
      base.ropeLength = ropeLengthBetween(base.helicopterPosition, base.loadPosition);
      base.loadRotation = Math.sin(progress * Math.PI * 2) * 10;
      base.tuckProgress = easeOutCubic(progress);
      base.windOpacity = 1;
      break;
    }
    case 'escape': {
      const exit = easeInOutQuad(progress);
      base.moneyOpacity = 1 - progress * 0.35;
      base.moneyScale = 1;
      base.helicopterOpacity = 1;
      base.helicopterPosition = {
        x: lerp(helicopterTarget.x, helicopterExit.x, exit),
        y: lerp(-35, helicopterExit.y, exit),
      };
      base.rotorDegrees = 7440 + progress * 3000;
      base.ropeOpacity = 1 - progress;
      base.loadPosition = {
        x: ropeAnchorX(base.helicopterPosition),
        y: lerp(110, -50, exit),
      };
      base.ropeLength = ropeLengthBetween(base.helicopterPosition, base.loadPosition);
      base.loadRotation = Math.sin(progress * Math.PI * 3) * 12;
      base.tuckProgress = 1;
      base.windOpacity = 1 - progress;
      break;
    }
    case 'resolve':
      base.dimOpacity = lerp(0.5, 0, progress);
      base.loadOpacity = 1 - progress;
      base.helicopterOpacity = 1 - progress;
      base.caption = 'The cartoon crowd has seen enough.';
      break;
    default:
      break;
  }
  return base;
}

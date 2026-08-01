import type { Point } from '../core/types';

export interface StageInputCallbacks {
  isEnabled(): boolean;
  onMiss(point: Point): void;
  onMitchCaught(): void;
}

function isPrimaryAttempt(event: PointerEvent): boolean {
  return event.isPrimary && event.button === 0;
}

function getStagePoint(stage: SVGSVGElement, event: PointerEvent): Point {
  const matrix = stage.getScreenCTM();
  if (matrix) {
    const point = new DOMPoint(event.clientX, event.clientY).matrixTransform(matrix.inverse());
    return { x: Math.round(point.x), y: Math.round(point.y) };
  }
  const bounds = stage.getBoundingClientRect();
  return {
    x: Math.round(((event.clientX - bounds.left) / bounds.width) * 1440),
    y: Math.round(((event.clientY - bounds.top) / bounds.height) * 900),
  };
}

function hasMitchTarget(path: EventTarget[]): boolean {
  return path.some(
    (entry) => entry instanceof Element && entry.getAttribute('data-game-target') === 'mitch',
  );
}

export function attachStageInput(stage: SVGSVGElement, callbacks: StageInputCallbacks): () => void {
  const handlePointerDown = (event: PointerEvent) => {
    if (!callbacks.isEnabled() || !isPrimaryAttempt(event)) {
      return;
    }
    event.preventDefault();
    if (hasMitchTarget(event.composedPath())) {
      callbacks.onMitchCaught();
      return;
    }
    callbacks.onMiss(getStagePoint(stage, event));
  };

  stage.addEventListener('pointerdown', handlePointerDown);
  return () => stage.removeEventListener('pointerdown', handlePointerDown);
}

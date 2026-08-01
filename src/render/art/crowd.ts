import { createSvgElement } from '../svg-dom';
import type { CrowdActor } from '../../world/actor';
import { appendShape, INK, PAPER } from './shared';

export interface CrowdRig {
  root: SVGGElement;
  body: SVGRectElement | SVGPathElement;
  head: SVGCircleElement;
  arms: SVGPathElement;
  legs: SVGPathElement;
}

function bodyFamily(actor: CrowdActor): number {
  const match = /\d+$/.exec(actor.id);
  return match ? Number(match[0]) % 12 : 0;
}

export function createCrowdRig(actor: CrowdActor): CrowdRig {
  const family = bodyFamily(actor);
  const root = createSvgElement('g', {
    id: actor.id,
    'data-actor': actor.routine,
    'data-body-family': String(family + 1),
    'pointer-events': 'none',
  });
  const height = 33 + (family % 3) * 4;
  const width = 25 + (family % 4) * 2;
  appendShape(root, 'ellipse', { cx: 0, cy: 30, rx: 22, ry: 7, fill: INK, opacity: 0.16 });
  const body =
    family === 2 || family === 8
      ? appendShape(root, 'path', {
          d: `M${-width / 2} 30q0-${height} ${width / 2}-${height + 8}q${width / 2} 8 ${width / 2} ${height + 8}z`,
          fill: actor.color,
          stroke: INK,
          'stroke-width': 3,
          'stroke-linejoin': 'round',
          'data-joint': 'body',
        })
      : appendShape(root, 'rect', {
          x: -width / 2,
          y: -7,
          width,
          height,
          rx: family === 5 ? 5 : 9,
          fill: actor.color,
          stroke: INK,
          'stroke-width': 3,
          'data-joint': 'body',
        });
  const head = appendShape(root, 'circle', {
    cx: 0,
    cy: -25 - (family % 2) * 2,
    r: 15 + (family % 3),
    fill: actor.skin,
    stroke: INK,
    'stroke-width': 3,
    'data-joint': 'head',
  });
  appendShape(root, 'path', {
    d: `M${-15 - (family % 2)} -28q${15 + (family % 2)}-${22 + (family % 3) * 2} ${30 + (family % 2) * 2} 0v7h${-30 - (family % 2) * 2}z`,
    fill: actor.hair,
    stroke: INK,
    'stroke-width': 2.5,
    'data-joint': 'hair',
  });
  const legs = appendShape(root, 'path', {
    d: family === 5 ? 'M-10 25v12M10 25v12' : 'M-9 29v17M9 29v17',
    stroke: INK,
    'stroke-width': 4,
    'stroke-linecap': 'round',
    fill: 'none',
    'data-joint': 'legs',
  });
  const arms = appendShape(root, 'path', {
    d: family === 6 ? 'M-12 4-31 13M12 4 31 13' : 'M-14 4-27 19M14 4 27 19',
    stroke: INK,
    'stroke-width': 4,
    'stroke-linecap': 'round',
    fill: 'none',
    'data-joint': 'arms',
  });
  if (actor.accessory === 'hat') {
    appendShape(root, 'path', {
      d: 'M-20-39h40l-8-12H-9z',
      fill: '#F2C14E',
      stroke: INK,
      'stroke-width': 2.5,
    });
  }
  if (actor.accessory === 'bag') {
    appendShape(root, 'rect', {
      x: 18,
      y: 11,
      width: 17,
      height: 19,
      rx: 3,
      fill: '#765238',
      stroke: INK,
      'stroke-width': 2.5,
    });
  }
  if (actor.accessory === 'coffee') {
    appendShape(root, 'rect', {
      x: 23,
      y: 14,
      width: 8,
      height: 16,
      fill: PAPER,
      stroke: INK,
      'stroke-width': 2,
    });
  }
  if (actor.accessory === 'camera') {
    appendShape(root, 'rect', {
      x: 16,
      y: 8,
      width: 18,
      height: 12,
      rx: 2,
      fill: '#4D718C',
      stroke: INK,
      'stroke-width': 2,
    });
  }
  return { root, body, head, arms, legs };
}

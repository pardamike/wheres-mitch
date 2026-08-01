import { createSvgElement } from '../svg-dom';
import { appendShape, INK, NAVY, SHELL_GREEN, TURTLE_GREEN } from './shared';

export interface MitchRigOptions {
  id?: string;
  interactive?: boolean;
}

export interface MitchRig {
  root: SVGGElement;
  shadow: SVGEllipseElement;
  backLegs: SVGGElement;
  shellBack: SVGEllipseElement;
  body: SVGEllipseElement;
  frontLegs: SVGGElement;
  shellFront: SVGGElement;
  neck: SVGEllipseElement;
  head: SVGGElement;
  headCutout: SVGImageElement;
  collar: SVGPathElement;
  tie: SVGPathElement;
  hitTarget: SVGCircleElement | null;
}

function appendLegPair(parent: SVGGElement, id: string, path: string): SVGGElement {
  const legs = createSvgElement('g', { 'data-joint': id });
  appendShape(legs, 'path', {
    d: path,
    stroke: TURTLE_GREEN,
    'stroke-width': 18,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    fill: 'none',
  });
  parent.append(legs);
  return legs;
}

export function createMitchRig(options: MitchRigOptions = {}): MitchRig {
  const root = createSvgElement('g', {
    id: options.id,
    'data-rig': 'turtle-mitch',
    'data-game-target': options.interactive ? 'mitch' : undefined,
  });
  const shadow = appendShape(root, 'ellipse', {
    cx: 0,
    cy: 50,
    rx: 73,
    ry: 16,
    fill: INK,
    opacity: 0.2,
    'data-joint': 'shadow',
  });
  const backLegs = appendLegPair(root, 'back-legs', 'M-61 21-92 42M-44 42-65 67');
  const body = appendShape(root, 'ellipse', {
    cx: 0,
    cy: 17,
    rx: 79,
    ry: 55,
    fill: TURTLE_GREEN,
    stroke: INK,
    'stroke-width': 5,
    'data-joint': 'body',
  });
  const shellBack = appendShape(root, 'ellipse', {
    cx: 8,
    cy: 13,
    rx: 70,
    ry: 48,
    fill: SHELL_GREEN,
    stroke: INK,
    'stroke-width': 5,
    'data-joint': 'shell-back',
  });
  appendShape(root, 'path', {
    d: 'M7-29 42-9 42 29 7 49-28 29-28-9z',
    fill: '#6EAE57',
    stroke: '#235B3A',
    'stroke-width': 4,
    'stroke-linejoin': 'round',
    'data-joint': 'shell-center-scute',
  });
  appendShape(root, 'path', {
    d: 'M-28-9-55 5-55 31-28 29M42-9 66 4 66 28 42 29M-14-34 7-29 28-35M-15 57 7 49 29 56',
    stroke: '#A7D46D',
    'stroke-width': 4,
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    fill: 'none',
    opacity: 0.9,
    'data-joint': 'shell-scute-lines',
  });
  const frontLegs = appendLegPair(root, 'front-legs', 'M53 22 84 43M41 44 61 68');
  const shellFront = appendShape(root, 'path', {
    d: 'M-49-18q55-40 115 6v52q-54 36-115 0z',
    fill: 'none',
    stroke: '#E2C66F',
    'stroke-width': 6,
    opacity: 0.9,
    'data-joint': 'shell-front',
  });
  const neck = appendShape(root, 'ellipse', {
    cx: -53,
    cy: 9,
    rx: 35,
    ry: 27,
    fill: TURTLE_GREEN,
    stroke: INK,
    'stroke-width': 4,
    'data-joint': 'neck',
  });
  const collar = appendShape(root, 'path', {
    d: 'M-42-7 3 1-15 34-53 12z',
    fill: NAVY,
    stroke: INK,
    'stroke-width': 3,
    'data-joint': 'collar',
  });
  const tie = appendShape(root, 'path', {
    d: 'M-27 1-17 22-6 1',
    fill: '#C94A43',
    stroke: INK,
    'stroke-width': 2,
    'data-joint': 'tie',
  });
  const head = createSvgElement('g', { 'data-joint': 'head' });
  const headCutout = createSvgElement('image', {
    href: './assets/mitch-head.png',
    x: -128,
    y: -102,
    width: 120,
    height: 158,
    preserveAspectRatio: 'xMidYMid meet',
    'data-asset': 'mitch-head',
    'data-joint': 'head-cutout',
  });
  head.append(headCutout);
  root.append(head);
  let hitTarget: SVGCircleElement | null = null;
  if (options.interactive) {
    hitTarget = appendShape(root, 'circle', {
      cx: -67,
      cy: -19,
      r: 59,
      fill: '#FFFFFF',
      'fill-opacity': 0,
      stroke: 'none',
      'pointer-events': 'all',
      'data-game-target': 'mitch',
      'data-joint': 'hit-target',
    });
  }

  return {
    root,
    shadow,
    backLegs,
    shellBack,
    body,
    frontLegs,
    shellFront,
    neck,
    head,
    headCutout,
    collar,
    tie,
    hitTarget,
  };
}

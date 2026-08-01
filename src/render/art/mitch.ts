import { createSvgElement } from '../svg-dom';
import { appendShape, INK, NAVY, SHELL_BROWN, TURTLE_GREEN } from './shared';

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
  faceBase: SVGPathElement;
  lids: SVGGElement;
  brows: SVGGElement;
  mouth: SVGPathElement;
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
    fill: SHELL_BROWN,
    stroke: INK,
    'stroke-width': 5,
    'data-joint': 'shell-back',
  });
  appendShape(root, 'path', {
    d: 'M-47 13H61M-29-24 49 50M49-24-31 50',
    stroke: '#A77A51',
    'stroke-width': 4,
    'stroke-linecap': 'round',
    fill: 'none',
  });
  const frontLegs = appendLegPair(root, 'front-legs', 'M53 22 84 43M41 44 61 68');
  const shellFront = appendShape(root, 'path', {
    d: 'M-49-18q55-40 115 6v52q-54 36-115 0z',
    fill: 'none',
    stroke: '#C69A6A',
    'stroke-width': 3,
    opacity: 0.75,
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
  const head = createSvgElement('g', { 'data-joint': 'head' });
  const faceBase = appendShape(head, 'path', {
    d: 'M-84 3q-9-63 37-67 42 5 33 59l-15 27-42-1z',
    fill: '#F1C6A4',
    stroke: INK,
    'stroke-width': 4,
    'data-joint': 'face-base',
  });
  appendShape(head, 'path', {
    d: 'M-92-43q24-30 58-5l-6 17-51-1z',
    fill: '#E4D1BB',
    stroke: INK,
    'stroke-width': 3,
    'data-joint': 'hair',
  });
  appendShape(head, 'circle', {
    cx: -85,
    cy: -1,
    r: 4,
    fill: '#D99D76',
    stroke: INK,
    'stroke-width': 1.5,
    'data-joint': 'ear',
  });
  appendShape(head, 'path', {
    d: 'M-75-28h12M-46-28h12',
    stroke: INK,
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'data-joint': 'eyes',
  });
  const lids = createSvgElement('g', { 'data-joint': 'lids' });
  appendShape(lids, 'path', {
    d: 'M-76-31h13M-47-31h13',
    stroke: '#E6B892',
    'stroke-width': 4,
    'stroke-linecap': 'round',
  });
  head.append(lids);
  const brows = createSvgElement('g', { 'data-joint': 'brows' });
  appendShape(brows, 'path', {
    d: 'M-78-39h17M-49-39h17',
    stroke: '#7B5B45',
    'stroke-width': 3.5,
    'stroke-linecap': 'round',
  });
  head.append(brows);
  appendShape(head, 'path', {
    d: 'M-58-27l-4 17 8 1',
    stroke: '#C58B6B',
    'stroke-width': 2.5,
    fill: 'none',
    'stroke-linecap': 'round',
    'data-joint': 'nose',
  });
  const mouth = appendShape(head, 'path', {
    d: 'M-69-11q9 7 19 0',
    fill: 'none',
    stroke: '#A3443B',
    'stroke-width': 3,
    'stroke-linecap': 'round',
    'data-joint': 'mouth',
  });
  appendShape(head, 'path', {
    d: 'M-77 0q9 6 23 5',
    fill: 'none',
    stroke: '#D09372',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    opacity: 0.8,
    'data-joint': 'expression-lines',
  });
  root.append(head);
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
  let hitTarget: SVGCircleElement | null = null;
  if (options.interactive) {
    hitTarget = appendShape(root, 'circle', {
      cx: -42,
      cy: -15,
      r: 69,
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
    faceBase,
    lids,
    brows,
    mouth,
    collar,
    tie,
    hitTarget,
  };
}

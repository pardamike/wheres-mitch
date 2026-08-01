import { createSvgElement } from '../svg-dom';
import { appendShape, appendText, INK, NAVY, PAPER } from './shared';

export interface CapitolRig {
  root: SVGGElement;
  dome: SVGPathElement;
  doorway: SVGRectElement;
  steps: SVGPathElement;
}

export function createCapitolRig(id = 'capitol-vignette'): CapitolRig {
  const root = createSvgElement('g', { id, 'data-rig': 'cartoon-capitol' });
  appendShape(root, 'path', {
    d: 'M0 246h390L354 126l-58-36-101-80-101 80-58 36z',
    fill: PAPER,
    stroke: INK,
    'stroke-width': 5,
    'stroke-linejoin': 'round',
  });
  const dome = appendShape(root, 'path', {
    d: 'M136 90q59-108 118 0v12H136z',
    fill: PAPER,
    stroke: INK,
    'stroke-width': 5,
    'data-joint': 'dome',
  });
  appendShape(root, 'rect', {
    x: 30,
    y: 246,
    width: 330,
    height: 102,
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 5,
  });
  for (let index = 0; index < 7; index += 1) {
    appendShape(root, 'rect', {
      x: 52 + index * 43,
      y: 256,
      width: 18,
      height: 68,
      fill: '#AEB8C6',
      stroke: INK,
      'stroke-width': 2,
    });
  }
  const doorway = appendShape(root, 'rect', {
    x: 167,
    y: 250,
    width: 56,
    height: 98,
    rx: 3,
    fill: NAVY,
    stroke: INK,
    'stroke-width': 4,
    'data-joint': 'doorway',
  });
  const steps = appendShape(root, 'path', {
    d: 'M5 350h380v24H5zm30 24h320v20H35z',
    fill: '#C7CED8',
    stroke: INK,
    'stroke-width': 3,
    'stroke-linejoin': 'round',
    'data-joint': 'steps',
  });
  appendText(root, 'CAPITOL RETURN DESK', {
    x: 195,
    y: 231,
    'text-anchor': 'middle',
    fill: '#4D718C',
    'font-size': 18,
    'font-weight': 900,
  });
  return { root, dome, doorway, steps };
}

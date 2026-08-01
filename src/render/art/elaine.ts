import { createSvgElement } from '../svg-dom';
import { appendShape, INK, NAVY } from './shared';

export interface ElaineRig {
  root: SVGGElement;
  head: SVGGElement;
  eyes: SVGGElement;
  hand: SVGPathElement;
}

export function createElaineRig(id = 'elaine-cockpit'): ElaineRig {
  const root = createSvgElement('g', { id, 'data-rig': 'elaine-chao' });
  appendShape(root, 'path', {
    d: 'M13 92q4-43 33-50 36 4 43 50z',
    fill: NAVY,
    stroke: INK,
    'stroke-width': 3,
    'stroke-linejoin': 'round',
    'data-joint': 'jacket',
  });
  const head = createSvgElement('g', { 'data-joint': 'head' });
  appendShape(head, 'path', {
    d: 'M30 18q17-19 39 1 11 11 2 42-14 18-35 6-14-13-6-49z',
    fill: '#E4B18B',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(head, 'path', {
    d: 'M25 40q-8-36 20-41 34 4 35 38l-12-7-5-18q-22 7-35 28z',
    fill: '#2D2730',
    stroke: INK,
    'stroke-width': 3,
    'stroke-linejoin': 'round',
    'data-joint': 'hair',
  });
  const eyes = createSvgElement('g', { 'data-joint': 'eyes' });
  appendShape(eyes, 'path', {
    d: 'M40 39h7M59 39h7',
    stroke: INK,
    'stroke-width': 2.5,
    'stroke-linecap': 'round',
  });
  head.append(eyes);
  appendShape(head, 'path', {
    d: 'M47 53q7 4 14 0',
    stroke: '#A3443B',
    'stroke-width': 2,
    'stroke-linecap': 'round',
    fill: 'none',
    'data-joint': 'mouth',
  });
  root.append(head);
  const hand = appendShape(root, 'path', {
    d: 'M72 78q15-8 23 2l-13 10-15-4z',
    fill: '#E4B18B',
    stroke: INK,
    'stroke-width': 2.5,
    'stroke-linejoin': 'round',
    'data-joint': 'hand',
  });
  return { root, head, eyes, hand };
}

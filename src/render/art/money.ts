import { createSvgElement } from '../svg-dom';
import { appendShape, appendText, INK } from './shared';

export type MoneyBagVariant = 'small' | 'large' | 'satchel';

export interface MoneyBagRig {
  root: SVGGElement;
  bag: SVGPathElement | SVGRectElement;
  knot: SVGPathElement;
}

export function createMoneyBag(variant: MoneyBagVariant, id: string): MoneyBagRig {
  const root = createSvgElement('g', { id, 'data-rig': `money-${variant}` });
  let bag: SVGPathElement | SVGRectElement;
  if (variant === 'satchel') {
    bag = appendShape(root, 'rect', {
      x: -31,
      y: -7,
      width: 62,
      height: 48,
      rx: 10,
      fill: '#C88E4C',
      stroke: INK,
      'stroke-width': 4,
      'data-joint': 'bag',
    });
    appendShape(root, 'path', {
      d: 'M-17-7q0-25 34 0',
      fill: 'none',
      stroke: INK,
      'stroke-width': 5,
      'stroke-linecap': 'round',
    });
  } else {
    const size = variant === 'large' ? 1.2 : 0.9;
    bag = appendShape(root, 'path', {
      d: `M0 -35l${-22 * size} 12q${-15 * size} ${35 * size} 0 ${63 * size}q${38 * size} ${12 * size} ${62 * size} 0q${15 * size} ${-28 * size} 0 ${-63 * size}z`,
      fill: '#D7A55E',
      stroke: INK,
      'stroke-width': 4,
      'stroke-linejoin': 'round',
      'data-joint': 'bag',
    });
  }
  const knot = appendShape(root, 'path', {
    d: 'M-19-23h38l-7 11H-12z',
    fill: '#A76F38',
    stroke: INK,
    'stroke-width': 3,
    'stroke-linejoin': 'round',
    'data-joint': 'knot',
  });
  appendText(root, '$', {
    x: 0,
    y: 23,
    'text-anchor': 'middle',
    fill: '#2F7651',
    'font-size': 38,
    'font-weight': 900,
    'data-joint': 'dollar-mark',
  });
  return { root, bag, knot };
}

import { createSvgElement } from '../svg-dom';
import { createElaineRig, type ElaineRig } from './elaine';
import { appendShape, INK } from './shared';

export interface HelicopterRig {
  root: SVGGElement;
  rotor: SVGGElement;
  cockpit: SVGGElement;
  flag: SVGGElement;
  rope: SVGLineElement;
  hook: SVGGElement;
  elaine: ElaineRig;
}

function starPath(cx: number, cy: number, outerRadius: number, innerRadius: number): string {
  const points: string[] = [];
  for (let index = 0; index < 10; index += 1) {
    const angle = -Math.PI / 2 + (Math.PI * index) / 5;
    const radius = index % 2 === 0 ? outerRadius : innerRadius;
    points.push(`${cx + Math.cos(angle) * radius} ${cy + Math.sin(angle) * radius}`);
  }
  return `M${points.join('L')}z`;
}

export function createHelicopterRig(id = 'escape-helicopter'): HelicopterRig {
  const root = createSvgElement('g', { id, 'data-rig': 'cartoon-helicopter' });
  appendShape(root, 'path', {
    d: 'M0 111q17-91 141-91 121 0 150 91v42H0z',
    fill: '#C94142',
    stroke: INK,
    'stroke-width': 6,
    'stroke-linejoin': 'round',
    'data-joint': 'fuselage',
  });
  appendShape(root, 'path', {
    d: 'M272 80h163l35 22-35 25H272z',
    fill: '#C94142',
    stroke: INK,
    'stroke-width': 6,
    'stroke-linejoin': 'round',
    'data-joint': 'tail',
  });
  appendShape(root, 'circle', {
    cx: 474,
    cy: 102,
    r: 22,
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 4,
    'data-joint': 'tail-rotor',
  });
  const cockpit = createSvgElement('g', { 'data-joint': 'cockpit-glass' });
  appendShape(cockpit, 'path', {
    d: 'M52 69q11-43 63-43 49 0 67 43v54H39q1-38 13-54z',
    fill: '#A9D2E5',
    stroke: INK,
    'stroke-width': 4,
    'stroke-linejoin': 'round',
  });
  const elaine = createElaineRig('elaine-cockpit');
  elaine.root.setAttribute('transform', 'translate(67 34) scale(0.9)');
  cockpit.append(elaine.root);
  root.append(cockpit);

  const flag = createSvgElement('g', { 'data-joint': 'chinese-flag-decal' });
  appendShape(flag, 'rect', {
    x: 195,
    y: 63,
    width: 75,
    height: 48,
    rx: 3,
    fill: '#DE2910',
    stroke: INK,
    'stroke-width': 2.5,
  });
  appendShape(flag, 'path', { d: starPath(211, 77, 8, 3.6), fill: '#FFDE00' });
  for (const [x, y] of [
    [229, 69],
    [237, 78],
    [237, 89],
    [228, 98],
  ] as const) {
    appendShape(flag, 'path', { d: starPath(x, y, 3.7, 1.6), fill: '#FFDE00' });
  }
  root.append(flag);

  appendShape(root, 'path', {
    d: 'M50 157h183M70 157l-20 27M218 157l18 27',
    stroke: INK,
    'stroke-width': 7,
    'stroke-linecap': 'round',
    fill: 'none',
    'data-joint': 'landing-skids',
  });
  const rotor = createSvgElement('g', { 'data-joint': 'main-rotor' });
  appendShape(rotor, 'path', {
    d: 'M125 23v-57M4-34h245M125-34L17-65M125-34l108-31',
    stroke: INK,
    'stroke-width': 8,
    'stroke-linecap': 'round',
    fill: 'none',
  });
  root.append(rotor);
  const rope = appendShape(root, 'line', {
    x1: 157,
    y1: 145,
    x2: 157,
    y2: 145,
    stroke: '#E7D6AF',
    'stroke-width': 6,
    'stroke-linecap': 'round',
    'data-joint': 'rope',
  });
  const hook = createSvgElement('g', { 'data-joint': 'hook' });
  appendShape(hook, 'path', {
    d: 'M157 0v15q0 17 14 17 13 0 13-13',
    fill: 'none',
    stroke: INK,
    'stroke-width': 6,
    'stroke-linecap': 'round',
  });
  hook.setAttribute('transform', 'translate(0 145)');
  root.append(hook);
  return { root, rotor, cockpit, flag, rope, hook, elaine };
}

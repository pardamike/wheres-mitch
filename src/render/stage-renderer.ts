import type { GameState, MissMarker } from '../core/types';
import {
  createWashingtonScene,
  type CrowdActorModel,
  type WashingtonSceneModel,
} from '../scenes/washington';
import { clearSvg, createSvgElement, findSvgLayer, setTransform, svgText } from './svg-dom';

interface ActorNode {
  model: CrowdActorModel;
  element: SVGGElement;
}

interface MissEffectNode {
  element: SVGGElement;
  ring: SVGCircleElement;
  cross: SVGTextElement;
  shownAtMs: number;
}

interface CutsceneNodes {
  root: SVGGElement;
  dimmer: SVGRectElement;
  spotlight: SVGCircleElement;
  headline: SVGTextElement;
  caption: SVGTextElement;
  capitol: SVGGElement;
  helicopter: SVGGElement;
}

const INK = '#172033';
const PAPER = '#F7F0DE';

function addShape(
  parent: SVGElement,
  tagName: keyof SVGElementTagNameMap,
  attributes: Record<string, string | number>,
): SVGElement {
  const element = createSvgElement(tagName, attributes);
  parent.append(element);
  return element;
}

function drawCloud(parent: SVGElement, x: number, y: number, scale: number): void {
  const cloud = createSvgElement('g', { transform: `translate(${x} ${y}) scale(${scale})` });
  addShape(cloud, 'circle', { cx: 0, cy: 0, r: 28, fill: '#FFFDF7', opacity: 0.8 });
  addShape(cloud, 'circle', { cx: 38, cy: -8, r: 36, fill: '#FFFDF7', opacity: 0.8 });
  addShape(cloud, 'circle', { cx: 80, cy: 4, r: 23, fill: '#FFFDF7', opacity: 0.8 });
  addShape(cloud, 'rect', {
    x: -16,
    y: 0,
    width: 112,
    height: 28,
    rx: 14,
    fill: '#FFFDF7',
    opacity: 0.8,
  });
  parent.append(cloud);
}

function drawBuilding(
  parent: SVGElement,
  x: number,
  y: number,
  width: number,
  height: number,
  color: string,
): void {
  addShape(parent, 'rect', { x, y, width, height, fill: color, stroke: INK, 'stroke-width': 3 });
  const floors = Math.max(2, Math.floor(height / 78));
  const columns = Math.max(2, Math.floor(width / 55));
  for (let row = 0; row < floors; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      addShape(parent, 'rect', {
        x: x + 17 + column * ((width - 34) / columns),
        y: y + 22 + row * ((height - 36) / floors),
        width: 17,
        height: 27,
        rx: 3,
        fill: '#F7E7A5',
        stroke: '#4D718C',
        'stroke-width': 1.5,
      });
    }
  }
}

function drawBackground(parent: SVGElement): void {
  addShape(parent, 'rect', { width: 1440, height: 900, fill: '#A9C9E8' });
  addShape(parent, 'circle', {
    cx: 1170,
    cy: 140,
    r: 62,
    fill: '#F7D56A',
    stroke: INK,
    'stroke-width': 3,
  });
  drawCloud(parent, 145, 150, 1.2);
  drawCloud(parent, 800, 108, 0.85);
  addShape(parent, 'path', {
    d: 'M0 390 84 330l55 31 75-79 92 84 100-58 78 65 74-58 122 73 80-76 90 56 100-64 112 80 100-77 78 42v171H0z',
    fill: '#7288A7',
    opacity: 0.78,
  });
  drawBuilding(parent, 68, 266, 170, 270, '#D7C9B5');
  drawBuilding(parent, 258, 202, 210, 334, '#BDCCDA');
  drawBuilding(parent, 484, 286, 154, 250, '#E0BC9C');
  drawBuilding(parent, 1070, 242, 178, 294, '#D9C9AD');
  drawBuilding(parent, 1262, 310, 130, 226, '#B9C9D3');
  addShape(parent, 'path', {
    d: 'M642 422h255l-24-80-39-24-64-50-64 50-39 24z',
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(parent, 'path', {
    d: 'M730 319h80l-40-70z',
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(parent, 'rect', {
    x: 670,
    y: 422,
    width: 200,
    height: 114,
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 3,
  });
  for (let index = 0; index < 6; index += 1) {
    addShape(parent, 'rect', {
      x: 689 + index * 30,
      y: 444,
      width: 15,
      height: 70,
      fill: '#AEB8C6',
      stroke: INK,
      'stroke-width': 1.5,
    });
  }
  addShape(parent, 'path', { d: 'M0 530h1440v370H0z', fill: '#A8A29A' });
  addShape(parent, 'path', {
    d: 'M0 567h1440v138H0z',
    fill: '#38475D',
    stroke: INK,
    'stroke-width': 4,
  });
  addShape(parent, 'path', { d: 'M0 636h1440v18H0z', fill: '#F7F0DE' });
  for (let index = 0; index < 12; index += 1) {
    addShape(parent, 'rect', {
      x: 50 + index * 124,
      y: 636,
      width: 74,
      height: 18,
      fill: '#F7F0DE',
    });
  }
  addShape(parent, 'path', { d: 'M0 705h1440v195H0z', fill: '#D1C0A2' });
  addShape(parent, 'path', {
    d: 'M0 735h1440',
    stroke: '#FFFDF7',
    'stroke-width': 6,
    opacity: 0.8,
  });
}

function drawAmbient(parent: SVGElement): { bus: SVGGElement; taxi: SVGGElement } {
  const bus = createSvgElement('g', { id: 'city-bus', transform: 'translate(-300 460)' });
  addShape(bus, 'rect', {
    x: 0,
    y: 0,
    width: 315,
    height: 104,
    rx: 18,
    fill: '#D9443F',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(bus, 'rect', {
    x: 34,
    y: 22,
    width: 205,
    height: 43,
    rx: 6,
    fill: '#BAD8E8',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(bus, 'rect', {
    x: 248,
    y: 20,
    width: 41,
    height: 66,
    rx: 4,
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(bus, 'circle', { cx: 62, cy: 105, r: 20, fill: '#172033' });
  addShape(bus, 'circle', { cx: 258, cy: 105, r: 20, fill: '#172033' });
  parent.append(bus);

  const taxi = createSvgElement('g', { id: 'taxi', transform: 'translate(1210 687)' });
  addShape(taxi, 'path', {
    d: 'M0 55h220l-22-48H66z',
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 4,
  });
  addShape(taxi, 'rect', {
    x: 86,
    y: -6,
    width: 44,
    height: 14,
    rx: 3,
    fill: '#FFFDF7',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(taxi, 'circle', { cx: 48, cy: 60, r: 19, fill: INK });
  addShape(taxi, 'circle', { cx: 173, cy: 60, r: 19, fill: INK });
  parent.append(taxi);
  return { bus, taxi };
}

function drawStreetProps(parent: SVGElement): void {
  const metro = createSvgElement('g', { transform: 'translate(110 522)' });
  addShape(metro, 'rect', {
    x: 0,
    y: 0,
    width: 236,
    height: 118,
    fill: '#40546F',
    stroke: INK,
    'stroke-width': 4,
  });
  addShape(metro, 'path', {
    d: 'M0 0 34-49h172l30 49z',
    fill: '#2E5EAA',
    stroke: INK,
    'stroke-width': 4,
  });
  metro.append(
    svgText('METRO', { x: 73, y: -15, fill: PAPER, 'font-size': 26, 'font-weight': 900 }),
  );
  for (let index = 0; index < 8; index += 1) {
    addShape(metro, 'path', {
      d: `M${20 + index * 26} 20v93`,
      stroke: '#7E94AA',
      'stroke-width': 5,
    });
  }
  parent.append(metro);

  const foodCart = createSvgElement('g', { transform: 'translate(940 521)' });
  addShape(foodCart, 'rect', {
    x: 12,
    y: 56,
    width: 212,
    height: 121,
    rx: 12,
    fill: '#D4794A',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(foodCart, 'path', {
    d: 'M0 56h236l-22-78H24z',
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(foodCart, 'circle', { cx: 57, cy: 181, r: 18, fill: INK });
  addShape(foodCart, 'circle', { cx: 178, cy: 181, r: 18, fill: INK });
  foodCart.append(
    svgText('TURTLE DOGS', { x: 37, y: 119, fill: PAPER, 'font-size': 18, 'font-weight': 900 }),
  );
  parent.append(foodCart);

  const shelter = createSvgElement('g', { transform: 'translate(500 436)' });
  addShape(shelter, 'rect', {
    x: 0,
    y: 0,
    width: 235,
    height: 203,
    fill: '#8FA8B6',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(shelter, 'rect', {
    x: 18,
    y: 23,
    width: 91,
    height: 148,
    fill: '#C9E0EC',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(shelter, 'rect', {
    x: 125,
    y: 23,
    width: 91,
    height: 148,
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 3,
  });
  shelter.append(
    svgText('LOCAL HERO', { x: 135, y: 95, fill: INK, 'font-size': 14, 'font-weight': 900 }),
  );
  parent.append(shelter);

  for (const [x, y] of [
    [370, 668],
    [405, 660],
    [1220, 650],
  ] as const) {
    addShape(parent, 'rect', {
      x,
      y,
      width: 28,
      height: 58,
      rx: 4,
      fill: '#2E5EAA',
      stroke: INK,
      'stroke-width': 3,
    });
  }
}

function drawTree(parent: SVGElement, x: number, y: number, scale: number): SVGGElement {
  const tree = createSvgElement('g', {
    transform: `translate(${x} ${y}) scale(${scale})`,
    'data-occluder': 'tree',
  });
  addShape(tree, 'path', {
    d: 'M45 290 80 96l37 194z',
    fill: '#765238',
    stroke: INK,
    'stroke-width': 5,
  });
  for (const [cx, cy, radius] of [
    [0, 70, 72],
    [70, 22, 86],
    [154, 77, 78],
    [106, 116, 85],
  ] as const) {
    addShape(tree, 'circle', {
      cx,
      cy,
      r: radius,
      fill: '#557A46',
      stroke: INK,
      'stroke-width': 5,
    });
  }
  return tree;
}

function drawActor(model: CrowdActorModel): SVGGElement {
  const actor = createSvgElement('g', {
    id: model.id,
    'data-actor': model.activity,
    'pointer-events': 'none',
  });
  addShape(actor, 'ellipse', { cx: 0, cy: 28, rx: 21, ry: 7, fill: '#172033', opacity: 0.16 });
  addShape(actor, 'rect', {
    x: -14,
    y: -8,
    width: 28,
    height: 37,
    rx: 9,
    fill: model.color,
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(actor, 'circle', {
    cx: 0,
    cy: -25,
    r: 17,
    fill: model.skin,
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(actor, 'path', {
    d: 'M-15-28q15-25 30 0v7h-30z',
    fill: model.hair,
    stroke: INK,
    'stroke-width': 2.5,
  });
  addShape(actor, 'path', {
    d: 'M-9 29v17M9 29v17',
    stroke: INK,
    'stroke-width': 4,
    'stroke-linecap': 'round',
  });
  addShape(actor, 'path', {
    d: 'M-14 4-27 19M14 4 27 19',
    stroke: INK,
    'stroke-width': 4,
    'stroke-linecap': 'round',
  });
  if (model.accessory === 'hat') {
    addShape(actor, 'path', {
      d: 'M-20-39h40l-8-12H-9z',
      fill: '#F2C14E',
      stroke: INK,
      'stroke-width': 2.5,
    });
  }
  if (model.accessory === 'bag') {
    addShape(actor, 'rect', {
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
  if (model.accessory === 'coffee') {
    addShape(actor, 'rect', {
      x: 23,
      y: 14,
      width: 8,
      height: 16,
      fill: PAPER,
      stroke: INK,
      'stroke-width': 2,
    });
  }
  if (model.accessory === 'camera') {
    addShape(actor, 'rect', {
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
  return actor;
}

function drawMitch(): { root: SVGGElement; hitTarget: SVGCircleElement } {
  const root = createSvgElement('g', { id: 'mitch-root', 'data-game-target': 'mitch' });
  addShape(root, 'ellipse', { cx: 0, cy: 50, rx: 73, ry: 16, fill: INK, opacity: 0.2 });
  addShape(root, 'path', {
    d: 'M-61 21-92 42M-44 42-65 67M53 22 84 43M41 44 61 68',
    stroke: '#718C51',
    'stroke-width': 18,
    'stroke-linecap': 'round',
  });
  addShape(root, 'ellipse', {
    cx: 0,
    cy: 17,
    rx: 79,
    ry: 55,
    fill: '#765238',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(root, 'path', {
    d: 'M-58 17H58M-42-18 43 49M43-18-43 49',
    stroke: '#9B744D',
    'stroke-width': 4,
    'stroke-linecap': 'round',
  });
  addShape(root, 'ellipse', {
    cx: -74,
    cy: 10,
    rx: 34,
    ry: 27,
    fill: '#718C51',
    stroke: INK,
    'stroke-width': 4,
  });
  addShape(root, 'path', {
    d: 'M-83 4q-9-65 39-68 40 4 31 59l-15 25-40-1z',
    fill: '#F1C6A4',
    stroke: INK,
    'stroke-width': 4,
  });
  addShape(root, 'path', {
    d: 'M-91-44q29-32 57-3l-6 16-50-1z',
    fill: '#E4D1BB',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(root, 'path', {
    d: 'M-72-28h12M-43-28h12',
    stroke: INK,
    'stroke-width': 3,
    'stroke-linecap': 'round',
  });
  addShape(root, 'path', { d: 'M-73-27h15M-44-27h15', stroke: '#6E798D', 'stroke-width': 2 });
  addShape(root, 'path', {
    d: 'M-63-12q8 5 15 0',
    fill: 'none',
    stroke: '#A3443B',
    'stroke-width': 3,
    'stroke-linecap': 'round',
  });
  addShape(root, 'path', {
    d: 'M-42-7 3 1-15 34-53 12z',
    fill: '#273E68',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(root, 'path', {
    d: 'M-27 1-17 22-6 1',
    fill: '#C94A43',
    stroke: INK,
    'stroke-width': 2,
  });
  const hitTarget = createSvgElement('circle', {
    cx: -42,
    cy: -15,
    r: 69,
    fill: '#FFFFFF',
    'fill-opacity': 0,
    stroke: 'none',
    'pointer-events': 'all',
    'data-game-target': 'mitch',
  });
  root.append(hitTarget);
  return { root, hitTarget };
}

function createMissPool(parent: SVGElement, count: number): MissEffectNode[] {
  const effects: MissEffectNode[] = [];
  for (let index = 0; index < count; index += 1) {
    const element = createSvgElement('g', { opacity: 0, 'pointer-events': 'none' });
    const ring = createSvgElement('circle', {
      r: 28,
      fill: 'none',
      stroke: '#D9443F',
      'stroke-width': 6,
    });
    const cross = svgText('×', {
      x: -11,
      y: 11,
      fill: '#D9443F',
      'font-size': 44,
      'font-weight': 900,
    });
    element.append(ring, cross);
    parent.append(element);
    effects.push({ element, ring, cross, shownAtMs: Number.NEGATIVE_INFINITY });
  }
  return effects;
}

function drawCapitol(parent: SVGElement): SVGGElement {
  const capitol = createSvgElement('g', { transform: 'translate(955 130)', opacity: 0 });
  addShape(capitol, 'path', {
    d: 'M0 230h380L346 115l-55-34-101-79-101 79-55 34z',
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(capitol, 'path', {
    d: 'M138 80q52-95 104 0z',
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(capitol, 'rect', {
    x: 35,
    y: 230,
    width: 310,
    height: 105,
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 5,
  });
  addShape(capitol, 'rect', {
    x: 163,
    y: 238,
    width: 54,
    height: 97,
    fill: '#273E68',
    stroke: INK,
    'stroke-width': 4,
  });
  for (let index = 0; index < 7; index += 1) {
    addShape(capitol, 'rect', {
      x: 57 + index * 42,
      y: 245,
      width: 17,
      height: 67,
      fill: '#AEB8C6',
      stroke: INK,
      'stroke-width': 2,
    });
  }
  parent.append(capitol);
  return capitol;
}

function drawHelicopter(parent: SVGElement): SVGGElement {
  const helicopter = createSvgElement('g', { transform: 'translate(1550 140)', opacity: 0 });
  addShape(helicopter, 'path', {
    d: 'M0 105q15-87 133-87 115 0 139 87v39H0z',
    fill: '#B82025',
    stroke: INK,
    'stroke-width': 6,
  });
  addShape(helicopter, 'path', {
    d: 'M255 75h170l30 22-30 23H255z',
    fill: '#B82025',
    stroke: INK,
    'stroke-width': 6,
  });
  addShape(helicopter, 'circle', {
    cx: 456,
    cy: 97,
    r: 22,
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 4,
  });
  addShape(helicopter, 'path', {
    d: 'M58 63h103v67H35q0-58 23-67z',
    fill: '#A9D2E5',
    stroke: INK,
    'stroke-width': 4,
  });
  addShape(helicopter, 'rect', {
    x: 183,
    y: 59,
    width: 61,
    height: 42,
    rx: 3,
    fill: '#DE2910',
    stroke: INK,
    'stroke-width': 3,
  });
  addShape(helicopter, 'path', {
    d: 'm194 69 7 2-5 5 1 8-7-5-7 5 2-8-6-5 8-2 2-7z',
    fill: '#FFDE00',
  });
  addShape(helicopter, 'path', {
    d: 'M112 18v-56M-5-42h235M112-42l-101-29M112-42l101-29',
    stroke: INK,
    'stroke-width': 8,
    'stroke-linecap': 'round',
  });
  addShape(helicopter, 'path', {
    d: 'M46 152h169M65 152l-18 26M198 152l17 26',
    stroke: INK,
    'stroke-width': 7,
    'stroke-linecap': 'round',
  });
  parent.append(helicopter);
  return helicopter;
}

function createCutscene(parent: SVGElement): CutsceneNodes {
  const root = createSvgElement('g', { display: 'none', 'pointer-events': 'none' });
  const dimmer = createSvgElement('rect', {
    width: 1440,
    height: 900,
    fill: '#172033',
    opacity: 0.62,
  });
  const spotlight = createSvgElement('circle', {
    cx: 720,
    cy: 500,
    r: 270,
    fill: '#F2C14E',
    opacity: 0.23,
  });
  const headline = svgText('', {
    x: 720,
    y: 164,
    'text-anchor': 'middle',
    fill: PAPER,
    stroke: INK,
    'stroke-width': 2,
    'paint-order': 'stroke',
    'font-size': 75,
    'font-family': 'Arial Rounded MT Bold, Trebuchet MS, sans-serif',
    'font-weight': 900,
  });
  const caption = svgText('', {
    x: 720,
    y: 222,
    'text-anchor': 'middle',
    fill: PAPER,
    'font-size': 28,
    'font-weight': 800,
  });
  root.append(dimmer, spotlight, headline, caption);
  const capitol = drawCapitol(root);
  const helicopter = drawHelicopter(root);
  parent.append(root);
  return { root, dimmer, spotlight, headline, caption, capitol, helicopter };
}

export class StageRenderer {
  private readonly backgroundLayer: SVGGElement;
  private readonly ambientLayer: SVGGElement;
  private readonly backActorsLayer: SVGGElement;
  private readonly actorLayer: SVGGElement;
  private readonly occluderLayer: SVGGElement;
  private readonly effectsLayer: SVGGElement;
  private readonly cutsceneLayer: SVGGElement;
  private actorNodes: ActorNode[] = [];
  private missEffects: MissEffectNode[] = [];
  private activeMissId = 0;
  private activeScene: WashingtonSceneModel | null = null;
  private mitchRoot: SVGGElement | null = null;
  private mitchHitTarget: SVGCircleElement | null = null;
  private bus: SVGGElement | null = null;
  private taxi: SVGGElement | null = null;
  private cutscene: CutsceneNodes | null = null;

  constructor(private readonly stage: SVGSVGElement) {
    this.backgroundLayer = findSvgLayer(stage, 'background');
    this.ambientLayer = findSvgLayer(stage, 'far-ambient');
    this.backActorsLayer = findSvgLayer(stage, 'back-actors');
    this.actorLayer = findSvgLayer(stage, 'target-and-actors');
    this.occluderLayer = findSvgLayer(stage, 'front-occluders');
    this.effectsLayer = findSvgLayer(stage, 'effects');
    this.cutsceneLayer = findSvgLayer(stage, 'cutscene');
  }

  buildWashington(seed: number): WashingtonSceneModel {
    const scene = createWashingtonScene(seed);
    this.activeScene = scene;
    for (const layer of [
      this.backgroundLayer,
      this.ambientLayer,
      this.backActorsLayer,
      this.actorLayer,
      this.occluderLayer,
      this.effectsLayer,
      this.cutsceneLayer,
    ]) {
      clearSvg(layer);
    }

    drawBackground(this.backgroundLayer);
    const vehicles = drawAmbient(this.ambientLayer);
    this.bus = vehicles.bus;
    this.taxi = vehicles.taxi;
    drawStreetProps(this.ambientLayer);

    this.actorNodes = scene.actors.map((model) => {
      const element = drawActor(model);
      (model.lane === 'back' ? this.backActorsLayer : this.actorLayer).append(element);
      return { model, element };
    });

    const mitch = drawMitch();
    this.mitchRoot = mitch.root;
    this.mitchHitTarget = mitch.hitTarget;
    this.actorLayer.append(mitch.root);
    this.occluderLayer.append(drawTree(this.occluderLayer, 1260, 387, 0.78));
    this.occluderLayer.append(drawTree(this.occluderLayer, 337, 398, 0.65));

    const shelterPanel = createSvgElement('rect', {
      x: 625,
      y: 459,
      width: 92,
      height: 148,
      fill: '#F2C14E',
      'fill-opacity': 0.28,
      stroke: 'none',
      'pointer-events': 'all',
      'data-occluder': 'shelter-panel',
    });
    this.occluderLayer.append(shelterPanel);
    this.missEffects = createMissPool(this.effectsLayer, 12);
    this.cutscene = createCutscene(this.cutsceneLayer);
    return scene;
  }

  render(state: GameState, clockMs: number, modeElapsedMs: number, reducedMotion: boolean): void {
    if (!this.activeScene || !this.mitchRoot || !this.mitchHitTarget || !this.cutscene) {
      return;
    }

    const seconds = clockMs / 1000;
    const crowdMotion = reducedMotion ? 0.7 : 1;
    for (const actor of this.actorNodes) {
      const moving = actor.model.activity === 'commute' || actor.model.activity === 'interact';
      const xOffset = moving
        ? Math.sin(seconds * actor.model.speed * crowdMotion + actor.model.phase) * actor.model.sway
        : 0;
      const yOffset = Math.sin(seconds * 2.2 * crowdMotion + actor.model.phase) * 2.5;
      const bob = moving ? Math.sin(seconds * 7 * crowdMotion + actor.model.phase) * 2 : 0;
      setTransform(
        actor.element,
        `translate(${actor.model.x + xOffset} ${actor.model.y + yOffset + bob}) scale(${actor.model.scale})`,
      );
    }

    if (this.bus) {
      setTransform(this.bus, `translate(${((clockMs * 0.025) % 1830) - 330} 460)`);
    }
    if (this.taxi) {
      setTransform(this.taxi, `translate(${1210 - ((clockMs * 0.017) % 780)} 687)`);
    }

    const mitchWobble = Math.sin(seconds * 2.8) * 16;
    const mitchScuttle = Math.sin(seconds * 1.15) * 48;
    const mitchY = this.activeScene.mitchStart.y + Math.sin(seconds * 3.4) * 4;
    setTransform(
      this.mitchRoot,
      `translate(${this.activeScene.mitchStart.x + mitchScuttle} ${mitchY}) scale(1.02)`,
    );
    this.mitchRoot.setAttribute('opacity', state.mode === 'mitch_escape' ? '0.45' : '1');
    this.mitchRoot.style.pointerEvents = state.mode === 'playing' ? 'all' : 'none';
    this.mitchHitTarget.setAttribute('r', String(69 + mitchWobble * 0.04));

    if (state.lastMiss && state.lastMiss.id !== this.activeMissId) {
      this.showMiss(state.lastMiss, clockMs);
      this.activeMissId = state.lastMiss.id;
    }
    this.updateMissEffects(clockMs);
    this.updateCutscene(state, modeElapsedMs, reducedMotion);
  }

  private showMiss(marker: MissMarker, clockMs: number): void {
    const effect =
      this.missEffects.find((candidate) => clockMs - candidate.shownAtMs > 300) ??
      this.missEffects[0];
    if (!effect) {
      return;
    }
    effect.shownAtMs = clockMs;
    setTransform(effect.element, `translate(${marker.x} ${marker.y}) scale(1)`);
    effect.element.setAttribute('opacity', '1');
  }

  private updateMissEffects(clockMs: number): void {
    for (const effect of this.missEffects) {
      const elapsed = clockMs - effect.shownAtMs;
      if (elapsed < 0 || elapsed >= 300) {
        effect.element.setAttribute('opacity', '0');
        continue;
      }
      const progress = elapsed / 300;
      const scale = 1 + progress * 0.56;
      setTransform(
        effect.element,
        `${effect.element.getAttribute('transform')?.split(' scale')[0] ?? ''} scale(${scale})`,
      );
      effect.ring.setAttribute('opacity', String(1 - progress));
      effect.cross.setAttribute('opacity', String(Math.max(0, 1 - progress * 1.65)));
    }
  }

  private updateCutscene(state: GameState, elapsedMs: number, reducedMotion: boolean): void {
    const cutscene = this.cutscene;
    if (!cutscene) {
      return;
    }
    const active = state.mode === 'player_capture' || state.mode === 'mitch_escape';
    cutscene.root.setAttribute('display', active ? 'inline' : 'none');
    if (!active) {
      return;
    }

    const progress = Math.min(
      1,
      elapsedMs / (reducedMotion ? 900 : state.mode === 'player_capture' ? 1450 : 1800),
    );
    cutscene.dimmer.setAttribute('opacity', state.mode === 'player_capture' ? '0.53' : '0.62');
    cutscene.spotlight.setAttribute(
      'opacity',
      state.mode === 'player_capture' ? String(0.14 + progress * 0.19) : '0',
    );

    if (state.mode === 'player_capture') {
      cutscene.headline.textContent = 'FOUND HIM!';
      cutscene.caption.textContent = 'Dispatching one very determined turtle…';
      cutscene.capitol.setAttribute('opacity', String(Math.min(1, progress * 1.5)));
      setTransform(
        cutscene.capitol,
        `translate(${955 - progress * 130} ${130 + Math.sin(progress * Math.PI) * -18}) scale(${0.85 + progress * 0.15})`,
      );
      cutscene.helicopter.setAttribute('opacity', '0');
    } else {
      cutscene.headline.textContent = 'MITCH GOT AWAY';
      cutscene.caption.textContent = 'Something very cartoonish is happening…';
      cutscene.capitol.setAttribute('opacity', '0');
      cutscene.helicopter.setAttribute('opacity', String(Math.min(1, progress * 1.4)));
      setTransform(
        cutscene.helicopter,
        `translate(${1550 - progress * 920} ${140 - Math.sin(progress * Math.PI) * 24})`,
      );
    }
  }
}

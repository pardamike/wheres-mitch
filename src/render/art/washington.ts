import type { SceneStageBuilder } from '../scene-stage';
import { createSvgElement, setTransform, svgText } from '../svg-dom';
import { appendShape, INK, PAPER } from './shared';

function drawCloud(parent: SVGElement, x: number, y: number, scale: number): void {
  const cloud = createSvgElement('g', { transform: `translate(${x} ${y}) scale(${scale})` });
  appendShape(cloud, 'circle', { cx: 0, cy: 0, r: 28, fill: '#FFFDF7', opacity: 0.8 });
  appendShape(cloud, 'circle', { cx: 38, cy: -8, r: 36, fill: '#FFFDF7', opacity: 0.8 });
  appendShape(cloud, 'circle', { cx: 80, cy: 4, r: 23, fill: '#FFFDF7', opacity: 0.8 });
  appendShape(cloud, 'rect', {
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
  appendShape(parent, 'rect', { x, y, width, height, fill: color, stroke: INK, 'stroke-width': 3 });
  const floors = Math.max(2, Math.floor(height / 78));
  const columns = Math.max(2, Math.floor(width / 55));
  for (let row = 0; row < floors; row += 1) {
    for (let column = 0; column < columns; column += 1) {
      appendShape(parent, 'rect', {
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

function drawBackground(parent: SVGElement, paletteId: string): void {
  const dusk = paletteId === 'washington-dusk';
  appendShape(parent, 'rect', { width: 1440, height: 900, fill: dusk ? '#C89E92' : '#A9C9E8' });
  appendShape(parent, 'circle', {
    cx: 1170,
    cy: 140,
    r: 62,
    fill: '#F7D56A',
    stroke: INK,
    'stroke-width': 3,
  });
  drawCloud(parent, 145, 150, 1.2);
  drawCloud(parent, 800, 108, 0.85);
  appendShape(parent, 'path', {
    d: 'M0 390 84 330l55 31 75-79 92 84 100-58 78 65 74-58 122 73 80-76 90 56 100-64 112 80 100-77 78 42v171H0z',
    fill: dusk ? '#786F91' : '#7288A7',
    opacity: 0.78,
  });
  drawBuilding(parent, 68, 266, 170, 270, '#D7C9B5');
  drawBuilding(parent, 258, 202, 210, 334, '#BDCCDA');
  drawBuilding(parent, 484, 286, 154, 250, '#E0BC9C');
  drawBuilding(parent, 1070, 242, 178, 294, '#D9C9AD');
  drawBuilding(parent, 1262, 310, 130, 226, '#B9C9D3');
  appendShape(parent, 'path', {
    d: 'M642 422h255l-24-80-39-24-64-50-64 50-39 24z',
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(parent, 'path', {
    d: 'M730 319h80l-40-70z',
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(parent, 'rect', {
    x: 670,
    y: 422,
    width: 200,
    height: 114,
    fill: '#E9E7E0',
    stroke: INK,
    'stroke-width': 3,
  });
  for (let index = 0; index < 6; index += 1) {
    appendShape(parent, 'rect', {
      x: 689 + index * 30,
      y: 444,
      width: 15,
      height: 70,
      fill: '#AEB8C6',
      stroke: INK,
      'stroke-width': 1.5,
    });
  }
  appendShape(parent, 'path', { d: 'M0 530h1440v370H0z', fill: '#A8A29A' });
  appendShape(parent, 'path', {
    d: 'M0 567h1440v138H0z',
    fill: '#38475D',
    stroke: INK,
    'stroke-width': 4,
  });
  appendShape(parent, 'path', { d: 'M0 636h1440v18H0z', fill: '#F7F0DE' });
  for (let index = 0; index < 12; index += 1) {
    appendShape(parent, 'rect', {
      x: 50 + index * 124,
      y: 636,
      width: 74,
      height: 18,
      fill: '#F7F0DE',
    });
  }
  appendShape(parent, 'path', { d: 'M0 705h1440v195H0z', fill: '#D1C0A2' });
  appendShape(parent, 'path', {
    d: 'M0 735h1440',
    stroke: '#FFFDF7',
    'stroke-width': 6,
    opacity: 0.8,
  });
}

function drawAmbient(parent: SVGElement, propId: string): { bus: SVGGElement; taxi: SVGGElement } {
  const bus = createSvgElement('g', { id: 'city-bus', transform: 'translate(-300 460)' });
  appendShape(bus, 'rect', {
    x: 0,
    y: 0,
    width: 315,
    height: 104,
    rx: 18,
    fill: propId === 'washington-blue-awning' ? '#2E5EAA' : '#D9443F',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(bus, 'rect', {
    x: 34,
    y: 22,
    width: 205,
    height: 43,
    rx: 6,
    fill: '#BAD8E8',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(bus, 'rect', {
    x: 248,
    y: 20,
    width: 41,
    height: 66,
    rx: 4,
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(bus, 'circle', { cx: 62, cy: 105, r: 20, fill: INK });
  appendShape(bus, 'circle', { cx: 258, cy: 105, r: 20, fill: INK });
  parent.append(bus);

  const taxi = createSvgElement('g', { id: 'taxi', transform: 'translate(1210 687)' });
  appendShape(taxi, 'path', {
    d: 'M0 55h220l-22-48H66z',
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 4,
  });
  appendShape(taxi, 'rect', {
    x: 86,
    y: -6,
    width: 44,
    height: 14,
    rx: 3,
    fill: '#FFFDF7',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(taxi, 'circle', { cx: 48, cy: 60, r: 19, fill: INK });
  appendShape(taxi, 'circle', { cx: 173, cy: 60, r: 19, fill: INK });
  parent.append(taxi);
  return { bus, taxi };
}

function drawStreetProps(parent: SVGElement): void {
  const metro = createSvgElement('g', { transform: 'translate(110 522)' });
  appendShape(metro, 'rect', {
    x: 0,
    y: 0,
    width: 236,
    height: 118,
    fill: '#40546F',
    stroke: INK,
    'stroke-width': 4,
  });
  appendShape(metro, 'path', {
    d: 'M0 0 34-49h172l30 49z',
    fill: '#2E5EAA',
    stroke: INK,
    'stroke-width': 4,
  });
  metro.append(
    svgText('METRO', { x: 73, y: -15, fill: PAPER, 'font-size': 26, 'font-weight': 900 }),
  );
  for (let index = 0; index < 8; index += 1) {
    appendShape(metro, 'path', {
      d: `M${20 + index * 26} 20v93`,
      stroke: '#7E94AA',
      'stroke-width': 5,
    });
  }
  parent.append(metro);

  const foodCart = createSvgElement('g', { transform: 'translate(940 521)' });
  appendShape(foodCart, 'rect', {
    x: 12,
    y: 56,
    width: 212,
    height: 121,
    rx: 12,
    fill: '#D4794A',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(foodCart, 'path', {
    d: 'M0 56h236l-22-78H24z',
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(foodCart, 'circle', { cx: 57, cy: 181, r: 18, fill: INK });
  appendShape(foodCart, 'circle', { cx: 178, cy: 181, r: 18, fill: INK });
  foodCart.append(
    svgText('TURTLE DOGS', { x: 37, y: 119, fill: PAPER, 'font-size': 18, 'font-weight': 900 }),
  );
  parent.append(foodCart);

  const shelter = createSvgElement('g', { transform: 'translate(500 436)' });
  appendShape(shelter, 'rect', {
    x: 0,
    y: 0,
    width: 235,
    height: 203,
    fill: '#8FA8B6',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(shelter, 'rect', {
    x: 18,
    y: 23,
    width: 91,
    height: 148,
    fill: '#C9E0EC',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(shelter, 'rect', {
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
    appendShape(parent, 'rect', {
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

function drawTree(id: string, x: number, y: number, scale: number): SVGGElement {
  const tree = createSvgElement('g', {
    transform: `translate(${x} ${y}) scale(${scale})`,
    'data-occluder': id,
  });
  appendShape(tree, 'path', {
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
    appendShape(tree, 'circle', {
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

export const buildWashingtonStage: SceneStageBuilder = ({ layers, variation }) => {
  layers.background.setAttribute('data-scene-art', 'washington');
  drawBackground(layers.background, variation.paletteId);
  const vehicles = drawAmbient(layers.ambient, variation.propId);
  drawStreetProps(layers.ambient);
  layers.occluders.append(drawTree('east-tree', 1260, 387, 0.78));
  layers.occluders.append(drawTree('west-tree', 337, 398, 0.65));
  layers.occluders.append(
    createSvgElement('rect', {
      x: 625,
      y: 459,
      width: 92,
      height: 148,
      fill: '#F2C14E',
      'fill-opacity': 1,
      stroke: 'none',
      'pointer-events': 'all',
      'data-occluder': 'shelter-panel',
    }),
  );
  return {
    updateAmbient(clockMs: number): void {
      setTransform(vehicles.bus, `translate(${((clockMs * 0.025) % 1830) - 330} 460)`);
      setTransform(vehicles.taxi, `translate(${1210 - ((clockMs * 0.017) % 780)} 687)`);
    },
  };
};

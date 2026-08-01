import type { SceneStageBuilder } from '../scene-stage';
import { createSvgElement, setTransform, svgText } from '../svg-dom';
import { appendShape, INK, PAPER } from './shared';

const WINDOW_BLUE = '#77AFC4';
const WINDOW_NIGHT = '#496E93';
const STEEL = '#586879';
const NAVY = '#273E68';
const AMBER = '#D99C43';
const GOLD = '#F2C14E';

function drawWindowWall(parent: SVGElement, paletteId: string): void {
  const night = paletteId === 'airport-night';
  const sky = night ? WINDOW_NIGHT : WINDOW_BLUE;
  appendShape(parent, 'rect', { width: 1440, height: 900, fill: '#D6DEE2' });
  appendShape(parent, 'rect', { x: 0, y: 0, width: 1440, height: 92, fill: '#F4F0E6' });
  appendShape(parent, 'path', {
    d: 'M0 92h1440v18H0z',
    fill: '#A7B4BD',
    stroke: INK,
    'stroke-width': 3,
  });
  appendShape(parent, 'rect', {
    x: 54,
    y: 122,
    width: 1332,
    height: 329,
    fill: sky,
    stroke: INK,
    'stroke-width': 7,
  });
  for (let index = 0; index < 9; index += 1) {
    appendShape(parent, 'rect', {
      x: 71 + index * 144,
      y: 137,
      width: 20,
      height: 300,
      fill: '#C9D2D7',
      stroke: INK,
      'stroke-width': 3,
    });
  }
  appendShape(parent, 'path', {
    d: 'M61 365q320-40 600 4t710-8v75H61z',
    fill: night ? '#758A9D' : '#AFC4C9',
    opacity: 0.82,
  });
  appendShape(parent, 'path', {
    d: 'M55 438h1332v117H55z',
    fill: '#AEB8BE',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(parent, 'path', { d: 'M0 554h1440v346H0z', fill: '#B8B2A9' });
  appendShape(parent, 'path', { d: 'M0 661h1440v239H0z', fill: '#938D88' });
  for (let index = 0; index < 8; index += 1) {
    appendShape(parent, 'path', {
      d: `M${index * 205} 662l106 238`,
      stroke: '#D9D3C7',
      'stroke-width': 4,
      opacity: 0.58,
    });
  }
  for (let index = 0; index < 3; index += 1) {
    const x = 278 + index * 352;
    appendShape(parent, 'path', { d: `M${x} 438v117`, stroke: STEEL, 'stroke-width': 15 });
    appendShape(parent, 'circle', {
      cx: x,
      cy: 438,
      r: 17,
      fill: '#DCE5E8',
      stroke: INK,
      'stroke-width': 4,
    });
  }
}

function drawDepartureBoard(parent: SVGElement, propId: string): SVGGElement {
  const board = createSvgElement('g', {
    id: 'airport-departure-board',
    transform: 'translate(121 185)',
    'pointer-events': 'none',
  });
  appendShape(board, 'rect', {
    x: 0,
    y: 0,
    width: 305,
    height: 173,
    rx: 12,
    fill: NAVY,
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(board, 'rect', {
    x: 15,
    y: 38,
    width: 275,
    height: 115,
    fill: '#182838',
    stroke: '#EEF3EA',
    'stroke-width': 2,
  });
  board.append(
    svgText('DEPARTURES-ish', { x: 41, y: 27, fill: PAPER, 'font-size': 21, 'font-weight': 900 }),
  );
  const rows =
    propId === 'airport-gate-teal'
      ? ['8:20  TULIP BAY', '8:45  CLOUD CITY', '9:05  WEST GATE']
      : ['8:20  LANTERN BAY', '8:45  NEW SPRING', '9:05  GATE 12'];
  for (const [index, row] of rows.entries()) {
    board.append(
      svgText(row, {
        x: 29,
        y: 68 + index * 30,
        fill: '#D5EFC4',
        'font-size': 16,
        'font-family': 'monospace',
        'font-weight': 700,
      }),
    );
  }
  parent.append(board);
  return board;
}

function drawPlane(parent: SVGElement): SVGGElement {
  const plane = createSvgElement('g', {
    id: 'airport-plane',
    transform: 'translate(-310 268)',
    'pointer-events': 'none',
  });
  appendShape(plane, 'path', {
    d: 'M0 35h275l72-57h37l-43 57h90l32 19h-124l-61 80h-34l30-80H84l-42 35H13l22-35H0z',
    fill: '#E7E9E3',
    stroke: INK,
    'stroke-width': 5,
    'stroke-linejoin': 'round',
  });
  appendShape(plane, 'circle', { cx: 169, cy: 27, r: 7, fill: '#75B1C5' });
  appendShape(plane, 'circle', { cx: 195, cy: 27, r: 7, fill: '#75B1C5' });
  appendShape(plane, 'path', { d: 'M50 38h136', stroke: '#D35C52', 'stroke-width': 8 });
  parent.append(plane);
  return plane;
}

function drawWalkway(parent: SVGElement): {
  tread: SVGGElement;
  cart: SVGGElement;
  plane: SVGGElement;
  board: SVGGElement;
} {
  const walkway = createSvgElement('g', {
    id: 'airport-walkway',
    transform: 'translate(386 548)',
    'pointer-events': 'none',
  });
  appendShape(walkway, 'path', {
    d: 'M0 0h620l86 180H82z',
    fill: '#5F7584',
    stroke: INK,
    'stroke-width': 7,
  });
  appendShape(walkway, 'path', {
    d: 'M18 10h585l79 160H102z',
    fill: '#83A7B5',
    stroke: INK,
    'stroke-width': 5,
  });
  const tread = createSvgElement('g', { id: 'airport-walkway-treads' });
  for (let index = -2; index < 14; index += 1) {
    appendShape(tread, 'path', {
      d: `M${index * 66} 15l72 159`,
      stroke: '#E8E2D6',
      'stroke-width': 8,
      opacity: 0.7,
    });
  }
  walkway.append(tread);
  appendShape(walkway, 'path', {
    d: 'M0 0h620M82 180h624',
    stroke: '#D9A441',
    'stroke-width': 13,
    'stroke-linecap': 'round',
  });
  parent.append(walkway);

  const cart = createSvgElement('g', {
    id: 'airport-luggage-cart',
    transform: 'translate(1170 595)',
    'pointer-events': 'none',
  });
  appendShape(cart, 'path', {
    d: 'M0 61h163l-13-65h-26l-11 42H20z',
    fill: 'none',
    stroke: INK,
    'stroke-width': 7,
    'stroke-linejoin': 'round',
  });
  appendShape(cart, 'rect', {
    x: 32,
    y: 2,
    width: 57,
    height: 44,
    rx: 6,
    fill: '#C95C4E',
    stroke: INK,
    'stroke-width': 4,
  });
  appendShape(cart, 'rect', {
    x: 90,
    y: 15,
    width: 43,
    height: 34,
    rx: 5,
    fill: '#D99C43',
    stroke: INK,
    'stroke-width': 4,
  });
  appendShape(cart, 'circle', { cx: 32, cy: 68, r: 13, fill: INK });
  appendShape(cart, 'circle', { cx: 131, cy: 68, r: 13, fill: INK });
  parent.append(cart);

  const plane = drawPlane(parent);
  const board = drawDepartureBoard(parent, 'airport-cafe-amber');
  return { tread, cart, plane, board };
}

function drawGateFurniture(parent: SVGElement, propId: string): void {
  const cafe = createSvgElement('g', {
    id: 'airport-cafe',
    transform: 'translate(874 394)',
    'pointer-events': 'none',
  });
  appendShape(cafe, 'rect', {
    x: 0,
    y: 58,
    width: 251,
    height: 140,
    fill: propId === 'airport-gate-teal' ? '#417D81' : '#9C633D',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(cafe, 'path', {
    d: 'M-16 58h280l-34-68H18z',
    fill: AMBER,
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(cafe, 'rect', {
    x: 35,
    y: 102,
    width: 174,
    height: 50,
    fill: '#F6E8C9',
    stroke: INK,
    'stroke-width': 4,
  });
  cafe.append(
    svgText('CLOUD CUP', { x: 62, y: 134, fill: INK, 'font-size': 22, 'font-weight': 900 }),
  );
  parent.append(cafe);

  const gate = createSvgElement('g', { transform: 'translate(484 438)', 'pointer-events': 'none' });
  appendShape(gate, 'rect', {
    x: 0,
    y: 0,
    width: 112,
    height: 78,
    rx: 7,
    fill: '#60778C',
    stroke: INK,
    'stroke-width': 5,
  });
  gate.append(svgText('GATE', { x: 19, y: 31, fill: PAPER, 'font-size': 17, 'font-weight': 900 }));
  gate.append(svgText('12', { x: 32, y: 63, fill: GOLD, 'font-size': 32, 'font-weight': 900 }));
  parent.append(gate);

  const seats = createSvgElement('g', {
    transform: 'translate(605 471)',
    'pointer-events': 'none',
  });
  for (let index = 0; index < 4; index += 1) {
    appendShape(seats, 'path', {
      d: `M${index * 53} 59v-42q0-17 17-17h18q18 0 18 17v42M${index * 53 + 6} 59h42`,
      fill: '#5D7282',
      stroke: INK,
      'stroke-width': 5,
      'stroke-linejoin': 'round',
    });
  }
  parent.append(seats);
}

function drawOccluders(parent: SVGElement): void {
  const column = createSvgElement('g', {
    id: 'airport-column',
    transform: 'translate(330 298)',
    'data-occluder': 'airport-column',
    'pointer-events': 'all',
  });
  appendShape(column, 'path', {
    d: 'M13 0h84l16 423H0z',
    fill: '#D4DBDD',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(column, 'path', { d: 'M0 31h113M8 373h97', stroke: '#AEB8BE', 'stroke-width': 10 });
  parent.append(column);

  const kiosk = createSvgElement('g', {
    id: 'airport-kiosk',
    transform: 'translate(905 527)',
    'data-occluder': 'airport-kiosk',
    'pointer-events': 'all',
  });
  appendShape(kiosk, 'rect', {
    x: 0,
    y: 45,
    width: 202,
    height: 188,
    fill: '#4F7387',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(kiosk, 'path', {
    d: 'M-18 45h237L188-18H14z',
    fill: '#D7E0D8',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(kiosk, 'rect', {
    x: 24,
    y: 91,
    width: 150,
    height: 67,
    fill: '#1B3044',
    stroke: '#F2C14E',
    'stroke-width': 4,
  });
  kiosk.append(
    svgText('MAPS + MINTS', { x: 28, y: 130, fill: PAPER, 'font-size': 17, 'font-weight': 900 }),
  );
  parent.append(kiosk);

  const seats = createSvgElement('g', {
    id: 'airport-seats',
    transform: 'translate(584 626)',
    'data-occluder': 'airport-seats',
    'pointer-events': 'all',
  });
  for (let index = 0; index < 4; index += 1) {
    appendShape(seats, 'path', {
      d: `M${index * 58} 107V23q0-23 23-23h15q20 0 20 23v84M${index * 58 + 8} 107h44`,
      fill: '#526D7B',
      stroke: INK,
      'stroke-width': 7,
      'stroke-linejoin': 'round',
    });
  }
  parent.append(seats);

  const cart = createSvgElement('g', {
    id: 'airport-cart',
    transform: 'translate(1117 713)',
    'data-occluder': 'airport-cart',
    'pointer-events': 'all',
  });
  appendShape(cart, 'path', {
    d: 'M0 78h194l-18-68h-29l-13 42H28z',
    fill: 'none',
    stroke: INK,
    'stroke-width': 9,
    'stroke-linejoin': 'round',
  });
  appendShape(cart, 'rect', {
    x: 31,
    y: 0,
    width: 71,
    height: 51,
    rx: 8,
    fill: '#9A5D48',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(cart, 'rect', {
    x: 105,
    y: 11,
    width: 55,
    height: 42,
    rx: 7,
    fill: '#D99C43',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(cart, 'circle', { cx: 35, cy: 84, r: 14, fill: INK });
  appendShape(cart, 'circle', { cx: 151, cy: 84, r: 14, fill: INK });
  parent.append(cart);
}

export const buildAirportStage: SceneStageBuilder = ({ layers, variation }) => {
  layers.background.setAttribute('data-scene-art', 'airport');
  drawWindowWall(layers.background, variation.paletteId);
  const ambient = drawWalkway(layers.ambient);
  drawGateFurniture(layers.ambient, variation.propId);
  drawOccluders(layers.occluders);
  return {
    updateAmbient(clockMs: number, reducedMotion: boolean): void {
      if (reducedMotion) {
        setTransform(ambient.tread, 'translate(-66 0)');
        setTransform(ambient.cart, 'translate(1170 595)');
        setTransform(ambient.plane, 'translate(-420 268)');
        ambient.board.setAttribute('opacity', '1');
        return;
      }
      const seconds = clockMs / 1000;
      setTransform(ambient.tread, `translate(${((clockMs * 0.035) % 66) - 66} 0)`);
      setTransform(ambient.cart, `translate(${1170 - ((clockMs * 0.026) % 430)} 595)`);
      setTransform(
        ambient.plane,
        `translate(${((clockMs * 0.034) % 1880) - 420} ${268 + Math.sin(seconds * 1.6) * 3})`,
      );
      ambient.board.setAttribute('opacity', String(0.9 + Math.sin(seconds * 3.1) * 0.1));
    },
  };
};

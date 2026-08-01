import type { SceneStageBuilder } from '../scene-stage';
import { createSvgElement, setTransform, svgText } from '../svg-dom';
import { appendShape, INK, PAPER } from './shared';

const SKY = '#E9A96F';
const SKY_DUSK = '#C97C69';
const GOLD = '#F2C14E';
const BARN_RED = '#B94D42';

function drawHill(parent: SVGElement, path: string, fill: string): void {
  appendShape(parent, 'path', { d: path, fill, stroke: INK, 'stroke-width': 3 });
}

function drawPennantString(parent: SVGElement): SVGGElement {
  const root = createSvgElement('g', { id: 'fair-pennants', 'pointer-events': 'none' });
  appendShape(root, 'path', {
    d: 'M120 250q500 65 1180-14',
    fill: 'none',
    stroke: INK,
    'stroke-width': 3,
  });
  for (let index = 0; index < 14; index += 1) {
    const x = 150 + index * 85;
    const y = 254 + Math.sin(index * 0.7) * 18;
    appendShape(root, 'path', {
      d: `M${x} ${y}l31 8-25 42z`,
      fill: ['#D9443F', '#2E5EAA', GOLD, '#557A46'][index % 4] as string,
      stroke: INK,
      'stroke-width': 2,
    });
  }
  parent.append(root);
  return root;
}

function drawFerrisWheel(parent: SVGElement, paletteId: string): SVGGElement {
  const root = createSvgElement('g', {
    id: 'fair-ferris-wheel',
    transform: 'translate(1128 382)',
    'pointer-events': 'none',
  });
  appendShape(root, 'path', {
    d: 'M-154 282-42 28h84l116 254M-107 282h218',
    fill: 'none',
    stroke: '#48556B',
    'stroke-width': 19,
    'stroke-linejoin': 'round',
  });
  const wheel = createSvgElement('g', { id: 'fair-wheel-spin' });
  appendShape(wheel, 'circle', {
    cx: 0,
    cy: 0,
    r: 156,
    fill: paletteId === 'fair-sunset' ? '#F8CF85' : '#F6E7B6',
    'fill-opacity': 0.22,
    stroke: INK,
    'stroke-width': 9,
  });
  appendShape(wheel, 'circle', { cx: 0, cy: 0, r: 22, fill: GOLD, stroke: INK, 'stroke-width': 6 });
  for (let index = 0; index < 12; index += 1) {
    const angle = (index / 12) * Math.PI * 2;
    const x = Math.cos(angle) * 148;
    const y = Math.sin(angle) * 148;
    appendShape(wheel, 'path', {
      d: `M0 0L${x} ${y}`,
      fill: 'none',
      stroke: '#48556B',
      'stroke-width': 5,
    });
    const cabin = createSvgElement('g', { transform: `translate(${x} ${y})` });
    appendShape(cabin, 'rect', {
      x: -20,
      y: -5,
      width: 40,
      height: 31,
      rx: 7,
      fill: ['#D9443F', '#2E5EAA', GOLD, '#557A46'][index % 4] as string,
      stroke: INK,
      'stroke-width': 4,
    });
    wheel.append(cabin);
  }
  root.append(wheel);
  parent.append(root);
  return wheel;
}

function drawBackground(parent: SVGElement, paletteId: string): void {
  parent.setAttribute('data-scene-art', 'fair');
  appendShape(parent, 'rect', {
    width: 1440,
    height: 900,
    fill: paletteId === 'fair-sunset' ? SKY_DUSK : SKY,
  });
  appendShape(parent, 'circle', {
    cx: 210,
    cy: 164,
    r: 72,
    fill: '#FFE19B',
    stroke: INK,
    'stroke-width': 3,
  });
  drawHill(
    parent,
    'M0 402 152 288l138 101 117-138 136 141 155-117 176 130 174-155 139 135 169-97 184 118v147H0z',
    '#82905B',
  );
  drawHill(
    parent,
    'M0 458 136 343l117 77 141-104 174 119 164-84 188 112 154-105 182 84 124-70 160 86v110H0z',
    '#58734D',
  );
  appendShape(parent, 'path', { d: 'M0 486h1440v414H0z', fill: '#BDA56D' });
  appendShape(parent, 'path', {
    d: 'M0 580q160-44 316-8t307 4q158-38 319 5t298-9q106-24 200-3v331H0z',
    fill: '#D7B67A',
  });
  appendShape(parent, 'path', { d: 'M0 705q365-40 720 0t720-2v197H0z', fill: '#C89C63' });

  const barn = createSvgElement('g', { transform: 'translate(86 332)', 'pointer-events': 'none' });
  appendShape(barn, 'path', {
    d: 'M0 116 108 16l111 100v159H0z',
    fill: BARN_RED,
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(barn, 'path', {
    d: 'M-20 116 108 0l131 116z',
    fill: '#6C4650',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(barn, 'rect', {
    x: 87,
    y: 153,
    width: 46,
    height: 122,
    fill: '#F2D29A',
    stroke: INK,
    'stroke-width': 4,
  });
  barn.append(
    svgText('4-H-ish', { x: 57, y: 86, fill: PAPER, 'font-size': 22, 'font-weight': 900 }),
  );
  parent.append(barn);

  const pavilion = createSvgElement('g', {
    transform: 'translate(558 326)',
    'pointer-events': 'none',
  });
  appendShape(pavilion, 'path', {
    d: 'M0 105 148 0l150 105z',
    fill: '#F4D597',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(pavilion, 'rect', {
    x: 25,
    y: 104,
    width: 250,
    height: 149,
    fill: '#E8D5A5',
    stroke: INK,
    'stroke-width': 5,
  });
  for (let index = 0; index < 5; index += 1) {
    appendShape(pavilion, 'rect', {
      x: 45 + index * 48,
      y: 126,
      width: 22,
      height: 127,
      fill: '#FFF1C4',
      stroke: INK,
      'stroke-width': 3,
    });
  }
  pavilion.append(
    svgText('TALENT TENT', { x: 68, y: 92, fill: INK, 'font-size': 24, 'font-weight': 900 }),
  );
  parent.append(pavilion);

  const livestock = createSvgElement('g', {
    transform: 'translate(324 420)',
    'pointer-events': 'none',
  });
  appendShape(livestock, 'rect', {
    x: 0,
    y: 76,
    width: 180,
    height: 98,
    fill: '#D8C481',
    stroke: INK,
    'stroke-width': 5,
  });
  for (let index = 0; index < 4; index += 1) {
    appendShape(livestock, 'path', {
      d: `M${8 + index * 44} 68v114`,
      stroke: '#765238',
      'stroke-width': 8,
    });
  }
  appendShape(livestock, 'ellipse', {
    cx: 77,
    cy: 113,
    rx: 40,
    ry: 23,
    fill: '#F5EEE1',
    stroke: INK,
    'stroke-width': 4,
  });
  appendShape(livestock, 'circle', {
    cx: 116,
    cy: 101,
    r: 17,
    fill: '#F5EEE1',
    stroke: INK,
    'stroke-width': 4,
  });
  livestock.append(
    svgText('GENTLE GOATS', {
      x: 18,
      y: 51,
      fill: PAPER,
      stroke: INK,
      'stroke-width': 2,
      'paint-order': 'stroke',
      'font-size': 17,
      'font-weight': 900,
    }),
  );
  parent.append(livestock);
}

function drawMidway(
  parent: SVGElement,
  propId: string,
): { pennants: SVGGElement; wheel: SVGGElement; steam: SVGGElement } {
  const pennants = drawPennantString(parent);
  const wheel = drawFerrisWheel(parent, propId === 'fair-neon-booths' ? 'fair-sunset' : 'fair-day');

  const food = createSvgElement('g', {
    id: 'fair-food-booth',
    transform: 'translate(768 458)',
    'pointer-events': 'none',
  });
  appendShape(food, 'rect', {
    x: 0,
    y: 62,
    width: 241,
    height: 148,
    fill: '#D57A42',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(food, 'path', {
    d: 'M-18 62h276l-36-84H18z',
    fill: propId === 'fair-blue-canopy' ? '#2E5EAA' : '#D9443F',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(food, 'rect', {
    x: 28,
    y: 111,
    width: 179,
    height: 57,
    fill: '#FFF1C4',
    stroke: INK,
    'stroke-width': 4,
  });
  food.append(
    svgText('CORN DOG COMET', { x: 37, y: 147, fill: INK, 'font-size': 18, 'font-weight': 900 }),
  );
  parent.append(food);

  const game = createSvgElement('g', {
    id: 'fair-ring-toss',
    transform: 'translate(104 562)',
    'pointer-events': 'none',
  });
  appendShape(game, 'rect', {
    x: 0,
    y: 18,
    width: 211,
    height: 142,
    fill: '#5A8A7A',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(game, 'path', {
    d: 'M-12 18h236L196-44H12z',
    fill: '#F2C14E',
    stroke: INK,
    'stroke-width': 6,
  });
  for (let index = 0; index < 4; index += 1) {
    appendShape(game, 'circle', {
      cx: 42 + index * 43,
      cy: 90,
      r: 17,
      fill: ['#D9443F', '#2E5EAA', '#F7F0DE', '#8A5B9E'][index] as string,
      stroke: INK,
      'stroke-width': 3,
    });
  }
  game.append(
    svgText('RING-ish TOSS', { x: 29, y: 7, fill: INK, 'font-size': 17, 'font-weight': 900 }),
  );
  parent.append(game);

  const picnic = createSvgElement('g', {
    transform: 'translate(560 665)',
    'pointer-events': 'none',
  });
  appendShape(picnic, 'path', {
    d: 'M0 55h214l-28-32H28z',
    fill: '#765238',
    stroke: INK,
    'stroke-width': 5,
  });
  appendShape(picnic, 'path', {
    d: 'M30 55 5 116M181 55l28 61M35 90h145',
    fill: 'none',
    stroke: '#765238',
    'stroke-width': 10,
    'stroke-linecap': 'round',
  });
  picnic.append(
    svgText('PICNIC ROW', { x: 51, y: 10, fill: INK, 'font-size': 16, 'font-weight': 900 }),
  );
  parent.append(picnic);

  const steam = createSvgElement('g', { id: 'fair-griddle-steam', 'pointer-events': 'none' });
  for (let index = 0; index < 4; index += 1) {
    appendShape(steam, 'path', {
      d: `M${812 + index * 28} 432q-20-28 2-58t0-55`,
      fill: 'none',
      stroke: PAPER,
      'stroke-width': 7,
      'stroke-linecap': 'round',
      opacity: 0.58,
    });
  }
  parent.append(steam);
  return { pennants, wheel, steam };
}

function drawHayBale(
  parent: SVGElement,
  id: string,
  x: number,
  y: number,
  scale: number,
): SVGGElement {
  const hay = createSvgElement('g', {
    id,
    transform: `translate(${x} ${y}) scale(${scale})`,
    'data-occluder': id,
    'pointer-events': 'all',
  });
  appendShape(hay, 'rect', {
    x: 0,
    y: 36,
    width: 159,
    height: 92,
    rx: 22,
    fill: '#D8A844',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(hay, 'ellipse', {
    cx: 146,
    cy: 82,
    rx: 26,
    ry: 45,
    fill: '#EBC45E',
    stroke: INK,
    'stroke-width': 5,
  });
  for (let index = 0; index < 5; index += 1) {
    appendShape(hay, 'path', {
      d: `M${17 + index * 25} 56l-10 52M${26 + index * 24} 45l18 63`,
      stroke: '#B77D2E',
      'stroke-width': 3,
      opacity: 0.8,
    });
  }
  return hay;
}

function drawOccluders(parent: SVGElement): void {
  const prizeWall = createSvgElement('g', {
    id: 'fair-prize-wall',
    transform: 'translate(314 518)',
    'data-occluder': 'fair-prize-wall',
    'pointer-events': 'all',
  });
  appendShape(prizeWall, 'rect', {
    x: 0,
    y: 0,
    width: 182,
    height: 173,
    fill: '#7B5B98',
    stroke: INK,
    'stroke-width': 6,
  });
  for (let row = 0; row < 2; row += 1) {
    for (let column = 0; column < 3; column += 1) {
      appendShape(prizeWall, 'circle', {
        cx: 35 + column * 56,
        cy: 39 + row * 62,
        r: 19,
        fill: ['#F2C14E', '#D9443F', '#2E5EAA'][(row + column) % 3] as string,
        stroke: INK,
        'stroke-width': 3,
      });
    }
  }
  prizeWall.append(
    svgText('PRIZES', { x: 40, y: 154, fill: PAPER, 'font-size': 22, 'font-weight': 900 }),
  );
  parent.append(prizeWall);

  const booth = createSvgElement('g', {
    id: 'fair-booth',
    transform: 'translate(432 474)',
    'data-occluder': 'fair-booth',
    'pointer-events': 'all',
  });
  appendShape(booth, 'rect', {
    x: 0,
    y: 75,
    width: 227,
    height: 135,
    fill: '#3E6E84',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(booth, 'path', {
    d: 'M-18 76h265L218-5H12z',
    fill: '#E9D59B',
    stroke: INK,
    'stroke-width': 6,
  });
  appendShape(booth, 'rect', {
    x: 29,
    y: 112,
    width: 166,
    height: 44,
    fill: '#F7F0DE',
    stroke: INK,
    'stroke-width': 4,
  });
  booth.append(
    svgText('BLUE RIBBON', { x: 42, y: 141, fill: INK, 'font-size': 20, 'font-weight': 900 }),
  );
  parent.append(booth);

  parent.append(drawHayBale(parent, 'fair-hay', 976, 566, 1));
  parent.append(drawHayBale(parent, 'fair-hay-stack', 1097, 618, 0.73));

  const fence = createSvgElement('g', {
    id: 'fair-fence',
    transform: 'translate(690 692)',
    'data-occluder': 'fair-fence',
    'pointer-events': 'all',
  });
  for (let index = 0; index < 5; index += 1) {
    appendShape(fence, 'path', {
      d: `M${index * 58} 0v123`,
      stroke: '#765238',
      'stroke-width': 11,
      'stroke-linecap': 'round',
    });
  }
  appendShape(fence, 'path', {
    d: 'M0 36h250M0 84h250',
    stroke: '#9A6A3E',
    'stroke-width': 11,
    'stroke-linecap': 'round',
  });
  parent.append(fence);
}

export const buildFairStage: SceneStageBuilder = ({ layers, variation }) => {
  drawBackground(layers.background, variation.paletteId);
  const ambient = drawMidway(layers.ambient, variation.propId);
  drawOccluders(layers.occluders);
  return {
    updateAmbient(clockMs: number, reducedMotion: boolean): void {
      const motion = reducedMotion ? 0.28 : 1;
      const seconds = (clockMs / 1000) * motion;
      setTransform(ambient.wheel, `rotate(${seconds * 7})`);
      setTransform(ambient.pennants, `translate(0 ${Math.sin(seconds * 2.2) * 5})`);
      setTransform(
        ambient.steam,
        `translate(${Math.sin(seconds * 2.8) * 7} ${-((clockMs * 0.012 * motion) % 24)})`,
      );
    },
  };
};

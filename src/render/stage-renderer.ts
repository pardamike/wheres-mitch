import type { GameState, MissMarker } from '../core/types';
import type { CrowdActor } from '../world/actor';
import type { SceneInstance } from '../world/scene';
import { createCapitolRig, type CapitolRig } from './art/capitol';
import { createCrowdRig } from './art/crowd';
import { createHelicopterRig, type HelicopterRig } from './art/helicopter';
import { createMitchRig, type MitchRig } from './art/mitch';
import { createMoneyBag, type MoneyBagRig } from './art/money';
import { getCapturePresentation } from './cutscenes/capture';
import { getEscapePresentation } from './cutscenes/escape';
import type { SequenceSnapshot } from './cutscenes/sequence';
import type { SceneStagePresentation } from './scene-stage';
import { clearSvg, createSvgElement, findSvgLayer, setTransform, svgText } from './svg-dom';

interface ActorNode {
  actor: CrowdActor;
  element: SVGGElement;
  layer: 'back' | 'mid' | 'front';
}

interface MissEffectNode {
  element: SVGGElement;
  ring: SVGCircleElement;
  cross: SVGTextElement;
  shownAtMs: number;
  x: number;
  y: number;
}

interface CutsceneNodes {
  root: SVGGElement;
  dimmer: SVGRectElement;
  spotlight: SVGCircleElement;
  headline: SVGTextElement;
  caption: SVGTextElement;
  captureMitch: MitchRig;
  tubeOuter: SVGPathElement;
  tubeInner: SVGPathElement;
  stars: SVGGElement[];
  capitol: CapitolRig;
  stamp: SVGTextElement;
  escapeLoad: SVGGElement;
  escapeMitch: MitchRig;
  money: MoneyBagRig[];
  helicopter: HelicopterRig;
  windLines: SVGPathElement[];
}

export interface OutcomeRenderState {
  kind: 'capture' | 'escape';
  snapshot: SequenceSnapshot;
}

const INK = '#172033';
const PAPER = '#F7F0DE';
const MITCH_SCALE = 0.55;

function addShape(
  parent: SVGElement,
  tagName: keyof SVGElementTagNameMap,
  attributes: Record<string, string | number>,
): SVGElement {
  const element = createSvgElement(tagName, attributes);
  parent.append(element);
  return element;
}

function drawActor(model: CrowdActor): SVGGElement {
  return createCrowdRig(model).root;
}

function drawMitch(): { root: SVGGElement; hitTarget: SVGCircleElement } {
  const rig = createMitchRig({ id: 'mitch-root', interactive: true });
  if (!rig.hitTarget) {
    throw new Error('Interactive Mitch rig is missing its hit target.');
  }
  return { root: rig.root, hitTarget: rig.hitTarget };
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
    effects.push({ element, ring, cross, shownAtMs: Number.NEGATIVE_INFINITY, x: 0, y: 0 });
  }
  return effects;
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
  const tubeOuter = createSvgElement('path', {
    fill: 'none',
    stroke: '#C94A43',
    'stroke-width': 34,
    'stroke-linecap': 'round',
    opacity: 0,
  });
  const tubeInner = createSvgElement('path', {
    fill: 'none',
    stroke: '#F7F0DE',
    'stroke-width': 19,
    'stroke-linecap': 'round',
    opacity: 0,
  });
  const captureMitch = createMitchRig({ id: 'capture-mitch' });
  const capitol = createCapitolRig('capture-capitol');
  const stamp = svgText('RETURNED TO THE CAPITOL', {
    x: 1125,
    y: 692,
    'text-anchor': 'middle',
    fill: '#B82025',
    stroke: PAPER,
    'stroke-width': 2,
    'paint-order': 'stroke',
    'font-size': 29,
    'font-weight': 900,
    opacity: 0,
  });
  const stars = Array.from({ length: 7 }, (_, index) => {
    const star = createSvgElement('g', { opacity: 0 });
    addShape(star, 'path', {
      d: 'M0-10 3-3 10 0 3 3 0 10-3 3-10 0-3-3z',
      fill: '#F2C14E',
      stroke: INK,
      'stroke-width': 1.5,
    });
    star.setAttribute('data-star', String(index));
    return star;
  });
  const escapeLoad = createSvgElement('g', { opacity: 0 });
  const escapeMitch = createMitchRig({ id: 'escape-mitch' });
  const money = [
    createMoneyBag('small', 'money-small'),
    createMoneyBag('large', 'money-large'),
    createMoneyBag('satchel', 'money-satchel'),
  ];
  escapeLoad.append(escapeMitch.root, ...money.map((bag) => bag.root));
  const helicopter = createHelicopterRig('escape-helicopter');
  const windLines = Array.from({ length: 6 }, (_, index) =>
    createSvgElement('path', {
      d: `M${70 + index * 150} ${150 + (index % 3) * 62}h86`,
      fill: 'none',
      stroke: PAPER,
      'stroke-width': 5,
      'stroke-linecap': 'round',
      opacity: 0,
    }),
  );
  root.append(
    dimmer,
    spotlight,
    tubeOuter,
    tubeInner,
    ...stars,
    captureMitch.root,
    capitol.root,
    stamp,
    ...windLines,
    escapeLoad,
    helicopter.root,
    headline,
    caption,
  );
  parent.append(root);
  return {
    root,
    dimmer,
    spotlight,
    headline,
    caption,
    captureMitch,
    tubeOuter,
    tubeInner,
    stars,
    capitol,
    stamp,
    escapeLoad,
    escapeMitch,
    money,
    helicopter,
    windLines,
  };
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
  private activeScene: SceneInstance | null = null;
  private mitchRoot: SVGGElement | null = null;
  private mitchHitTarget: SVGCircleElement | null = null;
  private scenePresentation: SceneStagePresentation | null = null;
  private cutscene: CutsceneNodes | null = null;
  private frozenSceneClockMs: number | null = null;

  constructor(private readonly stage: SVGSVGElement) {
    this.backgroundLayer = findSvgLayer(stage, 'background');
    this.ambientLayer = findSvgLayer(stage, 'far-ambient');
    this.backActorsLayer = findSvgLayer(stage, 'back-actors');
    this.actorLayer = findSvgLayer(stage, 'target-and-actors');
    this.occluderLayer = findSvgLayer(stage, 'front-occluders');
    this.effectsLayer = findSvgLayer(stage, 'effects');
    this.cutsceneLayer = findSvgLayer(stage, 'cutscene');
  }

  build(scene: SceneInstance): SceneInstance {
    this.activeScene = scene;
    this.activeMissId = 0;
    this.frozenSceneClockMs = null;
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

    this.scenePresentation = scene.definition.stageBuilder({
      layers: {
        background: this.backgroundLayer,
        ambient: this.ambientLayer,
        occluders: this.occluderLayer,
      },
      variation: scene.variation,
    });

    this.actorNodes = scene.actors.map((actor) => {
      const element = drawActor(actor);
      (actor.depthLane === 'back' ? this.backActorsLayer : this.actorLayer).append(element);
      return { actor, element, layer: actor.depthLane };
    });

    const mitch = drawMitch();
    this.mitchRoot = mitch.root;
    this.mitchHitTarget = mitch.hitTarget;
    this.actorLayer.append(mitch.root);
    this.missEffects = createMissPool(this.effectsLayer, 12);
    this.cutscene = createCutscene(this.cutsceneLayer);
    return scene;
  }

  render(
    state: GameState,
    clockMs: number,
    reducedMotion: boolean,
    outcome: OutcomeRenderState | null = null,
  ): void {
    if (!this.activeScene || !this.mitchRoot || !this.mitchHitTarget || !this.cutscene) {
      return;
    }

    const outcomeActive =
      outcome !== null &&
      ((outcome.kind === 'capture' && state.mode === 'player_capture') ||
        (outcome.kind === 'escape' && state.mode === 'mitch_escape'));
    if (outcomeActive && this.frozenSceneClockMs === null) {
      this.frozenSceneClockMs = clockMs;
    } else if (!outcomeActive) {
      this.frozenSceneClockMs = null;
    }
    const sceneClockMs = this.frozenSceneClockMs ?? clockMs;
    const seconds = sceneClockMs / 1000;
    const crowdMotion = reducedMotion ? 0 : 1;
    for (const actor of this.actorNodes) {
      const moving = actor.actor.pose === 'walk';
      const bob =
        !reducedMotion && moving ? Math.sin(seconds * 7 * crowdMotion + actor.actor.phase) * 2 : 0;
      const gesture =
        !reducedMotion && actor.actor.pose === 'react' ? Math.sin(seconds * 14) * 4 : 0;
      const poseOffset = actor.actor.pose === 'sit' ? 12 : actor.actor.pose === 'queue' ? 3 : 0;
      const poseTilt =
        !reducedMotion && actor.actor.pose === 'chat'
          ? Math.sin(seconds * 4 + actor.actor.phase) * 5
          : !reducedMotion && actor.actor.pose === 'interact'
            ? Math.sin(seconds * 3 + actor.actor.phase) * 3
            : 0;
      setTransform(
        actor.element,
        `translate(${actor.actor.position.x} ${actor.actor.position.y + bob + gesture + poseOffset}) rotate(${poseTilt}) scale(${actor.actor.scale * actor.actor.facing} ${actor.actor.scale})`,
      );
      actor.element.setAttribute('data-pose', actor.actor.pose);
      actor.element.setAttribute('data-actor', actor.actor.routine);
      if (actor.layer !== actor.actor.depthLane) {
        (actor.actor.depthLane === 'back' ? this.backActorsLayer : this.actorLayer).append(
          actor.element,
        );
        actor.layer = actor.actor.depthLane;
      }
    }

    this.scenePresentation?.updateAmbient(sceneClockMs, reducedMotion);

    const mitch = this.activeScene.mitch;
    const mitchBob = reducedMotion
      ? 0
      : mitch.mode === 'transit'
        ? Math.sin(seconds * 10) * 2.5
        : Math.sin(seconds * 3) * 1.5;
    setTransform(
      this.mitchRoot,
      `translate(${mitch.position.x} ${mitch.position.y + mitchBob}) scale(${MITCH_SCALE})`,
    );
    this.mitchRoot.setAttribute('opacity', outcomeActive ? '0' : '1');
    this.mitchRoot.style.pointerEvents =
      state.mode === 'playing' && mitch.clickable ? 'all' : 'none';
    this.mitchHitTarget.setAttribute('r', String(69 * mitch.profile.hitboxScale));

    if (state.lastMiss && state.lastMiss.id !== this.activeMissId) {
      this.showMiss(state.lastMiss, sceneClockMs);
      this.activeMissId = state.lastMiss.id;
    }
    this.effectsLayer.setAttribute('opacity', outcomeActive ? '0' : '1');
    this.updateMissEffects(sceneClockMs);
    this.updateCutscene(outcomeActive ? outcome : null, state, reducedMotion);
  }

  private showMiss(marker: MissMarker, clockMs: number): void {
    const effect =
      this.missEffects.find((candidate) => clockMs - candidate.shownAtMs > 300) ??
      this.missEffects[0];
    if (!effect) {
      return;
    }
    effect.shownAtMs = clockMs;
    effect.x = marker.x;
    effect.y = marker.y;
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
      setTransform(effect.element, `translate(${effect.x} ${effect.y}) scale(${scale})`);
      effect.ring.setAttribute('opacity', String(1 - progress));
      effect.cross.setAttribute('opacity', String(Math.max(0, 1 - progress * 1.65)));
    }
  }

  private updateCutscene(
    outcome: OutcomeRenderState | null,
    state: GameState,
    reducedMotion: boolean,
  ): void {
    const cutscene = this.cutscene;
    if (!cutscene) {
      return;
    }
    cutscene.root.setAttribute('display', outcome ? 'inline' : 'none');
    if (!outcome || !this.activeScene) {
      return;
    }
    cutscene.root.setAttribute('data-cutscene-kind', outcome.kind);
    cutscene.root.setAttribute('data-cutscene-beat', outcome.snapshot.beatId ?? 'complete');
    if (outcome.kind === 'capture') {
      this.renderCapture(outcome.snapshot, state, reducedMotion);
    } else {
      this.renderEscape(outcome.snapshot, reducedMotion);
    }
  }

  private renderCapture(
    snapshot: SequenceSnapshot,
    state: GameState,
    reducedMotion: boolean,
  ): void {
    const cutscene = this.cutscene;
    const scene = this.activeScene;
    if (!cutscene || !scene) {
      return;
    }
    const destination = scene.definition.cutsceneLandmarks.captureDestination;
    const visual = getCapturePresentation(snapshot, scene.mitch.position, destination);
    cutscene.dimmer.setAttribute('opacity', String(visual.dimOpacity));
    cutscene.spotlight.setAttribute('cx', String(scene.mitch.position.x));
    cutscene.spotlight.setAttribute('cy', String(scene.mitch.position.y - 22));
    cutscene.spotlight.setAttribute('r', String(visual.spotlightRadius));
    cutscene.spotlight.setAttribute('opacity', String(visual.spotlightOpacity));
    cutscene.headline.textContent = visual.headline;
    cutscene.caption.textContent =
      visual.beatId === 'transition'
        ? `Round ${state.round} cleared in ${state.roundAttempts} click${state.roundAttempts === 1 ? '' : 's'}.`
        : visual.caption;
    cutscene.headline.setAttribute('x', '720');
    cutscene.headline.setAttribute('y', '164');
    cutscene.headline.setAttribute('font-size', '75');
    cutscene.caption.setAttribute('x', '720');
    cutscene.caption.setAttribute('y', '222');
    cutscene.caption.setAttribute('font-size', '28');

    cutscene.captureMitch.root.setAttribute('opacity', '1');
    setTransform(
      cutscene.captureMitch.root,
      `translate(${visual.mitchPosition.x} ${visual.mitchPosition.y}) rotate(${reducedMotion ? visual.mitchRotation * 0.04 : visual.mitchRotation}) scale(${visual.mitchScale})`,
    );
    this.applyMitchTuck(cutscene.captureMitch, visual.tuckProgress);
    const tubePath = `M${scene.mitch.position.x} ${scene.mitch.position.y - 10} Q820 140 ${destination.x} ${destination.y}`;
    cutscene.tubeOuter.setAttribute('d', tubePath);
    cutscene.tubeOuter.setAttribute('opacity', String(visual.tubeOpacity));
    cutscene.tubeInner.setAttribute('d', tubePath);
    cutscene.tubeInner.setAttribute('opacity', String(visual.trailOpacity));
    cutscene.capitol.root.setAttribute('opacity', String(visual.capitolOpacity));
    setTransform(
      cutscene.capitol.root,
      `translate(${destination.x - 156} ${destination.y - 297}) scale(${visual.capitolScale * 0.8})`,
    );
    cutscene.stamp.setAttribute('x', String(destination.x));
    cutscene.stamp.setAttribute('y', String(destination.y + 117));
    cutscene.stamp.setAttribute('opacity', String(visual.stampOpacity));
    setTransform(
      cutscene.stamp,
      `translate(${destination.x} ${destination.y + 117}) rotate(-8) scale(${visual.stampScale}) translate(${-destination.x} ${-(destination.y + 117)})`,
    );
    for (const [index, star] of cutscene.stars.entries()) {
      const fraction = (index + 1) / (cutscene.stars.length + 1);
      const x = scene.mitch.position.x + (destination.x - scene.mitch.position.x) * fraction;
      const y = scene.mitch.position.y - 18 - 118 * Math.sin(fraction * Math.PI);
      star.setAttribute('opacity', String(visual.starsOpacity * (0.62 + (index % 3) * 0.12)));
      setTransform(
        star,
        `translate(${x} ${y}) rotate(${index * 29}) scale(${0.9 + (index % 2) * 0.2})`,
      );
    }

    this.hideEscapeNodes(cutscene);
  }

  private renderEscape(snapshot: SequenceSnapshot, reducedMotion: boolean): void {
    const cutscene = this.cutscene;
    const scene = this.activeScene;
    if (!cutscene || !scene) {
      return;
    }
    const visual = getEscapePresentation(snapshot, scene.mitch.position, {
      entry: scene.definition.cutsceneLandmarks.escapeEntry,
      exit: scene.definition.cutsceneLandmarks.escapeExit,
    });
    cutscene.dimmer.setAttribute('opacity', String(visual.dimOpacity));
    cutscene.spotlight.setAttribute('opacity', '0');
    cutscene.headline.textContent = visual.headline;
    cutscene.caption.textContent = visual.caption;
    cutscene.headline.setAttribute('x', '342');
    cutscene.headline.setAttribute('y', '130');
    cutscene.headline.setAttribute('font-size', '62');
    cutscene.caption.setAttribute('x', '342');
    cutscene.caption.setAttribute('y', '178');
    cutscene.caption.setAttribute('font-size', '21');
    cutscene.captureMitch.root.setAttribute('opacity', '0');
    cutscene.tubeOuter.setAttribute('opacity', '0');
    cutscene.tubeInner.setAttribute('opacity', '0');
    cutscene.capitol.root.setAttribute('opacity', '0');
    cutscene.stamp.setAttribute('opacity', '0');
    for (const star of cutscene.stars) {
      star.setAttribute('opacity', '0');
    }

    cutscene.escapeLoad.setAttribute('opacity', String(visual.loadOpacity));
    setTransform(
      cutscene.escapeLoad,
      `translate(${visual.loadPosition.x} ${visual.loadPosition.y}) rotate(${reducedMotion ? visual.loadRotation * 0.12 : visual.loadRotation})`,
    );
    setTransform(cutscene.escapeMitch.root, `scale(${visual.mitchScale})`);
    this.applyMitchTuck(cutscene.escapeMitch, visual.tuckProgress);
    for (const [index, bag] of cutscene.money.entries()) {
      const offset = [
        [-58, 16],
        [48, 14],
        [5, 54],
      ][index] ?? [0, 0];
      bag.root.setAttribute('opacity', String(visual.moneyOpacity));
      setTransform(
        bag.root,
        `translate(${offset[0]} ${offset[1]}) rotate(${(index - 1) * 8}) scale(${visual.moneyScale})`,
      );
    }
    cutscene.helicopter.root.setAttribute('opacity', String(visual.helicopterOpacity));
    setTransform(
      cutscene.helicopter.root,
      `translate(${visual.helicopterPosition.x} ${visual.helicopterPosition.y}) scale(${visual.helicopterScale})`,
    );
    setTransform(
      cutscene.helicopter.rotor,
      `rotate(${reducedMotion ? 0 : visual.rotorDegrees} 125 -34)`,
    );
    cutscene.helicopter.rope.setAttribute('opacity', String(visual.ropeOpacity));
    cutscene.helicopter.rope.setAttribute('y2', String(145 + visual.ropeLength));
    cutscene.helicopter.hook.setAttribute('opacity', String(visual.ropeOpacity));
    setTransform(cutscene.helicopter.hook, `translate(0 ${145 + visual.ropeLength})`);
    for (const [index, wind] of cutscene.windLines.entries()) {
      wind.setAttribute(
        'opacity',
        String(visual.windOpacity * (reducedMotion ? 0.16 : 0.42 + (index % 2) * 0.18)),
      );
      setTransform(wind, `translate(${reducedMotion ? 0 : (visual.rotorDegrees % 42) - 21} 0)`);
    }
  }

  private hideEscapeNodes(cutscene: CutsceneNodes): void {
    cutscene.escapeLoad.setAttribute('opacity', '0');
    cutscene.helicopter.root.setAttribute('opacity', '0');
    cutscene.helicopter.rope.setAttribute('opacity', '0');
    cutscene.helicopter.hook.setAttribute('opacity', '0');
    for (const wind of cutscene.windLines) {
      wind.setAttribute('opacity', '0');
    }
  }

  private applyMitchTuck(rig: MitchRig, progress: number): void {
    const tuck = Math.max(0, Math.min(1, progress));
    const visible = 1 - tuck;
    rig.head.setAttribute('opacity', String(visible));
    rig.neck.setAttribute('opacity', String(visible));
    rig.collar.setAttribute('opacity', String(visible));
    rig.tie.setAttribute('opacity', String(visible));
    rig.frontLegs.setAttribute('opacity', String(visible));
    rig.backLegs.setAttribute('opacity', String(visible));
    rig.shadow.setAttribute('opacity', String(0.2 * (1 - tuck * 0.55)));
    setTransform(rig.head, `translate(${38 * tuck} ${19 * tuck}) scale(${1 - tuck * 0.66})`);
    setTransform(rig.frontLegs, `translate(${-18 * tuck} ${12 * tuck}) scale(${1 - tuck * 0.55})`);
    setTransform(rig.backLegs, `translate(${22 * tuck} ${10 * tuck}) scale(${1 - tuck * 0.55})`);
    setTransform(rig.collar, `translate(${30 * tuck} ${15 * tuck}) scale(${1 - tuck * 0.55})`);
    setTransform(rig.tie, `translate(${30 * tuck} ${15 * tuck}) scale(${1 - tuck * 0.55})`);
  }
}

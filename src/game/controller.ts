import { SimulationClock } from '../core/clock';
import { difficultyForRound } from '../core/difficulty';
import type { GameEvent } from '../core/events';
import { createInitialState, isStageInteractive, reduceGame } from '../core/reducer';
import { createRunSeed, deriveSeed, parseRoundFromSearch, parseSeedFromSearch } from '../core/rng';
import type { MotionMode } from '../core/types';
import { createWashingtonScene } from '../scenes/washington';
import { StageRenderer } from '../render/stage-renderer';
import { UiRenderer } from '../render/ui-renderer';
import { mitchSnapshot } from '../world/mitch';
import { reactToSceneMiss, updateScene, type SceneInstance } from '../world/scene';
import { attachStageInput } from './input';
import {
  recordCompletedRounds,
  recordSuccessfulCatch,
  withMotionMode,
  withSoundEnabled,
} from './records';
import { attachVisibilityLifecycle } from './visibility';

interface GameControllerNodes {
  root: HTMLElement;
  stage: SVGSVGElement;
  startButton: HTMLButtonElement;
  playScreen: HTMLElement;
}

function requireControllerNode<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required controller node is missing: ${selector}`);
  }
  return element;
}

function isFormControl(target: EventTarget | null): boolean {
  return (
    target instanceof HTMLButtonElement ||
    target instanceof HTMLInputElement ||
    target instanceof HTMLSelectElement
  );
}

function nextMotionMode(current: MotionMode): MotionMode {
  return current === 'system' ? 'reduce' : current === 'reduce' ? 'full' : 'system';
}

declare global {
  interface Window {
    __WHERES_MITCH_DEBUG__?: Readonly<Record<string, unknown>>;
  }
}

export class GameController {
  private state = createInitialState();
  private scene: SceneInstance | null = null;
  private readonly nodes: GameControllerNodes;
  private readonly stageRenderer: StageRenderer;
  private readonly uiRenderer: UiRenderer;
  private readonly clock = new SimulationClock();
  private frameHandle = 0;
  private modeElapsedMs = 0;
  private visibilityCountdownMs = 0;
  private portraitAllowed = false;
  private readonly debugEnabled: boolean;
  private sceneTitle = 'WASHINGTON STREET';
  private detachVisibility: (() => void) | null = null;

  constructor() {
    this.nodes = {
      root: requireControllerNode<HTMLElement>('#game-root'),
      stage: requireControllerNode<SVGSVGElement>('#game-stage'),
      startButton: requireControllerNode<HTMLButtonElement>('#start-button'),
      playScreen: requireControllerNode<HTMLElement>('#play-screen'),
    };
    this.stageRenderer = new StageRenderer(this.nodes.stage);
    this.uiRenderer = new UiRenderer();
    this.debugEnabled = new URLSearchParams(window.location.search).get('debug') === '1';
    if (document.hidden) {
      this.clock.pause('hidden');
    }
  }

  start(): void {
    this.nodes.startButton.addEventListener('click', (event) => {
      event.stopPropagation();
      this.startRun();
    });
    for (const control of document.querySelectorAll<HTMLButtonElement>('button[data-action]')) {
      control.addEventListener('pointerdown', (event) => event.stopPropagation());
      control.addEventListener('click', (event) => {
        event.stopPropagation();
        this.handleAction(control.dataset.action ?? '');
      });
    }
    attachStageInput(this.nodes.stage, {
      isEnabled: () => isStageInteractive(this.state),
      onMiss: (point) => this.dispatch({ type: 'MISS', ...point }),
      onMitchCaught: () => this.dispatch({ type: 'MITCH_CAUGHT' }),
    });
    this.detachVisibility = attachVisibilityLifecycle({
      onHidden: () => this.handleVisibilityHidden(),
      onVisible: () => this.handleVisibilityVisible(),
    });
    window.addEventListener('keydown', (event) => this.handleKeyboard(event));
    window.addEventListener('resize', () => this.render());
    this.render();
    this.frameHandle = requestAnimationFrame((timestamp) => this.frame(timestamp));
  }

  destroy(): void {
    cancelAnimationFrame(this.frameHandle);
    this.detachVisibility?.();
  }

  private startRun(): void {
    const requestedSeed = parseSeedFromSearch(window.location.search);
    const startingRound = parseRoundFromSearch(window.location.search) ?? undefined;
    this.dispatch({ type: 'START_RUN', runSeed: requestedSeed ?? createRunSeed(), startingRound });
  }

  private handleAction(action: string): void {
    switch (action) {
      case 'pause':
        this.dispatch({ type: this.state.mode === 'paused' ? 'RESUME' : 'PAUSE' });
        break;
      case 'resume':
        this.dispatch({ type: 'RESUME' });
        break;
      case 'mute':
      case 'title-sound':
        this.dispatch({ type: 'SET_SOUND', enabled: !this.state.soundEnabled });
        break;
      case 'title-motion':
        this.dispatch({ type: 'SET_MOTION', mode: nextMotionMode(this.state.motionMode) });
        break;
      case 'restart':
      case 'search-again':
        this.dispatch({ type: 'RESTART', runSeed: createRunSeed() });
        break;
      case 'back-title':
        this.dispatch({ type: 'BACK_TO_TITLE' });
        break;
      case 'continue-portrait':
        this.portraitAllowed = true;
        this.render();
        break;
      default:
        break;
    }
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (isFormControl(event.target)) {
      return;
    }
    if (event.key === ' ') {
      event.preventDefault();
      this.handleAction('pause');
    } else if (event.key.toLowerCase() === 'm') {
      this.handleAction('mute');
    } else if (event.key.toLowerCase() === 'r') {
      this.handleAction('restart');
    } else if (event.key === 'Escape') {
      this.handleAction(this.state.mode === 'paused' ? 'resume' : 'pause');
    }
  }

  private dispatch(event: GameEvent): void {
    const previous = this.state;
    const next = reduceGame(previous, event);
    if (next === previous) {
      return;
    }
    this.state = next;
    if (previous.mode !== next.mode || previous.outcomeToken !== next.outcomeToken) {
      this.modeElapsedMs = 0;
    }
    if (next.mode === 'paused' && previous.mode !== 'paused') {
      this.clock.pause('manual');
    }
    if (previous.mode === 'paused' && next.mode !== 'paused') {
      this.clock.resume('manual');
    }
    if (event.type === 'START_RUN' || event.type === 'RESTART') {
      this.clock.reset();
      if (document.hidden) {
        this.clock.pause('hidden');
      }
    }

    if (event.type === 'MISS' && this.scene) {
      reactToSceneMiss(this.scene, event.x, event.y);
    }
    if (event.type === 'MITCH_CAUGHT' && next.lastCaptureMs !== null) {
      this.state = reduceGame(this.state, {
        type: 'SET_RECORDS',
        records: recordSuccessfulCatch(this.state.records, next.lastCaptureMs),
      });
    }
    if (event.type === 'CAPTURE_COMPLETE' || event.type === 'ESCAPE_COMPLETE') {
      this.state = reduceGame(this.state, {
        type: 'SET_RECORDS',
        records: recordCompletedRounds(this.state.records, this.state.completedRounds),
      });
    }
    if (event.type === 'SET_SOUND') {
      this.state = reduceGame(this.state, {
        type: 'SET_RECORDS',
        records: withSoundEnabled(this.state.records, event.enabled),
      });
    }
    if (event.type === 'SET_MOTION') {
      this.state = reduceGame(this.state, {
        type: 'SET_RECORDS',
        records: withMotionMode(this.state.records, event.mode),
      });
    }

    if (
      (event.type === 'START_RUN' || event.type === 'RESTART') &&
      this.state.mode === 'round_intro'
    ) {
      this.prepareRound();
    }
    if (event.type === 'BACK_TO_TITLE') {
      this.scene = null;
    }
    this.render();
  }

  private prepareRound(): void {
    const sceneSeed = deriveSeed(this.state.runSeed, `round-${this.state.round}-scene`);
    const difficulty = difficultyForRound(this.state.completedRounds);
    this.scene = createWashingtonScene(sceneSeed, difficulty);
    this.stageRenderer.buildWashington(this.scene);
    this.sceneTitle = this.scene.definition.title;
    this.dispatch({ type: 'ROUND_READY', sceneId: this.scene.definition.id, sceneSeed });
  }

  private frame(timestamp: number): void {
    const simulationDeltaMs = this.clock.tick(timestamp);
    if (this.visibilityCountdownMs > 0 && !document.hidden) {
      this.visibilityCountdownMs = Math.max(
        0,
        this.visibilityCountdownMs - this.clock.lastFrameDeltaMs,
      );
      if (this.visibilityCountdownMs === 0) {
        this.clock.resume('visibility-countdown');
      }
      this.render();
    }
    if (simulationDeltaMs > 0) {
      this.modeElapsedMs += simulationDeltaMs;
      if (this.state.mode === 'playing') {
        this.state = reduceGame(this.state, { type: 'TICK', deltaMs: simulationDeltaMs });
        if (this.scene) {
          updateScene(this.scene, simulationDeltaMs);
        }
      }
      if (
        this.state.mode === 'round_intro' &&
        this.state.sceneId &&
        this.modeElapsedMs >= this.introDuration()
      ) {
        this.dispatch({ type: 'ROUND_INTRO_COMPLETE' });
      } else if (
        this.state.mode === 'player_capture' &&
        this.modeElapsedMs >= this.captureDuration()
      ) {
        this.dispatch({ type: 'CAPTURE_COMPLETE' });
      } else if (
        this.state.mode === 'mitch_escape' &&
        this.modeElapsedMs >= this.escapeDuration()
      ) {
        this.dispatch({ type: 'ESCAPE_COMPLETE' });
      } else if (this.state.mode === 'round_transition' && this.modeElapsedMs >= 280) {
        this.prepareRound();
      }
    }
    this.stageRenderer.render(
      this.state,
      this.clock.elapsedMs,
      this.modeElapsedMs,
      this.prefersReducedMotion(),
    );
    this.updateDebug();
    this.frameHandle = requestAnimationFrame((nextTimestamp) => this.frame(nextTimestamp));
  }

  private handleVisibilityHidden(): void {
    this.clock.pause('hidden');
  }

  private handleVisibilityVisible(): void {
    this.clock.resume('hidden');
    if (this.state.mode === 'playing' && !this.clock.reasons.includes('manual')) {
      this.visibilityCountdownMs = 1500;
      this.clock.pause('visibility-countdown');
    }
    this.render();
  }

  private render(): void {
    this.nodes.playScreen.dataset.portraitAllowed = String(this.portraitAllowed);
    this.uiRenderer.render(this.state, this.sceneTitle, {
      portraitAllowed: this.portraitAllowed,
      visibilityCountdownMs: this.visibilityCountdownMs,
    });
    this.updateDebug();
  }

  private updateDebug(): void {
    if (!this.debugEnabled) {
      return;
    }
    const scene = this.scene;
    window.__WHERES_MITCH_DEBUG__ = Object.freeze({
      mode: this.state.mode,
      runSeed: this.state.runSeed,
      round: this.state.round,
      sceneId: this.state.sceneId,
      sceneSeed: this.state.sceneSeed,
      clicksRemaining: this.state.clicksRemaining,
      completedRounds: this.state.completedRounds,
      difficulty: scene ? Object.freeze({ ...scene.difficulty }) : null,
      actorCount: scene?.actors.length ?? 0,
      actorRoutines:
        scene?.actors.slice(0, 12).map((actor) => `${actor.id}:${actor.routine}`) ?? [],
      mitch: scene ? mitchSnapshot(scene.mitch) : null,
      clock: Object.freeze({
        elapsedMs: this.clock.elapsedMs,
        lastFrameDeltaMs: this.clock.lastFrameDeltaMs,
        paused: this.clock.isPaused,
        reasons: this.clock.reasons,
      }),
      reducedMotion: this.prefersReducedMotion(),
    });
  }

  private prefersReducedMotion(): boolean {
    return (
      this.state.motionMode === 'reduce' ||
      (this.state.motionMode === 'system' &&
        window.matchMedia('(prefers-reduced-motion: reduce)').matches)
    );
  }

  private introDuration(): number {
    return this.prefersReducedMotion() ? 500 : 900;
  }

  private captureDuration(): number {
    return this.prefersReducedMotion() ? 900 : 1450;
  }

  private escapeDuration(): number {
    return this.prefersReducedMotion() ? 900 : 1800;
  }
}

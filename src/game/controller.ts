import { reduceGame, createInitialState, isStageInteractive } from '../core/reducer';
import { createRunSeed, deriveSeed, parseSeedFromSearch } from '../core/rng';
import type { GameEvent } from '../core/events';
import type { MotionMode } from '../core/types';
import {
  recordCompletedRounds,
  recordSuccessfulCatch,
  withMotionMode,
  withSoundEnabled,
} from './records';
import { attachStageInput } from './input';
import { StageRenderer } from '../render/stage-renderer';
import { UiRenderer } from '../render/ui-renderer';

interface GameControllerNodes {
  root: HTMLElement;
  stage: SVGSVGElement;
  startButton: HTMLButtonElement;
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
  private readonly nodes: GameControllerNodes;
  private readonly stageRenderer: StageRenderer;
  private readonly uiRenderer: UiRenderer;
  private frameHandle = 0;
  private previousFrameMs: number | null = null;
  private modeElapsedMs = 0;
  private hidden = document.hidden;
  private portraitAllowed = false;
  private readonly debugEnabled: boolean;
  private sceneTitle = 'WASHINGTON STREET';

  constructor() {
    this.nodes = {
      root: requireControllerNode<HTMLElement>('#game-root'),
      stage: requireControllerNode<SVGSVGElement>('#game-stage'),
      startButton: requireControllerNode<HTMLButtonElement>('#start-button'),
    };
    this.stageRenderer = new StageRenderer(this.nodes.stage);
    this.uiRenderer = new UiRenderer();
    this.debugEnabled = new URLSearchParams(window.location.search).get('debug') === '1';
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
    document.addEventListener('visibilitychange', () => {
      this.hidden = document.hidden;
      this.previousFrameMs = null;
    });
    window.addEventListener('keydown', (event) => this.handleKeyboard(event));
    window.addEventListener('resize', () => this.render());
    this.render();
    this.frameHandle = requestAnimationFrame((timestamp) => this.frame(timestamp));
  }

  destroy(): void {
    cancelAnimationFrame(this.frameHandle);
  }

  private startRun(): void {
    const requestedSeed = parseSeedFromSearch(window.location.search);
    this.dispatch({ type: 'START_RUN', runSeed: requestedSeed ?? createRunSeed() });
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
    this.render();
  }

  private prepareRound(): void {
    const sceneSeed = deriveSeed(this.state.runSeed, `round-${this.state.round}-scene`);
    const scene = this.stageRenderer.buildWashington(sceneSeed);
    this.sceneTitle = scene.title;
    this.dispatch({ type: 'ROUND_READY', sceneId: scene.id, sceneSeed });
  }

  private frame(timestamp: number): void {
    const deltaMs =
      this.previousFrameMs === null ? 0 : Math.min(50, timestamp - this.previousFrameMs);
    this.previousFrameMs = timestamp;
    if (!this.hidden && this.state.mode !== 'paused') {
      this.modeElapsedMs += deltaMs;
      if (this.state.mode === 'playing') {
        this.state = reduceGame(this.state, { type: 'TICK', deltaMs });
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
      timestamp,
      this.modeElapsedMs,
      this.prefersReducedMotion(),
    );
    this.updateDebug();
    this.frameHandle = requestAnimationFrame((nextTimestamp) => this.frame(nextTimestamp));
  }

  private render(): void {
    this.nodes.root
      .closest<HTMLElement>('.game-shell')
      ?.setAttribute('data-portrait-allowed', String(this.portraitAllowed));
    const playScreen = document.querySelector<HTMLElement>('#play-screen');
    if (playScreen) {
      playScreen.dataset.portraitAllowed = String(this.portraitAllowed);
    }
    this.uiRenderer.render(this.state, this.sceneTitle);
    this.updateDebug();
  }

  private updateDebug(): void {
    if (!this.debugEnabled) {
      return;
    }
    window.__WHERES_MITCH_DEBUG__ = Object.freeze({
      mode: this.state.mode,
      runSeed: this.state.runSeed,
      round: this.state.round,
      sceneId: this.state.sceneId,
      sceneSeed: this.state.sceneSeed,
      clicksRemaining: this.state.clicksRemaining,
      completedRounds: this.state.completedRounds,
      actorCount: 40,
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

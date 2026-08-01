import { SimulationClock } from '../core/clock';
import { difficultyForRound } from '../core/difficulty';
import type { GameEvent } from '../core/events';
import { createInitialState, isStageInteractive, reduceGame } from '../core/reducer';
import { createRunSeed, deriveSeed, parseRoundFromSearch, parseSeedFromSearch } from '../core/rng';
import type { MotionMode } from '../core/types';
import { AudioEngine } from '../audio/audio-engine';
import { createWashingtonScene } from '../scenes/washington';
import { captureBeats } from '../render/cutscenes/capture';
import { escapeBeats } from '../render/cutscenes/escape';
import { SequenceRunner, type SequenceSnapshot } from '../render/cutscenes/sequence';
import { StageRenderer, type OutcomeRenderState } from '../render/stage-renderer';
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

interface ActiveOutcome {
  kind: OutcomeRenderState['kind'];
  token: number;
  runner: SequenceRunner<void>;
  snapshot: SequenceSnapshot;
  lastCuedBeatId: string | null;
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
    target instanceof HTMLSelectElement ||
    target instanceof HTMLTextAreaElement ||
    (target instanceof HTMLElement && target.isContentEditable)
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
  private readonly audio = new AudioEngine();
  private frameHandle = 0;
  private modeElapsedMs = 0;
  private visibilityCountdownMs = 0;
  private portraitAllowed = false;
  private restartConfirmationOpen = false;
  private creditsOpen = false;
  private outcome: ActiveOutcome | null = null;
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
    this.audio.setMuted(!this.state.soundEnabled);
    if (document.hidden) {
      this.clock.pause('hidden');
    }
  }

  start(): void {
    this.nodes.startButton.addEventListener('click', (event) => {
      event.stopPropagation();
      void this.audio.unlock();
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
      isEnabled: () =>
        isStageInteractive(this.state) && !this.restartConfirmationOpen && !this.creditsOpen,
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
    void this.audio.dispose();
  }

  private startRun(): void {
    this.restartConfirmationOpen = false;
    this.creditsOpen = false;
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
        if (
          this.state.mode === 'round_intro' ||
          this.state.mode === 'playing' ||
          this.state.mode === 'paused'
        ) {
          this.restartConfirmationOpen = true;
          this.render();
        }
        break;
      case 'confirm-restart':
        this.restartConfirmationOpen = false;
        this.dispatch({ type: 'RESTART', runSeed: createRunSeed() });
        break;
      case 'cancel-restart':
        this.restartConfirmationOpen = false;
        this.render();
        break;
      case 'search-again':
        this.dispatch({ type: 'RESTART', runSeed: createRunSeed() });
        break;
      case 'back-title':
        this.restartConfirmationOpen = false;
        this.dispatch({ type: 'BACK_TO_TITLE' });
        break;
      case 'help':
        this.creditsOpen = true;
        this.render();
        break;
      case 'close-help':
        this.creditsOpen = false;
        this.render();
        break;
      case 'skip-outcome':
        this.skipOutcome();
        break;
      case 'continue-portrait':
        this.portraitAllowed = true;
        this.render();
        break;
      default:
        break;
    }
    if (action !== 'mute' && action !== 'title-sound' && action !== 'skip-outcome') {
      this.audio.cue('ui');
    }
  }

  private handleKeyboard(event: KeyboardEvent): void {
    if (this.restartConfirmationOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.handleAction('cancel-restart');
      }
      return;
    }
    if (this.creditsOpen) {
      if (event.key === 'Escape') {
        event.preventDefault();
        this.handleAction('close-help');
      }
      return;
    }
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
      void this.audio.suspend();
    }
    if (previous.mode === 'paused' && next.mode !== 'paused') {
      this.clock.resume('manual');
      void this.audio.resume();
    }
    if (event.type === 'START_RUN' || event.type === 'RESTART') {
      this.restartConfirmationOpen = false;
      this.creditsOpen = false;
      this.clock.reset();
      if (document.hidden) {
        this.clock.pause('hidden');
      }
    }

    if (event.type === 'MISS' && this.scene) {
      reactToSceneMiss(this.scene, event.x, event.y);
      this.audio.cue('miss');
    }
    if (event.type === 'MITCH_CAUGHT' && next.lastCaptureMs !== null) {
      this.audio.cue('catch');
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
      this.audio.setMuted(!event.enabled);
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

    this.syncOutcome();

    if (
      (event.type === 'START_RUN' || event.type === 'RESTART') &&
      this.state.mode === 'round_intro'
    ) {
      this.prepareRound();
    }
    if (event.type === 'BACK_TO_TITLE') {
      this.scene = null;
      this.creditsOpen = false;
    }
    this.render();
  }

  private syncOutcome(): void {
    const kind =
      this.state.mode === 'player_capture'
        ? 'capture'
        : this.state.mode === 'mitch_escape'
          ? 'escape'
          : null;
    if (!kind) {
      if (this.outcome) {
        this.outcome.runner.cancel(this.outcome.token);
        this.outcome = null;
      }
      return;
    }
    if (this.outcome?.kind === kind && this.outcome.token === this.state.outcomeToken) {
      return;
    }
    this.outcome?.runner.cancel(this.outcome.token);
    const runner = new SequenceRunner(kind === 'capture' ? captureBeats : escapeBeats);
    this.outcome = {
      kind,
      token: this.state.outcomeToken,
      runner,
      snapshot: runner.start(this.state.outcomeToken, undefined, this.prefersReducedMotion()),
      lastCuedBeatId: null,
    };
    this.cueOutcomeBeat();
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
        void this.audio.resume();
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
      if (this.outcome) {
        const previousBeatId = this.outcome.snapshot.beatId;
        const skipWasAvailable = this.outcome.snapshot.elapsedMs >= 1000;
        this.outcome.snapshot = this.outcome.runner.advance(simulationDeltaMs, undefined);
        this.cueOutcomeBeat();
        const outcomeUiChanged =
          this.outcome.snapshot.beatId !== previousBeatId ||
          (!skipWasAvailable && this.outcome.snapshot.elapsedMs >= 1000);
        this.resolveCompletedOutcome();
        if (outcomeUiChanged && this.outcome) {
          this.render();
        }
      }
      if (
        this.state.mode === 'round_intro' &&
        this.state.sceneId &&
        this.modeElapsedMs >= this.introDuration()
      ) {
        this.dispatch({ type: 'ROUND_INTRO_COMPLETE' });
      } else if (this.state.mode === 'round_transition' && this.modeElapsedMs >= 280) {
        this.prepareRound();
      }
    }
    this.stageRenderer.render(
      this.state,
      this.clock.elapsedMs,
      this.prefersReducedMotion(),
      this.outcome ? { kind: this.outcome.kind, snapshot: this.outcome.snapshot } : null,
    );
    this.updateDebug();
    this.frameHandle = requestAnimationFrame((nextTimestamp) => this.frame(nextTimestamp));
  }

  private handleVisibilityHidden(): void {
    this.clock.pause('hidden');
    void this.audio.suspend();
  }

  private handleVisibilityVisible(): void {
    this.clock.resume('hidden');
    if (this.state.mode === 'playing' && !this.clock.reasons.includes('manual')) {
      this.visibilityCountdownMs = 1500;
      this.clock.pause('visibility-countdown');
    } else if (!this.clock.reasons.includes('manual')) {
      void this.audio.resume();
    }
    this.render();
  }

  private render(): void {
    this.nodes.playScreen.dataset.portraitAllowed = String(this.portraitAllowed);
    this.uiRenderer.render(this.state, this.sceneTitle, {
      portraitAllowed: this.portraitAllowed,
      visibilityCountdownMs: this.visibilityCountdownMs,
      restartConfirmationOpen: this.restartConfirmationOpen,
      creditsOpen: this.creditsOpen,
      outcome: this.outcome
        ? {
            kind: this.outcome.kind,
            beatId: this.outcome.snapshot.beatId,
            canSkip: this.outcome.snapshot.elapsedMs >= 1000,
          }
        : null,
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
      outcome: this.outcome
        ? Object.freeze({
            kind: this.outcome.kind,
            token: this.outcome.token,
            beatId: this.outcome.snapshot.beatId,
            elapsedMs: this.outcome.snapshot.elapsedMs,
            completed: this.outcome.snapshot.completed,
          })
        : null,
      audio: this.audio.debugState,
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

  private skipOutcome(): void {
    if (!this.outcome || this.outcome.snapshot.elapsedMs < 1000) {
      return;
    }
    this.outcome.snapshot = this.outcome.runner.skip(undefined);
    this.resolveCompletedOutcome();
    this.render();
  }

  private resolveCompletedOutcome(): void {
    const outcome = this.outcome;
    if (!outcome || !outcome.snapshot.completed || outcome.token !== this.state.outcomeToken) {
      return;
    }
    this.outcome = null;
    this.dispatch({ type: outcome.kind === 'capture' ? 'CAPTURE_COMPLETE' : 'ESCAPE_COMPLETE' });
  }

  private cueOutcomeBeat(): void {
    const outcome = this.outcome;
    if (!outcome || outcome.snapshot.beatId === outcome.lastCuedBeatId) {
      return;
    }
    outcome.lastCuedBeatId = outcome.snapshot.beatId;
    if (outcome.kind === 'capture') {
      if (outcome.snapshot.beatId === 'dispatch') {
        this.audio.cue('shell');
      } else if (outcome.snapshot.beatId === 'stamp') {
        this.audio.cue('capitol');
      }
      return;
    }
    switch (outcome.snapshot.beatId) {
      case 'cash':
        this.audio.cue('cash');
        break;
      case 'approach':
      case 'helicopter-entry':
        this.audio.cue('rotor');
        break;
      case 'rope':
        this.audio.cue('rope');
        break;
      case 'escape':
        this.audio.cue('escape');
        break;
      default:
        break;
    }
  }
}

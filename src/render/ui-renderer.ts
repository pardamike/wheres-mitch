import type { GameState } from '../core/types';

export interface UiRenderOptions {
  portraitAllowed: boolean;
  visibilityCountdownMs: number;
}

interface UiNodes {
  root: HTMLElement;
  titleScreen: HTMLElement;
  playScreen: HTMLElement;
  roundNumber: HTMLElement;
  clicksRemaining: HTMLElement;
  attemptDots: HTMLElement;
  completedRounds: HTMLElement;
  bestRounds: HTMLElement;
  roundCard: HTMLElement;
  roundCardKicker: HTMLElement;
  roundCardTitle: HTMLElement;
  pauseCard: HTMLElement;
  visibilityCard: HTMLElement;
  visibilityCardKicker: HTMLElement;
  visibilityCardTitle: HTMLElement;
  gameOverCard: HTMLElement;
  footerInstruction: HTMLElement;
  gameStatus: HTMLElement;
  resultRounds: HTMLElement;
  resultAttempts: HTMLElement;
  resultAccuracy: HTMLElement;
  resultFastest: HTMLElement;
  resultBest: HTMLElement;
  pauseButtons: HTMLButtonElement[];
  muteButtons: HTMLButtonElement[];
  titleSoundButton: HTMLButtonElement | null;
  titleMotionButton: HTMLButtonElement | null;
}

function requireNode<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) {
    throw new Error(`Required UI node is missing: ${selector}`);
  }
  return element;
}

function formatDuration(milliseconds: number | null): string {
  return milliseconds === null ? '—' : `${(milliseconds / 1000).toFixed(1)}s`;
}

function announce(state: GameState, sceneTitle: string): string {
  switch (state.mode) {
    case 'title':
      return 'Where’s Mitch? ready.';
    case 'round_intro':
      return `Round ${state.round}: ${sceneTitle}.`;
    case 'playing':
      return `Round ${state.round} is live. ${state.clicksRemaining} clicks left.`;
    case 'paused':
      return 'Paused. Mitch is still in there.';
    case 'player_capture':
      return 'Found him!';
    case 'mitch_escape':
      return 'Mitch got away.';
    case 'game_over':
      return `Game over. ${state.completedRounds} rounds returned.`;
    default:
      return '';
  }
}

export class UiRenderer {
  private readonly nodes: UiNodes;
  private lastAnnouncement = '';

  constructor() {
    this.nodes = {
      root: requireNode<HTMLElement>('#game-root'),
      titleScreen: requireNode<HTMLElement>('#title-screen'),
      playScreen: requireNode<HTMLElement>('#play-screen'),
      roundNumber: requireNode<HTMLElement>('#round-number'),
      clicksRemaining: requireNode<HTMLElement>('#clicks-remaining'),
      attemptDots: requireNode<HTMLElement>('#attempt-dots'),
      completedRounds: requireNode<HTMLElement>('#completed-rounds'),
      bestRounds: requireNode<HTMLElement>('#best-rounds'),
      roundCard: requireNode<HTMLElement>('#round-card'),
      roundCardKicker: requireNode<HTMLElement>('#round-card-kicker'),
      roundCardTitle: requireNode<HTMLElement>('#round-card-title'),
      pauseCard: requireNode<HTMLElement>('#pause-card'),
      visibilityCard: requireNode<HTMLElement>('#visibility-card'),
      visibilityCardKicker: requireNode<HTMLElement>('#visibility-card-kicker'),
      visibilityCardTitle: requireNode<HTMLElement>('#visibility-card-title'),
      gameOverCard: requireNode<HTMLElement>('#game-over-card'),
      footerInstruction: requireNode<HTMLElement>('#footer-instruction'),
      gameStatus: requireNode<HTMLElement>('#game-status'),
      resultRounds: requireNode<HTMLElement>('#result-rounds'),
      resultAttempts: requireNode<HTMLElement>('#result-attempts'),
      resultAccuracy: requireNode<HTMLElement>('#result-accuracy'),
      resultFastest: requireNode<HTMLElement>('#result-fastest'),
      resultBest: requireNode<HTMLElement>('#result-best'),
      pauseButtons: Array.from(
        document.querySelectorAll<HTMLButtonElement>('[data-action="pause"]'),
      ),
      muteButtons: Array.from(document.querySelectorAll<HTMLButtonElement>('[data-action="mute"]')),
      titleSoundButton: document.querySelector<HTMLButtonElement>('[data-action="title-sound"]'),
      titleMotionButton: document.querySelector<HTMLButtonElement>('[data-action="title-motion"]'),
    };
  }

  render(
    state: GameState,
    sceneTitle = 'WASHINGTON STREET',
    options: UiRenderOptions = { portraitAllowed: false, visibilityCountdownMs: 0 },
  ): void {
    const isTitle = state.mode === 'title' || state.mode === 'boot';
    this.nodes.root.dataset.mode = state.mode;
    this.nodes.root.dataset.gameState = state.mode;
    this.nodes.root.dataset.scene = state.sceneId ?? '';
    this.nodes.root.dataset.round = String(state.round);
    this.nodes.titleScreen.hidden = !isTitle;
    this.nodes.playScreen.hidden = isTitle;

    this.nodes.roundNumber.textContent = String(state.round);
    this.nodes.clicksRemaining.textContent = String(state.clicksRemaining);
    this.nodes.attemptDots.textContent = `${'●'.repeat(state.clicksRemaining)}${'○'.repeat(10 - state.clicksRemaining)}`;
    this.nodes.completedRounds.textContent = String(state.completedRounds);
    this.nodes.bestRounds.textContent = String(state.records.bestRounds);
    this.nodes.roundCardKicker.textContent = `ROUND ${state.round}`;
    this.nodes.roundCardTitle.textContent = sceneTitle;
    this.nodes.roundCard.hidden = state.mode !== 'round_intro' || !state.sceneId;
    this.nodes.pauseCard.hidden = state.mode !== 'paused';
    this.nodes.visibilityCard.hidden = options.visibilityCountdownMs <= 0;
    this.nodes.visibilityCardKicker.textContent =
      options.visibilityCountdownMs > 1000
        ? 'READY'
        : options.visibilityCountdownMs > 500
          ? 'SET'
          : 'FIND!';
    this.nodes.visibilityCardTitle.textContent =
      options.visibilityCountdownMs > 500 ? 'Mitch is moving again…' : 'GO!';
    this.nodes.gameOverCard.hidden = state.mode !== 'game_over';
    this.nodes.footerInstruction.textContent = `Find the turtle. Wrong clicks: ${10 - state.clicksRemaining}/10.`;

    const accuracy =
      state.totalAttempts === 0 ? 0 : Math.round((state.catches / state.totalAttempts) * 100);
    this.nodes.resultRounds.textContent = String(state.completedRounds);
    this.nodes.resultAttempts.textContent = String(state.totalAttempts);
    this.nodes.resultAccuracy.textContent = `${accuracy}%`;
    this.nodes.resultFastest.textContent = formatDuration(
      state.fastestRunFindMs ?? state.records.fastestFindMs,
    );
    this.nodes.resultBest.textContent = String(state.records.bestRounds);

    const pauseLabel = state.mode === 'paused' ? 'Resume game' : 'Pause game';
    for (const button of this.nodes.pauseButtons) {
      button.setAttribute('aria-label', pauseLabel);
      button.textContent = state.mode === 'paused' ? '▶' : 'Ⅱ';
    }
    for (const button of this.nodes.muteButtons) {
      button.setAttribute('aria-label', state.soundEnabled ? 'Mute sound' : 'Unmute sound');
      button.textContent = state.soundEnabled ? '♪' : '×';
    }
    if (this.nodes.titleSoundButton) {
      this.nodes.titleSoundButton.textContent = `SOUND: ${state.soundEnabled ? 'ON' : 'OFF'}`;
    }
    if (this.nodes.titleMotionButton) {
      this.nodes.titleMotionButton.textContent = `MOTION: ${state.motionMode.toUpperCase()}`;
    }

    const announcement = announce(state, sceneTitle);
    if (announcement && announcement !== this.lastAnnouncement) {
      this.nodes.gameStatus.textContent = announcement;
      this.lastAnnouncement = announcement;
    }
  }
}

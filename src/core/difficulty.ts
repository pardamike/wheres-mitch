import type { DifficultyProfile } from './types';

function finiteRoundIndex(completedRounds: number): number {
  if (!Number.isFinite(completedRounds)) {
    return 0;
  }
  return Math.max(0, Math.floor(completedRounds));
}

export function difficultyForRound(completedRounds: number): DifficultyProfile {
  const index = finiteRoundIndex(completedRounds);
  return {
    crowdCount: Math.min(60 + 3 * index, 96),
    crowdSpeed: Math.min(1.1 + 0.04 * index, 1.65),
    mitchSpeed: Math.min(2000, 340 * 1.09 ** index),
    routeDecisionMs: Math.max(70, 220 * 0.9 ** index),
    dwellMs: Math.max(180, 3400 * 0.91 ** index),
    peekMs: Math.max(60, 800 * 0.9 ** index),
    maxHiddenMs: Math.max(180, 3200 * 0.93 ** index),
    hitboxScale: Math.max(0.72, 0.95 * 0.975 ** index),
  };
}

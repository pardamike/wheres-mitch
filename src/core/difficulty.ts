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
    crowdCount: Math.min(48 + 4 * index, 96),
    crowdSpeed: Math.min(1 + 0.035 * index, 1.65),
    mitchSpeed: Math.min(2000, 70 * 1.12 ** index),
    routeDecisionMs: Math.max(70, 3200 * 0.87 ** index),
    dwellMs: Math.max(70, 2100 * 0.89 ** index),
    peekMs: Math.max(60, 1200 * 0.9 ** index),
    maxHiddenMs: Math.max(140, 2400 * 0.92 ** index),
    hitboxScale: Math.max(0.72, 1.15 * 0.975 ** index),
  };
}

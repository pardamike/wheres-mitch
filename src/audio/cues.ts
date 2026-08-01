export type AudioCue =
  'ui' | 'miss' | 'catch' | 'shell' | 'capitol' | 'cash' | 'rotor' | 'rope' | 'escape';

export interface ToneCue {
  frequency: number;
  durationMs: number;
  gain: number;
  offsetMs?: number;
  type?: OscillatorType;
  endFrequency?: number;
}

export interface CueDefinition {
  tones: readonly ToneCue[];
  noise?: readonly NoiseCue[];
}

export interface NoiseCue {
  durationMs: number;
  gain: number;
  offsetMs?: number;
}

/**
 * Small original synthesizer recipes. They intentionally use no sampled audio or music.
 * The audio engine turns these into short oscillator envelopes only after a player gesture.
 */
export const AUDIO_CUES: Readonly<Record<AudioCue, CueDefinition>> = {
  ui: {
    tones: [{ frequency: 660, endFrequency: 820, durationMs: 55, gain: 0.055, type: 'square' }],
  },
  miss: {
    tones: [{ frequency: 180, endFrequency: 115, durationMs: 85, gain: 0.07, type: 'square' }],
    noise: [{ durationMs: 54, gain: 0.018 }],
  },
  catch: {
    tones: [
      { frequency: 392, durationMs: 260, gain: 0.05, type: 'triangle' },
      { frequency: 494, durationMs: 260, gain: 0.045, offsetMs: 35, type: 'triangle' },
      { frequency: 587, durationMs: 300, gain: 0.042, offsetMs: 70, type: 'triangle' },
    ],
  },
  shell: {
    tones: [
      { frequency: 250, endFrequency: 870, durationMs: 280, gain: 0.04, type: 'sawtooth' },
      {
        frequency: 94,
        endFrequency: 142,
        durationMs: 150,
        gain: 0.035,
        offsetMs: 85,
        type: 'square',
      },
    ],
    noise: [{ durationMs: 190, gain: 0.012, offsetMs: 45 }],
  },
  capitol: {
    tones: [
      { frequency: 145, endFrequency: 80, durationMs: 95, gain: 0.075, type: 'square' },
      { frequency: 1047, durationMs: 320, gain: 0.035, offsetMs: 90, type: 'sine' },
    ],
  },
  cash: {
    tones: [
      { frequency: 360, endFrequency: 590, durationMs: 90, gain: 0.045, type: 'triangle' },
      {
        frequency: 460,
        endFrequency: 700,
        durationMs: 90,
        gain: 0.04,
        offsetMs: 65,
        type: 'triangle',
      },
      {
        frequency: 560,
        endFrequency: 810,
        durationMs: 100,
        gain: 0.035,
        offsetMs: 130,
        type: 'triangle',
      },
    ],
  },
  rotor: {
    tones: [
      { frequency: 54, endFrequency: 62, durationMs: 360, gain: 0.045, type: 'sawtooth' },
      { frequency: 108, endFrequency: 124, durationMs: 360, gain: 0.02, type: 'square' },
    ],
    noise: [{ durationMs: 330, gain: 0.008 }],
  },
  rope: {
    tones: [
      { frequency: 230, endFrequency: 410, durationMs: 260, gain: 0.045, type: 'sawtooth' },
      {
        frequency: 820,
        endFrequency: 510,
        durationMs: 220,
        gain: 0.022,
        offsetMs: 35,
        type: 'square',
      },
    ],
    noise: [{ durationMs: 150, gain: 0.01 }],
  },
  escape: {
    tones: [
      { frequency: 392, endFrequency: 262, durationMs: 300, gain: 0.05, type: 'triangle' },
      {
        frequency: 311,
        endFrequency: 196,
        durationMs: 380,
        gain: 0.045,
        offsetMs: 100,
        type: 'triangle',
      },
      {
        frequency: 208,
        endFrequency: 131,
        durationMs: 450,
        gain: 0.04,
        offsetMs: 205,
        type: 'triangle',
      },
    ],
  },
};

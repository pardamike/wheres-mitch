import { describe, expect, it } from 'vitest';
import {
  AudioEngine,
  type AudioContextLike,
  type AudioNodeLike,
  type AudioParamLike,
  type GainNodeLike,
  type OscillatorNodeLike,
} from '../../src/audio/audio-engine';

class FakeParam implements AudioParamLike {
  readonly values: number[] = [];

  setValueAtTime(value: number): void {
    this.values.push(value);
  }

  linearRampToValueAtTime(value: number): void {
    this.values.push(value);
  }

  exponentialRampToValueAtTime(value: number): void {
    this.values.push(value);
  }
}

class FakeNode implements AudioNodeLike {
  readonly connections: AudioNodeLike[] = [];

  connect(destination: AudioNodeLike): void {
    this.connections.push(destination);
  }
}

class FakeGain extends FakeNode implements GainNodeLike {
  readonly gain = new FakeParam();
}

class FakeOscillator extends FakeNode implements OscillatorNodeLike {
  readonly frequency = new FakeParam();
  type: OscillatorType = 'sine';
  started = 0;
  stopped = 0;

  start(): void {
    this.started += 1;
  }

  stop(): void {
    this.stopped += 1;
  }
}

class FakeAudioContext implements AudioContextLike {
  currentTime = 2;
  state = 'suspended';
  readonly destination = new FakeNode();
  readonly gains: FakeGain[] = [];
  readonly oscillators: FakeOscillator[] = [];
  resumeCalls = 0;
  suspendCalls = 0;
  closeCalls = 0;

  createGain(): GainNodeLike {
    const gain = new FakeGain();
    this.gains.push(gain);
    return gain;
  }

  createOscillator(): OscillatorNodeLike {
    const oscillator = new FakeOscillator();
    this.oscillators.push(oscillator);
    return oscillator;
  }

  async resume(): Promise<void> {
    this.resumeCalls += 1;
    this.state = 'running';
  }

  async suspend(): Promise<void> {
    this.suspendCalls += 1;
    this.state = 'suspended';
  }

  async close(): Promise<void> {
    this.closeCalls += 1;
    this.state = 'closed';
  }
}

describe('procedural audio engine', () => {
  it('creates no context or sound before explicit unlock, then schedules local oscillator cues', async () => {
    let factoryCalls = 0;
    const context = new FakeAudioContext();
    const engine = new AudioEngine({
      contextFactory: () => {
        factoryCalls += 1;
        return context;
      },
    });

    expect(engine.cue('miss')).toBe(false);
    expect(factoryCalls).toBe(0);
    expect(engine.debugState.unlocked).toBe(false);

    await expect(engine.unlock()).resolves.toBe(true);
    expect(factoryCalls).toBe(1);
    expect(context.resumeCalls).toBe(1);
    expect(engine.cue('catch')).toBe(true);
    expect(context.oscillators).toHaveLength(3);
    expect(context.oscillators.every((oscillator) => oscillator.started === 1)).toBe(true);
    expect(engine.debugState.cueCount).toBe(1);
  });

  it('mutes immediately and suspends/resumes only after prior unlock', async () => {
    const context = new FakeAudioContext();
    const engine = new AudioEngine({ contextFactory: () => context });

    await engine.unlock();
    engine.setMuted(true);
    expect(engine.cue('miss')).toBe(false);
    const masterValues = context.gains[0]?.gain.values ?? [];
    expect(masterValues[masterValues.length - 1]).toBe(0);

    await engine.suspend();
    expect(context.suspendCalls).toBe(1);
    expect(engine.debugState.suspended).toBe(true);
    await engine.resume();
    expect(context.resumeCalls).toBe(2);
    engine.setMuted(false);
    expect(engine.cue('miss')).toBe(true);
    await engine.dispose();
    expect(context.closeCalls).toBe(1);
  });

  it('treats unavailable or failing Web Audio as nonfatal', async () => {
    const missing = new AudioEngine({ contextFactory: () => null });
    await expect(missing.unlock()).resolves.toBe(false);
    expect(missing.debugState.available).toBe(false);
    expect(missing.cue('ui')).toBe(false);

    const broken = new AudioEngine({
      contextFactory: () => {
        throw new Error('no audio device');
      },
    });
    await expect(broken.unlock()).resolves.toBe(false);
    expect(broken.debugState.available).toBe(false);
  });
});

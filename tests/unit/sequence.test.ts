import { describe, expect, it } from 'vitest';
import { SequenceRunner, type SequenceBeat } from '../../src/render/cutscenes/sequence';

interface FixtureContext {
  events: string[];
}

function fixtureBeats(): SequenceBeat<FixtureContext>[] {
  return [
    {
      id: 'look',
      durationMs: 100,
      reducedDurationMs: 20,
      enter: (context) => context.events.push('enter:look'),
      update: (context, progress) => context.events.push(`update:look:${progress.toFixed(1)}`),
      exit: (context) => context.events.push('exit:look'),
    },
    {
      id: 'go',
      durationMs: 200,
      reducedDurationMs: 40,
      enter: (context) => context.events.push('enter:go'),
      update: (context, progress) => context.events.push(`update:go:${progress.toFixed(1)}`),
      exit: (context) => context.events.push('exit:go'),
    },
  ];
}

describe('declarative cutscene sequence runner', () => {
  it('runs ordered enter/update/exit hooks and completes once across a large delta', () => {
    const context: FixtureContext = { events: [] };
    const runner = new SequenceRunner(fixtureBeats());
    runner.start(7, context);
    const completed = runner.advance(999, context);

    expect(completed.completed).toBe(true);
    expect(completed.active).toBe(false);
    expect(completed.elapsedMs).toBe(300);
    expect(context.events).toEqual([
      'enter:look',
      'update:look:0.0',
      'update:look:1.0',
      'exit:look',
      'enter:go',
      'update:go:0.0',
      'update:go:1.0',
      'exit:go',
    ]);
    expect(runner.advance(999, context)).toEqual(completed);
  });

  it('holds exact state for zero or invalid deltas and uses the reduced durations', () => {
    const context: FixtureContext = { events: [] };
    const runner = new SequenceRunner(fixtureBeats());
    runner.start(3, context, true);
    const before = runner.snapshot;

    expect(runner.advance(0, context)).toEqual(before);
    expect(runner.advance(Number.NaN, context)).toEqual(before);
    const after = runner.advance(20, context);
    expect(after.beatId).toBe('go');
    expect(after.elapsedMs).toBe(20);
    expect(after.totalDurationMs).toBe(60);
  });

  it('skips all remaining beats to the same final snapshot once', () => {
    const context: FixtureContext = { events: [] };
    const runner = new SequenceRunner(fixtureBeats());
    runner.start(8, context);
    runner.advance(40, context);
    const skipped = runner.skip(context);

    expect(skipped.completed).toBe(true);
    expect(skipped.skipped).toBe(true);
    expect(skipped.elapsedMs).toBe(300);
    expect(context.events.filter((event) => event.startsWith('exit:'))).toEqual([
      'exit:look',
      'exit:go',
    ]);
    expect(runner.skip(context)).toEqual(skipped);
  });

  it('cancels only its active token and rejects malformed beat definitions', () => {
    const context: FixtureContext = { events: [] };
    const runner = new SequenceRunner(fixtureBeats());
    runner.start(4, context);

    expect(runner.cancel(9).active).toBe(true);
    const cancelled = runner.cancel(4);
    expect(cancelled.cancelled).toBe(true);
    expect(cancelled.completed).toBe(false);
    expect(cancelled.active).toBe(false);
    expect(() => new SequenceRunner([{ id: '', durationMs: 1 }])).toThrow('unique');
    expect(() => new SequenceRunner([{ id: 'bad', durationMs: 0 }])).toThrow('positive duration');
  });
});

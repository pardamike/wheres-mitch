export interface SeededRng {
  next(): number;
  int(minimumInclusive: number, maximumExclusive: number): number;
  pick<T>(items: readonly T[]): T;
  shuffle<T>(items: readonly T[]): T[];
}

export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function deriveSeed(rootSeed: number, streamName: string): number {
  let mixed = (rootSeed >>> 0) ^ hashString(streamName);
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
  mixed = Math.imul(mixed ^ (mixed >>> 16), 0x45d9f3b);
  return (mixed ^ (mixed >>> 16)) >>> 0;
}

export function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4_294_967_296;
  };
}

export function createRng(seed: number): SeededRng {
  const next = mulberry32(seed);
  return {
    next,
    int(minimumInclusive, maximumExclusive) {
      if (!Number.isInteger(minimumInclusive) || !Number.isInteger(maximumExclusive)) {
        throw new Error('RNG integer bounds must be whole numbers.');
      }
      if (maximumExclusive <= minimumInclusive) {
        throw new Error('RNG maximum must be greater than minimum.');
      }
      return minimumInclusive + Math.floor(next() * (maximumExclusive - minimumInclusive));
    },
    pick<T>(items: readonly T[]): T {
      if (items.length === 0) {
        throw new Error('Cannot choose from an empty collection.');
      }
      return items[Math.floor(next() * items.length)] as T;
    },
    shuffle<T>(items: readonly T[]): T[] {
      const result = [...items];
      for (let index = result.length - 1; index > 0; index -= 1) {
        const destination = Math.floor(next() * (index + 1));
        [result[index], result[destination]] = [result[destination] as T, result[index] as T];
      }
      return result;
    },
  };
}

export function parseUint32(value: string | null | undefined): number | null {
  if (!value || !/^(?:0|[1-9]\d{0,9})$/.test(value)) {
    return null;
  }
  const parsed = Number(value);
  return Number.isSafeInteger(parsed) && parsed >= 0 && parsed <= 0xffff_ffff ? parsed : null;
}

export function parseSeedFromSearch(search: string): number | null {
  return parseUint32(new URLSearchParams(search).get('seed'));
}

export function parseRoundFromSearch(search: string): number | null {
  const value = parseUint32(new URLSearchParams(search).get('round'));
  return value !== null && value >= 1 && value <= 100 ? value : null;
}

export function createRunSeed(now = Date.now()): number {
  const values = new Uint32Array(1);
  if (globalThis.crypto?.getRandomValues) {
    globalThis.crypto.getRandomValues(values);
    return values[0] as number;
  }
  const elapsed = Math.floor(globalThis.performance?.now?.() ?? 0);
  return (now ^ elapsed ^ (now >>> 11)) >>> 0;
}

import { createRng, deriveSeed } from '../core/rng';

export type CrowdActivity = 'commute' | 'queue' | 'chat' | 'observe' | 'sit' | 'interact';

export interface CrowdActorModel {
  id: string;
  x: number;
  y: number;
  lane: 'back' | 'mid';
  scale: number;
  color: string;
  skin: string;
  hair: string;
  accessory: 'hat' | 'bag' | 'coffee' | 'camera' | 'none';
  activity: CrowdActivity;
  speed: number;
  sway: number;
  phase: number;
}

export interface WashingtonSceneModel {
  id: 'washington';
  title: 'WASHINGTON STREET';
  seed: number;
  actors: CrowdActorModel[];
  mitchStart: { x: number; y: number };
}

const clothing = ['#D9443F', '#2E5EAA', '#557A46', '#F2C14E', '#8A5B9E', '#D4794A', '#4D718C'];
const skinTones = ['#F2C7A5', '#D99D76', '#B97654', '#8C593F', '#F7D5B6'];
const hairColors = ['#2E241E', '#4A3428', '#8A5A3B', '#C9B08A', '#172033'];
const activities: CrowdActivity[] = ['commute', 'queue', 'chat', 'observe', 'sit', 'interact'];
const accessories: CrowdActorModel['accessory'][] = ['hat', 'bag', 'coffee', 'camera', 'none'];

export function createWashingtonScene(seed: number, actorCount = 40): WashingtonSceneModel {
  const rng = createRng(deriveSeed(seed, 'washington-crowd'));
  const actors: CrowdActorModel[] = [];

  for (let index = 0; index < actorCount; index += 1) {
    const lane = index % 3 === 0 ? 'back' : 'mid';
    const queueActor = index < 7;
    actors.push({
      id: `washington-actor-${index}`,
      x: queueActor ? 920 + index * 22 : rng.int(100, 1360),
      y: queueActor
        ? 610 + (index % 2) * 15
        : lane === 'back'
          ? rng.int(360, 535)
          : rng.int(560, 765),
      lane,
      scale: lane === 'back' ? 0.68 + rng.next() * 0.16 : 0.8 + rng.next() * 0.24,
      color: rng.pick(clothing),
      skin: rng.pick(skinTones),
      hair: rng.pick(hairColors),
      accessory: rng.pick(accessories),
      activity: queueActor ? 'queue' : rng.pick(activities),
      speed: 0.35 + rng.next() * 0.75,
      sway: 8 + rng.next() * 32,
      phase: rng.next() * Math.PI * 2,
    });
  }

  return {
    id: 'washington',
    title: 'WASHINGTON STREET',
    seed,
    actors,
    mitchStart: { x: 700 + rng.int(-40, 41), y: 618 + rng.int(-25, 26) },
  };
}

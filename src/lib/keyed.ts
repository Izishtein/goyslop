import type { Rng } from './encounter';
import { rollDie } from './oracle';

/*
 * Keyed scenes: "if X, then in a later scene Y". The player writes down an event and what sets it
 * off; each new scene the oracle checks the triggers and says which have fired. For prepared
 * adventures the same module keeps the adventure's features and the diminisher (how much weaker
 * one hero is than the party the module was written for).
 */

export const TRIGGERS = ['counter', 'random', 'milestone'] as const;
export type Trigger = (typeof TRIGGERS)[number];

export interface KeyedScene {
  id: string;
  /** What happens when it fires. */
  title: string;
  /**
   * counter   — fires after `every` scenes (a wandering monster every four scenes);
   * random    — each scene a d10 at or under `chance` fires it (a trap on a 1);
   * milestone — from scene `at` onward, each scene a d10 at or under `chance` (the boss after scene 15 on 1–3).
   */
  trigger: Trigger;
  every: number;
  chance: number;
  at: number;
  /** One-off by default; a repeating scene starts counting again after it fires. */
  repeat: boolean;
  /** Scenes counted since it last fired or was reset. */
  count: number;
  done: boolean;
}

export const KEYED_LIMIT = 30;
export const FEATURE_LIMIT = 20;
export const TEXT_LIMIT = 120;

export const clampInt = (value: number, min: number, max: number): number => Math.min(max, Math.max(min, Math.round(value) || min));

export function newKeyedScene(input: Partial<KeyedScene> & { title: string }, id: string): KeyedScene {
  return {
    id,
    title: input.title.trim().slice(0, TEXT_LIMIT),
    trigger: input.trigger ?? 'counter',
    every: clampInt(input.every ?? 3, 1, 99),
    chance: clampInt(input.chance ?? 2, 1, 10),
    at: clampInt(input.at ?? 10, 1, 999),
    repeat: input.repeat ?? false,
    count: 0,
    done: false,
  };
}

export interface KeyedResult {
  scenes: KeyedScene[];
  fired: KeyedScene[];
}

/** A new scene begins: tick the counters, roll the dice, return what fired. */
export function advanceScene(scenes: KeyedScene[], scene: number, rng: Rng = Math.random): KeyedResult {
  const fired: KeyedScene[] = [];
  const next = scenes.map((keyed) => {
    if (keyed.done) return keyed;
    const count = keyed.count + 1;
    let trips = false;
    if (keyed.trigger === 'counter') trips = count >= keyed.every;
    else if (keyed.trigger === 'random') trips = rollDie(10, rng) <= keyed.chance;
    else trips = scene >= keyed.at && rollDie(10, rng) <= keyed.chance;
    if (!trips) return { ...keyed, count };
    fired.push(keyed);
    return { ...keyed, count: 0, done: !keyed.repeat };
  });
  return { scenes: next, fired };
}

/** The event came about by itself: start counting again (a repeating scene) or retire it. */
export function happenedByItself(scenes: KeyedScene[], id: string): KeyedScene[] {
  return scenes.map((keyed) => (keyed.id === id ? { ...keyed, count: 0, done: !keyed.repeat } : keyed));
}

export interface KeyedTemplate {
  id: string;
  trigger: Trigger;
  every?: number;
  chance?: number;
  at?: number;
  repeat: boolean;
}

/** Starting points; the title comes from the locale (`solo.adventure.templates.<id>`). */
export const KEYED_TEMPLATES: KeyedTemplate[] = [
  { id: 'wanderers', trigger: 'counter', every: 4, repeat: true },
  { id: 'trap', trigger: 'random', chance: 1, repeat: true },
  { id: 'boss', trigger: 'milestone', at: 15, chance: 3, repeat: false },
  { id: 'calm', trigger: 'counter', every: 3, repeat: false },
];

/** Fractions of the party's strength one hero brings to a module written for a larger group. */
export const DIMINISHERS = [1, 0.75, 0.5, 0.33, 0.25] as const;

/** How many of the module's enemies to field for one hero; never fewer than one. */
export function enemiesFor(count: number, diminisher: number): number {
  return Math.max(1, Math.round(Math.max(0, count) * diminisher));
}

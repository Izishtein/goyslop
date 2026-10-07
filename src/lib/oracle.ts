import type { Rng } from './encounter';

/*
 * The solo oracle. Sword World has no solo rules of its own, so this is a small system of our
 * own devising: the mechanics are the common idea of "a likelihood, a world-disorder counter,
 * a percentile roll" and every number and every word below is original. It lives behind this
 * one module on purpose — swapping the system means replacing this file and its table ids.
 */

export const CHAOS_MIN = 1;
export const CHAOS_MAX = 9;
export const CHAOS_START = 5;

export const LIKELIHOODS = ['impossible', 'veryUnlikely', 'unlikely', 'even', 'likely', 'veryLikely', 'certain'] as const;
export type Likelihood = (typeof LIKELIHOODS)[number];

/** Chance of "yes", in percent, at neutral chaos. */
const BASE_CHANCE: Record<Likelihood, number> = {
  impossible: 3,
  veryUnlikely: 15,
  unlikely: 30,
  even: 50,
  likely: 70,
  veryLikely: 85,
  certain: 97,
};

export const CHANCE_FLOOR = 3;
export const CHANCE_CEILING = 97;

export function clampChaos(chaos: number): number {
  return Math.min(CHAOS_MAX, Math.max(CHAOS_MIN, Math.round(chaos)));
}

/** Each step of chaos away from the start moves the chance by 5 points: a wilder world says yes more. */
export function yesChance(likelihood: Likelihood, chaos: number): number {
  const shifted = BASE_CHANCE[likelihood] + (clampChaos(chaos) - CHAOS_START) * 5;
  return Math.min(CHANCE_CEILING, Math.max(CHANCE_FLOOR, shifted));
}

/** Chance (percent) that an event interrupts the answer: 3 points per step of chaos. */
export function eventChance(chaos: number): number {
  return clampChaos(chaos) * 3;
}

export function rollPercent(rng: Rng = Math.random): number {
  return 1 + Math.floor(rng() * 100);
}

export function rollDie(sides: number, rng: Rng = Math.random): number {
  return 1 + Math.floor(rng() * sides);
}

export type Answer = 'exceptionalYes' | 'yes' | 'no' | 'exceptionalNo';

export function answerFor(roll: number, chance: number): Answer {
  if (roll <= chance) return roll <= Math.floor(chance / 5) ? 'exceptionalYes' : 'yes';
  return roll > 100 - Math.floor((100 - chance) / 5) ? 'exceptionalNo' : 'no';
}

export interface RandomEvent {
  focus: number;
  action: number;
  subject: number;
}

export const FOCUS_COUNT = 10;
export const WORD_COUNT = 20;

/** A prompt for the player's imagination: what it is about (focus), and two words to hang a story on. */
export function rollEvent(rng: Rng = Math.random): RandomEvent {
  return { focus: rollDie(FOCUS_COUNT, rng), action: rollDie(WORD_COUNT, rng), subject: rollDie(WORD_COUNT, rng) };
}

export interface OracleAnswer {
  kind: 'question';
  likelihood: Likelihood;
  chaos: number;
  chance: number;
  roll: number;
  answer: Answer;
  /** Filled when the event die came up: the answer stands, but something else happens too. */
  event: RandomEvent | null;
}

export function askOracle(likelihood: Likelihood, chaos: number, rng: Rng = Math.random): OracleAnswer {
  const chance = yesChance(likelihood, chaos);
  const roll = rollPercent(rng);
  const eventRoll = rollPercent(rng);
  return {
    kind: 'question',
    likelihood,
    chaos: clampChaos(chaos),
    chance,
    roll,
    answer: answerFor(roll, chance),
    event: eventRoll <= eventChance(chaos) ? rollEvent(rng) : null,
  };
}

export type SceneTwist = 'expected' | 'altered' | 'interrupted';

export interface SceneCheck {
  kind: 'scene';
  scene: number;
  chaos: number;
  roll: number;
  twist: SceneTwist;
  event: RandomEvent | null;
}

/** d10 against half the chaos (rounded up): above it the scene goes as planned; at or below, odd bends it, even breaks in. */
export function sceneTwist(roll: number, chaos: number): SceneTwist {
  if (roll > Math.ceil(clampChaos(chaos) / 2)) return 'expected';
  return roll % 2 === 1 ? 'altered' : 'interrupted';
}

export function checkScene(scene: number, chaos: number, rng: Rng = Math.random): SceneCheck {
  const roll = rollDie(10, rng);
  const twist = sceneTwist(roll, chaos);
  return { kind: 'scene', scene, chaos: clampChaos(chaos), roll, twist, event: twist === 'interrupted' ? rollEvent(rng) : null };
}

export interface EventEntry {
  kind: 'event';
  event: RandomEvent;
}

export type OracleEntry = (OracleAnswer | SceneCheck | EventEntry) & { id: string };

export interface OracleState {
  chaos: number;
  scene: number;
  log: OracleEntry[];
}

export const EMPTY_ORACLE: OracleState = { chaos: CHAOS_START, scene: 0, log: [] };

/** The log is trimmed so the browser's storage quota is never the oracle's problem. */
export const LOG_LIMIT = 50;

export function pushEntry(state: OracleState, entry: OracleEntry): OracleState {
  return { ...state, log: [entry, ...state.log].slice(0, LOG_LIMIT) };
}

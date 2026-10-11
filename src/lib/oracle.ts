import type { Rng } from './encounter';
import type { EntryKind } from './campaign';

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

/** A journal entry the event points at; the title is copied so the log still reads after the entry is deleted. */
export interface EventRef {
  kind: EntryKind;
  title: string;
}

export interface RandomEvent {
  focus: number;
  action: number;
  subject: number;
  ref?: EventRef | null;
}

export const FOCUS_COUNT = 11;
/** "The current situation develops": the fallback focus when the journal has nobody to point at. */
export const FOCUS_SITUATION = 11;
export const WORD_COUNT = 20;

/** Foci that name someone from the campaign journal. */
export const FOCUS_SOURCE: Partial<Record<number, EntryKind>> = { 2: 'npc', 3: 'threat', 4: 'threat', 5: 'thread', 6: 'thread' };

/** What the oracle needs to know about a journal entry. */
export interface JournalEntry {
  id: string;
  kind: EntryKind;
  title: string;
  closed: boolean;
  weight: number;
}

export interface EventOptions {
  /** The campaign journal: events draw their subject from it. */
  journal?: JournalEntry[];
  /** A focus the player chose instead of rolling for it (1–FOCUS_COUNT). */
  focus?: number | null;
}

/** Weighted draw among the entries of one kind that are still in play; nothing to draw from gives null. */
export function pickFromJournal(journal: JournalEntry[], kind: EntryKind, rng: Rng = Math.random): JournalEntry | null {
  const pool = journal.filter((entry) => entry.kind === kind && !entry.closed);
  const total = pool.reduce((sum, entry) => sum + Math.max(1, entry.weight), 0);
  if (total === 0) return null;
  let point = Math.floor(rng() * total);
  for (const entry of pool) {
    point -= Math.max(1, entry.weight);
    if (point < 0) return entry;
  }
  return pool[pool.length - 1];
}

/**
 * A prompt for the player's imagination: what it is about (focus), and two words to hang a story on.
 * A focus about someone known draws them from the journal, likelier the more they have been in play;
 * with nobody to draw, the event becomes "the current situation".
 */
export function rollEvent(rng: Rng = Math.random, options: EventOptions = {}): RandomEvent {
  const rolled = rollDie(FOCUS_COUNT, rng);
  const action = rollDie(WORD_COUNT, rng);
  const subject = rollDie(WORD_COUNT, rng);
  let focus = options.focus && options.focus >= 1 && options.focus <= FOCUS_COUNT ? options.focus : rolled;
  const source = FOCUS_SOURCE[focus];
  if (!source) return { focus, action, subject };
  const picked = options.journal ? pickFromJournal(options.journal, source, rng) : null;
  if (!picked) focus = FOCUS_SITUATION;
  return { focus, action, subject, ref: picked ? { kind: picked.kind, title: picked.title } : null };
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

export function askOracle(likelihood: Likelihood, chaos: number, rng: Rng = Math.random, options: EventOptions = {}): OracleAnswer {
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
    event: eventRoll <= eventChance(chaos) ? rollEvent(rng, options) : null,
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

export function checkScene(scene: number, chaos: number, rng: Rng = Math.random, options: EventOptions = {}): SceneCheck {
  const roll = rollDie(10, rng);
  const twist = sceneTwist(roll, chaos);
  return { kind: 'scene', scene, chaos: clampChaos(chaos), roll, twist, event: twist === 'interrupted' ? rollEvent(rng, options) : null };
}

/** For a player who is stuck: the scene is interrupted at once, with no chaos check (roll 0 = not rolled). */
export function interruptScene(scene: number, chaos: number, rng: Rng = Math.random, options: EventOptions = {}): SceneCheck {
  return { kind: 'scene', scene, chaos: clampChaos(chaos), roll: 0, twist: 'interrupted', event: rollEvent(rng, options) };
}

/**
 * How chaos moves when a scene ends.
 * normal — the hero was in control: calm begets calm (−1), otherwise crisis grows (+1);
 * mean   — the other way round, so chaos is pushed back toward the middle (fewer extremes);
 * random — a d10 decides: at or under the chaos it falls, over it it rises; no judging of the scene needed.
 */
export const CHAOS_MODES = ['normal', 'mean', 'random'] as const;
export type ChaosMode = (typeof CHAOS_MODES)[number];

export function chaosAfterScene(mode: ChaosMode, chaos: number, controlled: boolean, rng: Rng = Math.random): number {
  const current = clampChaos(chaos);
  let step: number;
  if (mode === 'random') step = rollDie(10, rng) <= current ? -1 : 1;
  else if (mode === 'mean') step = controlled ? 1 : -1;
  else step = controlled ? -1 : 1;
  return clampChaos(current + step);
}

export interface EventEntry {
  kind: 'event';
  event: RandomEvent;
}

/** Written when a scene is closed: how the chaos moved. */
export interface SceneEnd {
  kind: 'sceneEnd';
  scene: number;
  from: number;
  to: number;
  /** Null in random mode, where the scene is not judged. */
  controlled: boolean | null;
}

export type OracleEntry = (OracleAnswer | SceneCheck | EventEntry | SceneEnd) & { id: string };

export interface OracleState {
  chaos: number;
  scene: number;
  chaosMode: ChaosMode;
  log: OracleEntry[];
}

export const EMPTY_ORACLE: OracleState = { chaos: CHAOS_START, scene: 0, chaosMode: 'normal', log: [] };

/** Every fifth scene the player may pick the event's focus instead of rolling — a way out of a rut. */
export const CHOOSE_FOCUS_EVERY = 5;

/** The log is trimmed so the browser's storage quota is never the oracle's problem. */
export const LOG_LIMIT = 50;

export function pushEntry(state: OracleState, entry: OracleEntry): OracleState {
  return { ...state, log: [entry, ...state.log].slice(0, LOG_LIMIT) };
}

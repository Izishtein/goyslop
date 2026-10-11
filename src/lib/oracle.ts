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

/**
 * How much chaos matters. full — the base rule; mild — a softer pull (the world is steadier);
 * none — chaos does not move the answers at all (the event chance stays fixed).
 */
export const CHAOS_FLAVORS = ['full', 'mild', 'none'] as const;
export type ChaosFlavor = (typeof CHAOS_FLAVORS)[number];

/** Points of "yes" chance per step of chaos away from the start, and points of event chance per step of chaos. */
const YES_STEP: Record<ChaosFlavor, number> = { full: 5, mild: 3, none: 0 };
const EVENT_STEP: Record<ChaosFlavor, number> = { full: 3, mild: 2, none: 0 };
/** With no chaos effect the event chance stays where full chaos puts it at the start. */
const FIXED_EVENT_CHANCE = CHAOS_START * EVENT_STEP.full;

/** Each step of chaos away from the start moves the chance by 5 points (3 mild, 0 none): a wilder world says yes more. */
export function yesChance(likelihood: Likelihood, chaos: number, flavor: ChaosFlavor = 'full'): number {
  const shifted = BASE_CHANCE[likelihood] + (clampChaos(chaos) - CHAOS_START) * YES_STEP[flavor];
  return Math.min(CHANCE_CEILING, Math.max(CHANCE_FLOOR, shifted));
}

/** Chance (percent) that an event interrupts the answer: 3 points per step of chaos (2 mild, fixed 15 with none). */
export function eventChance(chaos: number, flavor: ChaosFlavor = 'full'): number {
  return flavor === 'none' ? FIXED_EVENT_CHANCE : clampChaos(chaos) * EVENT_STEP[flavor];
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
  /** The adventure feature a "feature" event points at. */
  note?: string | null;
}

export const FOCUS_COUNT = 11;
/** "The current situation develops": the fallback focus when the journal has nobody to point at. */
export const FOCUS_SITUATION = 11;
/** Prepared adventures only: the event points at one of the adventure's own features. */
export const FOCUS_FEATURE = 12;
export const FOCUS_MAX = 12;
/** The shorter table of a prepared adventure: its feature, a known character, a threat, luck, loss, the situation. */
export const PREPARED_FOCI = [FOCUS_FEATURE, 2, 3, 7, 8, FOCUS_SITUATION];
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
  /** A focus the player chose instead of rolling for it (1–FOCUS_COUNT, or FOCUS_FEATURE in a prepared adventure). */
  focus?: number | null;
  /** A prepared adventure: the shorter focus table, and no altered or interrupted scenes. */
  prepared?: boolean;
  /** The adventure's own features, for the "feature" focus. */
  features?: string[];
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
  const rolled = options.prepared ? PREPARED_FOCI[rollDie(PREPARED_FOCI.length, rng) - 1] : rollDie(FOCUS_COUNT, rng);
  const action = rollDie(WORD_COUNT, rng);
  const subject = rollDie(WORD_COUNT, rng);
  const chosen = options.focus ?? 0;
  const allowed = (chosen >= 1 && chosen <= FOCUS_COUNT) || (chosen === FOCUS_FEATURE && !!options.prepared);
  let focus = allowed ? chosen : rolled;
  if (focus === FOCUS_FEATURE) {
    const features = options.features ?? [];
    if (features.length === 0) return { focus: FOCUS_SITUATION, action, subject };
    return { focus, action, subject, note: features[Math.floor(rng() * features.length)] };
  }
  const source = FOCUS_SOURCE[focus];
  if (!source) return { focus, action, subject };
  const picked = options.journal ? pickFromJournal(options.journal, source, rng) : null;
  if (!picked) focus = FOCUS_SITUATION;
  return { focus, action, subject, ref: picked ? { kind: picked.kind, title: picked.title } : null };
}

/** The six edits an altered scene can take: someone, something being done, something at hand — gone or added. */
export const ADJUSTMENT_COUNT = 6;

export interface SceneAdjustment {
  /** The d10 roll: 1–6 one edit, 7–10 two edits. */
  roll: number;
  /** Edit numbers 1–6: 1 remove a character, 2 add one, 3 weaken an activity, 4 strengthen it, 5 remove an object, 6 add one. */
  edits: number[];
}

/** d10: 1–6 is one edit (the die itself names it); 7–10 is two different ones, drawn on separate dice. */
export function rollAdjustment(rng: Rng = Math.random): SceneAdjustment {
  const roll = rollDie(10, rng);
  if (roll <= ADJUSTMENT_COUNT) return { roll, edits: [roll] };
  const first = rollDie(ADJUSTMENT_COUNT, rng);
  let second = rollDie(ADJUSTMENT_COUNT, rng);
  while (second === first) second = rollDie(ADJUSTMENT_COUNT, rng);
  return { roll, edits: [first, second] };
}

/**
 * Play style: which ways of closing a scene to suggest. A simulation follows what is interesting
 * and what time and place demand; a drama follows the plot and the mood.
 */
export const PLAY_STYLES = ['simulation', 'drama'] as const;
export type PlayStyle = (typeof PLAY_STYLES)[number];

export const STRATEGIES: Record<PlayStyle, string[]> = {
  simulation: ['interest', 'timePlace', 'autoInterrupt'],
  drama: ['plotShift', 'mood', 'autoInterrupt'],
};

/** Words that join two prompt words when the pair says nothing by itself. */
export const CONNECTOR_COUNT = 6;

export interface WordsEntry {
  kind: 'words';
  action: number;
  subject: number;
  connector: number;
}

/** "Dig deeper": another pair of words and a connector, for an event that is still unclear. */
export function rollWords(rng: Rng = Math.random): Omit<WordsEntry, 'kind'> {
  return { action: rollDie(WORD_COUNT, rng), subject: rollDie(WORD_COUNT, rng), connector: rollDie(CONNECTOR_COUNT, rng) };
}

/** Themed word tables: two lists of twenty (a quality or happening, and a thing it touches) per theme. */
export const THEMES = ['character', 'place', 'creature', 'magic', 'world'] as const;
export type Theme = (typeof THEMES)[number];
export const THEME_WORDS = 20;

export interface ThemedEntry {
  kind: 'themed';
  theme: Theme;
  a: number;
  b: number;
}

export function rollThemed(theme: Theme, rng: Rng = Math.random): Omit<ThemedEntry, 'kind'> {
  return { theme, a: rollDie(THEME_WORDS, rng), b: rollDie(THEME_WORDS, rng) };
}

/** The four questions that open an adventure: who, what, where and why, each answered by a themed pair of words. */
export const OPENING_THEMES: Theme[] = ['character', 'world', 'place', 'character'];

export interface OpeningEntry {
  kind: 'opening';
  /** In the order of OPENING_THEMES: who, what, where, why. */
  parts: Array<{ theme: Theme; a: number; b: number }>;
}

export function rollOpening(rng: Rng = Math.random): Omit<OpeningEntry, 'kind'> {
  return { parts: OPENING_THEMES.map((theme) => rollThemed(theme, rng)) };
}

/** The very first scene: it simply begins — no chaos check, nothing bends it (roll 0 = not rolled). */
export function openingScene(chaos: number): SceneCheck {
  return { kind: 'scene', scene: 1, chaos: clampChaos(chaos), roll: 0, twist: 'expected', event: null, adjustment: null };
}

export interface AskOptions extends EventOptions {
  /** Using the oracle to stand in for a missing rule: neutral chaos, no exceptional answers, no events. */
  asRule?: boolean;
  /** How strongly chaos bends the answer (default: fully). */
  flavor?: ChaosFlavor;
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
  /** Asked as a rule substitute: chaos 5, plain yes/no, no event. */
  asRule?: boolean;
}

export function askOracle(likelihood: Likelihood, chaos: number, rng: Rng = Math.random, options: AskOptions = {}): OracleAnswer {
  const used = options.asRule ? CHAOS_START : chaos;
  const flavor = options.flavor ?? 'full';
  const chance = yesChance(likelihood, used, flavor);
  const roll = rollPercent(rng);
  const eventRoll = rollPercent(rng);
  let answer = answerFor(roll, chance);
  if (options.asRule) answer = answer === 'exceptionalYes' ? 'yes' : answer === 'exceptionalNo' ? 'no' : answer;
  return {
    kind: 'question',
    likelihood,
    chaos: clampChaos(used),
    chance,
    roll,
    answer,
    event: !options.asRule && eventRoll <= eventChance(used, flavor) ? rollEvent(rng, options) : null,
    ...(options.asRule ? { asRule: true } : {}),
  };
}

/** "bonusEvent": a prepared adventure's scene is never bent, but the check still brings an extra event. */
export type SceneTwist = 'expected' | 'altered' | 'interrupted' | 'bonusEvent';

export interface SceneCheck {
  kind: 'scene';
  scene: number;
  chaos: number;
  roll: number;
  twist: SceneTwist;
  event: RandomEvent | null;
  /** An altered scene comes with its edit. */
  adjustment?: SceneAdjustment | null;
}

/** d10 against half the chaos (rounded up): above it the scene goes as planned; at or below, odd bends it, even breaks in. */
export function sceneTwist(roll: number, chaos: number, prepared = false): SceneTwist {
  if (roll > Math.ceil(clampChaos(chaos) / 2)) return 'expected';
  if (prepared) return 'bonusEvent';
  return roll % 2 === 1 ? 'altered' : 'interrupted';
}

export function checkScene(scene: number, chaos: number, rng: Rng = Math.random, options: EventOptions = {}): SceneCheck {
  const roll = rollDie(10, rng);
  const twist = sceneTwist(roll, chaos, options.prepared);
  return {
    kind: 'scene',
    scene,
    chaos: clampChaos(chaos),
    roll,
    twist,
    event: twist === 'interrupted' || twist === 'bonusEvent' ? rollEvent(rng, options) : null,
    adjustment: twist === 'altered' ? rollAdjustment(rng) : null,
  };
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

export interface AdjustmentEntry extends SceneAdjustment {
  kind: 'adjustment';
}

/** A discovery check on a thread's progress track (see lib/thread.ts). */
export interface DiscoveryEntry {
  kind: 'discovery';
  title: string;
  chaos: number;
  chance: number;
  roll: number;
  answer: Answer;
  deadEnd: boolean;
  finds: Array<{ d10: number; total: number; result: 'progress' | 'flashpoint' | 'track' | 'strengthen'; points: number }>;
  event: RandomEvent | null;
}

/** Keyed scenes that fired as a new scene began. */
export interface KeyedEntry {
  kind: 'keyed';
  scene: number;
  titles: string[];
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

export type OracleEntry = (OracleAnswer | SceneCheck | EventEntry | SceneEnd | AdjustmentEntry | WordsEntry | DiscoveryEntry | KeyedEntry | ThemedEntry | OpeningEntry) & { id: string };

export interface OracleState {
  chaos: number;
  scene: number;
  chaosMode: ChaosMode;
  chaosFlavor: ChaosFlavor;
  style: PlayStyle;
  /** Questions are answered as a rule substitute (neutral chaos, no exceptional answers, no events). */
  ruleMode: boolean;
  log: OracleEntry[];
}

export const EMPTY_ORACLE: OracleState = { chaos: CHAOS_START, scene: 0, chaosMode: 'normal', chaosFlavor: 'full', style: 'simulation', ruleMode: false, log: [] };

/** Every fifth scene the player may pick the event's focus instead of rolling — a way out of a rut. */
export const CHOOSE_FOCUS_EVERY = 5;

/** The log is trimmed so the browser's storage quota is never the oracle's problem. */
export const LOG_LIMIT = 50;

export function pushEntry(state: OracleState, entry: OracleEntry): OracleState {
  return { ...state, log: [entry, ...state.log].slice(0, LOG_LIMIT) };
}

/** An entry before it gets its id (Omit does not distribute over the union, this does). */
export type NewOracleEntry = OracleEntry extends infer E ? (E extends unknown ? Omit<E, 'id'> : never) : never;

import type { CampaignEntry } from './campaign';
import type { Rng } from './encounter';
import { askOracle, rollDie, type EventOptions, type OracleAnswer } from './oracle';

/*
 * The thread progress track: a thread of the campaign log may be given a track of 10, 15 or 20
 * points. Steps toward the goal fill it; the thread cannot be settled until the track is full
 * ("plot armor"), and every five points a dramatic turn (a flashpoint) is owed. Stuck players ask
 * a discovery question. The tables and thresholds are our own.
 */

export const TRACK_SIZES = [0, 10, 15, 20] as const;
export const PHASE_LENGTH = 5;
export const STEP_POINTS = 2;

export type ThreadState = Pick<CampaignEntry, 'trackSize' | 'progress' | 'flashpoints'>;

export const hasTrack = (entry: Pick<CampaignEntry, 'kind' | 'trackSize'>): boolean => entry.kind === 'thread' && entry.trackSize > 0;

/** Plot armor: a thread with a track cannot be settled while the track is not full. */
export const plotArmor = (entry: ThreadState): boolean => entry.trackSize > 0 && entry.progress < entry.trackSize;

export const phaseOf = (progress: number): number => Math.floor(progress / PHASE_LENGTH);

/** The earliest finished five-point phase in which no flashpoint has happened yet, or null. */
export function owedPhase(entry: ThreadState): number | null {
  if (entry.trackSize === 0) return null;
  const finished = Math.min(phaseOf(entry.progress), entry.trackSize / PHASE_LENGTH);
  for (let phase = 0; phase < finished; phase += 1) {
    if (!(entry.flashpoints & (1 << phase))) return phase;
  }
  return null;
}

export const flashpointDue = (entry: ThreadState): boolean => owedPhase(entry) !== null;

const clampProgress = (entry: ThreadState, progress: number): number => Math.min(entry.trackSize, Math.max(0, progress));

/** Plain progress: a step toward the goal. */
export function addProgress<T extends ThreadState>(entry: T, points: number): T {
  return { ...entry, progress: clampProgress(entry, entry.progress + points) };
}

/** A flashpoint: progress too, and it ticks off the phase it settles — the owed one first, else the current one. */
export function addFlashpoint<T extends ThreadState>(entry: T, points: number): T {
  const phase = owedPhase(entry) ?? phaseOf(entry.progress);
  return { ...entry, progress: clampProgress(entry, entry.progress + points), flashpoints: entry.flashpoints | (1 << phase) };
}

export type DiscoveryKind = 'progress' | 'flashpoint' | 'track' | 'strengthen';

export interface DiscoveryResult {
  kind: DiscoveryKind;
  points: number;
}

/** d10 plus the points already earned: the further along, the bigger and rarer the finds. */
export function discoveryOutcome(total: number): DiscoveryResult {
  if (total <= 8) return { kind: 'progress', points: 2 };
  if (total <= 11) return { kind: 'track', points: 1 };
  if (total <= 14) return { kind: 'flashpoint', points: 2 };
  if (total <= 17) return { kind: 'progress', points: 3 };
  if (total <= 20) return { kind: 'flashpoint', points: 3 };
  if (total <= 24) return { kind: 'track', points: 2 };
  return { kind: 'strengthen', points: 2 };
}

export interface DiscoveryRoll {
  /** One roll on the table per point of luck: two on an exceptional yes. */
  finds: Array<{ d10: number; total: number; result: DiscoveryResult }>;
}

export interface DiscoveryCheck {
  question: OracleAnswer;
  /** An exceptional no ends the searching for this scene. */
  deadEnd: boolean;
  finds: DiscoveryRoll['finds'];
}

/**
 * "Is something discovered?" — asked at even odds (never worse than fifty-fifty, however weak the
 * effort), with the table rolled for a yes, twice for an exceptional yes.
 */
export function discoveryCheck(
  entry: ThreadState,
  chaos: number,
  rng: Rng = Math.random,
  options: EventOptions = {},
): DiscoveryCheck {
  const question = askOracle('even', chaos, rng, options);
  const rolls = question.answer === 'exceptionalYes' ? 2 : question.answer === 'yes' ? 1 : 0;
  const finds = Array.from({ length: rolls }, () => {
    const d10 = rollDie(10, rng);
    const total = d10 + entry.progress;
    return { d10, total, result: discoveryOutcome(total) };
  });
  return { question, deadEnd: question.answer === 'exceptionalNo', finds };
}

/** Applies every find of a discovery to the thread; flashpoints tick off their phase. */
export function applyDiscovery<T extends ThreadState>(entry: T, check: DiscoveryCheck): T {
  return check.finds.reduce(
    (current, { result }) => (result.kind === 'flashpoint' ? addFlashpoint(current, result.points) : addProgress(current, result.points)),
    entry,
  );
}

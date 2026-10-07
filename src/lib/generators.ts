import type { Rng } from './encounter';

/*
 * Small generators for the people and places of a solo campaign: an NPC, a tavern, a settlement.
 * They only draw numbers; every word those numbers stand for lives in the i18n tables
 * (solo.gen.*), so each list below is a count, not text. All the tables are our own.
 */

export const GEN_COUNTS = {
  namePart: 12,
  nameMiddle: 6,
  occupation: 20,
  trait: 12,
  want: 12,
  secret: 12,
  tavernAdjective: 12,
  tavernNoun: 12,
  specialty: 12,
  rumor: 12,
  patron: 12,
  knownFor: 12,
  trouble: 12,
} as const;

const roll = (sides: number, rng: Rng): number => 1 + Math.floor(rng() * sides);

export interface GeneratedName {
  start: number;
  /** A third syllable in one name out of three. */
  middle: number | null;
  end: number;
}

export function rollName(rng: Rng = Math.random): GeneratedName {
  return {
    start: roll(GEN_COUNTS.namePart, rng),
    middle: roll(3, rng) === 1 ? roll(GEN_COUNTS.nameMiddle, rng) : null,
    end: roll(GEN_COUNTS.namePart, rng),
  };
}

export interface GeneratedNpc {
  name: GeneratedName;
  occupation: number;
  trait: number;
  want: number;
  secret: number;
}

export function rollNpc(rng: Rng = Math.random): GeneratedNpc {
  return {
    name: rollName(rng),
    occupation: roll(GEN_COUNTS.occupation, rng),
    trait: roll(GEN_COUNTS.trait, rng),
    want: roll(GEN_COUNTS.want, rng),
    secret: roll(GEN_COUNTS.secret, rng),
  };
}

export interface GeneratedTavern {
  adjective: number;
  noun: number;
  specialty: number;
  rumor: number;
  patron: number;
  keeper: GeneratedName;
}

export function rollTavern(rng: Rng = Math.random): GeneratedTavern {
  return {
    adjective: roll(GEN_COUNTS.tavernAdjective, rng),
    noun: roll(GEN_COUNTS.tavernNoun, rng),
    specialty: roll(GEN_COUNTS.specialty, rng),
    rumor: roll(GEN_COUNTS.rumor, rng),
    patron: roll(GEN_COUNTS.patron, rng),
    keeper: rollName(rng),
  };
}

export interface GeneratedSettlement {
  name: GeneratedName;
  knownFor: number;
  trouble: number;
  /** The one person worth meeting. */
  notable: GeneratedNpc;
  tavern: GeneratedTavern;
}

export function rollSettlement(rng: Rng = Math.random): GeneratedSettlement {
  return {
    name: rollName(rng),
    knownFor: roll(GEN_COUNTS.knownFor, rng),
    trouble: roll(GEN_COUNTS.trouble, rng),
    notable: rollNpc(rng),
    tavern: rollTavern(rng),
  };
}

/** Joins a name's syllables (looked up by the caller in its own language) into one capitalised word. */
export function joinName(parts: { start: string; middle: string | null; end: string }): string {
  const word = `${parts.start}${parts.middle ?? ''}${parts.end}`.toLowerCase();
  return word.charAt(0).toUpperCase() + word.slice(1);
}

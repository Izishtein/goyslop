import type { AbilityId } from '../lib/formulas/abilities';

/** Racial correction die: roll `count`d6 and add `bonus` (negative for a flat penalty, as with
 *  the Rare Tabbit Species' post-roll ability score adjustments, Arcane Relic pp. 36-37). */
export interface AbilityDice {
  count: number;
  bonus: number;
}

export type AbilityDiceByAbility = Record<AbilityId, AbilityDice>;

export interface StartingClasses {
  classIds: string[];
  /** How multiple classIds combine: both granted ("and") or a choice between them ("or"). */
  joiner: 'and' | 'or';
}

export interface BackgroundEntry {
  /** 2d6 roll range this background occupies, e.g. "2-4", "9-10", or "*" for GM-permission-only rows. */
  rollRange: string;
  name: string;
  /** null for backgrounds that grant no starting class ("None" in the source tables). */
  startingClasses: StartingClasses | null;
  /** [Skill, Body, Mind] base split. null when the row rolls its own dice instead of a fixed split (e.g. Human "Adventurer"). */
  stats: [number, number, number] | null;
  xp: number;
}

export interface RaceDefinition {
  id: string;
  name: string;
  sourceBook: string;
  /** null when the book gives no standard A-F correction dice for this race. */
  abilityDice: AbilityDiceByAbility | null;
  restrictedClasses: string[];
  /** null when no background table is available (Vagrant-system or missing-sourcebook races).
   *  `supplemental` is Battle Mastery pp. 13-14's "Additional Background Tables" — a third,
   *  later table (one per race that existed by that book's release) opening access to the
   *  classes added since Core Rulebooks I-III: Warlock, Geomancer, Alchemist, Battle Dancer,
   *  Rider, Tactician, Druid. Not every race gets every one of those seven rows. */
  backgroundTables: { primary: BackgroundEntry[]; additional?: BackgroundEntry[]; supplemental?: BackgroundEntry[] } | null;
  /** True for Outlaw Profile Book races, which use the separate Vagrant creation system. */
  usesVagrantSystem?: boolean;
}

function dice(A: string, B: string, C: string, D: string, E: string, F: string): AbilityDiceByAbility {
  const parse = (notation: string): AbilityDice => {
    const match = notation.match(/^(\d+)d(?:([+-]\d+))?$/);
    if (!match) throw new Error(`Invalid dice notation: ${notation}`);
    return { count: Number(match[1]), bonus: Number(match[2] ?? 0) };
  };
  return { DEX: parse(A), AGI: parse(B), STR: parse(C), VIT: parse(D), INT: parse(E), SPR: parse(F) };
}

function bg(
  rollRange: string,
  name: string,
  startingClasses: string[] | null,
  stats: [number, number, number] | null,
  xp: number,
  joiner: 'and' | 'or' = 'and',
): BackgroundEntry {
  return {
    rollRange,
    name,
    startingClasses: startingClasses ? { classIds: startingClasses, joiner } : null,
    stats,
    xp,
  };
}

export const RACES: RaceDefinition[] = [
  {
    id: 'human',
    name: 'Human',
    sourceBook: 'Core Rulebook I',
    abilityDice: dice('2d', '2d', '2d', '2d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Artificer', ['artificer'], [8, 4, 9], 2000),
        bg('5', 'Sorcerer', ['sorcerer'], [6, 5, 10], 2000),
        bg('6', 'Agile Warrior', ['scout', 'fencer'], [10, 7, 4], 2000),
        bg('7', 'Normal', null, [7, 7, 7], 3000),
        bg('8', 'Mercenary', ['fighter', 'grappler'], [7, 10, 4], 2000, 'or'),
        bg('9-10', 'Cleric', ['priest'], [4, 8, 9], 2000),
        bg('11-12', 'Conjurer', ['conjurer'], [7, 4, 10], 2000),
        bg('*', 'Adventurer', null, null, 3000),
      ],
      additional: [
        bg('2-4', 'Archer', ['marksman'], [9, 5, 7], 2500),
        bg('5', 'Swordsman', ['fencer'], [9, 6, 6], 2500),
        bg('6', 'Brawler', ['grappler'], [8, 8, 5], 2000),
        bg('7', 'Warrior', ['fighter'], [7, 9, 5], 2000),
        bg('8', 'Bodybuilder', ['enhancer'], [6, 8, 7], 2500),
        bg('9', 'Poet', ['bard'], [5, 7, 9], 2500),
        bg('10-12', 'Feytouched', ['fairy-tamer'], [5, 6, 10], 2000),
      ],
      // Battle Mastery pp. 13-14's "Additional Background Tables" — a third table opening
      // access to classes added since Core Rulebooks I-III (Warlock, Geomancer, Alchemist,
      // Battle Dancer, Rider, Tactician, Druid). Not every race gets every one of these
      // seven rows; Human is the only one that does.
      supplemental: [
        bg('2-4', 'Daemon Tamer', ['daemonologist'], [3, 8, 10], 2000),
        bg('5', 'Diviner', ['geomancer'], [5, 9, 7], 2500),
        bg('6', 'Alchemist', ['alchemist'], [8, 5, 8], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [10, 6, 5], 2000),
        bg('8', 'Jockey', ['rider'], [6, 8, 7], 2500),
        bg('9', 'Tactician', ['tactician'], [8, 6, 7], 2500),
        bg('10-12', 'Druid', ['druid'], [4, 7, 10], 2000),
      ],
    },
  },
  {
    id: 'elf',
    name: 'Elf',
    sourceBook: 'Core Rulebook I',
    abilityDice: dice('2d', '2d', '1d', '2d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-3', 'Sworder', ['fencer'], [12, 5, 9], 2500),
        bg('4', 'Herbalist', ['sage', 'ranger'], [10, 5, 11], 2000),
        bg('5-6', 'Cleric', ['priest'], [9, 5, 12], 2000),
        bg('7', 'Conjurer', ['conjurer'], [9, 4, 13], 2000),
        bg('8-9', 'Sorcerer', ['sorcerer'], [10, 3, 13], 2000),
        bg('10-12', 'Archer', ['marksman'], [13, 5, 8], 2500),
      ],
      additional: [
        bg('2-4', 'Bodybuilder', ['enhancer'], [11, 5, 10], 2500),
        bg('5-6', 'Scout', ['scout'], [12, 4, 10], 2500),
        bg('7', 'Feytouched', ['fairy-tamer'], [10, 2, 14], 2000),
        bg('8-9', 'Brawler', ['grappler'], [11, 4, 11], 2000),
        bg('10-12', 'Bard', ['bard'], [9, 3, 14], 2500),
      ],
      supplemental: [
        bg('2-4', 'Daemon Tamer', ['daemonologist'], [9, 4, 13], 2000),
        bg('5-6', 'Diviner', ['geomancer'], [10, 4, 12], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 5, 8], 2000),
        bg('8-9', 'Tactician', ['tactician'], [11, 4, 11], 2500),
        bg('10-12', 'Druid', ['druid'], [10, 3, 13], 2000),
      ],
    },
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    sourceBook: 'Core Rulebook I',
    abilityDice: dice('2d', '1d', '2d', '2d', '1d', '2d+6'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Archer', ['marksman'], [6, 8, 6], 2500),
        bg('5-6', 'Warrior', ['fighter'], [4, 11, 5], 2000),
        bg('7', 'Brawler', ['grappler'], [5, 10, 5], 2000),
        bg('8-9', 'Cleric', ['priest'], [4, 7, 9], 2000),
        bg('10-12', 'Artificer', ['artificer'], [6, 7, 7], 2000),
      ],
      additional: [
        bg('2-4', 'Scholar', ['sage'], [3, 8, 9], 2500),
        bg('5-6', 'Wanderer', ['ranger'], [6, 9, 5], 2500),
        bg('7', 'Bodybuilder', ['enhancer'], [5, 9, 6], 2500),
        bg('8-9', 'Bard', ['bard'], [4, 8, 8], 2500),
        bg('10-12', 'Feytouched', ['fairy-tamer'], [5, 6, 9], 2000),
      ],
      supplemental: [
        bg('2-4', 'Diviner', ['geomancer'], [6, 6, 8], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [6, 7, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [6, 10, 4], 2000),
        bg('8-9', 'Jockey', ['rider'], [5, 9, 6], 2500),
        bg('10-12', 'Tactician', ['tactician'], [5, 8, 7], 2500),
      ],
    },
  },
  {
    id: 'tabbit',
    name: 'Tabbit',
    sourceBook: 'Core Rulebook I',
    abilityDice: dice('1d', '1d', '1d', '2d', '2d+6', '2d'),
    restrictedClasses: ['priest'],
    backgroundTables: {
      primary: [
        bg('2-5', 'Conjurer', ['conjurer'], [6, 6, 10], 2000),
        bg('6-7', 'Sorcerer', ['sorcerer'], [5, 7, 10], 2000),
        bg('8-9', 'Sage', ['sage'], [5, 8, 9], 2500),
        bg('10-12', 'Artificer', ['artificer'], [8, 5, 9], 2000),
      ],
      additional: [
        bg('2-5', 'Magician', ['sorcerer', 'conjurer'], [5, 6, 11], 1000),
        bg('6-7', 'Feytouched', ['fairy-tamer'], [7, 5, 10], 2000),
        bg('8-9', 'Bard', ['bard'], [6, 7, 9], 2500),
        bg('10-12', 'Apothecary', ['ranger'], [7, 6, 9], 2500),
      ],
      supplemental: [
        bg('2-4', 'Daemon Tamer', ['daemonologist'], [5, 6, 11], 2000),
        bg('5-6', 'Geomancer', ['geomancer'], [5, 8, 9], 2500),
        bg('7', 'Druid', ['druid'], [7, 5, 10], 2000),
        bg('8-9', 'Tactician', ['tactician'], [8, 6, 8], 2500),
        bg('10-12', 'Alchemist', ['alchemist'], [7, 7, 8], 2500),
      ],
    },
  },
  {
    id: 'runefolk',
    name: 'Runefolk',
    sourceBook: 'Core Rulebook I',
    abilityDice: dice('2d', '1d', '2d', '2d', '2d', '1d'),
    restrictedClasses: ['priest'],
    backgroundTables: {
      primary: [
        bg('2-4', 'Scholar', ['sage'], [8, 10, 8], 2500),
        bg('5-6', 'Archer', ['marksman'], [12, 8, 6], 2500),
        bg('7', 'Warrior', ['fighter', 'grappler'], [9, 12, 5], 2000, 'or'),
        bg('8-9', 'Artificer', ['artificer'], [12, 8, 6], 2000),
        bg('10-12', 'Sorcerer', ['sorcerer'], [9, 8, 9], 2000),
      ],
      additional: [
        bg('2-4', 'Scout', ['scout'], [12, 6, 8], 2500),
        bg('5-6', 'Bodybuilder', ['enhancer'], [10, 8, 8], 2500),
        bg('7', 'Agile Warrior', ['fencer'], [11, 9, 6], 2500),
        bg('8-9', 'Bard', ['bard'], [8, 9, 9], 2500),
        bg('10-12', 'Conjurer', ['conjurer'], [7, 9, 10], 2000),
      ],
      supplemental: [
        bg('2-4', 'Geomancer', ['geomancer'], [10, 10, 6], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [11, 8, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [12, 9, 5], 2000),
        bg('8-9', 'Jockey', ['rider'], [9, 9, 8], 2500),
        bg('10-12', 'Tactician', ['tactician'], [10, 8, 8], 2500),
      ],
    },
  },
  {
    id: 'nightmare',
    name: 'Nightmare',
    sourceBook: 'Core Rulebook I',
    abilityDice: dice('2d', '2d', '1d', '1d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Sorcerer', ['sorcerer'], [5, 13, 12], 2000),
        bg('5-6', 'Warrior', ['fighter', 'grappler'], [7, 15, 8], 2000, 'or'),
        bg('7', 'Agile Warrior', ['fencer', 'scout'], [11, 13, 6], 2000),
        bg('8-9', 'Cleric', ['priest'], [6, 14, 10], 2000),
        bg('10-12', 'Artificer', ['artificer'], [9, 9, 12], 2000),
      ],
      additional: [
        bg('2-4', 'Bard', ['bard'], [8, 13, 9], 2500),
        bg('5-6', 'Bodybuilder', ['enhancer'], [9, 14, 7], 2500),
        bg('7', 'Archer', ['marksman'], [10, 10, 10], 2500),
        bg('8-9', 'Wanderer', ['ranger'], [9, 12, 9], 2500),
        bg('10-12', 'Conjurer', ['conjurer'], [6, 11, 13], 2000),
      ],
      supplemental: [
        bg('2-4', 'Daemon Tamer', ['daemonologist'], [7, 10, 13], 2000),
        bg('5-6', 'Jockey', ['rider'], [10, 12, 8], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [11, 12, 7], 2000),
        bg('8-9', 'Tactician', ['tactician'], [9, 13, 8], 2500),
        bg('10-12', 'Druid', ['druid'], [8, 10, 12], 2000),
      ],
    },
  },
  {
    id: 'lykant',
    name: 'Lykant',
    sourceBook: 'Core Rulebook I',
    abilityDice: dice('1d', '1d+3', '2d', '2d', '1d+6', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Scout', ['scout'], [13, 5, 7], 2500),
        bg('5-6', 'Warrior', ['fighter'], [10, 9, 6], 2000),
        bg('7', 'Brawler', ['grappler'], [11, 7, 7], 2000),
        bg('8-9', 'Agile Warrior', ['fencer'], [12, 6, 7], 2500),
        bg('10-12', 'Hunter', ['ranger'], [9, 8, 8], 2500),
      ],
      additional: [
        bg('2-4', 'Bard', ['bard'], [8, 9, 8], 2500),
        bg('5-6', 'Archer', ['marksman'], [11, 8, 6], 2500),
        bg('7', 'Bodybuilder', ['enhancer'], [10, 8, 7], 2500),
        bg('8-9', 'Scholar', ['sage'], [10, 7, 8], 2500),
        bg('10-12', 'Cleric', ['priest'], [9, 7, 9], 2000),
      ],
      supplemental: [
        bg('2-4', 'Geomancer', ['geomancer'], [10, 7, 8], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [12, 7, 6], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 6, 6], 2000),
        bg('8-9', 'Jockey', ['rider'], [10, 8, 7], 2500),
        bg('10-12', 'Tactician', ['tactician'], [9, 9, 7], 2500),
      ],
    },
  },
  {
    id: 'lildraken',
    name: 'Lildraken',
    sourceBook: 'Core Rulebook II',
    abilityDice: dice('1d', '2d', '2d', '2d+6', '1d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-3', 'Hunter', ['ranger'], [6, 12, 7], 2500),
        bg('4-5', 'Brawler', ['grappler'], [6, 13, 6], 2000),
        bg('6-8', 'Warrior', ['fighter'], [5, 14, 6], 2000),
        bg('9-10', 'Merchant', ['sage'], [5, 11, 9], 2500),
        bg('11-12', 'Priest', ['priest'], [4, 13, 8], 2000),
      ],
      additional: [
        bg('2-4', 'Archer', ['marksman'], [7, 12, 6], 2500),
        bg('5-6', 'Agile Warrior', ['fencer'], [6, 11, 8], 2500),
        bg('7', 'Bodybuilder', ['enhancer'], [5, 12, 8], 2500),
        bg('8-9', 'Magician', ['sorcerer', 'conjurer'], [4, 12, 9], 2000, 'or'),
        bg('10-12', 'Feytouched', ['fairy-tamer'], [3, 12, 10], 2000),
      ],
      supplemental: [
        bg('2-4', 'Geomancer', ['geomancer'], [4, 13, 8], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [5, 13, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [6, 14, 5], 2000),
        bg('8-9', 'Tactician', ['tactician'], [5, 12, 8], 2500),
        bg('10-12', 'Druid', ['druid'], [5, 11, 9], 2000),
      ],
    },
  },
  {
    id: 'grassrunner',
    name: 'Grassrunner',
    sourceBook: 'Core Rulebook II',
    abilityDice: dice('2d', '2d', '1d', '2d+6', '1d', '2d+6'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Thief', ['scout'], [13, 0, 12], 2500),
        bg('5-6', 'Light Warrior', ['fencer'], [14, 1, 10], 2500),
        bg('7', 'Wanderer', ['ranger'], [12, 1, 12], 2500),
        bg('8-9', 'Archer', ['marksman'], [14, 0, 11], 2500),
        bg('10-12', 'Hobbyist', ['sage', 'bard'], [12, 0, 13], 2500, 'or'),
      ],
      additional: [
        bg('2-4', 'Scholar', ['sage'], [11, 1, 13], 2500),
        bg('5-6', 'Brawler', ['grappler'], [14, 2, 9], 2000),
        bg('7', 'Traveler', null, [11, 2, 12], 3000),
        bg('8-9', 'Scout', ['fencer', 'scout'], [15, 0, 10], 2000),
        bg('10-12', 'Bard', ['bard'], [12, 0, 13], 2500),
      ],
      supplemental: [
        bg('2-4', 'Geomancer', ['geomancer'], [11, 1, 13], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [12, 1, 12], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 1, 11], 2000),
        bg('8-9', 'Jockey', ['rider'], [12, 0, 13], 2500),
        bg('10-12', 'Tactician', ['tactician'], [11, 1, 13], 2500),
      ],
    },
  },
  {
    id: 'meria',
    name: 'Meria',
    sourceBook: 'Core Rulebook II',
    abilityDice: dice('1d', '1d', '1d', '2d+6', '1d', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Wanderer', ['ranger'], [9, 8, 12], 2500),
        bg('5-6', 'Cleric', ['priest'], [8, 8, 13], 2000),
        bg('7', 'Feytouched', ['fairy-tamer'], [8, 7, 14], 2000),
        bg('8-9', 'Sorcerer', ['sorcerer'], [8, 6, 15], 2000),
        bg('10-12', 'Conjurer', ['conjurer'], [7, 6, 16], 2000),
      ],
      additional: [
        bg('2-4', 'Archer', ['marksman'], [10, 7, 12], 2500),
        bg('5-6', 'Light Warrior', ['fencer'], [10, 8, 11], 2500),
        bg('7', 'Magician', ['sorcerer', 'conjurer'], [8, 5, 16], 1000),
        bg('8-9', 'Bard', ['bard'], [7, 7, 15], 2500),
        bg('10-12', 'Bodybuilder', ['enhancer'], [9, 9, 11], 2500),
      ],
      supplemental: [
        bg('2-4', 'Daemon Tamer', ['daemonologist'], [7, 8, 14], 2000),
        bg('5-6', 'Geomancer', ['geomancer'], [8, 9, 12], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [9, 8, 12], 2000),
        bg('8-9', 'Tactician', ['tactician'], [8, 8, 13], 2500),
        bg('10-12', 'Druid', ['druid'], [7, 7, 15], 2000),
      ],
    },
  },
  {
    id: 'tiens',
    name: 'Tiens',
    sourceBook: 'Core Rulebook III',
    abilityDice: dice('2d', '2d', '1d', '1d+3', '2d', '2d+6'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Cavalier', ['rider'], [10, 11, 7], 2500),
        bg('5-6', 'Brawler', ['grappler'], [9, 13, 6], 2000),
        bg('7', 'Warrior', ['fighter'], [8, 12, 8], 2000),
        bg('8-9', 'Cleric', ['priest'], [7, 12, 9], 2000),
        bg('10-12', 'Sorcerer', ['sorcerer'], [6, 12, 10], 2000),
      ],
      additional: [
        bg('2-4', 'Archer', ['marksman'], [11, 12, 5], 2500),
        bg('5-6', 'Scout', ['scout'], [10, 10, 8], 2500),
        bg('7', 'Magic Warrior', ['fighter', 'sorcerer'], [9, 11, 8], 1000),
        bg('8-9', 'Feytouched', ['fairy-tamer'], [7, 11, 10], 2000),
        bg('10-12', 'Scholar', ['sage'], [8, 11, 9], 2500),
      ],
      supplemental: [
        bg('2-4', 'Daemon Tamer', ['daemonologist'], [7, 11, 10], 2000),
        bg('5-6', 'Geomancer', ['geomancer'], [8, 11, 9], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [10, 13, 5], 2000),
        bg('8-9', 'Tactician', ['tactician'], [9, 11, 8], 2500),
        // Book prints this row's range as "2-4" again (a duplicate of the first row) — every
        // other row in every other race's version of this table forms a clean 2-12 partition,
        // and the Skill+Body+Mind total (28) matches all four other Tiens rows exactly, so
        // "10-12" is the only range consistent with both the pattern and this race's own data.
        bg('10-12', 'Druid', ['druid'], [6, 12, 10], 2000),
      ],
    },
  },
  {
    id: 'leprechaun',
    name: 'Leprechaun',
    sourceBook: 'Core Rulebook III',
    abilityDice: dice('2d', '1d', '2d', '2d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Agile Warrior', ['fencer'], [13, 5, 5], 2500),
        bg('5-6', 'Archer', ['marksman'], [12, 6, 5], 2500),
        bg('7', 'Spy', ['scout'], [14, 4, 5], 2500),
        bg('8-9', 'Feytouched', ['fairy-tamer'], [11, 4, 8], 2000),
        bg('10-12', 'Agile Warrior', ['fencer'], [11, 5, 7], 2500),
      ],
      additional: [
        bg('2-4', 'Wanderer', ['ranger'], [12, 5, 6], 2500),
        bg('5-6', 'Hobbyist', ['sage', 'bard'], [13, 4, 6], 2000),
        bg('7', 'Artificer', ['artificer'], [12, 4, 7], 2000),
        bg('8-9', 'Cleric', ['priest'], [10, 5, 8], 2000),
        bg('10-12', 'Magician', ['sorcerer', 'conjurer'], [11, 3, 9], 2000, 'or'),
      ],
      supplemental: [
        bg('2-4', 'Daemon Tamer', ['daemonologist'], [11, 3, 9], 2000),
        bg('5-6', 'Geomancer', ['geomancer'], [10, 6, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 5, 5], 2000),
        bg('8-9', 'Alchemist', ['alchemist'], [14, 4, 5], 2500),
        bg('10-12', 'Druid', ['druid'], [12, 3, 8], 2000),
      ],
    },
  },
  // Alv/Shadow/Soleil/Weakling are Outlaw Profile Book races whose only creation path was
  // the separate Vagrant system (usesVagrantSystem stays true — it is still a valid
  // alternative). Arcane Relic pp. 26-33 republishes all four with standard PC correction
  // dice and background tables, which is where the data below comes from.
  {
    id: 'alv',
    name: 'Alv',
    sourceBook: 'Arcane Relic (republished from Outlaw Profile Book)',
    abilityDice: dice('1d', '1d+3', '2d+3', '2d', '1d+6', '1d'),
    restrictedClasses: [],
    usesVagrantSystem: true,
    backgroundTables: {
      primary: [
        bg('2-4', 'Scout', ['scout'], [12, 5, 8], 2500),
        bg('5-6', 'Agile Warrior', ['fencer'], [12, 6, 7], 2500),
        bg('7', 'Sorcerer', ['sorcerer'], [9, 5, 11], 2000),
        bg('8-9', 'Priest', ['priest'], [10, 6, 9], 2000),
        bg('10-12', 'Scholar', ['sage'], [10, 5, 10], 2500),
      ],
      additional: [
        // The book prints "Archer" mapping to Ranger here, unlike every other race's Archer
        // row (Marksman) — transcribed as printed, not normalized to the usual pattern.
        bg('2-4', 'Archer', ['ranger'], [13, 4, 8], 2500),
        bg('5-6', 'Boxer', ['grappler'], [11, 7, 7], 2000),
        bg('7', 'Conjurer', ['conjurer'], [9, 4, 12], 2000),
        bg('8-9', 'Warlock', ['daemonologist'], [9, 6, 10], 2000),
        bg('10-12', 'Artificer', ['artificer'], [9, 7, 9], 2000),
      ],
      // The four OPB races get a shorter, 3-row version of this table (Battle Mastery p. 14) —
      // only Geomancer/Battle Dancer/Tactician, not the full seven-class spread above.
      supplemental: [
        bg('2-5', 'Geomancer', ['geomancer'], [11, 6, 8], 2500),
        bg('6-8', 'Dancer', ['battle-dancer'], [13, 5, 7], 2000),
        bg('9-12', 'Tactician', ['tactician'], [10, 6, 9], 2500),
      ],
    },
  },
  {
    id: 'shadow',
    name: 'Shadow',
    sourceBook: 'Arcane Relic (republished from Outlaw Profile Book)',
    abilityDice: dice('1d', '1d', '2d', '2d', '2d', '2d'),
    restrictedClasses: [],
    usesVagrantSystem: true,
    backgroundTables: {
      primary: [
        bg('2-4', 'Hunter', ['ranger'], [15, 6, 6], 2500),
        bg('5-6', 'Sworder', ['fencer'], [17, 7, 3], 2500),
        bg('7', 'Scout', ['scout'], [16, 7, 4], 2500),
        bg('8-9', 'Boxer', ['grappler'], [14, 8, 5], 2000),
        bg('10-12', 'Warrior', ['fighter'], [15, 9, 3], 2000),
      ],
      additional: [
        bg('2-4', 'Artificer', ['artificer'], [17, 5, 5], 2000),
        bg('5-6', 'Archer', ['marksman'], [18, 6, 3], 2500),
        bg('7', 'Bodybuilder', ['enhancer'], [16, 6, 5], 2500),
        bg('8-9', 'Alchemist', ['alchemist'], [14, 8, 5], 2500),
        bg('10-12', 'Rider', ['rider'], [13, 7, 7], 2500),
      ],
      supplemental: [
        bg('2-5', 'Geomancer', ['geomancer'], [14, 6, 7], 2500),
        bg('6-8', 'Dancer', ['battle-dancer'], [17, 7, 3], 2000),
        bg('9-12', 'Tactician', ['tactician'], [15, 8, 4], 2500),
      ],
    },
  },
  {
    id: 'soleil',
    name: 'Soleil',
    sourceBook: 'Arcane Relic (republished from Outlaw Profile Book)',
    abilityDice: dice('1d', '2d', '1d+6', '2d', '1d', '2d'),
    restrictedClasses: [],
    usesVagrantSystem: true,
    backgroundTables: {
      primary: [
        bg('2-4', 'Priest', ['priest'], [9, 13, 4], 2000),
        bg('5-6', 'Agile Warrior', ['fencer'], [12, 12, 2], 2500),
        bg('7', 'Warrior', ['fighter'], [10, 15, 1], 2000),
        bg('8-9', 'Boxer', ['grappler'], [12, 14, 0], 2000),
        bg('10-12', 'Hunter', ['ranger'], [10, 13, 3], 2500),
      ],
      additional: [
        bg('2-4', 'Archer', ['marksman'], [11, 14, 1], 2500),
        bg('5-6', 'Rider', ['rider'], [11, 13, 2], 2500),
        bg('7', 'Alchemist', ['alchemist'], [10, 11, 5], 2500),
        bg('8-9', 'Hobbyist', ['bard'], [11, 11, 4], 2500),
        bg('10-12', 'Scout', ['scout'], [12, 11, 3], 2500),
      ],
      // Printed as "Soliel Background Table" (the book's own typo for this table's heading).
      supplemental: [
        bg('2-5', 'Geomancer', ['geomancer'], [10, 12, 4], 2500),
        bg('6-8', 'Dancer', ['battle-dancer'], [12, 13, 1], 2000),
        bg('9-12', 'Tactician', ['tactician'], [11, 12, 3], 2500),
      ],
    },
  },
  {
    id: 'weakling',
    name: 'Weakling',
    sourceBook: 'Arcane Relic (republished from Outlaw Profile Book)',
    abilityDice: dice('2d', '2d', '2d', '2d', '2d', '2d'),
    restrictedClasses: [],
    usesVagrantSystem: true,
    backgroundTables: {
      // Two generic tables shared by all four Weakling origins (Garuda/Tannoz/Basilisk/
      // Minotaur) — the origin only changes which racial ability and +3 score the book
      // grants, not the background table.
      primary: [
        bg('2-4', 'Scout', ['scout'], [10, 7, 6], 2500),
        bg('5-6', 'Agile Warrior', ['fencer'], [9, 8, 6], 2500),
        bg('7', 'Warrior', ['fighter'], [8, 10, 5], 2000),
        bg('8-9', 'Priest', ['priest'], [7, 9, 7], 2000),
        bg('10-12', 'Sorcerer', ['sorcerer'], [7, 8, 8], 2000),
      ],
      additional: [
        bg('2-4', 'Bodybuilder', ['enhancer'], [8, 8, 7], 2500),
        bg('5-6', 'Archer', ['marksman'], [10, 8, 5], 2500),
        bg('7', 'Boxer', ['grappler'], [9, 9, 5], 2000),
        bg('8-9', 'Druid', ['druid'], [7, 7, 9], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [7, 8, 8], 2000),
      ],
      supplemental: [
        bg('2-5', 'Geomancer', ['geomancer'], [7, 8, 8], 2500),
        bg('6-8', 'Dancer', ['battle-dancer'], [10, 8, 5], 2000),
        bg('9-12', 'Tactician', ['tactician'], [9, 7, 7], 2500),
      ],
    },
  },
  {
    id: 'abyssborn',
    name: 'Abyssborn',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '1d', '1d+6', '2d', '2d', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Hunter', ['ranger'], [8, 10, 9], 2500),
        bg('5-6', 'Scout', ['scout'], [11, 7, 9], 2500),
        bg('7', 'Mercenary', ['fighter', 'grappler'], [8, 11, 8], 2000, 'or'),
        bg('8-9', 'Magician', ['sorcerer', 'conjurer'], [6, 8, 13], 2000, 'or'),
        bg('10-12', 'Artificer', ['artificer'], [9, 9, 9], 2000),
      ],
      additional: [
        bg('2-4', 'Scholar', ['sage'], [6, 10, 11], 2500),
        bg('5-6', 'Agile Warrior', ['fencer'], [11, 6, 10], 2500),
        bg('7', 'Warrior Dancer', ['battle-dancer'], [10, 8, 9], 2000),
        bg('8-9', 'Druid', ['druid'], [7, 8, 12], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [8, 6, 13], 2000),
      ],
    },
  },
  {
    id: 'newman',
    name: 'Newman',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '1d', '2d', '1d', '1d', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Feytouched', ['fairy-tamer'], [7, 6, 14], 2000),
        bg('5-6', 'Scholar', ['sage'], [7, 5, 15], 2500),
        bg('7', 'Wizard', ['sorcerer'], [6, 7, 14], 2000),
        bg('8-9', 'Manipulator', ['conjurer'], [7, 7, 13], 2000),
        bg('10-12', 'Cleric', ['priest'], [6, 8, 13], 2000),
      ],
      additional: [
        bg('2-4', 'Tactician', ['tactician'], [9, 7, 11], 2500),
        bg('5-6', 'Geomancer', ['geomancer'], [8, 7, 12], 2500),
        bg('7', 'Druid', ['druid'], [6, 6, 15], 2000),
        bg('8-9', 'Warlock', ['daemonologist'], [8, 6, 13], 2000),
        bg('10-12', 'Minstrel', ['sage', 'bard'], [5, 7, 15], 2000, 'and'),
      ],
    },
  },
  // Spriggan, Fluorite and Dark Dwarf are first published in Arcane Relic (pp. 16-25) —
  // no prior partial entry, no Vagrant alternative.
  {
    id: 'spriggan',
    name: 'Spriggan',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('1d', '2d', '1d', '1d', '2d', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Scout', ['scout'], [11, 9, 8], 2500),
        bg('5-6', 'Agile Warrior', ['fencer'], [12, 9, 7], 2500),
        bg('7', 'Warrior', ['fighter'], [10, 12, 6], 2000),
        bg('8-9', 'Boxer', ['grappler'], [11, 12, 5], 2000),
        bg('10-12', 'Hunter', ['ranger'], [11, 11, 6], 2500),
      ],
      additional: [
        bg('2-4', 'Archer', ['marksman'], [13, 9, 6], 2500),
        bg('5-6', 'Jockey', ['rider'], [9, 11, 8], 2500),
        bg('7', 'Battle Dancer', ['battle-dancer'], [12, 10, 6], 2000),
        bg('8-9', 'Bodybuilder', ['enhancer'], [11, 10, 7], 2500),
        bg('10-12', 'Priest', ['priest'], [10, 9, 9], 2000),
      ],
    },
  },
  {
    id: 'fluorite',
    name: 'Fluorite',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '2d+6', '2d', '1d', '2d+6'),
    restrictedClasses: ['enhancer'],
    backgroundTables: {
      primary: [
        bg('2-4', 'Warrior', ['fighter'], [7, 3, 9], 2000),
        bg('5-6', 'Sorcerer', ['sorcerer'], [7, 0, 12], 2000),
        bg('7', 'Wizard', ['sorcerer', 'conjurer'], [6, 0, 13], 1000),
        bg('8-9', 'Conjurer', ['conjurer'], [5, 1, 13], 2000),
        bg('10-12', 'Scholar', ['sage'], [7, 1, 11], 2500),
      ],
      additional: [
        bg('2-4', 'Magic Warrior', ['fighter', 'sorcerer'], [7, 2, 10], 1000),
        bg('5-6', 'Priest', ['priest'], [6, 3, 10], 2000),
        bg('7', 'Fairy Tamer', ['fairy-tamer'], [5, 1, 13], 2000),
        bg('8-9', 'Druid', ['druid'], [5, 2, 12], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [6, 1, 12], 2000),
      ],
    },
  },
  {
    id: 'dark-dwarf',
    name: 'Dark Dwarf',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '1d', '2d', '1d', '1d', '2d+6'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Priest', ['priest'], [6, 10, 10], 2000),
        bg('5-6', 'Boxer', ['grappler'], [8, 12, 6], 2000),
        bg('7', 'Warrior', ['fighter'], [7, 11, 8], 2000),
        bg('8-9', 'Artificer', ['artificer'], [8, 10, 8], 2000),
        bg('10-12', 'Hunter', ['ranger'], [9, 10, 7], 2500),
      ],
      additional: [
        bg('2-4', 'Jockey', ['rider'], [8, 11, 7], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [9, 9, 8], 2500),
        bg('7', 'Battle Dancer', ['battle-dancer'], [9, 11, 6], 2000),
        bg('8-9', 'Tactician', ['tactician'], [8, 9, 9], 2500),
        bg('10-12', 'Warlock', ['daemonologist'], [8, 8, 10], 2000),
      ],
    },
  },
  // Rare species (Arcane Relic pp. 34-53): each category prints one shared A-F correction
  // die block and one shared 5-row background table for its pair of subspecies (not one per
  // subspecies), so the two RaceDefinition entries below intentionally repeat the same dice
  // and table literals rather than one per race, matching every other entry in this file.
  {
    id: 'snow-elf',
    name: 'Snow Elf',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '2d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [10, 6, 10], 2500),
        bg('5-6', 'Geomancer', ['geomancer'], [10, 5, 11], 2500),
        bg('7', 'Wizard', ['sorcerer', 'conjurer'], [9, 3, 14], 1000),
        bg('8-9', 'Druid', ['druid'], [9, 4, 13], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [9, 5, 12], 2000),
      ],
    },
  },
  {
    id: 'mist-elf',
    name: 'Mist Elf',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '2d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [10, 6, 10], 2500),
        bg('5-6', 'Geomancer', ['geomancer'], [10, 5, 11], 2500),
        bg('7', 'Wizard', ['sorcerer', 'conjurer'], [9, 3, 14], 1000),
        bg('8-9', 'Druid', ['druid'], [9, 4, 13], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [9, 5, 12], 2000),
      ],
    },
  },
  {
    id: 'pico-tabbit',
    name: 'Pico Tabbit',
    sourceBook: 'Arcane Relic',
    // Book gives the Rare Tabbit dice (1d/1d/1d/2d/2d+6/2d) plus a flat post-roll correction
    // "Dexterity +3 Agility +3 Strength -3 Vitality -3" — folded straight into `dice.bonus`
    // (a roll shifted by a constant has the same distribution as the roll plus that constant,
    // and `abilityPointCost` already subtracts `dice.bonus` before the table lookup, so Point
    // Buy needs no changes either).
    abilityDice: dice('1d+3', '1d+3', '1d-3', '2d-3', '2d+6', '2d'),
    restrictedClasses: ['priest'],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [8, 6, 8], 2500),
        bg('5-6', 'Warlock', ['daemonologist'], [6, 7, 9], 2000),
        bg('7', 'Druid', ['druid'], [7, 5, 10], 2000),
        bg('8-9', 'Alchemist', ['alchemist'], [7, 7, 8], 2500),
        bg('10-12', 'Hobbyist', ['sage', 'bard'], [6, 8, 8], 2000),
      ],
    },
  },
  {
    id: 'lupus-tabbit',
    name: 'Lupus Tabbit',
    sourceBook: 'Arcane Relic',
    // Flat correction "Agility +3 Strength +3 Intelligence -3 Spirit -3" over the same Rare
    // Tabbit dice, folded into `dice.bonus` as for Pico Tabbit above.
    abilityDice: dice('1d', '1d+3', '1d+3', '2d', '2d+3', '2d-3'),
    restrictedClasses: ['priest'],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [8, 6, 8], 2500),
        bg('5-6', 'Warlock', ['daemonologist'], [6, 7, 9], 2000),
        bg('7', 'Druid', ['druid'], [7, 5, 10], 2000),
        bg('8-9', 'Alchemist', ['alchemist'], [7, 7, 8], 2500),
        bg('10-12', 'Hobbyist', ['sage', 'bard'], [6, 8, 8], 2000),
      ],
    },
  },
  {
    id: 'guardian-runefolk',
    name: 'Guardian Type Runefolk',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '1d', '2d', '2d', '2d', '1d'),
    restrictedClasses: ['priest'],
    backgroundTables: {
      primary: [
        bg('2-4', 'Alchemist', ['alchemist'], [11, 7, 8], 2500),
        bg('5-6', 'Tactician', ['tactician'], [11, 7, 8], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [10, 11, 5], 2000),
        bg('8-9', 'Geomancer', ['geomancer'], [8, 11, 7], 2500),
        bg('10-12', 'Warlock', ['daemonologist'], [9, 9, 8], 2000),
      ],
    },
  },
  {
    id: 'combat-runefolk',
    name: 'Combat Type Runefolk',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '1d', '2d', '2d', '2d', '1d'),
    restrictedClasses: ['priest'],
    backgroundTables: {
      primary: [
        bg('2-4', 'Alchemist', ['alchemist'], [11, 7, 8], 2500),
        bg('5-6', 'Tactician', ['tactician'], [11, 7, 8], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [10, 11, 5], 2000),
        bg('8-9', 'Geomancer', ['geomancer'], [8, 11, 7], 2500),
        bg('10-12', 'Warlock', ['daemonologist'], [9, 9, 8], 2000),
      ],
    },
  },
  {
    id: 'shadowborn-nightmare',
    name: 'Shadow-born Nightmare',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '1d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [9, 12, 9], 2500),
        bg('5-6', 'Dancer', ['battle-dancer'], [11, 11, 8], 2000),
        bg('7', 'Warlock', ['daemonologist'], [11, 7, 12], 2000),
        bg('8-9', 'Druid', ['druid'], [7, 10, 13], 2000),
        bg('10-12', 'Geomancer', ['geomancer'], [10, 10, 10], 2500),
      ],
    },
  },
  {
    id: 'soleilborn-nightmare',
    name: 'Soleil-born Nightmare',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '1d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [9, 12, 9], 2500),
        bg('5-6', 'Dancer', ['battle-dancer'], [11, 11, 8], 2000),
        bg('7', 'Warlock', ['daemonologist'], [11, 7, 12], 2000),
        bg('8-9', 'Druid', ['druid'], [7, 10, 13], 2000),
        bg('10-12', 'Geomancer', ['geomancer'], [10, 10, 10], 2500),
      ],
    },
  },
  {
    id: 'large-herbivore-lykant',
    name: 'Large Herbivore Lykant',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('1d', '1d+3', '2d', '2d', '1d+6', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [9, 9, 7], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [10, 8, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [12, 7, 6], 2000),
        bg('8-9', 'Warlock', ['daemonologist'], [10, 7, 8], 2000),
        bg('10-12', 'Jockey', ['rider'], [11, 8, 6], 2500),
      ],
    },
  },
  {
    id: 'small-herbivore-lykant',
    name: 'Small Herbivore Lykant',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('1d', '1d+3', '2d', '2d', '1d+6', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [9, 9, 7], 2500),
        bg('5-6', 'Alchemist', ['alchemist'], [10, 8, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [12, 7, 6], 2000),
        bg('8-9', 'Warlock', ['daemonologist'], [10, 7, 8], 2000),
        bg('10-12', 'Jockey', ['rider'], [11, 8, 6], 2500),
      ],
    },
  },
  {
    id: 'small-winged-lildraken',
    name: 'Small-Winged Lildraken',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('1d', '2d', '2d', '2d+6', '1d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Alchemist', ['alchemist'], [6, 12, 7], 2500),
        bg('5-6', 'Tactician', ['tactician'], [5, 12, 8], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [7, 13, 5], 2000),
        bg('8-9', 'Druid', ['druid'], [6, 10, 9], 2000),
        bg('10-12', 'Geomancer', ['geomancer'], [6, 11, 8], 2500),
      ],
    },
  },
  {
    id: 'hairy-lildraken',
    name: 'Hairy Lildraken',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('1d', '2d', '2d', '2d+6', '1d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Alchemist', ['alchemist'], [6, 12, 7], 2500),
        bg('5-6', 'Tactician', ['tactician'], [5, 12, 8], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [7, 13, 5], 2000),
        bg('8-9', 'Druid', ['druid'], [6, 10, 9], 2000),
        bg('10-12', 'Geomancer', ['geomancer'], [6, 11, 8], 2500),
      ],
    },
  },
  {
    id: 'alisha-grassrunner',
    name: 'Alisha Grassrunner',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '2d+6', '1d', '2d+6'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Apothecary', ['sage', 'ranger'], [13, 1, 11], 2000),
        bg('5-6', 'Tactician', ['tactician'], [12, 2, 11], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 2, 10], 2000),
        bg('8-9', 'Geomancer', ['geomancer'], [11, 0, 14], 2500),
        bg('10-12', 'Alchemist', ['alchemist'], [13, 1, 11], 2500),
      ],
    },
  },
  {
    id: 'crimenos-grassrunner',
    name: 'Crimenos Grassrunner',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '2d+6', '1d', '2d+6'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Apothecary', ['sage', 'ranger'], [13, 1, 11], 2000),
        bg('5-6', 'Tactician', ['tactician'], [12, 2, 11], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 2, 10], 2000),
        bg('8-9', 'Geomancer', ['geomancer'], [11, 0, 14], 2500),
        bg('10-12', 'Alchemist', ['alchemist'], [13, 1, 11], 2500),
      ],
    },
  },
  {
    id: 'carnivorous-meria',
    name: 'Carnivorous Meria',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('1d', '1d', '1d', '2d+6', '1d', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Dancer', ['battle-dancer'], [9, 8, 12], 2000),
        bg('5-6', 'Tactician', ['tactician'], [7, 9, 13], 2500),
        bg('7', 'Druid', ['druid'], [6, 7, 16], 2000),
        bg('8-9', 'Geomancer', ['geomancer'], [9, 6, 14], 2500),
        bg('10-12', 'Warlock', ['daemonologist'], [7, 7, 15], 2000),
      ],
    },
  },
  {
    id: 'fungi-meria',
    name: 'Fungi Meria',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('1d', '1d', '1d', '2d+6', '1d', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Dancer', ['battle-dancer'], [9, 8, 12], 2000),
        bg('5-6', 'Tactician', ['tactician'], [7, 9, 13], 2500),
        bg('7', 'Druid', ['druid'], [6, 7, 16], 2000),
        bg('8-9', 'Geomancer', ['geomancer'], [9, 6, 14], 2500),
        bg('10-12', 'Warlock', ['daemonologist'], [7, 7, 15], 2000),
      ],
    },
  },
  {
    id: 'tech-tiens',
    name: 'Tech Tiens',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '1d+3', '2d', '2d+3'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Geomancer', ['geomancer'], [10, 8, 10], 2500),
        bg('5-6', 'Tactician', ['tactician'], [9, 12, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [10, 12, 6], 2000),
        bg('8-9', 'Warlock', ['daemonologist'], [9, 10, 9], 2000),
        bg('10-12', 'Druid', ['druid'], [8, 10, 10], 2000),
      ],
    },
  },
  {
    id: 'daemonic-tiens',
    name: 'Daemonic Tiens',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '2d', '1d', '1d+3', '2d', '2d+3'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Geomancer', ['geomancer'], [10, 8, 10], 2500),
        bg('5-6', 'Tactician', ['tactician'], [9, 12, 7], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [10, 12, 6], 2000),
        bg('8-9', 'Warlock', ['daemonologist'], [9, 10, 9], 2000),
        bg('10-12', 'Druid', ['druid'], [8, 10, 10], 2000),
      ],
    },
  },
  {
    id: 'leprechaun-nomad',
    name: 'Leprechaun Nomad',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '1d', '2d', '1d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [13, 5, 5], 2500),
        bg('5-6', 'Geomancer', ['geomancer'], [12, 5, 6], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [14, 5, 4], 2000),
        bg('8-9', 'Druid', ['druid'], [11, 4, 8], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [12, 6, 5], 2000),
      ],
    },
  },
  {
    id: 'leprechaun-explorer',
    name: 'Leprechaun Explorer',
    sourceBook: 'Arcane Relic',
    abilityDice: dice('2d', '1d', '2d', '1d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Tactician', ['tactician'], [13, 5, 5], 2500),
        bg('5-6', 'Geomancer', ['geomancer'], [12, 5, 6], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [14, 5, 4], 2000),
        bg('8-9', 'Druid', ['druid'], [11, 4, 8], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [12, 6, 5], 2000),
      ],
    },
  },
  // Barbarous Saga (Races & Gods Only) pp. 3-8 — three Barbarous races with full dice,
  // backgrounds and abilities, found while chasing an unrelated lead for § 1.9 (which this
  // book does not unblock: no Diablos/Drakes/Basilisks/Scissorscorpions here). The book
  // states "Restricted Classes: None" outright for all three, so this is confirmed rather
  // than inferred as it is for every other race in this file. "Soulscars" (a Barbarous
  // lineage-depth stat mentioned in flavor text throughout the catalog, e.g. Weakling/
  // Abyssborn) has no dedicated schema field anywhere else either, so it stays undocumented
  // here too — see docs/sheet-content/40-barbarous-saga-races-and-gods.md.
  {
    id: 'broken-drake',
    name: 'Broken Drake',
    sourceBook: 'Barbarous Saga',
    abilityDice: dice('1d', '1d', '2d', '2d', '2d+6', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Scout', ['scout', 'ranger'], [14, 11, 5], 2500, 'or'),
        bg('5-6', 'Conjurer', ['conjurer'], [10, 12, 8], 2000),
        bg('7', 'Warrior', ['fighter'], [12, 14, 4], 2000),
        bg('8-9', 'Sorcerer', ['sorcerer'], [11, 12, 7], 2000),
        bg('10-12', 'Sage', ['sage'], [11, 13, 6], 2500),
      ],
      additional: [
        bg('2-4', 'Tactician', ['tactician'], [12, 13, 5], 2500),
        bg('5-6', 'Agile Warrior', ['fencer'], [14, 10, 6], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 11, 6], 2000),
        bg('8-9', 'Priest', ['priest'], [11, 11, 8], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [10, 13, 7], 2000),
      ],
    },
  },
  {
    id: 'lamia',
    name: 'Lamia',
    sourceBook: 'Barbarous Saga',
    abilityDice: dice('1d', '2d', '1d', '2d', '2d', '2d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Scholar', ['sage'], [9, 9, 13], 2500),
        bg('5-6', 'Conjurer', ['conjurer'], [8, 7, 16], 2000),
        bg('7', 'Sorcerer', ['sorcerer'], [8, 8, 15], 2000),
        bg('8-9', 'Warrior', ['fighter', 'grappler'], [10, 9, 12], 2000, 'or'),
        bg('10-12', 'Cleric', ['priest'], [9, 8, 14], 2000),
      ],
      additional: [
        bg('2-4', 'Tactician', ['tactician'], [8, 9, 14], 2500),
        bg('5-6', 'Brigand', ['ranger'], [11, 7, 13], 2500),
        bg('7', 'Spy', ['scout'], [10, 8, 13], 2500),
        bg('8-9', 'Druid', ['druid'], [9, 7, 15], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [7, 8, 16], 2000),
      ],
    },
  },
  {
    id: 'dhampir',
    name: 'Dhampir',
    sourceBook: 'Barbarous Saga',
    abilityDice: dice('1d', '2d', '2d+6', '1d', '2d', '1d'),
    restrictedClasses: [],
    backgroundTables: {
      primary: [
        bg('2-4', 'Magician', ['sorcerer', 'conjurer'], [10, 6, 15], 2000, 'or'),
        bg('5-6', 'Priest', ['priest'], [10, 8, 13], 2000),
        bg('7', 'Warrior', ['fighter'], [13, 8, 10], 2000),
        bg('8-9', 'Boxer', ['grappler'], [11, 9, 11], 2000),
        bg('10-12', 'Agile Warrior', ['fencer'], [14, 7, 10], 2500),
      ],
      additional: [
        bg('2-4', 'Hermit', ['sage'], [10, 9, 12], 2500),
        bg('5-6', 'Tactician', ['tactician'], [11, 9, 11], 2500),
        bg('7', 'Dancer', ['battle-dancer'], [13, 7, 11], 2000),
        bg('8-9', 'Druid', ['druid'], [12, 6, 13], 2000),
        bg('10-12', 'Warlock', ['daemonologist'], [10, 7, 14], 2000),
      ],
    },
  },
];

export function getRace(id: string): RaceDefinition | undefined {
  return RACES.find((race) => race.id === id);
}

/**
 * Racial abilities, from docs/sheet-content/01-races.md.
 *
 * Names only, exactly as the books bracket them — the effect text lives in the research
 * docs in Russian, and the app is bilingual (same call as the spell catalog). `fromLevel`
 * is the Adventurer Level at which that version of the ability comes online: 0 from
 * creation, 6 and 11 for the Core II / Core III enhancements.
 */
export interface RacialAbility {
  name: string;
  fromLevel: 0 | 6 | 11;
}

const RACIAL_ABILITIES: Record<string, RacialAbility[]> = {
  human: [
    { name: "Sword's Grace/Change Fate", fromLevel: 0 },
    { name: "Sword's Grace/Change Fate", fromLevel: 6 },
    { name: "Sword's Grace/Change Fate", fromLevel: 11 },
  ],
  elf: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: "Sword's Grace/Gentle Water", fromLevel: 0 },
    { name: "Sword's Grace/Gentle Water", fromLevel: 6 },
    { name: "Sword's Grace/Gentle Water", fromLevel: 11 },
  ],
  dwarf: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: "Sword's Grace/Body of Flame", fromLevel: 0 },
    { name: "Sword's Grace/Body of Flame", fromLevel: 6 },
    { name: "Sword's Grace/Body of Flame", fromLevel: 11 },
  ],
  tabbit: [
    { name: 'Sixth Sense', fromLevel: 0 },
    { name: 'Sixth Sense', fromLevel: 6 },
    { name: 'Sixth Sense', fromLevel: 11 },
  ],
  runefolk: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'HP Conversion', fromLevel: 0 },
    { name: 'HP Conversion', fromLevel: 11 },
  ],
  nightmare: [
    { name: 'Alternate Form', fromLevel: 0 },
    { name: 'Weakness', fromLevel: 0 },
    { name: 'Alternate Form', fromLevel: 11 },
  ],
  lykant: [
    { name: 'Darkvision (Beast Form)', fromLevel: 0 },
    { name: 'Beast Form', fromLevel: 0 },
    { name: 'Beast Form', fromLevel: 11 },
  ],
  lildraken: [
    { name: 'Scaly Hide', fromLevel: 0 },
    { name: 'Tail Whip', fromLevel: 0 },
    { name: "Sword's Grace/Wings of the Wind", fromLevel: 0 },
    { name: "Sword's Grace/Wings of the Wind", fromLevel: 11 },
  ],
  grassrunner: [
    { name: 'Mana Interference', fromLevel: 0 },
    { name: 'Natural Communication', fromLevel: 0 },
    { name: 'Mana Interference', fromLevel: 11 },
  ],
  meria: [
    { name: 'Thriving Life', fromLevel: 0 },
    { name: 'Thriving Life', fromLevel: 11 },
  ],
  // Core III prints both steps for these two under the Level 11+ table.
  tiens: [
    { name: 'Intercommunication', fromLevel: 0 },
    { name: 'Intercommunication', fromLevel: 6 },
    { name: 'Intercommunication', fromLevel: 11 },
  ],
  leprechaun: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Invisible Hand', fromLevel: 0 },
    { name: 'Unseen Artisan', fromLevel: 0 },
    { name: 'Invisible Hand', fromLevel: 6 },
    { name: 'Invisible Hand', fromLevel: 11 },
  ],
  alv: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Spirit Drain', fromLevel: 0 },
    { name: 'Spirit Drain', fromLevel: 6 },
    { name: 'Spirit Drain', fromLevel: 11 },
  ],
  shadow: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: "Moonlight's Protection", fromLevel: 0 },
    { name: "Moonlight's Protection", fromLevel: 6 },
    { name: "Moonlight's Protection", fromLevel: 11 },
  ],
  soleil: [
    { name: 'Radiant Physique', fromLevel: 0 },
    { name: 'Photosynthesis', fromLevel: 0 },
    { name: 'Child of the Sun', fromLevel: 0 },
    { name: 'Radiant Physique', fromLevel: 6 },
    { name: 'Radiant Physique', fromLevel: 11 },
  ],
  // The four Weakling origins (Garuda/Tannoz/Basilisk/Minotaur) each enhance a different
  // racial ability of their own — Wind-Edge Blade, Carapace Hand, Petrifying Gaze/Poisonous
  // Blood, Herculean Strength — chosen once at creation. The schema has no field for which
  // origin a Weakling character picked, so only the shared [Barbarous Body] is listed here;
  // the origin-specific abilities and their Lv6/11 enhancements are not tracked yet.
  weakling: [{ name: 'Barbarous Body', fromLevel: 0 }],
  abyssborn: [
    { name: 'Abyssal Bastard', fromLevel: 0 },
    // One of these three is chosen at creation; all three progressions are listed since
    // the schema does not track which branch a character picked (same reasoning as Weakling).
    { name: 'Abyssal Bastard/Abyssal Body', fromLevel: 6 },
    { name: 'Abyssal Bastard/Abyssal Body', fromLevel: 11 },
    { name: 'Abyssal Bastard/Abyssal Arm', fromLevel: 6 },
    { name: 'Abyssal Bastard/Abyssal Arm', fromLevel: 11 },
    { name: 'Abyssal Bastard/Abyssal Eye', fromLevel: 6 },
    { name: 'Abyssal Bastard/Abyssal Eye', fromLevel: 11 },
  ],
  newman: [
    { name: 'Child of Magic', fromLevel: 0 },
    { name: 'Déjà Vu', fromLevel: 0 },
    { name: 'Child of Magic', fromLevel: 6 },
    { name: 'Child of Magic', fromLevel: 11 },
  ],
  spriggan: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Giantization', fromLevel: 0 },
    { name: 'Giantization', fromLevel: 6 },
    { name: 'Giantization', fromLevel: 11 },
  ],
  fluorite: [
    { name: 'Soul Glow', fromLevel: 0 },
    { name: 'Ore of Life', fromLevel: 0 },
    { name: 'Crystal Body', fromLevel: 0 },
    { name: 'Crystal Body', fromLevel: 6 },
    { name: 'Crystal Body', fromLevel: 11 },
  ],
  'dark-dwarf': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Black Flame Master', fromLevel: 0 },
    { name: 'Black Flame Master', fromLevel: 6 },
    { name: 'Black Flame Master', fromLevel: 11 },
  ],
  // Rare species (Arcane Relic pp. 34-53): each replaces one named ability of its parent race
  // with a new one of its own, keeping the parent's other abilities untouched.
  'snow-elf': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: "Sword's Grace/Solemn Ice", fromLevel: 0 },
    { name: "Sword's Grace/Solemn Ice", fromLevel: 6 },
    { name: "Sword's Grace/Solemn Ice", fromLevel: 11 },
  ],
  'mist-elf': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: "Sword's Grace/Beguiling Mist", fromLevel: 0 },
    { name: "Sword's Grace/Beguiling Mist", fromLevel: 6 },
    { name: "Sword's Grace/Beguiling Mist", fromLevel: 11 },
  ],
  // [Whistle] is additive to [Sixth Sense], not a replacement, and is never enhanced itself
  // ("Same as regular Tabbits with [Sixth Sense] being enhanced").
  'pico-tabbit': [
    { name: 'Sixth Sense', fromLevel: 0 },
    { name: 'Sixth Sense', fromLevel: 6 },
    { name: 'Sixth Sense', fromLevel: 11 },
    { name: 'Whistle', fromLevel: 0 },
  ],
  'lupus-tabbit': [
    { name: 'Sixth Sense', fromLevel: 0 },
    { name: 'Sixth Sense', fromLevel: 6 },
    { name: 'Sixth Sense', fromLevel: 11 },
    { name: 'Darkvision', fromLevel: 0 },
  ],
  'guardian-runefolk': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Fellowship', fromLevel: 0 },
    { name: 'Fellowship', fromLevel: 6 },
    { name: 'Fellowship', fromLevel: 11 },
  ],
  'combat-runefolk': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Will to Perform', fromLevel: 0 },
    { name: 'Will to Perform', fromLevel: 6 },
    { name: 'Will to Perform', fromLevel: 11 },
  ],
  // Both origins keep the base Nightmare abilities unchanged by name ("the same racial
  // ability, but the type of weak point is different for each") — Shadow-born trades the
  // weak-point damage for a Fortitude/Willpower penalty vs. psychic effects, Soleil-born
  // gets +2 energy-type damage. Neither numeric nuance is tracked; only book-bracketed names
  // and levels are (see the module doc comment above).
  'shadowborn-nightmare': [
    { name: 'Alternate Form', fromLevel: 0 },
    { name: 'Weakness', fromLevel: 0 },
    { name: 'Alternate Form', fromLevel: 11 },
  ],
  'soleilborn-nightmare': [
    { name: 'Alternate Form', fromLevel: 0 },
    { name: 'Weakness', fromLevel: 0 },
    { name: 'Alternate Form', fromLevel: 11 },
  ],
  'large-herbivore-lykant': [
    { name: 'Darkvision (Beast Form)', fromLevel: 0 },
    { name: 'Beast Form (Large Herbivore)', fromLevel: 0 },
    { name: 'Beast Form (Large Herbivore)', fromLevel: 6 },
    { name: 'Beast Form (Large Herbivore)', fromLevel: 11 },
  ],
  'small-herbivore-lykant': [
    { name: 'Darkvision (Beast Form)', fromLevel: 0 },
    { name: 'Beast Form (Small Herbivore)', fromLevel: 0 },
    { name: 'Beast Form (Small Herbivore)', fromLevel: 6 },
    { name: 'Beast Form (Small Herbivore)', fromLevel: 11 },
  ],
  // Small-Winged only replaces the flight ability; Scaly Hide/Tail Whip are untouched.
  'small-winged-lildraken': [
    { name: 'Scaly Hide', fromLevel: 0 },
    { name: 'Tail Whip', fromLevel: 0 },
    { name: "Sword's Grace/Dragon's Roar", fromLevel: 0 },
    { name: "Sword's Grace/Dragon's Roar", fromLevel: 6 },
    { name: "Sword's Grace/Dragon's Roar", fromLevel: 11 },
  ],
  // Hairy replaces both Tail Whip and Scaly Hide with a single ability; Wings of the Wind is
  // untouched (and keeps the base race's own 0/11 progression — no Level 6 step is printed).
  'hairy-lildraken': [
    { name: "Sword's Grace/Wings of the Wind", fromLevel: 0 },
    { name: "Sword's Grace/Wings of the Wind", fromLevel: 11 },
    { name: 'Warm Breeze', fromLevel: 0 },
    { name: 'Warm Breeze', fromLevel: 6 },
    { name: 'Warm Breeze', fromLevel: 11 },
  ],
  // Both say "No change in racial abilities" — Mana Interference keeps its name, but its
  // enhancement text is replaced (and gains a Level 6 step the base Grassrunner lacks).
  'alisha-grassrunner': [
    { name: 'Mana Interference', fromLevel: 0 },
    { name: 'Natural Communication', fromLevel: 0 },
    { name: 'Mana Interference', fromLevel: 6 },
    { name: 'Mana Interference', fromLevel: 11 },
  ],
  'crimenos-grassrunner': [
    { name: 'Mana Interference', fromLevel: 0 },
    { name: 'Natural Communication', fromLevel: 0 },
    { name: 'Mana Interference', fromLevel: 6 },
    { name: 'Mana Interference', fromLevel: 11 },
  ],
  'carnivorous-meria': [
    { name: 'Predatory Life', fromLevel: 0 },
    { name: 'Predatory Life', fromLevel: 6 },
    { name: 'Predatory Life', fromLevel: 11 },
  ],
  'fungi-meria': [
    { name: 'Sporulation', fromLevel: 0 },
    { name: 'Sporulation', fromLevel: 6 },
    { name: 'Sporulation', fromLevel: 11 },
  ],
  'tech-tiens': [
    { name: 'Tech-Link', fromLevel: 0 },
    { name: 'Tech-Link', fromLevel: 6 },
    { name: 'Tech-Link', fromLevel: 11 },
  ],
  'daemonic-tiens': [
    { name: 'Daemonic Communion', fromLevel: 0 },
    { name: 'Daemonic Communion', fromLevel: 6 },
    { name: 'Daemonic Communion', fromLevel: 11 },
  ],
  // Both replace [Unseen Artisan] with their own ability (Level 0 only, no enhancement
  // printed); [Invisible Hand] is untouched ("the enhancements are the same" as base
  // Leprechaun's own 0/6/11 progression).
  'leprechaun-nomad': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Invisible Hand', fromLevel: 0 },
    { name: 'Invisible Hand', fromLevel: 6 },
    { name: 'Invisible Hand', fromLevel: 11 },
    { name: 'Invisible Artisan', fromLevel: 0 },
  ],
  'leprechaun-explorer': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Invisible Hand', fromLevel: 0 },
    { name: 'Invisible Hand', fromLevel: 6 },
    { name: 'Invisible Hand', fromLevel: 11 },
    { name: "Artisan's Partner", fromLevel: 0 },
  ],
  // Barbarous Saga (Races & Gods Only) pp. 3-8. "Weak Point" (a passive vulnerability, not a
  // usable ability) is never book-bracketed for these three either, so — same as every other
  // race in this file — it stays out of this list.
  'broken-drake': [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Limited Dragonification', fromLevel: 0 },
    { name: 'Limited Dragonification', fromLevel: 6 },
    { name: 'Limited Dragonification', fromLevel: 11 },
  ],
  lamia: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: "Lamia's Physique", fromLevel: 0 },
    { name: 'Drain Blood', fromLevel: 0 },
    { name: 'Drain Blood', fromLevel: 6 },
    { name: 'Drain Blood', fromLevel: 11 },
    { name: 'Transformation', fromLevel: 0 },
  ],
  dhampir: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: 'Bloodsucking Blessing', fromLevel: 0 },
    { name: 'Abominable Blood', fromLevel: 0 },
    { name: 'Abominable Blood', fromLevel: 6 },
    { name: 'Abominable Blood', fromLevel: 11 },
    { name: 'Weakening', fromLevel: 0 },
  ],
};

export function racialAbilitiesFor(raceId: string): RacialAbility[] {
  return RACIAL_ABILITIES[raceId] ?? [];
}

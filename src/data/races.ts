import type { AbilityId } from '../lib/formulas/abilities';

/** Racial correction die: roll `count`d6 and add `bonus`. */
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
  /** null when no background table is available (Vagrant-system or missing-sourcebook races). */
  backgroundTables: { primary: BackgroundEntry[]; additional?: BackgroundEntry[] } | null;
  /** True for Outlaw Profile Book races, which use the separate Vagrant creation system. */
  usesVagrantSystem?: boolean;
  /** True when correction dice are known to be missing pending an unacquired sourcebook. */
  missingDiceData?: boolean;
}

function dice(A: string, B: string, C: string, D: string, E: string, F: string): AbilityDiceByAbility {
  const parse = (notation: string): AbilityDice => {
    const match = notation.match(/^(\d+)d(?:\+(\d+))?$/);
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
    },
  },
  { id: 'alv', name: 'Alv', sourceBook: 'Outlaw Profile Book', abilityDice: null, restrictedClasses: [], backgroundTables: null, usesVagrantSystem: true },
  { id: 'shadow', name: 'Shadow', sourceBook: 'Outlaw Profile Book', abilityDice: null, restrictedClasses: [], backgroundTables: null, usesVagrantSystem: true },
  { id: 'soleil', name: 'Soleil', sourceBook: 'Outlaw Profile Book', abilityDice: null, restrictedClasses: [], backgroundTables: null, usesVagrantSystem: true },
  { id: 'weakling', name: 'Weakling', sourceBook: 'Outlaw Profile Book', abilityDice: null, restrictedClasses: [], backgroundTables: null, usesVagrantSystem: true },
  { id: 'abyssborn', name: 'Abyssborn', sourceBook: 'Arcane Relic (via Raxia Life reprint)', abilityDice: null, restrictedClasses: [], backgroundTables: null, missingDiceData: true },
  { id: 'newman', name: 'Newman', sourceBook: 'Arcane Relic (via Raxia Life reprint)', abilityDice: null, restrictedClasses: [], backgroundTables: null, missingDiceData: true },
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
  ],
  shadow: [
    { name: 'Darkvision', fromLevel: 0 },
    { name: "Moonlight's Protection", fromLevel: 0 },
  ],
  soleil: [
    { name: 'Radiant Physique', fromLevel: 0 },
    { name: 'Photosynthesis', fromLevel: 0 },
    { name: 'Child of the Sun', fromLevel: 0 },
  ],
  weakling: [{ name: 'Barbarous Body', fromLevel: 0 }],
  abyssborn: [
    { name: 'Abyssal Bastard', fromLevel: 0 },
    { name: 'Abyssal Bastard/Abyssal Eye', fromLevel: 6 },
  ],
  newman: [
    { name: 'Child of Magic', fromLevel: 0 },
    { name: 'Déjà Vu', fromLevel: 0 },
    { name: 'Child of Magic', fromLevel: 6 },
  ],
};

export function racialAbilitiesFor(raceId: string): RacialAbility[] {
  return RACIAL_ABILITIES[raceId] ?? [];
}

/**
 * Characters with several sections — Barbarous Rage "About Transformations" (p. 53), "Characters with Multiple
 * Sections" (pp. 54-56), the Heritor class (p. 57), "Basic Values of Multiple Sections" (p. 63) and "List of
 * Innate Weapons" (p. 64). Transcribed in docs/sheet-content/43-barbarous-rage-multi-section-races.md.
 *
 * A Diablo, Drake or Basilisk gains its sections by shapeshifting; a Scissorscorpion has three all the time.
 * One section is the Main Section — the character's own HP, MP, classes and abilities — and the rest are
 * "other sections", each a little character of its own whose Maximum HP, Maximum MP and Defense come from the
 * table below by the level of the Heritor class (0 for a character without it).
 */

/** The six columns of "Basic Values of Multiple Sections". "Body" is also the Scissorscorpion's Upper Body, where the table has no Defense to give. */
export const SECTION_COLUMNS = ['head', 'body', 'wing', 'evilEye', 'scorpion', 'pincers'] as const;
export type SectionColumn = (typeof SECTION_COLUMNS)[number];

export interface SectionValues {
  hp: number;
  mp: number;
  defense: number;
}

export const HERITOR_MAX_LEVEL = 15;

/** Per Heritor level 0-15: [Max HP, Max MP, Defense]. */
const TABLE: Record<SectionColumn, [number, number, number][]> = {
  head: [
    [14, 10, 1], [17, 12, 1], [20, 14, 2], [23, 16, 2], [26, 18, 3], [29, 20, 3], [32, 22, 4], [36, 24, 4],
    [40, 26, 5], [44, 29, 5], [48, 32, 6], [52, 35, 7], [56, 38, 7], [60, 41, 8], [65, 44, 8], [70, 47, 9],
  ],
  body: [
    [20, 10, 1], [24, 12, 2], [28, 14, 3], [32, 16, 4], [36, 18, 5], [40, 20, 6], [44, 22, 7], [48, 25, 8],
    [53, 28, 9], [58, 31, 10], [63, 34, 11], [68, 37, 12], [73, 41, 13], [78, 45, 14], [83, 49, 15], [88, 53, 16],
  ],
  wing: [
    [10, 5, 0], [13, 6, 1], [16, 7, 2], [19, 9, 3], [22, 11, 4], [25, 13, 5], [28, 15, 6], [32, 17, 7],
    [36, 19, 8], [40, 21, 9], [44, 23, 10], [48, 26, 11], [53, 29, 12], [58, 32, 13], [63, 35, 14], [68, 38, 15],
  ],
  evilEye: [
    [10, 10, 0], [12, 12, 0], [14, 14, 0], [16, 16, 0], [18, 18, 1], [20, 20, 1], [22, 22, 1], [24, 24, 2],
    [27, 27, 2], [30, 30, 2], [33, 33, 3], [36, 36, 3], [39, 39, 3], [42, 42, 4], [45, 45, 4], [48, 48, 4],
  ],
  scorpion: [
    [16, 6, 2], [20, 8, 3], [24, 10, 4], [28, 12, 5], [32, 14, 6], [37, 16, 7], [42, 18, 8], [47, 21, 9],
    [52, 24, 10], [58, 27, 11], [64, 30, 12], [70, 33, 13], [76, 36, 14], [83, 40, 15], [90, 44, 16], [97, 48, 17],
  ],
  pincers: [
    [12, 6, 2], [15, 8, 2], [18, 10, 3], [21, 12, 3], [24, 14, 4], [27, 16, 4], [31, 18, 5], [35, 20, 5],
    [39, 22, 6], [43, 24, 6], [47, 26, 7], [52, 28, 7], [57, 30, 8], [62, 32, 8], [67, 34, 9], [72, 36, 9],
  ],
};

/** The table's row for a column at a Heritor level (no class = 0; the table stops at 15). */
export function basicValues(column: SectionColumn, heritorLevel: number): SectionValues {
  const level = Math.max(0, Math.min(HERITOR_MAX_LEVEL, Math.floor(heritorLevel)));
  const [hp, mp, defense] = TABLE[column][level];
  return { hp, mp, defense };
}

export const INNATE_KINDS = ['claws', 'bite', 'wing', 'drill', 'scorpionTail', 'pincers'] as const;
export type InnateKind = (typeof INNATE_KINDS)[number];

export const INNATE_RANKS = ['B', 'A', 'S', 'SS'] as const;
export type InnateRank = (typeof INNATE_RANKS)[number];

export interface InnateWeapon {
  name: string;
  /** "1HW" worn on the hand, "1H#" and "2H#" occupy no hand (Core III). All are Min STR 1. */
  stance: string;
  /** The Accuracy modifier column: Pincers +1, Scorpion Tail -1, the rest none. */
  accuracy: number;
  power: number;
  criticalValue: number;
}

const row = (name: string, stance: string, accuracy: number, power: number, criticalValue: number): InnateWeapon => ({ name, stance, accuracy, power, criticalValue });

/** "List of Innate Weapons" (p. 64): every one a wrestling weapon with no price and no extra damage; Learning [Innate Weapons Mastery A/S/SS] moves a kind up a rank. */
export const INNATE_WEAPONS: Record<InnateKind, Record<InnateRank, InnateWeapon>> = {
  claws: {
    B: row('Claws', '1HW', 0, 6, 10),
    A: row('Talons', '1HW', 0, 16, 10),
    S: row('Piercing Claws', '1HW', 1, 21, 10),
    SS: row('Murderous Talons', '1HW', 1, 26, 9),
  },
  bite: {
    B: row('Bite', '2H#', 0, 11, 10),
    A: row('Sharp Bite', '2H#', 0, 21, 10),
    S: row('Cleaving Bite', '2H#', 0, 31, 10),
    SS: row('Steel Rending Bite', '2H#', 0, 41, 10),
  },
  wing: {
    B: row('Wing', '1H#', 0, 6, 11),
    A: row('Pointed Wing', '1H#', 0, 16, 11),
    S: row('Powerful Wing', '1H#', 0, 26, 11),
    SS: row('Wing of Judgement', '1H#', 0, 36, 11),
  },
  drill: {
    B: row('Drill', '1H#', 0, 16, 11),
    A: row('Piercing Drill', '1H#', 0, 26, 11),
    S: row('Penetrating Drill', '1H#', 0, 36, 11),
    SS: row('Destructive Drill', '1H#', 0, 46, 11),
  },
  scorpionTail: {
    B: row('Scorpion Tail', '1H#', -1, 11, 10),
    A: row('Whiptail', '1H#', -1, 21, 10),
    S: row('Sharp Tail', '1H#', -1, 31, 10),
    SS: row('Dream Tail', '1H#', -1, 41, 10),
  },
  pincers: {
    B: row('Pincers', '1HW', 1, 6, 11),
    A: row('Hard Pincers', '1HW', 1, 16, 11),
    S: row('Crushing Pincers', '1HW', 1, 26, 11),
    SS: row('Indestructible Pincers', '1HW', 1, 36, 11),
  },
};

/** The rank the learned Infusions give the innate weapons: [Innate Weapons Mastery A / S / SS], each needing the one before. */
export function innateRank(infusionNames: string[]): InnateRank {
  const known = new Set(infusionNames);
  if (known.has('Innate Weapons Mastery SS')) return 'SS';
  if (known.has('Innate Weapons Mastery S')) return 'S';
  return known.has('Innate Weapons Mastery A') ? 'A' : 'B';
}

export interface FormSection {
  /** Stable key kept on the character. */
  id: string;
  /** The book's name for it ("Wing" twice for a Drake: the id tells them apart). */
  name: string;
  main: boolean;
  /** Which column of the table gives its values. */
  column: SectionColumn;
  /** Whether the table's Defense applies: the Scissorscorpion's Upper Body wears armor instead. */
  defenseFromTable: boolean;
  weapon: InnateKind | null;
}

export interface FormDefinition {
  raceId: string;
  /** The transformed form's name; the Scissorscorpion has none, being in its shape always. */
  formName: string | null;
  /** In its sections from the start: no transformation to make. */
  always: boolean;
  sections: FormSection[];
  /** What the transformation needs about the body (Core, Magic Sword, Eye of Stone). */
  item: string | null;
  /** Adventurer Level from which the transformation is a Minor Action instead of a Major one. */
  minorFromLevel: number | null;
  /** Hours the form cannot be left after the change. */
  lockHours: number;
  /** Hours before it can be taken again (the Diablo only: once every 3 hours). */
  cooldownHours: number | null;
  /** The weak point the book prints with the race. */
  weakPoint: string;
  /** Intelligence lost in the form (Basilisk -12). */
  intelligencePenalty: number;
}

const section = (id: string, name: string, column: SectionColumn, weapon: InnateKind | null, main = false, defenseFromTable = true): FormSection => ({ id, name, main, column, defenseFromTable, weapon });

export const FORMS: FormDefinition[] = [
  {
    raceId: 'diablo',
    formName: 'Daemon Form',
    always: false,
    sections: [section('head', 'Head', 'head', 'bite', true), section('body', 'Body', 'body', 'drill')],
    item: 'Diablo Core',
    minorFromLevel: 8,
    lockHours: 1,
    cooldownHours: 3,
    weakPoint: 'Energy type damage +3 points',
    intelligencePenalty: 0,
  },
  {
    raceId: 'drake',
    formName: 'Dragon Form',
    always: false,
    sections: [section('body', 'Body', 'body', 'claws', true), section('wing-1', 'Wing', 'wing', 'wing'), section('wing-2', 'Wing', 'wing', 'wing')],
    item: "Drake's Magic Sword",
    minorFromLevel: 11,
    lockHours: 1,
    cooldownHours: null,
    weakPoint: 'Magic damage +2 points',
    intelligencePenalty: 0,
  },
  {
    raceId: 'basilisk',
    formName: 'Monstrous Form',
    always: false,
    sections: [section('head', 'Head', 'head', 'bite', true), section('body', 'Body', 'body', 'claws'), section('evil-eye', 'Evil Eye', 'evilEye', null)],
    item: 'Eye Of Stone',
    minorFromLevel: 11,
    lockHours: 1,
    cooldownHours: null,
    weakPoint: 'Water/Ice damage +3 points',
    intelligencePenalty: 12,
  },
  {
    raceId: 'scissorscorpion',
    formName: null,
    always: true,
    sections: [section('upper-body', 'Upper Body', 'body', null, true, false), section('scorpion', 'Scorpion', 'scorpion', 'scorpionTail'), section('pincers', 'Pincers', 'pincers', 'pincers')],
    item: null,
    minorFromLevel: null,
    lockHours: 0,
    cooldownHours: null,
    weakPoint: 'Physical damage +2 points',
    intelligencePenalty: 0,
  },
];

export function formOf(raceId: string): FormDefinition | undefined {
  return FORMS.find((form) => form.raceId === raceId);
}

/** What the learned Infusions add to every other section — the ones that are plain numbers. */
export interface SectionBonuses {
  hp: number;
  defense: number;
  /** To the Accuracy and Evasion checks. */
  checks: number;
}

/**
 * [Tenacious Infusion I / II / Mastery] — Other Sections' Defense +1/+2/+4 and Max HP +5/+10/+20 in total — and
 * [Section Quick Reaction I / II] with [Meticulous Infusion Mastery] — Accuracy and Evasion +1/+2/+3 in total.
 * Each tier's text says "in total", so the highest known tier counts, not the sum.
 */
export function infusionBonuses(infusionNames: string[]): SectionBonuses {
  const known = new Set(infusionNames);
  const hp = known.has('Tenacious Infusion Mastery') ? [20, 4] : known.has('Tenacious Infusion II') ? [10, 2] : known.has('Tenacious Infusion I') ? [5, 1] : [0, 0];
  const checks = known.has('Meticulous Infusion Mastery') ? 3 : known.has('Section Quick Reaction II') ? 2 : known.has('Section Quick Reaction I') ? 1 : 0;
  return { hp: hp[0], defense: hp[1], checks };
}

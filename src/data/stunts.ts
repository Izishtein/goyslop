/**
 * Rider Stunts — Core Rulebook III pp. 180-189, transcribed in
 * docs/sheet-content/32-rider-stunts.md.
 *
 * "When taking a level of the Rider class, including the first, you can choose a Stunt from
 * the Stunts available at your level" (p. 86) — one slot per Rider class level, exactly like
 * a combat feat slot, and `requiredLevel` only gates which Stunts are on offer, it does not
 * grant an extra slot of its own.
 *
 * Like the spell/arts/feat catalogs this carries no effect text — the research doc holds it
 * in Russian, and the sheet's own note field is where a player writes what a Stunt does.
 */
import type { StuntType } from '../types/character';
import type { MountCategory } from './mounts';

export interface StuntDefinition {
  id: string;
  name: string;
  type: StuntType;
  requiredLevel: 1 | 5 | 10;
  /** Name of the Stunt that must already be known, if any. */
  prerequisite?: string;
  compatible: MountCategory[];
  /** As the book prints it: "None", "Main", "All", or "Main or All". */
  area: string;
  sourceBook: string;
}

const CORE3 = 'Core Rulebook III';
const ALL_MOUNTS: MountCategory[] = ['animal', 'mythicalBeast', 'magitech'];
const NO_MAGITECH: MountCategory[] = ['animal', 'mythicalBeast'];

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stunt(
  name: string,
  type: StuntType,
  requiredLevel: 1 | 5 | 10,
  compatible: MountCategory[],
  area: string,
  prerequisite?: string,
): StuntDefinition {
  return { id: slug(name), name, type, requiredLevel, compatible, area, prerequisite, sourceBook: CORE3 };
}

export const STUNTS: StuntDefinition[] = [
  // --- 1st Level Rider Required, pp. 181-184 ---
  stunt('Intimidation', 'minorAction', 1, NO_MAGITECH, 'Main'),
  stunt('Mind to Mind', 'passive', 1, ALL_MOUNTS, 'All'),
  stunt('Remote Command', 'passive', 1, NO_MAGITECH, 'All'),
  stunt('Search Command', 'passive', 1, NO_MAGITECH, 'Main'),
  stunt('Enhance Mount', 'passive', 1, ALL_MOUNTS, 'Main or All'),
  stunt("Mount's Devotion", 'passive', 1, NO_MAGITECH, 'Main'),
  stunt('Attack Obstruction', 'passive', 1, ALL_MOUNTS, 'None'),
  stunt('Elevated Attack', 'passive', 1, ALL_MOUNTS, 'None'),
  stunt('Tandem', 'passive', 1, ALL_MOUNTS, 'None'),
  stunt('Charge', 'majorAction', 1, ALL_MOUNTS, 'All'),
  stunt('Magic Command', 'majorAction', 1, NO_MAGITECH, 'All'),
  stunt('HP Enhancement', 'passive', 1, NO_MAGITECH, 'All'),

  // --- 5th Level Rider Required, pp. 185-187 ---
  stunt('Limit Drive', 'minorAction', 5, ['magitech'], 'All'),
  stunt("Lion's Fury", 'passive', 5, ALL_MOUNTS, 'All'),
  stunt('Steady Command', 'minorAction', 5, ALL_MOUNTS, 'None'),
  stunt('Riding As One', 'passive', 5, ALL_MOUNTS, 'None'),
  stunt('Improved Elevated Attack', 'passive', 5, ALL_MOUNTS, 'None', 'Elevated Attack'),
  stunt('Unique Skill Release', 'passive', 5, ALL_MOUNTS, 'All'),
  // The book prints "Prer. -" here (a bare dash, unlike every "Prer. None" elsewhere) while
  // the Russian digest claims a [Charge] prerequisite — confirmed by rendering p. 186 that
  // the book itself shows no bracketed reference, just the dash. Book wins: no prerequisite.
  stunt('Trample', 'majorAction', 5, ALL_MOUNTS, 'All'),
  stunt('Improved Magic Command', 'passive', 5, NO_MAGITECH, 'All', 'Magic Command'),
  stunt('Improved HP Enhancement', 'passive', 5, ALL_MOUNTS, 'All', 'HP Enhancement'),

  // --- 10th Level Rider Required, pp. 187-189 ---
  stunt('Improved Enhance Mount', 'passive', 10, ALL_MOUNTS, 'Main or All', 'Enhance Mount'),
  stunt('Mounted Command', 'majorAction', 10, ALL_MOUNTS, 'None'),
  stunt('Greater Elevated Attack', 'passive', 10, ALL_MOUNTS, 'None', 'Improved Elevated Attack'),
  stunt('Instant Magic Command', 'passive', 10, NO_MAGITECH, 'All', 'Magic Command'),
  stunt('Super Charge', 'majorAction', 10, ALL_MOUNTS, 'All', 'Charge'),
  stunt('Overdrive', 'minorAction', 10, ['magitech'], 'All', 'Limit Drive'),
  stunt('Improved Attack Obstruction', 'passive', 10, ALL_MOUNTS, 'None', 'Attack Obstruction'),
  stunt('Unique Skill Perfect Release', 'passive', 10, ALL_MOUNTS, 'All', 'Unique Skill Release'),
  stunt("Orochi's Fury", 'majorAction', 10, ALL_MOUNTS, 'All', "Lion's Fury"),
  stunt('Balance', 'passive', 10, ALL_MOUNTS, 'All', 'Steady Command'),
];

export function getStunt(id: string): StuntDefinition | undefined {
  return STUNTS.find((s) => s.id === id);
}

export function listStuntsByLevel(level: 1 | 5 | 10): StuntDefinition[] {
  return STUNTS.filter((s) => s.requiredLevel === level);
}

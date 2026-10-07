import { getClass } from '../data/classes';
import { DEEP_MAGIC, SPELLS } from '../data/spells';
import { DIVINE } from '../data/spells/types';
import type { Character } from '../types/character';
import { magicPower } from './formulas/derived-stats';

/** Highest level the character has in a given class id — 0 if they don't have it at all. */
export function classLevel(character: Pick<Character, 'classes'>, classId: string): number {
  return character.classes
    .filter((entry) => entry.classId === classId)
    .reduce((max, entry) => Math.max(max, entry.level), 0);
}

/** The schools this character casts from, in class order — Wizard-type classes only. */
export function magicSchoolsOf(character: Pick<Character, 'classes'>): string[] {
  const schools = character.classes
    .map((entry) => getClass(entry.classId))
    .filter((classDef) => classDef?.type === 'wizard')
    .map((classDef) => classDef?.magicSchool)
    .filter((school): school is string => Boolean(school));
  // Deep Magic has no owning class (see data/spells/deep.ts) — it's automatically gained by
  // mastering both Sorcerer and Conjurer instead of coming from a single class's magicSchool.
  if (classLevel(character, 'sorcerer') > 0 && classLevel(character, 'conjurer') > 0) {
    schools.push(DEEP_MAGIC);
  }
  return [...new Set(schools)];
}

/**
 * The highest circle the character can cast from a school: the class level, "determined
 * independently for each class" (Core I p. 156). Deep Magic is the one exception — the
 * LOWER of the Sorcerer and Conjurer levels (Magus Arts p. 95), the opposite of every other
 * school, since it needs both classes at once rather than any one of them.
 */
export function schoolLevel(character: Pick<Character, 'classes'>, school: string): number {
  if (school === DEEP_MAGIC) {
    return Math.min(classLevel(character, 'sorcerer'), classLevel(character, 'conjurer'));
  }
  return character.classes
    .filter((entry) => getClass(entry.classId)?.magicSchool === school)
    .reduce((max, entry) => Math.max(max, entry.level), 0);
}

/**
 * Deep Magic's Magic Power: the HIGHER of the two class levels plus INT, while its circle
 * is the lower (Magus Arts p. 95). Zero-level when either class is missing.
 */
export function deepMagicPower(character: Pick<Character, 'classes'>, intModifier: number): number | null {
  const sorcerer = classLevel(character, 'sorcerer');
  const conjurer = classLevel(character, 'conjurer');
  if (sorcerer === 0 || conjurer === 0) return null;
  return magicPower(Math.max(sorcerer, conjurer), intModifier);
}

/** Every deity with a Specialized Divine spell in the catalog, in catalog order. */
export function listDeities(): string[] {
  return [...new Set(SPELLS.filter((spell) => spell.school === DIVINE && spell.deity).map((spell) => spell.deity as string))];
}

/**
 * Whether a spell is open to a Priest of `deity`. Basic spells (no deity) are for everyone;
 * a Specialized one only for the single god worshipped (Core I p. 175) — and with no god
 * chosen yet, none of them are.
 */
export function deityAllows(spellDeity: string | undefined, deity: string): boolean {
  return !spellDeity || spellDeity === deity;
}

export type SpellProblem = 'aboveLevel' | 'wrongDeity';

/**
 * What is wrong with a spell the character already knows, if anything. Catalog spells are
 * matched by name; hand-written ones that do not match a catalog entry only get the circle
 * check, which needs nothing but the school and circle stored on the row.
 */
export function spellProblems(character: Pick<Character, 'classes' | 'deity'>, spell: { name: string; school: string; circle: number }): SpellProblem[] {
  const problems: SpellProblem[] = [];
  if (spell.school && spell.circle > schoolLevel(character, spell.school)) problems.push('aboveLevel');
  // A name can exist for several gods; it is only wrong when none of those entries is open.
  const catalog = SPELLS.filter((entry) => entry.name === spell.name && entry.school === spell.school);
  if (spell.school === DIVINE && catalog.length > 0 && !catalog.some((entry) => deityAllows(entry.deity, character.deity))) {
    problems.push('wrongDeity');
  }
  return problems;
}

/** Spend MP on a cast; never below zero. Returns null when there is not enough. */
export function mpAfterCast(current: number, cost: number): number | null {
  return cost > current ? null : current - cost;
}

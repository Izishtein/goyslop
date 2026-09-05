/**
 * Shared shape for the spell catalog. Data lives in core1.ts / core2.ts / fairy.ts and is
 * aggregated in index.ts.
 *
 * Index data only — name, school, circle and MP cost. Effect text is deliberately not
 * carried here: the research docs hold it in Russian only, and this app ships EN and RU
 * side by side. Each spell a character knows has its own free-text note on the sheet.
 *
 *  matches ClassDefinition.magicSchool, which is how the sheet works out which
 * spells a given character can pick.
 */
export interface SpellDefinition {
  id: string;
  name: string;
  school: string;
  /** 1-6 in Core I, up to 10 with Core II and Fairy Magic. */
  circle: number;
  /** Undefined where the source table does not print a cost (Fairy Magic, one cut page). */
  mp?: number;
  /** True when the book prints the cost as a base plus an open-ended extra. */
  mpVariable?: boolean;
  /** Specialized Divine spells belong to a single deity. */
  deity?: string;
  /** Magitech spells are cast through a magisphere of the given size. */
  magisphere?: string;
  /** Fairy Magic is split into elemental types; a Fairy Tamer picks four per day. */
  fairyType?: string;
  sourceBook: string;
}

export const TRUESPEECH = 'Truespeech Magic';
export const SPIRITUALISM = 'Spiritualism Magic';
export const DIVINE = 'Divine Magic';
export const MAGITECH = 'Magitech';
export const FAIRY = 'Fairy Magic';

export function spellId(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

export function makeSpell(
  sourceBook: string,
  school: string,
  circle: number,
  name: string,
  mp: number | undefined,
  extra: Partial<SpellDefinition> = {},
): SpellDefinition {
  return { id: spellId(name), name, school, circle, mp, sourceBook, ...extra };
}

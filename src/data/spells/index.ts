import { ABYSSAL_SPELLS } from './abyssal';
import { ARCANE_SPELLS } from './arcane';
import { CORE1_SPELLS } from './core1';
import { CORE2_SPELLS } from './core2';
import { CORE3_SPELLS } from './core3';
import { DEEP_SPELLS } from './deep';
import { FAIRY_SPELLS } from './fairy';
import { NATURE_SPELLS } from './nature';
import { SUMMONING_SPELLS } from './summoning';
import {
  ABYSSAL,
  ARCANE,
  DEEP_MAGIC,
  DIVINE,
  FAIRY,
  MAGITECH,
  NATURE,
  SPIRITUALISM,
  SUMMONING,
  TRUESPEECH,
  type SpellDefinition,
} from './types';

export type { SpellDefinition } from './types';
export { DEEP_MAGIC } from './types';

export const SPELLS: SpellDefinition[] = [
  ...CORE1_SPELLS,
  ...CORE2_SPELLS,
  ...CORE3_SPELLS,
  ...FAIRY_SPELLS,
  ...NATURE_SPELLS,
  ...SUMMONING_SPELLS,
  ...ABYSSAL_SPELLS,
  ...ARCANE_SPELLS,
  ...DEEP_SPELLS,
];

/**
 * Schools with catalog data. Every one of these except Deep Magic is also exactly one
 * class's `magicSchool` in `data/classes.ts` — Deep Magic has no owning class (see
 * `deep.ts`), so it's browsable here but `SpellsSection` grants it via a Sorcerer+Conjurer
 * special case instead of the usual class lookup.
 */
export const CATALOGUED_SCHOOLS = [
  TRUESPEECH,
  SPIRITUALISM,
  DIVINE,
  MAGITECH,
  FAIRY,
  NATURE,
  SUMMONING,
  ABYSSAL,
  ARCANE,
  DEEP_MAGIC,
];

export function listSpellsBySchool(school: string): SpellDefinition[] {
  return SPELLS.filter((spell) => spell.school === school).sort(
    (a, b) => a.circle - b.circle || a.name.localeCompare(b.name),
  );
}

export function getSpell(id: string): SpellDefinition | undefined {
  return SPELLS.find((spell) => spell.id === id);
}

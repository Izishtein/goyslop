import { ABYSSAL_SPELLS } from './abyssal';
import { CORE1_SPELLS } from './core1';
import { CORE2_SPELLS } from './core2';
import { FAIRY_SPELLS } from './fairy';
import { NATURE_SPELLS } from './nature';
import { SUMMONING_SPELLS } from './summoning';
import {
  ABYSSAL,
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

export const SPELLS: SpellDefinition[] = [
  ...CORE1_SPELLS,
  ...CORE2_SPELLS,
  ...FAIRY_SPELLS,
  ...NATURE_SPELLS,
  ...SUMMONING_SPELLS,
  ...ABYSSAL_SPELLS,
];

/**
 * Schools with catalog data. Arcane Magic is the one school still without a per-spell list:
 * Tyrants Crypts is under a translation embargo, so the sheet offers hand entry for it.
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
];

export function listSpellsBySchool(school: string): SpellDefinition[] {
  return SPELLS.filter((spell) => spell.school === school).sort(
    (a, b) => a.circle - b.circle || a.name.localeCompare(b.name),
  );
}

export function getSpell(id: string): SpellDefinition | undefined {
  return SPELLS.find((spell) => spell.id === id);
}

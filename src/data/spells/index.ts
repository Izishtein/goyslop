import { ABYSSAL_SPELLS } from './abyssal';
import { ARCANE_SPELLS } from './arcane';
import { CORE1_SPELLS } from './core1';
import { CORE2_SPELLS } from './core2';
import { CORE3_SPELLS } from './core3';
import { FAIRY_SPELLS } from './fairy';
import { NATURE_SPELLS } from './nature';
import { SUMMONING_SPELLS } from './summoning';
import {
  ABYSSAL,
  ARCANE,
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
  ...CORE3_SPELLS,
  ...FAIRY_SPELLS,
  ...NATURE_SPELLS,
  ...SUMMONING_SPELLS,
  ...ABYSSAL_SPELLS,
  ...ARCANE_SPELLS,
];

/** Schools with catalog data — every wizard school in the class catalog. */
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
];

export function listSpellsBySchool(school: string): SpellDefinition[] {
  return SPELLS.filter((spell) => spell.school === school).sort(
    (a, b) => a.circle - b.circle || a.name.localeCompare(b.name),
  );
}

export function getSpell(id: string): SpellDefinition | undefined {
  return SPELLS.find((spell) => spell.id === id);
}

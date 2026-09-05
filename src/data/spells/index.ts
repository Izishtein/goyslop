import { CORE1_SPELLS } from './core1';
import { CORE2_SPELLS } from './core2';
import { FAIRY_SPELLS } from './fairy';
import { DIVINE, FAIRY, MAGITECH, SPIRITUALISM, TRUESPEECH, type SpellDefinition } from './types';

export type { SpellDefinition } from './types';

export const SPELLS: SpellDefinition[] = [...CORE1_SPELLS, ...CORE2_SPELLS, ...FAIRY_SPELLS];

/**
 * Schools with catalog data. The remaining schools exist in the class catalog but have no
 * per-spell lists in the research docs (Nature, Summoning, Abyssal and Arcane Magic are
 * documented by mechanics and counts only), so the sheet offers hand entry for those.
 */
export const CATALOGUED_SCHOOLS = [TRUESPEECH, SPIRITUALISM, DIVINE, MAGITECH, FAIRY];

export function listSpellsBySchool(school: string): SpellDefinition[] {
  return SPELLS.filter((spell) => spell.school === school).sort(
    (a, b) => a.circle - b.circle || a.name.localeCompare(b.name),
  );
}

export function getSpell(id: string): SpellDefinition | undefined {
  return SPELLS.find((spell) => spell.id === id);
}

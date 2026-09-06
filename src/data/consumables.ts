/**
 * Consumables the rules name outright (docs/sheet-content/06-equipment.md, "Расходники").
 *
 * These are suggestions for the inventory rows, not a closed list — anything else is typed
 * by hand, exactly as with the spell schools that have no catalog. Names stay in English
 * like the spell catalog: they are game terms, not prose to translate.
 */
export const CONSUMABLE_PRESETS = [
  'HP Potion',
  'Awakening Potion',
  'Mana Crystal',
  'Mako Stone',
  'Antidote',
  'Holy Water',
  'Fairy Gem',
  'Magisphere (S)',
  'Magisphere (M)',
  'Magisphere (L)',
] as const;

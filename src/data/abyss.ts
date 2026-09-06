/**
 * Abyss Enhancement — Core Rulebook II pp. 245–257, transcribed in
 * docs/sheet-content/06-equipment.md.
 *
 * The Magic Guild burns Abyss Shards into a piece of equipment: at most two enhancements
 * per item, and every one of them drags an Abyss Curse along, rolled 1d twice on a 6×6
 * table. The sheet records what an item carries; it deliberately does not fold the bonuses
 * into the item's numbers, because the player already types those into the weapon's
 * accuracy and damage fields — automating one half would double-count the other.
 *
 * Enhancement names read as the book prints them; the ones that end "vs Category" or
 * "of Type" need the rolled category or type written into the row's note.
 */

export type AbyssTarget = 'weapon' | 'armor' | 'shield';

export const WEAPON_ENHANCEMENTS = [
  'Accuracy +1',
  'Extra Damage +1',
  'Minimum Strength -2',
  'Critical Threshold -1',
  'Extra Damage +2 vs Category',
  'Extra Damage +1 vs Type',
  'Spellcasting SV +1',
  'Spell Damage +1',
  'Spell Restoration +1',
] as const;

export const ARMOR_ENHANCEMENTS = [
  'Defense +1',
  'Minimum Strength -2',
  'Magic Damage -1',
  'Defense +2 vs Category',
  'Damage of Type -2',
  'Check Package +1',
] as const;

export const SHIELD_ENHANCEMENTS = [
  'Defense +1',
  'Evasion +1',
  'Minimum Strength -2',
  'Magic Damage -1',
  'Defense +2 vs Category',
  'Damage of Type -2',
] as const;

export function enhancementsFor(target: AbyssTarget): readonly string[] {
  if (target === 'weapon') return WEAPON_ENHANCEMENTS;
  if (target === 'armor') return ARMOR_ENHANCEMENTS;
  return SHIELD_ENHANCEMENTS;
}

export interface AbyssCurseDefinition {
  /** The two dice, as the book indexes the table: "1-1" through "6-6". */
  roll: string;
  name: string;
}

/** All 36 curses, in roll order (Core II pp. 252–255). */
export const ABYSS_CURSES: AbyssCurseDefinition[] = [
  { roll: '1-1', name: 'Of Self-Harm' },
  { roll: '1-2', name: 'Of Lamentation' },
  { roll: '1-3', name: 'Of Kindness' },
  { roll: '1-4', name: 'Of Discrimination' },
  { roll: '1-5', name: 'Vulnerable' },
  { roll: '1-6', name: 'Reckless' },
  { roll: '2-1', name: 'Heavy' },
  { roll: '2-2', name: 'Difficult' },
  { roll: '2-3', name: 'Wimp' },
  { roll: '2-4', name: 'Weak' },
  { roll: '2-5', name: 'Sensitive' },
  { roll: '2-6', name: 'Hilarious' },
  { roll: '3-1', name: 'Stuttering' },
  { roll: '3-2', name: 'Proxy' },
  { roll: '3-3', name: 'No Charities' },
  { roll: '3-4', name: 'Near Death' },
  { roll: '3-5', name: 'Stylish' },
  { roll: '3-6', name: 'Mana Draining' },
  { roll: '4-1', name: 'Slow' },
  { roll: '4-2', name: 'Undefined' },
  { roll: '4-3', name: 'Of Confusion' },
  { roll: '4-4', name: 'Foot Tangling' },
  { roll: '4-5', name: 'Slippery' },
  { roll: '4-6', name: 'Stinking' },
  { roll: '5-1', name: 'Disgusting' },
  { roll: '5-2', name: 'Buzzing' },
  { roll: '5-3', name: 'Soggy' },
  { roll: '5-4', name: 'Of Old Wounds' },
  { roll: '5-5', name: 'Dazzling' },
  { roll: '5-6', name: 'Fameless' },
  { roll: '6-1', name: 'Honest' },
  { roll: '6-2', name: 'Motion Sick' },
  { roll: '6-3', name: 'Hater of Nature' },
  { roll: '6-4', name: "Can't Wait" },
  { roll: '6-5', name: 'Clinging' },
  { roll: '6-6', name: 'Gullible' },
];

export function getAbyssCurse(roll: string): AbyssCurseDefinition | undefined {
  return ABYSS_CURSES.find((curse) => curse.roll === roll);
}

/** Two per item is the hard limit; past that the guild can only re-roll the curses. */
export const MAX_ABYSS_ENHANCEMENTS = 2;

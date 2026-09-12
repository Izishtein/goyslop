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

/**
 * Abyss Skills and their Additional Abyss Curse table — Abyss Breaker pp. 38-46, transcribed
 * in docs/sheet-content/31-abyss-skills.md. A named Abyss Skill replaces a typical
 * enhancement one-for-one (same procedure, same Gamel/Shard cost) but must draw its curse
 * from this second table instead of the base one above — see `AbyssEnhancementSchema.kind`.
 */
export const WEAPON_ABYSS_SKILLS = [
  'Crimson Breath',
  'Arrow of Darkness',
  'Afterimage Flash',
  'Free Flying Tentacles',
  'Extending Tail',
  'Poisonous Blade',
] as const;

export const ARMOR_ABYSS_SKILLS = ['Daemonic Shell', 'Translucent Armor', 'Mobile Form'] as const;

export const SHIELD_ABYSS_SKILLS = ['Daemonic Stare', 'Daemonic Droplets', 'Phantom of a Lovely Figure'] as const;

export function abyssSkillsFor(target: AbyssTarget): readonly string[] {
  if (target === 'weapon') return WEAPON_ABYSS_SKILLS;
  if (target === 'armor') return ARMOR_ABYSS_SKILLS;
  return SHIELD_ABYSS_SKILLS;
}

/**
 * The Additional Abyss Curse table (Abyss Breaker p. 43), used only when the enhancement is
 * an Abyss Skill. "Choking" appears twice (1-4 and 3-5) with two different effects — the book
 * reuses the name, not a transcription error (kept as two separate rows, same as the base
 * table's own duplicate-safe shape: rows are addressed by `roll`, never by `name`).
 */
export const ADDITIONAL_ABYSS_CURSES: AbyssCurseDefinition[] = [
  { roll: '1-1', name: 'Of Decay' },
  { roll: '1-2', name: 'Slothful' },
  { roll: '1-3', name: 'Panicked' },
  { roll: '1-4', name: 'Choking' },
  { roll: '1-5', name: 'Wasteful' },
  { roll: '1-6', name: 'Hungry' },
  { roll: '2-1', name: 'Persistent Fatigue' },
  { roll: '2-2', name: 'Resistant to Medicines' },
  { roll: '2-3', name: "Scavenger's" },
  // Only meaningful with Magus Arts' Stratagems in play — the book itself says to reroll
  // this (and 3-5, 3-6 below) if Magus Arts isn't in use. Transcribed as printed regardless;
  // the sheet doesn't know which supplements a table is using.
  { roll: '2-4', name: 'Of Disobey' },
  { roll: '2-5', name: 'Take a Break' },
  { roll: '2-6', name: 'Show Composure' },
  { roll: '3-1', name: 'Short of Breath' },
  { roll: '3-2', name: 'Tone-deaf' },
  { roll: '3-3', name: 'Not Fully Trustworthy' },
  { roll: '3-4', name: 'Slipping Through Fingers' },
  { roll: '3-5', name: 'Choking' },
  { roll: '3-6', name: 'Heaven and Earth in Turmoil' },
  { roll: '4-1', name: 'Mocking' },
  { roll: '4-2', name: 'Not learning' },
  { roll: '4-3', name: 'Perfectionist' },
  { roll: '4-4', name: 'Dislikes Ostentation' },
  { roll: '4-5', name: 'Comatose' },
  { roll: '4-6', name: 'Branded' },
  { roll: '5-1', name: 'Distracted' },
  { roll: '5-2', name: 'Life Drain' },
  { roll: '5-3', name: 'Mana Drain' },
  { roll: '5-4', name: 'Show Off' },
  { roll: '5-5', name: 'Unable to Hold Ground' },
  { roll: '5-6', name: 'Exposing' },
  { roll: '6-1', name: 'Torment' },
  { roll: '6-2', name: 'Affection' },
  { roll: '6-3', name: 'Mana Leakage' },
  { roll: '6-4', name: 'Eager to Retreat' },
  { roll: '6-5', name: 'Go Easy' },
  { roll: '6-6', name: 'In Bad Shape' },
];

export function getAdditionalAbyssCurse(roll: string): AbyssCurseDefinition | undefined {
  return ADDITIONAL_ABYSS_CURSES.find((curse) => curse.roll === roll);
}

/** Daemonization threshold for `Character.abyssCorruptionLevel` (Abyss Breaker p. 44): at 5
 *  the book takes the character away from the player entirely, GM treats them as an NPC. */
export const ABYSS_CORRUPTION_DAEMONIZATION_LEVEL = 5;

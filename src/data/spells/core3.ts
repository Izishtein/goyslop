import { makeSpell, SPIRITUALISM, TRUESPEECH, type SpellDefinition } from './types';

const CORE3 = 'Core Rulebook III';
const MAGUS_ARTS = 'Magus Arts';

const spell = (school: string, circle: number, name: string, mp: number) =>
  makeSpell(CORE3, school, circle, name, mp);

/**
 * Circles 11-15 — Core Rulebook III Part 3 "Data": Truespeech pp. 133-137, Spiritualism
 * pp. 138-142. Magus Arts pp. 78-93 reprints both schools as one 1-15 list and agrees with
 * Core III name for name and cost for cost, so the two books cross-check each other.
 *
 * How the circles were established, since the books never print them as text: the level
 * band above each column is a graphic, but the Russian digest in files/ prints levels as
 * text without English names, and both sources print MP. Walking the book's printed order
 * and consuming the digest's per-level costs settles the circle of every spell. The method
 * verifies itself on circles 1-10, which this catalog already carries from Core I/II: all
 * 39 Truespeech and 37 Spiritualism entries came back with the circle we already had.
 *
 * Divine, Magitech, Fairy Magic and the extra Spellsongs of the same Part 3 are not here
 * yet — their sections need more work on the extraction (roadmap § 1.0).
 */
export const CORE3_SPELLS: SpellDefinition[] = [
  // --- Truespeech Magic (Sorcerer), pp. 133-137 ---
  spell(TRUESPEECH, 11, 'Thunder Bolt', 13),
  spell(TRUESPEECH, 11, 'Slow', 8),
  spell(TRUESPEECH, 11, 'Familiar II', 30),
  spell(TRUESPEECH, 12, 'Shining Spot', 16),
  spell(TRUESPEECH, 12, 'Shock', 15),
  spell(TRUESPEECH, 12, 'Become Dragon', 20),
  spell(TRUESPEECH, 13, 'Desultory', 9),
  spell(TRUESPEECH, 13, 'Teleport', 15),
  spell(TRUESPEECH, 13, 'Lightning Bind', 15),
  spell(TRUESPEECH, 14, 'Dimension Gate', 23),
  spell(TRUESPEECH, 14, 'Dimension Sword', 18),
  spell(TRUESPEECH, 14, 'Magic Reflection', 17),
  spell(TRUESPEECH, 15, 'Save The World', 50),
  spell(TRUESPEECH, 15, 'Perfect Cancellation', 33),
  spell(TRUESPEECH, 15, 'Meteor Strike', 30),

  // --- Spiritualism Magic (Conjurer), pp. 138-142 ---
  spell(SPIRITUALISM, 11, 'Earth Heal II', 8),
  spell(SPIRITUALISM, 11, 'Sneak', 7),
  spell(SPIRITUALISM, 11, 'Haste', 18),
  spell(SPIRITUALISM, 12, 'Change Position', 12),
  spell(SPIRITUALISM, 12, 'Sonic Weapon', 8),
  spell(SPIRITUALISM, 12, 'Mana Seal', 16),
  spell(SPIRITUALISM, 13, 'Raging Earth II', 18),
  spell(SPIRITUALISM, 13, 'Wraith Form', 20),
  spell(SPIRITUALISM, 14, 'Copy Doll', 20),
  spell(SPIRITUALISM, 14, 'Steal Memory', 19),
  spell(SPIRITUALISM, 15, 'Quick Resurrection', 30),
  spell(SPIRITUALISM, 15, 'Death Cloud', 26),
  spell(SPIRITUALISM, 15, 'Revenant Curse', 30),

  /**
   * Not a circle 11-15 spell and not from Core III: Magus Arts' complete Spiritualism list
   * prints it at circle 9, and the digest agrees, but it is missing from our Core I/II
   * transcription — the one gap the whole cross-check turned up below circle 11.
   */
  makeSpell(MAGUS_ARTS, SPIRITUALISM, 9, 'Possession', 7),
];

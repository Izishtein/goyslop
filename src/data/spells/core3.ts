import { DIVINE, MAGITECH, makeSpell, SPIRITUALISM, TRUESPEECH, type SpellDefinition } from './types';

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
 * Divine and Magitech circles 11-15 (below) turned out not to need that multiset trick at
 * all: both the Russian digests and the rendered page images show the circle directly (a
 * small badge icon per spell, not a page-wide banner), so those were read straight off the
 * image once the text-layer names/MP were extracted — see docs/sheet-content/24-divine-magic-11-15.md
 * and 25-magitech-11-15.md for the full method and pitfalls of each.
 *
 * Fairy Magic and the extra Spellsongs of the same Part 3 are not here yet — Fairy Magic
 * lives in fairy.ts instead (docs/sheet-content/26-fairy-magic-complete.md); the extra
 * Spellsongs/Finales remain open (roadmap § 1.0).
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

  /**
   * Divine Magic (Priest), pp. 143-154 — docs/sheet-content/24-divine-magic-11-15.md.
   * Base spells marked "†" in the Russian digest (usable by Priests of First or Third Sword
   * gods, i.e. all 13 deities this catalog already has) are included; "‡"-only (Second Sword)
   * spells are deliberately excluded, along with the Second/Third Sword pantheons themselves —
   * out of scope for this pass, see the doc's "Итог" for the excluded list.
   */
  spell(DIVINE, 11, 'Bless II', 12),
  spell(DIVINE, 11, 'Holy Light II', 9),
  spell(DIVINE, 11, 'Surrender', 13),
  spell(DIVINE, 12, 'Escape', 3),
  spell(DIVINE, 12, 'Rescue', 17),
  spell(DIVINE, 12, 'Sacred Field', 20),
  spell(DIVINE, 13, 'Cure Mortality', 10),
  spell(DIVINE, 13, 'Oracle', 14),
  spell(DIVINE, 13, 'Erase Soulscar', 50),
  spell(DIVINE, 14, 'Purify Soul', 20),
  spell(DIVINE, 14, 'Reincarnation', 30),
  spell(DIVINE, 14, 'Holy War', 40),
  makeSpell(CORE3, DIVINE, 15, 'Call God', 50, { mpVariable: true }),
  spell(DIVINE, 15, 'Restoration', 18),

  // Specialized Divine — one new spell per deity, all at circle 13 (the ladder for
  // specializations stops there: 2 -> 4 -> 7 -> 10 -> 13, confirmed by both digests).
  makeSpell(CORE3, DIVINE, 13, 'Promise Circle', 10, { deity: 'Lyphos' }),
  makeSpell(CORE3, DIVINE, 13, 'Evangel', 20, { deity: 'Tidan' }),
  makeSpell(CORE3, DIVINE, 13, 'Completion', 10, { deity: 'Kilhia' }),
  makeSpell(CORE3, DIVINE, 13, 'Wishing Star', 20, { deity: 'Sien' }),
  makeSpell(CORE3, DIVINE, 13, 'Hyper Acceleration', 22, { deity: 'Mirtabar' }),
  makeSpell(CORE3, DIVINE, 13, 'Daemon Buster', 14, { deity: 'Eve' }),
  makeSpell(CORE3, DIVINE, 13, 'Rescue from Shallow Abyss', 20, { deity: 'Harula' }),
  makeSpell(CORE3, DIVINE, 13, 'Cyclone', 18, { deity: 'Furusil' }),
  makeSpell(CORE3, DIVINE, 13, 'Panic', 15, { deity: 'Asteria' }),
  makeSpell(CORE3, DIVINE, 13, 'Offensive Fire', 20, { deity: 'Grendal' }),
  makeSpell(CORE3, DIVINE, 13, 'Holy Tree', 16, { deity: 'Dalion' }),
  makeSpell(CORE3, DIVINE, 13, 'Scapegoat', 30, { deity: 'Miritsa' }),
  makeSpell(CORE3, DIVINE, 13, 'Control Train', 15, { deity: 'Strasford' }),

  /**
   * Magitech (Artificer), pp. 155-160 — docs/sheet-content/25-magitech-11-15.md. Circle here
   * is a small per-spell badge, not a page banner (like Fairy Magic, unlike the "big four"
   * schools), and reads directly off the rendered page rather than needing the digest-multiset
   * method. Automobile II (circle 7) is a real gap the same page range turned up below circle
   * 11 — included here for the same reason Possession was added above for Spiritualism. The
   * digest carries 4 more circle 11-15 entries than Core III actually prints here (and 16 more
   * across circles 1-10 on top of the 37 already catalogued) — traced to Magus Arts pp. 101-134
   * mixing its own Magitech additions into the same practical digest, not a missed extraction;
   * out of scope for this pass, see the doc's "Грабли" section.
   */
  makeSpell(CORE3, MAGITECH, 7, 'Automobile II', 15, { magisphere: 'Large' }),
  makeSpell(CORE3, MAGITECH, 11, 'Skybike', 20, { magisphere: 'Large' }),
  makeSpell(CORE3, MAGITECH, 11, 'Sniper Range', 5, { magisphere: 'Small/Medium/Large' }),
  makeSpell(CORE3, MAGITECH, 11, 'Panacea Light', 10, { magisphere: 'Medium' }),
  makeSpell(CORE3, MAGITECH, 11, 'Prism Effect', 10, { magisphere: 'Small' }),
  makeSpell(CORE3, MAGITECH, 12, 'Cannon Bullet', 6, { magisphere: 'Medium' }),
  makeSpell(CORE3, MAGITECH, 12, 'Sphere Shed', 10, { magisphere: 'Large' }),
  makeSpell(CORE3, MAGITECH, 12, 'Chaff Grenade', 9, { magisphere: 'Medium' }),
  makeSpell(CORE3, MAGITECH, 13, 'Shower of Healing Bullets', 6, { magisphere: 'Medium' }),
  makeSpell(CORE3, MAGITECH, 13, 'Effect Protector', 15, { magisphere: 'Large' }),
  makeSpell(CORE3, MAGITECH, 13, 'Return', 18, { magisphere: 'Large' }),
  makeSpell(CORE3, MAGITECH, 14, 'Minimum Leap', 15, { magisphere: 'Medium' }),
  makeSpell(CORE3, MAGITECH, 14, 'Machine Repair', 40, { magisphere: 'Large (1-3)' }),
  makeSpell(CORE3, MAGITECH, 14, 'Mana House', 15, { magisphere: 'Large' }),
  makeSpell(CORE3, MAGITECH, 15, 'Genocide Bullet', 10, { magisphere: 'Medium' }),
  makeSpell(CORE3, MAGITECH, 15, 'Supernova Bomb', 24, { magisphere: 'Medium' }),
  makeSpell(CORE3, MAGITECH, 15, 'Skyship', 40, { magisphere: 'Large (5)' }),
];

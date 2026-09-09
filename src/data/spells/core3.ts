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
   * Base spells marked "†" (usable by Priests of First or Third Sword gods) are here; the
   * "‡"-only (Second Sword) base spells and the Second/Third Sword pantheons themselves were
   * deliberately excluded from that pass as out of scope — both are now closed further down
   * this file, see docs/sheet-content/28-divine-first-third-sword.md and
   * 29-divine-second-sword-and-magitech-delta.md.
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
   * Specialized Divine — six more deities of the First and Third Sword, added by Magus Arts
   * pp. 109-119 (docs/sheet-content/28-divine-first-third-sword.md). Five were the pass's own
   * target (Myles, Aurmata, Sadur — 1st Sword; Paro, Adeni — 3rd Sword); Gamel turned up as a
   * sixth, unplanned gap — the task described him as one of the thirteen gods above, but he
   * was never actually in the catalog. All six carry the same 2/4/7/10/13 ladder as the
   * thirteen above; Magus Arts reprints those thirteen unchanged (cross-checked, zero diffs).
   */
  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Dexterous Fingers', 2, { deity: 'Myles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Delicious Satisfaction', 4, { deity: 'Myles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Enticing Aroma', 5, { deity: 'Myles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Adiposity', 8, { deity: 'Myles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Cornucopia', 18, { deity: 'Myles' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Machina Greaves', 3, { deity: 'Aurmata' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Machina Armor', 6, { deity: 'Aurmata' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Machina Wings', 7, { deity: 'Aurmata' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Machina Hammer', 11, { deity: 'Aurmata' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Machina Cannon', 18, { deity: 'Aurmata' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Long Strider', 4, { deity: 'Sadur' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Hidden Stranger', 5, { deity: 'Sadur' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Air Walk', 6, { deity: 'Sadur' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Detect Enemy', 7, { deity: 'Sadur' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Emergency Arrival', 28, { deity: 'Sadur' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Far Command', 2, { deity: 'Paro' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Pigeon Form', 10, { deity: 'Paro' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Mental Healing', 6, { deity: 'Paro' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Contact Portal', 5, { deity: 'Paro' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Flexible Command', 8, { deity: 'Paro' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Clean Clothes', 3, { deity: 'Adeni' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Resistant Clothes', 6, { deity: 'Adeni' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Mother Cloak', 9, { deity: 'Adeni' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Sacred Bandage', 7, { deity: 'Adeni' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Sterile Tent', 25, { deity: 'Adeni' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Detect True Coin', 2, { deity: 'Gamel' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Fair Price', 4, { deity: 'Gamel' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Guard Trading', 8, { deity: 'Gamel' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Lucky Coin', 6, { deity: 'Gamel' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Life Insurance', 7, { deity: 'Gamel' }),

  /**
   * Second Sword pantheon — deliberately excluded from the pass above ("out of scope"), now
   * closed by docs/sheet-content/29-divine-second-sword-and-magitech-delta.md. Three basic
   * spells a Second Sword priest casts instead of their First/Third Sword equivalent (Core
   * III pp. 323-326: Resignation replaces Surrender, Vice Field replaces Sacred Field,
   * Instant Soulscar replaces Erase Soulscar — see the "‡" spells excluded from the base list
   * above), plus the full 2/4/7/10/13 ladder for all eight Second Sword deities. Four of the
   * eight (Dalkhrem, Eiryak, Zeides, Laris) already had their circle-13 spell known from that
   * same Core III excerpt without a confirmed circle; Magus Arts pp. 120-124 supplies the
   * rest of their ladder and confirms circle 13. The catalog carries no "which sword a
   * character's faith follows" field — these simply appear as additional circle-11/12/13
   * options alongside their First/Third Sword counterparts, same as any other alternate.
   */
  spell(DIVINE, 11, 'Resignation', 13),
  spell(DIVINE, 12, 'Vice Field', 20),
  spell(DIVINE, 13, 'Instant Soulscar', 20),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'War Cry', 6, { deity: 'Dalkhrem' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Frenzy', 8, { deity: 'Dalkhrem' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Berserk', 8, { deity: 'Dalkhrem' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Troops of Ignis', 20, { deity: 'Dalkhrem' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Fatal Explosion', 22, { deity: 'Dalkhrem' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Wave Riding', 2, { deity: 'Eiryak' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Deep Block', 5, { deity: 'Eiryak' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Water Hammer', 8, { deity: 'Eiryak' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Water Binding', 10, { deity: 'Eiryak' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Water Bridge', 25, { deity: 'Eiryak' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Hide in a Shadow', 4, { deity: 'Zeides' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Vampiric Weapon', 4, { deity: 'Zeides' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Sunshade', 6, { deity: 'Zeides' }),
  // The book prints a fixed MP plus a fixed HP cost, not a per-target multiplier — stored as
  // the flat MP (10) since mpVariable means "base + open-ended extra", not this shape.
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Spirit Domination', 10, { deity: 'Zeides' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Ultimate Being', 13, { deity: 'Zeides' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Mana Sink', 5, { deity: 'Laris' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Deafness', 4, { deity: 'Laris' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Summon Aetherbeast', 6, { deity: 'Laris' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Summon Insects', 10, { deity: 'Laris' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Call Daemon', 20, { deity: 'Laris' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Accurate Hits', 4, { deity: 'Nivaceps' }),
  // Same name, same MP and circle as Zeides' spell above — the book gives two gods an
  // identical spell on purpose (confirmed by rendered pages showing matching effect text on
  // both, not a transcription duplicate); kept as two separate entries, one per deity, with
  // an explicit id override since the default name-derived id would otherwise collide.
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Vampiric Weapon', 4, { deity: 'Nivaceps', id: 'vampiric-weapon-nivaceps' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Discriminate', 7, { deity: 'Nivaceps' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Blood Bath', 15, { deity: 'Nivaceps' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Dominating Might', 10, { deity: 'Nivaceps' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Technical Trap', 4, { deity: 'Gurvazo' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Completed Trap', 4, { deity: 'Gurvazo' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Goof Adventurer', 15, { deity: 'Gurvazo' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Revenge Trigger', 8, { deity: 'Gurvazo' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Critical Preparation', 20, { deity: 'Gurvazo' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Weather Forecast', 3, { deity: 'Zoras-Valles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Fall Lightning', 4, { deity: 'Zoras-Valles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Presage Disaster', 4, { deity: 'Zoras-Valles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Confusing Fog', 8, { deity: 'Zoras-Valles' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Phantom Flood', 22, { deity: 'Zoras-Valles' }),

  makeSpell(MAGUS_ARTS, DIVINE, 2, 'Change Fraud', 3, { deity: 'Meigal' }),
  makeSpell(MAGUS_ARTS, DIVINE, 4, 'Hide Value', 3, { deity: 'Meigal' }),
  makeSpell(MAGUS_ARTS, DIVINE, 7, 'Gain Trust', 8, { deity: 'Meigal' }),
  makeSpell(MAGUS_ARTS, DIVINE, 10, 'Money Distraction', 8, { deity: 'Meigal' }),
  makeSpell(MAGUS_ARTS, DIVINE, 13, 'Fake Gamel', 10, { deity: 'Meigal' }),

  /**
   * Magitech (Artificer), pp. 155-160 — docs/sheet-content/25-magitech-11-15.md. Circle here
   * is a small per-spell badge, not a page banner (like Fairy Magic, unlike the "big four"
   * schools), and reads directly off the rendered page rather than needing the digest-multiset
   * method. Automobile II (circle 7) is a real gap the same page range turned up below circle
   * 11 — included here for the same reason Possession was added above for Spiritualism.
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

  /**
   * Magitech, pp. 127-134 — docs/sheet-content/29-divine-second-sword-and-magitech-delta.md.
   * Magus Arts p. 125 states its own count directly ("19 new spells have been added to the
   * book"), which is exactly what's left after subtracting the 54 entries already above from
   * its full 73-entry list — the gap this file's own comment used to flag as unresolved. This
   * book prints a full-width "Nth Level Magitech Spells" banner per circle (unlike Core III's
   * per-spell badge only), so no rendered-page reading was needed for most of these; five
   * that sat on a banner boundary (Hybrid, Manapoly, Auto Guard II, Double Up, Photonic
   * Barrier) were still confirmed against the badge/banner on the rendered page.
   */
  makeSpell(MAGUS_ARTS, MAGITECH, 1, 'Signal Bullet', 1, { magisphere: 'Small' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 1, 'Sound Bomb', 2, { magisphere: 'Small' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 2, 'Sound Recorder', 5, { magisphere: 'Small/Medium/Large' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 2, 'Shadow Body', 3, { magisphere: 'Small' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 3, 'Tear Gas Bullet', 3, { magisphere: 'Small' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 3, 'Glue Bomb', 5, { magisphere: 'Small' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 4, 'Auto Guard', 5, { magisphere: 'Medium' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 5, 'Unchained Bomb', 8, { magisphere: 'Medium' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 5, 'Life Signal', 5, { magisphere: 'Small' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 6, 'Weakness', 6, { magisphere: 'Medium' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 7, 'Timer Clock', 1, { magisphere: 'Small' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 8, 'Pile Shooter', 6, { magisphere: 'Medium' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 9, 'Hybrid', 8, { magisphere: 'Medium' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 9, 'Telegraph', 3, { magisphere: 'Small/Medium/Large' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 10, 'Manapoly', 10, { magisphere: 'Large' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 12, 'Auto Guard II', 8, { magisphere: 'Medium' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 13, 'Double Up', 12, { magisphere: 'Medium' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 14, 'Omega Shooter', 16, { magisphere: 'Large' }),
  makeSpell(MAGUS_ARTS, MAGITECH, 15, 'Photonic Barrier', 16, { magisphere: 'Large' }),
];

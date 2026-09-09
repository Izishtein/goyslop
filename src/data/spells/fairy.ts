import { FAIRY, makeSpell, type SpellDefinition } from './types';

const CORE2 = 'Core Rulebook II';
const CORE3 = 'Core Rulebook III';
const MAGUS_ARTS = 'Magus Arts';

const spell = (circle: number, name: string, mp: number | undefined, fairyType: string, sourceBook: string = CORE2) =>
  makeSpell(sourceBook, FAIRY, circle, name, mp, { fairyType });

/**
 * Fairy Magic, complete: docs/sheet-content/11-fairy-magic.md (circles 1-10, six elemental
 * types) plus docs/sheet-content/26-fairy-magic-complete.md (MP for those, the Basic type,
 * circles 11-15, and Special Fairy Magic). Core III pp. 161-172 reprints the same circle
 * 1-15 lists as Magus Arts pp. 138-150 name-for-name and MP-for-MP (confirmed in the latter
 * doc) — Core III is the source used below, Magus Arts only cross-checked it.
 */
export const FAIRY_SPELLS: SpellDefinition[] = [
  // --- Earth ---
  spell(1, 'Snare', 3, 'Earth'),
  spell(2, 'Stone Guard', 4, 'Earth'),
  spell(3, 'Earth Hammer', 3, 'Earth'),
  spell(4, 'Pebble Shot', 4, 'Earth'),
  spell(5, 'Entrapment', 5, 'Earth'),
  spell(6, 'Stone Blast', 6, 'Earth'),
  spell(7, 'Great Snare', 7, 'Earth'),
  spell(8, 'Stone Wall', 6, 'Earth'),
  spell(9, 'Gold Bridge', 4, 'Earth'),
  spell(10, 'Tunnel', 8, 'Earth'),
  spell(11, 'Ring Protection', 12, 'Earth', CORE3),
  spell(12, 'Crack', 9, 'Earth', CORE3),
  spell(13, 'Giant Kick', 16, 'Earth', CORE3),
  spell(14, 'Great Capture', 9, 'Earth', CORE3),
  spell(15, 'Earthquake', 28, 'Earth', CORE3),

  // --- Water/Ice ---
  spell(1, 'Purification', 2, 'Water/Ice'),
  spell(2, 'Water Screen', 3, 'Water/Ice'),
  spell(3, 'Ice Bolt', 4, 'Water/Ice'),
  spell(4, 'Seabed Walk', 4, 'Water/Ice'),
  spell(5, 'Hard Water', 5, 'Water/Ice'),
  spell(6, 'Mist Hide', 4, 'Water/Ice'),
  spell(7, 'Chill Rain', 8, 'Water/Ice'),
  spell(8, 'Sink', 6, 'Water/Ice'),
  spell(9, 'Ice Wall', 9, 'Water/Ice'),
  spell(10, 'Ice Coffin', 8, 'Water/Ice'),
  spell(11, 'Water Edge', 8, 'Water/Ice', CORE3),
  spell(12, 'Current', 24, 'Water/Ice', CORE3),
  spell(13, 'Ice Storm', 12, 'Water/Ice', CORE3),
  spell(14, 'Freeze', 12, 'Water/Ice', CORE3),
  spell(15, 'Maelstrom', 15, 'Water/Ice', CORE3),

  // --- Fire ---
  spell(1, 'Tinder', 2, 'Fire'),
  spell(2, 'Fire Bolt', 3, 'Fire'),
  spell(3, 'Flare', 4, 'Fire'),
  spell(4, 'Heat Metal', 5, 'Fire'),
  spell(5, 'Flame Arrow', 6, 'Fire'),
  spell(6, 'Fire Blast', 6, 'Fire'),
  spell(7, 'Incineration', 8, 'Fire'),
  spell(8, 'Flame Coat', 7, 'Fire'),
  spell(9, 'Fire Wall', 10, 'Fire'),
  spell(10, 'Firestorm', 13, 'Fire'),
  spell(11, 'Fire Javelin', 9, 'Fire', CORE3),
  spell(12, 'Fire Break', 19, 'Fire', CORE3),
  spell(13, 'Flame Geyser', 23, 'Fire', CORE3),
  spell(14, 'Fire Mauler', 16, 'Fire', CORE3),
  spell(15, 'Fireport', 12, 'Fire', CORE3),

  // --- Wind ---
  spell(1, 'Wind Voice', 2, 'Wind'),
  spell(2, 'Wind Guard', 3, 'Wind'),
  spell(3, 'Windcutter', 4, 'Wind'),
  spell(4, 'Hovering', 5, 'Wind'),
  spell(5, 'Silent Move', 6, 'Wind'),
  spell(6, 'Secret Voice', 2, 'Wind'),
  spell(7, 'Shoot Arrow', 6, 'Wind'),
  spell(8, 'Missile Protection', 5, 'Wind'),
  spell(9, 'Sound Pocket', 6, 'Wind'),
  spell(10, 'Air Walking', 5, 'Wind'),
  spell(11, 'Down Burst', 14, 'Wind', CORE3),
  spell(12, 'Windstorm', 9, 'Wind', CORE3),
  spell(13, 'Whirlwind', 8, 'Wind', CORE3),
  spell(14, 'Twister', 12, 'Wind', CORE3),
  spell(15, 'Tornado', 13, 'Wind', CORE3),

  // --- Light ---
  spell(1, 'Healing Water', 3, 'Light'),
  spell(2, 'Whisper Heal', 4, 'Light'),
  spell(3, 'Basic Healing', 5, 'Light'),
  spell(4, 'Virtual Toughness', 4, 'Light'),
  spell(5, 'Nursing', 6, 'Light'),
  spell(6, 'Advanced Healing', 7, 'Light'),
  spell(7, 'Life Support', 6, 'Light'),
  spell(8, 'Extended Healing', 9, 'Light'),
  spell(9, 'Vital Force', 4, 'Light'),
  spell(10, 'Rich Heal', 8, 'Light'),
  spell(11, 'Restore Health', 6, 'Light', CORE3),
  spell(12, 'Invisibility', 16, 'Light', CORE3),
  spell(13, 'Virtual Toughness II', 9, 'Light', CORE3),
  spell(14, 'Regeneration', 21, 'Light', CORE3),
  spell(15, 'Ultimate Healing', 15, 'Light', CORE3),

  // --- Dark ---
  spell(1, 'Calm', 2, 'Dark'),
  spell(2, 'Distraction', 3, 'Dark'),
  spell(3, 'Stun', 4, 'Dark'),
  spell(4, 'Panic Run', 4, 'Dark'),
  spell(5, 'Mind Blank', 6, 'Dark'),
  spell(6, 'Brave Heart', 5, 'Dark'),
  spell(7, 'Mind Link', 9, 'Dark'),
  spell(8, 'Shocking Wave', 22, 'Dark'),
  spell(9, 'Insanity', 9, 'Dark'),
  spell(10, 'Masking', 12, 'Dark'),
  spell(11, 'Evil Dream', 15, 'Dark', CORE3),
  spell(12, 'Total Sanity', 8, 'Dark', CORE3),
  spell(13, 'Forget', 16, 'Dark', CORE3),
  // Core III's own text and rendered page both say MP14; an independently laid-out Magus
  // Arts card (text and render) says MP15, and the Russian digest agrees with Magus Arts —
  // 2 sources against 1. Core III is kept as the source used throughout this file (see the
  // top comment), so MP14 stands; the disagreement is recorded here rather than picked
  // silently, per this project's rule for cross-book conflicts.
  spell(14, 'Mindread', 14, 'Dark', CORE3),
  spell(15, 'Mind Crush', 13, 'Dark', CORE3),

  // --- Basic (usable regardless of which elemental type(s) are picked for the day) ---
  spell(1, 'Fairy Wish', 1, 'Basic'),
  spell(2, 'Summon Fairy', 6, 'Basic'),
  spell(3, 'Handle Fairy', 3, 'Basic'),
  spell(4, 'Summon Fairy II', 10, 'Basic'),
  spell(5, 'Fairy Support', 4, 'Basic'),
  // The digest gives MP15, but both Core II and Magus Arts (independently) print MP14 — book
  // wins per this project's cross-source rule, digest typo noted here rather than trusted.
  spell(6, 'Summon Fairy III', 14, 'Basic'),
  spell(7, 'Fairy Wish II', 2, 'Basic'),
  spell(8, 'Summon Fairy IV', 18, 'Basic'),
  makeSpell(CORE2, FAIRY, 9, 'Mitigate Fairy', 1, { fairyType: 'Basic', mpVariable: true }),
  spell(10, 'Summon Fairy V', 22, 'Basic'),
  makeSpell(CORE3, FAIRY, 11, 'Avoid Fairy', 1, { fairyType: 'Basic', mpVariable: true }),
  spell(12, 'Summon Fairy VI', 26, 'Basic', CORE3),
  spell(13, 'Neutralize', 44, 'Basic', CORE3),
  spell(14, 'Summon Fairy VII', 30, 'Basic', CORE3),
  spell(15, 'Fairy Lord', 51, 'Basic', CORE3),

  // --- Special Fairy Magic (Magus Arts p. 151 only, not in Core III) ---
  // Its own Rank 1-5 track, unrelated to the Basic/Typed circle numbering above; Rank is
  // stored in the `circle` field for lack of a dedicated one — SpellDefinition has no
  // separate "rank" concept, and this is the only place in the catalog that needs one.
  spell(1, 'Chaos Shot', 6, 'Special', MAGUS_ARTS),
  spell(2, 'Chaos Blast', 8, 'Special', MAGUS_ARTS),
  spell(3, 'Chaos Bomb', 11, 'Special', MAGUS_ARTS),
  spell(4, 'Chaos Smash', 18, 'Special', MAGUS_ARTS),
  spell(5, 'Chaos Explosion', 26, 'Special', MAGUS_ARTS),
];

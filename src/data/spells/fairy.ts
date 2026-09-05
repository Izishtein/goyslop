import { FAIRY, makeSpell, type SpellDefinition } from './types';

const CORE2 = 'Core Rulebook II';

const spell = (circle: number, name: string, fairyType: string) =>
  makeSpell(CORE2, FAIRY, circle, name, undefined, { fairyType });

/**
 * Fairy Magic, Core Rulebook II pp. 160-181 (docs/sheet-content/11-fairy-magic.md).
 *
 * Six elemental types of ten spells each; a Fairy Tamer picks four types per day. The
 * Basic type is missing on purpose — the research doc flags its spell names as needing
 * verification against the PDF, so guessing them here would put unsourced data on a sheet.
 * MP costs are not printed in the source tables either, so the player fills them in.
 */
export const FAIRY_SPELLS: SpellDefinition[] = [
  // --- Earth ---
  spell(1, 'Snare', 'Earth'),
  spell(2, 'Stone Guard', 'Earth'),
  spell(3, 'Earth Hammer', 'Earth'),
  spell(4, 'Pebble Shot', 'Earth'),
  spell(5, 'Entrapment', 'Earth'),
  spell(6, 'Stone Blast', 'Earth'),
  spell(7, 'Great Snare', 'Earth'),
  spell(8, 'Stone Wall', 'Earth'),
  spell(9, 'Gold Bridge', 'Earth'),
  spell(10, 'Tunnel', 'Earth'),

  // --- Water/Ice ---
  spell(1, 'Purification', 'Water/Ice'),
  spell(2, 'Water Screen', 'Water/Ice'),
  spell(3, 'Ice Bolt', 'Water/Ice'),
  spell(4, 'Seabed Walk', 'Water/Ice'),
  spell(5, 'Hard Water', 'Water/Ice'),
  spell(6, 'Mist Hide', 'Water/Ice'),
  spell(7, 'Chill Rain', 'Water/Ice'),
  spell(8, 'Sink', 'Water/Ice'),
  spell(9, 'Ice Wall', 'Water/Ice'),
  spell(10, 'Ice Coffin', 'Water/Ice'),

  // --- Fire ---
  spell(1, 'Tinder', 'Fire'),
  spell(2, 'Fire Bolt', 'Fire'),
  spell(3, 'Flare', 'Fire'),
  spell(4, 'Heat Metal', 'Fire'),
  spell(5, 'Flame Arrow', 'Fire'),
  spell(6, 'Fire Blast', 'Fire'),
  spell(7, 'Incineration', 'Fire'),
  spell(8, 'Flame Coat', 'Fire'),
  spell(9, 'Fire Wall', 'Fire'),
  spell(10, 'Firestorm', 'Fire'),

  // --- Wind ---
  spell(1, 'Wind Voice', 'Wind'),
  spell(2, 'Wind Guard', 'Wind'),
  spell(3, 'Windcutter', 'Wind'),
  spell(4, 'Hovering', 'Wind'),
  spell(5, 'Silent Move', 'Wind'),
  spell(6, 'Secret Voice', 'Wind'),
  spell(7, 'Shoot Arrow', 'Wind'),
  spell(8, 'Missile Protection', 'Wind'),
  spell(9, 'Sound Pocket', 'Wind'),
  spell(10, 'Air Walking', 'Wind'),

  // --- Light ---
  spell(1, 'Healing Water', 'Light'),
  spell(2, 'Whisper Heal', 'Light'),
  spell(3, 'Basic Healing', 'Light'),
  spell(4, 'Virtual Toughness', 'Light'),
  spell(5, 'Nursing', 'Light'),
  spell(6, 'Advanced Healing', 'Light'),
  spell(7, 'Life Support', 'Light'),
  spell(8, 'Extended Healing', 'Light'),
  spell(9, 'Vital Force', 'Light'),
  spell(10, 'Rich Heal', 'Light'),

  // --- Dark ---
  spell(1, 'Calm', 'Dark'),
  spell(2, 'Distraction', 'Dark'),
  spell(3, 'Stun', 'Dark'),
  spell(4, 'Panic Run', 'Dark'),
  spell(5, 'Mind Blank', 'Dark'),
  spell(6, 'Brave Heart', 'Dark'),
  spell(7, 'Mind Link', 'Dark'),
  spell(8, 'Shocking Wave', 'Dark'),
  spell(9, 'Insanity', 'Dark'),
  spell(10, 'Masking', 'Dark'),
];

import { ABYSSAL, makeSpell, type SpellDefinition } from './types';

const AB = 'Abyss Breaker';

const spell = (circle: number, name: string, mp: number | undefined, extra: Partial<SpellDefinition> = {}) =>
  makeSpell(AB, ABYSSAL, circle, name, mp, extra);

/**
 * Abyss Breaker, pp. 20-27 — Abyssal Magic Data, the Abyss Gazer school. Two or three
 * spells per level, and every one of them carries an Enhancement Effect bought with
 * Daemon's Blood or an Abyss Shard; the sheet tracks those materials in the Abyss section,
 * so only the spell itself is catalogued here.
 */
export const ABYSSAL_SPELLS: SpellDefinition[] = [
  spell(1, 'Search Abyss', 1),
  spell(1, 'Spirit Knife', 3),
  spell(1, 'Mental Boost', 1),

  spell(2, 'Take the Lead I', 3),
  spell(2, 'Explore Abyss', 2),
  spell(2, 'Healing Image', 2),

  spell(3, 'Safety Zone', 10),
  spell(3, 'Bad Halation', 3),
  spell(3, 'Pessimism', 4),

  spell(4, 'Observe the Abyss', 4),
  spell(4, 'Phantom Blur', 5),

  spell(5, 'Fast Pain', 2),
  spell(5, 'Invisible Storage', 5),
  spell(5, 'Abyssal Zone', 11),

  spell(6, 'Virtual Friend', 12),
  spell(6, 'Refresh Image', 4),

  spell(7, 'Abyssal Vortex', 10),
  spell(7, 'Send From Abyss', 8),

  spell(8, 'Ideal Costume', 6),
  spell(8, 'Autonomous Shield', 5),

  spell(9, 'Take the Lead II', 9),
  spell(9, 'Miasma Grenade', 9),

  spell(10, 'Immortal Image', 14),
  spell(10, 'Sense Abyss', 10),

  spell(11, 'Abyssal Leap', 20),
  spell(11, 'Slash Image', 9),

  spell(12, 'Abyss Corridor', 16),
  spell(12, 'Abyssal Legion', 14),

  spell(13, 'Abyssal Storm', 18),
  spell(13, 'Instant Abyssal Zone', 22),

  spell(14, 'Infinity Circle', 30),
  spell(14, 'Shallow Preservation', 30),
  spell(14, 'Recall Soul', 20),

  spell(15, 'Execution', 50),
  spell(15, 'Fulfillment', 50),
];

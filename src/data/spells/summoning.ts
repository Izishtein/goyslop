import { makeSpell, SUMMONING, type SpellDefinition } from './types';

const ML = 'Monstrous Lore';

const spell = (circle: number, name: string, mp: number | undefined, extra: Partial<SpellDefinition> = {}) =>
  makeSpell(ML, SUMMONING, circle, name, mp, extra);

/**
 * Monstrous Lore, pp. 40-45 — Summoning Arts Data, the Daemonologist school: three spells
 * per level (four at level 2). The level shows up only as a numbered badge next to each
 * name in the printed page, not in the PDF text layer.
 */
export const SUMMONING_SPELLS: SpellDefinition[] = [
  spell(1, 'Search Daemon', 2),
  spell(1, "Daemon's Arm", 5),
  spell(1, 'Blood Branded', 2),

  spell(2, "Daemon's Dodge", 4),
  spell(2, 'Avenger', 4),
  spell(2, 'Daemons Sense', 4),
  spell(2, 'Daemons Potential', 3),

  spell(3, 'Re-Command', 4),
  spell(3, 'Venom Breath', 8),
  spell(3, 'Barrier Circle', 3),

  spell(4, "Another's Knowledge", 1),
  spell(4, 'Evil Contract', 3),
  spell(4, "Daemon's Tail", 4),

  spell(5, 'Astral Burn', 5),
  spell(5, 'Evil Silhouette', 8),
  // Printed as "MP5 & HP5" — the caster pays 5 HP on top of the MP.
  spell(5, 'Blood Mist', 5),

  spell(6, 'Soul Eater', 1),
  spell(6, 'Daemonic Skin', 8),
  spell(6, 'Mighty Daemon', 6),

  spell(7, 'Dark Soul', 8),
  spell(7, 'Daemons Scream', 6),
  spell(7, 'Splinter', 10),

  spell(8, 'Daemons Tax', 6),
  spell(8, 'Unsummon Gate', 6),
  spell(8, 'Blood Marker', 5),

  spell(9, 'Anti-Magic Barrier', 5),
  spell(9, 'Venom Espada', 9),
  spell(9, "Daemon's Seed", 6),

  spell(10, 'Atrophy', 6),
  spell(10, "Daemon's Hand", 10),
  spell(10, "Daemon's Flight", 10),

  spell(11, 'Deficiency', 4),
  spell(11, 'Leap to Gate', 10),
  spell(11, "Daemon's Blade", 3),

  spell(12, 'Imitating Shadow', 8),
  spell(12, 'Shield Circle', 10),
  spell(12, 'Daemon Swap', 7),

  spell(13, 'Daemons Spread', 8),
  spell(13, 'Soul Drain', 20),
  spell(13, 'Daemons Snap', 16),

  spell(14, 'Burst Gate', 22),
  spell(14, 'Fake Memory', 8),
  spell(14, 'Worthless Magic', 12),

  spell(15, 'Soul Sacrifice', 50),
  spell(15, "Daemon's Legion", 50),
  spell(15, 'Lethal Dimension', 36),
];

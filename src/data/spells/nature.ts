import { makeSpell, NATURE, type SpellDefinition } from './types';

const ML = 'Monstrous Lore';

const spell = (circle: number, name: string, mp: number | undefined, extra: Partial<SpellDefinition> = {}) =>
  makeSpell(ML, NATURE, circle, name, mp, extra);

/**
 * Monstrous Lore, pp. 20-27 — Nature Magic Data, the Druid school: four spells in each of
 * the fifteen levels. Levels are printed as a graphic band above each column, so they come
 * from the rendered pages rather than the PDF text layer.
 */
export const NATURE_SPELLS: SpellDefinition[] = [
  spell(1, 'Wing Flyer', 3),
  spell(1, "Wolf's Bite", 3),
  spell(1, 'Canine Perception', 4),
  spell(1, 'Surrounding Attackers', 2),

  spell(2, 'Water Dweller', 6),
  spell(2, 'Natural Power', 0),
  spell(2, 'Bad Steam', 3),
  spell(2, 'Pigeon Mail', 4),

  spell(3, 'Nature Master', 1),
  spell(3, 'Sharp Attacker', 2),
  spell(3, 'Anaconda Constrictor', 8),
  spell(3, 'Thorn Bash', 5),

  spell(4, 'Big Defender/Dinos', 4),
  spell(4, 'Multiple Actor/Giant Crab', 10),
  spell(4, 'Freezing Breath', 5),
  spell(4, 'Poison Spread', 6),

  spell(5, 'Sharp Eye/Tiger', 5),
  spell(5, 'Stubborn Survivor', 6),
  spell(5, 'Rare Runner', 5),
  spell(5, 'Reproducer/Bloody Petal', 6),

  spell(6, 'Fire Protector', 4),
  spell(6, 'Crimson Fang', 11),
  spell(6, 'Pack Camouflage', 9),
  spell(6, 'Petrovenom', 5),

  spell(7, 'Sharp Eye/Giant Eagle', 6),
  spell(7, 'Fossil Absorber', 6),
  spell(7, 'Kong Smash', 10),
  spell(7, 'Peaceful Nature', 8),

  spell(8, 'Cold Protector', 4),
  spell(8, 'Big Defender/Sea Serpent', 10),
  spell(8, 'Eagle Vision', 6),
  // Printed as "MP10 + Level" — the target's adventurer or monster level is added.
  spell(8, 'Multiple Actor/Crash Bear', 10, { mpVariable: true }),

  spell(9, 'Wing Flyer II', 6),
  spell(9, 'Noisy Disturbance', 7),
  spell(9, 'Boar Rush', 12),
  spell(9, 'Light Trapper', 9),

  spell(10, 'Reproducer/Living Tree', 9),
  spell(10, 'Chilling Breath', 11),
  spell(10, 'Plant Regrowth', 25),
  spell(10, 'Marsavra Smash', 14),

  spell(11, 'Big Defender/Hydra', 7),
  spell(11, 'Poisonous Attacker', 6),
  spell(11, 'Hallucinogenic Spores', 17),
  spell(11, 'Hollow Tree Gate', 11),

  spell(12, 'Mind Protector', 7),
  spell(12, 'Exhaustive Sucking', 14),
  spell(12, 'Cryo Bolt', 6),
  spell(12, 'Natural Power II', 0),

  spell(13, 'Plants Gift', 8),
  // Also castable at MP21, which makes its Resistance temporary.
  spell(13, "Nature's Reprisal", 14),
  spell(13, 'Beam Strike', 14),
  spell(13, 'Lunar Attack', 18),

  spell(14, 'Big Defender/Roc', 12),
  spell(14, 'Suppressing Gaze', 8),
  spell(14, 'Violent Storm', 14),
  spell(14, 'Big Flight', 15),

  spell(15, 'Purification Wave', 15),
  spell(15, 'Double Stomp', 24),
  spell(15, 'Natural Haven', 30),
  spell(15, 'Blaze Shower', 16),
];

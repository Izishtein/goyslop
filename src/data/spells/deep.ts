import { DEEP_MAGIC, makeSpell, type SpellDefinition } from './types';

const MAGUS_ARTS = 'Magus Arts';

const spell = (circle: number, name: string, mp: number, extra: Partial<SpellDefinition> = {}) =>
  makeSpell(MAGUS_ARTS, DEEP_MAGIC, circle, name, mp, extra);

/**
 * Deep Magic, Magus Arts pp. 95-100 — docs/sheet-content/27-deep-magic.md.
 *
 * Not owned by any single class the way every other school here is (compare
 * `ClassDefinition.magicSchool` in `data/classes.ts`, always exactly one class per school).
 * A character gains Deep Magic automatically once they've mastered BOTH Sorcerer and
 * Conjurer — no separate "Wizard" class exists for it. Available circle = the LOWER of the
 * two class levels; Magic Power = the HIGHER of the two, plus INT modifier. `SpellsSection`
 * special-cases this pairing directly (there is no `magicSchool` value to attach it to).
 *
 * Circle was not read off a graphic band or a digest (none exists for this school) but off
 * the spell's own printed Chant field, which opens with the words "Deep, {Ordinal} Rank" —
 * confirmed for all 31 entries below, see the doc for the two book-typo cases that needed
 * cross-referencing to resolve (`Geas`, `Tactile Illusion`).
 */
export const DEEP_SPELLS: SpellDefinition[] = [
  spell(1, 'Minor Illusion', 1),
  spell(1, 'Wizard Sign', 2),
  spell(1, 'Balance Weapon', 2),
  spell(2, 'Lock On', 3),
  spell(2, 'Tough Power', 3),
  spell(2, 'Bad Vibes', 5),
  spell(3, 'Remote Key', 4),
  spell(3, 'Replace Sound', 4),
  spell(3, 'Instant Undead', 4, { mpVariable: true }),
  spell(3, 'Instant Golem', 4, { mpVariable: true }),
  spell(4, 'Floating Eye', 4),
  spell(4, 'Toxic Breeze', 7),
  spell(5, 'Mana Convergence', 4),
  spell(5, 'Defense Master', 5),
  spell(6, 'Hold Portal', 4),
  spell(6, 'Sleep Cloud', 12),
  spell(7, 'Draw Out', 7),
  spell(7, 'Teleoperate Doll', 10),
  spell(8, 'Thermal Illusion', 6),
  spell(8, 'Life Delivery', 8),
  spell(9, 'Tactile Illusion', 6),
  spell(9, 'Three Shot Lightning', 12),
  spell(10, 'Protection III', 4),
  spell(10, 'Multitarget', 8),
  spell(11, 'Delude Enchantment', 12),
  spell(11, 'Balance Time', 18),
  spell(12, 'Free Flight', 9),
  spell(12, 'Geas', 19),
  spell(13, 'Death Ray', 12),
  spell(14, 'Mana Integration', 15),
  spell(15, 'Overblow', 25),
];

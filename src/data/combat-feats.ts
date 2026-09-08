/**
 * Combat Feat (SCA) names — Core Rulebook I pp. 249–265, Core Rulebook II pp. 198–211 and
 * Core Rulebook III pp. 199–205, transcribed in docs/sheet-content/04-combat-and-scas.md.
 *
 * Names and category only. Like the spell and arts catalogs this carries no effect text:
 * the research docs hold the effects in Russian alone, and the sheet keeps a free note
 * field for what a feat actually does at the table.
 *
 * Even so the picker never closes the door on a hand-typed name: the supplements past the
 * three core books carry feats of their own.
 *
 * The book marks [Cover] and [Defensive Stance] with △ for Combat Preparation and prints
 * "/**" where a feat is taken once per weapon category or class; both are kept out of the
 * stored name — one is a usage marker, the other a placeholder the player fills in.
 */
import type { CombatFeatCategory } from '../types/character';

export interface CombatFeatDefinition {
  id: string;
  name: string;
  category: CombatFeatCategory;
  sourceBook: string;
}

const CORE1 = 'Core Rulebook I';
const CORE2 = 'Core Rulebook II';
const CORE3 = 'Core Rulebook III';
/** Marked as the wiki's, not the book's — the book itself is embargoed. */
const TYRANTS_CRYPTS = 'Tyrants Crypts (fan wiki)';
const MAGUS_ARTS = 'Magus Arts';
const BATTLE_MASTERY = 'Battle Mastery';

function make(sourceBook: string, category: CombatFeatCategory, names: string[]): CombatFeatDefinition[] {
  return names.map((name) => ({
    id: name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, ''),
    name,
    category,
    sourceBook,
  }));
}

export const COMBAT_FEATS: CombatFeatDefinition[] = [
  ...make(CORE1, 'passive', [
    'Guardian I',
    'Dodge',
    'Evasive Maneuvers I',
    'Tenacity',
    'Twin Strike',
    'Targeting',
    'Hawk Eye',
    'Improved Throw I',
    'Dual Technique',
    'Weapon Proficiency A',
    'Weapon Proficiency S',
    'Stomp',
    'Ever-Changing I',
    'Armor Proficiency A',
    'Armor Proficiency S',
    'Metamagic Master',
    'Dual Wielding',
    'MP Save',
  ]),
  ...make(CORE1, 'declaration', [
    'Infight I',
    'Decoy Attack I',
    'Cover I',
    'Repeated Strike I',
    'Aimed Attack I',
    'Power Strike I',
    'Taunting Strike I',
    'Defensive Stance',
    'Cleave I',
    'Violentcast I',
    'Lethal Strike I',
    'Metamagic/Power Assurance',
    'Metamagic/Accuracy',
    'Metamagic/Targets',
    'Metamagic/Distance',
    'Metamagic/Time',
    'Metamagic/Area',
    'Universal Metamagic',
    'Magic Convergence',
    'Magic Control',
    'Mana Strike',
    'Multi-Action',
    'Armor Piercer I',
  ]),
  ...make(CORE1, 'majorAction', ['Snipe', 'Wordbreak']),
  ...make(CORE1, 'auto', ['Chain Attack', 'Treasure Hunt', 'Survivability', 'Keen Eyes']),

  ...make(CORE2, 'passive', [
    'Footwork',
    'Guardian II',
    'Evasive Maneuvers II',
    "Archer's Grace",
    'Intense Finale',
    'Additional Songs I',
    'Additional Songs II',
    'Throwing I',
    'Throwing II',
    'Super Tenacity',
    'Special Instrument Proficiency',
    'Flying Kick',
    'Improved Throw II',
    'Harmony',
    'Block',
    'Mako Stones Master',
    'Marionette',
    'Powerful Magic I',
    'Pinpoint Attack I',
    'Muscle Mystery',
  ]),
  ...make(CORE2, 'declaration', [
    'Infight II',
    'Decoy Attack II',
    'Rhythm Conversion',
    'Mirage Arrow',
    'Cover II',
    'Nerve Strike',
    'Repeated Strike II',
    'Critical Cast I',
    'Aimed Attack II',
    'Confident Performer',
    'Skillful Play',
    'Power Strike II',
    'Double Cast',
    'Taunting Strike II',
    'Tail Swing I',
    'Tail Swing II',
    'Cleave II',
    'Lethal Strike II',
    'Armor Piercer II',
  ]),
  ...make(CORE2, 'auto', ['Toughness', 'Counter', 'Fast Action', 'Shadow Sneak', 'Indomitable', 'Potion Master', 'Weakness Exploit', 'Mana Save']),

  // Core III splits its feats the same way: selectively acquired passive, selectively
  // acquired active (the book's word for a declaration), and automatically acquired by
  // class level. Most are the third step of a Core I/II chain.
  ...make(CORE3, 'passive', [
    'Capacity',
    'Additional Songs III',
    'Peerless Double Swords',
    'Weapon Master',
    'Enhanced Evocations I',
    'Enhanced Evocations II',
    'Distant Evocations',
    'Ever-Changing II',
    'Armor Master',
    'Powerful Magic II',
    'Pinpoint Attack II',
    'Consecutive Evocation',
  ]),
  ...make(CORE3, 'declaration', [
    'Card Reduction',
    'Aimed Attack III',
    'Critical Cast II',
    'Power Strike III',
    'Violentcast II',
    'Lethal Strike III',
    'Armor Piercer III',
  ]),
  ...make(CORE3, 'auto', [
    'Battle Master',
    'Rune Master',
    'Treasure Master',
    'Skill Master',
    'Shukuchi',
    'Run-and-Gun',
    'Mana Resistance',
    "Sage's Wisdom",
  ]),
  // Magus Arts pp. 22 and 34 — the Geomancer's and Tactician's own feats. Found 2026-09-07
  // by checking our catalog against the Russian feat digest the owner added to files/, which
  // prints English names in brackets and so can be matched name for name.
  ...make(MAGUS_ARTS, 'passive', [
    'Spreading Triad',
    'Dividing Triad',
    'Frontline Mastermind',
    'Additional Stratagem/Maneuver I',
    'Additional Stratagem/Maneuver II',
    'Additional Stratagem/Maneuver III',
  ]),
  // The Russian digest knew this one on 2026-09-07 and no English book in files/ did; it
  // turned up in Battle Mastery p. 41 the next day, in the owner's other collection. The
  // book grants it outright — "when you reach level 7 Battle Dancer, you will automatically
  // learn the Combat Feat [Cleansing Dance]" — hence the auto category.
  ...make(BATTLE_MASTERY, 'auto', ['Cleansing Dance']),

  // Declared right after a Stratagem two ranks lower than the last, so it is not passive
  // even though it sits in the book's "selectively acquired passive" block; the digest
  // files it as active too.
  ...make(MAGUS_ARTS, 'declaration', ['Versatile']),

  // Bibliomancer's grimoire-rank chain, transcribed from the same fan wiki as the school's
  // spell list (see docs/sheet-content/17-arcane-magic.md) — Tyrants Crypts is embargoed.
  // Each rung requires the one before it plus a Bibliomancer level; not modeled, same as
  // every other feat's prerequisites (the sheet's free note field carries it).
  ...make(TYRANTS_CRYPTS, 'passive', ['Grimoire Proficiency A', 'Grimoire Proficiency S', 'Grimoire Mastery']),
];

export function listCombatFeatsByCategory(category: CombatFeatCategory): CombatFeatDefinition[] {
  return COMBAT_FEATS.filter((feat) => feat.category === category);
}

export function getCombatFeat(id: string): CombatFeatDefinition | undefined {
  return COMBAT_FEATS.find((feat) => feat.id === id);
}

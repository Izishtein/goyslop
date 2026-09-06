/**
 * Combat Feat (SCA) names — Core Rulebook I pp. 249–265 and Core Rulebook II pp. 198–211,
 * transcribed in docs/sheet-content/04-combat-and-scas.md.
 *
 * Names and category only. Like the spell and arts catalogs this carries no effect text:
 * the research docs hold the effects in Russian alone, and the sheet keeps a free note
 * field for what a feat actually does at the table.
 *
 * Core III adds more feats (pp. 199–205) that are not documented yet, so the picker never
 * closes the door on a hand-typed name.
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
];

export function listCombatFeatsByCategory(category: CombatFeatCategory): CombatFeatDefinition[] {
  return COMBAT_FEATS.filter((feat) => feat.category === category);
}

export function getCombatFeat(id: string): CombatFeatDefinition | undefined {
  return COMBAT_FEATS.find((feat) => feat.id === id);
}

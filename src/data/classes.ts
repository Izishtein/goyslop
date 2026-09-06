import type { AbilityId } from '../lib/formulas/abilities';

export type ClassType = 'warrior' | 'wizard' | 'other';
export type ClassRank = 'major' | 'minor';

export interface ClassDefinition {
  id: string;
  name: string;
  type: ClassType;
  rank: ClassRank;
  sourceBook: string;
  /** Only set for wizard-type classes. */
  magicSchool?: string;
  /**
   * The abilities the class actually leans on, for the reference screen.
   *
   * Warrior-type and Other-type values come from the "Ключевая характеристика" column of
   * docs/sheet-content/02-classes.md. **The Wizard table has no such column** — it prints
   * the magic school there instead — so the nine Wizard classes carry INT and SPR derived
   * from the two formulas that same document states above the table, and that this app
   * already implements: Magic Power = Wizard level + INT modifier (`derived-stats.ts`) and
   * MP max = Wizard levels x 3 + SPR (`hp-mp.ts`). Derived, not transcribed — do not
   * "correct" them against a printed column that does not exist.
   *
   * Qualifiers the book attaches to a few of these (Rider's "AGI (Riding)", Tactician's
   * "INT (Initiative), voice") live in the class description, not here.
   */
  keyAbilities: AbilityId[];
}

/** What every Wizard-type class rolls on; see the note on `keyAbilities`. */
const WIZARD_ABILITIES: AbilityId[] = ['INT', 'SPR'];

export const CLASSES: ClassDefinition[] = [
  // Warrior-type
  { id: 'fighter', name: 'Fighter', type: 'warrior', rank: 'major', sourceBook: 'Core Rulebook I', keyAbilities: ['STR', 'VIT'] },
  { id: 'grappler', name: 'Grappler', type: 'warrior', rank: 'major', sourceBook: 'Core Rulebook I', keyAbilities: ['STR', 'DEX'] },
  { id: 'fencer', name: 'Fencer', type: 'warrior', rank: 'minor', sourceBook: 'Core Rulebook I', keyAbilities: ['DEX', 'AGI'] },
  { id: 'marksman', name: 'Marksman', type: 'warrior', rank: 'minor', sourceBook: 'Core Rulebook I', keyAbilities: ['DEX'] },
  { id: 'battle-dancer', name: 'Battle Dancer', type: 'warrior', rank: 'minor', sourceBook: 'Battle Mastery', keyAbilities: ['DEX', 'AGI'] },

  // Wizard-type
  { id: 'sorcerer', name: 'Sorcerer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Truespeech Magic', keyAbilities: WIZARD_ABILITIES },
  { id: 'conjurer', name: 'Conjurer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Spiritualism Magic', keyAbilities: WIZARD_ABILITIES },
  { id: 'priest', name: 'Priest', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Divine Magic', keyAbilities: WIZARD_ABILITIES },
  { id: 'artificer', name: 'Artificer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Magitech', keyAbilities: WIZARD_ABILITIES },
  { id: 'fairy-tamer', name: 'Fairy Tamer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook II', magicSchool: 'Fairy Magic', keyAbilities: WIZARD_ABILITIES },
  { id: 'druid', name: 'Druid', type: 'wizard', rank: 'major', sourceBook: 'Monstrous Lore', magicSchool: 'Nature Magic', keyAbilities: WIZARD_ABILITIES },
  { id: 'daemonologist', name: 'Daemonologist', type: 'wizard', rank: 'major', sourceBook: 'Monstrous Lore', magicSchool: 'Summoning Arts', keyAbilities: WIZARD_ABILITIES },
  { id: 'abyss-gazer', name: 'Abyss Gazer', type: 'wizard', rank: 'major', sourceBook: 'Abyss Breaker', magicSchool: 'Abyssal Magic', keyAbilities: WIZARD_ABILITIES },
  { id: 'bibliomancer', name: 'Bibliomancer', type: 'wizard', rank: 'major', sourceBook: 'Tyrants Crypts', magicSchool: 'Arcane Magic', keyAbilities: WIZARD_ABILITIES },

  // Other-type
  { id: 'scout', name: 'Scout', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook I', keyAbilities: ['DEX', 'AGI'] },
  { id: 'ranger', name: 'Ranger', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook I', keyAbilities: ['VIT', 'INT'] },
  { id: 'sage', name: 'Sage', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook I', keyAbilities: ['INT'] },
  { id: 'enhancer', name: 'Enhancer', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook II', keyAbilities: ['STR', 'VIT'] },
  { id: 'bard', name: 'Bard', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook II', keyAbilities: ['INT', 'SPR'] },
  { id: 'rider', name: 'Rider', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook III', keyAbilities: ['AGI', 'INT'] },
  { id: 'alchemist', name: 'Alchemist', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook III', keyAbilities: ['INT'] },
  { id: 'tactician', name: 'Tactician', type: 'other', rank: 'minor', sourceBook: 'Magus Arts', keyAbilities: ['INT'] },
  { id: 'geomancer', name: 'Geomancer', type: 'other', rank: 'minor', sourceBook: 'Magus Arts', keyAbilities: ['INT'] },
  { id: 'dark-hunter', name: 'Dark Hunter', type: 'other', rank: 'minor', sourceBook: 'Abyss Breaker', keyAbilities: ['DEX', 'SPR'] },
];

export function getClass(id: string): ClassDefinition | undefined {
  return CLASSES.find((classDef) => classDef.id === id);
}

export function isWizardType(id: string): boolean {
  return getClass(id)?.type === 'wizard';
}

export function isWarriorType(id: string): boolean {
  return getClass(id)?.type === 'warrior';
}

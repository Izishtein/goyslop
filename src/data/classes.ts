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
}

export const CLASSES: ClassDefinition[] = [
  // Warrior-type
  { id: 'fighter', name: 'Fighter', type: 'warrior', rank: 'major', sourceBook: 'Core Rulebook I' },
  { id: 'grappler', name: 'Grappler', type: 'warrior', rank: 'major', sourceBook: 'Core Rulebook I' },
  { id: 'fencer', name: 'Fencer', type: 'warrior', rank: 'minor', sourceBook: 'Core Rulebook I' },
  { id: 'marksman', name: 'Marksman', type: 'warrior', rank: 'minor', sourceBook: 'Core Rulebook I' },
  { id: 'battle-dancer', name: 'Battle Dancer', type: 'warrior', rank: 'minor', sourceBook: 'Battle Mastery' },

  // Wizard-type
  { id: 'sorcerer', name: 'Sorcerer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Truespeech Magic' },
  { id: 'conjurer', name: 'Conjurer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Spiritualism Magic' },
  { id: 'priest', name: 'Priest', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Divine Magic' },
  { id: 'artificer', name: 'Artificer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook I', magicSchool: 'Magitech' },
  { id: 'fairy-tamer', name: 'Fairy Tamer', type: 'wizard', rank: 'major', sourceBook: 'Core Rulebook II', magicSchool: 'Fairy Magic' },
  { id: 'druid', name: 'Druid', type: 'wizard', rank: 'major', sourceBook: 'Monstrous Lore', magicSchool: 'Nature Magic' },
  { id: 'daemonologist', name: 'Daemonologist', type: 'wizard', rank: 'major', sourceBook: 'Monstrous Lore', magicSchool: 'Summoning Arts' },
  { id: 'abyss-gazer', name: 'Abyss Gazer', type: 'wizard', rank: 'major', sourceBook: 'Abyss Breaker', magicSchool: 'Abyssal Magic' },
  { id: 'bibliomancer', name: 'Bibliomancer', type: 'wizard', rank: 'major', sourceBook: 'Tyrants Crypts', magicSchool: 'Arcane Magic' },

  // Other-type
  { id: 'scout', name: 'Scout', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook I' },
  { id: 'ranger', name: 'Ranger', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook I' },
  { id: 'sage', name: 'Sage', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook I' },
  { id: 'enhancer', name: 'Enhancer', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook II' },
  { id: 'bard', name: 'Bard', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook II' },
  { id: 'rider', name: 'Rider', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook III' },
  { id: 'alchemist', name: 'Alchemist', type: 'other', rank: 'minor', sourceBook: 'Core Rulebook III' },
  { id: 'tactician', name: 'Tactician', type: 'other', rank: 'minor', sourceBook: 'Magus Arts' },
  { id: 'geomancer', name: 'Geomancer', type: 'other', rank: 'minor', sourceBook: 'Magus Arts' },
  { id: 'dark-hunter', name: 'Dark Hunter', type: 'other', rank: 'minor', sourceBook: 'Abyss Breaker' },
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

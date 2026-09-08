/**
 * Vagrant Category/Type templates — Outlaw Profile Book pp. 34-57, transcribed in
 * docs/sheet-content/22-vagrant-types.md.
 *
 * Each Type is a fixed character template: pick a Category, pick one of its Types, and the
 * Primary Class, Subclass, starting Experience Points, Additional Languages and Special Notes
 * are all fixed by the book — the only thing left to the player is which of the Type's
 * Selectable Races to use (each with its own fixed Background name and Skill/Body/Mind triple,
 * no dice involved).
 *
 * Display text only (primaryClass/subclass/remainingXp/specialNotes) — a few Types have
 * conditional or multi-choice values (Dragoon's XP depends on Fighter vs Fencer; Spellpuncher's
 * subclass is a choice of six) that don't reduce to a single clean field, so this catalog is
 * reference data for the Vagrant tab, not something wired into character creation math.
 */
import type { VagrantCategory } from './childhood';

export interface VagrantSelectableRace {
  raceId: string;
  background: string;
  skillBodyMind: [number, number, number];
}

export interface VagrantType {
  id: string;
  name: string;
  category: VagrantCategory;
  courses: string;
  primaryClass: string;
  subclass: string | null;
  remainingXp: string;
  additionalLanguages: string;
  specialNotes: string;
  selectableRaces: VagrantSelectableRace[];
}

function races(...entries: [string, string, number, number, number][]): VagrantSelectableRace[] {
  return entries.map(([raceId, background, s, b, m]) => ({ raceId, background, skillBodyMind: [s, b, m] }));
}

export const VAGRANT_TYPES: VagrantType[] = [
  // Warrior category (p. 34)
  {
    id: 'hunter',
    name: 'Hunter',
    category: 'warrior',
    courses: 'Basic, Extended, Full',
    primaryClass: 'Major Fighter 2',
    subclass: 'Minor Ranger 1',
    remainingXp: '500',
    additionalLanguages: 'None',
    specialNotes: '',
    selectableRaces: races(
      ['human', 'Warrior', 7, 9, 5],
      ['dwarf', 'Warrior', 4, 11, 5],
      ['nightmare', 'Warrior', 7, 15, 8],
      ['lykant', 'Warrior', 10, 9, 6],
      ['shadow', 'Warrior', 15, 9, 3],
      ['runefolk', 'Warrior', 9, 12, 5],
      ['lildraken', 'Warrior', 5, 14, 6],
      ['soleil', 'Warrior', 10, 15, 1],
      ['tiens', 'Warrior', 8, 12, 8],
      ['weakling', 'Warrior', 8, 10, 5],
    ),
  },
  {
    id: 'alchemy-warrior',
    name: 'Alchemy Warrior',
    category: 'warrior',
    courses: 'Full',
    primaryClass: 'Major Fighter 2',
    subclass: 'Minor Alchemist 1',
    remainingXp: '500',
    additionalLanguages: 'Speak and read Magitech',
    specialNotes: 'Learn Evocation [Vorpal Weapon] (p. 163); write it in the Techniques/Spellsongs/Stunts field.',
    selectableRaces: races(
      ['human', 'Warrior', 7, 9, 5],
      ['dwarf', 'Warrior', 4, 11, 5],
      ['nightmare', 'Warrior', 7, 15, 8],
      ['lykant', 'Warrior', 10, 9, 6],
      ['shadow', 'Warrior', 15, 9, 3],
      ['runefolk', 'Warrior', 9, 12, 5],
      ['lildraken', 'Warrior', 5, 14, 6],
      ['soleil', 'Warrior', 10, 15, 1],
      ['tiens', 'Warrior', 8, 12, 8],
      ['weakling', 'Warrior', 8, 10, 5],
    ),
  },
  {
    id: 'dragoon',
    name: 'Dragoon',
    category: 'warrior',
    courses: 'Full',
    primaryClass: 'Major Fighter 2 or Minor Fencer 2 (book recommends Fencer for Elf/Grassrunner)',
    subclass: 'Minor Rider 1',
    remainingXp: '500 (if Fighter), 1,000 (if Fencer)',
    additionalLanguages: 'None',
    specialNotes:
      'Learn Stunt [Enhance Mount] (p. 161). If primary class is Fencer: weapon Critical Threshold -1, and Strength for equipping weapon/armor is halved (rounded up).',
    selectableRaces: races(
      ['human', 'Jockey', 8, 8, 5],
      ['elf', 'Jockey', 12, 6, 8],
      ['dwarf', 'Jockey', 4, 10, 6],
      ['nightmare', 'Jockey', 10, 13, 7],
      ['lykant', 'Jockey', 11, 8, 6],
      ['shadow', 'Jockey', 13, 7, 7],
      ['runefolk', 'Jockey', 10, 11, 5],
      ['lildraken', 'Jockey', 6, 13, 6],
      ['grassrunner', 'Jockey', 13, 1, 11],
      ['soleil', 'Jockey', 11, 13, 2],
      ['tiens', 'Jockey', 10, 11, 7],
      ['weakling', 'Jockey', 8, 8, 7],
    ),
  },

  // Spy category (p. 38)
  {
    id: 'commando',
    name: 'Commando',
    category: 'spy',
    courses: 'Basic, Extended, Full',
    primaryClass: 'Major Fighter or Major Grappler 1',
    subclass: 'Minor Scout 2',
    remainingXp: '500',
    additionalLanguages: 'None',
    specialNotes: 'If Grappler is selected, Combat Feat [Chain Attack] (p. 137) is automatically acquired.',
    selectableRaces: races(
      ['human', 'Mercenary', 7, 10, 4],
      ['nightmare', 'Mercenary', 7, 15, 8],
      ['lykant', 'Scout', 13, 5, 7],
      ['shadow', 'Scout', 16, 7, 4],
      ['runefolk', 'Scout', 12, 6, 8],
      ['soleil', 'Scout', 12, 11, 3],
      ['weakling', 'Scout', 10, 7, 6],
    ),
  },
  {
    id: 'tracker',
    name: 'Tracker',
    category: 'spy',
    courses: 'Basic, Extended, Full',
    primaryClass: 'Minor Fencer 2',
    subclass: 'Minor Scout 2',
    remainingXp: '0',
    additionalLanguages: 'None',
    specialNotes: "Weapon's Critical Threshold reduced by -1.",
    selectableRaces: races(
      ['human', 'Agile Warrior', 10, 7, 4],
      ['elf', 'Swordsman', 12, 5, 9],
      ['nightmare', 'Agile Warrior', 11, 13, 6],
      ['lykant', 'Agile Warrior', 12, 6, 7],
      ['shadow', 'Swordsman', 17, 7, 3],
      ['runefolk', 'Agile Warrior', 11, 9, 6],
      ['grassrunner', 'Agile Warrior', 14, 1, 10],
      ['alv', 'Agile Warrior', 12, 6, 7],
      ['soleil', 'Agile Warrior', 12, 12, 2],
      ['weakling', 'Agile Warrior', 9, 8, 6],
    ),
  },
  {
    id: 'sniper',
    name: 'Sniper',
    category: 'spy',
    courses: 'Basic, Extended, Full',
    primaryClass: 'Minor Marksman 2',
    subclass: 'Minor Scout 2',
    remainingXp: '0',
    additionalLanguages: 'None',
    specialNotes: '',
    selectableRaces: races(
      ['human', 'Archer', 9, 5, 7],
      ['elf', 'Archer', 13, 6, 8],
      ['nightmare', 'Archer', 10, 10, 10],
      ['lykant', 'Archer', 11, 8, 6],
      ['shadow', 'Archer', 18, 6, 3],
      ['runefolk', 'Archer', 12, 8, 6],
      ['grassrunner', 'Archer', 14, 0, 11],
      ['alv', 'Archer', 13, 4, 8],
      ['soleil', 'Archer', 11, 14, 1],
      ['leprechaun', 'Archer', 12, 6, 5],
      ['weakling', 'Archer', 10, 8, 5],
    ),
  },

  // Remote Support category (p. 42)
  {
    id: 'wizard',
    name: 'Wizard',
    category: 'remoteSupport',
    courses: 'Basic, Extended, Full',
    primaryClass: 'Major Conjurer 2',
    subclass: 'Major Sorcerer 1',
    remainingXp: '0',
    additionalLanguages: 'Speak and Read in Arcana',
    specialNotes:
      'Can use Spiritualism Magic (p. 143) up to 2nd level and Truespeech Magic (p. 142) up to 1st level. (Translator’s note: with Magus Arts, also Deep Magic up to 1st level.) Not a class literally called "Wizard" — built from Conjurer + Sorcerer.',
    selectableRaces: races(
      ['human', 'Conjurer', 7, 4, 10],
      ['elf', 'Conjurer', 9, 4, 13],
      ['tabbit', 'Conjurer', 6, 6, 10],
      ['nightmare', 'Conjurer', 6, 11, 13],
      ['runefolk', 'Conjurer', 7, 9, 10],
      ['meria', 'Conjurer', 7, 6, 16],
      ['alv', 'Conjurer', 9, 4, 12],
      ['leprechaun', 'Wizard', 11, 3, 9],
      ['weakling', 'Magician', 7, 8, 8],
    ),
  },
  {
    id: 'fairy-priest',
    name: 'Fairy Priest',
    category: 'remoteSupport',
    courses: 'Extended, Full',
    primaryClass: 'Major Priest 2',
    subclass: 'Major Fairy Tamer 1',
    remainingXp: '0',
    additionalLanguages: 'Speak and Read in Sylvan',
    specialNotes: 'Can use Divine Magic (p. 145) up to 2nd level and 4 types of Fairy Magic (p. 150) up to 1st rank.',
    selectableRaces: races(
      ['human', 'Priest', 4, 8, 9],
      ['elf', 'Priest', 9, 5, 12],
      ['dwarf', 'Priest', 4, 7, 9],
      ['meria', 'Priest', 8, 8, 13],
      ['alv', 'Priest', 10, 6, 9],
      ['leprechaun', 'Priest', 10, 5, 8],
      ['weakling', 'Priest', 7, 9, 7],
    ),
  },
  {
    id: 'druid-type',
    name: 'Druid',
    category: 'remoteSupport',
    courses: 'Full',
    primaryClass: 'Major Druid 2',
    subclass: null,
    remainingXp: '1,000',
    additionalLanguages: 'None',
    specialNotes: 'Can use Nature Magic (p. 153) up to 2nd level.',
    selectableRaces: races(
      ['human', 'Druid', 5, 6, 10],
      ['elf', 'Druid', 8, 5, 13],
      ['dwarf', 'Druid', 4, 7, 9],
      ['tabbit', 'Druid', 5, 6, 11],
      ['nightmare', 'Druid', 8, 10, 12],
      ['meria', 'Druid', 6, 7, 16],
      ['leprechaun', 'Druid', 11, 4, 8],
      ['weakling', 'Druid', 7, 7, 9],
    ),
  },
  {
    id: 'daemonologist-type',
    name: 'Daemonologist',
    category: 'remoteSupport',
    courses: 'Full',
    primaryClass: 'Major Daemonologist 2',
    subclass: null,
    remainingXp: '1,000',
    additionalLanguages: 'Speak in Daemonic and Read in Arcana',
    specialNotes: 'Can use Summoning Arts (p. 155) up to 2nd level.',
    selectableRaces: races(
      ['human', 'Daemonologist', 6, 6, 9],
      ['elf', 'Daemonologist', 10, 4, 12],
      ['tabbit', 'Daemonologist', 6, 6, 10],
      ['nightmare', 'Daemonologist', 7, 12, 11],
      ['runefolk', 'Daemonologist', 9, 9, 8],
      ['meria', 'Daemonologist', 7, 7, 15],
      ['alv', 'Daemonologist', 9, 6, 10],
      ['leprechaun', 'Daemonologist', 12, 4, 7],
      ['weakling', 'Daemonologist', 7, 8, 8],
    ),
  },
  {
    id: 'alchemist-type',
    name: 'Alchemist',
    category: 'remoteSupport',
    courses: 'Full',
    primaryClass: 'Minor Alchemist 2',
    subclass: null,
    remainingXp: '1,500',
    additionalLanguages: 'Speak and read in Magitech',
    specialNotes:
      'Pick [Barkmail] and [Paralyzing Mist] Evocations (p. 163); write them in the Techniques/Spellsongs/Stunts field. Weakling is not selectable for this Type.',
    selectableRaces: races(
      ['human', 'Alchemist', 7, 6, 8],
      ['dwarf', 'Alchemist', 5, 9, 6],
      ['tabbit', 'Alchemist', 6, 7, 9],
      ['nightmare', 'Alchemist', 11, 9, 10],
      ['runefolk', 'Alchemist', 10, 9, 7],
      ['grassrunner', 'Alchemist', 13, 0, 12],
      ['meria', 'Alchemist', 9, 7, 13],
      ['leprechaun', 'Alchemist', 11, 5, 7],
    ),
  },
  {
    id: 'beastmaster',
    name: 'Beastmaster',
    category: 'remoteSupport',
    courses: 'Full',
    primaryClass: 'Minor Rider 2',
    subclass: null,
    remainingXp: '1,500',
    additionalLanguages: 'None',
    specialNotes:
      'Pick [Remote Command] and [Enhance Mount] Stunts (p. 161); write them in the Techniques/Spellsongs/Stunts field.',
    selectableRaces: races(
      ['human', 'Jockey', 8, 8, 5],
      ['elf', 'Jockey', 12, 6, 8],
      ['dwarf', 'Jockey', 4, 10, 6],
      ['nightmare', 'Jockey', 10, 13, 5],
      ['runefolk', 'Jockey', 10, 11, 5],
      ['grassrunner', 'Jockey', 13, 1, 11],
      ['meria', 'Jockey', 8, 9, 12],
      ['leprechaun', 'Jockey', 13, 6, 4],
      ['weakling', 'Jockey', 8, 8, 7],
    ),
  },

  // Magic Warrior category (p. 52)
  {
    id: 'spellpuncher',
    name: 'Spellpuncher',
    category: 'magicWarrior',
    courses: 'Basic, Extended, Full',
    primaryClass: 'Major Grappler 1',
    subclass:
      'One of: Major Sorcerer 2 / Major Conjurer 2 / Major Priest 2 (not Runefolk) / Major Fairy Tamer 2 (not Runefolk) / Major Druid 2 (not Runefolk) / Major Daemonologist 2',
    remainingXp: '0',
    additionalLanguages:
      'Depends on subclass — Sorcerer/Conjurer: Arcana; Fairy Tamer: Sylvan; Daemonologist: Daemonic + Arcana; Priest/Druid: none',
    specialNotes:
      'Up to 2 levels of the chosen magic system. Daemonologist subclass grants "Gate Imp" and the ability to summon Daemons (Monstrous Lore p. 28). Automatically acquires Combat Feat [Chain Attack] (p. 137).',
    selectableRaces: races(
      ['human', 'Boxer', 8, 8, 5],
      ['elf', 'Boxer', 11, 4, 11],
      ['dwarf', 'Boxer', 5, 10, 5],
      ['nightmare', 'Mercenary', 7, 15, 8],
      ['runefolk', 'Warrior', 9, 12, 5],
      ['lildraken', 'Boxer', 6, 13, 6],
      ['alv', 'Boxer', 11, 7, 7],
      ['weakling', 'Boxer', 9, 9, 5],
    ),
  },
  {
    id: 'grove-defender',
    name: 'Grove Defender',
    category: 'magicWarrior',
    courses: 'Full',
    primaryClass: 'Major Fighter 2',
    subclass: 'Major Druid 1',
    remainingXp: '0',
    additionalLanguages: 'None',
    specialNotes: 'Can cast Nature Magic (p. 153) up to 1st level.',
    selectableRaces: races(
      ['human', 'Warrior', 7, 9, 5],
      ['dwarf', 'Warrior', 4, 11, 5],
      ['nightmare', 'Mercenary', 7, 15, 8],
      ['lildraken', 'Warrior', 5, 14, 6],
      ['tiens', 'Warrior', 8, 12, 8],
      ['weakling', 'Warrior', 8, 10, 5],
    ),
  },
  {
    id: 'summoning-warrior',
    name: 'Summoning Warrior',
    category: 'magicWarrior',
    courses: 'Full',
    primaryClass: 'Major Fighter 2',
    subclass: 'Major Daemonologist 1',
    remainingXp: '0',
    additionalLanguages: 'Speak Daemonic and Read Arcana',
    specialNotes:
      'Can cast Summoning Arts (p. 155) up to 2nd level. Has "Gate Imp" and can summon Daemons (Monstrous Lore p. 28).',
    selectableRaces: races(
      ['human', 'Warrior', 7, 9, 5],
      ['dwarf', 'Warrior', 4, 11, 5],
      ['nightmare', 'Mercenary', 7, 15, 8],
      ['runefolk', 'Warrior', 9, 12, 5],
      ['lildraken', 'Warrior', 5, 14, 6],
      ['alv', 'Daemonologist', 9, 6, 10],
      ['tiens', 'Warrior', 8, 12, 8],
      ['weakling', 'Warrior', 8, 10, 5],
    ),
  },
  {
    id: 'leafblade',
    name: 'Leafblade',
    category: 'magicWarrior',
    courses: 'Full',
    primaryClass: 'Minor Fencer 2',
    subclass: 'Major Druid 1',
    remainingXp: '500',
    additionalLanguages: 'None',
    specialNotes:
      "Can cast Nature Magic (p. 153) up to 1st level. Weapon's Critical Threshold reduced by -1. Book inconsistency: the Selectable Races table below prints Dwarf, while the p. 17 category overview prose says Elf for this Type instead — kept as printed in the table (docs/sheet-content/22-vagrant-types.md).",
    selectableRaces: races(
      ['human', 'Swordsman', 9, 6, 6],
      ['dwarf', 'Swordsman', 12, 5, 9],
      ['meria', 'Agile Warrior', 10, 8, 11],
      ['alv', 'Agile Warrior', 12, 6, 7],
      ['leprechaun', 'Agile Warrior', 13, 5, 5],
      ['weakling', 'Agile Warrior', 9, 8, 6],
    ),
  },
  {
    id: 'daemonblade',
    name: 'Daemonblade',
    category: 'magicWarrior',
    courses: 'Full',
    primaryClass: 'Minor Fencer 1',
    subclass: 'Major Daemonologist 2',
    remainingXp: '500',
    additionalLanguages: 'Speak Daemonic and Read Arcana',
    specialNotes:
      'Can cast Summoning Arts (p. 155) up to 2nd level. Has "Gate Imp" and can summon Daemons (Monstrous Lore p. 28). Weapon’s Critical Threshold reduced by -1.',
    selectableRaces: races(
      ['human', 'Swordsman', 9, 6, 6],
      ['elf', 'Swordsman', 12, 5, 9],
      ['runefolk', 'Agile Warrior', 11, 9, 6],
      ['meria', 'Agile Warrior', 10, 8, 11],
      ['alv', 'Agile Warrior', 12, 6, 7],
      ['leprechaun', 'Agile Warrior', 13, 5, 5],
      ['weakling', 'Agile Warrior', 9, 8, 6],
    ),
  },
];

export function getVagrantType(id: string): VagrantType | undefined {
  return VAGRANT_TYPES.find((t) => t.id === id);
}

export function listVagrantTypesByCategory(category: VagrantCategory): VagrantType[] {
  return VAGRANT_TYPES.filter((t) => t.category === category);
}

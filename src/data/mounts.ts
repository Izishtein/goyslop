/**
 * Mounts and mount equipment — Core Rulebook III pp. 247–262, transcribed in
 * docs/sheet-content/16-mounts.md. The Rider's class mechanics are in
 * docs/sheet-content/02-classes.md; this file is the data those rules operate on.
 *
 * A mount is a small monster rather than an item: it has its own attack, Evasion, Defense,
 * HP, MP and resistances, and every one of them changes with the mount's level — which is
 * the jockey's Adventurer Level, capped at the top of the mount's Appropriate Level. Hence
 * one row per level per section, exactly as the book prints them.
 *
 * Unique skills are carried by name only, like every other catalog here: the effect text
 * lives in the book and in the research doc, and a mount on the sheet has its own note.
 *
 * Multi-section mounts (Tilgris, Draconet, Lesser Dragon) print Fortitude and Willpower on
 * the main section alone — the book rolls resistance once for the whole creature — so those
 * two fields are undefined on the other sections rather than zero.
 */

const CORE3 = 'Core Rulebook III';

export const MOUNT_CATEGORIES = ['animal', 'mythicalBeast', 'magitech'] as const;
export type MountCategory = (typeof MOUNT_CATEGORIES)[number];

export interface MountLevelRow {
  level: number;
  /** Undefined on single-section mounts; the book's "F Style (section)" column otherwise. */
  section?: string;
  /** The attack the book lists — Hoof, Tail, Claws, Bite, Tackle, Arm. */
  attack: string;
  accuracy: number;
  /** As printed, e.g. "2d+15" — a dice expression, not a number. */
  damage: string;
  evasion: number;
  defense: number;
  hp: number;
  /** Magitech mounts have no MP at all; the book prints a dash. */
  mp?: number;
  /** Main section only on a multi-section mount. */
  fortitude?: number;
  willpower?: number;
}

export interface MountDefinition {
  id: string;
  name: string;
  category: MountCategory;
  /** [lowest, highest]; the lowest is also the minimum Rider level needed to handle it. */
  appropriateLevel: [number, number];
  /** Outright purchase, in gamels. */
  purchasePrice: number;
  /** Mount Contract / Contract Sphere rental. Absent on the purchase-only variants. */
  rentalPrice?: number;
  /** Reputation charged on top of the purchase price — the "+5 movement" variants only. */
  reputationPrice?: number;
  /** "Secret Medicine of Section Regeneration", printed only for multi-section mounts. */
  regenerationPrice?: number;
  intelligence: string;
  perception: string;
  language: string;
  weakPoint: string;
  /** As printed: "ground / air-or-water", with a dash where the mount cannot do one. */
  movement: string;
  sections?: { count: number; names: string[]; main: string };
  levels: MountLevelRow[];
  uniqueSkills: string[];
  /** Set on the reputation variants: same data as the mount named here, +5 movement. */
  variantOf?: string;
  sourceBook: string;
}

export function mountId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Single-section level row: level, attack, accuracy, damage, evasion, defense, hp, mp, fort, will. */
function lvl(
  level: number,
  attack: string,
  accuracy: number,
  damage: string,
  evasion: number,
  defense: number,
  hp: number,
  mp: number | undefined,
  fortitude: number,
  willpower: number,
): MountLevelRow {
  return { level, attack, accuracy, damage, evasion, defense, hp, mp, fortitude, willpower };
}

/** Section row of a multi-section mount; only the main section carries Fort/Will. */
function sec(
  level: number,
  section: string,
  attack: string,
  accuracy: number,
  damage: string,
  evasion: number,
  defense: number,
  hp: number,
  mp: number,
  fortitude?: number,
  willpower?: number,
): MountLevelRow {
  return { level, section, attack, accuracy, damage, evasion, defense, hp, mp, fortitude, willpower };
}

const FIVE_SENSES = 'Five Senses';

export const MOUNTS: MountDefinition[] = [
  // ---- Animals, pp. 254–257 ----
  {
    id: 'horse',
    name: 'Horse',
    category: 'animal',
    appropriateLevel: [1, 4],
    purchasePrice: 5000,
    rentalPrice: 250,
    intelligence: 'Animal',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Physical Damage +2 pts.',
    movement: '30 (4 Legs)/-',
    levels: [
      lvl(1, 'Hoof', 3, '2d', 2, 1, 22, 8, 4, 3),
      lvl(2, 'Hoof', 4, '2d+1', 3, 2, 26, 9, 5, 4),
      lvl(3, 'Hoof', 5, '2d+2', 4, 3, 30, 10, 6, 5),
      lvl(4, 'Hoof', 6, '2d+3', 5, 4, 34, 11, 7, 6),
    ],
    uniqueSkills: [],
    sourceBook: CORE3,
  },
  {
    id: 'war-horse',
    name: 'War Horse',
    category: 'animal',
    appropriateLevel: [4, 7],
    purchasePrice: 10000,
    rentalPrice: 1000,
    intelligence: 'Animal',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Physical Damage +2 pts.',
    movement: '25 (4 Legs)/-',
    levels: [
      lvl(4, 'Hoof', 6, '2d+4', 5, 4, 40, 15, 7, 7),
      lvl(5, 'Hoof', 7, '2d+6', 6, 5, 45, 17, 8, 8),
      lvl(6, 'Hoof', 8, '2d+7', 7, 6, 50, 19, 10, 9),
      lvl(7, 'Hoof', 9, '2d+9', 8, 7, 55, 21, 11, 10),
    ],
    uniqueSkills: ['Techniques'],
    sourceBook: CORE3,
  },
  {
    id: 'legendary-horse',
    name: 'Legendary Horse',
    category: 'animal',
    appropriateLevel: [7, 10],
    purchasePrice: 20000,
    rentalPrice: 2000,
    intelligence: 'Animal',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Physical Damage +2 pts.',
    movement: '25 (4 Legs)/-',
    levels: [
      lvl(7, 'Hoof', 10, '2d+10', 9, 8, 62, 25, 11, 11),
      lvl(8, 'Hoof', 11, '2d+12', 10, 9, 68, 28, 12, 12),
      lvl(9, 'Hoof', 13, '2d+13', 12, 10, 74, 31, 13, 13),
      lvl(10, 'Hoof', 14, '2d+15', 13, 11, 80, 34, 15, 14),
    ],
    uniqueSkills: ['Techniques', 'Indomitable'],
    sourceBook: CORE3,
  },
  {
    id: 'divine-horse',
    name: 'Divine Horse',
    category: 'animal',
    appropriateLevel: [10, 13],
    purchasePrice: 50000,
    rentalPrice: 5000,
    intelligence: 'Low',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Physical Damage +2 pts.',
    movement: '30 (4 Legs)/-',
    levels: [
      lvl(10, 'Hoof', 14, '2d+16', 13, 12, 88, 40, 15, 15),
      lvl(11, 'Hoof', 15, '2d+17', 14, 14, 95, 44, 16, 16),
      lvl(12, 'Hoof', 16, '2d+19', 15, 15, 102, 48, 17, 17),
      lvl(13, 'Hoof', 17, '2d+21', 16, 16, 109, 52, 18, 18),
    ],
    uniqueSkills: ['Techniques', 'Indomitable'],
    sourceBook: CORE3,
  },
  {
    id: 'dowles',
    name: 'Dowles',
    category: 'animal',
    appropriateLevel: [2, 4],
    purchasePrice: 4500,
    rentalPrice: 300,
    intelligence: 'Animal',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Magic Damage +2 pts.',
    movement: '20/-',
    levels: [
      lvl(2, 'Tail', 4, '2d+3', 2, 4, 20, 5, 4, 2),
      lvl(3, 'Tail', 5, '2d+4', 3, 5, 24, 6, 5, 4),
      lvl(4, 'Tail', 6, '2d+5', 4, 6, 28, 7, 6, 5),
    ],
    uniqueSkills: ['Tail Sweep'],
    sourceBook: CORE3,
  },
  {
    id: 'dondowles',
    name: 'Dondowles',
    category: 'animal',
    appropriateLevel: [5, 7],
    purchasePrice: 9000,
    rentalPrice: 900,
    intelligence: 'Animal',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Magic Damage +2 pts.',
    movement: '20/-',
    levels: [
      lvl(5, 'Tail', 8, '2d+8', 5, 8, 39, 10, 8, 6),
      lvl(6, 'Tail', 9, '2d+9', 6, 9, 45, 12, 9, 8),
      lvl(7, 'Tail', 10, '2d+10', 7, 10, 51, 14, 10, 9),
    ],
    uniqueSkills: ['Tail Sweep', 'Wind Breath'],
    sourceBook: CORE3,
  },
  {
    id: 'mordondowles',
    name: 'Mordondowles',
    category: 'animal',
    appropriateLevel: [10, 12],
    purchasePrice: 30000,
    rentalPrice: 3000,
    intelligence: 'Animal',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Magic Damage +2 pts.',
    movement: '20/-',
    levels: [
      lvl(10, 'Tail', 14, '2d+15', 12, 13, 84, 15, 14, 12),
      lvl(11, 'Tail', 15, '2d+17', 13, 14, 91, 18, 15, 13),
      lvl(12, 'Tail', 16, '2d+19', 14, 15, 98, 21, 16, 14),
    ],
    uniqueSkills: ['Tail Sweep', 'Wind Breath', 'Gale Breath'],
    sourceBook: CORE3,
  },
  {
    id: 'dolphin',
    name: 'Dolphin',
    category: 'animal',
    appropriateLevel: [2, 5],
    purchasePrice: 6000,
    rentalPrice: 600,
    intelligence: 'Animal',
    perception: FIVE_SENSES,
    language: 'Sea Animal',
    weakPoint: 'Fire Damage +3 pts.',
    movement: '-/25 (Swimming)',
    levels: [
      lvl(2, 'Tackle', 4, '2d+2', 3, 3, 23, 9, 4, 4),
      lvl(3, 'Tackle', 5, '2d+3', 4, 3, 30, 11, 5, 5),
      lvl(4, 'Tackle', 6, '2d+4', 5, 4, 37, 13, 6, 6),
      lvl(5, 'Tackle', 7, '2d+5', 6, 5, 44, 15, 7, 7),
    ],
    uniqueSkills: ['Underwater'],
    sourceBook: CORE3,
  },

  // ---- Mythical Beasts, pp. 257–260 ----
  {
    id: 'pegasus',
    name: 'Pegasus',
    category: 'mythicalBeast',
    appropriateLevel: [5, 7],
    purchasePrice: 20000,
    rentalPrice: 2000,
    intelligence: 'Average',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Accuracy +1',
    movement: '20 (4 Legs)/40 (Flying)',
    levels: [
      lvl(5, 'Hoof', 7, '2d+5', 6, 3, 41, 23, 7, 7),
      lvl(6, 'Hoof', 8, '2d+6', 7, 5, 46, 26, 8, 8),
      lvl(7, 'Hoof', 9, '2d+8', 8, 6, 51, 29, 9, 9),
    ],
    uniqueSkills: ['Flight', 'Poison/Disease Immunity', 'Mounted = 1 Character'],
    sourceBook: CORE3,
  },
  {
    id: 'emerald-raccoon',
    name: 'Emerald Raccoon',
    category: 'mythicalBeast',
    appropriateLevel: [6, 8],
    purchasePrice: 25000,
    rentalPrice: 2500,
    intelligence: 'Average',
    perception: 'Five Senses (Darkvision)',
    language: 'Lycant, Sylvan',
    weakPoint: 'Earth Damage +3 pts.',
    movement: '16 (4 Legs)/-',
    levels: [
      lvl(6, 'Arm', 8, '2d+8', 8, 6, 52, 48, 8, 9),
      lvl(7, 'Arm', 9, '2d+9', 9, 7, 57, 51, 9, 10),
      lvl(8, 'Arm', 11, '2d+10', 10, 8, 62, 54, 10, 11),
    ],
    uniqueSkills: ['Fairy Magic 6 Level', 'Magic Aptitude'],
    sourceBook: CORE3,
  },
  {
    id: 'tilgris',
    name: 'Tilgris',
    category: 'mythicalBeast',
    appropriateLevel: [8, 10],
    purchasePrice: 60000,
    rentalPrice: 6000,
    regenerationPrice: 3000,
    intelligence: 'Average',
    perception: FIVE_SENSES,
    language: 'None',
    weakPoint: 'Slashing Damage +3 pts.',
    movement: '30 (4 Legs)/-',
    sections: { count: 2, names: ['Front', 'Back'], main: 'Front' },
    levels: [
      sec(8, 'Front', 'Claws', 11, '2d+8', 11, 8, 69, 24, 11, 10),
      sec(8, 'Back', 'Tail', 10, '2d+10', 10, 8, 77, 12),
      sec(9, 'Front', 'Claws', 12, '2d+9', 12, 9, 76, 28, 12, 11),
      sec(9, 'Back', 'Tail', 11, '2d+12', 11, 9, 84, 14),
      sec(10, 'Front', 'Claws', 13, '2d+11', 13, 10, 83, 32, 13, 12),
      sec(10, 'Back', 'Tail', 12, '2d+14', 12, 10, 93, 16),
    ],
    uniqueSkills: ['Double Attack (Front)', 'Lightning Breath (Front)', 'Long Tail (Back)', 'Painful Strike (Back)'],
    sourceBook: CORE3,
  },
  {
    id: 'draconet',
    name: 'Draconet',
    category: 'mythicalBeast',
    appropriateLevel: [10, 12],
    purchasePrice: 120000,
    rentalPrice: 12000,
    regenerationPrice: 4000,
    intelligence: 'Average',
    perception: 'Five Senses (Darkvision)',
    language: 'Dragonic',
    weakPoint: 'Physical Damage +2 pts.',
    movement: '13/25 (Flying)',
    sections: { count: 3, names: ['Body', 'Wing x 2'], main: 'Body' },
    levels: [
      sec(10, 'Body', 'Bite', 13, '2d+14', 12, 12, 105, 32, 13, 12),
      sec(10, 'Wing x 2', 'Wing', 12, '2d+9', 10, 10, 66, 16),
      sec(11, 'Body', 'Bite', 14, '2d+15', 13, 13, 113, 36, 14, 14),
      sec(11, 'Wing x 2', 'Wing', 13, '2d+11', 11, 11, 71, 18),
      sec(12, 'Body', 'Bite', 15, '2d+17', 14, 14, 121, 40, 15, 15),
      sec(12, 'Wing x 2', 'Wing', 14, '2d+12', 12, 12, 76, 20),
    ],
    uniqueSkills: ['**Immunity (all sections)', '**Breath (Body)', 'Flight (Wing)', 'All-Out Attack (Wing)'],
    sourceBook: CORE3,
  },
  {
    id: 'lesser-dragon',
    name: 'Lesser Dragon',
    category: 'mythicalBeast',
    appropriateLevel: [13, 15],
    purchasePrice: 360000,
    rentalPrice: 36000,
    regenerationPrice: 9000,
    intelligence: 'High',
    perception: 'Five Senses (Darkvision)',
    language: 'Trade Common, Arcana, Dragonic',
    weakPoint: 'Physical Damage +2 pts.',
    movement: '15/30 (Flying)',
    sections: { count: 4, names: ['Head', 'Body', 'Wings x 2'], main: 'Head' },
    levels: [
      sec(13, 'Head', 'Bite', 17, '2d+18', 15, 14, 119, 84, 17, 17),
      sec(13, 'Body', 'Tail', 16, '2d+16', 13, 16, 133, 30),
      sec(13, 'Wings x 2', 'Wing', 15, '2d+14', 13, 13, 84, 28),
      sec(14, 'Head', 'Bite', 18, '2d+20', 16, 15, 128, 90, 18, 18),
      sec(14, 'Body', 'Tail', 17, '2d+17', 14, 18, 142, 36),
      sec(14, 'Wings x 2', 'Wing', 17, '2d+16', 14, 14, 90, 32),
      sec(15, 'Head', 'Bite', 19, '2d+22', 17, 16, 137, 96, 19, 19),
      sec(15, 'Body', 'Tail', 18, '2d+18', 15, 20, 151, 42),
      sec(15, 'Wings x 2', 'Wing', 18, '2d+18', 15, 15, 96, 36),
    ],
    uniqueSkills: [
      '**Immunity (all sections)',
      'Techniques (all sections)',
      'Truespeech Magic, Spiritualism Magic 10 Level (Head)',
      'Magic Aptitude (Head)',
      '**Breath (Head)',
      'Mounted = 2 Character (Body)',
      'Tail Sweep (Body)',
      'Attack Obstacle = Impossible (Body)',
      'Flight (Wings)',
      'All-Out Attack (Wings)',
    ],
    sourceBook: CORE3,
  },

  // ---- Magitech, pp. 261–262. No MP at all: the book prints a dash. ----
  {
    id: 'mini-manabike',
    name: 'Mini Manabike',
    category: 'magitech',
    appropriateLevel: [1, 2],
    purchasePrice: 3000,
    rentalPrice: 300,
    intelligence: 'None',
    perception: 'Mechanical',
    language: 'None',
    weakPoint: 'Magic Damage +2 pts.',
    movement: '30 (Wheels)',
    levels: [
      lvl(1, 'Tackle', 3, '2d+2', 1, 3, 25, undefined, 3, 3),
      lvl(2, 'Tackle', 4, '2d+3', 2, 3, 25, undefined, 3, 3),
    ],
    uniqueSkills: ['Off-Road Handling'],
    sourceBook: CORE3,
  },
  {
    id: 'manabike',
    name: 'Manabike',
    category: 'magitech',
    appropriateLevel: [3, 6],
    purchasePrice: 10000,
    rentalPrice: 1000,
    intelligence: 'None',
    perception: 'Mechanical',
    language: 'None',
    weakPoint: 'Magic Damage +2 pts.',
    movement: '50 (Wheels)',
    levels: [
      lvl(3, 'Tackle', 5, '2d+4', 5, 5, 40, undefined, 6, 6),
      lvl(4, 'Tackle', 7, '2d+6', 7, 5, 40, undefined, 6, 6),
      lvl(5, 'Tackle', 8, '2d+8', 8, 5, 40, undefined, 6, 6),
      lvl(6, 'Tackle', 9, '2d+10', 9, 5, 40, undefined, 6, 6),
    ],
    uniqueSkills: ['Off-Road Handling', 'Grenade Launcher'],
    sourceBook: CORE3,
  },
  {
    id: 'superior-manabike',
    name: 'Superior Manabike',
    category: 'magitech',
    appropriateLevel: [7, 9],
    purchasePrice: 20000,
    rentalPrice: 2000,
    intelligence: 'None',
    perception: 'Mechanical',
    language: 'None',
    weakPoint: 'Magic Damage +2 pts.',
    movement: '50 (Wheels)',
    levels: [
      lvl(7, 'Tackle', 9, '2d+10', 9, 9, 75, undefined, 10, 10),
      lvl(8, 'Tackle', 11, '2d+12', 11, 9, 75, undefined, 10, 10),
      lvl(9, 'Tackle', 12, '2d+14', 12, 9, 75, undefined, 10, 10),
    ],
    uniqueSkills: ['Off-Road Handling', 'Grenade Launcher'],
    sourceBook: CORE3,
  },
  {
    id: 'skybike',
    name: 'Skybike',
    category: 'magitech',
    appropriateLevel: [11, 13],
    purchasePrice: 60000,
    rentalPrice: 6000,
    intelligence: 'None',
    perception: 'Mechanical',
    language: 'None',
    weakPoint: 'Magic Damage +2 pts.',
    movement: '-/50 (Flying)',
    levels: [
      lvl(11, 'Tackle', 14, '2d+14', 14, 14, 120, undefined, 14, 14),
      lvl(12, 'Tackle', 16, '2d+16', 16, 14, 120, undefined, 14, 14),
      lvl(13, 'Tackle', 17, '2d+18', 17, 14, 120, undefined, 14, 14),
    ],
    uniqueSkills: ['Flight', 'High Speed Retreat', 'Laser Gun'],
    sourceBook: CORE3,
  },
];

/**
 * The seven "+5 movement, purchase only" mounts of the summary tables (pp. 247–248). Every
 * one is a base mount bought with reputation on top, and the book gives them no data block
 * of their own — so they are listed separately rather than duplicated into MOUNTS, where
 * they would double every count and every level row for no new numbers.
 */
export interface MountVariant {
  id: string;
  name: string;
  variantOf: string;
  purchasePrice: number;
  reputationPrice: number;
  sourceBook: string;
}

function variant(name: string, variantOf: string, purchasePrice: number, reputationPrice: number): MountVariant {
  return { id: mountId(name), name, variantOf, purchasePrice, reputationPrice, sourceBook: CORE3 };
}

export const MOUNT_VARIANTS: MountVariant[] = [
  variant('Fast Horse', 'horse', 5000, 30),
  variant('Exceptional Horse', 'war-horse', 10000, 60),
  variant('Daredevil Horse', 'legendary-horse', 20000, 100),
  variant('King of Horses', 'divine-horse', 50000, 150),
  variant('Manabike G', 'manabike', 10000, 60),
  variant('Superior Manabike K', 'superior-manabike', 20000, 100),
  variant('Skybike S', 'skybike', 60000, 150),
];

export const MOUNT_GEAR_KINDS = ['weapon', 'armor', 'carry', 'regeneration'] as const;
export type MountGearKind = (typeof MOUNT_GEAR_KINDS)[number];

/**
 * Mount armaments and the items that carry or repair a mount (pp. 248–250). One weapon and
 * one armor per mount — per *section* on a multi-section mount, affecting only that
 * section. None of it can take an Abyss Enhancement.
 */
export interface MountGearDefinition {
  id: string;
  name: string;
  kind: MountGearKind;
  /** Which mount classifications may equip it; empty for carry and repair items. */
  classifications: MountCategory[];
  /** As printed — some cost reputation on top, and one is "Various". */
  price: string;
  /** Armaments marked "proprietary mounts only" cannot go on a rented mount. */
  proprietaryOnly?: boolean;
  notes?: string;
  sourceBook: string;
}

function gear(
  kind: MountGearKind,
  name: string,
  classifications: MountCategory[],
  price: string,
  notes?: string,
  proprietaryOnly?: boolean,
): MountGearDefinition {
  return { id: mountId(name), name, kind, classifications, price, notes, proprietaryOnly, sourceBook: CORE3 };
}

const BEASTS: MountCategory[] = ['animal', 'mythicalBeast'];
const ALL_MOUNTS: MountCategory[] = ['animal', 'mythicalBeast', 'magitech'];

export const MOUNT_GEAR: MountGearDefinition[] = [
  // Mount Weapons, p. 250
  gear('weapon', 'Big Horn', BEASTS, '800', 'Damage +1'),
  gear('weapon', 'Sideblade', ['magitech'], '800', 'Accuracy check -1, Damage +2'),
  gear('weapon', 'Iron Rivet', BEASTS, '2,000', 'Damage +2'),
  gear('weapon', 'Flicker Hammer', ALL_MOUNTS, '3,000', 'Accuracy +1'),
  gear('weapon', 'Flicker Star', ALL_MOUNTS, '3,000 + 20 reputation', 'Accuracy +1', true),
  gear('weapon', 'Blade Horn', BEASTS, '5,000', 'Damage +3'),
  gear('weapon', 'Metal Horn', BEASTS, '5,000 + 20 reputation', 'Damage +3', true),
  gear('weapon', 'Manatite Plating', ALL_MOUNTS, '15,000', 'Damage +4'),
  gear('weapon', 'Manatite Horn', ALL_MOUNTS, '15,000 + 50 reputation', 'Damage +4', true),

  // Mount Armor, p. 250
  gear('armor', 'Leather Barding', BEASTS, '300', 'Defense +1'),
  gear('armor', 'Chain Barding', BEASTS, '1,000', 'Defense +2'),
  gear('armor', 'Anti-Magic Seal', ['magitech'], '2,000', 'Magic Damage -1'),
  gear('armor', 'Plate Barding', BEASTS, '3,000', 'Defense +3'),
  gear('armor', 'Blank Plate', ['magitech'], '3,000', 'Maximum HP +10'),
  gear('armor', 'Wind Coat', BEASTS, '4,000', 'Evasion +1, Defense +2'),
  gear('armor', 'Resist Barrier', ['magitech'], '8,000', 'Magic Damage -2'),
  gear('armor', 'Gardner Shell', ALL_MOUNTS, '12,000', 'Evasion -1, Defense +4'),

  // Mount Carry Items, pp. 248–249
  gear('carry', 'Mount Contract', BEASTS, '250+', 'Rent and carry an animal or mythical beast'),
  gear('carry', 'Mount Contract Sphere', ['magitech'], '300+', 'Rent and carry a magitech mount'),
  gear('carry', 'Proprietary Mount Contract', BEASTS, '0', 'Carry a purchased animal or mythical beast'),
  gear('carry', 'Proprietary Mount Sphere', ['magitech'], '0', 'Carry a purchased magitech mount'),
  gear('carry', 'Mount Reduction Tag I', BEASTS, '100', 'Carries a beast of level 3 or lower; out and back with a Minor Action'),
  gear('carry', 'Mount Reduction Tag II', BEASTS, '500', 'Carries a beast of level 7 or lower'),
  gear('carry', 'Mount Reduction Tag III', BEASTS, '2,000', 'Carries a beast of level 13 or lower'),
  gear('carry', 'Manabike Storage Sphere', ['magitech'], '10,000', 'Carries a magitech mount'),

  // Mount Regeneration Items, p. 249
  gear('regeneration', 'Secret Medicine of Section Regeneration', BEASTS, 'Various', 'Restores a disabled section to 1 HP in 10 minutes'),
  gear('regeneration', 'Restore Kit', ['magitech'], '5,000', 'Repairs a destroyed magitech in 1 hour'),
];

export function listMountsByCategory(category: MountCategory): MountDefinition[] {
  return MOUNTS.filter((mount) => mount.category === category);
}

export function getMount(id: string): MountDefinition | undefined {
  return MOUNTS.find((mount) => mount.id === id);
}

export function listMountGear(kind: MountGearKind): MountGearDefinition[] {
  return MOUNT_GEAR.filter((entry) => entry.kind === kind);
}

/**
 * The level a mount is actually used at: the jockey's Adventurer Level, floored at the
 * mount's minimum (below it the mount cannot be handled at all) and capped at its maximum,
 * which is the rule that keeps a Horse from scaling with a level 15 rider.
 */
export function mountLevelFor(mount: MountDefinition, adventurerLevel: number): number {
  const [min, max] = mount.appropriateLevel;
  return Math.min(Math.max(adventurerLevel, min), max);
}

/** Every section's row at the given level — one entry for a single-section mount. */
export function rowsAtLevel(mount: MountDefinition, level: number): MountLevelRow[] {
  return mount.levels.filter((row) => row.level === level);
}

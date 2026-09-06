/**
 * Equipment catalog — Core Rulebook III pp. 206–224, transcribed in
 * docs/sheet-content/15-items-core3.md.
 *
 * Core III does not reprint the shop; it appends new lines to every weapon and armor
 * category, mostly at SS rank. So this catalog is deliberately partial: it holds what that
 * book adds and nothing from Core I/II, whose tables have never been transcribed. The
 * pickers on the sheet fill a row in and leave it editable, and typing a weapon by hand
 * still works exactly as before — that is the only way to enter a Longsword.
 *
 * Numbers only, like the spell, arts and feat catalogs. `notes` carries the short
 * mechanical annotations the book prints in the table itself (Slayer, Type Weapon,
 * Auto-Return, Mount Protection, "Grappler only"), never the effect paragraph: the
 * research docs hold those in Russian alone, and each row on the sheet has its own note.
 *
 * Crit Value is drawn as a circled glyph rather than typeset, so every value here was read
 * off a rendered page (scripts/render-pdf-pages.mjs), not off the text layer — which, in
 * the narrow SS tables, also shuffles values between neighbouring rows.
 */
import type { EquipmentRank } from '../types/character';

const CORE3 = 'Core Rulebook III';

/** Slug of the printed name. The "+" is spelled out rather than dropped: Mana Coat and
 *  Mana Coat+ are two different pieces of armor at two different prices, and stripping the
 *  sign would collapse them into one id. */
export function equipmentId(name: string): string {
  return name
    .toLowerCase()
    .replace(/\+/g, ' plus ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export const WEAPON_CATEGORIES = [
  'sword',
  'axe',
  'spear',
  'mace',
  'staff',
  'flail',
  'warhammer',
  'wrestling',
  'thrown',
  'bow',
  'crossbow',
  'gun',
] as const;
export type WeaponCategory = (typeof WEAPON_CATEGORIES)[number];

/**
 * One line of a weapon's table row. A weapon printed with two grips (1H plus the 2H line
 * under it, or the slashing/piercing pair) has one entry per grip, because the numbers —
 * Power, Crit Value, even Min STR — differ between them and the sheet stores one set.
 *
 * `stance` keeps the book's exact code, including the markers explained in
 * docs/sheet-content/15-items-core3.md: `1HR` is the mounted line a Jockey uses, `1H*` is
 * throwable, `1H#`/`2H#` occupy no hand, `1HW` is worn on the hand, `2Hs`/`2Hp` are the
 * slashing and piercing grips. The sheet's own stance field only knows 1H/2H/special, so
 * the picker maps these down and writes the original code into the row's note.
 */
export interface WeaponStanceRow {
  stance: string;
  minStr: number;
  accuracy: number;
  /** Absent for guns: the book prints no Power for them, the bullet carries it. */
  power?: number;
  criticalValue: number;
  extraDamage: number;
}

export interface WeaponDefinition {
  id: string;
  name: string;
  category: WeaponCategory;
  rank: EquipmentRank;
  rows: WeaponStanceRow[];
  /** As printed, e.g. "2(20m)" — kept as text because that is both a zone and a distance. */
  range?: string;
  /** Guns only. */
  magazine?: number;
  /** In gamels. Undefined for Bite, which the book prices at nothing — it is a body part. */
  price?: number;
  notes?: string;
  sourceBook: string;
}

function weapon(
  category: WeaponCategory,
  rank: EquipmentRank,
  name: string,
  rows: WeaponStanceRow[],
  extra: Partial<WeaponDefinition> = {},
): WeaponDefinition {
  return { id: equipmentId(name), name, category, rank, rows, sourceBook: CORE3, ...extra };
}

/** Shorthand for a melee line: stance, Min STR, Accuracy, Power, Crit, Add'l Dmg. */
function row(stance: string, minStr: number, accuracy: number, power: number, criticalValue: number, extraDamage: number): WeaponStanceRow {
  return { stance, minStr, accuracy, power, criticalValue, extraDamage };
}

export const WEAPONS: WeaponDefinition[] = [
  // Swords — pp. 207–208
  weapon('sword', 'B', 'Weakness Revealer', [row('1H', 5, 0, 5, 10, 0)], { price: 7660 }),
  weapon('sword', 'A', 'Main Gauche', [row('1H', 6, 0, 6, 10, 0)], { price: 620 }),
  weapon('sword', 'S', "Executioner's Blade", [row('1H', 20, 1, 30, 10, 1), row('2H', 20, 1, 40, 10, 1)], { price: 30000 }),
  weapon('sword', 'SS', 'Angel Feather', [row('1H', 2, 2, 17, 10, 1)], { price: 40000 }),
  weapon('sword', 'SS', 'Moon Pillar', [row('1H', 10, 1, 30, 10, 1)], { price: 48000 }),
  weapon('sword', 'SS', 'Hyperion', [row('1H', 20, 1, 40, 10, 1), row('2H', 20, 1, 50, 10, 3)], { price: 57000 }),
  weapon('sword', 'SS', 'Geister', [row('2H', 30, 1, 70, 10, 3)], { price: 83000 }),

  // Axes — p. 208
  weapon('axe', 'A', 'Arm Catcher', [row('2H', 17, 0, 37, 11, 0)], { price: 2480 }),
  weapon('axe', 'S', 'Death Scythe', [row('2H', 17, 1, 42, 11, 1), row('2H', 17, 1, 52, 11, 1)], { price: 26000 }),
  weapon('axe', 'SS', 'Rimahawk', [row('1H*', 8, 1, 28, 11, 1)], { price: 50000, range: '2(20m)', notes: 'Auto-Return' }),
  weapon('axe', 'SS', 'Urgosh, Silvered', [row('2Hs', 20, -1, 55, 11, 0), row('2Hp', 20, -1, 50, 10, 0)], { price: 64000 }),
  weapon('axe', 'SS', 'Agahast', [row('2Hs', 27, 1, 62, 11, 3), row('2Hp', 27, 1, 57, 10, 3)], { price: 65000 }),
  weapon('axe', 'SS', 'Dynast', [row('2H', 40, -1, 90, 11, 3)], { price: 83000 }),

  // Spears — p. 209
  weapon('spear', 'A', 'Normal Lance', [row('1H', 20, -1, 25, 10, 0), row('1HR', 20, -1, 35, 10, 0)], { price: 1200 }),
  weapon('spear', 'S', 'Heavy Lance', [row('1H', 25, -1, 35, 10, 0), row('1HR', 25, -1, 45, 10, 0)], { price: 8280 }),
  weapon('spear', 'SS', 'Eclair', [row('1H*', 7, 1, 27, 10, 1)], { price: 61000, range: '2(20m)' }),
  weapon('spear', 'SS', 'Tri-Lux', [row('1H', 17, 0, 42, 10, 1), row('2H', 17, 1, 47, 10, 3)], { price: 54000 }),
  weapon('spear', 'SS', 'Fatal Lance', [row('1H', 25, 0, 45, 10, 1), row('1HR', 25, 0, 55, 10, 1)], { price: 67000 }),
  weapon('spear', 'SS', 'Ductus Lancair', [row('2H', 30, 0, 65, 10, 3)], { price: 68000 }),

  // Maces — p. 210
  weapon('mace', 'A', 'Molder', [row('2H', 30, 2, 50, 12, 0)], { price: 16500, notes: 'Slayer +2 (Undead, Constructs, Magitechs)' }),
  weapon('mace', 'S', 'Power Capper', [row('1H', 23, 3, 33, 12, 1), row('2H', 23, 3, 43, 12, 1)], { price: 38000 }),
  weapon('mace', 'SS', 'Bloody Lily', [row('1H', 14, 3, 34, 12, 1)], { price: 50000 }),
  weapon('mace', 'SS', 'Skullsludger', [row('1H', 20, 2, 40, 12, 1), row('2H', 20, 2, 50, 12, 3)], {
    price: 63000,
    notes: 'Slayer +3 (Humanoids, Barbarous, Animals, Mythical Beasts)',
  }),
  weapon('mace', 'SS', 'Zeno', [row('2H', 33, 3, 68, 12, 3)], { price: 65000 }),

  // Staves — p. 211
  weapon('staff', 'B', 'Staff of Control', [row('2H', 1, 2, 11, 12, 1)], { price: 14840, notes: "Wearer's Defense +1" }),
  weapon('staff', 'SS', 'Aeon', [row('2H', 8, 1, 38, 12, 3)], { price: 78000 }),
  weapon('staff', 'SS', 'Uroboros', [row('2H', 14, 2, 49, 12, 3)], { price: 136000 }),

  // Flails — pp. 211–212
  weapon('flail', 'B', 'Balanced Pendulum', [row('2H', 22, 0, 42, 10, 0)], { price: 7780 }),
  weapon('flail', 'S', 'Daemonthresher', [row('1H', 24, -1, 34, 9, 0)], { price: 12000 }),
  weapon('flail', 'SS', 'Silver Comet', [row('1H', 15, 0, 35, 9, 1), row('2H', 15, 0, 45, 9, 3)], { price: 59000 }),
  weapon('flail', 'SS', 'Quadblaze', [row('1H', 26, 0, 26, 10, 1)], { price: 69000, notes: 'Type Weapon (Fire) +3/MP Cost 3' }),
  weapon('flail', 'SS', 'Tyrant', [row('2H', 38, 0, 38, 10, 3)], { price: 78000 }),

  // Warhammers — pp. 212–213
  weapon('warhammer', 'B', 'Golden Mattocks', [row('2H', 20, -1, 40, 10, 1)], { price: 11880 }),
  weapon('warhammer', 'A', 'Shock Hammer', [row('1H', 12, 0, 22, 10, 1)], { price: 15700 }),
  weapon('warhammer', 'S', 'Heart Tracker', [row('1H', 16, 0, 31, 10, 0)], { price: 52600 }),
  weapon('warhammer', 'SS', 'Eversio', [row('1H*', 8, -1, 33, 9, 1)], { price: 57000, range: '2(20m)' }),
  weapon('warhammer', 'SS', 'Rosenhagen', [row('1H', 19, 0, 29, 8, 1), row('2H', 19, -1, 39, 8, 3)], { price: 70000 }),
  weapon('warhammer', 'SS', 'Gaiacleaver', [row('2H', 35, -2, 85, 10, 3)], { price: 88000 }),

  // Wrestling — p. 214
  weapon('wrestling', 'B', 'Bite', [row('2H#', 1, 0, 11, 10, 0)], { notes: 'Bite is needed' }),
  weapon('wrestling', 'SS', 'Whirl Catcher', [row('2H', 5, 2, 20, 11, 3)], { price: 40000, notes: 'Grappler only; improves Throw' }),
  weapon('wrestling', 'SS', 'Hands Of Glory', [row('1HW', 10, 1, 30, 11, 1)], {
    price: 45000,
    notes: "Grappler only; improves punches; wearer's Defense +1",
  }),
  weapon('wrestling', 'SS', 'Legs Of Honor', [row('1H#', 10, 0, 40, 12, 1)], {
    price: 55000,
    notes: "Grappler only; improves kicks; wearer's Defense +1 (stacks with other Defense weapons)",
  }),
  weapon('wrestling', 'SS', 'Groul', [row('1H', 15, 2, 25, 11, 1)], { price: 50000, notes: 'Grappler only; improves punches' }),
  weapon('wrestling', 'SS', 'Grand Ariol', [row('1H#', 15, 1, 35, 11, 1)], { price: 60000, notes: 'Grappler only; improves kicks' }),

  // Thrown weapons — pp. 214–215. The book's SS thrown table also repeats Eclair, Rimahawk
  // and Eversio with identical numbers; they are single entries here, under the melee
  // category the book gives them first, and their "1H*" stance is what marks them throwable.
  weapon('thrown', 'B', 'Throwing Star', [row('1H*', 1, 1, 1, 10, 0)], { price: 200, range: '1(10m)' }),
  weapon('thrown', 'A', 'Boomerang', [row('1H*', 8, 1, 18, 12, 0)], { price: 500, range: '2(20m)', notes: 'Auto-Return (only on miss)' }),
  weapon('thrown', 'SS', 'Tri-Edge', [row('1H*', 15, 2, 35, 10, 1)], { price: 62000, range: '2(20m)', notes: 'Auto-Return' }),

  // Bows — pp. 215–216
  weapon('bow', 'B', 'Bold Assertor', [row('2H', 22, 1, 32, 10, 1)], { price: 7770, range: '2(20m)' }),
  weapon('bow', 'S', 'Avenger Bow', [row('2H', 17, 1, 37, 10, 0)], { price: 32000, range: '2(40m)', notes: 'Slayer +2 (Humanoid, Barbarous)' }),
  weapon('bow', 'SS', 'Hitmaker', [row('2H', 12, 3, 37, 10, 3)], { price: 50000, range: '2(40m)' }),
  weapon('bow', 'SS', 'Le Indalia', [row('2H', 18, 1, 43, 10, 3)], { price: 62000, range: '2(40m)', notes: 'Type Weapon (Wind) +2/MP Cost 1' }),
  weapon('bow', 'SS', 'Hand Sticker', [row('2H', 24, 1, 49, 10, 3)], { price: 67000, range: '2(40m)', notes: 'Slayer +3 (Humanoids, Barbarous)' }),
  weapon('bow', 'SS', 'Eight Mambo', [row('2H', 30, 1, 60, 10, 3)], { price: 68000, range: '2(60m)' }),

  // Crossbows — pp. 216–217
  weapon('crossbow', 'B', 'Beast Buster', [row('2H', 15, 1, 30, 10, 2)], {
    price: 7280,
    range: '2(30m)',
    notes: 'Slayer +2 (Animals, Mythical Beasts)',
  }),
  weapon('crossbow', 'SS', 'Zagran', [row('2H', 8, 1, 43, 10, 5)], { price: 56000, range: '2(30m)' }),
  weapon('crossbow', 'SS', 'Calvaria', [row('2H', 14, 1, 49, 10, 6)], { price: 67000, range: '2(30m)', notes: 'Switches between crossbow and shield form' }),
  weapon('crossbow', 'SS', 'Sortrel', [row('2H', 20, 1, 50, 10, 7)], { price: 72000, range: '2(40m)', notes: 'Type Weapon (Fire) +3/MP Cost 3' }),
  weapon('crossbow', 'SS', 'Garde', [row('2H', 26, 1, 56, 10, 9)], { price: 76000, range: '2(40m)' }),

  // Guns — p. 217. No Power column in the book: the bullet carries it.
  weapon('gun', 'A', 'Smart Carbine', [{ stance: '2H', minStr: 5, accuracy: -1, criticalValue: 10, extraDamage: 2 }], {
    price: 1200,
    range: '2(30m)',
    magazine: 4,
    notes: 'Easy to fire while riding',
  }),
  weapon('gun', 'SS', 'Masquerade', [{ stance: '1H', minStr: 5, accuracy: 2, criticalValue: 10, extraDamage: 2 }], {
    price: 50000,
    range: '1(10m)',
    magazine: 4,
  }),
  weapon('gun', 'SS', 'Choreadora', [{ stance: '2H', minStr: 10, accuracy: 2, criticalValue: 10, extraDamage: 4 }], {
    price: 55000,
    range: '2(40m)',
    magazine: 3,
  }),
  weapon('gun', 'SS', 'Full Fire', [{ stance: '2H', minStr: 15, accuracy: 1, criticalValue: 10, extraDamage: 4 }], {
    price: 60000,
    range: '2(30m)',
    magazine: 8,
  }),
  weapon('gun', 'SS', 'Desperado', [{ stance: '2H', minStr: 20, accuracy: 3, criticalValue: 11, extraDamage: 6 }], {
    price: 80000,
    range: '2(60m)',
    magazine: 2,
  }),
];

export const ARMOR_KINDS = ['nonmetallic', 'metal'] as const;
export type ArmorKind = (typeof ARMOR_KINDS)[number];

export interface ArmorDefinition {
  id: string;
  name: string;
  kind: ArmorKind;
  rank: EquipmentRank;
  minStr: number;
  evasion: number;
  defense: number;
  price: number;
  notes?: string;
  sourceBook: string;
}

function armor(
  kind: ArmorKind,
  rank: EquipmentRank,
  name: string,
  minStr: number,
  evasion: number,
  defense: number,
  price: number,
  notes?: string,
): ArmorDefinition {
  return { id: equipmentId(name), name, kind, rank, minStr, evasion, defense, price, notes, sourceBook: CORE3 };
}

export const ARMORS: ArmorDefinition[] = [
  // Nonmetallic — p. 218
  armor('nonmetallic', 'B', 'Mana Coat', 1, 0, 0, 28000, "Defense equals the wearer's INT modifier, up to 6"),
  armor('nonmetallic', 'B', 'Mana Coat+', 1, 0, 0, 52000, "Defense equals the wearer's INT modifier, up to 8"),
  armor('nonmetallic', 'B', 'Combat Maid/Butler Outfit', 10, 1, 0, 24000, 'Grapplers may equip; Magic Damage -3'),
  armor('nonmetallic', 'A', 'Windbreaker Surcoat', 12, 1, 3, 10500, 'Automatically evades a wind-type effect once a day'),
  armor('nonmetallic', 'SS', 'Astral Guard', 6, 1, 7, 34000, 'Magic Damage -3'),
  armor('nonmetallic', 'SS', 'Silent Cloak', 11, 1, 8, 38000, 'Hide checks +2'),
  armor('nonmetallic', 'SS', 'Alabaster Shell', 14, 1, 9, 41000),
  armor('nonmetallic', 'SS', 'Phoenix Cloak', 17, 2, 8, 45000, 'Grappler only'),
  armor('nonmetallic', 'SS', 'Divine Skin', 18, 1, 10, 52000, 'Willpower +2'),

  // Metal — p. 219
  armor('metal', 'B', "Dontrecia's Armor of Perseverance", 20, 0, 6, 12700, 'Defense +2 for each physical damage'),
  armor('metal', 'A', "Dontrecia's Great Armor of Perseverance", 21, 0, 8, 26400, 'Defense +2 for each physical damage'),
  armor('metal', 'S', 'Powered Plates', 14, 0, 8, 28000, 'Evasion check +1 after the fact for 3 MP'),
  armor('metal', 'S', "Dontrecia's Stiff Armor of Perseverance", 22, 0, 10, 54800, 'Defense +2 for each physical damage'),
  armor('metal', 'SS', 'Manatite Frame', 18, 0, 11, 62000),
  armor('metal', 'SS', 'Anti-Arquebus', 23, 0, 12, 79000, 'Gun damage reduced by -5'),
  armor('metal', 'SS', 'Imperial', 30, -1, 14, 100000, 'Magic Damage -3'),
];

export interface ShieldDefinition {
  id: string;
  name: string;
  rank: EquipmentRank;
  minStr: number;
  evasion: number;
  defense: number;
  price: number;
  /** The shield's Defense also covers every section of the Jockey's mount (p. 220). */
  mountProtection: boolean;
  notes?: string;
  sourceBook: string;
}

function shield(
  rank: EquipmentRank,
  name: string,
  minStr: number,
  evasion: number,
  defense: number,
  price: number,
  mountProtection = false,
  notes?: string,
): ShieldDefinition {
  return { id: equipmentId(name), name, rank, minStr, evasion, defense, price, mountProtection, notes, sourceBook: CORE3 };
}

export const SHIELDS: ShieldDefinition[] = [
  shield('B', "Asteria's Defense", 6, 0, 2, 40000, false, 'Earth, water/ice, fire and wind damage -3'),
  shield('B', 'Calvaria', 14, 0, 3, 67000, false, 'Switches between shield and crossbow form'),
  shield('A', 'Knight Shield', 15, 0, 2, 1250, true),
  shield('S', 'Grand Partner', 18, 0, 3, 4800, true),
  shield('S', 'Turtle Shell', 5, 2, 1, 19200),
  shield('SS', 'Half Moon', 6, 2, 2, 33000),
  shield('SS', 'Glorious', 15, 1, 5, 47000),
  shield('SS', "Paladin's Pride", 21, 0, 6, 54000, true),
  shield('SS', 'Eternal Lord', 24, 0, 7, 65000),
];

export const GENERAL_ITEM_CATEGORIES = ['clothing', 'travel', 'potion', 'repair', 'classItem', 'adventure', 'accessory', 'ammunition'] as const;
export type GeneralItemCategory = (typeof GENERAL_ITEM_CATEGORIES)[number];

/**
 * Everything on pp. 221–224 that is neither weapon nor armor: clothing, fares, potions,
 * repair tape, class tools, adventure gear, accessories and ammunition.
 *
 * `price` is a string, not a number, because the book's own prices are not all numbers —
 * "100 + 10 reputation", "20+", "20 - 20,000", "2,120/6,120" are printed exactly like that,
 * and rounding them into an integer would quietly invent a price the book never gives.
 */
export interface GeneralItemDefinition {
  id: string;
  name: string;
  category: GeneralItemCategory;
  /** Accessories only: the body slot the book files them under. */
  slot?: string;
  /** Weapons-style stance where the book prints one (1H tools), otherwise undefined. */
  stance?: string;
  price: string;
  notes?: string;
  sourceBook: string;
}

function item(
  category: GeneralItemCategory,
  name: string,
  price: string,
  notes?: string,
  extra: Partial<GeneralItemDefinition> = {},
): GeneralItemDefinition {
  return { id: equipmentId(name), name, category, price, notes, sourceBook: CORE3, ...extra };
}

export const GENERAL_ITEMS: GeneralItemDefinition[] = [
  // Clothing and travel — p. 221
  item('clothing', 'Stylish Riding Clothes', '100 + 10 reputation', 'Riding checks +1'),
  item('travel', 'Carriage Fare', '10', 'One hour of travel; +5G per further hour'),
  item('travel', 'Magical Train Fare', '20+', 'About 12 hours, second class; first class 50+'),
  item('travel', 'Airfreight Fare', '500+', 'Per itinerary per day, fare only'),
  item('travel', 'Charter Wagon', '500+', 'Per day with coachman: 500 for one passenger, 750 for two, 1,000 for four'),
  item('travel', 'Small Airship Charter', '20,000+', 'Per day, crew and their expenses included'),

  // Potions and repair tools — pp. 221–222
  item('potion', 'Antidote Potion III', '10,000', 'Removes poison effects with success value 25 or less'),
  item('potion', 'Cure Stone Potion III', '10,000', 'Removes petrification with success value 25 or less; can be sprinkled'),
  item('potion', 'Scarlet Potion', '1,400', 'Temporarily increases HP'),
  item('repair', 'Repair Tape I', '200', 'Restores Power 10 to a construct or magitech'),
  item('repair', 'Repair Tape II', '750', 'Restores Power 40 to a construct or magitech'),
  item('repair', 'Repair Tape III', '3,000', 'Restores Power 70 to a construct or magitech'),

  // Class-specific items — p. 222
  item('classItem', 'Mechanized Fingers', '7,080', "Disable Device +2 for 2 MP; also works as Scout's Tools", { stance: '1H' }),
  item('classItem', "Apothecary's Tools", '200', 'Stabilizes herb recovery (1d+4 on the Power Table)', { stance: '2H' }),
  item('classItem', 'Magic Pipe', '1,360', '+1 to herb recovery on yourself', { stance: '1H' }),
  item('classItem', 'Alchemy Kit', '200', 'Allows use of Evocations', { stance: 'Right Hand, Left Hand, Waist, Other' }),
  item('classItem', 'Card Shooter', '1,500', 'Increases the range of Evocations', { stance: '1H' }),
  item('classItem', 'Material Card', '20 - 20,000', 'Consumed by Evocations'),
  item('classItem', 'Tiny Armor', '2,120/6,120', "Familiar's Defense +3/+6"),

  // Adventure tools — p. 223
  item('adventure', 'Chalk of the Lost', '1,200', 'Lights up when you pass the mark again', { stance: '1H' }),
  item('adventure', 'Puzzling Sign', '4,880', 'Baffles intelligent enemies', { stance: '1H' }),
  item('adventure', 'Mana Cartridge', '5,200/17,200 (+50 reputation)', 'Adds MP to magitech'),
  item('adventure', "Great Daemon's Crystallized Blood Plate", '6,400', 'Determines the threat level of a Shallow Abyss', { stance: '1H' }),
  item('adventure', 'Fairy Lantern', '10,000', 'Its light is invisible to those who have soulscars', { stance: '1H' }),

  // Accessories — pp. 223–225
  item('accessory', 'Cattleya Garland', '20,000', 'Extends the range of Fairy Magic', { slot: 'Head' }),
  item('accessory', "Goddess's Veil", '20,000', 'Rarely makes healing magic hyper-effective; women only', { slot: 'Head' }),
  item('accessory', 'Crown of Riches', '25,000', 'Roll per target and distribute when healing several; men only', { slot: 'Head' }),
  item('accessory', 'Night Goggles', '3,000', 'Can see in darkness', { slot: 'Face' }),
  item('accessory', "Hunter's Eyes", '9,600', "Failed Monster Knowledge still gives the target's level; success adds +1 Accuracy", { slot: 'Face' }),
  item('accessory', 'Linkpearls Holder', '3,000+', 'Several Linkpearls can be worn at once', { slot: 'Ear' }),
  item('accessory', "Stone Man's Earring", '6,640', 'Defense up, movement down', { slot: 'Ear' }),
  item('accessory', 'Miracle Necklace', '10,000', 'Reroll a Death Check', { slot: 'Neck' }),
  item('accessory', 'Curse Rebellion', '40,000', 'Damage to Daemons +3, damage from Daemons -3', { slot: 'Neck' }),
  item('accessory', 'Inverness, a Beautiful Star', '3,000', 'Creates Throwing Stars', { slot: 'Back' }),
  item('accessory', 'Smart Animal Sack', '9,000', '+1 to Search, Monster Knowledge, Notice, Danger Sense and Spot Trap', { slot: 'Back' }),
  item('accessory', 'Level Ring', '500', 'Highest ability score -1, lowest +2', { slot: 'Hand' }),
  item('accessory', 'Big Gloves', '8,000', 'Equip a weapon or shield with Min STR 5 above your own; priced as a pair', { slot: 'Hand' }),
  // The book prices this one twice: 30,000 in the summary table on p. 224, 8,000 on its own
  // card on p. 243. The card wins here, as it does for every other item.
  item('accessory', 'Ring of Righteous Belief', '8,000', 'Willpower +2 (the summary table on p. 224 prints 30,000 instead)', { slot: 'Hand' }),
  item('accessory', 'Sunflower Buckle', '1,500', 'Fortitude and Willpower against undead +1', { slot: 'Waist' }),
  item('accessory', 'Green Belt', '35,000', 'The wearer counts as being in a natural environment', { slot: 'Waist' }),
  item('accessory', 'Light Boots', '11,600', 'Cannot fall prone', { slot: 'Feet' }),
  item('accessory', 'Thieves Boots', '20,000', 'Teleport 2m', { slot: 'Feet' }),
  item('accessory', 'Sign of Valor', '10,000', 'Steers ability growth; three kinds — Skill, Body, Mind', { slot: 'Any' }),

  // Ammunition — p. 217
  item('ammunition', 'Kaburaya', '5', 'Whistles when shot from a bow'),
  item('ammunition', 'Dragon Arrow/Quarrel', '44,800', 'Fire magic damage in "Area: Line"; always recoverable'),
];

/**
 * Ignidite (weapons) and Extra Manatite (metal armor and shields), Core III pp. 245–246,
 * plus what the Core II enhancements cost once the item is SS rank — a price Core II could
 * not print, because SS did not exist yet.
 */
export const CORE3_ENHANCEMENT_PRICES = {
  ignidite: { B: 5000, A: 10000, S: 20000, SS: 40000 },
  extraManatite: { B: 5000, A: 10000, S: 20000, SS: 30000 },
} as const;

export function listWeaponsByCategory(category: WeaponCategory): WeaponDefinition[] {
  return WEAPONS.filter((entry) => entry.category === category);
}

export function getWeapon(id: string): WeaponDefinition | undefined {
  return WEAPONS.find((entry) => entry.id === id);
}

export function getArmor(id: string): ArmorDefinition | undefined {
  return ARMORS.find((entry) => entry.id === id);
}

export function getShield(id: string): ShieldDefinition | undefined {
  return SHIELDS.find((entry) => entry.id === id);
}

/** Names for the inventory row's datalist — everything that is carried rather than worn. */
export const GENERAL_ITEM_NAMES: string[] = GENERAL_ITEMS.map((entry) => entry.name);

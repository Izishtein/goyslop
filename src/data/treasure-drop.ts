/**
 * Treasure Drop — the § 3 optional system (Epic Treasury pp. 69-75), transcribed in
 * docs/sheet-content/21-treasure-drop.md.
 *
 * A GM tool, not player data: the GM spends Treasure Points to give a monster combat
 * abilities from the Enhancement Abilities List, and defeating it earns the PCs those same
 * points back to roll on a Treasure Drop Table for loot. Nothing here binds to a character
 * — an item a player gets is typed into the sheet's existing free-text Inventory, the same
 * as anything bought at a shop. So there is no KnownX row shape and no CharacterSchema
 * change; this file only backs a browsable GM reference.
 *
 * Item entries are index only — name and Category/Classification as the book's loot tables
 * print them, nothing more. The book itself does not give these items mechanical stats in
 * this section (that lives in a separate, much larger "Items Detailed Data" section of the
 * book, out of scope here); a name and category is all there is to catalog.
 */

export interface TreasureDropRow {
  name: string;
  category: string;
}

export interface TreasureDropGroup {
  /** The 1d sub-table label as the book prints it: "1".."6" for tables A1-F (a second 1d
   *  picks the group before a third 1d picks the row), or "1-3"/"4-6" for tables G-L (one
   *  1d picks the half, a second 1d picks the row). */
  group: string;
  /** Six rows, index 0 = roll 1 .. index 5 = roll 6. */
  rows: TreasureDropRow[];
}

export interface TreasureDropTableDef {
  id: string;
  /** Table letter as the book names it — "A1" and "A2" are rolled between with a single 1d
   *  (1-3 picks A1, 4-6 picks A2) before either behaves like any other table. */
  table: string;
  points: number;
  groups: TreasureDropGroup[];
  /** Footnotes printed under the table, verbatim. */
  footnotes?: string[];
}

function row(name: string, category: string): TreasureDropRow {
  return { name, category };
}

function group(label: string, rows: TreasureDropRow[]): TreasureDropGroup {
  return { group: label, rows };
}

export const TREASURE_DROP_TABLES: TreasureDropTableDef[] = [
  {
    id: 'a1',
    table: 'A1',
    points: 1,
    groups: [
      group('1', [
        row('Wand of Endurance', 'Class-Specific Items'),
        row('Disturbing Scarecrow I', 'Adventure Tools'),
        row('Mystic Ink', 'Adventure Tools'),
        row('Snake Arrow', 'Ammunition'),
        row('Wall Base', 'Adventure Tools'),
        row("Smaltier's Ability-Enhancing Bracelet*", 'Accessory: Hand'),
      ]),
      group('2', [
        row('Frenzy Drink', 'Potions'),
        row('Fairy Drop', 'Class-Specific Items'),
        row('Magisphere (Large)', 'Class-Specific Items'),
        row('Auto Looter', 'Adventure Tools'),
        row('Northern Needles', 'Adventure Tools'),
        row('Telescope', 'Adventure Tools'),
      ]),
      group('3', [
        row('Magitorch', 'Adventure Tools'),
        row('Message Rouge', 'Adventure Tools (Consumables)'),
        row('Bonding Sunlight Charm (+1)', 'Adventure Tools (Consumables)'),
        row('Bonding Moonlight Charm (+1)', 'Adventure Tools (Consumables)'),
        row('Sunglasses', 'Accessory: Face'),
        row('Weapon Holder', 'Accessory: Back'),
      ]),
      group('4', [
        row('Ability-Enhancing Bracelet*', 'Accessory: Hand'),
        row('Arbalest', 'Crossbow A'),
        row('Bloomhead Bolt (12)', 'Ammunition'),
        row('Breast Armor', 'Nonmetallic Armor A'),
        row('Heater Shield', 'Shield A'),
        row('Cymbal Shield', 'Special Instrument/Shield A'),
      ]),
      group('5', [
        row('Glass Buckler', 'Shield B'),
        row('Soliferrum', 'Thrown Weapon A'),
        row('Halberd', 'Axe A'),
        row('Shellbreaker', 'Mace A'),
        row('Chain Stick', 'Wrestling A'),
        row('Chalk of the Lost', 'Adventure Tools'),
      ]),
      group('6', [
        row('Dinojaw', 'Axe A'),
        row('Normal Lance', 'Spear A'),
        row('Rising Sun', 'Flail A'),
        row('Fast Bow', 'Bow A'),
        row('Jezail', 'Gun B'),
        row('Smart Carbine', 'Gun B'),
      ]),
    ],
    footnotes: ['*Corresponding ability values are determined at random.'],
  },
  {
    id: 'a2',
    table: 'A2',
    points: 1,
    groups: [
      group('1', [
        row('Plate Armor', 'Metal Armor'),
        row('Knight Shield', 'Shield A'),
        row('Hard Kicker', 'Wrestling A'),
        row('Hanger of the Sun God', 'Adventure Tools'),
        row('Magic Pipe', 'Class-Specific Items'),
        row("Pallas's Maraca", 'Special Instrument/Mace A'),
      ]),
      group('2', [
        row('Bludgeon', 'Mace S'),
        row('Water Balloon*', 'Thrown Weapon B'),
        row('Scarlet Potion', 'Potion'),
        row('Magic Arrow or Quarrel**', 'Ammunition'),
        row('Steel Blade', 'Sword A'),
        row('Unpiercing Pick', 'Warhammer A'),
      ]),
      group('3', [
        row('Thami', 'Crossbow A'),
        row('Mako Charge Crystal (5 pts.)', 'Class-Specific Items'),
        row('Card Shooter', 'Class-Specific Items'),
        row('Sunlight Charm (+2)', 'Adventure Tools (Consumables)'),
        row('Moonlight Charm (+2)', 'Adventure Tools (Consumables)'),
        row('Lightning-Bolt Hairpin', 'Accessory: Head'),
      ]),
      group('4', [
        row('Salamander Hairpin', 'Accessory: Head'),
        row('Snowflake Hairpin', 'Accessory: Head'),
        row('Squealing Choker', 'Accessory: Neck'),
        row('Coward Belt', 'Accessory: Waist'),
        row('Sunflower Buckle', 'Accessory: Waist'),
        row('Invincible Transformation Belt', 'Accessory: Waist'),
      ]),
      group('5', [
        row('Cranequin', 'Crossbow A'),
        row('Healing Horn Arrow', 'Ammunition'),
        row('Goedendag', 'Flail A'),
        row('Flamberge', 'Sword A'),
        row("Strong Tabbit's Carrot", 'Chemicals'),
        row('Recording Earrings', 'Accessory: Ear'),
      ]),
      group('6', [
        row('Repeater Crossbow', 'Crossbow'),
        row('Steel Guard', 'Metal Armor A'),
        row('Missile Trapper', 'Accessory: Waist'),
        row('Smoke Grapher', 'Adventure Tools'),
        row('Ribbon of Lovely Transformation', 'Accessory: Neck'),
        row('Pike', 'Spear A'),
      ]),
    ],
    footnotes: ['*Determine the number of items with 1d.', '**PCs choose whether to get arrows or quarrels.'],
  },
  {
    id: 'b',
    table: 'B',
    points: 2,
    groups: [
      group('1', [
        row('Defender', 'Sword A'),
        row('Bec-De-Corbin', 'Warhammer A'),
        row('Spiked Shield', 'Shield A'),
        row('String Bow', 'Special Instrument/Crossbow A'),
        row('Bayonet', 'Adventure Tools'),
        row('Partisan', 'Spear S'),
      ]),
      group('2', [
        row('Antidote Potion II', 'Potion'),
        row('Cure Stone Potion II', 'Potion'),
        row('Dexterity Potion', 'Potion'),
        row('Speed Potions', 'Potion'),
        row('Mako Stone (10 pts.)', 'Class-Specific Items'),
        row('Material Card A* (10)', 'Class-Specific Items'),
      ]),
      group('3', [
        row('Material Card S*', 'Class-Specific Items'),
        row('Effect Cartridge', 'Adventure Tools'),
        row('Protective Holy Water', 'Adventure Tools'),
        row("Informer's Sticker", 'Adventure Tools (Consumables)'),
        row('Bonding Sunlight Charm (+2)', 'Adventure Tools (Consumables)'),
        row('Bonding Moonlight Charm (+2)', 'Adventure Tools (Consumables)'),
      ]),
      group('4', [
        row('Reckless Headband', 'Accessory: Head'),
        row('Safety Helmet', 'Accessory: Head'),
        row('Irritating Mask', 'Accessory: Face'),
        row('Ruby Glasses', 'Accessory: Face'),
        row('Taste Piercing', 'Accessory: Face'),
        row('Golden Earplugs', 'Accessory: Ear'),
      ]),
      group('5', [
        row('Lucky Charm', 'Accessory: Neck'),
        row('Skanda Boots', 'Accessory: Foot'),
        row('Water Spider Sandals', 'Accessory: Foot'),
        row('Protective Sandals', 'Accessory: Foot'),
        row('Tempest', 'Gun A'),
        row('Bone Vest', 'Nonmetallic Armor A'),
      ]),
      group('6', [
        row('Repel Candle', 'Adventure Tools'),
        row('Piercer', 'Sword S/Thrown Weapon S'),
        row("Smaltier's Listening Device", 'Accessory: Ear'),
        row('Disturbing Scarecrow II', 'Adventure Tools'),
        row('Hatchet', 'Axe S/Thrown Weapon S'),
        row("Temsgard's Chain Ball", 'Flail A/Thrown Weapon A'),
      ]),
    ],
    footnotes: ['*Card colors are determined at random.'],
  },
  {
    id: 'c',
    table: 'C',
    points: 3,
    groups: [
      group('1', [
        row('Fine Leather', 'Nonmetallic Armor S'),
        row('Stone of Vigilance', 'Adventure Tools'),
        row('Arm Catcher', 'Axe A'),
        row('Precision Tool Set', 'Class-Specific Items'),
        row('Stable Sight', 'Adventure Tools'),
        row('Wig of Chills', 'Accessory: Head'),
      ]),
      group('2', [
        row('Scorpion Tail', 'Flail A'),
        row('Chekan', 'Warhammer S'),
        row('Lynx Vest', 'Nonmetallic Armor S'),
        row('Dragonslayer', 'Sword A'),
        row('Careless Tag', 'Adventure Tools'),
        row('Watchful Doll', 'Accessory: Ear'),
      ]),
      group('3', [
        row('Trackless Boots', 'Accessory: Feet'),
        row('Alarm Gong', 'Adventure Tools'),
        row('Escape Marbles', 'Adventure Tools (Consumables)'),
        row('Hoplite Shield', 'Shield S'),
        row('Mighty Brittle', 'Shield B'),
        row('Anti-Magic Potion', 'Potion'),
      ]),
      group('4', [
        row('Medicine of Dreams', 'Potion'),
        row('Repair Tape III', 'Repair Tools'),
        row('Permanent Ice Fragment', 'Adventure Tools'),
        row('Pointed Hat', 'Accessory: Head'),
        row('Night Goggles', 'Accessory: Face'),
        row('Linkpearls Holder (for 2)', 'Accessory: Ear'),
      ]),
      group('5', [
        row('Crystal Necklace', 'Accessory: Neck'),
        row('Amulet Of Light', 'Accessory: Neck'),
        row('Inverness, a Beautiful Star', 'Accessory: Back'),
        row('Little Wing', 'Accessory: Back'),
        row('Black Belt', 'Accessory: Waist'),
        row('Golden Spurs', 'Accessory: Feet'),
      ]),
      group('6', [
        row('Mithril Fingers', 'Wrestling S'),
        row("Daemon's Crystallized Blood Plate", 'Adventure Tools'),
        row('Double Eel', 'Flail S'),
        row('Great Barrier', 'Shield A'),
        row("Efreet's Whisker*", 'Staff B'),
        row("Bat's Earrings", 'Accessory: Ear'),
      ]),
    ],
    footnotes: ['*Number of times used should be determined with 2d.'],
  },
  {
    id: 'd',
    table: 'D',
    points: 4,
    groups: [
      group('1', [
        row('Thermal Mantle', 'Accessory: Back'),
        row('Longbarrel', 'Gun A'),
        row('Tiger Band', 'Nonmetallic Armor S'),
        row('Assegai', 'Thrown Weapon S'),
        row('Brigandine', 'Metal Armor A'),
        row("Goat's Foot", 'Crossbow S'),
      ]),
      group('2', [
        row('Accel Brogue', 'Wrestling S'),
        row('Magic Cosmetics', 'Adventure Tools'),
        row('Horn of Magic Detection', 'Adventure Tools'),
        row('Keen-Flash Glasses', 'Accessory: Face'),
        row('Holy Parrot', 'Accessory: Head'),
        row('Tiny Armor*', 'Class-Specific Items'),
      ]),
      group('3', [
        row("Surveyor's Wand", 'Class-Specific Items'),
        row('Reflector Shield', 'Shield A'),
        row('Sharp Arms', 'Wrestling S'),
        row('Minor Curse Rebellion', 'Accessory: Neck'),
        row("Smaltier's Ankle Sleeves", 'Accessory: Feet'),
        row('Dragon Scale', 'Nonmetallic Armor S'),
      ]),
      group('4', [
        row('Mako Stone (15 pts.)', 'Class-Specific Items'),
        row('Mask of the Fearless', 'Accessory: Face'),
        row('Blade Skirt', 'Accessory: Waist'),
        row('Excellent Rapier', 'Sword S'),
        row('Mithril Shield', 'Shield S'),
        row("Temsgard's Chain Star", 'Flail A/Thrown Weapon A'),
      ]),
      group('5', [
        row('Bolt Swarm', 'Crossbow S'),
        row('Grand Partner', 'Shield S'),
        row('Puzzling Sign', 'Adventure Tools'),
        row('Scorpion', 'Crossbow S'),
        row('Sunlight Charm (+3)', 'Adventure Tools (Consumables)'),
        row('Moonlight Charm (+3)', 'Adventure Tools (Consumables)'),
      ]),
      group('6', [
        row('Tongues Earpiece', 'Accessory: Ear'),
        row('Modified Weapon Holder', 'Accessory: Back'),
        row('Droplet Bracelet', 'Accessory: Hand'),
        row('Ring Of The Mind', 'Accessory: Hand'),
        row('Rainbow Ring', 'Accessory: Hand'),
        row("Champion's Buckle", 'Accessory: Waist'),
      ]),
    ],
    footnotes: ['*Roll 1d to determine Defense increase (3 points for 1-3, 6 points for 4-6).'],
  },
  {
    id: 'e',
    table: 'E',
    points: 6,
    groups: [
      group('1', [
        row('Silent Shoes', 'Accessory: Feet'),
        row('Displacer Gadget', 'Accessory: Any'),
        row('Mithril Dirk', 'Thrown Weapon S'),
        row('Jail Impact', 'Flail S'),
        row('Sniper', 'Bow S'),
        row('Mana Cartridge X', 'Adventure Tools'),
      ]),
      group('2', [
        row('Francisca', 'Thrown Weapon S'),
        row('Protective Holy Water (9th level)', 'Adventure Tools (Cons.)'),
        row('Conning Shaft', 'Staff S'),
        row('Bonding Moonlight Charm (+3)', 'Adventure Tools (Cons.)'),
        row('Bonding Sunlight Charm (+3)', 'Adventure Tools (Cons.)'),
        row("Smaltier's Headband", 'Accessory: Head'),
      ]),
      group('3', [
        row('Waterfowl Mask', 'Accessory: Face'),
        row('Bear Claws', 'Accessory: Neck'),
        row('Penguin Cape', 'Accessory: Back'),
        row("Smaltier's Martial Arts Belt", 'Accessory: Waist'),
        row("Mimore's Cloth Armor", 'Nonmetallic Armor B'),
        row('Mithril Chain', 'Metal Armor S'),
      ]),
      group('4', [
        row("Balzer's Magilight Shield", 'Shield B'),
        row('Coat of Plates', 'Metal Armor A'),
        row('Despair', 'Crossbow S'),
        row("Great Daemon's Crystallized Blood Plate", 'Adventure Tools'),
        row("Stone Man's Earring", 'Accessory: Ear'),
        row('Mana Staff', 'Staff A'),
      ]),
      group('5', [
        row('Hollow Hammer', 'Mace B'),
        row('Leech Staff', 'Staff A'),
        row('Mithril Shoes', 'Wrestling S'),
        row("Temsgard's Light Dock", 'Shield A'),
        row('Mechanized Fingers', 'Class-Specific Items'),
        row('Keen Glasses', 'Accessory: Face'),
      ]),
      group('6', [
        row('Mithril Mace', 'Mace S'),
        row('Beast Buster', 'Crossbow B'),
        row('Blade Killer', 'Shield S'),
        row("Lal-Veine's Golden Chain", 'Accessory: Ear'),
        row("Smaltier's Bell", 'Accessory: Neck'),
        row('Mithril Sword', 'Sword S'),
      ]),
    ],
  },
  {
    id: 'f',
    table: 'F',
    points: 8,
    groups: [
      group('1', [
        row('War Mage Staff', 'Staff B'),
        row('Weakness Revealer', 'Sword B'),
        row('Bold Assertor', 'Bow B'),
        row('Disturbing Scarecrow III', 'Adventure Tools'),
        row('Balanced Pendulum', 'Flail B'),
        row('Flaming Shield', 'Shield B'),
      ]),
      group('2', [
        row('Mithril Spear', 'Spear S'),
        row('Claymore', 'Sword S'),
        row('Mithril Axe', 'Axe S'),
        row('Bullet Shower', 'Gun S'),
        row("Temsgard's Heavy Dock", 'Shield A'),
        row('Mako Stone (20 pts.)', 'Class-Specific Items'),
      ]),
      group('3', [
        row('Saving Cloak', 'Accessory: Back'),
        row('Big Gloves', 'Accessory: Hand'),
        row('Fortress', 'Metal Armor A'),
        row('Heavy Lance', 'Spear S'),
        row('Smart Animal Sack', 'Accessory: Back'),
        row('Rainbow Spear', 'Spear B'),
      ]),
      group('4', [
        row('Portable Shrine', 'Class-Specific Items'),
        row('Ballista', 'Crossbow S'),
        row('Fabled Lute', 'Special Instrument'),
        row('Careful Auto Looter', 'Adventure Tool'),
        row("Hunter's Eyes", 'Accessory: Face'),
        row('Composite Bow', 'Bow S'),
      ]),
      group('5', [
        row('Antidote Potion III', 'Potion'),
        row('Cure Stone Potion III', 'Potion'),
        row('Detoxification Spoon', 'Adventure Tool'),
        row('Fairy Lantern', 'Adventure Tool'),
        row('Crown of the Saint', 'Accessory: Head'),
        row('Miracle Necklace', 'Accessory: Neck'),
      ]),
      group('6', [
        row("Hero's Mantle", 'Accessory: Back'),
        row('Mana Ring', 'Accessory: Hand'),
        row('Sign of Valor', 'Accessory: Any'),
        row('Lucky Feathers', 'Accessory: Feet'),
        row('Bec-De-Faucon', 'Warhammer S'),
        row("Balzer's Magic Armor", 'Metal Armor'),
      ]),
    ],
  },
  {
    id: 'g',
    table: 'G',
    points: 10,
    groups: [
      group('1-3', [
        row('Windbreaker Surcoat', 'Nonmetallic Armor A'),
        row('Gilded Sabaton', 'Wrestling S'),
        row("Dead Man's Earring", 'Accessory: Ear'),
        row('Troll Buster', 'Mace S'),
        row('Full-Metal Armor', 'Metal Armor S'),
        row('Light Boots', 'Accessory: Feet'),
      ]),
      group('4-6', [
        row('Golden Mattocks', 'Warhammer B'),
        row("Mimore's Fine Cloth Armor", 'Nonmetallic Armor A'),
        row('Pointed Hat of Wisdom', 'Accessory: Head'),
        row("Smaltier's Eye Guard", 'Accessory: Head'),
        row('Mutual Follow-up Earrings', 'Accessory: Ear'),
        row('Couse', 'Axe S'),
      ]),
    ],
  },
  {
    id: 'h',
    table: 'H',
    points: 12,
    groups: [
      group('1-3', [
        row('Unbending Buckle', 'Accessory: Waist'),
        row('Titan Flail', 'Flail S'),
        row("Dontrecia's Armor of Perseverance", 'Metal Armor B'),
        row("Berserker's Sword", 'Sword B'),
        row("Temsgard's Chain Star", 'Flail S/Thrown Weapon S'),
        row('Purifying Holy Symbol', 'Class-Specific Items'),
      ]),
      group('4-6', [
        row('Sentinel', 'Sword S'),
        row('Blood Ransom', 'Bow A'),
        row('Staff of Control', 'Staff B'),
        row('Lancaster', 'Gun S'),
        row('Destroyer', 'Sword A'),
        row('Daemonthresher', 'Flail S'),
      ]),
    ],
  },
  {
    id: 'i',
    table: 'I',
    points: 16,
    groups: [
      group('1-3', [
        row("Lal-Veine's Shoulder Strap", 'Accessory: Back'),
        row('Shock Hammer', 'Warhammer A'),
        row("Balzer's Magic Sword", 'Sword A'),
        row('Fistulosum', 'Special Instrument/Staff A'),
        row('Molder', 'Mace A'),
        row('Horn of the Muse', 'Special Instrument'),
      ]),
      group('4-6', [
        row('Carnage', 'Gun S'),
        row('Mana Cartridge XX', 'Adventure Tools'),
        row('War Mage Staff', 'Staff A'),
        row('Everchanging Clothing', 'Clothing'),
        row('Scavenger Hat', 'Accessory: Head'),
        row('Immovable Rod', 'Adventure Tools'),
      ]),
    ],
  },
  {
    id: 'j',
    table: 'J',
    points: 20,
    groups: [
      group('1-3', [
        row('Turtle Shell', 'Shield S'),
        row('Material card SS*', 'Class-Specific Items'),
        row("Temsgard's Chain Globe", 'Flail S/Thrown Weapon S'),
        row('Honeymoon Carpet: Static', 'Adventure Tools'),
        row('Honeymoon Carpet: Moving', 'Adventure Tools'),
        row('Cattleya Garland', 'Accessory: Head'),
      ]),
      group('4-6', [
        row("Goddess's Veil", 'Accessory: Head'),
        row("Lal-Veine's Monocle", 'Accessory: Face'),
        row('Linkpearls', 'Accessory: Ear'),
        row('Thieves Boots', 'Accessory: Feet'),
        row('Unicorn Horn**', 'Adventure Tools (Consumables)'),
        row("Sorcerer's Staff", 'Staff S'),
      ]),
    ],
    footnotes: ['*Card colors are determined at random.', '**Number of times used determined with 1d.'],
  },
  {
    id: 'k',
    table: 'K',
    points: 25,
    groups: [
      group('1-3', [
        row('Black Rod', 'Staff S'),
        row('Mithril Plate', 'Metal Armor S'),
        row('Combat Maid/Butler Outfit', 'Nonmetallic Armor B'),
        row("Mimore's Finest Cloth Armor", 'Nonmetallic Armor S'),
        row('Bracelet of Manipulation', 'Accessory: Hand'),
        row('Crown of Riches', 'Accessory: Head'),
      ]),
      group('4-6', [
        row("Lal-Veine's Magic Belt", 'Accessory: Neck'),
        row("Smaltier's Windbreaking Cloth", 'Accessory: Back'),
        row("Lal-Veine's Kneaded Magic Belt", 'Accessory: Waist'),
        row('Death Scythe', 'Axe S'),
        row("Dontrecia's Great Armor of Perseverance", 'Metal Armor A'),
        row("Lal-Veine's Downlooker", 'Accessory: Feet'),
      ]),
    ],
  },
  {
    id: 'l',
    table: 'L',
    points: 40,
    groups: [
      group('1-3', [
        row('Blood Squeeze or Avenger Bow*', 'Bow S'),
        row('Mana Coat or Mana Coat+*', 'Nonmetallic Armor B'),
        row("Powered Plates or Dontrecia's Stiff Armor of Perseverance*", 'Metal Armor S'),
        row('Total Reflector', 'Shield S'),
        row('Ring of Righteous Belief', 'Accessory: Hand'),
        row("Executioner's Blade", 'Sword S'),
      ]),
      group('4-6', [
        row('Green Belt', 'Accessory: Waist'),
        row('Power Capper or Heart Tracker*', 'Mace S or Warhammer S'),
        row('Curse Rebellion', 'Accessory: Neck'),
        row("Lal-Veine's Mana Ring", 'Accessory: Hand'),
        row('Dragon Arrow or Quarrel**', 'Ammunition'),
        row("Lal-Veine's Feather Crown", 'Accessory: Head'),
      ]),
    ],
    footnotes: ['*Either one can be obtained at random.', '**PCs choose whether to get an arrow or quarrel.'],
  },
];

/** "Total of the PC's Adventurer Level" -> Treasure Points to budget for a scenario. */
export interface TreasurePointsEstimateRow {
  levelRange: string;
  points: string;
}

export const TREASURE_POINTS_ESTIMATE: TreasurePointsEstimateRow[] = [
  { levelRange: '8 or less', points: '1' },
  { levelRange: '8–12', points: '1–2' },
  { levelRange: '12–16', points: '2–3' },
  { levelRange: '16–20', points: '3–4' },
  { levelRange: '20–24', points: '5–6' },
  { levelRange: '24–28', points: '5–6' },
  { levelRange: '28–32', points: '6–8' },
  { levelRange: '32–36', points: '8–10' },
  { levelRange: '36–40', points: '10–12' },
  { levelRange: '40–44', points: '12–15' },
  { levelRange: '44–48', points: '15–18' },
  { levelRange: '48–52', points: '18–25' },
  { levelRange: '52–56', points: '25–35' },
  { levelRange: '56–60', points: '35–50' },
  { levelRange: '60–75', points: '50–65' },
];

/** One row of the Treasure Enhancement Abilities List: cost by Treasure Points spent
 *  (index 0 = 1 point .. index 9 = 10 points), null where the book prints "-" (not
 *  available at that point cost). */
export interface EnhancementAbility {
  name: string;
  costs: (string | null)[];
  description: string;
}

export const TREASURE_ENHANCEMENT_ABILITIES: EnhancementAbility[] = [
  {
    name: 'Increase Weakness',
    costs: ['+1', '+2', null, '+3', null, '+4', null, '+5', null, '+6'],
    description: "The monster's Weakness is increased by the value corresponding to the assigned points (harder to find the monster's weak point).",
  },
  {
    name: 'Increase Initiative',
    costs: ['+1', '+2', null, '+3', null, '+4', null, '+5', null, '+6'],
    description: "The monster's Initiative is increased by the value corresponding to the assigned points.",
  },
  {
    name: 'Instant Damage',
    costs: ['+2', '+4', '+6', '+8', null, '+10', null, '+12', null, '+14'],
    description:
      'After the 2d roll to determine the damage, the damage is increased by the Instant Damage value. This enhancement can be added to multiple monsters (sections): a number of enhancements per character (section) per day, active for 10 seconds (1 round) per character (section), and all damage increases must be equal for all characters (sections).',
  },
  {
    name: 'Instant Defense',
    costs: ['+2', '+4', '+6', '+8', null, '+10', null, '+12', null, '+14'],
    description:
      'Only once per day, when applying Defense after receiving physical damage, Defense is increased by the Instant Defense value. After Total Damage is determined, the monster can choose whether to use this effect or not.',
  },
  {
    name: 'Instant Success Value',
    costs: ['+1', '+2', null, '+3', null, '+4', null, '+5', null, '+6'],
    description: 'Only once a day, when the success value of a Skill Check is obtained, the success value can be increased by this value.',
  },
  {
    name: 'Chain Attack',
    costs: ['⑥/1', '⑤⑥/1', null, '⑤⑥/2', null, null, '④⑤⑥/2', null, null, '④⑤⑥/3'],
    description:
      "Once per turn, the monster can roll 1d at the end of their turn. If the result is one of the faces before \"/\", they can make an additional melee attack (separate from [Double Attack]/[Continuous Attack]); the number after \"/\" is the maximum additional attacks. Once per day.",
  },
  {
    name: 'Curse Wave',
    costs: ['1 point', null, '2 points', null, '3 points', null, '4 points', null, null, '5 points'],
    description:
      'Once per day; after its declaration it takes effect for 1 minute (6 rounds), during which the monster automatically inflicts fixed curse-type damage once at the end of their turn to Range: Touch, Target: 1 Character, Resistance: Can\'t, for the assigned number of points.',
  },
  {
    name: 'Global Contamination',
    costs: [null, 'Power 10', null, 'Power 20', null, 'Power 30', null, 'Power 40', null, 'Power 50'],
    description:
      'Only once a day, the first time the monster takes HP damage in combat they automatically deal poison magic damage (Range: Caster, Target: all areas (20m Radius)/All, Resistance: Can\'t, the assigned Power as Critical Threshold); any character can be excluded from the effect.',
  },
];

export function listTreasureDropTables(): TreasureDropTableDef[] {
  return TREASURE_DROP_TABLES;
}

export function getTreasureDropTable(id: string): TreasureDropTableDef | undefined {
  return TREASURE_DROP_TABLES.find((entry) => entry.id === id);
}

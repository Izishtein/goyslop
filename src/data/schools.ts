/**
 * Battle Mastery Schools and School Secrets — Battle Mastery pp. 44-77, transcribed in
 * docs/sheet-content/37-battle-mastery-schools.md.
 *
 * "Generally, paying Reputation is the only way to gain entry to a school" (p. 44, usually 50)
 * and each Secret has its own Required Reputation on top of that — unlike Rider Stunts/
 * Geomancer Aspects/Tactician Stratagems/Dark Hunter Essence Weavings, there is no class level
 * and no slot count here at all. Both School membership and Secrets are a free list, the same
 * shape as Combat Feats (which are also bought once and simply kept).
 *
 * "Secrets are classified as follows... very similar to the Combat Feat classification
 * (see p. 16). The only difference is that 'Declared type' is further classified into two
 * types" (p. 45) — reusing `CombatFeatCategory` for `SchoolSecretDefinition.type` rather than a
 * new enum, since the book itself says it is the same classification. A Secret's `basicFeat`
 * records the "[X] Secret Variant" the book prints for most Declared Secrets; a "Unique
 * Declared Type" Secret has no Basic Feat (`basicFeat` stays undefined) but is still
 * `type: 'declaration'`.
 *
 * Like the spell/feat/technique catalogs this carries no effect text — the research doc holds
 * the book's own Summary line in Russian, and the sheet's own note field is where a player
 * writes what a Secret does.
 */
import type { CombatFeatCategory } from '../types/character';

export interface SchoolEquipmentItem {
  name: string;
  price: string;
  notes?: string;
}

export interface SchoolDefinition {
  id: string;
  name: string;
  /** Reputation cost of the "you must first undergo initiation" step (p. 44) — always 50 for
   *  every school in this book, so this exists for the rare extra-condition case, not variance. */
  initiationReputation: number;
  /** Extra initiation condition beyond Reputation, verbatim, if the book prints one. */
  initiationNotes?: string;
  equipment?: SchoolEquipmentItem[];
  /** Dikehorn Twin Ice Spirit Technique is the one school that grants Conjurer spells for
   *  Reputation instead of Secrets — this note explains the deviation instead of forcing six
   *  spell stat-blocks into `SchoolSecretDefinition`'s shape, which does not fit them (Cost/
   *  Target/Range/Duration/Resistance have no equivalent field on a Secret). See the research
   *  doc for the six spells; add them to the sheet's own Spells section by hand. */
  secretsNote?: string;
  sourceBook: string;
}

export interface SchoolSecretDefinition {
  id: string;
  name: string;
  schoolId: string;
  requiredReputation: number;
  type: CombatFeatCategory;
  /** The "[Basic Feat] Secret Variant" this Secret modifies, if it is one. */
  basicFeat?: string;
  /** As the book prints it: "None", a bracketed name, or names joined by "or"/"," if more than
   *  one prerequisite Secret/Combat Feat is required. */
  prerequisite?: string;
  equipLimit?: string;
  /** Class restriction on using the Secret, verbatim ("Use" field); "-" in the book means none. */
  useClass?: string;
  appl?: string;
  risk?: string;
  sourceBook: string;
}

const BATTLE_MASTERY = 'Battle Mastery';

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function school(
  name: string,
  options: { initiationReputation?: number; initiationNotes?: string; equipment?: SchoolEquipmentItem[]; secretsNote?: string } = {},
): SchoolDefinition {
  return {
    id: slug(name),
    name,
    initiationReputation: options.initiationReputation ?? 50,
    initiationNotes: options.initiationNotes,
    equipment: options.equipment,
    secretsNote: options.secretsNote,
    sourceBook: BATTLE_MASTERY,
  };
}

function secret(
  schoolName: string,
  name: string,
  requiredReputation: number,
  type: CombatFeatCategory,
  options: { basicFeat?: string; prerequisite?: string; equipLimit?: string; useClass?: string; appl?: string; risk?: string } = {},
): SchoolSecretDefinition {
  return {
    id: slug(name),
    name,
    schoolId: slug(schoolName),
    requiredReputation,
    type,
    basicFeat: options.basicFeat,
    prerequisite: options.prerequisite,
    equipLimit: options.equipLimit,
    useClass: options.useClass,
    appl: options.appl,
    risk: options.risk,
    sourceBook: BATTLE_MASTERY,
  };
}

export const SCHOOLS: SchoolDefinition[] = [
  school('Ivar Frenzy Style', {
    equipment: [
      { name: 'Great Bear Fang', price: '1,200 + 20 Rep.', notes: 'B-Rank Sword, 2H' },
      { name: 'Polar Bear Mantle', price: '500 + 20 Rep.', notes: 'Accessory: Back, Resistance Checks +1' },
    ],
  }),
  school('Michal Style Circular Combat Arts', {
    equipment: [
      { name: 'Michal War Spade', price: '80 + 20 Rep.', notes: 'B-Rank Axe/Thrown Weapon, 1H*' },
      { name: 'War Spade', price: '350 + 20 Rep.', notes: 'B-Rank Axe and Staff, 2H, Defense +1' },
    ],
  }),
  school('Kaslot Great Sand Fist/Batas School', {
    equipment: [
      { name: 'Iron Sand Fist / Steel Fist / Adamantine Fist', price: '0', notes: 'B/A/S-Rank Wrestling, auto-granted by [Iron Fist Dull Shine] + matching Weapon Proficiency; Grappler only' },
    ],
  }),
  school('Makajahat Pro Grappling', {
    equipment: [{ name: 'Stibble Feet', price: '1,000 + 20 Rep.', notes: 'Accessory: Feet, Throw Accuracy +1, cannot Kick' }],
  }),
  school('Narzaland Flexible Shield Style', {
    equipment: [{ name: 'Flex Grip (Enhancement)', price: '250/500/1,000/1,500', notes: 'Armor Enhancement on a Shield; Min STR +1; required to use this school’s Secrets' }],
  }),
  school('Alster Strongshot Style', {
    equipment: [
      { name: 'Bold Stone', price: '50 + 10 Rep.', notes: 'B-Rank Thrown Weapon, 1H*' },
      { name: 'Bold Hammer', price: '150 + 10 Rep.', notes: 'B-Rank Thrown Weapon, 2H*' },
    ],
  }),
  school('Hiadem Magical Flow Manipulation Strikes', {
    equipment: [
      { name: 'Mirage Padding', price: '5,000 + 20 Rep.', notes: 'B-Rank Nonmetallic Armor, Grappler can equip, +1 Evasion using magic' },
      { name: 'Mirage Coat', price: '11,000 + 30 Rep.', notes: 'A-Rank Nonmetallic Armor, same as above' },
      { name: 'Mirage Dress/Suit', price: '23,000 + 50 Rep.', notes: 'S-Rank Nonmetallic Armor, same as above' },
    ],
  }),
  school('Ancient Morganthine Battlefield Sorcery', {
    equipment: [
      { name: "Rosellini's Magic Brush", price: '2,000 + 20 Rep.', notes: "Class-Specific Item, draws Rosellini's Magic Mark" },
      { name: "Rosellini's Magic Mark Paint", price: '100', notes: 'Consumable, spent to draw the Mark' },
      { name: "Rosellini's Harmonizer", price: '1,000 + 20 Rep.', notes: 'Accessory: Neck, required to use this school’s Secrets' },
    ],
  }),
  school('Dikehorn Twin Ice Spirit Technique', {
    equipment: [{ name: 'Snow, Moon, Flower Jewelry', price: '1,200 + 20 Rep.', notes: 'Class-Specific Item, holds Fairy Tamer Gems' }],
    secretsNote:
      'Grants no Secrets: instead teaches six Spiritualism/Fairy Magic spells (Snowman, Frost Field I/II, Element Swap, Shivering Resonance, Freezing Zone) to Conjurers, each bought with its own Required Reputation (20-50). See the research doc for the full spell stat-blocks — add them by hand via the Spells section.',
  }),
  school('Scholten Mounted Combat', {
    equipment: [{ name: 'Ring of Field Fellowship', price: '750/1,500', notes: 'Accessory: Hand, Ability Enhancement (DEX/AGI only), no Reputation required' }],
  }),

  // --- "Schools on Another Continent" (pp. 68-77) — shorter entries, cross-referenced to
  // Terastier-continent sourcebooks this project does not have; only the data this book
  // itself prints is captured. ---
  school('Ardorian Style Martial Arts - Merciano School', {
    equipment: [{ name: 'Scale Guard', price: '—', notes: 'Full stats not transcribed (see p. 88)' }],
  }),
  school("El Elena's Dazzling Veil Dance Technique", {
    equipment: [{ name: 'Cape of El Elena', price: '—', notes: 'Full stats not transcribed (see p. 89)' }],
  }),
  school('Phylasten School - Wind Style (Twin Sword Style)', {
    initiationNotes: 'also requires Combat Feat [Dual Wielding]',
    equipment: [{ name: 'Crescent Epic', price: '—', notes: 'Full stats not transcribed (see p. 86)' }],
  }),
  school('Modified Kwaelan Method of Dark Archery', {
    initiationNotes: '40 Reputation instead for Shadow (Outlaw Profile Book pp. 126, 130)',
    equipment: [{ name: 'Silent Death', price: '—', notes: 'Full stats not transcribed (see p. 86)' }],
  }),
  school('Wald Style Battlefield Sword Slaying Method', {
    equipment: [{ name: 'Wald Gauntlet', price: '—', notes: 'Full stats not transcribed (see p. 90)' }],
  }),
  school('Gaon Peerless Beast Hurling Technique', {
    equipment: [{ name: 'Hard Steps', price: '—', notes: 'Full stats not transcribed (see p. 86)' }],
  }),
  school('Iron Wall Style of Logan the Crusader', {
    initiationNotes: '70 Reputation instead for non-followers of Lyphos (base 50 is for followers)',
    equipment: [
      { name: "Logan's Heater", price: '—', notes: 'Full stats not transcribed (see p. 88)' },
      { name: "Reinforced Logan's Heater", price: '—', notes: 'Full stats not transcribed (see p. 88)' },
      { name: "Logan's Legend", price: '—', notes: 'Full stats not transcribed (see p. 88)' },
      { name: 'Symbol of Light', price: '—', notes: 'Full stats not transcribed (see p. 90)' },
    ],
  }),
  school('Kuuheiken Fierce Dragon Riding', {
    initiationNotes: 'also requires the Rider class',
    equipment: [
      { name: 'Bolted Lance', price: '—', notes: 'Full stats not transcribed (see p. 86)' },
      { name: 'Long Bolted Lance', price: '—', notes: 'Full stats not transcribed (see p. 86)' },
      { name: 'Outer Guard', price: '—', notes: 'Full stats not transcribed (see p. 88)' },
    ],
  }),
];

export const SCHOOL_SECRETS: SchoolSecretDefinition[] = [
  // --- Ivar Frenzy Style (pp. 48-49) ---
  secret('Ivar Frenzy Style', 'Angry Bear Strike', 20, 'declaration', {
    basicFeat: 'Power Strike I',
    prerequisite: 'Taunting Strike I',
    equipLimit: '2H Weapon + Vocalization',
    useClass: 'Fighter or Fencer or Battle Dancer class',
    appl: '1 melee attack',
    risk: 'Evasion -2',
  }),
  secret('Ivar Frenzy Style', 'Enraged Bear Strike', 30, 'declaration', {
    basicFeat: 'Power Strike II',
    prerequisite: 'Taunting Strike I',
    equipLimit: '2H Weapon + Vocalization',
    useClass: 'Fighter or Battle Dancer class',
    appl: '1 melee attack',
    risk: 'Evasion -2',
  }),
  secret('Ivar Frenzy Style', 'Furious Bear Strike', 50, 'declaration', {
    basicFeat: 'Power Strike III',
    prerequisite: 'Taunting Strike I',
    equipLimit: '2H Weapon + Vocalization',
    useClass: 'Fighter class',
    appl: '1 melee attack',
    risk: 'Evasion -2',
  }),

  // --- Michal Style Circular Combat Arts (pp. 50-52) ---
  secret('Michal Style Circular Combat Arts', 'Disperse', 20, 'declaration', {
    basicFeat: 'Defensive Stance',
    prerequisite: 'None',
    appl: '10 seconds (1 round)',
    risk: 'Most Skill Checks -4',
  }),
  secret('Michal Style Circular Combat Arts', 'Disrupt', 20, 'declaration', {
    basicFeat: 'Taunting Strike I',
    prerequisite: 'None',
    appl: '1 melee attack',
  }),
  secret('Michal Style Circular Combat Arts', 'Disengage', 30, 'majorAction', {
    prerequisite: 'Disperse',
  }),

  // --- Kaslot Great Sand Fist/Batas School (pp. 52-54) ---
  secret('Kaslot Great Sand Fist/Batas School', 'Iron Fist Dull Shine', 20, 'passive', {
    prerequisite: 'None',
  }),
  secret('Kaslot Great Sand Fist/Batas School', 'Iron Sand Reverberating Fist', 30, 'majorAction', {
    prerequisite: 'Iron Fist Dull Shine',
    equipLimit: 'Iron Sand Fist (Type Independent)',
    useClass: 'Grappler class',
  }),
  secret('Kaslot Great Sand Fist/Batas School', 'One Strike, Absolute Defeat: Iron Sand Demolishing Fist', 50, 'declaration', {
    basicFeat: 'Armor Piercer I',
    prerequisite: 'Iron Sand Reverberating Fist',
    equipLimit: 'Iron Sand Fist (Type Independent)',
    useClass: 'Grappler class',
    appl: '1 attack with Iron Sand Reverberating Fist',
  }),

  // --- Makajahat Pro Grappling (pp. 54-56) ---
  secret('Makajahat Pro Grappling', 'Leaping Vine Entanglement (Grapevine Hold)', 20, 'declaration', {
    prerequisite: 'None',
    equipLimit: 'Throw',
    appl: '1 melee attack',
  }),
  secret('Makajahat Pro Grappling', 'Entwining Vine Gap Strike (Abrupt Slap)', 30, 'passive', {
    prerequisite: 'Stomp, Leaping Vine Entanglement (Grapevine Hold)',
    equipLimit: 'Punch',
    useClass: 'Grappler class',
  }),
  secret('Makajahat Pro Grappling', 'Thunderclap Spinning Lariat (Warthunder)', 30, 'passive', {
    prerequisite: 'Flying Kick',
    equipLimit: 'Punch',
    useClass: 'Grappler class',
  }),

  // --- Narzaland Flexible Shield Style (pp. 56-58) ---
  secret('Narzaland Flexible Shield Style', 'Parry and Break', 20, 'declaration', {
    prerequisite: 'None',
    equipLimit: 'Flex Grip Enhanced Shield',
    appl: '10 seconds (1 round)',
  }),
  secret('Narzaland Flexible Shield Style', 'Stop and Stagger', 20, 'declaration', {
    prerequisite: 'None',
    equipLimit: 'Flex Grip Enhanced Shield',
    appl: '10 seconds (1 round)',
  }),
  secret('Narzaland Flexible Shield Style', 'Planned Riposte', 30, 'passive', {
    prerequisite: 'Parry and Break or Stop and Stagger',
    appl: '1 melee attack',
  }),

  // --- Alster Strongshot Style (pp. 58-59) ---
  secret('Alster Strongshot Style', 'Overhead Swing', 20, 'declaration', {
    prerequisite: 'None',
    appl: '1 ranged attack',
  }),
  secret('Alster Strongshot Style', 'Bracing Shot', 30, 'declaration', {
    prerequisite: 'Overhead Swing',
    equipLimit: '2H Ranged Weapon',
    useClass: 'Marksman class',
    appl: '1 ranged attack',
    risk: 'Evasion Check -2',
  }),
  secret('Alster Strongshot Style', 'Sidelong Glance Shot', 30, 'declaration', {
    prerequisite: 'Hawk Eye',
    appl: '1 ranged attack',
  }),

  // --- Hiadem Magical Flow Manipulation Strikes (pp. 60-61) ---
  secret('Hiadem Magical Flow Manipulation Strikes', 'Sword Magic: Resolute Strike', 30, 'declaration', {
    basicFeat: 'Multi-Action',
    prerequisite: 'None',
    appl: '1 melee attack',
  }),
  secret('Hiadem Magical Flow Manipulation Strikes', 'Sword Magic: Flux Strike', 30, 'declaration', {
    basicFeat: 'Multi-Action',
    prerequisite: 'None',
    appl: '1 melee attack',
  }),
  secret('Hiadem Magical Flow Manipulation Strikes', 'Sword of Truth: Mystic Surveilling Eye', 30, 'declaration', {
    basicFeat: 'Mana Strike',
    prerequisite: 'None',
    appl: '1 melee attack',
    risk: 'Fortitude and Willpower -2',
  }),

  // --- Ancient Morganthine Battlefield Sorcery (pp. 62-63) ---
  secret('Ancient Morganthine Battlefield Sorcery', 'Battlefield Sorcery: Annamaria', 20, 'declaration', {
    basicFeat: 'Metamagic/Targets',
    prerequisite: 'None',
    equipLimit: "Rosellini's Harmonizer",
    useClass: 'Wizard-type Classes',
    appl: '10 seconds (1 round)',
  }),
  secret('Ancient Morganthine Battlefield Sorcery', 'Battlefield Sorcery: Veronica', 20, 'passive', {
    prerequisite: 'None',
    equipLimit: "Rosellini's Harmonizer",
    useClass: 'Wizard-type Classes',
    appl: '10 seconds (1 round)',
  }),
  secret('Ancient Morganthine Battlefield Sorcery', 'Battlefield Sorcery: Torquato', 20, 'declaration', {
    basicFeat: 'Metamagic/Area',
    prerequisite: 'None',
    equipLimit: "Rosellini's Harmonizer",
    useClass: 'Wizard-type Classes',
    appl: '10 seconds (1 round)',
  }),

  // --- Scholten Mounted Combat (pp. 66-67) ---
  secret('Scholten Mounted Combat', 'Wind Cleaver', 20, 'declaration', {
    prerequisite: 'None',
    equipLimit: 'Mounted, 1H Melee Weapon',
  }),
  secret('Scholten Mounted Combat', 'Breaking Wave', 20, 'passive', {
    prerequisite: 'Decoy Attack I',
    equipLimit: 'Mounted',
  }),
  secret('Scholten Mounted Combat', 'Shadow Slice', 20, 'declaration', {
    basicFeat: 'Repeated Strike I',
    prerequisite: 'None',
    equipLimit: 'Mounted',
    useClass: 'Melee weapon',
    appl: '1 melee attack',
  }),
  secret('Scholten Mounted Combat', 'Umbra Cut', 30, 'declaration', {
    basicFeat: 'Repeated Strike II',
    prerequisite: 'Shadow Slice',
    equipLimit: 'Mounted',
    useClass: 'Melee weapon',
    appl: '1 melee attack',
  }),

  // --- Ardorian Style Martial Arts - Merciano School (printed p. 70) ---
  secret('Ardorian Style Martial Arts - Merciano School', 'Flying Piledriver', 20, 'declaration', {
    prerequisite: 'None',
    equipLimit: 'Throw',
    appl: '1 melee attack',
  }),
  secret('Ardorian Style Martial Arts - Merciano School', 'Rolling Tail Sweep', 20, 'declaration', {
    basicFeat: 'Tail Swing I',
    prerequisite: 'None',
    equipLimit: 'Tail',
    appl: '1 melee attack',
  }),
  secret('Ardorian Style Martial Arts - Merciano School', 'Grand Rolling Tail Sweep', 30, 'declaration', {
    basicFeat: 'Tail Swing II',
    prerequisite: 'Flying Piledriver, Rolling Tail Sweep',
    equipLimit: 'Tail',
    appl: '1 melee attack',
  }),

  // --- El Elena's Dazzling Veil Dance Technique (printed p. 71) — three Secrets, each with
  // 2-3 Reputation tiers (base/Superior/Ultimate), modeled as one catalog entry per tier. ---
  secret("El Elena's Dazzling Veil Dance Technique", 'Se Ilite Borne Enémigo Invisibile - Unseen Taunt', 20, 'declaration', {
    basicFeat: 'Taunting Strike I',
    prerequisite: 'None',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '1 weapon attack',
  }),
  secret("El Elena's Dazzling Veil Dance Technique", 'Se Ilite Borne Enémigo Invisibile - Unseen Taunt - Superior', 30, 'declaration', {
    basicFeat: 'Taunting Strike II',
    prerequisite: 'Se Ilite Borne Enémigo Invisibile - Unseen Taunt',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '1 weapon attack',
  }),
  secret("El Elena's Dazzling Veil Dance Technique", 'Tenel Miedo En Un Entrada - Sword of Damocles', 20, 'declaration', {
    basicFeat: 'Lethal Strike I',
    prerequisite: 'None',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '1 weapon attack',
  }),
  secret("El Elena's Dazzling Veil Dance Technique", 'Tenel Miedo En Un Entrada - Sword of Damocles - Superior', 30, 'declaration', {
    basicFeat: 'Lethal Strike II',
    prerequisite: 'Tenel Miedo En Un Entrada - Sword of Damocles',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '1 weapon attack',
  }),
  secret("El Elena's Dazzling Veil Dance Technique", 'Tenel Miedo En Un Entrada - Sword of Damocles - Ultimate', 50, 'declaration', {
    basicFeat: 'Lethal Strike III',
    prerequisite: 'Tenel Miedo En Un Entrada - Sword of Damocles - Superior',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '1 weapon attack',
  }),
  secret("El Elena's Dazzling Veil Dance Technique", 'Ser Confundido Conjunto Bonito Baile', 20, 'declaration', {
    prerequisite: 'Aimed Attack I',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '10 seconds (1 round)',
  }),
  secret("El Elena's Dazzling Veil Dance Technique", 'Ser Confundido Conjunto Bonito Baile - Superior', 30, 'declaration', {
    prerequisite: 'Aimed Attack II, Evasive Maneuvers I or Ser Confundido Conjunto Bonito Baile',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '10 seconds (1 round)',
  }),
  secret("El Elena's Dazzling Veil Dance Technique", 'Ser Confundido Conjunto Bonito Baile - Ultimate', 50, 'declaration', {
    prerequisite: 'Aimed Attack III, Evasive Maneuvers II or Ser Confundido Conjunto Bonito Baile - Superior',
    equipLimit: 'Cape of El Elena',
    useClass: 'Fencer or Battle Dancer Class',
    appl: '10 seconds (1 round)',
  }),

  // --- Phylasten School - Wind Style (printed p. 72) ---
  secret('Phylasten School - Wind Style (Twin Sword Style)', 'Turbulent Winds • Double-handed Cut', 30, 'declaration', {
    prerequisite: 'None',
    equipLimit: '1H Melee Weapon x 2',
    useClass: 'Special',
    appl: '1 melee attack x 2',
    risk: 'Special',
  }),
  secret('Phylasten School - Wind Style (Twin Sword Style)', 'Adverse Wind • Offsetting Sacrifice', 30, 'declaration', {
    prerequisite: 'None',
    equipLimit: '1H Melee Weapon x 2',
    appl: '1 melee attack x 2',
    risk: 'Must be attacked by the target',
  }),
  secret('Phylasten School - Wind Style (Twin Sword Style)', 'Foreboding Wind • Crouching Tiger, Hidden Dragon', 30, 'majorAction', {
    prerequisite: 'None',
    equipLimit: '1H Melee Weapon x 2',
  }),

  // --- Modified Kwaelan Method of Dark Archery (printed p. 73) ---
  secret('Modified Kwaelan Method of Dark Archery', 'First Darkness: Heart Piercer', 20, 'declaration', {
    basicFeat: 'Lethal Strike I',
    prerequisite: 'None',
    equipLimit: 'Bow',
    useClass: 'Marksman Class',
    appl: '1 ranged attack',
  }),
  secret('Modified Kwaelan Method of Dark Archery', 'Second Darkness: Doomed Life', 20, 'declaration', {
    prerequisite: 'Targeting, Snipe',
    equipLimit: 'Bow',
    useClass: 'Marksman Class',
    appl: '1 ranged attack',
  }),
  secret('Modified Kwaelan Method of Dark Archery', 'Extra Darkness: Three-Headed Water Dragon', 20, 'declaration', {
    basicFeat: 'Mirage Arrow',
    prerequisite: 'None',
    equipLimit: 'Bow',
    useClass: 'Marksman Class',
    appl: '1 ranged attack',
  }),

  // --- Wald Style Battlefield Sword Slaying Method (printed p. 74) ---
  secret('Wald Style Battlefield Sword Slaying Method', 'Killing Strike - Roaring Thunder', 20, 'declaration', {
    basicFeat: 'Power Strike I',
    prerequisite: 'None',
    equipLimit: 'Sword',
    appl: '1 melee attack',
  }),
  secret('Wald Style Battlefield Sword Slaying Method', 'Killing Strike – Thunderous Upheaval', 30, 'declaration', {
    basicFeat: 'Power Strike II',
    prerequisite: 'Killing Strike - Roaring Thunder',
    equipLimit: 'Sword',
    useClass: 'Fighter or Battle Dancer Class',
    appl: '1 melee attack',
  }),
  secret('Wald Style Battlefield Sword Slaying Method', 'Killing Strike – Flash of Lightning', 20, 'declaration', {
    basicFeat: 'Lethal Strike I',
    prerequisite: 'None',
    equipLimit: 'Sword',
    appl: '1 melee attack',
  }),

  // --- Gaon Peerless Beast Hurling Technique (printed p. 75) ---
  secret('Gaon Peerless Beast Hurling Technique', 'Giant Beast Hammer', 20, 'declaration', {
    prerequisite: 'Improved Throw I',
    equipLimit: 'Throw',
    useClass: 'Grappler Class',
    appl: '1 Throw attack',
  }),
  secret('Gaon Peerless Beast Hurling Technique', 'Cataclysmic Beast Toss', 20, 'declaration', {
    prerequisite: 'Improved Throw I',
    equipLimit: 'Throw',
    useClass: 'Grappler Class',
    appl: '1 Throw attack',
  }),
  secret('Gaon Peerless Beast Hurling Technique', 'Furious Charging Beast Slayer', 20, 'declaration', {
    prerequisite: 'Counter, Improved Throw I',
    equipLimit: 'Throw',
    useClass: 'Grappler Class',
    appl: '10 seconds (1 round)',
  }),

  // --- Iron Wall Style of Logan the Crusader (printed p. 76) ---
  secret('Iron Wall Style of Logan the Crusader', 'Unbreakable Defensive Stance', 20, 'declaration', {
    basicFeat: 'Defensive Stance',
    prerequisite: 'None',
    equipLimit: 'Sword',
    appl: '10 seconds (1 round)',
    risk: 'Most skill checks -4',
  }),
  secret('Iron Wall Style of Logan the Crusader', 'Indomitable Will', 20, 'declaration', {
    basicFeat: 'Cover I',
    prerequisite: 'None',
    equipLimit: 'School Shields',
    appl: '10 seconds (1 round)',
  }),
  secret('Iron Wall Style of Logan the Crusader', 'Greater Indomitable Will', 30, 'declaration', {
    basicFeat: 'Cover II',
    prerequisite: 'Indomitable Will',
    equipLimit: 'School Shields',
    appl: '10 seconds (1 round)',
  }),
  secret('Iron Wall Style of Logan the Crusader', 'Preparing for Fearless Offense and Defense', 20, 'declaration', {
    basicFeat: 'Multi-Action',
    prerequisite: 'None',
    equipLimit: 'Symbol of Light',
    appl: '1 melee attack or spell cast, and lasts for 10 seconds (1 round)',
  }),

  // --- Kuuheiken Fierce Dragon Riding (printed p. 77) — three tiered Secret families,
  // each sharing Equip. Limit "Mounted" / Appl. "10 seconds (1 round)" across all tiers. ---
  secret('Kuuheiken Fierce Dragon Riding', 'Heavenly Horse Dances in the Sky', 20, 'declaration', {
    basicFeat: 'Aimed Attack I',
    prerequisite: 'None',
    equipLimit: 'Mounted',
    appl: '10 seconds (1 round)',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Heavenly Horse Dances in the Sky Magnificently', 30, 'declaration', {
    basicFeat: 'Aimed Attack II',
    prerequisite: 'Heavenly Horse Dances in the Sky',
    equipLimit: 'Mounted',
    appl: '10 seconds (1 round)',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Heavenly Horse Dances in the Sky Wildly', 50, 'declaration', {
    basicFeat: 'Aimed Attack III',
    prerequisite: 'Heavenly Horse Dances in the Sky Magnificently',
    equipLimit: 'Mounted',
    appl: '10 seconds (1 round)',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Giant Elephants Endure by Stomping Earth', 20, 'declaration', {
    basicFeat: 'Power Strike I',
    prerequisite: 'None',
    equipLimit: 'Mounted',
    appl: '10 seconds (1 round)',
    risk: 'None',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Giant Elephants Tramples Earth and Stands Fast', 30, 'declaration', {
    basicFeat: 'Power Strike II',
    prerequisite: 'Giant Elephants Endure by Stomping Earth',
    equipLimit: 'Mounted',
    useClass: 'Fighter or Battle Dancer (Jockey)',
    appl: '10 seconds (1 round)',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Giant Elephants Stomps Through the Earth', 50, 'declaration', {
    basicFeat: 'Power Strike III',
    prerequisite: 'Giant Elephants Tramples Earth and Stands Fast',
    equipLimit: 'Mounted',
    useClass: 'Fighter (Jockey)',
    appl: '10 seconds (1 round)',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Hard Scales Dragon Attack', 20, 'declaration', {
    basicFeat: 'Power Strike I',
    prerequisite: 'Giant Elephants Endure by Stomping Earth',
    equipLimit: 'Mounted',
    appl: '10 seconds (1 round)',
    risk: 'Evasion -2',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Hard Scales Dragon Crush', 30, 'declaration', {
    basicFeat: 'Power Strike II',
    prerequisite: 'Giant Elephants Endure by Stomping Earth, Hard Scales Dragon Attack',
    equipLimit: 'Mounted',
    useClass: 'Fighter or Battle Dancer (Jockey)',
    appl: '10 seconds (1 round)',
    risk: 'Evasion -2',
  }),
  secret('Kuuheiken Fierce Dragon Riding', 'Hard Scales Dragon Destruction', 50, 'declaration', {
    basicFeat: 'Power Strike III',
    prerequisite: 'Giant Elephants Tramples Earth and Stands Fast, Hard Scales Dragon Crush',
    equipLimit: 'Mounted',
    useClass: 'Fighter (Jockey)',
    appl: '10 seconds (1 round)',
    risk: 'Evasion -2',
  }),
];

export function getSchool(id: string): SchoolDefinition | undefined {
  return SCHOOLS.find((s) => s.id === id);
}

export function getSchoolSecret(id: string): SchoolSecretDefinition | undefined {
  return SCHOOL_SECRETS.find((s) => s.id === id);
}

export function listSecretsBySchool(schoolId: string): SchoolSecretDefinition[] {
  return SCHOOL_SECRETS.filter((s) => s.schoolId === schoolId);
}

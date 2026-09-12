import { z } from 'zod';
import { ABILITY_IDS } from '../lib/formulas/abilities';

/** Bumped whenever the persisted shape changes; drives import migrations. */
export const CURRENT_SCHEMA_VERSION = 1;

export const AbilityIdSchema = z.enum(ABILITY_IDS);

/** Base (Background) + racial correction + growth + item bonus = Total. */
export const AbilityScoreSchema = z.object({
  base: z.number().int(),
  correction: z.number().int(),
  growth: z.number().int().default(0),
  itemBonus: z.number().int().default(0),
});
export type AbilityScore = z.infer<typeof AbilityScoreSchema>;

export const AbilitiesSchema = z.record(AbilityIdSchema, AbilityScoreSchema);
export type Abilities = Record<z.infer<typeof AbilityIdSchema>, AbilityScore>;

/** classId references a class catalog entry (Warrior/Wizard/Other type is looked up from there). */
export const ClassLevelSchema = z.object({
  classId: z.string(),
  level: z.number().int().min(1).max(15),
});
export type ClassLevel = z.infer<typeof ClassLevelSchema>;

/** Fixed set of fields status effects commonly modify, plus a free-text escape hatch. */
export const STATUS_EFFECT_FIELDS = [
  ...ABILITY_IDS,
  'accuracy',
  'evasion',
  'fortitude',
  'willpower',
  'defense',
  'actionCheck',
  'custom',
] as const;
export const StatusEffectFieldSchema = z.enum(STATUS_EFFECT_FIELDS);
export type StatusEffectField = z.infer<typeof StatusEffectFieldSchema>;

export const StatusEffectModifierSchema = z.object({
  field: StatusEffectFieldSchema,
  /** Required only when field === 'custom'; names the affected roll/field for display. */
  customLabel: z.string().optional(),
  value: z.number().int(),
});
export type StatusEffectModifier = z.infer<typeof StatusEffectModifierSchema>;

export const StatusEffectDurationSchema = z.discriminatedUnion('kind', [
  z.object({ kind: z.literal('rounds'), remaining: z.number().int().min(0) }),
  z.object({ kind: z.literal('permanent') }),
  z.object({ kind: z.literal('untilRemoved') }),
]);
export type StatusEffectDuration = z.infer<typeof StatusEffectDurationSchema>;

export const StatusEffectSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  source: z.string().optional(),
  duration: StatusEffectDurationSchema,
  modifiers: z.array(StatusEffectModifierSchema),
});
export type StatusEffect = z.infer<typeof StatusEffectSchema>;

/*
 * Rows below are created blank by the sheet's "Add …" buttons and named afterwards, so
 * their `name` must accept an empty string. Requiring a non-empty name here cost a
 * character its entire record: the blank row failed validation on the next read from
 * localStorage, and that read drops the whole character. StatusEffectSchema keeps
 * .min(1) because effects are added through a form that refuses a blank name.
 */

export const EQUIPMENT_RANKS = ['B', 'A', 'S', 'SS'] as const;
export const EquipmentRankSchema = z.enum(EQUIPMENT_RANKS);
export type EquipmentRank = z.infer<typeof EquipmentRankSchema>;

/** One Abyss Enhancement burned into a piece of equipment, with the Abyss Curse it drags
 *  along (Core II). Deliberately *not* capped at two here even though the book allows no
 *  more: a length cap in the schema would make an over-filled import fail validation, and
 *  a failed parse drops the whole character. The sheet enforces the limit instead.
 *
 *  `kind` picks which pair of catalogs `type`/`curseRoll` are drawn from (Abyss Breaker
 *  pp. 38-46, see data/abyss.ts): 'typical' is the original Core II enhancement list paired
 *  with the base Abyss Curse table, 'skill' is a named Abyss Skill paired with the
 *  Additional Abyss Curse table instead — the book never lets a skill draw from the base
 *  table or a typical enhancement from the additional one. */
export const AbyssEnhancementSchema = z.object({
  id: z.string(),
  kind: z.enum(['typical', 'skill']).default('typical'),
  type: z.string().default(''),
  /** Where the rolled category or damage type gets written for the "vs …" enhancements. */
  notes: z.string().default(''),
  curseRoll: z.string().default(''),
  curseName: z.string().default(''),
});
export type AbyssEnhancement = z.infer<typeof AbyssEnhancementSchema>;

const abyssField = z.array(AbyssEnhancementSchema).default(() => []);

export const WeaponSchema = z.object({
  id: z.string(),
  name: z.string(),
  stance: z.enum(['1H', '2H', 'special']),
  minStr: z.number().int(),
  accuracyBonus: z.number().int().default(0),
  power: z.number().int(),
  criticalValue: z.number().int(),
  extraDamageBonus: z.number().int().default(0),
  range: z.string().optional(),
  rank: EquipmentRankSchema,
  notes: z.string().optional(),
  abyss: abyssField,
});
export type Weapon = z.infer<typeof WeaponSchema>;

export const ArmorSchema = z.object({
  id: z.string(),
  name: z.string(),
  defense: z.number().int(),
  evasionModifier: z.number().int().default(0),
  minStr: z.number().int(),
  rank: EquipmentRankSchema,
  notes: z.string().optional(),
  abyss: abyssField,
});
export type Armor = z.infer<typeof ArmorSchema>;

export const ShieldSchema = z.object({
  id: z.string(),
  name: z.string(),
  defenseBonus: z.number().int(),
  evasionBonus: z.number().int().default(0),
  minStr: z.number().int(),
  /** Weapons and armor already had one; the shield needed it for "Mount Protection",
   *  which is the whole reason a Jockey buys a particular shield (Core III p. 220). */
  notes: z.string().default(''),
  rank: EquipmentRankSchema.default('B'),
  abyss: abyssField,
});
export type Shield = z.infer<typeof ShieldSchema>;

export const AccessorySchema = z.object({
  id: z.string(),
  name: z.string(),
  notes: z.string().optional(),
});
export type Accessory = z.infer<typeof AccessorySchema>;

/** A carried item. `quantity` is what actually gets ticked down in play (potions, gems,
 *  magispheres); `weight` is free text because SW2.5 has no encumbrance rule — most rows
 *  have nothing meaningful to put there, and a forced 0 would only be noise on paper. */
export const InventoryItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  quantity: z.number().int().default(1),
  weight: z.string().default(''),
  notes: z.string().default(''),
});
export type InventoryItem = z.infer<typeof InventoryItemSchema>;

/** The pack. The Adventurer's Set is a single line because the book sells it as one, and
 *  ammunition gets its own counter rather than an item row — a Marksman changes that number
 *  every fight while the type stays put. */
export const InventorySchema = z.object({
  adventurersSet: z.string().default(''),
  items: z.array(InventoryItemSchema).default(() => []),
  ammoType: z.string().default(''),
  ammoCount: z.number().int().default(0),
});
export type Inventory = z.infer<typeof InventorySchema>;

export const EMPTY_INVENTORY: Inventory = { adventurersSet: '', items: [], ammoType: '', ammoCount: 0 };

export const EquipmentSchema = z.object({
  weapons: z.array(WeaponSchema),
  armor: z.array(ArmorSchema),
  shield: ShieldSchema.nullable(),
  accessories: z.array(AccessorySchema),
  inventory: InventorySchema.default(() => EMPTY_INVENTORY),
});
export type Equipment = z.infer<typeof EquipmentSchema>;

export const CurrencySchema = z.object({
  cash: z.number().int(),
  savings: z.number().int(),
  debt: z.number().int(),
  /** Free-form "item :: cost" ledger, per the inventory box in docs/sheet-content. */
  spendingLog: z.string().default(''),
});
export type Currency = z.infer<typeof CurrencySchema>;

/** Free-text personal details. Age is a string on purpose: an Elf's "about 200" and a
 *  Runefolk's "unknown" are both normal answers. `avatar` holds a downscaled data URL —
 *  see lib/avatar.ts for why it is not the original file. */
export const ProfileSchema = z.object({
  gender: z.string().default(''),
  age: z.string().default(''),
  avatar: z.string().default(''),
});
export type Profile = z.infer<typeof ProfileSchema>;

/** Sheet section 10: the parts of a character that are prose, not numbers. */
export const NotesSchema = z.object({
  story: z.string().default(''),
  goals: z.string().default(''),
  gm: z.string().default(''),
});
export type Notes = z.infer<typeof NotesSchema>;

export const ConnectionSchema = z.object({
  id: z.string(),
  name: z.string(),
  relation: z.string(),
  notes: z.string().optional(),
});
export type Connection = z.infer<typeof ConnectionSchema>;

/**
 * The Fellow card (Core Rulebook I pp. 192-202, § 3 optional system): a simplified,
 * damage-immune version of this PC that another play group can borrow as a guest NPC.
 *
 * Name, race, gender, age, adventurer level, MP and classes are read straight off the PC
 * elsewhere on the sheet, not duplicated here — the book copies them from the PC "as is",
 * so there is nothing to store that the sheet does not already compute. Only what the
 * Fellow format adds beyond the PC lives in this schema: a self-introduction, the
 * languages line (the sheet has no general language tracker — see roadmap), whether the
 * player wants XP/rewards credited back, and the Fellow Action Table itself.
 *
 * The Action Table is free text throughout. It is built per Fellow from that specific PC's
 * own abilities (a Fighter's table looks nothing like a Sorcerer's), so there is no catalog
 * to pick from — same reasoning as the free-note fields on known spells and techniques.
 */
export const FellowActionSchema = z.object({
  id: z.string(),
  /** The 1d range this action answers to, e.g. "1-2" or "5". Free text: the book groups
   *  six faces across as few or as many rows as the Fellow has actions for. */
  roll: z.string(),
  name: z.string(),
  dialogue: z.string().optional(),
  /** The check or attack value the book prints for this row, e.g. "12" or "Power 25/Crit Value 10+4". */
  value: z.string().optional(),
  effect: z.string().optional(),
});
export type FellowAction = z.infer<typeof FellowActionSchema>;

export const FellowSchema = z.object({
  selfIntroduction: z.string().default(''),
  languages: z.string().default(''),
  wantsExperience: z.boolean().default(false),
  wantsReward: z.boolean().default(false),
  actions: z.array(FellowActionSchema).default(() => []),
});
export type Fellow = z.infer<typeof FellowSchema>;
export const EMPTY_FELLOW: Fellow = { selfIntroduction: '', languages: '', wantsExperience: false, wantsReward: false, actions: [] };

/** One recorded ability growth. The book's growth roll table is not in the research docs,
 *  so the sheet records the outcome the player rolled rather than rolling for them. */
export const GrowthEntrySchema = z.object({
  id: z.string(),
  ability: AbilityIdSchema,
  /** Adventurer Level at the moment the growth was taken, for the log. */
  adventurerLevel: z.number().int().min(0),
  note: z.string().optional(),
});
export type GrowthEntry = z.infer<typeof GrowthEntrySchema>;

/** A spell the character knows. Catalog picks and hand-written entries share one shape:
 *  the picker only prefills the fields, and everything stays editable afterwards. */
export const KnownSpellSchema = z.object({
  id: z.string(),
  name: z.string(),
  school: z.string(),
  /** Core I stops at 6, Core II and Fairy Magic at 10, the supplement schools at 15.
   *  The cap has to cover the widest of them: a stricter one does not merely reject the
   *  spell, it fails the whole character on the next read from localStorage and drops it. */
  circle: z.number().int().min(1).max(15),
  mp: z.number().int().min(0),
  notes: z.string().optional(),
});
export type KnownSpell = z.infer<typeof KnownSpellSchema>;

/** Experience is a two-number ledger, exactly as it is tracked on paper: everything the
 *  character has earned, and everything already turned into class levels. Both stay
 *  editable — the GM awards XP, and XP can go to things this app does not model. */
export const ExperienceSchema = z.object({
  total: z.number().int().min(0),
  spent: z.number().int().min(0),
});
export type Experience = z.infer<typeof ExperienceSchema>;

export const COMBAT_FEAT_CATEGORIES = ['passive', 'declaration', 'majorAction', 'auto'] as const;
export const CombatFeatCategorySchema = z.enum(COMBAT_FEAT_CATEGORIES);
export type CombatFeatCategory = z.infer<typeof CombatFeatCategorySchema>;

export const CombatFeatSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: CombatFeatCategorySchema,
});
export type CombatFeat = z.infer<typeof CombatFeatSchema>;

/** Rider Stunts (Core Rulebook III pp. 180-189) mark their name with one of three icons: a
 *  circle for always-in-effect, or the Major/Minor Action glyph the same way a combat feat's
 *  "declaration"/"majorAction" categories do. */
export const STUNT_TYPES = ['passive', 'majorAction', 'minorAction'] as const;
export const StuntTypeSchema = z.enum(STUNT_TYPES);
export type StuntType = z.infer<typeof StuntTypeSchema>;

export const StuntSchema = z.object({
  id: z.string(),
  name: z.string(),
  type: StuntTypeSchema,
});
export type Stunt = z.infer<typeof StuntSchema>;

/** Geomancer Domain Aspects (Magus Arts pp. 24-27) — see data/aspects.ts. One slot per
 *  Geomancer class level, the same shape as Rider Stunts. */
export const ASPECT_DOMAINS = ['heavenly', 'earthly', 'spirit'] as const;
export const AspectDomainSchema = z.enum(ASPECT_DOMAINS);
export type AspectDomain = z.infer<typeof AspectDomainSchema>;

export const KnownAspectSchema = z.object({
  id: z.string(),
  name: z.string(),
  domain: AspectDomainSchema,
  notes: z.string().default(''),
});
export type KnownAspect = z.infer<typeof KnownAspectSchema>;

/** The Geomancer's Qi Points (Magus Arts p. 19-20): three counters, one per Aspect domain,
 *  that auto-accumulate at the table during combat — like Edge for the Tactician, this is a
 *  live round-by-round resource the sheet tracks rather than computes. */
export const GeomancerQiSchema = z.object({
  heavenly: z.number().int().min(0).default(0),
  earthly: z.number().int().min(0).default(0),
  spirit: z.number().int().min(0).default(0),
});
export type GeomancerQi = z.infer<typeof GeomancerQiSchema>;

export const EMPTY_GEOMANCER_QI: GeomancerQi = { heavenly: 0, earthly: 0, spirit: 0 };

export const ART_KINDS = ['technique', 'spellsong', 'finale'] as const;
export const ArtKindSchema = z.enum(ART_KINDS);

/** A learned Technique, Spellsong or Finale (Core II). One row shape covers all three:
 *  the fields a kind does not use simply stay empty, which keeps one add/edit/remove path
 *  and one migration for the whole section. Rows taken from the catalog arrive filled in,
 *  hand-written ones start blank — and `notes` is where the player writes what it does,
 *  since the catalog deliberately carries no effect text. */
export const KnownArtSchema = z.object({
  id: z.string(),
  kind: ArtKindSchema,
  name: z.string(),
  /** Class level the book requires — 1 or 5 for everything printed so far. */
  requiredLevel: z.number().int().default(1),
  /** Technique: one of the duration codes in `data/arts.ts`, translated for display. */
  duration: z.string().default(''),
  preparation: z.boolean().default(false),
  singing: z.boolean().default(false),
  pets: z.string().default(''),
  effectCondition: z.string().default(''),
  rhythm: z.string().default(''),
  flourish: z.number().int().default(0),
  extraRhythm: z.string().default(''),
  resistance: z.string().default(''),
  damageType: z.string().default(''),
  notes: z.string().default(''),
});
export type KnownArt = z.infer<typeof KnownArtSchema>;

/** The Bard's rhythm pool and pet. Rhythm is banked by performing and spent on Finales,
 *  so like HP and MP it is a tracker the player moves during a fight, not a derived value. */
export const PerformanceSchema = z.object({
  rhythmNote: z.number().int().default(0),
  rhythmHeart: z.number().int().default(0),
  pet: z.string().default(''),
});
export type Performance = z.infer<typeof PerformanceSchema>;

export const EMPTY_PERFORMANCE: Performance = { rhythmNote: 0, rhythmHeart: 0, pet: '' };

/** A known Evocation (Core III). The Alchemist pays in Material Cards rather than MP, and
 *  the rank of the card spent is chosen at the table, so the row records the cost as the
 *  book prints it ("Green ×2") and leaves the rank out. `notes` carries the effect, which
 *  the catalog deliberately does not. */
export const KnownEvocationSchema = z.object({
  id: z.string(),
  name: z.string(),
  /** Alchemist level the book requires: 1, 5 or 10. */
  requiredLevel: z.number().int().default(1),
  cards: z.string().default(''),
  /** ▶▶ — usable as a Minor Action. */
  minorAction: z.boolean().default(false),
  /** △ — usable during Combat Preparation. */
  preparation: z.boolean().default(false),
  notes: z.string().default(''),
});
export type KnownEvocation = z.infer<typeof KnownEvocationSchema>;

/** The Alchemist's stock of Material Cards, keyed "<colour>-<rank>" (see data/evocations.ts).
 *  A record rather than a fixed 5×4 object so an unseen colour or rank cannot break a
 *  saved character; anything missing simply reads as zero. */
export const MaterialCardsSchema = z.record(z.string(), z.number().int().min(0));
export type MaterialCards = z.infer<typeof MaterialCardsSchema>;

/** One section of a mount (Core III). A single-section mount has exactly one of these with
 *  an empty name; Tilgris, Draconet and the Lesser Dragon have two to four, each a separate
 *  target with its own HP. Numbers are copied from the catalog at the mount's level and stay
 *  editable, like every other row on this sheet — a GM's mount is a legal mount too. */
export const MountSectionSchema = z.object({
  name: z.string().default(''),
  attack: z.string().default(''),
  accuracy: z.number().int().default(0),
  /** A dice expression as the book prints it ("2d+15"), not a number. */
  damage: z.string().default(''),
  evasion: z.number().int().default(0),
  defense: z.number().int().default(0),
  hpMax: z.number().int().default(0),
  /** Tracked in play: a section at 0 HP is disabled until regenerated. */
  hpCurrent: z.number().int().default(0),
  mp: z.number().int().default(0),
  /** The book prints these against the main section only; the others stay at 0. */
  fortitude: z.number().int().default(0),
  willpower: z.number().int().default(0),
  /** One mount weapon and one mount armor per section (Core III p. 249). */
  weapon: z.string().default(''),
  armor: z.string().default(''),
});
export type MountSection = z.infer<typeof MountSectionSchema>;

/** How the jockey holds the mount: rented through a Mount Contract, or bought outright with
 *  a Proprietary Contract — which is also what grants +10 Max HP to every section. */
export const MOUNT_CONTRACTS = ['rental', 'proprietary'] as const;
export const MountContractSchema = z.enum(MOUNT_CONTRACTS);

/** A mount on the sheet: a small monster rather than an item, so it carries its own stat
 *  block. `level` is the mount's level — the jockey's Adventurer Level clamped to the
 *  mount's Appropriate Level range — and re-picking it refills the section numbers. */
export const KnownMountSchema = z.object({
  id: z.string(),
  /** Catalog id, or '' for a mount typed in by hand. */
  mountId: z.string().default(''),
  name: z.string(),
  category: z.string().default(''),
  level: z.number().int().default(1),
  appropriateLevel: z.string().default(''),
  intelligence: z.string().default(''),
  perception: z.string().default(''),
  language: z.string().default(''),
  weakPoint: z.string().default(''),
  movement: z.string().default(''),
  contract: MountContractSchema.default('rental'),
  /** Reduced to a figurine or packed into a sphere, rather than standing next to you. */
  carried: z.boolean().default(false),
  sections: z.array(MountSectionSchema).default(() => []),
  uniqueSkills: z.string().default(''),
  notes: z.string().default(''),
});
export type KnownMount = z.infer<typeof KnownMountSchema>;

/** A known Work Skill (§ 3 optional system, Epic Treasury/Raxia Life). Catalog picks and
 *  hand-written entries share one shape, same as spells and arts — `notes` is where a
 *  player writes what a check does, since the catalog carries no check text or level
 *  bonuses (see data/work-skills.ts). Level is not capped at parse time: the book's "5 per
 *  skill, 10 total" is a creation-time guideline the sheet surfaces as a warning, not a
 *  hard rule an import could fail on. */
export const KnownWorkSkillSchema = z.object({
  id: z.string(),
  name: z.string(),
  category: z.string().default(''),
  level: z.number().int().min(1).max(15),
  notes: z.string().default(''),
});
export type KnownWorkSkill = z.infer<typeof KnownWorkSkillSchema>;

export const CharacterSchema = z.object({
  schemaVersion: z.literal(CURRENT_SCHEMA_VERSION),
  id: z.string(),
  name: z.string(),
  raceId: z.string(),
  background: z.string(),
  abilities: AbilitiesSchema,
  classes: z.array(ClassLevelSchema),
  hp: z.object({ current: z.number().int() }),
  mp: z.object({ current: z.number().int() }),
  statusEffects: z.array(StatusEffectSchema),
  // .default(...) lets parse() backfill characters saved before these fields existed,
  // instead of throwing when loading old data from localStorage.
  equipment: EquipmentSchema.default(() => ({ weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY })),
  /** Character-wide, not per-item: accumulates from using Abyss Skills or the Abyss
   *  Corruption Table (Abyss Breaker pp. 44-46). At 5 the book Daemonizes the character —
   *  the sheet only tracks and flags the count, the GM/player decide what happens at 5. */
  abyssCorruptionLevel: z.number().int().min(0).default(0),
  currency: CurrencySchema.default(() => ({ cash: 0, savings: 0, debt: 0, spendingLog: '' })),
  combatFeats: z.array(CombatFeatSchema).default(() => []),
  experience: ExperienceSchema.default(() => ({ total: 0, spent: 0 })),
  spells: z.array(KnownSpellSchema).default(() => []),
  /** Enhancer Techniques and Bard Spellsongs/Finales — see KnownArtSchema. */
  arts: z.array(KnownArtSchema).default(() => []),
  /** Alchemist Evocations and the Material Cards they are paid with — see KnownEvocationSchema. */
  evocations: z.array(KnownEvocationSchema).default(() => []),
  materialCards: MaterialCardsSchema.default(() => ({})),
  /** The Rider's mounts — see KnownMountSchema. */
  mounts: z.array(KnownMountSchema).default(() => []),
  /** Rider Stunts — see StuntSchema. One slot per Rider class level, same shape as SCA. */
  stunts: z.array(StuntSchema).default(() => []),
  /** Geomancer Domain Aspects — see KnownAspectSchema. One slot per Geomancer class level. */
  aspects: z.array(KnownAspectSchema).default(() => []),
  geomancerQi: GeomancerQiSchema.default(() => EMPTY_GEOMANCER_QI),
  performance: PerformanceSchema.default(() => EMPTY_PERFORMANCE),
  growthLog: z.array(GrowthEntrySchema).default(() => []),
  /** Guild reputation points; the Adventurer Rank is derived from them, never stored. */
  reputation: z.number().int().min(0).default(0),
  profile: ProfileSchema.default(() => ({ gender: '', age: '', avatar: '' })),
  notes: NotesSchema.default(() => ({ story: '', goals: '', gm: '' })),
  connections: z.array(ConnectionSchema).default(() => []),
  fellow: FellowSchema.default(() => EMPTY_FELLOW),
  /** § 3 optional system — see KnownWorkSkillSchema. */
  workSkills: z.array(KnownWorkSkillSchema).default(() => []),
});
export type Character = z.infer<typeof CharacterSchema>;

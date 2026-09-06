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

/** One Abyss Enhancement burned into a piece of equipment, with the Abyss Curse it drags
 *  along (Core II). Deliberately *not* capped at two here even though the book allows no
 *  more: a length cap in the schema would make an over-filled import fail validation, and
 *  a failed parse drops the whole character. The sheet enforces the limit instead. */
export const AbyssEnhancementSchema = z.object({
  id: z.string(),
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
  /** Core I stops at 6; Core II schools go to 10. */
  circle: z.number().int().min(1).max(10),
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
  currency: CurrencySchema.default(() => ({ cash: 0, savings: 0, debt: 0, spendingLog: '' })),
  combatFeats: z.array(CombatFeatSchema).default(() => []),
  experience: ExperienceSchema.default(() => ({ total: 0, spent: 0 })),
  spells: z.array(KnownSpellSchema).default(() => []),
  /** Enhancer Techniques and Bard Spellsongs/Finales — see KnownArtSchema. */
  arts: z.array(KnownArtSchema).default(() => []),
  performance: PerformanceSchema.default(() => EMPTY_PERFORMANCE),
  growthLog: z.array(GrowthEntrySchema).default(() => []),
  /** Guild reputation points; the Adventurer Rank is derived from them, never stored. */
  reputation: z.number().int().min(0).default(0),
  profile: ProfileSchema.default(() => ({ gender: '', age: '', avatar: '' })),
  notes: NotesSchema.default(() => ({ story: '', goals: '', gm: '' })),
  connections: z.array(ConnectionSchema).default(() => []),
});
export type Character = z.infer<typeof CharacterSchema>;

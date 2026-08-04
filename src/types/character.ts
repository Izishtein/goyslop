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

export const EQUIPMENT_RANKS = ['B', 'A', 'S', 'SS'] as const;
export const EquipmentRankSchema = z.enum(EQUIPMENT_RANKS);

export const WeaponSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  stance: z.enum(['1H', '2H', 'special']),
  minStr: z.number().int(),
  accuracyBonus: z.number().int().default(0),
  power: z.number().int(),
  criticalValue: z.number().int(),
  extraDamageBonus: z.number().int().default(0),
  range: z.string().optional(),
  rank: EquipmentRankSchema,
  notes: z.string().optional(),
});
export type Weapon = z.infer<typeof WeaponSchema>;

export const ArmorSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  defense: z.number().int(),
  evasionModifier: z.number().int().default(0),
  minStr: z.number().int(),
  rank: EquipmentRankSchema,
  notes: z.string().optional(),
});
export type Armor = z.infer<typeof ArmorSchema>;

export const ShieldSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  defenseBonus: z.number().int(),
  evasionBonus: z.number().int().default(0),
  minStr: z.number().int(),
});
export type Shield = z.infer<typeof ShieldSchema>;

export const AccessorySchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  notes: z.string().optional(),
});
export type Accessory = z.infer<typeof AccessorySchema>;

export const EquipmentSchema = z.object({
  weapons: z.array(WeaponSchema),
  armor: z.array(ArmorSchema),
  shield: ShieldSchema.nullable(),
  accessories: z.array(AccessorySchema),
});
export type Equipment = z.infer<typeof EquipmentSchema>;

export const CurrencySchema = z.object({
  cash: z.number().int(),
  savings: z.number().int(),
  debt: z.number().int(),
});
export type Currency = z.infer<typeof CurrencySchema>;

export const COMBAT_FEAT_CATEGORIES = ['passive', 'declaration', 'majorAction', 'auto'] as const;
export const CombatFeatCategorySchema = z.enum(COMBAT_FEAT_CATEGORIES);
export type CombatFeatCategory = z.infer<typeof CombatFeatCategorySchema>;

export const CombatFeatSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  category: CombatFeatCategorySchema,
});
export type CombatFeat = z.infer<typeof CombatFeatSchema>;

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
  equipment: EquipmentSchema.default(() => ({ weapons: [], armor: [], shield: null, accessories: [] })),
  currency: CurrencySchema.default(() => ({ cash: 0, savings: 0, debt: 0 })),
  combatFeats: z.array(CombatFeatSchema).default(() => []),
});
export type Character = z.infer<typeof CharacterSchema>;

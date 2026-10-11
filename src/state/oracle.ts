import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { ENTRY_KINDS } from '../lib/campaign';
import {
  ADJUSTMENT_COUNT,
  CONNECTOR_COUNT,
  CHAOS_FLAVORS,
  THEME_WORDS,
  THEMES,
  CHAOS_MODES,
  CHAOS_MAX,
  CHAOS_MIN,
  CHAOS_START,
  EMPTY_ORACLE,
  FOCUS_MAX,
  LIKELIHOODS,
  LOG_LIMIT,
  WORD_COUNT,
  type OracleState,
} from '../lib/oracle';

const EventSchema = z.object({
  focus: z.number().int().min(1).max(FOCUS_MAX),
  action: z.number().int().min(1).max(WORD_COUNT),
  subject: z.number().int().min(1).max(WORD_COUNT),
  ref: z.object({ kind: z.enum(ENTRY_KINDS), title: z.string() }).nullable().optional(),
  note: z.string().nullable().optional(),
});

const AdjustmentSchema = z.object({
  roll: z.number().int().min(1).max(10),
  edits: z.array(z.number().int().min(1).max(ADJUSTMENT_COUNT)).min(1).max(2),
});

const base = { id: z.string(), chaos: z.number().int(), roll: z.number().int() };

const EntrySchema = z.discriminatedUnion('kind', [
  z.object({
    ...base,
    kind: z.literal('question'),
    likelihood: z.enum(LIKELIHOODS),
    chance: z.number(),
    answer: z.enum(['exceptionalYes', 'yes', 'no', 'exceptionalNo']),
    event: EventSchema.nullable(),
    asRule: z.boolean().optional(),
  }),
  z.object({
    ...base,
    kind: z.literal('scene'),
    scene: z.number().int(),
    twist: z.enum(['expected', 'altered', 'interrupted', 'bonusEvent']),
    event: EventSchema.nullable(),
    adjustment: AdjustmentSchema.nullable().optional(),
  }),
  z.object({ id: z.string(), kind: z.literal('adjustment'), ...AdjustmentSchema.shape }),
  z.object({
    id: z.string(),
    kind: z.literal('themed'),
    theme: z.enum(THEMES),
    a: z.number().int().min(1).max(THEME_WORDS),
    b: z.number().int().min(1).max(THEME_WORDS),
  }),
  z.object({ id: z.string(), kind: z.literal('keyed'), scene: z.number().int(), titles: z.array(z.string()) }),
  z.object({
    ...base,
    kind: z.literal('discovery'),
    title: z.string(),
    chance: z.number(),
    answer: z.enum(['exceptionalYes', 'yes', 'no', 'exceptionalNo']),
    deadEnd: z.boolean(),
    finds: z.array(
      z.object({
        d10: z.number().int(),
        total: z.number().int(),
        result: z.enum(['progress', 'flashpoint', 'track', 'strengthen']),
        points: z.number().int(),
      }),
    ),
    event: EventSchema.nullable(),
  }),
  z.object({
    id: z.string(),
    kind: z.literal('words'),
    action: z.number().int().min(1).max(WORD_COUNT),
    subject: z.number().int().min(1).max(WORD_COUNT),
    connector: z.number().int().min(1).max(CONNECTOR_COUNT),
  }),
  z.object({ id: z.string(), kind: z.literal('event'), event: EventSchema }),
  z.object({
    id: z.string(),
    kind: z.literal('sceneEnd'),
    scene: z.number().int(),
    from: z.number().int(),
    to: z.number().int(),
    controlled: z.boolean().nullable(),
  }),
]);

const OracleSchema = z.object({
  chaos: z.number().int().min(CHAOS_MIN).max(CHAOS_MAX).default(CHAOS_START),
  scene: z.number().int().min(0).default(0),
  chaosMode: z.enum(CHAOS_MODES).default('normal'),
  chaosFlavor: z.enum(CHAOS_FLAVORS).default('full'),
  ruleMode: z.boolean().default(false),
  log: z.array(EntrySchema).max(LOG_LIMIT).default(() => []),
});

const raw = createJSONStorage<OracleState>(() => localStorage);

/** Read through the schema: a damaged or older entry becomes a fresh oracle, not an error. */
const storage = {
  ...raw,
  setItem(key: string, value: OracleState) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the oracle to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: OracleState): OracleState {
    const result = OracleSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? (result.data as OracleState) : initialValue;
  },
};

export const oracleAtom = atomWithStorage<OracleState>('sw25.oracle', EMPTY_ORACLE, storage);

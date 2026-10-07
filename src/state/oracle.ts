import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import {
  CHAOS_MAX,
  CHAOS_MIN,
  CHAOS_START,
  EMPTY_ORACLE,
  FOCUS_COUNT,
  LIKELIHOODS,
  LOG_LIMIT,
  WORD_COUNT,
  type OracleState,
} from '../lib/oracle';

const EventSchema = z.object({
  focus: z.number().int().min(1).max(FOCUS_COUNT),
  action: z.number().int().min(1).max(WORD_COUNT),
  subject: z.number().int().min(1).max(WORD_COUNT),
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
  }),
  z.object({
    ...base,
    kind: z.literal('scene'),
    scene: z.number().int(),
    twist: z.enum(['expected', 'altered', 'interrupted']),
    event: EventSchema.nullable(),
  }),
  z.object({ id: z.string(), kind: z.literal('event'), event: EventSchema }),
]);

const OracleSchema = z.object({
  chaos: z.number().int().min(CHAOS_MIN).max(CHAOS_MAX).default(CHAOS_START),
  scene: z.number().int().min(0).default(0),
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

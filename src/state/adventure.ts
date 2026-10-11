import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { FEATURE_LIMIT, KEYED_LIMIT, TEXT_LIMIT, TRIGGERS, type KeyedScene } from '../lib/keyed';

/** Keyed scenes and the settings of a prepared adventure; kept apart from the oracle so a reset does not wipe the plot. */
export interface AdventureState {
  prepared: boolean;
  /** 1 = the party the module was written for; smaller = one weaker hero among stronger foes. */
  diminisher: number;
  features: string[];
  keyed: KeyedScene[];
}

export const EMPTY_ADVENTURE: AdventureState = { prepared: false, diminisher: 1, features: [], keyed: [] };

const AdventureSchema = z.object({
  prepared: z.boolean().default(false),
  diminisher: z.number().min(0.1).max(1).default(1),
  features: z.array(z.string().max(TEXT_LIMIT)).max(FEATURE_LIMIT).default(() => []),
  keyed: z
    .array(
      z.object({
        id: z.string(),
        title: z.string().max(TEXT_LIMIT),
        trigger: z.enum(TRIGGERS),
        every: z.number().int().min(1).max(99).default(3),
        chance: z.number().int().min(1).max(10).default(2),
        at: z.number().int().min(1).max(999).default(10),
        repeat: z.boolean().default(false),
        count: z.number().int().min(0).default(0),
        done: z.boolean().default(false),
      }),
    )
    .max(KEYED_LIMIT)
    .default(() => []),
});

const raw = createJSONStorage<AdventureState>(() => localStorage);

/** Read through the schema; a quota error on write is logged, not thrown. */
const storage = {
  ...raw,
  setItem(key: string, value: AdventureState) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the adventure to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: AdventureState): AdventureState {
    const result = AdventureSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? result.data : initialValue;
  },
};

export const adventureAtom = atomWithStorage<AdventureState>('sw25.adventure', EMPTY_ADVENTURE, storage);

import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { EMPTY_ENCOUNTER, type Encounter } from '../lib/encounter';

const EncounterSchema = z.object({
  round: z.number().int().min(0).default(0),
  monsters: z
    .array(
      z.object({
        id: z.string(),
        monsterId: z.string(),
        label: z.string(),
        sections: z.array(z.object({ hp: z.number().int(), mp: z.number().int(), fate: z.enum(['out', 'dead']).optional() })),
        identified: z.boolean().optional(),
        weakKnown: z.boolean().optional(),
      }),
    )
    .default(() => []),
});

const raw = createJSONStorage<Encounter>(() => localStorage);

/**
 * The fight in progress, kept across reloads — losing a monster's HP to a refresh mid-round
 * would be the worst moment to lose it. Read through the schema, so a stale or damaged entry
 * becomes an empty table instead of an error.
 */
const storage = {
  ...raw,
  setItem(key: string, value: Encounter) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the encounter to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: Encounter): Encounter {
    const result = EncounterSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? result.data : initialValue;
  },
};

export const encounterAtom = atomWithStorage<Encounter>('sw25.encounter', EMPTY_ENCOUNTER, storage);

/** Hide a monster's Initiative, saves and Weak Point until Monster Knowledge has revealed them. */
export const hideUnknownAtom = atomWithStorage<boolean>('sw25.hideUnknown', false);

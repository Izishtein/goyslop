import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { PURSUIT_STATES } from '../lib/boarding';
import { GOODS } from '../lib/ships';
import { HUNGER_MAX, SHIPS, WEATHERS, type Voyage } from '../lib/voyage';

const point = z.object({ q: z.number().int(), r: z.number().int() });

const VoyageSchema = z
  .object({
    ship: z.enum(SHIPS),
    day: z.number().int().min(0),
    hull: z.number().int().min(0),
    supplies: z.number().int().min(0),
    weather: z.enum(WEATHERS).nullable(),
    encounter: z.object({ monsterId: z.string(), count: z.number().int().min(1) }).nullable(),
    wrecked: z.boolean(),
    level: z.number().int().min(1),
    // A voyage saved on the old separate chart has no place on the map: it reads as no voyage.
    at: point,
    aboard: z.boolean().default(true),
    moves: z.number().int().min(0).default(0),
    hunger: z.number().int().min(0).max(HUNGER_MAX).default(0),
    escorts: z.array(z.object({ ship: z.enum(SHIPS), hull: z.number().int().min(0) })).max(2).default(() => []),
    cargo: z
      .array(z.number().int().min(0))
      .max(GOODS.length)
      .default(() => GOODS.map(() => 0)),
    pursuit: z
      .object({
        ship: z.enum(SHIPS),
        hull: z.number().int().min(0),
        crewId: z.string(),
        crewCount: z.number().int().min(0),
        crewLevel: z.number().int().min(0),
        state: z.enum(PURSUIT_STATES),
        round: z.number().int().min(0),
      })
      .nullable()
      .default(null),
    crew: z.number().int().min(0).max(60).nullable().default(null),
    recruits: z.number().int().min(0).max(20).nullable().default(null),
  })
  .nullable();

const raw = createJSONStorage<Voyage | null>(() => localStorage);

/** The voyage in progress, kept across reloads; a damaged entry reads as no voyage. */
const storage = {
  ...raw,
  setItem(key: string, value: Voyage | null) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the voyage to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: Voyage | null): Voyage | null {
    const result = VoyageSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? result.data : initialValue;
  },
};

export const voyageAtom = atomWithStorage<Voyage | null>('sw25.voyage', null, storage);

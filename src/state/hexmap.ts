import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { RELATIONS } from '../lib/factions';
import { BIOMES, EMPTY_HEXMAP, LANDMARK_COUNT, SETTLEMENT_KINDS, type HexMap } from '../lib/hexmap';

const FeatureSchema = z.object({
  kind: z.enum(['landmark', 'settlement', 'lair', 'dungeon', 'empty']),
  settlement: z.enum(SETTLEMENT_KINDS).optional(),
  landmark: z.number().int().min(1).max(LANDMARK_COUNT).optional(),
  monsterId: z.string().optional(),
  count: z.number().int().min(1).optional(),
});

const HexMapSchema = z.object({
  hexes: z
    .array(
      z.object({
        q: z.number().int(),
        r: z.number().int(),
        biome: z.enum(BIOMES),
        feature: FeatureSchema,
        visited: z.boolean(),
        seen: z.boolean(),
        camp: z.boolean().optional(),
      }),
    )
    .max(800)
    .default(() => []),
  party: z.object({ q: z.number().int(), r: z.number().int() }).default({ q: 0, r: 0 }),
  rations: z.number().int().min(0).default(0),
  fatigue: z.number().int().min(0).max(5).default(0),
  patches: z.array(z.object({ q: z.number().int(), r: z.number().int() })).max(40).default(() => []),
  level: z.number().int().min(1).default(1),
  factions: z
    .array(
      z.object({
        id: z.number().int(),
        seats: z.array(
          z.object({ kind: z.enum(['fortress', 'town', 'tower', 'monastery', 'lair']), q: z.number().int(), r: z.number().int(), monsterId: z.string().optional() }),
        ),
        domain: z.array(z.string()),
      }),
    )
    .max(40)
    .default(() => []),
  relations: z
    .array(z.object({ a: z.number().int(), b: z.number().int(), relation: z.enum(RELATIONS) }))
    .max(800)
    .default(() => []),
});

const raw = createJSONStorage<HexMap>(() => localStorage);

/** Read through the schema; a damaged entry becomes "no map yet", and a full quota is logged, not thrown. */
const storage = {
  ...raw,
  setItem(key: string, value: HexMap) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the hex map to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: HexMap): HexMap {
    const result = HexMapSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? result.data : initialValue;
  },
};

export const hexMapAtom = atomWithStorage<HexMap>('sw25.hexmap', EMPTY_HEXMAP, storage);

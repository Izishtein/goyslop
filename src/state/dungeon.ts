import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { ROOM_KINDS, type Dungeon } from '../lib/dungeon';

const RoomSchema = z.object({
  id: z.number().int(),
  x: z.number().int(),
  y: z.number().int(),
  kind: z.enum(ROOM_KINDS),
  links: z.array(z.number().int()),
  visited: z.boolean(),
  seen: z.boolean(),
  cleared: z.boolean(),
  monsterId: z.string().optional(),
  count: z.number().int().optional(),
  trap: z.number().int().optional(),
  hazard: z.number().int().optional(),
  special: z.number().int().optional(),
  gold: z.number().int().optional(),
  item: z.boolean().optional(),
});

const DungeonSchema = z
  .object({
    place: z.string(),
    theme: z.number().int().min(1),
    level: z.number().int().min(1),
    levels: z.array(z.object({ rooms: z.array(RoomSchema).max(30) })).min(1).max(3),
    at: z.object({ level: z.number().int().min(0), room: z.number().int().min(0) }),
  })
  .nullable();

const raw = createJSONStorage<Dungeon | null>(() => localStorage);

/** The dungeon being explored, or null. A damaged entry reads as "none", and a full quota is logged, not thrown. */
const storage = {
  ...raw,
  setItem(key: string, value: Dungeon | null) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the dungeon to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: Dungeon | null): Dungeon | null {
    const result = DungeonSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? result.data : initialValue;
  },
};

export const dungeonAtom = atomWithStorage<Dungeon | null>('sw25.dungeon', null, storage);

import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { FOG_SIGHT_MAX, CELL_METERS_MAX, CELL_METERS_MIN, COLS_MAX, COLS_MIN, DEFAULT_SETTINGS, ROWS_MAX, ROWS_MIN } from '../lib/battlefield';

const CellSchema = z.object({ col: z.number().int().min(0).max(COLS_MAX), row: z.number().int().min(0).max(ROWS_MAX) });

export const CUSTOM_LIMIT = 40;

/**
 * The battlefield between sessions: the grid, where each token stands, the tokens the player added by hand, and whether a
 * map picture is stored (the picture itself is in IndexedDB, see lib/image-store.ts — localStorage keeps only this note).
 * Party and monster tokens are not stored: they are read off the table and the party, and only their cells are kept here.
 */
export const FieldSchema = z.object({
  cols: z.number().int().min(COLS_MIN).max(COLS_MAX).default(DEFAULT_SETTINGS.cols),
  rows: z.number().int().min(ROWS_MIN).max(ROWS_MAX).default(DEFAULT_SETTINGS.rows),
  cellMeters: z.number().min(CELL_METERS_MIN).max(CELL_METERS_MAX).default(DEFAULT_SETTINGS.cellMeters),
  showGrid: z.boolean().default(true),
  hasMap: z.boolean().default(false),
  /** Height over width of the stored map picture: rows follow it so cells stay square. */
  mapRatio: z.number().min(0).max(20).default(0),
  positions: z.record(z.string(), CellSchema).default(() => ({})),
  /** Fog of war (roadmap 5.4): what the party has not yet seen is covered, and foes standing in it are not shown. */
  fog: z
    .object({
      on: z.boolean().default(false),
      sight: z.number().min(0).max(FOG_SIGHT_MAX).default(0),
      revealed: z.array(z.string().regex(/^\d+,\d+$/)).max((COLS_MAX + 1) * (ROWS_MAX + 1)).default(() => []),
    })
    .default(() => ({ on: false, sight: 0, revealed: [] })),
  custom: z
    .array(z.object({ id: z.string(), label: z.string().max(40) }))
    .max(CUSTOM_LIMIT)
    .default(() => []),
});

export type Field = z.infer<typeof FieldSchema>;

export const EMPTY_FIELD: Field = FieldSchema.parse({});

const raw = createJSONStorage<Field>(() => localStorage);

const storage = {
  ...raw,
  setItem(key: string, value: Field) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the battlefield to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: Field): Field {
    const result = FieldSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? result.data : initialValue;
  },
};

export const fieldAtom = atomWithStorage<Field>('sw25.battlefield', EMPTY_FIELD, storage);

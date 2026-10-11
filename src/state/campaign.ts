import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { z } from 'zod';
import { EMPTY_CAMPAIGN, ENTRY_KINDS, ENTRY_LIMIT, TEXT_LIMIT, TITLE_LIMIT, WEIGHT_MAX, WEIGHT_MIN, type Campaign } from '../lib/campaign';

const CampaignSchema = z.object({
  day: z.number().int().min(1).default(1),
  entries: z
    .array(
      z.object({
        id: z.string(),
        kind: z.enum(ENTRY_KINDS),
        title: z.string().max(TITLE_LIMIT),
        text: z.string().max(TEXT_LIMIT).default(''),
        closed: z.boolean().default(false),
        day: z.number().int().min(1).default(1),
        scene: z.number().int().min(0).default(0),
        weight: z.number().int().min(WEIGHT_MIN).max(WEIGHT_MAX).default(WEIGHT_MIN),
        trackSize: z.number().int().min(0).max(20).default(0),
        progress: z.number().int().min(0).max(20).default(0),
        flashpoints: z.number().int().min(0).max(15).default(0),
      }),
    )
    .max(ENTRY_LIMIT)
    .default(() => []),
});

const raw = createJSONStorage<Campaign>(() => localStorage);

/** Read through the schema; a quota error on write is logged, not thrown — the note stays on screen. */
const storage = {
  ...raw,
  setItem(key: string, value: Campaign) {
    try {
      raw.setItem(key, value);
    } catch (error) {
      console.error('Could not write the campaign log to localStorage:', error);
    }
  },
  getItem(key: string, initialValue: Campaign): Campaign {
    const result = CampaignSchema.safeParse(raw.getItem(key, initialValue));
    return result.success ? result.data : initialValue;
  },
};

export const campaignAtom = atomWithStorage<Campaign>('sw25.campaign', EMPTY_CAMPAIGN, storage);

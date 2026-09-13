import { atomWithStorage } from 'jotai/utils';

export type ThemePreference = 'system' | 'light' | 'dark';

/** 'system' means "no override" — index.css falls back to prefers-color-scheme. */
export const themeAtom = atomWithStorage<ThemePreference>('sw25.theme', 'system');

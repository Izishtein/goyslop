import { atom, useAtom } from 'jotai';

/**
 * Feats declared or used this turn, per character — session state only, deliberately not in
 * the character record. It lives outside the feats section because the weapon rows read it
 * too: a declared [Power Strike I] has to reach the damage roll, and the two sections sit
 * on different tabs of the sheet.
 */
export const turnFeatsAtom = atom<Record<string, string[]>>({});

export function useTurnFeats(characterId: string): [string[], (next: (current: string[]) => string[]) => void] {
  const [all, setAll] = useAtom(turnFeatsAtom);
  const current = all[characterId] ?? [];
  const set = (next: (current: string[]) => string[]) => setAll((state) => ({ ...state, [characterId]: next(state[characterId] ?? []) }));
  return [current, set];
}

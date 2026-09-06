import { useSetAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { useCallback } from 'react';
import { CharacterSchema, type Character } from '../types/character';

const rawCharactersStorage = createJSONStorage<Character[]>(() => localStorage);
const rawActiveIdStorage = createJSONStorage<string | null>(() => localStorage);

/**
 * Fired when the browser refuses to store something. localStorage is the only copy the app
 * has, so a silently dropped write means the player keeps filling in a sheet that is no
 * longer saved anywhere — the quota covers a few megabytes for the whole origin and a
 * roster of portraits can reach it, and a locked-down browser can refuse writes outright.
 * Reported rather than thrown: the throw would land in the middle of a React update.
 */
export const STORAGE_ERROR_EVENT = 'sw25:storage-error';

function reportWriteFailure(error: unknown) {
  console.error('Could not write to localStorage:', error);
  window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT));
}

/**
 * Re-validates every stored character through CharacterSchema on read, so fields added
 * after a character was saved (e.g. equipment, currency) get backfilled via Zod .default()
 * instead of crashing components that assume the current shape. Characters that fail
 * validation entirely are dropped rather than taking down the whole list.
 */
const charactersStorage = {
  ...rawCharactersStorage,
  setItem(key: string, value: Character[]) {
    try {
      rawCharactersStorage.setItem(key, value);
    } catch (error) {
      reportWriteFailure(error);
    }
  },
  getItem(key: string, initialValue: Character[]): Character[] {
    const stored = rawCharactersStorage.getItem(key, initialValue);
    if (!Array.isArray(stored)) return initialValue;
    return stored.flatMap((raw) => {
      const result = CharacterSchema.safeParse(raw);
      if (!result.success) {
        console.warn('Dropping unreadable saved character:', result.error);
        return [];
      }
      return [result.data];
    });
  },
};

/** Guarded the same way: switching character writes here, and a throw would break that too. */
const activeIdStorage = {
  ...rawActiveIdStorage,
  setItem(key: string, value: string | null) {
    try {
      rawActiveIdStorage.setItem(key, value);
    } catch (error) {
      reportWriteFailure(error);
    }
  },
};

export const charactersAtom = atomWithStorage<Character[]>('sw25.characters', [], charactersStorage);
export const activeCharacterIdAtom = atomWithStorage<string | null>('sw25.activeCharacterId', null, activeIdStorage);

/** Returns a function that immutably applies `updater` to the character with the given id. */
export function useUpdateCharacter(characterId: string) {
  const setCharacters = useSetAtom(charactersAtom);
  return useCallback(
    (updater: (character: Character) => Character) => {
      setCharacters((prev) => prev.map((character) => (character.id === characterId ? updater(character) : character)));
    },
    [characterId, setCharacters],
  );
}

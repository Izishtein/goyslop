import { useSetAtom } from 'jotai';
import { atomWithStorage, createJSONStorage } from 'jotai/utils';
import { useCallback } from 'react';
import { CharacterSchema, type Character } from '../types/character';

const rawCharactersStorage = createJSONStorage<Character[]>(() => localStorage);

/**
 * Re-validates every stored character through CharacterSchema on read, so fields added
 * after a character was saved (e.g. equipment, currency) get backfilled via Zod .default()
 * instead of crashing components that assume the current shape. Characters that fail
 * validation entirely are dropped rather than taking down the whole list.
 */
const charactersStorage = {
  ...rawCharactersStorage,
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

export const charactersAtom = atomWithStorage<Character[]>('sw25.characters', [], charactersStorage);
export const activeCharacterIdAtom = atomWithStorage<string | null>('sw25.activeCharacterId', null);

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

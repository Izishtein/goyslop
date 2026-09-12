import { CharacterSchema, type Character } from '../../types/character';

export function characterToJson(character: Character): string {
  return JSON.stringify(character, null, 2);
}

export function characterFileName(character: Character): string {
  const safeName = character.name.trim().replace(/[^a-zA-Z0-9-_]+/g, '_') || 'character';
  return `${safeName}.sw25.json`;
}

export function charactersToJson(characters: Character[]): string {
  return JSON.stringify(characters, null, 2);
}

export function rosterFileName(): string {
  return 'roster.sw25.json';
}

export type ImportRosterResult = { success: true; characters: Character[] } | { success: false; error: string };

/** Parses and validates an imported file's contents, accepting either shape a file can hold:
 * one character (the per-character export) or an array of them (the whole-roster export).
 * Applies the same schema defaults/backfill used for localStorage so exports from older app
 * versions still import. An array with some unreadable entries still imports the ones that
 * parse — the same tolerance `charactersAtom` already gives a saved roster, applied here to
 * an imported one. */
export function parseImportedCharacters(jsonText: string): ImportRosterResult {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return { success: false, error: 'invalidJson' };
  }

  const entries = Array.isArray(raw) ? raw : [raw];
  const characters = entries.flatMap((entry) => {
    const result = CharacterSchema.safeParse(entry);
    return result.success ? [result.data] : [];
  });

  if (characters.length === 0) {
    return { success: false, error: 'invalidCharacter' };
  }
  return { success: true, characters };
}

import { CharacterSchema, type Character } from '../../types/character';

export function characterToJson(character: Character): string {
  return JSON.stringify(character, null, 2);
}

export function characterFileName(character: Character): string {
  const safeName = character.name.trim().replace(/[^a-zA-Z0-9-_]+/g, '_') || 'character';
  return `${safeName}.sw25.json`;
}

export type ImportResult = { success: true; character: Character } | { success: false; error: string };

/** Parses and validates an imported character file's contents, applying the same schema
 * defaults/backfill used for localStorage so exports from older app versions still import. */
export function parseImportedCharacter(jsonText: string): ImportResult {
  let raw: unknown;
  try {
    raw = JSON.parse(jsonText);
  } catch {
    return { success: false, error: 'invalidJson' };
  }

  const result = CharacterSchema.safeParse(raw);
  if (!result.success) {
    return { success: false, error: 'invalidCharacter' };
  }
  return { success: true, character: result.data };
}

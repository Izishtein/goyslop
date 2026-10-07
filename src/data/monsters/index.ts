import type { Monster } from './types';

export type { Monster, MonsterSection, MonsterSkill, MonsterValue, ValuePair } from './types';
export { MONSTER_CATEGORIES } from './types';

/**
 * The monster catalogue is about a megabyte of text, so it is a separate chunk, fetched when
 * the monsters tab (or a fight) first needs it rather than shipped with the sheet. Source:
 * Monstrous Lore pp. 73-224, produced by scripts/parse-monsters.mjs.
 */
export async function loadMonsters(): Promise<Monster[]> {
  const module = await import('./monsters.json');
  return module.default as unknown as Monster[];
}

export function isValuePair(value: unknown): value is { value: number; fixed: number | null } {
  return typeof value === 'object' && value !== null && 'value' in value;
}

/** "3 (10)" for a pair, the raw mark for a template value, a dash for none. */
export function formatValue(value: unknown): string {
  if (isValuePair(value)) return value.fixed === null ? String(value.value) : `${value.value} (${value.fixed})`;
  if (typeof value === 'object' && value !== null && 'raw' in value) return String((value as { raw: string }).raw);
  return '–';
}

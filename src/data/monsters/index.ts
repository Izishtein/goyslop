import type { Monster } from './types';

export type { Monster, MonsterSection, MonsterSkill, MonsterValue, ValuePair } from './types';
export { ALL_MONSTER_CATEGORIES, EXTRA_MONSTER_CATEGORIES, MONSTER_CATEGORIES } from './types';
export { COMMON_ABILITIES, type CommonAbilityGroup } from './common-abilities';
export { HUMANOID_RACES, HUMANOID_RULES, type HumanoidRace } from './humanoid-races';

/**
 * The monster catalogue is about a megabyte of text, so it is a separate chunk, fetched when
 * the monsters tab (or a fight) first needs it rather than shipped with the sheet. Source:
 * Monstrous Lore pp. 73-224 (scripts/parse-monsters.mjs) plus the golem and familiar cards
 * of pp. 227-238 (scripts/parse-golems.mjs).
 */
export async function loadMonsters(): Promise<Monster[]> {
  const [main, extra] = await Promise.all([import('./monsters.json'), import('./extra-monsters.json')]);
  return [...(main.default as unknown as Monster[]), ...(extra.default as unknown as Monster[])];
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

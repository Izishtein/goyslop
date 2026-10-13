import type { UniqueSkillDefinition } from '../data/unique-skills';

/**
 * The Standard Value of a unique skill: the class level the book names (the Heritor class for a Diablo or
 * Scissorscorpion, the Adventurer level for the rest) plus the named ability modifier. Null where the skill has none
 * ("-" in the book): nothing is rolled for it.
 */
export function standardValueFor(
  skill: UniqueSkillDefinition,
  levels: { adventurer: number; heritor: number },
  modifiers: { INT: number; VIT: number; SPR: number },
): number | null {
  if (!skill.standard) return null;
  return levels[skill.standard.level] + modifiers[skill.standard.ability];
}

/** A cost as a key and values for the i18n tables (reference.uniqueSkillUi.cost.*). */
export function costParts(cost: { mp: number; hp?: number; perTarget?: boolean }): { key: 'mp' | 'mpTarget' | 'hpMpTarget'; values: { mp: number; hp?: number } } {
  if (cost.hp) return { key: 'hpMpTarget', values: { mp: cost.mp, hp: cost.hp } };
  return { key: cost.perTarget ? 'mpTarget' : 'mp', values: { mp: cost.mp } };
}

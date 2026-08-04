import type { AbilityId } from './abilities';
import type { AbilityDice } from '../../data/races';

export interface SkillBodyMind {
  skill: number;
  body: number;
  mind: number;
}

const BASE_SOURCE: Record<AbilityId, keyof SkillBodyMind> = {
  DEX: 'skill',
  AGI: 'skill',
  STR: 'body',
  VIT: 'body',
  INT: 'mind',
  SPR: 'mind',
};

/** DEX/AGI derive from Skill, STR/VIT from Body, INT/SPR from Mind. */
export function abilityBaseFromSplit(split: SkillBodyMind, ability: AbilityId): number {
  return split[BASE_SOURCE[ability]];
}

export function formatDiceNotation(dice: AbilityDice): string {
  return dice.bonus > 0 ? `${dice.count}d6+${dice.bonus}` : `${dice.count}d6`;
}

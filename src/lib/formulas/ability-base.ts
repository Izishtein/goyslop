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

/** Correction is a roll of the racial die, so it can only land between all-ones and
 *  all-sixes (plus the flat bonus): 2d6+1 gives 3..13. */
export function correctionRange(dice: AbilityDice): { min: number; max: number } {
  return { min: dice.count + dice.bonus, max: dice.count * 6 + dice.bonus };
}

export function isCorrectionInRange(dice: AbilityDice, correction: number): boolean {
  const { min, max } = correctionRange(dice);
  return Number.isInteger(correction) && correction >= min && correction <= max;
}

export const ABILITY_IDS = ['DEX', 'AGI', 'STR', 'VIT', 'INT', 'SPR'] as const;

export type AbilityId = (typeof ABILITY_IDS)[number];

export interface AbilityScoreValue {
  base: number;
  correction: number;
  growth: number;
  itemBonus: number;
}

/** modifier = floor(total / 6) */
export function abilityModifier(total: number): number {
  return Math.floor(total / 6);
}

export function abilityTotal(score: AbilityScoreValue): number {
  return score.base + score.correction + score.growth + score.itemBonus;
}

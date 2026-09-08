import type { AbilityDice } from '../../data/races';

/**
 * Point Buy Character Creation (Epic Treasury p. 64, § 3 optional system): an alternative
 * to rolling the racial A-F correction dice. The correction a player picks is still the
 * same number a die roll would have given (1-6 for a 1d ability, 2-12 for 2d, plus the
 * racial flat bonus exactly as `correctionRange` already computes) — Point Buy only adds a
 * point cost to that choice, and the six corrections must cost 0 or less in total. Human
 * backgrounds that roll their own Skill/Body/Mind (`stats: null`) get a second, separate
 * budget from a different table, because the book keeps the two untied.
 */

const COST_BY_1D: Record<number, number> = { 1: -15, 2: -10, 3: -5, 4: 5, 5: 10, 6: 20 };

const COST_BY_2D: Record<number, number> = {
  2: -25,
  3: -20,
  4: -15,
  5: -10,
  6: -5,
  7: 0,
  8: 5,
  9: 10,
  10: 20,
  11: 40,
  12: 70,
};

/** "Adventurer 2d Table" — the separate budget for a rolled Skill/Body/Mind split. */
const COST_STARTING_ABILITY: Record<number, number> = {
  2: -100,
  3: -80,
  4: -60,
  5: -40,
  6: -20,
  7: 0,
  8: 20,
  9: 40,
  10: 70,
  11: 110,
  12: 160,
};

/** Cost of a chosen A-F correction, or undefined when the value is not a legal pick for
 *  this die — out of the die's range, or the untouched-zero sentinel the creation form uses
 *  before a player has entered anything. */
export function abilityPointCost(dice: AbilityDice, correction: number): number | undefined {
  const rollValue = correction - dice.bonus;
  const table = dice.count === 1 ? COST_BY_1D : COST_BY_2D;
  return table[rollValue];
}

/** Cost of a chosen Skill/Body/Mind value for a background that rolls its own (2d, no
 *  racial bonus involved), or undefined when out of range. */
export function startingAbilityPointCost(rollValue: number): number | undefined {
  return COST_STARTING_ABILITY[rollValue];
}

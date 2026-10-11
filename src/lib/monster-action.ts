import type { Rng } from './encounter';
import { askOracle, rollDie, type Answer } from './oracle';

/*
 * What a monster does next, asked of the oracle instead of a table every round: "does it keep doing
 * what it was doing?" A yes carries on, a no changes the plan, and the exceptional answers push
 * either way. An event on the die gives the monster an extra action. The twelve ways of changing
 * the plan are our own.
 */

export const MONSTER_ACTIONS = 12;

export interface MonsterAction {
  answer: Answer;
  chance: number;
  roll: number;
  /** The new plan (1–12) when the monster changes it; null when it carries on. */
  action: number | null;
  /** Exceptional answers: carrying on harder, or doing the opposite / the new thing harder. */
  strong: boolean;
  /** An event came up: one more action besides. */
  extra: number | null;
}

export function rollMonsterAction(chaos: number, rng: Rng = Math.random): MonsterAction {
  const question = askOracle('veryLikely', chaos, rng);
  const changes = question.answer === 'no' || question.answer === 'exceptionalNo';
  return {
    answer: question.answer,
    chance: question.chance,
    roll: question.roll,
    action: changes ? rollDie(MONSTER_ACTIONS, rng) : null,
    strong: question.answer === 'exceptionalYes' || question.answer === 'exceptionalNo',
    extra: question.event ? rollDie(MONSTER_ACTIONS, rng) : null,
  };
}

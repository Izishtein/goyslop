import { rollD6, type EvasionRoll, type Rng } from './encounter';

/** A Spellcasting check: 2d6 + Magic Power. Double 6s always succeed, double 1s always fail (CR I p. 110). */
export interface SpellcastingCheck {
  dice: [number, number];
  value: number;
  outcome: 'fumble' | 'critical' | null;
}

export function rollSpellcastingCheck(magicPower: number, rng: Rng = Math.random): SpellcastingCheck {
  const dice: [number, number] = [rollD6(rng), rollD6(rng)];
  const sum = dice[0] + dice[1];
  return { dice, value: sum + magicPower, outcome: sum === 2 ? 'fumble' : sum === 12 ? 'critical' : null };
}

/**
 * Whether the target's Willpower check holds against a spell (CR I p. 110): the caster's Success Value
 * must be higher for the spell to take full effect, so a tie or a higher value resists. The target's
 * own double 6s succeed and double 1s fail whatever the numbers.
 */
export function spellResisted(caster: SpellcastingCheck, willpower: EvasionRoll): boolean {
  if (willpower.outcome === 'critical') return true;
  if (willpower.outcome === 'fumble') return false;
  return willpower.value >= caster.value;
}

/** Halved damage rounds up (CR I p. 170). */
export function halveRoundUp(damage: number): number {
  return Math.ceil(damage / 2);
}

import { powerTableRoll } from './power-table';

export type Rng = () => number;

function rollD6(rng: Rng): number {
  return 1 + Math.floor(rng() * 6);
}

export interface DamageStep {
  d1: number;
  d2: number;
  sum: number;
  value: number;
  /** Lethal Strike moved this roll one up the table. */
  bumped?: boolean;
}

export interface DamageRoll {
  steps: DamageStep[];
  fumble: boolean;
  powerTableTotal: number;
  calculatedDamage: number;
}


/** Core Rulebook I pp. 134-136: roll 2d6 on the weapon's Power row; a natural 2 (double 1s)
 *  deals zero damage outright, Extra Damage included, and stops here. Otherwise, whenever a
 *  roll is at or above the Critical Value the table is rolled again and added — a natural 2
 *  during that chain adds nothing and ends the chain (it can never itself be >= Critical
 *  Value, since the book clamps every Critical Value to at least 8, so the loop condition
 *  below stops on it without needing a separate check). Extra Damage is added exactly once,
 *  after every roll in the chain is in. */
export function rollWeaponDamage(power: number, criticalValue: number, extraDamage: number, lethal = false, rng: Rng = Math.random): DamageRoll {
  const steps: DamageStep[] = [];
  let sum = 0;
  let d1 = 0;
  let d2 = 0;
  let powerTableTotal = 0;
  let first = true;
  let continuing = true;
  while (continuing) {
    d1 = rollD6(rng);
    d2 = rollD6(rng);
    sum = d1 + d2;
    if (sum === 2) {
      if (first) {
        return { steps: [{ d1, d2, sum, value: 0 }], fumble: true, powerTableTotal: 0, calculatedDamage: 0 };
      }
      steps.push({ d1, d2, sum, value: 0 });
      break;
    }
    // Double 1s and double 6s "work as is"; everything between goes one up (Lethal Strike).
    const counted = lethal && sum >= 3 && sum <= 11 ? sum + 1 : sum;
    const value = powerTableRoll(power, counted);
    steps.push({ d1, d2, sum, value, bumped: counted !== sum });
    powerTableTotal += value;
    continuing = counted >= criticalValue;
    first = false;
  }
  return { steps, fumble: false, powerTableTotal, calculatedDamage: powerTableTotal + extraDamage };
}


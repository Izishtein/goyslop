import { describe, expect, it } from 'vitest';
import { abilityPointCost, startingAbilityPointCost } from './point-buy';

describe('abilityPointCost', () => {
  it('prices every value on the 1d table (Epic Treasury p. 64)', () => {
    const oneD = { count: 1, bonus: 0 };
    expect([1, 2, 3, 4, 5, 6].map((v) => abilityPointCost(oneD, v))).toEqual([-15, -10, -5, 5, 10, 20]);
  });

  it('prices every value on the 2d table', () => {
    const twoD = { count: 2, bonus: 0 };
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    expect(values.map((v) => abilityPointCost(twoD, v))).toEqual([-25, -20, -15, -10, -5, 0, 5, 10, 20, 40, 70]);
  });

  it('shifts the lookup by the racial flat bonus', () => {
    // 2d+6 (Runefolk SPR): a correction of 13 is a rolled 7 plus the +6 bonus, so it costs
    // what a plain 7 would.
    expect(abilityPointCost({ count: 2, bonus: 6 }, 13)).toBe(0);
    expect(abilityPointCost({ count: 1, bonus: 6 }, 12)).toBe(20);
  });

  it('has no cost for the untouched-zero sentinel or an out-of-range pick', () => {
    expect(abilityPointCost({ count: 2, bonus: 0 }, 0)).toBeUndefined();
    expect(abilityPointCost({ count: 1, bonus: 0 }, 7)).toBeUndefined();
    expect(abilityPointCost({ count: 2, bonus: 0 }, 13)).toBeUndefined();
  });
});

describe('startingAbilityPointCost', () => {
  it('prices every value on the Adventurer 2d Table', () => {
    const values = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12];
    expect(values.map(startingAbilityPointCost)).toEqual([-100, -80, -60, -40, -20, 0, 20, 40, 70, 110, 160]);
  });

  it('has no cost outside 2-12', () => {
    expect(startingAbilityPointCost(0)).toBeUndefined();
    expect(startingAbilityPointCost(13)).toBeUndefined();
  });
});

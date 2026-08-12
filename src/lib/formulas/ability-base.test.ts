import { describe, expect, it } from 'vitest';
import { abilityBaseFromSplit, correctionRange, formatDiceNotation, isCorrectionInRange } from './ability-base';

describe('abilityBaseFromSplit', () => {
  const split = { skill: 13, body: 5, mind: 7 };

  it.each([
    ['DEX', 13],
    ['AGI', 13],
    ['STR', 5],
    ['VIT', 5],
    ['INT', 7],
    ['SPR', 7],
  ] as const)('%s derives from the correct split component', (ability, expected) => {
    expect(abilityBaseFromSplit(split, ability)).toBe(expected);
  });
});

describe('formatDiceNotation', () => {
  it('formats plain dice', () => {
    expect(formatDiceNotation({ count: 2, bonus: 0 })).toBe('2d6');
  });

  it('formats dice with a bonus', () => {
    expect(formatDiceNotation({ count: 1, bonus: 6 })).toBe('1d6+6');
  });
});

describe('correctionRange', () => {
  it('spans all-ones to all-sixes', () => {
    expect(correctionRange({ count: 2, bonus: 0 })).toEqual({ min: 2, max: 12 });
  });

  it('shifts by the flat bonus', () => {
    expect(correctionRange({ count: 1, bonus: 6 })).toEqual({ min: 7, max: 12 });
  });
});

describe('isCorrectionInRange', () => {
  const twoD6 = { count: 2, bonus: 0 };

  it.each([2, 7, 12])('accepts a rollable %i on 2d6', (value) => {
    expect(isCorrectionInRange(twoD6, value)).toBe(true);
  });

  it.each([0, 1, 13, -3])('rejects an unrollable %i on 2d6', (value) => {
    expect(isCorrectionInRange(twoD6, value)).toBe(false);
  });

  it('rejects fractional values', () => {
    expect(isCorrectionInRange(twoD6, 7.5)).toBe(false);
  });
});

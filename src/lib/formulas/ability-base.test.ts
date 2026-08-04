import { describe, expect, it } from 'vitest';
import { abilityBaseFromSplit, formatDiceNotation } from './ability-base';

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

import { describe, expect, it } from 'vitest';
import { abilityModifier, abilityTotal } from './abilities';

describe('abilityModifier', () => {
  it.each([
    [0, 0],
    [5, 0],
    [6, 1],
    [11, 1],
    [12, 2],
    [15, 2],
    [17, 2],
    [18, 3],
    [23, 3],
    [24, 4],
    [35, 5],
    [36, 6],
  ])('floor(%i / 6) = %i', (total, expected) => {
    expect(abilityModifier(total)).toBe(expected);
  });
});

describe('abilityTotal', () => {
  it('sums base, correction, growth, and item bonus', () => {
    expect(abilityTotal({ base: 9, correction: 4, growth: 1, itemBonus: 2 })).toBe(16);
  });
});

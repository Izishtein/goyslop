import { describe, expect, it } from 'vitest';
import { classLevelXpCost, classLevelXpCumulative } from './xp-cost';

describe('classLevelXpCost', () => {
  it('major class level 1 costs 1000', () => {
    expect(classLevelXpCost('major', 1)).toBe(1000);
  });

  it('minor class level 1 costs 500', () => {
    expect(classLevelXpCost('minor', 1)).toBe(500);
  });

  it('rejects out-of-range levels', () => {
    expect(() => classLevelXpCost('major', 0)).toThrow();
    expect(() => classLevelXpCost('major', 16)).toThrow();
  });
});

describe('classLevelXpCumulative', () => {
  it('matches known cumulative totals for major classes', () => {
    expect(classLevelXpCumulative('major', 1)).toBe(1000);
    expect(classLevelXpCumulative('major', 10)).toBe(27500);
    expect(classLevelXpCumulative('major', 15)).toBe(80000);
  });

  it('matches known cumulative totals for minor classes', () => {
    expect(classLevelXpCumulative('minor', 1)).toBe(500);
    expect(classLevelXpCumulative('minor', 10)).toBe(22000);
    expect(classLevelXpCumulative('minor', 15)).toBe(67000);
  });
});

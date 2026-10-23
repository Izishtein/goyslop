import { describe, expect, it } from 'vitest';
import { encounterDifficulty, partyStrength, suggestedCopies } from './scaling';

describe('partyStrength', () => {
  it('averages the levels and counts the heads', () => {
    expect(partyStrength([3, 4, 6])).toEqual({ size: 3, level: 4 });
    expect(partyStrength([])).toEqual({ size: 1, level: 1 });
  });
});

describe('suggestedCopies', () => {
  const party = { size: 4, level: 5 };
  it('is one per adventurer at the party level', () => expect(suggestedCopies(5, party)).toBe(4));
  it('thins out above the party and thickens below it', () => {
    expect(suggestedCopies(6, party)).toBe(3);
    expect(suggestedCopies(7, party)).toBe(2);
    expect(suggestedCopies(10, party)).toBe(1);
    expect(suggestedCopies(4, party)).toBe(6);
    expect(suggestedCopies(3, party)).toBe(9);
  });
  it('is never below one nor above twelve', () => {
    expect(suggestedCopies(15, { size: 1, level: 1 })).toBe(1);
    expect(suggestedCopies(1, { size: 6, level: 9 })).toBe(12);
  });
});

describe('encounterDifficulty', () => {
  const party = { size: 4, level: 5 };
  it('calls the suggested count an even fight', () => {
    for (const level of [3, 4, 5, 6, 7, 8]) {
      const copies = suggestedCopies(level, party);
      expect(encounterDifficulty(Array(copies).fill(level), party).difficulty).toBe('even');
    }
  });
  it('grades lighter and heavier tables', () => {
    expect(encounterDifficulty([2], party).difficulty).toBe('easy');
    expect(encounterDifficulty([6, 6, 6, 6, 6], party).difficulty).toBe('hard');
    expect(encounterDifficulty([8, 8, 8, 8], party).difficulty).toBe('deadly');
  });
});

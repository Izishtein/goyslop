import { describe, expect, it } from 'vitest';
import { adventurerLevel, wizardLevelSum } from './character-levels';

describe('adventurerLevel', () => {
  it('is the highest level among all classes', () => {
    expect(adventurerLevel([{ classId: 'fighter', level: 3 }, { classId: 'scout', level: 5 }])).toBe(5);
  });

  it('is 0 for a character with no classes', () => {
    expect(adventurerLevel([])).toBe(0);
  });
});

describe('wizardLevelSum', () => {
  it('sums levels only across wizard-type classes', () => {
    const classes = [
      { classId: 'sorcerer', level: 3 },
      { classId: 'priest', level: 2 },
      { classId: 'fighter', level: 5 },
    ];
    expect(wizardLevelSum(classes)).toBe(5);
  });

  it('is 0 when the character has no wizard-type classes', () => {
    expect(wizardLevelSum([{ classId: 'fighter', level: 4 }])).toBe(0);
  });
});

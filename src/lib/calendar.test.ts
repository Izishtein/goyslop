import { describe, expect, it } from 'vitest';
import { calendarOf, encounterThreshold, forageModifier } from './calendar';

describe('calendar', () => {
  it('starts on the first day of spring, year 1', () => {
    expect(calendarOf(1)).toEqual({ year: 1, month: 1, dayOfMonth: 1, season: 'spring', festival: 'springtide', fullMoon: false });
  });

  it('counts thirty days to a month and twelve months to a year', () => {
    expect(calendarOf(30)).toMatchObject({ month: 1, dayOfMonth: 30 });
    expect(calendarOf(31)).toMatchObject({ month: 2, dayOfMonth: 1, festival: null });
    expect(calendarOf(360)).toMatchObject({ year: 1, month: 12, dayOfMonth: 30 });
    expect(calendarOf(361)).toMatchObject({ year: 2, month: 1, dayOfMonth: 1 });
  });

  it('has a festival at the start of each season and a full moon on the 15th', () => {
    expect([1, 91, 181, 271].map((day) => calendarOf(day).festival)).toEqual(['springtide', 'midsummer', 'harvest', 'midwinter']);
    expect([1, 91, 181, 271].map((day) => calendarOf(day).season)).toEqual(['spring', 'summer', 'autumn', 'winter']);
    expect(calendarOf(15).fullMoon).toBe(true);
    expect(calendarOf(16).fullMoon).toBe(false);
    expect(calendarOf(2).festival).toBeNull();
  });

  it('turns the season and the moon into small modifiers', () => {
    expect(['spring', 'summer', 'autumn', 'winter'].map((season) => forageModifier(season as 'spring'))).toEqual([0, 0, 1, -1]);
    expect(encounterThreshold(calendarOf(15))).toBe(2);
    expect(encounterThreshold(calendarOf(16))).toBe(1);
  });

  it('tolerates a day below 1', () => {
    expect(calendarOf(0)).toMatchObject({ year: 1, month: 1, dayOfMonth: 1 });
  });
});

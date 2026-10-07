/*
 * The campaign calendar: twelve months of thirty days, four seasons, a festival at the start of
 * each season and a full moon in the middle of every month. The year starts in spring. It is
 * our own calendar — Sword World's Ruxe has none printed — and it only turns the campaign's
 * day counter into a date and a few small modifiers for travel.
 */

export const SEASONS = ['spring', 'summer', 'autumn', 'winter'] as const;
export type Season = (typeof SEASONS)[number];
export const FESTIVALS = ['springtide', 'midsummer', 'harvest', 'midwinter'] as const;
export type Festival = (typeof FESTIVALS)[number];

export const DAYS_PER_MONTH = 30;
export const MONTHS_PER_YEAR = 12;

export interface CalendarDate {
  year: number;
  month: number;
  dayOfMonth: number;
  season: Season;
  /** The first day of a season is its festival. */
  festival: Festival | null;
  /** The 15th of every month. */
  fullMoon: boolean;
}

/** Campaign day 1 is the first day of the first month of year 1. */
export function calendarOf(day: number): CalendarDate {
  const index = Math.max(0, Math.floor(day) - 1);
  const dayOfYear = index % (DAYS_PER_MONTH * MONTHS_PER_YEAR);
  const month = Math.floor(dayOfYear / DAYS_PER_MONTH) + 1;
  const dayOfMonth = (dayOfYear % DAYS_PER_MONTH) + 1;
  const seasonIndex = Math.floor((month - 1) / 3);
  return {
    year: Math.floor(index / (DAYS_PER_MONTH * MONTHS_PER_YEAR)) + 1,
    month,
    dayOfMonth,
    season: SEASONS[seasonIndex],
    festival: dayOfMonth === 1 && (month - 1) % 3 === 0 ? FESTIVALS[seasonIndex] : null,
    fullMoon: dayOfMonth === 15,
  };
}

/** Added to the foraging d6: hard in winter, generous at harvest. */
export function forageModifier(season: Season): number {
  if (season === 'winter') return -1;
  if (season === 'autumn') return 1;
  return 0;
}

/** A wandering encounter on a d6 of this or less: 1, or 2 on the night of a full moon. */
export function encounterThreshold(date: CalendarDate): number {
  return date.fullMoon ? 2 : 1;
}

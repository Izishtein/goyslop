import { RACES, type BackgroundEntry, type RaceDefinition } from '../data/races';

export interface BackgroundOption {
  key: string;
  table: 'primary' | 'additional';
  entry: BackgroundEntry;
}

export function listBackgroundOptions(race: RaceDefinition): BackgroundOption[] {
  if (!race.backgroundTables) return [];
  const primary = race.backgroundTables.primary.map((entry, index) => ({
    key: `primary:${index}`,
    table: 'primary' as const,
    entry,
  }));
  const additional = (race.backgroundTables.additional ?? []).map((entry, index) => ({
    key: `additional:${index}`,
    table: 'additional' as const,
    entry,
  }));
  return [...primary, ...additional];
}

/** One background row, remembering which race's table it came from. */
export interface BackgroundOccurrence {
  raceId: string;
  raceName: string;
  table: 'primary' | 'additional';
  entry: BackgroundEntry;
}

function allOccurrences(): BackgroundOccurrence[] {
  return RACES.flatMap((race) =>
    listBackgroundOptions(race).map((option) => ({
      raceId: race.id,
      raceName: race.name,
      table: option.table,
      entry: option.entry,
    })),
  );
}

/**
 * Every background name in the game with the races that can roll it.
 *
 * **A shared name is not a shared row.** Human's "Cleric" is [4, 8, 9] and Elf's is
 * [9, 5, 12], and the roll ranges and XP differ too — so each race keeps its own
 * occurrence and nothing is ever merged into one line.
 */
export function indexBackgroundsByName(): { name: string; occurrences: BackgroundOccurrence[] }[] {
  const byName = new Map<string, BackgroundOccurrence[]>();
  for (const occurrence of allOccurrences()) {
    const list = byName.get(occurrence.entry.name) ?? [];
    list.push(occurrence);
    byName.set(occurrence.entry.name, list);
  }
  return [...byName.entries()]
    .map(([name, occurrences]) => ({ name, occurrences }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Every class with the race-and-background rows that hand it out at character creation —
 * the answer to "I want to start as a Marksman, who can?". A background granting a choice
 * of two classes appears under both.
 */
export function indexBackgroundsByStartingClass(): { classId: string; occurrences: BackgroundOccurrence[] }[] {
  const byClass = new Map<string, BackgroundOccurrence[]>();
  for (const occurrence of allOccurrences()) {
    for (const classId of occurrence.entry.startingClasses?.classIds ?? []) {
      const list = byClass.get(classId) ?? [];
      list.push(occurrence);
      byClass.set(classId, list);
    }
  }
  return [...byClass.entries()]
    .map(([classId, occurrences]) => ({ classId, occurrences }))
    .sort((a, b) => a.classId.localeCompare(b.classId));
}

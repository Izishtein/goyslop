import { describe, expect, it } from 'vitest';
import { getClass } from '../data/classes';
import { RACES, getRace } from '../data/races';
import { indexBackgroundsByName, indexBackgroundsByStartingClass, listBackgroundOptions } from './backgrounds';

describe('listBackgroundOptions', () => {
  it('returns the primary table followed by the additional one, each key unique', () => {
    const human = getRace('human');
    const options = listBackgroundOptions(human!);

    expect(options[0].table).toBe('primary');
    expect(options.at(-1)?.table).toBe('additional');
    expect(new Set(options.map((option) => option.key)).size).toBe(options.length);
  });

  it('returns nothing for a race with no table at all', () => {
    // Vagrant-system and pending-sourcebook races have none.
    expect(listBackgroundOptions(getRace('newman')!)).toEqual([]);
  });
});

describe('indexBackgroundsByName', () => {
  it('finds every race that can roll a given background', () => {
    const archer = indexBackgroundsByName().find((entry) => entry.name === 'Archer');

    expect(archer).toBeDefined();
    expect(archer!.occurrences.map((o) => o.raceId)).toContain('human');
    expect(archer!.occurrences.every((o) => o.entry.name === 'Archer')).toBe(true);
  });

  it('keeps a shared name as separate rows, because the numbers differ per race', () => {
    // Human's Cleric is [4, 8, 9]; Elf's is [9, 5, 12]. Merging them would be a quiet lie.
    const cleric = indexBackgroundsByName().find((entry) => entry.name === 'Cleric');
    const statsOf = (raceId: string) => cleric!.occurrences.find((o) => o.raceId === raceId)?.entry.stats;

    expect(statsOf('human')).toEqual([4, 8, 9]);
    expect(statsOf('elf')).toEqual([9, 5, 12]);
  });

  it('covers every background row in the catalog exactly once', () => {
    const indexed = indexBackgroundsByName().reduce((sum, entry) => sum + entry.occurrences.length, 0);
    const total = RACES.reduce((sum, race) => sum + listBackgroundOptions(race).length, 0);

    expect(indexed).toBe(total);
  });

  it('is sorted by name, so the list can be read as a list', () => {
    const names = indexBackgroundsByName().map((entry) => entry.name);
    expect(names).toEqual([...names].sort((a, b) => a.localeCompare(b)));
  });
});

describe('indexBackgroundsByStartingClass', () => {
  it('answers which races can start as a given class', () => {
    const marksman = indexBackgroundsByStartingClass().find((entry) => entry.classId === 'marksman');

    expect(marksman!.occurrences.map((o) => o.raceId)).toContain('human');
    expect(marksman!.occurrences.every((o) => o.entry.startingClasses?.classIds.includes('marksman'))).toBe(true);
  });

  it('lists a two-class background under both of its classes', () => {
    const index = indexBackgroundsByStartingClass();
    const mercenaryUnder = (classId: string) =>
      index.find((entry) => entry.classId === classId)?.occurrences.some((o) => o.entry.name === 'Mercenary' && o.raceId === 'human');

    // Human "Mercenary" grants Fighter *or* Grappler.
    expect(mercenaryUnder('fighter')).toBe(true);
    expect(mercenaryUnder('grappler')).toBe(true);
  });

  it('only ever names classes that exist in the class catalog', () => {
    const unknown = indexBackgroundsByStartingClass()
      .map((entry) => entry.classId)
      .filter((classId) => !getClass(classId));

    expect(unknown).toEqual([]);
  });
});

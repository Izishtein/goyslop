import type { BackgroundEntry, RaceDefinition } from '../../data/races';

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

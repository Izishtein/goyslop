import type { ClassRank } from '../../data/classes';

const MAJOR_CLASS_LEVEL_XP = [1000, 1000, 1500, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 9000, 10500, 12000, 13500];
const MINOR_CLASS_LEVEL_XP = [500, 1000, 1000, 1500, 1500, 2000, 2500, 3000, 4000, 5000, 6000, 7500, 9000, 10500, 12000];

/** Adventurer Level caps at 15, so no class table goes further. */
export const MAX_CLASS_LEVEL = MAJOR_CLASS_LEVEL_XP.length;

function levelTable(rank: ClassRank): number[] {
  return rank === 'major' ? MAJOR_CLASS_LEVEL_XP : MINOR_CLASS_LEVEL_XP;
}

/** XP cost to acquire a single class level (1-15). */
export function classLevelXpCost(rank: ClassRank, level: number): number {
  const table = levelTable(rank);
  if (level < 1 || level > table.length) throw new RangeError(`level must be 1-${table.length}`);
  return table[level - 1];
}

/** Total XP spent reaching `level` in a class of the given rank, from level 1. */
export function classLevelXpCumulative(rank: ClassRank, level: number): number {
  const table = levelTable(rank);
  if (level < 1 || level > table.length) throw new RangeError(`level must be 1-${table.length}`);
  return table.slice(0, level).reduce((sum, cost) => sum + cost, 0);
}

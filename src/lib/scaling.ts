/*
 * Sizing an encounter to the party (roadmap 6.8). The book gives no formula for it — the GM is told to pick monsters
 * near the party's level — so the numbers here are this app's own: a monster of the party's level counts as one
 * adventurer's worth, and each level above it weighs half as much again (each below it a third less).
 */

export interface PartyStrength {
  /** The player character and every Fellow with them. */
  size: number;
  /** The party's Adventurer Level, averaged and rounded. */
  level: number;
}

/** Size and level of a party from the Adventurer Levels of its members (at least one). */
export function partyStrength(levels: number[]): PartyStrength {
  if (levels.length === 0) return { size: 1, level: 1 };
  return { size: levels.length, level: Math.max(1, Math.round(levels.reduce((sum, level) => sum + level, 0) / levels.length)) };
}

export const MAX_COPIES = 12;

/** One monster's weight in a fight: 1.5 times heavier per level over the party's, lighter per level under it. */
const weight = (monsterLevel: number, party: PartyStrength): number => 1.5 ** (monsterLevel - party.level);

/** How many copies of a monster make an even fight for the party (their weights add up to its size); never fewer than one. */
export function suggestedCopies(monsterLevel: number, party: PartyStrength): number {
  return Math.max(1, Math.min(MAX_COPIES, Math.round(party.size / weight(monsterLevel, party))));
}

export type Difficulty = 'easy' | 'even' | 'hard' | 'deadly';

/** The threat of the monsters on the table against the party, as a ratio (1 ≈ an even fight) and its name. */
export function encounterDifficulty(monsterLevels: number[], party: PartyStrength): { ratio: number; difficulty: Difficulty } {
  const ratio = monsterLevels.reduce((sum, level) => sum + weight(level, party), 0) / party.size;
  const difficulty: Difficulty = ratio < 0.5 ? 'easy' : ratio <= 1.3 ? 'even' : ratio <= 2 ? 'hard' : 'deadly';
  return { ratio, difficulty };
}

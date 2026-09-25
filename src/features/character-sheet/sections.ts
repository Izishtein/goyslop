import type { Character } from '../../types/character';

/**
 * Which optional sections a character actually uses.
 *
 * Sections that don't apply return `null` and vanish from the sheet — a pattern that
 * predates the tabbed layout. The tab bar has to answer the same question one level up:
 * a tab whose whole content is one such section would otherwise open onto nothing.
 * Kept out of the component files so the rule has exactly one home.
 */
export function riderLevel(character: Character): number {
  return character.classes.filter((entry) => entry.classId === 'rider').reduce((max, entry) => Math.max(max, entry.level), 0);
}

/** Without Rider levels a character may still ride a Horse, War Horse, Mini Manabike or
 *  Manabike (Core III p. 88) — so Mounts is not for the class alone. It stays hidden for
 *  everyone else, and a mount already recorded keeps it reachable after a class change. */
export function hasMounts(character: Character): boolean {
  return riderLevel(character) > 0 || character.mounts.length > 0 || character.stunts.length > 0;
}

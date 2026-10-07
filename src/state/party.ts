import { atomWithStorage } from 'jotai/utils';

/**
 * The Fellows travelling with the player, as ids of roster characters (CR I pp. 193–202: a
 * Fellow is a published PC, so the party is a list of pointers, not a second copy of anyone).
 * Persisted — the party outlives one session; an id whose character was deleted is simply
 * skipped by the screen.
 */
export const partyAtom = atomWithStorage<string[]>('sw25.party', []);

/**
 * Adventurer Rank from Reputation points (Core Rulebook II, pp. 110-115, transcribed in
 * docs/sheet-content/06-equipment.md).
 *
 * `cumulative` is the total reputation the rank needs; `free` is the reputation-point
 * budget of Renown Items the rank grants for free. Past the last printed row the book
 * keeps adding a star every 500 points, with +50 free each step.
 */
export interface AdventurerRank {
  name: string;
  cumulative: number;
  free: number;
}

export const ADVENTURER_RANKS: AdventurerRank[] = [
  { name: 'None', cumulative: 0, free: 0 },
  { name: 'Dagger', cumulative: 20, free: 0 },
  { name: 'Rapier', cumulative: 50, free: 5 },
  { name: 'Broad Sword', cumulative: 100, free: 10 },
  { name: 'Great Sword', cumulative: 200, free: 20 },
  { name: 'Flamberge', cumulative: 300, free: 30 },
  { name: 'Sentinel', cumulative: 500, free: 50 },
  { name: 'Hyperion', cumulative: 700, free: 70 },
  { name: 'Sword of Genesis', cumulative: 1000, free: 100 },
  { name: 'Sword of Genesis★', cumulative: 1500, free: 150 },
  { name: 'Sword of Genesis★2', cumulative: 2000, free: 200 },
  { name: 'Sword of Genesis★3', cumulative: 2500, free: 250 },
];

const STAR_STEP = 500;
const FREE_PER_STEP = 50;
const LAST_PRINTED = ADVENTURER_RANKS[ADVENTURER_RANKS.length - 1];

/** The highest rank the given reputation reaches. */
export function rankForReputation(reputation: number): AdventurerRank {
  if (reputation >= LAST_PRINTED.cumulative + STAR_STEP) {
    const steps = Math.floor((reputation - LAST_PRINTED.cumulative) / STAR_STEP);
    return {
      name: `Sword of Genesis★${3 + steps}`,
      cumulative: LAST_PRINTED.cumulative + steps * STAR_STEP,
      free: LAST_PRINTED.free + steps * FREE_PER_STEP,
    };
  }
  return [...ADVENTURER_RANKS].reverse().find((rank) => reputation >= rank.cumulative) ?? ADVENTURER_RANKS[0];
}

/** Reputation still needed for the next rank, or null once past the printed table. */
export function reputationToNextRank(reputation: number): { rank: AdventurerRank; missing: number } | null {
  const next = ADVENTURER_RANKS.find((rank) => rank.cumulative > reputation);
  if (next) return { rank: next, missing: next.cumulative - reputation };

  const current = rankForReputation(reputation);
  const nextCumulative = current.cumulative + STAR_STEP;
  const steps = (nextCumulative - LAST_PRINTED.cumulative) / STAR_STEP;
  return {
    rank: { name: `Sword of Genesis★${3 + steps}`, cumulative: nextCumulative, free: LAST_PRINTED.free + steps * FREE_PER_STEP },
    missing: nextCumulative - reputation,
  };
}

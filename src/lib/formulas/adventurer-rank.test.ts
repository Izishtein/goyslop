import { describe, expect, it } from 'vitest';
import { ADVENTURER_RANKS, rankForReputation, reputationToNextRank } from './adventurer-rank';

describe('rankForReputation', () => {
  it.each([
    [0, 'None'],
    [19, 'None'],
    [20, 'Dagger'],
    [49, 'Dagger'],
    [100, 'Broad Sword'],
    [699, 'Sentinel'],
    [1000, 'Sword of Genesis'],
    [2500, 'Sword of Genesis★3'],
  ])('%i reputation is rank %s', (reputation, expected) => {
    expect(rankForReputation(reputation).name).toBe(expected);
  });

  it('keeps adding a star every 500 points past the printed table', () => {
    expect(rankForReputation(3000)).toEqual({ name: 'Sword of Genesis★4', cumulative: 3000, free: 300 });
    // 2500 ★3 -> 3000 ★4 -> 3500 ★5 -> 4000 ★6
    expect(rankForReputation(4000).name).toBe('Sword of Genesis★6');
  });

  it('carries the free Renown Item budget of the rank', () => {
    expect(rankForReputation(100).free).toBe(10);
    expect(rankForReputation(1000).free).toBe(100);
  });
});

describe('reputationToNextRank', () => {
  it('counts what is still missing', () => {
    expect(reputationToNextRank(0)).toEqual({ rank: ADVENTURER_RANKS[1], missing: 20 });
    expect(reputationToNextRank(90)?.missing).toBe(10);
  });

  it('keeps counting past the printed table', () => {
    const next = reputationToNextRank(2600);
    expect(next?.rank.name).toBe('Sword of Genesis★4');
    expect(next?.missing).toBe(400);
  });
});

describe('the rank table itself', () => {
  it('rises monotonically, matching the Core II chart', () => {
    for (let i = 1; i < ADVENTURER_RANKS.length; i++) {
      expect(ADVENTURER_RANKS[i].cumulative).toBeGreaterThan(ADVENTURER_RANKS[i - 1].cumulative);
      expect(ADVENTURER_RANKS[i].free).toBeGreaterThanOrEqual(ADVENTURER_RANKS[i - 1].free);
    }
  });
});

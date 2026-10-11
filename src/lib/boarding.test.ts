import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { breakAway, grapple, ourVolley, pickCrew, pursuitShip, sightPursuit, takePrize, theirVolley, type Pursuit } from './boarding';
import { GOODS, HULL } from './ships';

const monsters = raw as unknown as Monster[];
/** An rng that hands out these faces (1–6) in turn. */
const faces = (...values: number[]) => () => (values.shift()! - 1) / 6;

const pursuer = (patch: Partial<Pursuit> = {}): Pursuit => ({ ship: 'cog', hull: HULL.cog, crewId: 'x', crewCount: 4, crewLevel: 3, state: 'closing', round: 0, ...patch });

describe('a hostile sail', () => {
  it('matches the size of the ship to the party and takes a humanoid crew', () => {
    expect([1, 3, 4, 7, 8, 12].map(pursuitShip)).toEqual(['boat', 'boat', 'cog', 'cog', 'galleon', 'galleon']);
    const crew = pickCrew(monsters, 3, () => 0)!;
    expect(crew.category).toBe('Humanoids');
    const sighted = sightPursuit(monsters, 3, () => 0)!;
    expect(sighted).toMatchObject({ ship: 'boat', hull: HULL.boat, state: 'closing', round: 0 });
    expect(sighted.crewCount).toBeGreaterThanOrEqual(3);
  });
});

describe('a broadside', () => {
  it('hits when 2d6 + level reaches 8 + the target\'s Evasion, and does 1d3 + our guns', () => {
    // cog (Evasion 4) needs 12: 6+5 + level 3 = 14 hits; damage d3 = 2, a galleon adds 2 guns
    const { pursuit, exchange } = ourVolley(pursuer(), 'galleon', 3, faces(6, 5, 4));
    expect(exchange).toMatchObject({ value: 14, target: 12, hit: true, damage: 4 });
    expect(pursuit.hull).toBe(HULL.cog - 4);
    expect(pursuit.round).toBe(1);
  });

  it('misses on snake eyes however high the level, and hits on boxcars however low', () => {
    expect(ourVolley(pursuer(), 'cog', 30, faces(1, 1)).exchange.hit).toBe(false);
    expect(ourVolley(pursuer(), 'boat', 0, faces(6, 6, 1)).exchange.hit).toBe(true);
  });

  it('sinks the hostile ship when its hull is gone', () => {
    const result = ourVolley(pursuer({ hull: 1 }), 'cog', 5, faces(6, 5, 1));
    expect(result.pursuit).toMatchObject({ hull: 0, state: 'sunk' });
  });

  it('is not fired once the ships are locked', () => {
    const locked = pursuer({ state: 'grappled' });
    expect(ourVolley(locked, 'cog', 3, faces(6, 6)).pursuit).toBe(locked);
  });

  it('answers with the hostile crew\'s level against our Evasion', () => {
    const shot = theirVolley(pursuer({ crewLevel: 5 }), 'boat', faces(4, 4, 1));
    expect(shot).toMatchObject({ value: 13, target: 14, hit: false });
  });
});

describe('grappling and breaking away', () => {
  it('locks the ships on 9 or more, with -2 in a storm and +1 in a calm', () => {
    expect(grapple(pursuer(), 3, 'fair', faces(3, 3)).contest).toMatchObject({ value: 9, success: true });
    expect(grapple(pursuer(), 3, 'storm', faces(3, 3)).contest).toMatchObject({ value: 7, success: false });
    expect(grapple(pursuer(), 3, 'calm', faces(3, 2)).contest).toMatchObject({ value: 9, success: true });
    expect(grapple(pursuer(), 3, 'fair', faces(3, 3)).pursuit.state).toBe('grappled');
  });

  it('breaks away easier with headway left to run', () => {
    expect(breakAway(pursuer(), 2, faces(2, 3)).contest).toMatchObject({ value: 9, target: 9, success: true });
    expect(breakAway(pursuer(), 0, faces(5, 6)).contest).toMatchObject({ value: 11, target: 12, success: false });
    expect(breakAway(pursuer(), 2, faces(2, 3)).pursuit.state).toBe('fled');
  });
});

describe('the prize', () => {
  it('is a strongbox, a few crates and half the hull of a ship that still floats', () => {
    const prize = takePrize(pursuer({ hull: 9 }), 3, faces(2, 1, 1, 1, 1, 1, 1, 1));
    expect(prize.gold).toBeGreaterThan(0);
    expect(prize.goods).toHaveLength(GOODS.length);
    expect(prize.goods.reduce((sum, units) => sum + units, 0)).toBeGreaterThanOrEqual(1);
    expect(prize.ship).toEqual({ ship: 'cog', hull: 5 });
  });

  it('is no ship if the hull is gone', () => {
    expect(takePrize(pursuer({ hull: 0 }), 3).ship).toBeNull();
  });
});

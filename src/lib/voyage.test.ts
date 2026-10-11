import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { headway, HULL, hullBlow, pickSeaMonster, repairDay, sailDay, setSail, weatherFor } from './voyage';

const monsters = raw as unknown as Monster[];
/** An rng that hands out these faces (1–6) in turn, every die being a d6 here. */
const faces = (...values: number[]) => () => (values.shift()! - 1) / 6;

describe('weather and headway', () => {
  it('reads the d6 as storm, fog, fair, fair, wind, calm', () => {
    expect([1, 2, 3, 4, 5, 6].map(weatherFor)).toEqual(['storm', 'fog', 'fair', 'fair', 'wind', 'calm']);
  });

  it('makes two days in a following wind, one in fair or foggy weather, none in a storm or a calm', () => {
    expect(['wind', 'fair', 'fog', 'storm', 'calm'].map((w) => headway(w as never))).toEqual([2, 1, 1, 0, 0]);
  });
});

describe('a sea monster', () => {
  it('comes from the open water, near the party\'s level', () => {
    const monster = pickSeaMonster(monsters, 5, () => 0)!;
    expect(monster.habitat).toMatch(/sea|ocean|coast|waterfront|shore/i);
    expect(monster.category).not.toBe('Familiars');
  });
});

describe('a day at sea', () => {
  const voyage = () => ({ ...setSail('cog', 3), distance: 5, sea: null });

  it('sails a fair day: a day of headway, a day of supplies, nothing in the water on a 6', () => {
    const start = voyage();
    // weather d6 = 3 (fair), encounter d6 = 6 (nothing)
    const { voyage: next, stormDamage } = sailDay(start, monsters, faces(3, 6));
    expect(next).toMatchObject({ day: 1, progress: 1, weather: 'fair', encounter: null, supplies: start.supplies - 1 });
    expect(stormDamage).toBe(0);
  });

  it('loses the headway and 1d3 hull in a storm, and a monster rises on a 1 or 2', () => {
    const start = voyage();
    // weather 1 (storm), damage d3 = 3 (face 5 of the shared rng), encounter d6 = 2 (storm threshold), monster pick uses the next rolls
    const { voyage: next, stormDamage } = sailDay(start, monsters, faces(1, 5, 2, 1, 1));
    expect(next.progress).toBe(0);
    expect(stormDamage).toBe(3);
    expect(next.hull).toBe(HULL.cog - 3);
    expect(next.encounter ?? next.pursuit).not.toBeNull();
  });

  it('reaches the port when the headway adds up, and is lost when the hull gives out', () => {
    const near = { ...voyage(), progress: 4 };
    expect(sailDay(near, monsters, faces(5, 6)).voyage.arrived).toBe(true);
    const frail = { ...voyage(), hull: 2 };
    expect(sailDay(frail, monsters, faces(1, 5, 6)).voyage.wrecked).toBe(true);
  });

  it('does nothing once the voyage is over', () => {
    const done = { ...voyage(), arrived: true };
    expect(sailDay(done, monsters, faces()).voyage).toBe(done);
  });

  it('mends the hull in a day of repairs, never past its full strength, and eats supplies', () => {
    const worn = { ...voyage(), hull: HULL.cog - 1 };
    const mended = repairDay(worn, faces(3));
    expect(mended.hull).toBe(HULL.cog);
    expect(mended.supplies).toBe(worn.supplies - 1);
  });

  it('sinks the ship when a blow takes the last of the hull', () => {
    expect(hullBlow(voyage(), 5).hull).toBe(HULL.cog - 5);
    expect(hullBlow({ ...voyage(), hull: 3 }, 9)).toMatchObject({ hull: 0, wrecked: true });
  });
});

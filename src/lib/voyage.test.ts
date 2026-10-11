import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { harbourMap } from '../test/harbour-map';
import { driftMarkets, hexAt, isPort, stepAboard, withMarket } from './hexmap';
import {
  canLandAt,
  canSailTo,
  dayInPort,
  exploreIsland,
  goAboard,
  goAshore,
  harbourHere,
  headway,
  HULL,
  hullBlow,
  inPort,
  islandOutcome,
  pickSeaMonster,
  repairDay,
  sailDay,
  sailTo,
  setSail,
  shipHex,
  weatherFor,
} from './voyage';

const monsters = raw as unknown as Monster[];
/** An rng that hands out these faces (1–6) in turn, every die being a d6 here. */
const faces = (...values: number[]) => () => (values.shift()! - 1) / 6;

/** A cog lying at the home village's quay with the party aboard. */
const start = () => setSail('cog', 3, { q: 0, r: 0, settlement: 'village' }, faces(1));

describe('weather and headway', () => {
  it('reads the d6 as storm, fog, fair, fair, wind, calm', () => {
    expect([1, 2, 3, 4, 5, 6].map(weatherFor)).toEqual(['storm', 'fog', 'fair', 'fair', 'wind', 'calm']);
  });

  it('makes two days in a following wind, one in fair or foggy weather, none in a storm or a calm', () => {
    expect(['wind', 'fair', 'fog', 'storm', 'calm'].map((w) => headway(w as never))).toEqual([2, 1, 1, 0, 0]);
  });
});

describe('a sea monster', () => {
  it("comes from the open water, near the party's level", () => {
    const monster = pickSeaMonster(monsters, 5, () => 0)!;
    expect(monster.habitat).toMatch(/sea|ocean|coast|waterfront|shore/i);
    expect(monster.category).not.toBe('Familiars');
  });
});

describe('a ship on the map', () => {
  it('puts out from the harbour with the party aboard, nothing sailed yet, and the quay rolled', () => {
    expect(start()).toMatchObject({ at: { q: 0, r: 0 }, aboard: true, moves: 0, day: 0, hull: HULL.cog, recruits: 1 });
  });

  it('knows a harbour as a settlement with water beside it', () => {
    const map = harbourMap();
    expect(isPort(map, hexAt(map, 0, 0))).toBe(true);
    expect(isPort(map, hexAt(map, 3, -1))).toBe(true);
    expect(isPort(map, hexAt(map, 0, -1))).toBe(false);
    expect(inPort(start(), map)).toBe(true);
    expect(harbourHere(start(), map)).toBe(hexAt(map, 0, 0));
  });

  it('sails into open water and harbours but not onto dry land, and lands the party on dry land', () => {
    const map = harbourMap();
    const voyage = start();
    expect(canSailTo(map, voyage, 1, 0)).toBe(true);
    expect(canSailTo(map, voyage, 0, -1)).toBe(false);
    expect(canSailTo(map, voyage, 2, -1)).toBe(false); // two hexes away
    expect(canLandAt(map, voyage, 0, -1)).toBe(true);
    expect(canLandAt(map, voyage, 1, 0)).toBe(false);
  });

  it('spends a hex of headway on each move, carries the party along, and refuses one with none left', () => {
    const map = harbourMap();
    const none = sailTo(start(), map, 1, 0);
    expect(none.event).toBeNull();
    const out = sailTo({ ...start(), moves: 2 }, map, 1, 0);
    expect(out).toMatchObject({ event: 'open', voyage: { at: { q: 1, r: 0 }, moves: 1, recruits: null } });
    expect(out.map.party).toEqual({ q: 1, r: 0 });
    expect(shipHex(out.voyage, out.map)?.biome).toBe('sea');
  });

  it('reveals the water around the hex it enters', () => {
    const map = { ...harbourMap(), hexes: harbourMap().hexes.map((hex) => ({ ...hex, seen: false, visited: false })) };
    const out = sailTo({ ...start(), moves: 1 }, map, 1, 0);
    expect(hexAt(out.map, 1, 0)).toMatchObject({ visited: true, seen: true });
    expect(hexAt(out.map, 2, -1)).toMatchObject({ seen: true, visited: false });
  });

  it('tears 1d3 from every hull on a reef', () => {
    const map = harbourMap();
    const at = sailTo({ ...start(), at: { q: 1, r: 0 }, moves: 2 }, map, 2, 0, faces(4));
    expect(at).toMatchObject({ event: 'reef', reefDamage: 2 });
    expect(at.voyage.hull).toBe(HULL.cog - 2);
  });

  it('puts the ship alongside a harbour entered, ends the day there and offers its sailors', () => {
    const map = harbourMap();
    const from = { ...start(), at: { q: 2, r: -1 }, moves: 3, recruits: null };
    const report = sailTo(from, map, 3, -1, faces(6));
    expect(report).toMatchObject({ event: 'port', voyage: { at: { q: 3, r: -1 }, moves: 0 } });
    expect(report.voyage.recruits).toBeGreaterThan(0);
    expect(inPort(report.voyage, report.map)).toBe(true);
  });

  it('lets the party go ashore at the quay and come aboard again, only where the ship lies', () => {
    const map = harbourMap();
    const ashore = goAshore(start(), map)!;
    expect(ashore.aboard).toBe(false);
    expect(goAshore(ashore, map)).toBeNull();
    expect(goAboard(ashore, map)?.aboard).toBe(true);
    expect(goAboard(ashore, { ...map, party: { q: -1, r: 0 } })).toBeNull();
    const atSea = { ...start(), at: { q: 1, r: 0 } };
    expect(goAshore(atSea, map)).toBeNull();
  });

  it('lets the party step back aboard a ship that lies on water beside it', () => {
    const map = { ...harbourMap(), party: { q: 0, r: 0 } };
    const back = stepAboard(map, 1, 0)!;
    expect(back.party).toEqual({ q: 1, r: 0 });
    expect(stepAboard(map, 2, -1)).toBeNull();
  });
});

describe('a day at sea', () => {
  it('sails a fair day: headway, a day of supplies, nothing in the water on a 6', () => {
    const base = start();
    // weather d6 = 3 (fair), encounter d6 = 6 (nothing)
    const { voyage: next, stormDamage } = sailDay(base, monsters, faces(3, 6));
    expect(next).toMatchObject({ day: 1, moves: 1, weather: 'fair', encounter: null, supplies: base.supplies - 1, recruits: null });
    expect(stormDamage).toBe(0);
  });

  it('loses the headway and 1d3 hull in a storm, and a monster rises on a 1 or 2', () => {
    // weather 1 (storm), damage d3 = 3 (face 5 of the shared rng), encounter d6 = 2 (storm threshold), monster pick uses the next rolls
    const { voyage: next, stormDamage } = sailDay(start(), monsters, faces(1, 5, 2, 1, 1));
    expect(next.moves).toBe(0);
    expect(stormDamage).toBe(3);
    expect(next.hull).toBe(HULL.cog - 3);
    expect(next.encounter ?? next.pursuit).not.toBeNull();
  });

  it('is lost when the hull gives out', () => {
    expect(sailDay({ ...start(), hull: 2 }, monsters, faces(1, 5, 6)).voyage.wrecked).toBe(true);
  });

  it('does nothing once the ship is lost', () => {
    const done = { ...start(), wrecked: true };
    expect(sailDay(done, monsters, faces()).voyage).toBe(done);
  });

  it('mends the hull in a day of repairs, never past its full strength, and eats supplies', () => {
    const worn = { ...start(), hull: HULL.cog - 1 };
    const mended = repairDay(worn, faces(3));
    expect(mended.hull).toBe(HULL.cog);
    expect(mended.supplies).toBe(worn.supplies - 1);
  });

  it('sinks the ship when a blow takes the last of the hull', () => {
    expect(hullBlow(start(), 5).hull).toBe(HULL.cog - 5);
    expect(hullBlow({ ...start(), hull: 3 }, 9)).toMatchObject({ hull: 0, wrecked: true });
  });

  it('refills hold and hull in a day alongside, with a new quay of sailors', () => {
    const worn = { ...start(), hull: 3, supplies: 0, hunger: 2, recruits: 0 };
    const next = dayInPort(worn, 'town', faces(6));
    expect(next).toMatchObject({ hull: HULL.cog, hunger: 0, day: 1, recruits: 6 });
    expect(next.supplies).toBeGreaterThan(0);
  });
});

describe('islands', () => {
  it('reads the island d6 as spring, spring, wreck, nothing, nothing, beasts', () => {
    expect([1, 2, 3, 4, 5, 6].map(islandOutcome)).toEqual(['spring', 'spring', 'wreck', 'nothing', 'nothing', 'beasts']);
  });

  it('searches the island the ship lies at, once', () => {
    const map = harbourMap();
    const there = { ...start(), at: { q: 1, r: -1 }, supplies: 2, hunger: 1 };
    const first = exploreIsland(there, map, monsters, faces(1))!;
    expect(first.outcome).toBe('spring');
    expect(first.voyage).toMatchObject({ supplies: 5, hunger: 0 });
    expect(hexAt(first.map, 1, -1)?.explored).toBe(true);
    expect(exploreIsland(first.voyage, first.map, monsters, faces(1))).toBeNull();
    expect(exploreIsland(start(), map, monsters, faces(1))).toBeNull(); // not at an island
  });
});

describe('markets', () => {
  it('makes a harbour market once, six prices from d6', () => {
    const map = withMarket(harbourMap(), 0, 0, faces(1, 2, 3, 4, 5, 6));
    expect(hexAt(map, 0, 0)?.market).toEqual([1, 2, 3, 4, 5, 6]);
    expect(withMarket(map, 0, 0, faces(6, 6, 6, 6, 6, 6))).toBe(map);
    expect(withMarket(map, 1, 0)).toBe(map); // no settlement, no market
  });

  it('slips a price down on a die of 1, up on a 6, and leaves it on 2–5', () => {
    const map = withMarket(harbourMap(), 0, 0, faces(3, 3, 3, 3, 3, 3));
    const drifted = driftMarkets(map, faces(1, 6, 2, 5, 3, 4));
    expect(hexAt(drifted, 0, 0)?.market).toEqual([2, 4, 3, 3, 3, 3]);
    const edges = withMarket(harbourMap(), 0, 0, faces(1, 6, 1, 6, 1, 6));
    expect(hexAt(driftMarkets(edges, faces(1, 6, 1, 6, 1, 6)), 0, 0)?.market).toEqual([1, 6, 1, 6, 1, 6]);
  });
});

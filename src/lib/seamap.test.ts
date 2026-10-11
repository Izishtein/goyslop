import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { hexDistance } from './hexmap';
import { canSailTo, generateSeaMap, islandOutcome, seaHexAt, SEA_RADIUS, stepShip } from './seamap';
import { attackShip, dayInPort, exploreIsland, FULL_SUPPLIES, HULL, hullDamageFrom, inPort, sailDay, sailTo, setSail, SHIP_EVASION } from './voyage';

const monsters = raw as unknown as Monster[];

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('the chart', () => {
  it('is a disc of 37 hexes with the home harbour and the far harbour at opposite corners', () => {
    for (const seed of [1, 2, 3, 4, 5, 6, 7, 8]) {
      const map = generateSeaMap(seeded(seed));
      expect(map.hexes).toHaveLength(37);
      expect(hexDistance(map.origin, map.destination)).toBe(2 * SEA_RADIUS);
      expect(seaHexAt(map, map.origin.q, map.origin.r)).toMatchObject({ kind: 'port', visited: true });
      expect(seaHexAt(map, map.destination.q, map.destination.r)?.kind).toBe('port');
      expect(map.ship).toEqual(map.origin);
    }
  });

  it('scatters islands and reefs but keeps the ring around both main harbours clear', () => {
    for (const seed of [11, 12, 13, 14, 15, 16]) {
      const map = generateSeaMap(seeded(seed));
      const kinds = (kind: string) => map.hexes.filter((hex) => hex.kind === kind);
      expect(kinds('island').length).toBeGreaterThanOrEqual(3);
      expect(kinds('reef').length).toBeGreaterThanOrEqual(3);
      for (const hex of [...kinds('island'), ...kinds('reef')]) {
        expect(hexDistance(hex, map.origin)).toBeGreaterThan(1);
        expect(hexDistance(hex, map.destination)).toBeGreaterThan(1);
      }
    }
  });

  it('shows only the hexes beside the ship, and lights the neighbours of the one it moves into', () => {
    const map = generateSeaMap(seeded(3));
    expect(map.hexes.filter((hex) => hex.seen).every((hex) => hexDistance(hex, map.origin) <= 1)).toBe(true);
    const neighbour = map.hexes.find((hex) => canSailTo(map, hex.q, hex.r))!;
    const step = stepShip(map, neighbour.q, neighbour.r)!;
    expect(step.map.ship).toEqual({ q: neighbour.q, r: neighbour.r });
    expect(step.hex.visited).toBe(true);
    expect(stepShip(map, map.destination.q, map.destination.r)).toBeNull();
  });

  it('reads the island d6 as spring, spring, wreck, nothing, nothing, beasts', () => {
    expect([1, 2, 3, 4, 5, 6].map(islandOutcome)).toEqual(['spring', 'spring', 'wreck', 'nothing', 'nothing', 'beasts']);
  });
});

describe('sailing the chart', () => {
  const afloat = (seed = 4) => {
    const voyage = setSail('cog', 3, seeded(seed));
    return { ...voyage, moves: 3 };
  };
  /** Moves the ship to the first hex of this kind next to it, putting it on the chart by hand. */
  const placeShipNextTo = (voyage: ReturnType<typeof afloat>, kind: 'reef' | 'island' | 'port') => {
    const sea = voyage.sea!;
    const target = sea.hexes.find((hex) => hex.kind === kind && hexDistance(hex, sea.ship) > 0 && hex.q !== sea.origin.q)!;
    const next = sea.hexes.find((hex) => hexDistance(hex, target) === 1 && hex.kind === 'water')!;
    return { voyage: { ...voyage, sea: { ...sea, ship: { q: next.q, r: next.r } } }, target };
  };

  it('spends a hex of headway on each move and refuses one with none left', () => {
    const voyage = afloat();
    const neighbour = voyage.sea!.hexes.find((hex) => canSailTo(voyage.sea!, hex.q, hex.r))!;
    const sailed = sailTo(voyage, neighbour.q, neighbour.r);
    expect(sailed.voyage.moves).toBe(2);
    expect(sailTo({ ...voyage, moves: 0 }, neighbour.q, neighbour.r).voyage.moves).toBe(0);
  });

  it('tears 1d3 from the hull on a reef', () => {
    const { voyage, target } = placeShipNextTo(afloat(), 'reef');
    const report = sailTo(voyage, target.q, target.r, () => 0.99);
    expect(report.event).toBe('reef');
    expect(report.reefDamage).toBe(3);
    expect(report.voyage.hull).toBe(HULL.cog - 3);
  });

  it('ends the voyage on entering the far harbour', () => {
    const voyage = afloat();
    const sea = voyage.sea!;
    const next = sea.hexes.find((hex) => hexDistance(hex, sea.destination) === 1)!;
    const report = sailTo({ ...voyage, sea: { ...sea, ship: { q: next.q, r: next.r } } }, sea.destination.q, sea.destination.r);
    expect(report.event).toBe('arrived');
    expect(report.voyage.arrived).toBe(true);
  });

  it('gives a sailing day headway rather than progress, and counts hungry days once the hold is empty', () => {
    const voyage = { ...setSail('cog', 3, seeded(2)), supplies: 0 };
    // weather d6 = 5 (a following wind), encounter d6 = 6
    const rolls = [5, 6];
    const { voyage: next } = sailDay(voyage, monsters, () => (rolls.shift()! - 1) / 6);
    expect(next).toMatchObject({ moves: 2, progress: 0, hunger: 1, arrived: false });
  });

  it('refills hold and hull in a day in port, and eases nothing elsewhere', () => {
    const voyage = { ...setSail('boat', 1, seeded(2)), hull: 2, supplies: 0, hunger: 3 };
    expect(inPort(voyage)).toBe(true);
    expect(dayInPort(voyage)).toMatchObject({ day: 1, hull: HULL.boat, supplies: FULL_SUPPLIES, hunger: 0 });
    const away = placeShipNextTo({ ...voyage, moves: 1 }, 'island').voyage;
    expect(inPort(away)).toBe(false);
    expect(dayInPort(away)).toBe(away);
  });

  it('searches an island once', () => {
    const { voyage, target } = placeShipNextTo(afloat(), 'island');
    const landed = sailTo(voyage, target.q, target.r).voyage;
    const first = exploreIsland(landed, monsters, () => 0)!; // d6 = 1: a spring
    expect(first.outcome).toBe('spring');
    expect(first.voyage.supplies).toBe(Math.min(FULL_SUPPLIES, landed.supplies + 3));
    expect(exploreIsland(first.voyage, monsters, () => 0)).toBeNull();
  });
});

describe('a monster against the ship', () => {
  const kraken = monsters.find((entry) => /sea|ocean/i.test(entry.habitat) && entry.sections[0]?.accuracy && entry.sections[0].damage)!;

  it('takes a fifth of the damage rolled off the hull, at least one point', () => {
    expect(hullDamageFrom(2)).toBe(1);
    expect(hullDamageFrom(12)).toBe(3);
    expect(hullDamageFrom(25)).toBe(5);
  });

  it('hits on boxcars whatever the ship is, and costs the hull', () => {
    const voyage = setSail('galleon', 5, seeded(1));
    const result = attackShip(voyage, kraken.sections[0], false, () => 0.99)!;
    expect(result.hit).toBe(true);
    expect(result.voyage.hull).toBe(HULL.galleon - result.hullLost);
    expect(result.hullLost).toBeGreaterThanOrEqual(1);
  });

  it('misses on snake eyes', () => {
    const voyage = setSail('boat', 5, seeded(1));
    const result = attackShip(voyage, kraken.sections[0], false, () => 0)!;
    expect(result.hit).toBe(false);
    expect(result.voyage).toBe(voyage);
  });

  it('is harder to miss with a big ship', () => {
    expect(SHIP_EVASION.galleon).toBeLessThan(SHIP_EVASION.boat);
  });
});

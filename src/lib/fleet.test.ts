import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { hexDistance } from './hexmap';
import { CARGO, FLEET_MAX, GOODS, GOOD_PRICE, goodPrice, HULL, priceFactor } from './ships';
import { addShip, attackShip, cargoCapacity, cargoLoad, claimPrize, fleetOf, harbourHere, hullBlow, loadGoods, repairDay, sailDay, sailTo, setSail, unloadGoods, withFleet } from './voyage';

const monsters = raw as unknown as Monster[];
const faces = (...values: number[]) => () => (values.shift()! - 1) / 6;

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const start = () => setSail('cog', 3, seeded(5), { homeHex: '1,0', homeSettlement: 'village' });

describe('markets and harbours', () => {
  it('gives every harbour a market of six prices and a town ashore, the home harbour the one it left', () => {
    const sea = start().sea!;
    const ports = sea.hexes.filter((hex) => hex.kind === 'port');
    expect(ports.length).toBeGreaterThanOrEqual(2);
    for (const port of ports) {
      expect(port.market).toHaveLength(GOODS.length);
      expect(port.market!.every((roll) => roll >= 1 && roll <= 6)).toBe(true);
      expect(['village', 'town', 'fortress', 'hamlet']).toContain(port.settlement);
    }
    expect(sea.hexes.find((hex) => hex.q === sea.origin.q && hex.r === sea.origin.r)?.settlement).toBe('village');
    expect(start().homeHex).toBe('1,0');
  });

  it('reads the market d6 from glut to scarcity', () => {
    expect([1, 2, 3, 4, 5, 6].map(priceFactor)).toEqual([0.6, 0.8, 1, 1, 1.25, 1.5]);
    expect(goodPrice('spice', 1)).toBe(Math.round(GOOD_PRICE.spice * 0.6));
  });
});

describe('a fleet', () => {
  it('buys a hull in port up to the fleet limit, never at sea', () => {
    let voyage = start();
    expect(harbourHere(voyage)?.kind).toBe('port');
    for (let i = 1; i < FLEET_MAX; i += 1) voyage = addShip(voyage, 'boat')!;
    expect(fleetOf(voyage)).toHaveLength(FLEET_MAX);
    expect(addShip(voyage, 'boat')).toBeNull();

    const sea = voyage.sea!;
    const open = sea.hexes.find((hex) => hex.kind === 'water')!;
    expect(addShip({ ...start(), sea: { ...start().sea!, ship: { q: open.q, r: open.r } } }, 'boat')).toBeNull();
  });

  it('puts a blow on the ship aimed at, promoting an escort when the flagship goes down', () => {
    const voyage = addShip(start(), 'boat')!;
    expect(hullBlow(voyage, 3, 1).escorts[0].hull).toBe(HULL.boat - 3);
    expect(hullBlow(voyage, 3, 1).hull).toBe(HULL.cog);

    const flagshipLost = hullBlow(voyage, 99, 0);
    expect(flagshipLost.wrecked).toBe(false);
    expect(flagshipLost).toMatchObject({ ship: 'boat', hull: HULL.boat, escorts: [] });
  });

  it('is wrecked only when the last ship is gone', () => {
    const voyage = addShip(start(), 'boat')!;
    const lastOne = hullBlow(hullBlow(voyage, 99, 0), 99, 0);
    expect(lastOne.wrecked).toBe(true);
    expect(lastOne.cargo.every((units) => units === 0)).toBe(true);
  });

  it('mends every ship in a day of repairs and storms every ship in a gale', () => {
    const worn = withFleet(addShip(start(), 'boat')!, [{ ship: 'cog', hull: 5 }, { ship: 'boat', hull: 2 }]);
    const mended = repairDay(worn, () => 0.99); // d3 = 3
    expect(mended).toMatchObject({ hull: 8 });
    expect(mended.escorts[0].hull).toBe(5);

    // weather 1 (storm), flagship d3 = 1, encounter d6 = 6 (nothing), escort d3 rolled before that
    const gale = sailDay(addShip(start(), 'boat')!, monsters, faces(1, 1, 3, 6)).voyage;
    expect(gale.hull).toBe(HULL.cog - 1);
    expect(gale.escorts[0].hull).toBeLessThan(HULL.boat);
  });

  it('lets a reef scrape every hull', () => {
    const base = addShip(start(), 'boat')!;
    const sea = base.sea!;
    const reef = sea.hexes.find((hex) => hex.kind === 'reef')!;
    const beside = sea.hexes.find((hex) => hexDistance(hex, reef) === 1 && hex.kind === 'water')!;
    const there = sailTo({ ...base, moves: 1, sea: { ...sea, ship: { q: beside.q, r: beside.r } } }, reef.q, reef.r, () => 0.5);
    expect(there.event).toBe('reef');
    expect(there.voyage.hull).toBeLessThan(HULL.cog);
    expect(there.voyage.escorts[0].hull).toBeLessThan(HULL.boat);
  });

  it('aims a monster at the chosen ship', () => {
    const voyage = addShip(start(), 'boat')!;
    const kraken = monsters.find((entry) => /sea|ocean/i.test(entry.habitat) && entry.sections[0]?.accuracy && entry.sections[0].damage)!;
    const result = attackShip(voyage, kraken.sections[0], false, () => 0.99, 1)!;
    expect(result.hit).toBe(true);
    expect(result.voyage.hull).toBe(HULL.cog);
    expect(result.voyage.escorts[0]?.hull ?? 0).toBeLessThan(HULL.boat);
  });
});

describe('cargo', () => {
  it('fits the holds of the ships afloat and no more', () => {
    const voyage = start();
    expect(cargoCapacity(voyage)).toBe(CARGO.cog);
    const full = loadGoods(voyage, 0, CARGO.cog)!;
    expect(cargoLoad(full)).toBe(CARGO.cog);
    expect(loadGoods(full, 1, 1)).toBeNull();
    expect(cargoCapacity(addShip(full, 'galleon')!)).toBe(CARGO.cog + CARGO.galleon);
  });

  it('unloads only what is aboard', () => {
    const voyage = loadGoods(start(), 2, 3)!;
    expect(unloadGoods(voyage, 2, 4)).toBeNull();
    expect(unloadGoods(voyage, 2, 3)!.cargo[2]).toBe(0);
  });

  it('is cut down when a ship with a hold is lost', () => {
    const voyage = loadGoods(addShip(start(), 'galleon')!, 0, CARGO.cog + 6)!;
    const sunk = hullBlow(voyage, 99, 1); // the galleon
    expect(cargoLoad(sunk)).toBe(CARGO.cog);
  });
});

describe('a prize', () => {
  it('adds its ship while the fleet has room and stows what the holds take', () => {
    const chased = { ...start(), pursuit: { ship: 'cog' as const, hull: 6, crewId: 'x', crewCount: 3, crewLevel: 2, state: 'grappled' as const, round: 2 } };
    const taken = claimPrize(chased, { goods: [2, 0, 0, 0, 0, 20], ship: { ship: 'cog', hull: 3 } });
    expect(taken.pursuit?.state).toBe('taken');
    expect(fleetOf(taken)).toHaveLength(2);
    expect(cargoLoad(taken)).toBeLessThanOrEqual(cargoCapacity(taken));
    expect(taken.cargo[0]).toBe(2);
  });
});

describe('a sail in the day', () => {
  it('one time in three the sighting is a ship, and a chase blocks a new one', () => {
    const voyage = start();
    // weather 3 (fair), encounter d6 = 1, ship-or-monster d3 = 1 (a ship), then the crew pick and count
    const { voyage: next } = sailDay(voyage, monsters, faces(3, 1, 1, 1, 1, 1));
    expect(next.pursuit).not.toBeNull();
    expect(next.encounter).toBeNull();
    const again = sailDay(next, monsters, faces(3, 1, 1, 1, 1, 1)).voyage;
    expect(again.pursuit).toEqual(next.pursuit);
  });

  it('clears a chase that is over when the next day comes', () => {
    const over = { ...start(), pursuit: { ship: 'boat' as const, hull: 0, crewId: 'x', crewCount: 3, crewLevel: 2, state: 'sunk' as const, round: 2 } };
    const { voyage } = sailDay(over, monsters, faces(3, 6));
    expect(voyage.pursuit).toBeNull();
  });
});


import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { generateHexMap, hexDistance, landfall } from './hexmap';
import { driftMarkets } from './seamap';
import { CARGO, CREW_NEEDED, FLEET_MAX, GOODS, GOOD_PRICE, goodPrice, HULL, priceFactor } from './ships';
import { addShip, attackShip, cargoCapacity, cargoLoad, claimPrize, crewAboard, crewModifier, crewNeeded, dayInPort, fleetOf, harbourHere, hireable, hireCrew, hullBlow, loadGoods, loseCrew, quayRecruits, repairDay, sailDay, sailTo, setSail, undermanned, unloadGoods, withFleet } from './voyage';

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
    expect(gale.hull).toBe(HULL.cog - 2); // the new boat has no sailors: the short-handed fleet loses one point more
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


describe('markets drift', () => {
  const harbourMarket = (voyage: ReturnType<typeof start>) => voyage.sea!.hexes.filter((hex) => hex.market).map((hex) => hex.market!);
  const constant = (value: number) => () => (value - 0.5) / 6;

  it('slips a price down on a die of 1, up on a 6, and leaves it on 2–5', () => {
    const sea = { ...start().sea!, hexes: [{ q: 0, r: 0, kind: 'port' as const, seen: true, visited: true, market: [3, 3, 3, 1, 6, 3] }] };
    expect(driftMarkets(sea, constant(1)).hexes[0].market).toEqual([2, 2, 2, 1, 5, 2]);
    expect(driftMarkets(sea, constant(6)).hexes[0].market).toEqual([4, 4, 4, 2, 6, 4]);
    expect(driftMarkets(sea, constant(3)).hexes[0].market).toEqual([3, 3, 3, 1, 6, 3]);
  });

  it('moves every harbour every day at sea, in a day of repairs and in a day alongside', () => {
    const voyage = start();
    const before = harbourMarket(voyage);
    const afterRepair = repairDay({ ...voyage, hull: 3 }, constant(6));
    expect(harbourMarket(afterRepair)).not.toEqual(before);
    expect(harbourMarket(afterRepair).every((market) => market.every((roll) => roll >= 1 && roll <= 6))).toBe(true);
    const home = { ...voyage, sea: { ...voyage.sea!, ship: { ...voyage.sea!.origin } } };
    expect(harbourMarket(dayInPort(home, constant(1)))).not.toEqual(before);
  });
});

describe('the crew', () => {
  const docked = () => {
    const voyage = start();
    return { ...voyage, sea: { ...voyage.sea!, ship: { ...voyage.sea!.origin } } };
  };

  it('starts fully manned, and a new hull comes without sailors', () => {
    const voyage = docked();
    expect(crewAboard(voyage)).toBe(CREW_NEEDED.cog);
    expect(undermanned(voyage)).toBe(false);
    const bigger = addShip(voyage, 'boat')!;
    expect(crewNeeded(bigger)).toBe(CREW_NEEDED.cog + CREW_NEEDED.boat);
    expect(crewAboard(bigger)).toBe(CREW_NEEDED.cog);
    expect(undermanned(bigger)).toBe(true);
  });

  it('steadies a full crew (+1) and hampers a short one (−2)', () => {
    const voyage = docked();
    expect(crewModifier(voyage)).toBe(1);
    expect(crewModifier(loseCrew(voyage, 1))).toBe(-2);
  });

  it('loses sailors but never below none', () => {
    expect(crewAboard(loseCrew(docked(), 2))).toBe(CREW_NEEDED.cog - 2);
    expect(crewAboard(loseCrew(docked(), 99))).toBe(0);
  });

  it('hires in a harbour, never past what the fleet needs, and nowhere else', () => {
    const short = { ...loseCrew(docked(), 4), recruits: 20 };
    expect(crewAboard(hireCrew(short, 2)!)).toBe(CREW_NEEDED.cog - 2);
    expect(crewAboard(hireCrew(short, 99)!)).toBe(CREW_NEEDED.cog);
    expect(hireCrew(docked(), 1)).toBeNull(); // nobody is missing
    const atSea = { ...short, sea: { ...short.sea!, ship: { q: 0, r: 0 } } };
    expect(hireCrew(atSea, 1)).toBeNull();
  });

  it('hires only as many as the quay has today, and the quay runs down', () => {
    const short = { ...loseCrew(docked(), 4), recruits: 3 };
    expect(hireable(short)).toBe(3);
    const hired = hireCrew(short, 99)!;
    expect(crewAboard(hired)).toBe(CREW_NEEDED.cog - 1);
    expect(hired.recruits).toBe(0);
    expect(hireCrew(hired, 1)).toBeNull();
  });

  it('lets an old save, with no quay roll, hire freely', () => {
    const short = { ...loseCrew(docked(), 4), recruits: null };
    expect(hireable(short)).toBe(4);
    expect(hireCrew(short, 4)!.recruits).toBeNull();
  });

  it('rolls the sailors on the quay by the size of the town: d3 in a village, d6 in a town, d6+2 in a fortress', () => {
    expect(quayRecruits('village', faces(6))).toBe(3);
    expect(quayRecruits('hamlet', faces(1))).toBe(1);
    expect(quayRecruits('town', faces(6))).toBe(6);
    expect(quayRecruits('fortress', faces(6))).toBe(8);
  });

  it('starts a voyage with the home quay rolled, and rolls a new quay each day in port', () => {
    expect(start().recruits).toBeGreaterThanOrEqual(1);
    expect(start().recruits).toBeLessThanOrEqual(3); // a village
    const next = dayInPort({ ...docked(), recruits: 0 }, faces(6, 6, 6, 6, 6, 6));
    expect(next.recruits).toBeGreaterThan(0);
  });

  it('leaves the quay behind at sea, and finds a new one on entering a harbour', () => {
    const voyage = docked();
    const sea = voyage.sea!;
    const water = sea.hexes.find((hex) => hex.kind === 'water' && Math.max(Math.abs(hex.q - sea.origin.q), Math.abs(hex.r - sea.origin.r), Math.abs(hex.q + hex.r - sea.origin.q - sea.origin.r)) === 1)!;
    const out = sailTo({ ...voyage, moves: 1, recruits: 2 }, water.q, water.r, faces(6)).voyage;
    expect(out.recruits).toBeNull();
    const back = sailTo({ ...out, moves: 1 }, sea.origin.q, sea.origin.r, faces(6)).voyage;
    expect(back.recruits).toBe(3); // a village's d3, the top face
  });

  it('makes a storm cost a short-handed fleet one more point of hull', () => {
    const full = sailDay(docked(), monsters, faces(1, 2, 6, 1, 1, 1, 1, 1, 1, 1)).voyage;
    const short = sailDay(loseCrew(docked(), 3), monsters, faces(1, 2, 6, 1, 1, 1, 1, 1, 1, 1)).voyage;
    expect(short.hull).toBe(full.hull - 1);
  });
});

describe('landfall', () => {
  it('puts the party in a fresh land, in the town of the harbour, with food in the packs', () => {
    const map = landfall({ level: 4, monsters, rng: seeded(11) }, 'fortress');
    const centre = map.hexes.find((hex) => hex.q === 0 && hex.r === 0)!;
    expect(centre.feature).toEqual({ kind: 'settlement', settlement: 'fortress' });
    expect(map.party).toEqual({ q: 0, r: 0 });
    expect(map.hexes).toHaveLength(generateHexMap({ level: 4, monsters, rng: seeded(11) }).hexes.length);
    expect(map.rations).toBeGreaterThan(0);
    expect(map.level).toBe(4);
  });
});

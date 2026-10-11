import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { harbourMap } from '../test/harbour-map';
import { hexAt } from './hexmap';
import { CARGO, CREW_NEEDED, FLEET_MAX, GOOD_PRICE, goodPrice, HULL, priceFactor } from './ships';
import { addShip, attackShip, cargoCapacity, cargoLoad, claimPrize, crewAboard, crewModifier, crewNeeded, dayInPort, fleetOf, harbourHere, hireable, hireCrew, hullBlow, loadGoods, loseCrew, quayRecruits, repairDay, sailDay, sailTo, setSail, undermanned, unloadGoods, withFleet } from './voyage';

const monsters = raw as unknown as Monster[];
const faces = (...values: number[]) => () => (values.shift()! - 1) / 6;

const map = harbourMap();

/** A cog at the home village's quay, the party aboard. */
const start = () => setSail('cog', 3, { q: 0, r: 0, settlement: 'village' }, faces(4));

describe('markets and harbours', () => {
  it('reads the market d6 from glut to scarcity', () => {
    expect([1, 2, 3, 4, 5, 6].map(priceFactor)).toEqual([0.6, 0.8, 1, 1, 1.25, 1.5]);
    expect(goodPrice('spice', 1)).toBe(Math.round(GOOD_PRICE.spice * 0.6));
  });
});

describe('a fleet', () => {
  it('buys a hull in port up to the fleet limit, never at sea', () => {
    let voyage = start();
    expect(harbourHere(voyage, map)).toBe(hexAt(map, 0, 0));
    for (let i = 1; i < FLEET_MAX; i += 1) voyage = addShip(voyage, map, 'boat')!;
    expect(fleetOf(voyage)).toHaveLength(FLEET_MAX);
    expect(addShip(voyage, map, 'boat')).toBeNull();

    expect(addShip({ ...start(), at: { q: 1, r: 0 } }, map, 'boat')).toBeNull();
  });

  it('puts a blow on the ship aimed at, promoting an escort when the flagship goes down', () => {
    const voyage = addShip(start(), map, 'boat')!;
    expect(hullBlow(voyage, 3, 1).escorts[0].hull).toBe(HULL.boat - 3);
    expect(hullBlow(voyage, 3, 1).hull).toBe(HULL.cog);

    const flagshipLost = hullBlow(voyage, 99, 0);
    expect(flagshipLost.wrecked).toBe(false);
    expect(flagshipLost).toMatchObject({ ship: 'boat', hull: HULL.boat, escorts: [] });
  });

  it('is wrecked only when the last ship is gone', () => {
    const voyage = addShip(start(), map, 'boat')!;
    const lastOne = hullBlow(hullBlow(voyage, 99, 0), 99, 0);
    expect(lastOne.wrecked).toBe(true);
    expect(lastOne.cargo.every((units) => units === 0)).toBe(true);
  });

  it('mends every ship in a day of repairs and storms every ship in a gale', () => {
    const worn = withFleet(addShip(start(), map, 'boat')!, [{ ship: 'cog', hull: 5 }, { ship: 'boat', hull: 2 }]);
    const mended = repairDay(worn, () => 0.99); // d3 = 3
    expect(mended).toMatchObject({ hull: 8 });
    expect(mended.escorts[0].hull).toBe(5);

    // weather 1 (storm), flagship d3 = 1, encounter d6 = 6 (nothing), escort d3 rolled before that
    const gale = sailDay(addShip(start(), map, 'boat')!, monsters, faces(1, 1, 3, 6)).voyage;
    expect(gale.hull).toBe(HULL.cog - 2); // the new boat has no sailors: the short-handed fleet loses one point more
    expect(gale.escorts[0].hull).toBeLessThan(HULL.boat);
  });

  it('lets a reef scrape every hull', () => {
    const base = addShip(start(), map, 'boat')!;
    const there = sailTo({ ...base, moves: 1, at: { q: 1, r: 0 } }, map, 2, 0, () => 0.5);
    expect(there.event).toBe('reef');
    expect(there.voyage.hull).toBeLessThan(HULL.cog);
    expect(there.voyage.escorts[0].hull).toBeLessThan(HULL.boat);
  });

  it('aims a monster at the chosen ship', () => {
    const voyage = addShip(start(), map, 'boat')!;
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
    expect(cargoCapacity(addShip(full, map, 'galleon')!)).toBe(CARGO.cog + CARGO.galleon);
  });

  it('unloads only what is aboard', () => {
    const voyage = loadGoods(start(), 2, 3)!;
    expect(unloadGoods(voyage, 2, 4)).toBeNull();
    expect(unloadGoods(voyage, 2, 3)!.cargo[2]).toBe(0);
  });

  it('is cut down when a ship with a hold is lost', () => {
    const voyage = loadGoods(addShip(start(), map, 'galleon')!, 0, CARGO.cog + 6)!;
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


describe('the crew', () => {
  const docked = start;

  it('starts fully manned, and a new hull comes without sailors', () => {
    const voyage = docked();
    expect(crewAboard(voyage)).toBe(CREW_NEEDED.cog);
    expect(undermanned(voyage)).toBe(false);
    const bigger = addShip(voyage, map, 'boat')!;
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
    expect(crewAboard(hireCrew(short, map, 2)!)).toBe(CREW_NEEDED.cog - 2);
    expect(crewAboard(hireCrew(short, map, 99)!)).toBe(CREW_NEEDED.cog);
    expect(hireCrew(docked(), map, 1)).toBeNull(); // nobody is missing
    const atSea = { ...short, at: { q: 1, r: 0 } };
    expect(hireCrew(atSea, map, 1)).toBeNull();
  });

  it('hires only as many as the quay has today, and the quay runs down', () => {
    const short = { ...loseCrew(docked(), 4), recruits: 3 };
    expect(hireable(short)).toBe(3);
    const hired = hireCrew(short, map, 99)!;
    expect(crewAboard(hired)).toBe(CREW_NEEDED.cog - 1);
    expect(hired.recruits).toBe(0);
    expect(hireCrew(hired, map, 1)).toBeNull();
  });

  it('lets an old save, with no quay roll, hire freely', () => {
    const short = { ...loseCrew(docked(), 4), recruits: null };
    expect(hireable(short)).toBe(4);
    expect(hireCrew(short, map, 4)!.recruits).toBeNull();
  });

  it('rolls the sailors on the quay by the size of the town: d3 in a village, d6 in a town, d6+2 in a fortress', () => {
    expect(quayRecruits('village', faces(6))).toBe(3);
    expect(quayRecruits('hamlet', faces(1))).toBe(1);
    expect(quayRecruits('town', faces(6))).toBe(6);
    expect(quayRecruits('fortress', faces(6))).toBe(8);
  });

  it('starts a voyage with the home quay rolled, and rolls a new quay each day in port', () => {
    expect(start().recruits).toBe(2); // a village's d3: the second face
    const next = dayInPort({ ...docked(), recruits: 0 }, 'town', faces(6));
    expect(next.recruits).toBe(6);
  });

  it('leaves the quay behind at sea, and finds a new one on entering a harbour', () => {
    const out = sailTo({ ...docked(), moves: 1, recruits: 2 }, map, 1, 0, faces(6)).voyage;
    expect(out.recruits).toBeNull();
    const back = sailTo({ ...out, moves: 1 }, map, 0, 0, faces(6)).voyage;
    expect(back.recruits).toBe(3); // a village's d3, the top face
  });

  it('makes a storm cost a short-handed fleet one more point of hull', () => {
    const full = sailDay(docked(), monsters, faces(1, 2, 6, 1, 1, 1, 1, 1, 1, 1)).voyage;
    const short = sailDay(loseCrew(docked(), 3), monsters, faces(1, 2, 6, 1, 1, 1, 1, 1, 1, 1)).voyage;
    expect(short.hull).toBe(full.hull - 1);
  });
});

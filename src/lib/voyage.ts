import type { Monster, MonsterSection } from '../data/monsters/types';
import { sightPursuit, type Pursuit } from './boarding';
import { hoard } from './dungeon';
import { attackHits, resolveAttack, rollEvasion, rollMonsterAttack, rollMonsterDamage, type EvasionRoll, type MonsterAttackRoll, type MonsterDamageRoll, type Rng } from './encounter';
import { hexAt, hexDistance, hexKey, isPort, isWater, neighbours, reveal, type Hex, type HexMap } from './hexmap';
import { CARGO, CREW_NEEDED, FLEET_MAX, GOODS, HULL, SHIP_EVASION, SHIPS, type Ship } from './ships';

export { HULL, SHIP_EVASION, SHIPS, type Ship };

/*
 * Sea voyages. The ship sails the same hex map the party walks (lib/hexmap.ts): sea hexes, with reefs and
 * islands among them, and harbours — settlements with water beside them — where it lies alongside. Each day
 * the weather is rolled and sets how many hexes the ship may sail, and something may rise from the water.
 * The party is aboard (it moves with the ship) or ashore (the ship waits where it was left). The tables are
 * ours (Ruxe has no printed seafaring rules in the books we own); the sea monsters come from the monster
 * catalogue. The words the numbers stand for live in the i18n tables (solo.voyage.*).
 */

export const WEATHERS = ['storm', 'fog', 'fair', 'wind', 'calm'] as const;
export type Weather = (typeof WEATHERS)[number];

export type IslandOutcome = 'spring' | 'wreck' | 'nothing' | 'beasts';

/** d6 on an island: 1–2 a freshwater spring, 3 a wreck on the beach, 4–5 nothing, 6 something lives there. */
export function islandOutcome(roll: number): IslandOutcome {
  if (roll <= 2) return 'spring';
  if (roll === 3) return 'wreck';
  return roll <= 5 ? 'nothing' : 'beasts';
}

export interface Voyage {
  ship: Ship;
  day: number;
  hull: number;
  supplies: number;
  /** Today's weather, once the day has been rolled. */
  weather: Weather | null;
  /** The monster of the day's encounter, if there was one. */
  encounter: { monsterId: string; count: number } | null;
  wrecked: boolean;
  level: number;
  /** The hex the ship lies in: a sea hex, or the harbour town it is moored at. */
  at: { q: number; r: number };
  /** The party is on board: it moves with the ship. Ashore, the ship waits at `at`. */
  aboard: boolean;
  /** Hexes the ship can still sail today. */
  moves: number;
  /** Days the crew has gone without food, up to HUNGER_MAX; each costs -1 to every check. */
  hunger: number;
  /** The ships sailing with the flagship (`ship` / `hull`), at most FLEET_MAX - 1. */
  escorts: FleetShip[];
  /** Crates in the holds, one count per good in GOODS order. */
  cargo: number[];
  /** A hostile ship on the water, from sighting to the prize. */
  pursuit: Pursuit | null;
  /** Sailors aboard; null = every ship fully manned (an old voyage, or one that has not lost anyone). */
  crew: number | null;
  /** Sailors on the quay looking for work today: rolled on arrival and each day in port; null at sea (and in an old save, where the quay never runs dry). */
  recruits: number | null;
}

export interface FleetShip {
  ship: Ship;
  hull: number;
}

/** Every ship of the voyage, the flagship first. */
export const fleetOf = (voyage: Voyage): FleetShip[] => [{ ship: voyage.ship, hull: voyage.hull }, ...voyage.escorts];

/** Sailors the living ships need between them. */
export function crewNeeded(voyage: Voyage): number {
  return fleetOf(voyage).reduce((sum, entry) => (entry.hull > 0 ? sum + CREW_NEEDED[entry.ship] : sum), 0);
}

export const crewAboard = (voyage: Voyage): number => voyage.crew ?? crewNeeded(voyage);

export const undermanned = (voyage: Voyage): boolean => crewAboard(voyage) < crewNeeded(voyage);

/** A short-handed fleet fights and sails worse (−2); a full complement gives a steady hand (+1). */
export const crewModifier = (voyage: Voyage): number => (undermanned(voyage) ? -2 : 1);

/** Sailors lost in a fight; the fleet is short-handed until it hires more. */
export function loseCrew(voyage: Voyage, count = 1): Voyage {
  return { ...voyage, crew: Math.max(0, crewAboard(voyage) - Math.max(0, count)) };
}

/** How many sailors can be signed on at this quay today: all that are missing, or fewer when the quay is thin. */
export function hireable(voyage: Voyage): number {
  return Math.max(0, Math.min(crewNeeded(voyage) - crewAboard(voyage), voyage.recruits ?? Infinity));
}

/** Sailors who come looking for work on a day in port: a hamlet or village has few, a town d6, a fortress's garrison town more. Our own table. */
export function quayRecruits(settlement: string | undefined, rng: Rng = Math.random): number {
  if (settlement === 'hamlet' || settlement === 'village') return die(3, rng);
  return settlement === 'fortress' ? die(6, rng) + 2 : die(6, rng);
}

/** Signs sailors on in a harbour, never past what the fleet needs or the quay has today; the fee is the caller's affair. Null when nothing can be hired. */
export function hireCrew(voyage: Voyage, map: HexMap, count: number): Voyage | null {
  const hired = Math.min(Math.floor(count), hireable(voyage));
  if (!inPort(voyage, map) || voyage.wrecked || hired <= 0) return null;
  return { ...voyage, crew: crewAboard(voyage) + hired, recruits: voyage.recruits === null ? null : voyage.recruits - hired };
}

/** Crates the holds of the living ships take. */
export function cargoCapacity(voyage: Voyage): number {
  return fleetOf(voyage).reduce((sum, entry) => (entry.hull > 0 ? sum + CARGO[entry.ship] : sum), 0);
}

export const cargoLoad = (voyage: Voyage): number => voyage.cargo.reduce((sum, units) => sum + units, 0);

/** Cuts the crates down to what the holds take, the last goods first. */
function trimCargo(cargo: number[], capacity: number): number[] {
  let room = capacity;
  return cargo.map((units) => {
    const kept = Math.min(units, room);
    room -= kept;
    return kept;
  });
}

/**
 * Puts a fleet back on the voyage: ships at 0 hull are gone, the first that floats leads, the cargo is cut to
 * what is left. With nothing afloat the voyage is wrecked.
 */
export function withFleet(voyage: Voyage, fleet: FleetShip[]): Voyage {
  const afloat = fleet.filter((entry) => entry.hull > 0);
  if (afloat.length === 0) return { ...voyage, hull: 0, escorts: [], cargo: voyage.cargo.map(() => 0), wrecked: true };
  const [lead, ...rest] = afloat;
  const next = { ...voyage, ship: lead.ship, hull: lead.hull, escorts: rest };
  return { ...next, cargo: trimCargo(next.cargo, cargoCapacity(next)) };
}

export const HUNGER_MAX = 5;
/** What a full hold carries, and what a harbour fills it to. */
export const FULL_SUPPLIES = 9;

const die = (sides: number, rng: Rng): number => 1 + Math.floor(rng() * sides);

/** d6: 1 storm, 2 fog, 3–4 fair, 5 a following wind, 6 calm. */
export function weatherFor(roll: number): Weather {
  if (roll === 1) return 'storm';
  if (roll === 2) return 'fog';
  if (roll <= 4) return 'fair';
  return roll === 5 ? 'wind' : 'calm';
}

/** Days of sailing made good in a day of this weather: a wind doubles it, a storm or a calm loses it. */
export function headway(weather: Weather): number {
  if (weather === 'wind') return 2;
  return weather === 'storm' || weather === 'calm' ? 0 : 1;
}

/** Something rises from the sea on a d6 of this or less: 1 in fair weather, 2 in storm and fog. */
export function encounterThreshold(weather: Weather): number {
  return weather === 'storm' || weather === 'fog' ? 2 : 1;
}

const SEA = /\b(seas?|oceans?|coasts?|coastal|waterfront|shore)\b/i;

/** Monsters of the open water near the party's level; the window widens until one fits. */
export function pickSeaMonster(monsters: Monster[], level: number, rng: Rng = Math.random): Monster | null {
  const sea = monsters.filter((monster) => SEA.test(monster.habitat) && !monster.levelPlus && monster.category !== 'Familiars');
  for (const spread of [2, 3, 5, 99]) {
    const pool = sea.filter((monster) => Math.abs(monster.level - level) <= spread);
    if (pool.length > 0) return pool[Math.floor(rng() * pool.length)];
  }
  return null;
}

/** Puts out from a harbour hex with the ship at its quay: the voyage starts alongside, with that quay's sailors on offer. */
export function setSail(ship: Ship, level: number, from: { q: number; r: number; settlement?: string }, rng: Rng = Math.random): Voyage {
  return {
    ship,
    day: 0,
    hull: HULL[ship],
    supplies: FULL_SUPPLIES,
    weather: null,
    encounter: null,
    wrecked: false,
    level,
    at: { q: from.q, r: from.r },
    aboard: true,
    moves: 0,
    hunger: 0,
    escorts: [],
    cargo: GOODS.map(() => 0),
    pursuit: null,
    crew: null,
    recruits: quayRecruits(from.settlement, rng),
  };
}

export interface DayReport {
  voyage: Voyage;
  /** Hull lost to the storm today. */
  stormDamage: number;
}

/**
 * One day at sea: rolls the weather, which sets the hexes the ship may sail, eats a day's supplies, and may
 * bring a sea monster. A storm tears 1d3 from the hull; at 0 the ship is lost. The markets drift (the caller's
 * affair: driftMarkets in hexmap.ts).
 */
export function sailDay(voyage: Voyage, monsters: Monster[], rng: Rng = Math.random): DayReport {
  if (voyage.wrecked) return { voyage, stormDamage: 0 };
  const weather = weatherFor(die(6, rng));
  // a short-handed crew cannot trim the sails in a storm: one more point off every hull
  const handsShort = undermanned(voyage) ? 1 : 0;
  const stormDamage = weather === 'storm' ? die(3, rng) + handsShort : 0;
  const stormed = fleetOf(voyage).map((entry, index) => ({ ...entry, hull: weather === 'storm' ? entry.hull - (index === 0 ? stormDamage : die(3, rng) + handsShort) : entry.hull }));
  const hunger = voyage.supplies === 0 ? Math.min(HUNGER_MAX, voyage.hunger + 1) : voyage.hunger;
  let encounter: Voyage['encounter'] = null;
  // an old chase is over once it is resolved; an unresolved one follows the fleet and no new sail is sighted
  let pursuit = voyage.pursuit && (voyage.pursuit.state === 'closing' || voyage.pursuit.state === 'grappled') ? voyage.pursuit : null;
  if (!pursuit && die(6, rng) <= encounterThreshold(weather)) {
    // one time in three the sighting is a ship, not a monster
    if (die(3, rng) === 1) pursuit = sightPursuit(monsters, voyage.level, rng);
    if (!pursuit) {
      const monster = pickSeaMonster(monsters, voyage.level, rng);
      if (monster) encounter = { monsterId: monster.id, count: monster.level < voyage.level ? die(2, rng) : 1 };
    }
  }
  const fleeted = withFleet(voyage, stormed);
  return {
    stormDamage,
    voyage: { ...fleeted, day: voyage.day + 1, weather, supplies: Math.max(0, voyage.supplies - 1), hunger, moves: headway(weather), encounter, pursuit, recruits: null },
  };
}

/** A day spent patching the hull: +1d3 points, up to the ship's full strength; supplies still go. */
export function repairDay(voyage: Voyage, rng: Rng = Math.random): Voyage {
  if (voyage.wrecked) return voyage;
  const hunger = voyage.supplies === 0 ? Math.min(HUNGER_MAX, voyage.hunger + 1) : voyage.hunger;
  const mended = withFleet(voyage, fleetOf(voyage).map((entry) => ({ ...entry, hull: entry.hull > 0 ? Math.min(HULL[entry.ship], entry.hull + die(3, rng)) : 0 })));
  return { ...mended, day: voyage.day + 1, weather: null, encounter: null, moves: 0, hunger, supplies: Math.max(0, voyage.supplies - 1) };
}

/** A hull takes a blow (from a monster, a reef or a broadside); the ship is lost at 0. `target` is its place in the fleet, the flagship being 0. */
export function hullBlow(voyage: Voyage, damage: number, target = 0): Voyage {
  const amount = Math.max(0, damage);
  return withFleet(voyage, fleetOf(voyage).map((entry, index) => (index === target ? { ...entry, hull: Math.max(0, entry.hull - amount) } : entry)));
}

// ---- the map ----

export interface SailReport {
  voyage: Voyage;
  map: HexMap;
  /** What the hex the ship moved into did to it. */
  event: 'reef' | 'port' | 'open' | null;
  /** Hull lost to a reef. */
  reefDamage: number;
}

/** Whether the ship can sail into this hex: aboard, next to it, and it is open water or a harbour. */
export function canSailTo(map: HexMap, voyage: Voyage, q: number, r: number): boolean {
  if (!voyage.aboard || voyage.wrecked || hexDistance(voyage.at, { q, r }) !== 1) return false;
  const target = hexAt(map, q, r);
  return !!target && (isWater(target.biome) || isPort(map, target));
}

/** Whether the party, aboard, can step off onto this hex: dry land next to the ship that is no harbour (harbours are sailed into). */
export function canLandAt(map: HexMap, voyage: Voyage, q: number, r: number): boolean {
  if (!voyage.aboard || voyage.wrecked || hexDistance(voyage.at, { q, r }) !== 1) return false;
  const target = hexAt(map, q, r);
  return !!target && !isWater(target.biome) && !isPort(map, target);
}

/** One hex of sailing, if the day's headway allows it. A reef tears 1d3 from every hull; a harbour entered has sailors for hire. */
export function sailTo(voyage: Voyage, map: HexMap, q: number, r: number, rng: Rng = Math.random): SailReport {
  const idle: SailReport = { voyage, map, event: null, reefDamage: 0 };
  if (voyage.moves <= 0 || !canSailTo(map, voyage, q, r)) return idle;
  const target = hexAt(map, q, r) as Hex;
  // leaving a quay leaves its sailors behind; a harbour entered has its own
  let next: Voyage = { ...voyage, at: { q, r }, moves: voyage.moves - 1, encounter: null, recruits: null };
  const moved: HexMap = { ...map, hexes: reveal(map, q, r), party: { q, r } };
  if (target.feature.kind === 'reef') {
    const reefDamage = die(3, rng);
    next = hullBlow(next, reefDamage);
    for (let index = 1; index <= voyage.escorts.length; index += 1) next = hullBlow(next, die(3, rng), 1);
    return { voyage: next, map: moved, event: 'reef', reefDamage };
  }
  if (isPort(map, target)) return { voyage: { ...next, moves: 0, recruits: quayRecruits(target.feature.settlement, rng) }, map: moved, event: 'port', reefDamage: 0 };
  return { voyage: next, map: moved, event: 'open', reefDamage: 0 };
}

/** The hex the ship lies in. */
export const shipHex = (voyage: Voyage, map: HexMap): Hex | undefined => hexAt(map, voyage.at.q, voyage.at.r);

/** Whether the ship lies in a harbour. */
export function inPort(voyage: Voyage, map: HexMap): boolean {
  return isPort(map, shipHex(voyage, map));
}

/** The harbour the ship lies in (its settlement hex), if it lies in one. */
export function harbourHere(voyage: Voyage, map: HexMap): Hex | undefined {
  const here = shipHex(voyage, map);
  return isPort(map, here) ? here : undefined;
}

/** Steps off the ship where it lies in a harbour: the party is in the town, the ship waits at the quay. */
export function goAshore(voyage: Voyage, map: HexMap): Voyage | null {
  return voyage.aboard && inPort(voyage, map) && !voyage.wrecked ? { ...voyage, aboard: false } : null;
}

/** Boards the ship the party stands beside — in the harbour town where it lies. */
export function goAboard(voyage: Voyage, map: HexMap): Voyage | null {
  if (voyage.aboard || voyage.wrecked || map.party.q !== voyage.at.q || map.party.r !== voyage.at.r) return null;
  return { ...voyage, aboard: true };
}

/** Hexes a ship sails in a day on her own, with the crew alone aboard and no one to press her. */
export const CALLED_HEADWAY = 2;

export interface ShipCall {
  voyage: Voyage;
  /** The sea hex (or quay) she comes to. */
  to: { q: number; r: number };
  /** Hexes sailed and days taken. */
  steps: number;
  days: number;
}

/**
 * The shortest way the ship can sail by herself from where she lies to the party's coast: open water and
 * harbours, reefs avoided. The anchorage is the party's own hex when it is a harbour, otherwise a water hex beside it.
 */
function routeToParty(voyage: Voyage, map: HexMap): { to: { q: number; r: number }; steps: number } | null {
  const party = hexAt(map, map.party.q, map.party.r);
  if (!party) return null;
  const goals = isPort(map, party) ? [party] : neighbours(party.q, party.r).map(([q, r]) => hexAt(map, q, r)).filter((hex): hex is Hex => !!hex && isWater(hex.biome) && hex.feature.kind !== 'reef');
  if (goals.length === 0) return null;
  const goal = new Set(goals.map((hex) => hexKey(hex.q, hex.r)));
  const seen = new Set([hexKey(voyage.at.q, voyage.at.r)]);
  let frontier = [{ q: voyage.at.q, r: voyage.at.r }];
  for (let steps = 0; frontier.length > 0; steps += 1) {
    const hit = frontier.find((cell) => goal.has(hexKey(cell.q, cell.r)));
    if (hit) return { to: hit, steps };
    const next: { q: number; r: number }[] = [];
    for (const cell of frontier) {
      for (const [q, r] of neighbours(cell.q, cell.r)) {
        const hex = hexAt(map, q, r);
        if (!hex || seen.has(hexKey(q, r)) || hex.feature.kind === 'reef' || !(isWater(hex.biome) || isPort(map, hex))) continue;
        seen.add(hexKey(q, r));
        next.push({ q, r });
      }
    }
    frontier = next;
  }
  return null;
}

/**
 * The ship, left ashore, sails herself to the party's coast: the nearest anchorage by water, a hex or two a day
 * (CALLED_HEADWAY), the days eaten out of her own stores. The party waits; the caller spends its days and rations.
 * Null when the party is aboard, the ship is lost, she already lies beside the party or there is no water route to the coast.
 */
export function callShip(voyage: Voyage, map: HexMap, rng: Rng = Math.random): ShipCall | null {
  if (voyage.aboard || voyage.wrecked || shipAtParty(voyage, map)) return null;
  const route = routeToParty(voyage, map);
  if (!route || route.steps === 0) return null;
  const days = Math.max(1, Math.ceil(route.steps / CALLED_HEADWAY));
  const arrived = hexAt(map, route.to.q, route.to.r);
  const hungerDays = Math.max(0, days - voyage.supplies);
  return {
    to: route.to,
    steps: route.steps,
    days,
    voyage: {
      ...voyage,
      at: { q: route.to.q, r: route.to.r },
      day: voyage.day + days,
      weather: null,
      encounter: null,
      moves: 0,
      supplies: Math.max(0, voyage.supplies - days),
      hunger: Math.min(HUNGER_MAX, voyage.hunger + hungerDays),
      recruits: arrived && isPort(map, arrived) ? quayRecruits(arrived.feature.settlement, rng) : null,
    },
  };
}

/** Whether the ship lies where the party could step aboard: in the party's own hex, or on a water hex beside it. */
export function shipAtParty(voyage: Voyage, map: HexMap): boolean {
  return hexDistance(voyage.at, map.party) <= 1;
}

/** A day alongside: the hull is mended, the hold filled and the crew fed, a new quay of sailors, but no headway is made. */
export function dayInPort(voyage: Voyage, settlement: string | undefined, rng: Rng = Math.random): Voyage {
  if (voyage.wrecked) return voyage;
  return { ...voyage, recruits: quayRecruits(settlement, rng), day: voyage.day + 1, weather: null, encounter: null, moves: 0, hull: HULL[voyage.ship], escorts: voyage.escorts.map((entry) => ({ ...entry, hull: HULL[entry.ship] })), supplies: FULL_SUPPLIES, hunger: 0 };
}

export interface IslandReport {
  voyage: Voyage;
  map: HexMap;
  outcome: IslandOutcome;
  /** Gold in a wreck's strongbox. */
  gold: number;
}

/** Searching the island the ship lies at, once: a spring (+3 supplies, hunger eased), a wreck (a small hoard), nothing, or beasts. */
export function exploreIsland(voyage: Voyage, map: HexMap, monsters: Monster[], rng: Rng = Math.random): IslandReport | null {
  const here = shipHex(voyage, map);
  if (!here || here.feature.kind !== 'island' || here.explored) return null;
  const outcome = islandOutcome(die(6, rng));
  const marked: HexMap = { ...map, hexes: map.hexes.map((hex) => (hex === here ? { ...hex, explored: true } : hex)) };
  let next: Voyage = voyage;
  let gold = 0;
  if (outcome === 'spring') next = { ...next, supplies: Math.min(FULL_SUPPLIES, next.supplies + 3), hunger: Math.max(0, next.hunger - 1) };
  if (outcome === 'wreck') gold = hoard(voyage.level, 1, rng);
  if (outcome === 'beasts') {
    const monster = pickSeaMonster(monsters, voyage.level, rng);
    if (monster) next = { ...next, encounter: { monsterId: monster.id, count: monster.level < voyage.level ? die(2, rng) : 1 } };
  }
  return { voyage: next, map: marked, outcome: outcome === 'beasts' && !next.encounter ? 'nothing' : outcome, gold };
}

// ---- a monster against the ship ----

export interface ShipAttack {
  attack: MonsterAttackRoll;
  evasion: EvasionRoll;
  hit: boolean;
  damage: MonsterDamageRoll | null;
  /** Hull points the blow takes: a fifth of the damage rolled, at least one. */
  hullLost: number;
  voyage: Voyage;
}

/** What a monster's damage does to a hull: one point to the five, never less than one. */
export function hullDamageFrom(damage: number): number {
  return Math.max(1, Math.ceil(damage / 5));
}

/**
 * A sea monster strikes at the ship: its Accuracy check against the ship's Evasion (rolled, or fixed at Evasion + 7),
 * and on a hit its damage roll costs the hull a fifth of the total.
 */
export function attackShip(voyage: Voyage, section: MonsterSection, fixed: boolean, rng: Rng = Math.random, target = 0): ShipAttack | null {
  const attack = rollMonsterAttack(section, fixed, rng);
  if (!attack) return null;
  const evasion = rollEvasion(SHIP_EVASION[fleetOf(voyage)[target]?.ship ?? voyage.ship], fixed, rng);
  const hit = fixed ? attackHits(attack, evasion.value) : resolveAttack(attack, evasion);
  const damage = hit ? rollMonsterDamage(section, fixed, rng) : null;
  const hullLost = damage ? hullDamageFrom(damage.total) : 0;
  return { attack, evasion, hit, damage, hullLost, voyage: hullLost > 0 ? loseCrew(hullBlow(voyage, hullLost, target), 1) : voyage };
}

// ---- a fleet and its cargo ----

/** A hull bought at the quay joins the fleet at full strength; the fleet holds FLEET_MAX ships at most. */
export function addShip(voyage: Voyage, map: HexMap, ship: Ship): Voyage | null {
  if (!inPort(voyage, map) || voyage.wrecked || voyage.escorts.length + 1 >= FLEET_MAX) return null;
  // the new hull comes without sailors: pin the crew at what it is now, and the fleet is short-handed until it hires
  return { ...voyage, crew: crewAboard(voyage), escorts: [...voyage.escorts, { ship, hull: HULL[ship] }] };
}

/** Loads crates of one good (GOODS index) if the holds take them; the price is the caller's affair. */
export function loadGoods(voyage: Voyage, good: number, units: number): Voyage | null {
  if (good < 0 || good >= GOODS.length || units <= 0 || cargoLoad(voyage) + units > cargoCapacity(voyage)) return null;
  return { ...voyage, cargo: voyage.cargo.map((held, index) => (index === good ? held + units : held)) };
}

/** Unloads crates of one good if that many are aboard. */
export function unloadGoods(voyage: Voyage, good: number, units: number): Voyage | null {
  if (good < 0 || good >= GOODS.length || units <= 0 || (voyage.cargo[good] ?? 0) < units) return null;
  return { ...voyage, cargo: voyage.cargo.map((held, index) => (index === good ? held - units : held)) };
}

/** A ship taken in a boarding joins the fleet if there is room; the crates found are stowed as far as the holds allow. */
export function claimPrize(voyage: Voyage, prize: { goods: number[]; ship: FleetShip | null }): Voyage {
  let next: Voyage = voyage.pursuit ? { ...voyage, pursuit: { ...voyage.pursuit, state: 'taken' } } : voyage;
  if (prize.ship && next.escorts.length + 1 < FLEET_MAX) next = { ...next, crew: crewAboard(next), escorts: [...next.escorts, prize.ship] };
  prize.goods.forEach((units, good) => {
    const room = cargoCapacity(next) - cargoLoad(next);
    if (units > 0 && room > 0) next = loadGoods(next, good, Math.min(units, room)) ?? next;
  });
  return next;
}

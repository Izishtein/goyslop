import type { Monster, MonsterSection } from '../data/monsters/types';
import { sightPursuit, type Pursuit } from './boarding';
import { hoard } from './dungeon';
import { attackHits, resolveAttack, rollEvasion, rollMonsterAttack, rollMonsterDamage, type EvasionRoll, type MonsterAttackRoll, type MonsterDamageRoll, type Rng } from './encounter';
import { hexDistance } from './hexmap';
import { generateSeaMap, isDestination, islandOutcome, markExplored, seaHexAt, stepShip, type IslandOutcome, type SeaMap } from './seamap';
import { CARGO, FLEET_MAX, GOODS, HULL, SHIP_EVASION, SHIPS, type Ship } from './ships';

export { HULL, SHIP_EVASION, SHIPS, type Ship };

/*
 * Sea voyages. A voyage is a number of days to the far port; each day the weather is rolled, the ship
 * makes headway or not, and something may rise from the water. The tables are ours (Ruxe has no printed
 * seafaring rules in the books we own); the sea monsters come from the monster catalogue. The words the
 * numbers stand for live in the i18n tables (solo.voyage.*).
 */

export const WEATHERS = ['storm', 'fog', 'fair', 'wind', 'calm'] as const;
export type Weather = (typeof WEATHERS)[number];

export interface Voyage {
  ship: Ship;
  /** Days of fair sailing to the far port. */
  distance: number;
  progress: number;
  day: number;
  hull: number;
  supplies: number;
  /** Today's weather, once the day has been rolled. */
  weather: Weather | null;
  /** The monster of the day's encounter, if there was one. */
  encounter: { monsterId: string; count: number } | null;
  arrived: boolean;
  wrecked: boolean;
  level: number;
  /** The chart, once the ship has one; a voyage without it is the old bare count of days. */
  sea: SeaMap | null;
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
  /** The hex of the land map the voyage left from ("q,r"), when it began at a settlement. */
  homeHex: string | null;
}

export interface FleetShip {
  ship: Ship;
  hull: number;
}

/** Every ship of the voyage, the flagship first. */
export const fleetOf = (voyage: Voyage): FleetShip[] => [{ ship: voyage.ship, hull: voyage.hull }, ...voyage.escorts];

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

export function setSail(ship: Ship, level: number, rng: Rng = Math.random, from?: { homeHex?: string; homeSettlement?: string }): Voyage {
  const sea = generateSeaMap(rng, from?.homeSettlement);
  const distance = hexDistance(sea.origin, sea.destination);
  return { ship, distance, progress: 0, day: 0, hull: HULL[ship], supplies: FULL_SUPPLIES, weather: null, encounter: null, arrived: false, wrecked: false, level, sea, moves: 0, hunger: 0, escorts: [], cargo: GOODS.map(() => 0), pursuit: null, homeHex: from?.homeHex ?? null };
}

export interface DayReport {
  voyage: Voyage;
  /** Hull lost to the storm today. */
  stormDamage: number;
}

/**
 * One day at sea: rolls the weather, makes headway, eats a day's supplies, and may bring a sea monster.
 * A storm tears 1d3 from the hull; at 0 the ship is lost. Reaching the distance ends the voyage.
 */
export function sailDay(voyage: Voyage, monsters: Monster[], rng: Rng = Math.random): DayReport {
  if (voyage.arrived || voyage.wrecked) return { voyage, stormDamage: 0 };
  const weather = weatherFor(die(6, rng));
  const stormDamage = weather === 'storm' ? die(3, rng) : 0;
  const stormed = fleetOf(voyage).map((entry, index) => ({ ...entry, hull: weather === 'storm' ? entry.hull - (index === 0 ? stormDamage : die(3, rng)) : entry.hull }));
  const progress = voyage.sea ? voyage.progress : Math.min(voyage.distance, voyage.progress + headway(weather));
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
    voyage: { ...fleeted, day: voyage.day + 1, weather, progress, supplies: Math.max(0, voyage.supplies - 1), hunger, moves: voyage.sea ? headway(weather) : 0, encounter, pursuit, arrived: !voyage.sea && !fleeted.wrecked && progress >= voyage.distance },
  };
}

/** A day spent patching the hull: +1d3 points, up to the ship's full strength; supplies still go. */
export function repairDay(voyage: Voyage, rng: Rng = Math.random): Voyage {
  if (voyage.arrived || voyage.wrecked) return voyage;
  const hunger = voyage.supplies === 0 ? Math.min(HUNGER_MAX, voyage.hunger + 1) : voyage.hunger;
  const mended = withFleet(voyage, fleetOf(voyage).map((entry) => ({ ...entry, hull: entry.hull > 0 ? Math.min(HULL[entry.ship], entry.hull + die(3, rng)) : 0 })));
  return { ...mended, day: voyage.day + 1, weather: null, encounter: null, moves: 0, hunger, supplies: Math.max(0, voyage.supplies - 1) };
}

/** A hull takes a blow (from a monster, a reef or a broadside); the ship is lost at 0. `target` is its place in the fleet, the flagship being 0. */
export function hullBlow(voyage: Voyage, damage: number, target = 0): Voyage {
  const amount = Math.max(0, damage);
  return withFleet(voyage, fleetOf(voyage).map((entry, index) => (index === target ? { ...entry, hull: Math.max(0, entry.hull - amount) } : entry)));
}

// ---- the chart ----

export interface SailReport {
  voyage: Voyage;
  /** What the hex the ship moved into did to it. */
  event: 'reef' | 'port' | 'home' | 'arrived' | 'open' | null;
  /** Hull lost to a reef. */
  reefDamage: number;
}

/** One hex of the chart, if the day's headway allows it. A reef tears 1d3 from the hull; the far port ends the voyage. */
export function sailTo(voyage: Voyage, q: number, r: number, rng: Rng = Math.random): SailReport {
  if (!voyage.sea || voyage.moves <= 0 || voyage.arrived || voyage.wrecked) return { voyage, event: null, reefDamage: 0 };
  const step = stepShip(voyage.sea, q, r);
  if (!step) return { voyage, event: null, reefDamage: 0 };
  let next: Voyage = { ...voyage, sea: step.map, moves: voyage.moves - 1, encounter: null };
  if (step.hex.kind === 'reef') {
    const reefDamage = die(3, rng);
    next = hullBlow(next, reefDamage);
    for (let index = 1; index <= voyage.escorts.length; index += 1) next = hullBlow(next, die(3, rng), 1);
    return { voyage: next, event: 'reef', reefDamage };
  }
  if (step.hex.kind === 'port') {
    if (isDestination(step.map, step.hex)) return { voyage: { ...next, arrived: true, moves: 0 }, event: 'arrived', reefDamage: 0 };
    const home = hexDistance(step.hex, step.map.origin) === 0;
    return { voyage: { ...next, moves: 0 }, event: home ? 'home' : 'port', reefDamage: 0 };
  }
  return { voyage: next, event: 'open', reefDamage: 0 };
}

/** Whether the ship lies in a harbour. */
export function inPort(voyage: Voyage): boolean {
  const here = voyage.sea ? seaHexAt(voyage.sea, voyage.sea.ship.q, voyage.sea.ship.r) : undefined;
  return here?.kind === 'port';
}

/** A day alongside: the hull is mended, the hold filled and the crew fed, but no headway is made. */
export function dayInPort(voyage: Voyage): Voyage {
  if (!inPort(voyage) || voyage.wrecked || voyage.arrived) return voyage;
  return { ...voyage, day: voyage.day + 1, weather: null, encounter: null, moves: 0, hull: HULL[voyage.ship], escorts: voyage.escorts.map((entry) => ({ ...entry, hull: HULL[entry.ship] })), supplies: FULL_SUPPLIES, hunger: 0 };
}

export interface IslandReport {
  voyage: Voyage;
  outcome: IslandOutcome;
  /** Gold in a wreck's strongbox. */
  gold: number;
}

/** Searching the island the ship lies at, once: a spring (+3 supplies, hunger eased), a wreck (a small hoard), nothing, or beasts. */
export function exploreIsland(voyage: Voyage, monsters: Monster[], rng: Rng = Math.random): IslandReport | null {
  const sea = voyage.sea;
  const here = sea ? seaHexAt(sea, sea.ship.q, sea.ship.r) : undefined;
  if (!sea || !here || here.kind !== 'island' || here.explored) return null;
  const outcome = islandOutcome(die(6, rng));
  let next: Voyage = { ...voyage, sea: markExplored(sea, here.q, here.r) };
  let gold = 0;
  if (outcome === 'spring') next = { ...next, supplies: Math.min(FULL_SUPPLIES, next.supplies + 3), hunger: Math.max(0, next.hunger - 1) };
  if (outcome === 'wreck') gold = hoard(voyage.level, 1, rng);
  if (outcome === 'beasts') {
    const monster = pickSeaMonster(monsters, voyage.level, rng);
    if (monster) next = { ...next, encounter: { monsterId: monster.id, count: monster.level < voyage.level ? die(2, rng) : 1 } };
  }
  return { voyage: next, outcome: outcome === 'beasts' && !next.encounter ? 'nothing' : outcome, gold };
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
  return { attack, evasion, hit, damage, hullLost, voyage: hullLost > 0 ? hullBlow(voyage, hullLost, target) : voyage };
}

// ---- a fleet and its cargo ----

/** The harbour the ship lies in, if it lies in one. */
export function harbourHere(voyage: Voyage) {
  const here = voyage.sea ? seaHexAt(voyage.sea, voyage.sea.ship.q, voyage.sea.ship.r) : undefined;
  return here?.kind === 'port' ? here : undefined;
}

/** A hull bought at the quay joins the fleet at full strength; the fleet holds FLEET_MAX ships at most. */
export function addShip(voyage: Voyage, ship: Ship): Voyage | null {
  if (!inPort(voyage) || voyage.wrecked || voyage.arrived || voyage.escorts.length + 1 >= FLEET_MAX) return null;
  return { ...voyage, escorts: [...voyage.escorts, { ship, hull: HULL[ship] }] };
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
  if (prize.ship && next.escorts.length + 1 < FLEET_MAX) next = { ...next, escorts: [...next.escorts, prize.ship] };
  prize.goods.forEach((units, good) => {
    const room = cargoCapacity(next) - cargoLoad(next);
    if (units > 0 && room > 0) next = loadGoods(next, good, Math.min(units, room)) ?? next;
  });
  return next;
}

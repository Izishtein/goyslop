import type { Monster } from '../data/monsters/types';
import { hoard } from './dungeon';
import type { Rng } from './encounter';
import { GOODS, HULL, SHIP_EVASION, SHIP_GUNS, type Ship } from './ships';

/*
 * A hostile ship on the water and the fight for it: broadsides while it closes, then grappling and a
 * boarding fight on the table, then the prize. The crew come from the monster catalogue (Humanoids). The
 * tables are ours. Every exchange is one action of the round; the panel applies hull damage to the fleet.
 */

export const PURSUIT_STATES = ['closing', 'grappled', 'sunk', 'fled', 'taken'] as const;
export type PursuitState = (typeof PURSUIT_STATES)[number];

export interface Pursuit {
  /** The hostile ship. */
  ship: Ship;
  hull: number;
  /** Its crew: a catalogue monster and how many of them are aboard. */
  crewId: string;
  crewCount: number;
  crewLevel: number;
  state: PursuitState;
  round: number;
}

const die = (sides: number, rng: Rng): number => 1 + Math.floor(rng() * sides);

/** A ship the size of the party's means: a boat for the lowest levels, a cog to level 7, a galleon beyond. */
export function pursuitShip(level: number): Ship {
  if (level <= 3) return 'boat';
  return level <= 7 ? 'cog' : 'galleon';
}

/** Humanoid crews near the party's level; the window widens until someone fits. */
export function pickCrew(monsters: Monster[], level: number, rng: Rng = Math.random): Monster | null {
  const crews = monsters.filter((monster) => monster.category === 'Humanoids' && monster.level >= 1 && !monster.levelPlus);
  for (const spread of [1, 2, 4, 99]) {
    const pool = crews.filter((monster) => Math.abs(monster.level - level) <= spread);
    if (pool.length > 0) return pool[Math.floor(rng() * pool.length)];
  }
  return null;
}

/** A sail on the horizon: a hostile ship of the right size with a crew of 3–6 (2d3 + 1 for a galleon). */
export function sightPursuit(monsters: Monster[], level: number, rng: Rng = Math.random): Pursuit | null {
  const crew = pickCrew(monsters, level, rng);
  if (!crew) return null;
  const ship = pursuitShip(level);
  const count = 2 + die(3, rng) + (ship === 'galleon' ? 1 : 0);
  return { ship, hull: HULL[ship], crewId: crew.id, crewCount: count, crewLevel: crew.level, state: 'closing', round: 0 };
}

export interface Exchange {
  dice: [number, number];
  value: number;
  /** What the roll had to reach. */
  target: number;
  hit: boolean;
  /** Hull points the volley takes off the target ship (0 on a miss). */
  damage: number;
}

/** A broadside: 2d6 + level against 8 + the target's Evasion; double 6s hit, double 1s miss. Damage 1d3 + the gunnery of the firing ship. */
function broadside(level: number, from: Ship, to: Ship, rng: Rng): Exchange {
  const dice: [number, number] = [die(6, rng), die(6, rng)];
  const sum = dice[0] + dice[1];
  const value = sum + level;
  const target = 8 + SHIP_EVASION[to];
  const hit = sum === 12 ? true : sum === 2 ? false : value >= target;
  return { dice, value, target, hit, damage: hit ? die(3, rng) + SHIP_GUNS[from] : 0 };
}

/** Our broadside at the hostile ship; its hull falls and at 0 it sinks (crew and cargo with it). */
export function ourVolley(pursuit: Pursuit, ours: Ship, level: number, rng: Rng = Math.random): { pursuit: Pursuit; exchange: Exchange } {
  if (pursuit.state !== 'closing') return { pursuit, exchange: { dice: [0, 0], value: 0, target: 0, hit: false, damage: 0 } };
  const exchange = broadside(level, ours, pursuit.ship, rng);
  const hull = Math.max(0, pursuit.hull - exchange.damage);
  return { pursuit: { ...pursuit, hull, round: pursuit.round + 1, state: hull === 0 ? 'sunk' : pursuit.state }, exchange };
}

/** Their broadside at one of ours; the caller puts the damage on that ship. */
export function theirVolley(pursuit: Pursuit, ours: Ship, rng: Rng = Math.random): Exchange {
  return broadside(pursuit.crewLevel, pursuit.ship, ours, rng);
}

export interface Contest {
  dice: [number, number];
  value: number;
  target: number;
  success: boolean;
}

/** Grappling hooks: 2d6 + level against 9, -2 in a storm, +1 in a calm. Success locks the ships and the crew is boarded. */
export function grapple(pursuit: Pursuit, level: number, weather: string | null, rng: Rng = Math.random): { pursuit: Pursuit; contest: Contest } {
  const dice: [number, number] = [die(6, rng), die(6, rng)];
  const sum = dice[0] + dice[1];
  const modifier = weather === 'storm' ? -2 : weather === 'calm' ? 1 : 0;
  const value = sum + level + modifier;
  const success = sum === 12 ? true : sum === 2 ? false : value >= 9;
  return { pursuit: { ...pursuit, round: pursuit.round + 1, state: success ? 'grappled' : pursuit.state }, contest: { dice, value, target: 9, success } };
}

/** Breaking away: 2d6 + 2 per hex of headway left today against 9; with none left it is a 2d6 against 12. */
export function breakAway(pursuit: Pursuit, moves: number, rng: Rng = Math.random): { pursuit: Pursuit; contest: Contest } {
  const dice: [number, number] = [die(6, rng), die(6, rng)];
  const sum = dice[0] + dice[1];
  const target = moves > 0 ? 9 : 12;
  const value = sum + 2 * moves;
  const success = sum === 12 ? true : sum === 2 ? false : value >= target;
  return { pursuit: { ...pursuit, state: success ? 'fled' : pursuit.state, round: pursuit.round + 1 }, contest: { dice, value, target, success } };
}

export interface Prize {
  gold: number;
  /** Crates of each good found in the hold, in GOODS order. */
  goods: number[];
  /** The ship itself, if it floats. */
  ship: { ship: Ship; hull: number } | null;
}

/** What the boarding party finds once the deck is theirs: a strongbox, a few crates and, if it floats, the ship. */
export function takePrize(pursuit: Pursuit, level: number, rng: Rng = Math.random): Prize {
  const goods = GOODS.map(() => 0);
  for (let i = 0, crates = die(6, rng); i < crates; i += 1) goods[Math.floor(rng() * GOODS.length)] += 1;
  return {
    gold: hoard(level, 1, rng),
    goods,
    ship: pursuit.hull > 0 ? { ship: pursuit.ship, hull: Math.max(1, Math.ceil(pursuit.hull / 2)) } : null,
  };
}

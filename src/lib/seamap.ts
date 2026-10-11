import type { Rng } from './encounter';
import { DIRECTIONS, hexDistance, hexKey } from './hexmap';
import { GOODS } from './ships';

/*
 * The chart of a voyage: a disc of 37 hexes of water with the home port at one edge and the far port at the
 * other, islands to land on, reefs to steer around and, sometimes, a harbour between. Our own tables. The
 * chart is fogged: the hexes beside the ship are seen, what lies in them is known once the ship is there.
 */

export const SEA_KINDS = ['water', 'port', 'island', 'reef'] as const;
export type SeaKind = (typeof SEA_KINDS)[number];

export const SEA_RADIUS = 3;
/** How many names the i18n tables hold for ports and islands (solo.voyage.ports / solo.voyage.islands). */
export const SEA_NAME_COUNT = 8;

export interface SeaHex {
  q: number;
  r: number;
  kind: SeaKind;
  /** Index into the port / island names (1…SEA_NAME_COUNT). */
  name?: number;
  seen: boolean;
  visited: boolean;
  /** An island already searched. */
  explored?: boolean;
  /** A harbour's market: one d6 per good (GOODS order), read through priceFactor. */
  market?: number[];
  /** The kind of settlement ashore (hamlet … monastery), which sets the map of its streets. */
  settlement?: string;
}

export interface SeaMap {
  hexes: SeaHex[];
  ship: { q: number; r: number };
  origin: { q: number; r: number };
  destination: { q: number; r: number };
}

const die = (sides: number, rng: Rng): number => 1 + Math.floor(rng() * sides);
const pick = <T>(items: T[], rng: Rng): T => items[Math.floor(rng() * items.length)];

/** What stands ashore at a harbour: d6, 1–2 a village, 3–5 a town, 6 a fortress. */
function harbourTown(roll: number): string {
  if (roll <= 2) return 'village';
  return roll <= 5 ? 'town' : 'fortress';
}

/** A harbour's fields: its name, the town ashore and the market's price rolls. */
function harbour(rng: Rng, settlement?: string): Partial<SeaHex> {
  return { kind: 'port', name: die(SEA_NAME_COUNT, rng), settlement: settlement ?? harbourTown(die(6, rng)), market: GOODS.map(() => die(6, rng)) };
}

/**
 * A day passes in the markets: each good's d6 slips one step with a die of 1 (cheaper) or 6 (dearer), and
 * stays put otherwise, so prices wander slowly and a trader can profit from a long haul.
 */
export function driftMarkets(map: SeaMap, rng: Rng = Math.random): SeaMap {
  return {
    ...map,
    hexes: map.hexes.map((hex) => {
      if (!hex.market) return hex;
      return {
        ...hex,
        market: hex.market.map((roll) => {
          const d = die(6, rng);
          return d === 1 ? Math.max(1, roll - 1) : d === 6 ? Math.min(6, roll + 1) : roll;
        }),
      };
    }),
  };
}

export function seaHexAt(map: SeaMap, q: number, r: number): SeaHex | undefined {
  return map.hexes.find((hex) => hex.q === q && hex.r === r);
}

/** The ship can sail to this hex: it is on the chart and next to the ship. */
export function canSailTo(map: SeaMap, q: number, r: number): boolean {
  return hexDistance(map.ship, { q, r }) === 1 && seaHexAt(map, q, r) !== undefined;
}

/** Hexes beside the one the ship is in: seen, though not yet known. */
function lightNeighbours(hexes: SeaHex[], at: { q: number; r: number }): SeaHex[] {
  return hexes.map((hex) => (hexDistance(at, hex) <= 1 ? { ...hex, seen: true } : hex));
}

/**
 * A fresh chart. The origin is a corner of the disc, the far port the opposite corner; one time in two a third
 * harbour lies in the middle ring; 3–4 islands and 3–4 reefs are scattered over the rest, never touching the two
 * main ports, so a clear way always exists.
 */
export function generateSeaMap(rng: Rng = Math.random, homeSettlement?: string): SeaMap {
  const corners = DIRECTIONS.map(([dq, dr]) => ({ q: dq * SEA_RADIUS, r: dr * SEA_RADIUS }));
  const side = Math.floor(rng() * 3);
  const origin = corners[side];
  const destination = corners[side + 3];
  const hexes: SeaHex[] = [];
  for (let q = -SEA_RADIUS; q <= SEA_RADIUS; q += 1) {
    for (let r = Math.max(-SEA_RADIUS, -q - SEA_RADIUS); r <= Math.min(SEA_RADIUS, -q + SEA_RADIUS); r += 1) {
      hexes.push({ q, r, kind: 'water', seen: false, visited: false });
    }
  }
  const set = (q: number, r: number, change: Partial<SeaHex>) => {
    const index = hexes.findIndex((hex) => hex.q === q && hex.r === r);
    hexes[index] = { ...hexes[index], ...change };
  };
  set(origin.q, origin.r, { ...harbour(rng, homeSettlement), visited: true });
  set(destination.q, destination.r, harbour(rng));

  const free = () => hexes.filter((hex) => hex.kind === 'water' && hexDistance(hex, origin) > 1 && hexDistance(hex, destination) > 1);
  if (die(2, rng) === 1) {
    const spot = pick(free().filter((hex) => hexDistance(hex, { q: 0, r: 0 }) <= 2), rng);
    set(spot.q, spot.r, harbour(rng));
  }
  for (let i = 0, count = 3 + die(2, rng) - 1; i < count; i += 1) {
    const hex = pick(free(), rng);
    set(hex.q, hex.r, { kind: 'island', name: die(SEA_NAME_COUNT, rng) });
  }
  for (let i = 0, count = 3 + die(2, rng) - 1; i < count; i += 1) {
    const hex = pick(free(), rng);
    set(hex.q, hex.r, { kind: 'reef' });
  }
  return { hexes: lightNeighbours(hexes, origin), ship: { ...origin }, origin, destination };
}

export interface SeaStep {
  map: SeaMap;
  /** The hex the ship moved into. */
  hex: SeaHex;
}

/** The ship moves into a neighbouring hex: it is visited and the hexes around it are seen. Null if it cannot. */
export function stepShip(map: SeaMap, q: number, r: number): SeaStep | null {
  if (!canSailTo(map, q, r)) return null;
  const lit = lightNeighbours(map.hexes, { q, r }).map((hex) => (hex.q === q && hex.r === r ? { ...hex, visited: true } : hex));
  const next = { ...map, hexes: lit, ship: { q, r } };
  return { map: next, hex: seaHexAt(next, q, r) as SeaHex };
}

export function markExplored(map: SeaMap, q: number, r: number): SeaMap {
  return { ...map, hexes: map.hexes.map((hex) => (hex.q === q && hex.r === r ? { ...hex, explored: true } : hex)) };
}

export const isPort = (hex: SeaHex | undefined): boolean => hex?.kind === 'port';
export const isDestination = (map: SeaMap, hex: SeaHex): boolean => hex.q === map.destination.q && hex.r === map.destination.r;

export type IslandOutcome = 'spring' | 'wreck' | 'nothing' | 'beasts';

/** d6 on an island: 1–2 a freshwater spring, 3 a wreck on the beach, 4–5 nothing, 6 something lives there. */
export function islandOutcome(roll: number): IslandOutcome {
  if (roll <= 2) return 'spring';
  if (roll === 3) return 'wreck';
  return roll <= 5 ? 'nothing' : 'beasts';
}

export { hexKey };

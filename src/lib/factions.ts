import type { Monster } from '../data/monsters/types';
import type { Rng } from './encounter';
import { hexDistance, hexKey, neighbours, type Hex, type HexMap } from './hexmap';

/*
 * Factions of the hex sandbox: who holds which hexes, and how they get on. Our own procedure in the
 * common shape of such generators — big seats claim a ring of hexes, small ones their own and the
 * villages beside them; claims that overlap may be one realm or a contested border; neighbours
 * get a relationship. The numbers are ours.
 */

export type SeatKind = 'fortress' | 'town' | 'tower' | 'monastery' | 'lair';

export interface Seat {
  kind: SeatKind;
  q: number;
  r: number;
  /** The creature of a lair. */
  monsterId?: string;
}

export interface Faction {
  id: number;
  /** One seat, or several when claims merged into one realm. */
  seats: Seat[];
  /** The hexes ("q,r") the faction holds, contested ones included. */
  domain: string[];
}

export const RELATIONS = ['war', 'hostile', 'wary', 'trade', 'alliance'] as const;
export type Relation = (typeof RELATIONS)[number];

export interface RelationEntry {
  a: number;
  b: number;
  relation: Relation;
}

const die = (sides: number, rng: Rng): number => 1 + Math.floor(rng() * sides);

/** d10 between neighbouring factions: 1 war, 2–3 hostile, 4–7 wary indifference, 8–9 trade, 10 alliance. */
export function relationFor(roll: number): Relation {
  if (roll === 1) return 'war';
  if (roll <= 3) return 'hostile';
  if (roll <= 7) return 'wary';
  if (roll <= 9) return 'trade';
  return 'alliance';
}

/** Whether two claims that overlap are one realm: d6, 4–6. */
export const sameRealm = (roll: number): boolean => roll >= 4;

const BIG: SeatKind[] = ['fortress', 'town'];

/** Which feature of a hex makes a seat, if any. Only lairs of thinking monsters (Intelligence Average or High) do. */
export function seatOf(hex: Hex, monsters: Map<string, Monster>): Seat | null {
  const { feature } = hex;
  if (feature.kind === 'settlement' && feature.settlement && ['fortress', 'town', 'tower', 'monastery'].includes(feature.settlement)) {
    return { kind: feature.settlement as SeatKind, q: hex.q, r: hex.r };
  }
  if (feature.kind === 'lair' && feature.monsterId) {
    const monster = monsters.get(feature.monsterId);
    if (monster && ['Average', 'High'].includes(monster.intelligence)) return { kind: 'lair', q: hex.q, r: hex.r, monsterId: feature.monsterId };
  }
  return null;
}

function claim(seat: Seat, hexes: Map<string, Hex>): string[] {
  const own = hexKey(seat.q, seat.r);
  const around = neighbours(seat.q, seat.r)
    .map(([q, r]) => hexes.get(hexKey(q, r)))
    .filter((hex): hex is Hex => hex !== undefined);
  if (BIG.includes(seat.kind)) return [own, ...around.map((hex) => hexKey(hex.q, hex.r))];
  if (seat.kind === 'lair') return [own];
  // a tower or monastery: its own hex and the hamlets and villages beside it
  return [own, ...around.filter((hex) => hex.feature.kind === 'settlement' && ['hamlet', 'village'].includes(hex.feature.settlement ?? '')).map((hex) => hexKey(hex.q, hex.r))];
}

/** Two factions border each other when a hex of one is, or is next to, a hex of the other. */
export function borders(a: Faction, b: Faction): boolean {
  return a.domain.some((ka) =>
    b.domain.some((kb) => {
      const [qa, ra] = ka.split(',').map(Number);
      const [qb, rb] = kb.split(',').map(Number);
      return hexDistance({ q: qa, r: ra }, { q: qb, r: rb }) <= 1;
    }),
  );
}

export function generateFactions(hexes: Hex[], monsters: Map<string, Monster>, rng: Rng = Math.random): { factions: Faction[]; relations: RelationEntry[] } {
  const byKey = new Map(hexes.map((hex) => [hexKey(hex.q, hex.r), hex]));
  const seats = hexes.flatMap((hex) => {
    const seat = seatOf(hex, monsters);
    return seat ? [seat] : [];
  });
  const claims = seats.map((seat) => claim(seat, byKey));

  // Union-find over the seats: overlapping claims of the same sort may turn out one realm.
  const parent = seats.map((_, index) => index);
  const find = (i: number): number => (parent[i] === i ? i : (parent[i] = find(parent[i])));
  for (let a = 0; a < seats.length; a += 1) {
    for (let b = a + 1; b < seats.length; b += 1) {
      const overlap = claims[a].some((key) => claims[b].includes(key));
      const adjacentLairs = seats[a].kind === 'lair' && seats[b].kind === 'lair' && seats[a].monsterId === seats[b].monsterId && hexDistance(seats[a], seats[b]) === 1;
      const bothBig = BIG.includes(seats[a].kind) && BIG.includes(seats[b].kind);
      if ((overlap && bothBig) || adjacentLairs) {
        if (sameRealm(die(6, rng))) parent[find(b)] = find(a);
      }
    }
  }

  const groups = new Map<number, number[]>();
  seats.forEach((_, index) => groups.set(find(index), [...(groups.get(find(index)) ?? []), index]));
  const factions: Faction[] = [...groups.values()].map((members, id) => ({
    id: id + 1,
    seats: members.map((index) => seats[index]),
    domain: [...new Set(members.flatMap((index) => claims[index]))],
  }));

  // Neighbours — claims that overlap or touch — get a relationship, once per pair.
  const relations: RelationEntry[] = [];
  for (let a = 0; a < factions.length; a += 1) {
    for (let b = a + 1; b < factions.length; b += 1) {
      if (borders(factions[a], factions[b])) relations.push({ a: factions[a].id, b: factions[b].id, relation: relationFor(die(10, rng)) });
    }
  }
  return { factions, relations };
}

/**
 * The factions of a freshly added patch: its own seats and claims (clipped to the patch), numbered after
 * the existing ones, and a relationship rolled for every new faction that borders another.
 */
export function addPatchFactions(map: HexMap, added: Hex[], monsters: Monster[], rng: Rng = Math.random): HexMap {
  const fresh = generateFactions(added, new Map(monsters.map((monster) => [monster.id, monster])), rng);
  const offset = map.factions.reduce((max, faction) => Math.max(max, faction.id), 0);
  const factions = fresh.factions.map((faction) => ({ ...faction, id: faction.id + offset }));
  const relations = [...map.relations, ...fresh.relations.map((entry) => ({ ...entry, a: entry.a + offset, b: entry.b + offset }))];
  for (const incoming of factions) {
    for (const existing of map.factions) {
      if (borders(incoming, existing)) relations.push({ a: existing.id, b: incoming.id, relation: relationFor(die(10, rng)) });
    }
  }
  return { ...map, factions: [...map.factions, ...factions], relations };
}

/** The map with its factions worked out from the features its hexes already have. */
export function withFactions(map: HexMap, monsters: Monster[], rng: Rng = Math.random): HexMap {
  return { ...map, ...generateFactions(map.hexes, new Map(monsters.map((monster) => [monster.id, monster])), rng) };
}

/** The factions that hold a hex: none, one, or several when it is contested. */
export function factionsAt(factions: Faction[], q: number, r: number): Faction[] {
  const key = hexKey(q, r);
  return factions.filter((faction) => faction.domain.includes(key));
}

// ---- events ----

export const EVENT_COUNT = 12;
export type EventTiming = 'ended' | 'now' | 'future';

/** d6: 1 it ended earlier, 2–4 it is happening now, 5–6 it is still to come. */
export function eventTiming(roll: number): EventTiming {
  if (roll === 1) return 'ended';
  return roll <= 4 ? 'now' : 'future';
}

export interface FactionEvent {
  event: number;
  timing: EventTiming;
}

export function rollFactionEvent(rng: Rng = Math.random): FactionEvent {
  return { event: die(EVENT_COUNT, rng), timing: eventTiming(die(6, rng)) };
}

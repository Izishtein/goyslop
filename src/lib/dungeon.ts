import type { Monster } from '../data/monsters/types';
import type { Rng } from './encounter';
import { relationFor, type Relation } from './factions';
import { packSize, pickMonster, type Biome } from './hexmap';

/*
 * The dungeon generator. A dungeon is a stack of levels; a level is a handful of rooms grown on a
 * grid, joined by doors, with stairs at the far end and — on the deepest level — the lair's
 * guardian and its hoard. Rooms get their contents from a d12. The tables are ours; the monsters
 * come from the monster catalogue at the party's level plus the depth. Every word the numbers
 * stand for lives in the i18n tables (solo.dungeon.*).
 */

export const ROOM_KINDS = ['entrance', 'empty', 'monsters', 'trap', 'treasure', 'special', 'hazard', 'secret', 'stairs', 'boss', 'market', 'tavern', 'temple', 'guild', 'slum', 'keep'] as const;
export type RoomKind = (typeof ROOM_KINDS)[number];

export const DUNGEON_COUNTS = { theme: 8, trap: 8, hazard: 6, special: 8, lairTheme: 6, townEvent: 6 } as const;

/** What the map stands for: a dungeon proper, the lair of a hex's creature, or a settlement's districts. */
export const MAP_KINDS = ['dungeon', 'lair', 'settlement'] as const;
export type MapKind = (typeof MAP_KINDS)[number];

export interface Room {
  id: number;
  x: number;
  y: number;
  kind: RoomKind;
  /** Ids of the rooms this one has a door to. */
  links: number[];
  visited: boolean;
  seen: boolean;
  cleared: boolean;
  monsterId?: string;
  count?: number;
  /** Index into the trap / hazard / special tables. */
  trap?: number;
  hazard?: number;
  special?: number;
  /** Index into `Dungeon.groups` of the folk who hold this room. */
  group?: number;
  /** Gold in the room's hoard, G. */
  gold?: number;
  /** A hoard also holds something of the treasure drop tables. */
  item?: boolean;
  /** Target Number of the Disable Device check against the room's trap, and whether it was disarmed. */
  trapTn?: number;
  disarmed?: boolean;
  /** The trap has been found by searching, or sprung by walking into it. */
  trapFound?: boolean;
  sprung?: boolean;
  /** A locked hoard: the Target Number to pick it, and whether it was opened. */
  lockTn?: number;
  unlocked?: boolean;
}

export interface DungeonLevel {
  rooms: Room[];
}

/** A band of one kind of monster that holds part of the dungeon; group 0 is the guardian's own. */
export interface DungeonGroup {
  monsterId: string;
}

export interface GroupRelation {
  a: number;
  b: number;
  relation: Relation;
}

export interface Dungeon {
  /** Dungeon unless made as a lair or a settlement (older saves have none). */
  kind: MapKind;
  /** For a settlement: its kind (hamlet … monastery), which names it and sets its size. */
  settlement?: string;
  /** The hex it lies in ("q,r"), or "free" for one made without a map. */
  place: string;
  theme: number;
  /** The party's level when it was made. */
  level: number;
  levels: DungeonLevel[];
  at: { level: number; room: number };
  /** Who lives here: the guardian's folk and one or two other bands, with how each pair gets on. */
  groups: DungeonGroup[];
  groupRelations: GroupRelation[];
}

const die = (sides: number, rng: Rng): number => 1 + Math.floor(rng() * sides);

/** d6: 1–3 one level, 4–5 two, 6 three. */
export function levelCount(roll: number): number {
  if (roll <= 3) return 1;
  return roll <= 5 ? 2 : 3;
}

/** d12: 1–3 empty, 4–6 monsters, 7 trap, 8–9 treasure, 10 something special, 11 hazard, 12 a secret room. */
export function roomKindFor(roll: number): RoomKind {
  if (roll <= 3) return 'empty';
  if (roll <= 6) return 'monsters';
  if (roll === 7) return 'trap';
  if (roll <= 9) return 'treasure';
  if (roll === 10) return 'special';
  if (roll === 11) return 'hazard';
  return 'secret';
}

const STEPS: readonly [number, number][] = [
  [0, -1],
  [1, 0],
  [0, 1],
  [-1, 0],
];

/** Grows `count` rooms from a first one on a grid, each beside an existing room and joined to it; then a door or two more between neighbours. */
export function growLayout(count: number, rng: Rng): { x: number; y: number; links: number[] }[] {
  const rooms: { x: number; y: number; links: number[] }[] = [{ x: 0, y: 0, links: [] }];
  const at = (x: number, y: number) => rooms.findIndex((room) => room.x === x && room.y === y);
  while (rooms.length < count) {
    const parentIndex = Math.floor(rng() * rooms.length);
    const parent = rooms[parentIndex];
    const free = STEPS.map(([dx, dy]) => [parent.x + dx, parent.y + dy] as const).filter(([x, y]) => at(x, y) < 0);
    if (free.length === 0) continue;
    const [x, y] = free[Math.floor(rng() * free.length)];
    const id = rooms.length;
    rooms.push({ x, y, links: [parentIndex] });
    parent.links.push(id);
  }
  // a loop here and there: neighbouring rooms not yet joined get a door one time in six
  for (let a = 0; a < rooms.length; a += 1) {
    for (const [dx, dy] of [STEPS[1], STEPS[2]]) {
      const b = at(rooms[a].x + dx, rooms[a].y + dy);
      if (b >= 0 && !rooms[a].links.includes(b) && die(6, rng) === 1) {
        rooms[a].links.push(b);
        rooms[b].links.push(a);
      }
    }
  }
  return rooms;
}

/** Number of doors to pass from room 0 to every room. */
export function distances(rooms: { links: number[] }[]): number[] {
  const out = rooms.map(() => -1);
  out[0] = 0;
  const queue = [0];
  while (queue.length > 0) {
    const current = queue.shift() as number;
    for (const next of rooms[current].links) {
      if (out[next] < 0) {
        out[next] = out[current] + 1;
        queue.push(next);
      }
    }
  }
  return out;
}

export interface DungeonOptions {
  /** The party's level. */
  level: number;
  monsters: Monster[];
  biome: Biome;
  /** The place it lies: a hex key, or "free". */
  place: string;
  /** The guardian of the deepest room (a lair or dungeon hex already chose one). */
  guardian?: { monsterId: string; count: number };
  rng?: Rng;
}

function furthest(rooms: { links: number[] }[], not: number[]): number {
  const dist = distances(rooms);
  let best = -1;
  rooms.forEach((_, index) => {
    if (not.includes(index)) return;
    if (best < 0 || dist[index] > dist[best]) best = index;
  });
  return best;
}

/**
 * Target Number of a lock or trap met at this depth. The book's simple lock is 9 (CR I p. 97); a level-1
 * party on the first level meets exactly that, and it climbs a point per level of party and depth.
 */
export function lockTarget(partyLevel: number, depth: number): number {
  return 8 + Math.max(1, partyLevel) + depth;
}

export interface DisableDeviceRoll {
  dice: [number, number];
  value: number;
  success: boolean;
  outcome: 'fumble' | 'critical' | null;
}

/**
 * A Disable Device check (CR I p. 102): 2d6 + Scout or Ranger Level + DEX modifier, -4 without Scout's Tools
 * (or with no level in either class). It beats a Target Number when the Success Value reaches it; double 6s
 * always succeed and double 1s always fail.
 */
export function rollDisableDevice(standard: number, tools: boolean, targetNumber: number, rng: Rng = Math.random): DisableDeviceRoll {
  const dice: [number, number] = [die(6, rng), die(6, rng)];
  const sum = dice[0] + dice[1];
  const value = sum + standard - (tools ? 0 : 4);
  const outcome = sum === 2 ? 'fumble' : sum === 12 ? 'critical' : null;
  return { dice, value, outcome, success: outcome === 'critical' ? true : outcome === 'fumble' ? false : value >= targetNumber };
}

export function generateDungeon(options: DungeonOptions): Dungeon {
  const rng = options.rng ?? Math.random;
  const depthCount = levelCount(die(6, rng));
  const groups = pickGroups(options, depthCount, rng);
  const groupRelations: GroupRelation[] = [];
  for (let a = 0; a < groups.length; a += 1) for (let b = a + 1; b < groups.length; b += 1) groupRelations.push({ a, b, relation: relationFor(die(10, rng)) });
  const levels: DungeonLevel[] = [];
  for (let depth = 0; depth < depthCount; depth += 1) {
    const layout = growLayout(6 + die(4, rng), rng);
    const last = depth === depthCount - 1;
    const stairs = last ? -1 : furthest(layout, [0]);
    const boss = last ? furthest(layout, [0]) : -1;
    const rooms: Room[] = layout.map((cell, id) => {
      const base: Room = { id, x: cell.x, y: cell.y, kind: 'empty', links: cell.links, visited: false, seen: false, cleared: false };
      if (id === 0) return { ...base, kind: depth === 0 ? 'entrance' : 'stairs' };
      if (id === stairs) return { ...base, kind: 'stairs' };
      if (id === boss) {
        const guardian = options.guardian ?? (groups[0] ? { monsterId: groups[0].monsterId, count: Math.max(1, packSize(options.monsters.find((entry) => entry.id === groups[0].monsterId)!, options.level + depth + 1, rng) - 1) } : pickGuardian(options, depth, rng));
        return { ...base, kind: 'boss', group: groups[0] ? 0 : undefined, monsterId: guardian?.monsterId, count: guardian?.count, gold: hoard(options.level + depth, 3, rng), item: true };
      }
      const kind = roomKindFor(die(12, rng));
      const room = { ...base, kind };
      if (kind === 'monsters') {
        const group = groups.length > 0 ? Math.floor(rng() * groups.length) : -1;
        const monster = group >= 0 ? options.monsters.find((entry) => entry.id === groups[group].monsterId) : pickMonster(options.monsters, options.biome, options.level + depth, rng, true);
        if (monster) return { ...room, monsterId: monster.id, count: packSize(monster, options.level + depth, rng), ...(group >= 0 ? { group } : {}) };
        return { ...room, kind: 'empty' as const };
      }
      const tn = lockTarget(options.level, depth);
      if (kind === 'trap') return { ...room, trap: die(DUNGEON_COUNTS.trap, rng), trapTn: tn };
      if (kind === 'hazard') return { ...room, hazard: die(DUNGEON_COUNTS.hazard, rng) };
      if (kind === 'special') return { ...room, special: die(DUNGEON_COUNTS.special, rng) };
      if (kind === 'treasure' || kind === 'secret') {
        const locked = die(3, rng) === 1;
        return { ...room, gold: hoard(options.level + depth, kind === 'secret' ? 2 : 1, rng), item: die(3, rng) === 1, ...(locked ? { lockTn: tn } : {}) };
      }
      return room;
    });
    levels.push({ rooms });
  }
  const first = levels[0].rooms[0];
  first.visited = true;
  first.seen = true;
  for (const id of first.links) levels[0].rooms[id].seen = true;
  return { kind: 'dungeon', place: options.place, theme: die(DUNGEON_COUNTS.theme, rng), level: options.level, levels, at: { level: 0, room: 0 }, groups, groupRelations };
}

/**
 * The bands that hold the dungeon: the guardian's folk (one level above the party at the bottom) and one or two
 * other kinds of monster, never the same kind twice. An imposed guardian (from a lair or dungeon hex) leads group 0.
 */
function pickGroups(options: DungeonOptions, depthCount: number, rng: Rng): DungeonGroup[] {
  const groups: DungeonGroup[] = [];
  const lead = options.guardian?.monsterId ?? pickMonster(options.monsters, options.biome, options.level + depthCount, rng, true)?.id;
  if (!lead) return groups;
  groups.push({ monsterId: lead });
  const others = die(6, rng) >= 5 ? 2 : 1;
  for (let attempt = 0; groups.length < 1 + others && attempt < 12; attempt += 1) {
    const found = pickMonster(options.monsters, options.biome, options.level + Math.floor(depthCount / 2), rng, true);
    if (found && !groups.some((entry) => entry.monsterId === found.id)) groups.push({ monsterId: found.id });
  }
  return groups;
}

/**
 * The lair of a creature found in a hex: a single level of a few areas, the resident in the farthest one
 * with a hoard thrice the usual, the rest empty ground, its own kin standing guard, a hazard or a small cache.
 */
export function generateLair(options: DungeonOptions): Dungeon {
  const rng = options.rng ?? Math.random;
  const layout = growLayout(5 + die(2, rng), rng);
  const boss = furthest(layout, [0]);
  const resident = options.guardian ?? pickGuardian(options, 0, rng);
  const kin = resident ? options.monsters.find((entry) => entry.id === resident.monsterId) : undefined;
  const rooms: Room[] = layout.map((cell, id) => {
    const base: Room = { id, x: cell.x, y: cell.y, kind: 'empty', links: cell.links, visited: false, seen: false, cleared: false };
    if (id === 0) return { ...base, kind: 'entrance' };
    if (id === boss) return { ...base, kind: 'boss', group: resident ? 0 : undefined, monsterId: resident?.monsterId, count: resident?.count, gold: hoard(options.level, 3, rng), item: true };
    const roll = die(6, rng);
    if (roll <= 2) return base;
    if (roll <= 4 && kin) return { ...base, kind: 'monsters', group: 0, monsterId: kin.id, count: packSize(kin, options.level, rng) };
    if (roll === 5) return { ...base, kind: 'hazard', hazard: die(DUNGEON_COUNTS.hazard, rng) };
    return { ...base, kind: 'treasure', gold: hoard(options.level, 1, rng), item: die(3, rng) === 1 };
  });
  return enterFirst({ kind: 'lair', place: options.place, theme: die(DUNGEON_COUNTS.lairTheme, rng), level: options.level, levels: [{ rooms }], at: { level: 0, room: 0 }, groups: resident ? [{ monsterId: resident.monsterId }] : [], groupRelations: [] });
}

/** Districts of a settlement by its kind: how many, and which are certain to be there. */
const DISTRICTS: Record<string, { count: number; has: RoomKind[] }> = {
  hamlet: { count: 4, has: ['tavern'] },
  village: { count: 5, has: ['tavern', 'market'] },
  town: { count: 8, has: ['tavern', 'market', 'temple', 'guild'] },
  fortress: { count: 7, has: ['keep', 'tavern', 'market'] },
  tower: { count: 5, has: ['keep', 'market'] },
  monastery: { count: 6, has: ['temple', 'keep', 'market'] },
};

/**
 * A settlement as a map of districts joined by streets: the gate, the places its kind must have, houses
 * and slums for the rest. Each district other than the gate carries a small happening (solo.dungeon.townEvents).
 */
export function generateSettlement(kind: string, level: number, place: string, rng: Rng = Math.random): Dungeon {
  const plan = DISTRICTS[kind] ?? DISTRICTS.village;
  const layout = growLayout(plan.count, rng);
  const fill: RoomKind[] = [...plan.has];
  const spare: RoomKind[] = ['empty', 'empty', 'market', 'tavern', 'slum', 'guild'];
  const rooms: Room[] = layout.map((cell, id) => {
    const base: Room = { id, x: cell.x, y: cell.y, kind: 'empty', links: cell.links, visited: false, seen: false, cleared: false };
    if (id === 0) return { ...base, kind: 'entrance' };
    const roomKind = fill.length > 0 ? (fill.splice(Math.floor(rng() * fill.length), 1)[0] as RoomKind) : spare[Math.floor(rng() * spare.length)];
    return { ...base, kind: roomKind, special: die(DUNGEON_COUNTS.townEvent, rng) };
  });
  return enterFirst({ kind: 'settlement', settlement: kind, place, theme: 1, level, levels: [{ rooms }], at: { level: 0, room: 0 }, groups: [], groupRelations: [] });
}

/** The first room is the way in: visited, and its neighbours seen. */
function enterFirst(dungeon: Dungeon): Dungeon {
  const first = dungeon.levels[0].rooms[0];
  first.visited = true;
  first.seen = true;
  for (const id of first.links) dungeon.levels[0].rooms[id].seen = true;
  return dungeon;
}

function pickGuardian(options: DungeonOptions, depth: number, rng: Rng): { monsterId: string; count: number } | null {
  const monster = pickMonster(options.monsters, options.biome, options.level + depth + 1, rng, true);
  return monster ? { monsterId: monster.id, count: Math.max(1, packSize(monster, options.level + depth + 1, rng) - 1) } : null;
}

/** A hoard in G: 2d6 × 20 × level, times the multiplier (a secret room doubles it, a guardian's lair triples it). */
export function hoard(level: number, multiplier: number, rng: Rng): number {
  return (die(6, rng) + die(6, rng)) * 20 * Math.max(1, level) * multiplier;
}

// ---- walking it ----

export function roomAt(dungeon: Dungeon, level: number, id: number): Room | undefined {
  return dungeon.levels[level]?.rooms[id];
}

export function currentRoom(dungeon: Dungeon): Room {
  return dungeon.levels[dungeon.at.level].rooms[dungeon.at.room];
}

export function canEnter(dungeon: Dungeon, id: number): boolean {
  return currentRoom(dungeon).links.includes(id);
}

/** Through a door into a linked room: it is visited, and the rooms beyond it are seen. */
export function enterRoom(dungeon: Dungeon, id: number): Dungeon | null {
  if (!canEnter(dungeon, id)) return null;
  const levels = dungeon.levels.map((level, index) =>
    index !== dungeon.at.level
      ? level
      : {
          rooms: level.rooms.map((room) => {
            if (room.id === id) return { ...room, visited: true, seen: true };
            const target = level.rooms[id];
            return target.links.includes(room.id) ? { ...room, seen: true } : room;
          }),
        },
  );
  return { ...dungeon, levels, at: { ...dungeon.at, room: id } };
}

/** Down the stairs: the first room of the next level, if this room leads there. */
export function descend(dungeon: Dungeon): Dungeon | null {
  const room = currentRoom(dungeon);
  const next = dungeon.levels[dungeon.at.level + 1];
  if (room.kind !== 'stairs' || room.id === 0 || !next) return null;
  const levels = dungeon.levels.map((level, index) =>
    index !== dungeon.at.level + 1
      ? level
      : { rooms: level.rooms.map((entry) => (entry.id === 0 ? { ...entry, visited: true, seen: true } : entry.links.includes(0) ? { ...entry, seen: true } : entry)) },
  );
  return { ...dungeon, levels, at: { level: dungeon.at.level + 1, room: 0 } };
}

/** Up the stairs: back to the stairs room of the level above. */
export function ascend(dungeon: Dungeon): Dungeon | null {
  const room = currentRoom(dungeon);
  if (room.kind !== 'stairs' || room.id !== 0 || dungeon.at.level === 0) return null;
  const above = dungeon.levels[dungeon.at.level - 1].rooms.find((entry) => entry.kind === 'stairs' && entry.id !== 0);
  return above ? { ...dungeon, at: { level: dungeon.at.level - 1, room: above.id } } : null;
}

export function setCleared(dungeon: Dungeon, level: number, id: number, cleared: boolean): Dungeon {
  return { ...dungeon, levels: dungeon.levels.map((entry, index) => (index !== level ? entry : { rooms: entry.rooms.map((room) => (room.id === id ? { ...room, cleared } : room)) })) };
}

/** The dungeon with one room changed (gold taken, a fight cleared). */
export function updateRoom(dungeon: Dungeon, level: number, id: number, patch: Partial<Room>): Dungeon {
  return { ...dungeon, levels: dungeon.levels.map((entry, index) => (index !== level ? entry : { rooms: entry.rooms.map((room) => (room.id === id ? { ...room, ...patch } : room)) })) };
}

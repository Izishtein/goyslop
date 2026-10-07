import type { Monster } from '../data/monsters/types';
import type { Rng } from './encounter';
import { packSize, pickMonster, type Biome } from './hexmap';

/*
 * The dungeon generator. A dungeon is a stack of levels; a level is a handful of rooms grown on a
 * grid, joined by doors, with stairs at the far end and — on the deepest level — the lair's
 * guardian and its hoard. Rooms get their contents from a d12. The tables are ours; the monsters
 * come from the monster catalogue at the party's level plus the depth. Every word the numbers
 * stand for lives in the i18n tables (solo.dungeon.*).
 */

export const ROOM_KINDS = ['entrance', 'empty', 'monsters', 'trap', 'treasure', 'special', 'hazard', 'secret', 'stairs', 'boss'] as const;
export type RoomKind = (typeof ROOM_KINDS)[number];

export const DUNGEON_COUNTS = { theme: 8, trap: 8, hazard: 6, special: 8 } as const;

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
  /** Gold in the room's hoard, G. */
  gold?: number;
  /** A hoard also holds something of the treasure drop tables. */
  item?: boolean;
}

export interface DungeonLevel {
  rooms: Room[];
}

export interface Dungeon {
  /** The hex it lies in ("q,r"), or "free" for one made without a map. */
  place: string;
  theme: number;
  /** The party's level when it was made. */
  level: number;
  levels: DungeonLevel[];
  at: { level: number; room: number };
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

export function generateDungeon(options: DungeonOptions): Dungeon {
  const rng = options.rng ?? Math.random;
  const depthCount = levelCount(die(6, rng));
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
        const guardian = options.guardian ?? pickGuardian(options, depth, rng);
        return { ...base, kind: 'boss', monsterId: guardian?.monsterId, count: guardian?.count, gold: hoard(options.level + depth, 3, rng), item: true };
      }
      const kind = roomKindFor(die(12, rng));
      const room = { ...base, kind };
      if (kind === 'monsters') {
        const monster = pickMonster(options.monsters, options.biome, options.level + depth, rng, true);
        if (monster) return { ...room, monsterId: monster.id, count: packSize(monster, options.level + depth, rng) };
        return { ...room, kind: 'empty' as const };
      }
      if (kind === 'trap') return { ...room, trap: die(DUNGEON_COUNTS.trap, rng) };
      if (kind === 'hazard') return { ...room, hazard: die(DUNGEON_COUNTS.hazard, rng) };
      if (kind === 'special') return { ...room, special: die(DUNGEON_COUNTS.special, rng) };
      if (kind === 'treasure' || kind === 'secret') return { ...room, gold: hoard(options.level + depth, kind === 'secret' ? 2 : 1, rng), item: die(3, rng) === 1 };
      return room;
    });
    levels.push({ rooms });
  }
  const first = levels[0].rooms[0];
  first.visited = true;
  first.seen = true;
  for (const id of first.links) levels[0].rooms[id].seen = true;
  return { place: options.place, theme: die(DUNGEON_COUNTS.theme, rng), level: options.level, levels, at: { level: 0, room: 0 } };
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

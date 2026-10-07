import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import en from '../i18n/locales/en.json';
import ru from '../i18n/locales/ru.json';
import {
  ascend,
  canEnter,
  currentRoom,
  descend,
  distances,
  DUNGEON_COUNTS,
  enterRoom,
  generateDungeon,
  growLayout,
  hoard,
  levelCount,
  roomKindFor,
  updateRoom,
} from './dungeon';

const monsters = raw as unknown as Monster[];

function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const make = (seed: number, extra = {}) => generateDungeon({ level: 3, monsters, biome: 'hills', place: 'free', rng: seeded(seed), ...extra });

describe('tables', () => {
  it('read the level count and the room contents', () => {
    expect([1, 3, 4, 5, 6].map(levelCount)).toEqual([1, 1, 2, 2, 3]);
    expect([1, 3, 4, 6, 7, 8, 9, 10, 11, 12].map(roomKindFor)).toEqual(['empty', 'empty', 'monsters', 'monsters', 'trap', 'treasure', 'treasure', 'special', 'hazard', 'secret']);
  });

  it('scale a hoard with level and multiplier', () => {
    expect(hoard(3, 1, () => 0)).toBe(2 * 20 * 3); // 2d6 = 2
    expect(hoard(3, 3, () => 0.99)).toBe(12 * 20 * 3 * 3);
  });

  it('have a word for every trap, hazard, special room and theme, in both languages', () => {
    for (const locale of [en, ru]) {
      const d = locale.solo.dungeon as unknown as Record<string, Record<string, string>>;
      for (const [key, count] of [['themes', DUNGEON_COUNTS.theme], ['traps', DUNGEON_COUNTS.trap], ['hazards', DUNGEON_COUNTS.hazard], ['specials', DUNGEON_COUNTS.special]] as const) {
        expect(Object.keys(d[key]).length, key).toBe(count);
      }
      for (const kind of ['unknown', 'entrance', 'empty', 'monsters', 'trap', 'treasure', 'special', 'hazard', 'secret', 'stairs', 'boss']) expect(d.kinds[kind], kind).toBeTruthy();
    }
  });
});

describe('layout', () => {
  it('grows connected rooms on distinct grid cells, doors only between neighbours', () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      const rooms = growLayout(9, seeded(seed));
      expect(new Set(rooms.map((r) => `${r.x},${r.y}`)).size).toBe(9);
      expect(distances(rooms).every((d) => d >= 0)).toBe(true);
      rooms.forEach((room, id) =>
        room.links.forEach((other) => {
          expect(Math.abs(room.x - rooms[other].x) + Math.abs(room.y - rooms[other].y), `${id}-${other}`).toBe(1);
          expect(rooms[other].links).toContain(id);
        }),
      );
    }
  });
});

describe('a generated dungeon', () => {
  it('has one to three levels of 7–10 rooms, an entrance, stairs between levels and a guardian at the bottom', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const dungeon = make(seed);
      expect(dungeon.levels.length).toBeGreaterThanOrEqual(1);
      expect(dungeon.levels.length).toBeLessThanOrEqual(3);
      dungeon.levels.forEach((level, depth) => {
        expect(level.rooms.length).toBeGreaterThanOrEqual(7);
        expect(level.rooms.length).toBeLessThanOrEqual(10);
        expect(level.rooms[0].kind).toBe(depth === 0 ? 'entrance' : 'stairs');
        const last = depth === dungeon.levels.length - 1;
        expect(level.rooms.filter((r) => r.kind === 'stairs' && r.id !== 0)).toHaveLength(last ? 0 : 1);
        expect(level.rooms.filter((r) => r.kind === 'boss')).toHaveLength(last ? 1 : 0);
        for (const room of level.rooms) if (room.monsterId) expect(monsters.some((m) => m.id === room.monsterId)).toBe(true);
      });
    }
  });

  it('starts with the entrance and its neighbours seen, the rest hidden', () => {
    const dungeon = make(4);
    const rooms = dungeon.levels[0].rooms;
    expect(rooms[0]).toMatchObject({ visited: true, seen: true });
    expect(rooms.filter((r) => r.seen).length).toBe(1 + rooms[0].links.length);
    expect(dungeon.at).toEqual({ level: 0, room: 0 });
  });

  it('puts the hex\'s own monster in the guardian\'s lair', () => {
    const goblin = monsters.find((m) => m.name === 'Goblin')!;
    const dungeon = make(9, { guardian: { monsterId: goblin.id, count: 4 } });
    const boss = dungeon.levels[dungeon.levels.length - 1].rooms.find((r) => r.kind === 'boss')!;
    expect(boss).toMatchObject({ monsterId: goblin.id, count: 4 });
    expect(boss.gold).toBeGreaterThan(0);
  });
});

describe('walking it', () => {
  it('goes through a door, sees what lies beyond it, and refuses a room with no door', () => {
    const dungeon = make(6);
    const first = dungeon.levels[0].rooms[0];
    const next = first.links[0];
    const stranger = dungeon.levels[0].rooms.find((r) => r.id !== 0 && !first.links.includes(r.id))!;
    expect(canEnter(dungeon, stranger.id)).toBe(false);
    expect(enterRoom(dungeon, stranger.id)).toBeNull();
    const moved = enterRoom(dungeon, next)!;
    expect(currentRoom(moved).id).toBe(next);
    expect(currentRoom(moved).visited).toBe(true);
    for (const id of moved.levels[0].rooms[next].links) expect(moved.levels[0].rooms[id].seen).toBe(true);
  });

  it('goes down the stairs and up again', () => {
    let dungeon = make(1);
    for (let seed = 2; dungeon.levels.length < 2 && seed < 60; seed += 1) dungeon = make(seed);
    expect(dungeon.levels.length).toBeGreaterThanOrEqual(2);
    const stairs = dungeon.levels[0].rooms.find((r) => r.kind === 'stairs' && r.id !== 0)!;
    expect(descend(dungeon)).toBeNull(); // not on the stairs yet
    const there = { ...dungeon, at: { level: 0, room: stairs.id } };
    const down = descend(there)!;
    expect(down.at).toEqual({ level: 1, room: 0 });
    expect(down.levels[1].rooms[0].visited).toBe(true);
    expect(ascend(down)!.at).toEqual({ level: 0, room: stairs.id });
    expect(ascend(there)).toBeNull();
  });

  it('changes one room', () => {
    const dungeon = make(3);
    const changed = updateRoom(dungeon, 0, 0, { cleared: true });
    expect(changed.levels[0].rooms[0].cleared).toBe(true);
    expect(dungeon.levels[0].rooms[0].cleared).toBe(false);
  });
});

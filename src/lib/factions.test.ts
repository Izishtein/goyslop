import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import { addPatchFactions, borders, eventTiming, factionsAt, generateFactions, relationFor, rollFactionEvent, sameRealm, seatOf, withFactions } from './factions';
import { EMPTY_HEXMAP, generateHexMap, type Hex } from './hexmap';

const monsters = raw as unknown as Monster[];
const byId = new Map(monsters.map((monster) => [monster.id, monster]));

const hex = (q: number, r: number, feature: Hex['feature']): Hex => ({ q, r, biome: 'grassland', feature, visited: false, seen: false });
const fortress = (q: number, r: number) => hex(q, r, { kind: 'settlement', settlement: 'fortress' });
const empty = (q: number, r: number) => hex(q, r, { kind: 'empty' });
const never = () => 0; // d6 = 1, d10 = 1: claims stay apart, relations are wars
const always = () => 0.99; // d6 = 6, d10 = 10: claims merge, relations are alliances

describe('tables', () => {
  it('reads the relationship, merge and timing rolls', () => {
    expect([1, 2, 3, 4, 7, 8, 9, 10].map(relationFor)).toEqual(['war', 'hostile', 'hostile', 'wary', 'wary', 'trade', 'trade', 'alliance']);
    expect([3, 4, 6].map(sameRealm)).toEqual([false, true, true]);
    expect([1, 2, 4, 5, 6].map(eventTiming)).toEqual(['ended', 'now', 'now', 'future', 'future']);
  });

  it('rolls an event out of the twelve', () => {
    expect(rollFactionEvent(() => 0)).toEqual({ event: 1, timing: 'ended' });
    expect(rollFactionEvent(() => 0.99)).toEqual({ event: 12, timing: 'future' });
  });
});

describe('seats', () => {
  it('are towns, fortresses, towers, monasteries, and the lairs of thinking monsters only', () => {
    const smart = monsters.find((m) => ['Average', 'High'].includes(m.intelligence))!;
    const beast = monsters.find((m) => m.intelligence === 'Animal')!;
    expect(seatOf(fortress(0, 0), byId)).toMatchObject({ kind: 'fortress' });
    expect(seatOf(hex(0, 0, { kind: 'settlement', settlement: 'village' }), byId)).toBeNull();
    expect(seatOf(hex(0, 0, { kind: 'lair', monsterId: smart.id }), byId)).toMatchObject({ kind: 'lair', monsterId: smart.id });
    expect(seatOf(hex(0, 0, { kind: 'lair', monsterId: beast.id }), byId)).toBeNull();
    expect(seatOf(hex(0, 0, { kind: 'dungeon', monsterId: smart.id }), byId)).toBeNull();
  });
});

describe('domains', () => {
  // two fortresses two hexes apart share the hex between them
  const hexes = [fortress(0, 0), empty(1, 0), fortress(2, 0), empty(-1, 0), empty(3, 0), empty(0, 1), empty(1, 1), empty(2, -1), empty(1, -1)];

  it('give a big seat its own hex and the ones around it', () => {
    const { factions } = generateFactions([fortress(0, 0), empty(1, 0), empty(0, 1)], byId, never);
    expect(factions).toHaveLength(1);
    expect(factions[0].domain.sort()).toEqual(['0,0', '0,1', '1,0']);
  });

  it('keep two overlapping fortresses apart, with the shared hex contested', () => {
    const { factions } = generateFactions(hexes, byId, never);
    expect(factions).toHaveLength(2);
    expect(factionsAt(factions, 1, 0)).toHaveLength(2);
  });

  it('merge them into one realm when the roll says so', () => {
    const { factions, relations } = generateFactions(hexes, byId, always);
    expect(factions).toHaveLength(1);
    expect(factions[0].seats).toHaveLength(2);
    expect(relations).toEqual([]);
  });

  it('give neighbouring factions a relationship, once per pair', () => {
    const { factions, relations } = generateFactions(hexes, byId, never);
    expect(relations).toEqual([{ a: factions[0].id, b: factions[1].id, relation: 'war' }]);
  });

  it('give a tower its own hex and the villages beside it, not a fortress', () => {
    const tower = hex(0, 0, { kind: 'settlement', settlement: 'tower' });
    const village = hex(1, 0, { kind: 'settlement', settlement: 'village' });
    const town = hex(0, 1, { kind: 'settlement', settlement: 'hamlet' });
    const { factions } = generateFactions([tower, village, town, empty(-1, 0)], byId, never);
    expect(factions[0].domain.sort()).toEqual(['0,0', '0,1', '1,0']);
  });
});

describe('a generated map', () => {
  it('carries factions whose domains lie on the map', () => {
    let total = 0;
    for (let seed = 1; seed <= 20; seed += 1) {
      let a = seed;
      const rng = () => ((a = (a * 1664525 + 1013904223) % 4294967296) / 4294967296);
      const map = withFactions(generateHexMap({ level: 3, monsters, rng }), monsters, rng);
      const keys = new Set(map.hexes.map((h) => `${h.q},${h.r}`));
      for (const faction of map.factions) for (const key of faction.domain) expect(keys.has(key), key).toBe(true);
      total += map.factions.length;
    }
    expect(total).toBeGreaterThan(0);
  });
});

describe('a patch added later', () => {
  it('numbers its factions after the old ones and rolls a relationship where it borders them', () => {
    const base = withFactions({ ...EMPTY_HEXMAP, hexes: [fortress(0, 0), empty(1, 0)] }, [], always);
    expect(base.factions.map((f) => f.id)).toEqual([1]);
    const next = addPatchFactions(base, [fortress(2, 0), empty(3, 0)], [], never);
    expect(next.factions.map((f) => f.id)).toEqual([1, 2]);
    expect(borders(next.factions[0], next.factions[1])).toBe(true);
    expect(next.relations).toEqual([{ a: 1, b: 2, relation: 'war' }]);
  });

  it('leaves far-apart factions without a relationship', () => {
    const base = withFactions({ ...EMPTY_HEXMAP, hexes: [fortress(0, 0)] }, [], always);
    const next = addPatchFactions(base, [fortress(9, 0)], [], never);
    expect(next.factions).toHaveLength(2);
    expect(next.relations).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import {
  canMoveTo,
  isWater,
  needsFord,
  seaFeature,
  SEA_ROLL,
  expandMap,
  featureKind,
  forage,
  generateHexMap,
  hexAt,
  hexDistance,
  hexesAtPlace,
  hexPlaces,
  journalPlaceFor,
  setHexPlace,
  landmarkOutcome,
  livesIn,
  makeCamp,
  neighbours,
  MAX_FATIGUE,
  moveParty,
  restDay,
  nextBiome,
  nextPatchCentre,
  PATCH_VECTORS,
  packSize,
  pickMonster,
  settlementKind,
  startBiome,
  START_RATIONS,
  type Hex,
} from './hexmap';

const monsters = raw as unknown as Monster[];

/** A small seeded generator, so a "random" map is the same every run. */
function seeded(seed: number) {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

describe('tables', () => {
  it('reads the biome, feature and settlement rolls', () => {
    expect([1, 2, 3, 4, 5, 6].map(startBiome)).toEqual(['grassland', 'grassland', 'forest', 'hills', 'marsh', 'mountains']);
    expect([1, 4, 10].map((roll) => nextBiome(roll, 'marsh'))).toEqual(['marsh', 'marsh', 'marsh']);
    expect([5, 6, 7, 8, 9].map((roll) => nextBiome(roll, 'marsh'))).toEqual(['grassland', 'forest', 'hills', 'marsh', 'mountains']);
    expect([1, 5, 6, 7, 8, 9, 10, 11, 12].map(featureKind)).toEqual(['landmark', 'landmark', 'settlement', 'settlement', 'lair', 'lair', 'dungeon', 'empty', 'empty']);
    expect([1, 2, 6].map(settlementKind)).toEqual(['hamlet', 'village', 'monastery']);
    expect([1, 2, 3, 4, 5, 6].map(landmarkOutcome)).toEqual(['hazard', 'empty', 'empty', 'special', 'monsters', 'monsters']);
  });
});

describe('monsters by biome', () => {
  it('fits the habitat and the level', () => {
    const rng = seeded(7);
    for (let i = 0; i < 40; i += 1) {
      const monster = pickMonster(monsters, 'forest', 4, rng)!;
      expect(livesIn(monster, 'forest'), monster.name).toBe(true);
      expect(Math.abs(monster.level - 4)).toBeLessThanOrEqual(3);
      expect(monster.category).not.toBe('Familiars');
    }
  });

  it('comes alone when stronger than the party and in a pack when weaker', () => {
    const goblin = monsters.find((m) => m.name === 'Goblin')!;
    expect(packSize({ ...goblin, level: 9 }, 3, () => 0.99)).toBe(1);
    expect(packSize({ ...goblin, level: 1 }, 3, () => 0.99)).toBe(3);
    expect(packSize({ ...goblin, level: 3 }, 3, () => 0.99)).toBe(2);
  });
});

describe('a generated map', () => {
  const map = generateHexMap({ level: 3, monsters, rng: seeded(42) });

  it('has 19 distinct hexes, the party in a visited village at the centre', () => {
    expect(map.hexes).toHaveLength(19);
    expect(new Set(map.hexes.map((h) => `${h.q},${h.r}`)).size).toBe(19);
    expect(map.hexes.every((h) => hexDistance({ q: 0, r: 0 }, h) <= 2)).toBe(true);
    expect(hexAt(map, 0, 0)).toMatchObject({ visited: true, feature: { kind: 'settlement', settlement: 'village' } });
    expect(map.party).toEqual({ q: 0, r: 0 });
    expect(map.rations).toBe(START_RATIONS);
  });

  it('shows only the first ring from the start', () => {
    expect(map.hexes.filter((h) => h.seen)).toHaveLength(7);
    expect(map.hexes.filter((h) => h.visited)).toHaveLength(1);
  });

  it('always holds a dungeon, and gives every lair and dungeon a monster of the right level', () => {
    for (let seed = 1; seed <= 30; seed += 1) {
      const generated = generateHexMap({ level: 3, monsters, rng: seeded(seed) });
      expect(generated.hexes.some((h) => h.feature.kind === 'dungeon'), `seed ${seed}`).toBe(true);
      for (const hex of generated.hexes.filter((h) => h.feature.monsterId)) {
        expect(monsters.some((m) => m.id === hex.feature.monsterId)).toBe(true);
        expect(hex.feature.count).toBeGreaterThanOrEqual(1);
      }
    }
  });
});

describe('travel', () => {
  const map = generateHexMap({ level: 2, monsters, rng: seeded(5) });
  const noEncounter = () => 0.99;
  const encounter = () => 0;

  it('steps only into a neighbouring hex of the map', () => {
    expect(canMoveTo(map, 1, 0)).toBe(true);
    expect(canMoveTo(map, 2, 0)).toBe(false);
    expect(canMoveTo(map, 0, 0)).toBe(false);
    expect(moveParty(map, 2, 0)).toBeNull();
  });

  it('visits the hex, reveals its neighbours and eats a ration', () => {
    const result = moveParty(map, 1, 0, noEncounter)!;
    expect(result.map.party).toEqual({ q: 1, r: 0 });
    expect(hexAt(result.map, 1, 0)!.visited).toBe(true);
    expect(hexAt(result.map, 2, 0)?.seen ?? true).toBe(true);
    expect(result.map.rations).toBe(START_RATIONS - 1);
    expect(result.encounter).toBe(false);
    expect(result.hungry).toBe(false);
  });

  it('meets something on a roll of 1, and goes hungry with no ration', () => {
    expect(moveParty(map, 1, 0, encounter)!.encounter).toBe(true);
    const starving = moveParty({ ...map, rations: 0 }, 1, 0, noEncounter)!;
    expect(starving.hungry).toBe(true);
    expect(starving.map.rations).toBe(0);
  });

  it('forages 0, 1 or 2 rations', () => {
    expect([1, 2, 3, 5, 6].map((roll) => forage(map, () => (roll - 0.5) / 6).found)).toEqual([0, 0, 1, 1, 2]);
  });
});

describe('fatigue and camps', () => {
  const map = generateHexMap({ level: 2, monsters, rng: seeded(5) });
  const calm = () => 0.99;

  it('lets a forced march take the step without the day or the ration, for a point of fatigue', () => {
    const result = moveParty(map, 1, 0, calm, { force: true })!;
    expect(result.dayPassed).toBe(false);
    expect(result.map.rations).toBe(START_RATIONS);
    expect(result.map.fatigue).toBe(1);
    expect(result.hungry).toBe(false);
  });

  it('refuses a forced march at the fatigue limit, but not an ordinary day', () => {
    const tired = { ...map, fatigue: MAX_FATIGUE };
    expect(moveParty(tired, 1, 0, calm, { force: true })).toBeNull();
    expect(moveParty(tired, 1, 0, calm)).not.toBeNull();
  });

  it('raises the chance of an encounter when the threshold is raised (full moon)', () => {
    const roll2 = () => 1.5 / 6; // a 2
    expect(moveParty(map, 1, 0, roll2)!.encounter).toBe(false);
    expect(moveParty(map, 1, 0, roll2, { encounterOn: 2 })!.encounter).toBe(true);
  });

  it('rests off one point in the open and two in a camp, and a camp makes the place safe', () => {
    const tired = { ...map, fatigue: 3 };
    expect(restDay(tired, calm).map.fatigue).toBe(2);
    const camped = makeCamp(tired, calm);
    expect(camped.map.fatigue).toBe(1); // 3 − 2
    expect(hexAt(camped.map, 0, 0)!.camp).toBe(true);
    expect(restDay(camped.map, () => 0).encounter).toBe(false); // a 1 would find a fire in the open
    expect(restDay(tired, () => 0).encounter).toBe(true);
    expect(restDay(camped.map, calm).map.fatigue).toBe(0);
  });

  it('walks a camped way without meeting anything on it', () => {
    const camped = makeCamp(map, calm).map;
    const away = moveParty(camped, 1, 0, calm)!.map;
    const back = moveParty(away, 0, 0, () => 0)!; // would be a 1
    expect(back.encounter).toBe(false);
  });

  it('shifts foraging by the season', () => {
    expect(forage(map, () => 0.99, -1).found).toBe(1); // a 6 drops to a 5
    expect(forage(map, () => 2.5 / 6, 1).found).toBe(1); // a 3 rises to a 4
    expect(forage(map, () => 1.5 / 6, -1).found).toBe(0);
  });
});

describe('growing the map', () => {
  const map = generateHexMap({ level: 3, monsters, rng: seeded(11) });
  const options = { level: 3, monsters, rng: seeded(12) };

  it('offers new land only from the edge of what is mapped', () => {
    expect(nextPatchCentre(map)).toBeNull(); // the party is in the middle
    const atEdge = { ...map, party: { q: 2, r: 0 } };
    expect(nextPatchCentre(atEdge)).toEqual({ q: 3, r: 2 });
    expect(expandMap(map, options)).toBeNull();
  });

  it('adds 19 unseen hexes beside the old ones, none on top of them', () => {
    const result = expandMap({ ...map, party: { q: 2, r: 0 } }, options)!;
    expect(result.added).toHaveLength(19);
    expect(result.added.every((hex) => !hex.seen && !hex.visited)).toBe(true);
    expect(result.map.hexes).toHaveLength(38);
    expect(new Set(result.map.hexes.map((h) => `${h.q},${h.r}`)).size).toBe(38);
    expect(result.map.patches).toEqual([{ q: 0, r: 0 }, { q: 3, r: 2 }]);
    expect(result.added.some((hex) => hex.feature.kind === 'dungeon')).toBe(true);
    // the new land touches the old: some new hex is next to some old one
    expect(result.added.some((hex) => map.hexes.some((old) => hexDistance(old, hex) === 1))).toBe(true);
  });

  it('tiles the plane: all six neighbouring patches are disjoint from each other and from the first', () => {
    let grown = map;
    for (const [dq, dr] of PATCH_VECTORS) {
      // stand where that patch is within reach, then grow
      const result = expandMap({ ...grown, party: { q: Math.round(dq * 0.6), r: Math.round(dr * 0.6) } }, { ...options, rng: seeded(dq * 7 + dr) });
      grown = result ? result.map : grown;
    }
    expect(new Set(grown.hexes.map((h) => `${h.q},${h.r}`)).size).toBe(grown.hexes.length);
    expect(grown.hexes.length).toBe(19 * grown.patches.length);
    expect(grown.patches.length).toBeGreaterThan(2);
  });
});

describe('places on the map', () => {
  const map = generateHexMap({ level: 3, monsters, rng: seeded(11) });
  const bare = map.hexes.find((hex) => hex.feature.kind === 'empty')!;
  const featured = map.hexes.find((hex) => hex.feature.kind !== 'empty')!;

  it('names a hex as typed and finds it again by name, case aside', () => {
    const named = setHexPlace(map, bare.q, bare.r, 'Last Inn ');
    expect(hexAt(named, bare.q, bare.r)?.place).toBe('Last Inn ');
    expect(hexesAtPlace(named, 'last inn').map((hex) => [hex.q, hex.r])).toEqual([[bare.q, bare.r]]);
    expect(hexPlaces(named)).toEqual(['Last Inn']);
    expect(hexesAtPlace(named, '')).toEqual([]);
  });

  it('removes the name when it is blank', () => {
    const named = setHexPlace(map, bare.q, bare.r, 'Inn');
    expect(hexAt(setHexPlace(named, bare.q, bare.r, '  '), bare.q, bare.r)?.place).toBeUndefined();
  });

  it('gives the journal the hex name, or a name made from its feature, kept on the hex', () => {
    const named = setHexPlace(map, bare.q, bare.r, 'Inn');
    expect(journalPlaceFor(named, hexAt(named, bare.q, bare.r)!, 'x')?.place).toBe('Inn');
    const made = journalPlaceFor(map, featured, 'Village (1,2)');
    expect(made?.place).toBe('Village (1,2)');
    expect(hexAt(made!.map, featured.q, featured.r)?.place).toBe('Village (1,2)');
  });

  it('says nothing about bare country unless asked', () => {
    expect(journalPlaceFor(map, bare, 'Grassland (0,0)')).toBeNull();
    expect(journalPlaceFor(map, bare, 'Grassland (0,0)', true)?.place).toBe('Grassland (0,0)');
  });
});

describe('water and rivers', () => {
  it('lets the sea keep itself, and reads what a sea hex holds', () => {
    expect([1, 7].map((roll) => nextBiome(roll, 'sea'))).toEqual(['sea', 'sea']);
    expect([8, 9, 10].map((roll) => nextBiome(roll, 'sea'))).toEqual(['grassland', 'marsh', 'hills']);
    expect([1, 2, 3, 6].map(seaFeature)).toEqual(['reef', 'island', 'empty', 'empty']);
    expect(SEA_ROLL).toBe(6);
  });

  it('always puts water beside the start village, whatever the dice', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const map = generateHexMap({ level: 2, monsters, rng: seeded(seed) });
      const around = neighbours(0, 0).map(([q, r]) => hexAt(map, q, r)!);
      expect(around.some((hex) => isWater(hex.biome)), `seed ${seed}`).toBe(true);
      expect(isWater(hexAt(map, 0, 0)!.biome)).toBe(false);
    }
  });

  it('holds only reefs, islands and open water in the sea, and never a dungeon, lair or settlement', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const map = generateHexMap({ level: 2, monsters, rng: seeded(seed) });
      for (const hex of map.hexes.filter((entry) => isWater(entry.biome))) expect(['empty', 'island', 'reef'], `seed ${seed}`).toContain(hex.feature.kind);
      for (const hex of map.hexes.filter((entry) => !isWater(entry.biome))) expect(['island', 'reef'], `seed ${seed}`).not.toContain(hex.feature.kind);
      expect(map.hexes.some((hex) => hex.feature.kind === 'dungeon' && isWater(hex.biome))).toBe(false);
      expect(map.hexes.some((hex) => hex.feature.kind === 'dungeon')).toBe(true);
    }
  });

  it('runs rivers over land only, in a connected line, in some of the patches', () => {
    let withRiver = 0;
    for (let seed = 1; seed <= 40; seed += 1) {
      const map = generateHexMap({ level: 2, monsters, rng: seeded(seed) });
      const river = map.hexes.filter((hex) => hex.river);
      expect(river.every((hex) => !isWater(hex.biome)), `seed ${seed}`).toBe(true);
      if (river.length > 0) {
        withRiver += 1;
        // every river hex touches another one of the river
        if (river.length > 1) for (const hex of river) expect(river.some((other) => other !== hex && hexDistance(hex, other) === 1), `seed ${seed}`).toBe(true);
      }
    }
    expect(withRiver).toBeGreaterThan(10);
    expect(withRiver).toBeLessThan(40);
  });

  it('cannot be walked into the sea, except to step back aboard the ship that lies there', () => {
    const map = generateHexMap({ level: 2, monsters, rng: seeded(3) });
    const sea = neighbours(0, 0).map(([q, r]) => hexAt(map, q, r)!).find((hex) => isWater(hex.biome))!;
    expect(canMoveTo(map, sea.q, sea.r)).toBe(false);
    expect(canMoveTo(map, sea.q, sea.r, { q: sea.q, r: sea.r })).toBe(true);
    expect(canMoveTo(map, sea.q, sea.r, { q: 9, r: 9 })).toBe(false);
    expect(moveParty(map, sea.q, sea.r, seeded(1))).toBeNull();
  });

  it('makes a ford cost a second day and a second ration, unless a settlement bridges the river', () => {
    const base = generateHexMap({ level: 2, monsters, rng: seeded(5) });
    const land = neighbours(0, 0).map(([q, r]) => hexAt(base, q, r)!).find((hex) => !isWater(hex.biome))!;
    const withRiver = (feature: { kind: 'empty' } | { kind: 'settlement'; settlement: 'village' }) => ({
      ...base,
      hexes: base.hexes.map((hex) => (hex === land ? { ...hex, river: true, feature } : hex)),
    });
    const ford = moveParty(withRiver({ kind: 'empty' }), land.q, land.r, () => 0.99)!;
    expect(ford).toMatchObject({ days: 2, forded: true, dayPassed: true });
    expect(ford.map.rations).toBe(START_RATIONS - 2);
    const bridge = moveParty(withRiver({ kind: 'settlement', settlement: 'village' }), land.q, land.r, () => 0.99)!;
    expect(bridge).toMatchObject({ days: 1, forded: false });
    expect(needsFord(hexAt(withRiver({ kind: 'empty' }), land.q, land.r))).toBe(true);
    const forced = moveParty(withRiver({ kind: 'empty' }), land.q, land.r, () => 0.99, { force: true })!;
    expect(forced).toMatchObject({ days: 0, dayPassed: false });
    expect(forced.map.fatigue).toBe(2);
    expect(forced.map.rations).toBe(START_RATIONS);
  });

  it('grows more map from the edge, whose sea may continue the sea beside it', () => {
    const map = generateHexMap({ level: 2, monsters, rng: seeded(9) });
    const grown = expandMap({ ...map, party: { q: 2, r: 0 } }, { level: 2, monsters, rng: seeded(10) });
    expect(grown?.added).toHaveLength(19);
    expect(grown!.added.every((hex) => !hex.visited)).toBe(true);
    for (const hex of grown!.added.filter((entry) => isWater(entry.biome))) expect(['empty', 'island', 'reef']).toContain(hex.feature.kind);
  });


  it('carries the sea across the seam: every sea hex on the old edge has sea beside it in the new patch', () => {
    for (let seed = 1; seed <= 40; seed += 1) {
      const map = generateHexMap({ level: 2, monsters, rng: seeded(seed) });
      const grown = expandMap({ ...map, party: { q: 2, r: 0 } }, { level: 2, monsters, rng: seeded(seed + 100) })!;
      for (const water of map.hexes.filter((hex) => isWater(hex.biome))) {
        const across = grown.added.filter((hex) => hexDistance(hex, water) === 1);
        if (across.length > 0) expect(across.some((hex) => isWater(hex.biome)), `seed ${seed} at ${water.q},${water.r}`).toBe(true);
      }
      expect(grown.added).toHaveLength(19);
    }
  });

  it('carries a river on into the new patch when it leaves the old land without reaching water', () => {
    let carried = 0;
    for (let seed = 1; seed <= 40; seed += 1) {
      const map = generateHexMap({ level: 2, monsters, rng: seeded(seed) });
      // dry old land, the one river ending on the edge toward the next patch (centre 3,2)
      const dry: Hex[] = map.hexes.map((hex) => ({ ...hex, biome: isWater(hex.biome) ? 'grassland' : hex.biome, river: undefined, feature: isWater(hex.biome) ? { kind: 'empty' } : hex.feature }));
      const mouth = dry.find((hex) => hexDistance(hex, { q: 3, r: 2 }) === 3)!;
      mouth.river = true;
      const grown = expandMap({ ...map, hexes: dry, party: { q: 2, r: 0 } }, { level: 2, monsters, rng: seeded(seed + 200) })!;
      const beside = grown.added.filter((hex) => hexDistance(hex, mouth) === 1 && !isWater(hex.biome));
      if (beside.length === 0) continue;
      expect(beside.some((hex) => hex.river), `seed ${seed}`).toBe(true);
      const river = grown.added.filter((hex) => hex.river);
      expect(river.every((hex) => !isWater(hex.biome))).toBe(true);
      carried += 1;
    }
    expect(carried).toBeGreaterThan(20);
  });

  /** How many separate bodies of water a map has. */
  const seaBodies = (hexes: Hex[]): number => {
    const water = hexes.filter((hex) => isWater(hex.biome));
    const seen = new Set<Hex>();
    let bodies = 0;
    for (const start of water) {
      if (seen.has(start)) continue;
      bodies += 1;
      const queue = [start];
      seen.add(start);
      while (queue.length > 0) {
        const hex = queue.pop() as Hex;
        for (const other of water) {
          if (seen.has(other) || hexDistance(hex, other) !== 1) continue;
          seen.add(other);
          queue.push(other);
        }
      }
    }
    return bodies;
  };

  it('makes all the water of a patch one sea, whatever the dice, and keeps the start village dry with a dungeon to find', () => {
    for (let seed = 1; seed <= 60; seed += 1) {
      const map = generateHexMap({ level: 2, monsters, rng: seeded(seed) });
      expect(seaBodies(map.hexes), `seed ${seed}`).toBeLessThanOrEqual(1);
      expect(isWater(hexAt(map, 0, 0)!.biome), `seed ${seed}`).toBe(false);
      expect(map.hexes.some((hex) => hex.feature.kind === 'dungeon' && !isWater(hex.biome)), `seed ${seed}`).toBe(true);
    }
  });

  it('keeps the sea one sea as the map grows patch by patch', () => {
    for (let seed = 1; seed <= 25; seed += 1) {
      let map = generateHexMap({ level: 2, monsters, rng: seeded(seed) });
      for (const [dq, dr] of PATCH_VECTORS) {
        const grown = expandMap({ ...map, party: { q: Math.round(dq * 0.6), r: Math.round(dr * 0.6) } }, { level: 2, monsters, rng: seeded(seed * 31 + dq * 7 + dr) });
        if (grown) map = grown.map;
      }
      expect(map.patches.length, `seed ${seed}`).toBeGreaterThan(3);
      expect(seaBodies(map.hexes), `seed ${seed}`).toBeLessThanOrEqual(1);
      expect(map.hexes.filter((hex) => hex.feature.kind === 'dungeon' && !isWater(hex.biome)).length, `seed ${seed}`).toBeGreaterThanOrEqual(map.patches.length);
    }
  });

  it('does not carry a river that ended in the sea', () => {
    const map = generateHexMap({ level: 2, monsters, rng: seeded(4) });
    const dry: Hex[] = map.hexes.map((hex) => ({ ...hex, river: undefined }));
    const mouth = dry.find((hex) => hexDistance(hex, { q: 3, r: 2 }) === 3 && !isWater(hex.biome))!;
    mouth.river = true;
    // a sea hex beside the river's end closes it
    const sea = dry.find((hex) => hexDistance(hex, mouth) === 1 && hexDistance(hex, { q: 3, r: 2 }) > 3)!;
    sea.biome = 'sea';
    const grown = expandMap({ ...map, hexes: dry, party: { q: 2, r: 0 } }, { level: 2, monsters, rng: seeded(204) })!;
    expect(grown.added.filter((hex) => hexDistance(hex, mouth) === 1).some((hex) => hex.river)).toBe(false);
  });
});

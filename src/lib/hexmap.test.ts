import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters/types';
import {
  canMoveTo,
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
  MAX_FATIGUE,
  moveParty,
  restDay,
  returnToHex,
  nextBiome,
  nextPatchCentre,
  PATCH_VECTORS,
  packSize,
  pickMonster,
  settlementKind,
  startBiome,
  START_RATIONS,
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

describe('returnToHex', () => {
  const map = { ...generateHexMap({ level: 3, monsters, rng: seeded(11) }), rations: 2, fatigue: 4 };

  it('stands the party on the hex of the key, visited, fed and rested', () => {
    const target = map.hexes.find((hex) => hex.q === 1 && hex.r === 0)!;
    const back = returnToHex(map, '1,0')!;
    expect(back.party).toEqual({ q: 1, r: 0 });
    expect(hexAt(back, 1, 0)).toMatchObject({ visited: true, seen: true, feature: target.feature });
    expect(back.rations).toBe(START_RATIONS);
    expect(back.fatigue).toBe(0);
    expect(back.hexes).toHaveLength(map.hexes.length);
  });

  it('keeps more rations than a fresh pack has', () => {
    expect(returnToHex({ ...map, rations: 12 }, '0,0')!.rations).toBe(12);
  });

  it('is null for a key that is not a hex of the map, or not a key at all', () => {
    expect(returnToHex(map, '40,40')).toBeNull();
    expect(returnToHex(map, 'home')).toBeNull();
  });
});

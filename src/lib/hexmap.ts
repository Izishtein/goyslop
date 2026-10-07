import type { Monster } from '../data/monsters/types';
import type { Rng } from './encounter';
import type { Faction, RelationEntry } from './factions';

/*
 * The hex sandbox. Sword World has no overland rules of its own, so this is a small procedure of
 * our own, built on the common idea of hexcrawl generators: lay out a patch of hexes with biomes
 * from the outside in, give each a feature, reveal the map as the party walks it. Every number and
 * every word below is original; the monster tables are not written out at all — a biome asks the
 * monster catalogue (Monstrous Lore) for what lives there, at the party's level.
 */

export const BIOMES = ['grassland', 'forest', 'hills', 'marsh', 'mountains'] as const;
export type Biome = (typeof BIOMES)[number];

export type FeatureKind = 'landmark' | 'settlement' | 'lair' | 'dungeon' | 'empty';
export const SETTLEMENT_KINDS = ['hamlet', 'village', 'town', 'fortress', 'tower', 'monastery'] as const;
export type SettlementKind = (typeof SETTLEMENT_KINDS)[number];

/** How many landmark names the i18n tables hold per group (natural, built, magical). */
export const LANDMARK_COUNT = 24;

export interface HexFeature {
  kind: FeatureKind;
  /** A settlement's size and character. */
  settlement?: SettlementKind;
  /** Index into the landmark names (1…LANDMARK_COUNT). */
  landmark?: number;
  /** The creature in a lair or the guardian of a dungeon, chosen when the map is made. */
  monsterId?: string;
  /** Its number, when more than one. */
  count?: number;
}

export interface Hex {
  q: number;
  r: number;
  biome: Biome;
  feature: HexFeature;
  /** The party has been here. */
  visited: boolean;
  /** Seen from a neighbour: its biome is known, its feature is not until visited. */
  seen: boolean;
  /** The party has made camp here: the way is known, and a night's rest is safe. */
  camp?: boolean;
}

export interface HexMap {
  hexes: Hex[];
  party: { q: number; r: number };
  rations: number;
  /** 0–5: a forced march adds one; each point is -1 to the party's checks, and 5 means stop and rest. */
  fatigue: number;
  /** Centres of the 19-hex patches the map is made of (empty on a map saved before patches: the one at 0,0). */
  patches: { q: number; r: number }[];
  /** The level the monsters were chosen for. */
  level: number;
  /** Who holds what — filled in by withFactions (lib/factions.ts) once the map exists. */
  factions: Faction[];
  relations: RelationEntry[];
}

export const EMPTY_HEXMAP: HexMap = { hexes: [], party: { q: 0, r: 0 }, rations: 0, fatigue: 0, patches: [], level: 1, factions: [], relations: [] };

export const START_RATIONS = 7;
export const MAX_FATIGUE = 5;

// ---- geometry: axial coordinates, pointy-top hexes ----

/** The six neighbours, clockwise from the one straight up-right. */
export const DIRECTIONS: readonly [number, number][] = [
  [1, -1],
  [1, 0],
  [0, 1],
  [-1, 1],
  [-1, 0],
  [0, -1],
];

export const neighbours = (q: number, r: number): [number, number][] => DIRECTIONS.map(([dq, dr]) => [q + dq, r + dr]);

export function hexDistance(a: { q: number; r: number }, b: { q: number; r: number }): number {
  return (Math.abs(a.q - b.q) + Math.abs(a.r - b.r) + Math.abs(a.q + a.r - b.q - b.r)) / 2;
}

export const hexKey = (q: number, r: number): string => `${q},${r}`;

// ---- dice ----

const die = (sides: number, rng: Rng): number => 1 + Math.floor(rng() * sides);

// ---- biomes ----

/** The first hex: grassland is the commonest, mountains the rarest. */
export function startBiome(roll: number): Biome {
  if (roll <= 2) return 'grassland';
  if (roll === 3) return 'forest';
  if (roll === 4) return 'hills';
  if (roll === 5) return 'marsh';
  return 'mountains';
}

/** Every further hex tends to continue the land it grows from (d10: 1–4 and 10 the same, then one biome per number). */
export function nextBiome(roll: number, previous: Biome): Biome {
  if (roll <= 4 || roll === 10) return previous;
  return BIOMES[roll - 5];
}

// ---- features ----

export function settlementKind(roll: number): SettlementKind {
  return SETTLEMENT_KINDS[Math.min(roll, 6) - 1];
}

/** d12: 1–5 a landmark, 6–7 a settlement, 8–9 a lair, 10 a dungeon, 11–12 nothing to speak of. */
export function featureKind(roll: number): FeatureKind {
  if (roll <= 5) return 'landmark';
  if (roll <= 7) return 'settlement';
  if (roll <= 9) return 'lair';
  if (roll === 10) return 'dungeon';
  return 'empty';
}

// ---- monsters by biome ----

/** What a monster's Habitat line has to mention for it to live in a biome. "Various" fits anywhere. */
const HABITAT_WORDS: Record<Biome, RegExp> = {
  grassland: /plain|grassland|meadow|wilderness|desert|coast/i,
  forest: /forest|secluded/i,
  hills: /hill|highland|wasteland|barren|wilderness|cold region/i,
  marsh: /swamp|marsh|wetland|shallow|river|lake|pond/i,
  mountains: /mountain|cave|alpine|volcano|cold region/i,
};
/** Where lairs and dungeons hide, whatever the biome. */
const UNDERGROUND = /ruin|labyrinth|cave|cemetery|tomb|underground/i;

export function livesIn(monster: Monster, biome: Biome): boolean {
  return HABITAT_WORDS[biome].test(monster.habitat) || /various/i.test(monster.habitat);
}

/** Monsters that make a fair encounter for a party of this level (Familiars have no HP of their own and are left out). */
function fair(monsters: Monster[], level: number, spread: number): Monster[] {
  return monsters.filter((monster) => monster.category !== 'Familiars' && !monster.levelPlus && monster.level >= level - spread && monster.level <= level + spread);
}

/**
 * A monster of the party's level for a biome: the level window widens until something fits, and a
 * monster that names the biome outweighs one that is merely "Various".
 */
export function pickMonster(monsters: Monster[], biome: Biome, level: number, rng: Rng = Math.random, underground = false): Monster | null {
  for (const spread of [1, 2, 3, 5, 99]) {
    const pool = fair(monsters, level, spread).filter((monster) => (underground ? UNDERGROUND.test(monster.habitat) || livesIn(monster, biome) : livesIn(monster, biome)));
    if (pool.length === 0) continue;
    const weighted = pool.flatMap((monster) => (/various/i.test(monster.habitat) ? [monster] : [monster, monster, monster]));
    return weighted[Math.floor(rng() * weighted.length)];
  }
  return null;
}

/** How many of them: lone beasts and leaders come alone, weaker ones in a pack (1–3, 1d3 below the party's level). */
export function packSize(monster: Monster, level: number, rng: Rng = Math.random): number {
  if (monster.level > level) return 1;
  return monster.level < level ? die(3, rng) : die(2, rng);
}

// ---- building the map ----

export interface GenerateOptions {
  level: number;
  monsters: Monster[];
  rng?: Rng;
}

/** The 19 cells of the map in generation order: the centre, the six around it, the twelve of the outer ring. */
function cells(): { q: number; r: number; from: number }[] {
  const out: { q: number; r: number; from: number }[] = [{ q: 0, r: 0, from: -1 }];
  for (const [dq, dr] of DIRECTIONS) out.push({ q: dq, r: dr, from: 0 });
  for (let ring = 0; ring < 6; ring += 1) {
    const [aq, ar] = DIRECTIONS[ring];
    const [bq, br] = DIRECTIONS[(ring + 1) % 6];
    // the corner straight out from ring hex `ring`, and the hex between it and the next corner
    out.push({ q: aq * 2, r: ar * 2, from: ring + 1 });
    out.push({ q: aq + bq, r: ar + br, from: ring + 1 });
  }
  return out;
}

function makeFeature(kind: FeatureKind, biome: Biome, options: GenerateOptions, rng: Rng): HexFeature {
  if (kind === 'landmark') return { kind, landmark: die(LANDMARK_COUNT, rng) };
  if (kind === 'settlement') return { kind, settlement: settlementKind(die(6, rng)) };
  if (kind === 'lair' || kind === 'dungeon') {
    const level = kind === 'dungeon' ? options.level + 1 : options.level;
    const monster = pickMonster(options.monsters, biome, level, rng, kind === 'dungeon');
    return monster ? { kind, monsterId: monster.id, count: packSize(monster, level, rng) } : { kind };
  }
  return { kind };
}

interface PatchOptions {
  /** The biome the patch's centre grows from, when it grows from existing land. */
  from?: Biome;
  /** The first patch starts with a village (a place to set out from), the party on it. */
  start: boolean;
}

/** One patch of 19 hexes around `centre`: biomes outward from the middle, a feature in each hex, a dungeon in every patch. */
function buildPatch(centre: { q: number; r: number }, options: GenerateOptions, rng: Rng, patch: PatchOptions): Hex[] {
  const placed: Hex[] = [];
  for (const cell of cells()) {
    const centreCell = cell.from < 0;
    const biome = centreCell ? (patch.from ? nextBiome(die(10, rng), patch.from) : startBiome(die(6, rng))) : nextBiome(die(10, rng), placed[cell.from].biome);
    const village = centreCell && patch.start;
    const feature: HexFeature = village ? { kind: 'settlement', settlement: 'village' } : makeFeature(featureKind(die(12, rng)), biome, options, rng);
    placed.push({ q: centre.q + cell.q, r: centre.r + cell.r, biome, feature, visited: village, seen: village });
  }
  if (!placed.some((hex) => hex.feature.kind === 'dungeon')) {
    const candidates = placed.filter((hex) => hex.feature.kind === 'landmark' || hex.feature.kind === 'empty');
    const hex = candidates[Math.floor(rng() * candidates.length)] ?? placed[placed.length - 1];
    hex.feature = makeFeature('dungeon', hex.biome, options, rng);
  }
  return placed;
}

/**
 * A fresh patch of 19 hexes, the party standing in the centre one. The first hex is always a
 * village (somewhere to start from), and there is always at least one dungeon to find.
 */
export function generateHexMap(options: GenerateOptions): HexMap {
  const rng = options.rng ?? Math.random;
  const placed = buildPatch({ q: 0, r: 0 }, options, rng, { start: true });
  for (const [q, r] of neighbours(0, 0)) {
    const hex = placed.find((entry) => entry.q === q && entry.r === r);
    if (hex) hex.seen = true;
  }
  return { hexes: placed, party: { q: 0, r: 0 }, rations: START_RATIONS, fatigue: 0, patches: [{ q: 0, r: 0 }], level: options.level, factions: [], relations: [] };
}

// ---- growing the map ----

/** Where the next patch of 19 sits from a patch's centre: five hexes away, so the patches fit edge to edge. */
export const PATCH_VECTORS: readonly [number, number][] = [
  [3, 2],
  [-2, 5],
  [-5, 3],
  [-3, -2],
  [2, -5],
  [5, -3],
];

export function patchCentres(map: HexMap): { q: number; r: number }[] {
  if (map.patches.length > 0) return map.patches;
  return map.hexes.length > 0 ? [{ q: 0, r: 0 }] : [];
}

/** The unbuilt patch whose centre is nearest the party, if it is within reach (the party stands on the edge of what is mapped). */
export function nextPatchCentre(map: HexMap): { q: number; r: number } | null {
  const taken = new Set(patchCentres(map).map((c) => hexKey(c.q, c.r)));
  let best: { q: number; r: number } | null = null;
  for (const centre of patchCentres(map)) {
    for (const [dq, dr] of PATCH_VECTORS) {
      const candidate = { q: centre.q + dq, r: centre.r + dr };
      if (taken.has(hexKey(candidate.q, candidate.r))) continue;
      if (best === null || hexDistance(map.party, candidate) < hexDistance(map.party, best)) best = candidate;
    }
  }
  return best !== null && hexDistance(map.party, best) <= 3 ? best : null;
}

/**
 * Opens the next patch of land beyond the edge: 19 new hexes (unseen), their biome growing out of
 * the nearest existing hex. The factions of the new patch are the caller's to add (see factions.ts).
 */
export function expandMap(map: HexMap, options: GenerateOptions): { map: HexMap; added: Hex[] } | null {
  const centre = nextPatchCentre(map);
  if (!centre) return null;
  const rng = options.rng ?? Math.random;
  const nearest = [...map.hexes].sort((a, b) => hexDistance(a, centre) - hexDistance(b, centre))[0];
  const added = buildPatch(centre, options, rng, { start: false, from: nearest?.biome });
  return { map: { ...map, hexes: [...map.hexes, ...added], patches: [...patchCentres(map), centre] }, added };
}

// ---- travel ----

export function hexAt(map: HexMap, q: number, r: number): Hex | undefined {
  return map.hexes.find((hex) => hex.q === q && hex.r === r);
}

/** Whether the party can step onto this hex: it is on the map and next to where they stand. */
export function canMoveTo(map: HexMap, q: number, r: number): boolean {
  return hexDistance(map.party, { q, r }) === 1 && hexAt(map, q, r) !== undefined;
}

export interface MoveResult {
  map: HexMap;
  /** A wandering encounter met on the way (d6 at or below the threshold). */
  encounter: boolean;
  /** The party had no ration left to eat at the day's end. */
  hungry: boolean;
  /** A day went by: false for a forced march, which spends fatigue instead of a day. */
  dayPassed: boolean;
}

export interface MoveOptions {
  /** Push on without stopping: +1 fatigue, no day, no ration (not past MAX_FATIGUE). */
  force?: boolean;
  /** A wandering encounter on a d6 of this or less (the calendar raises it at a full moon). */
  encounterOn?: number;
}

/**
 * One day's travel into a neighbouring hex: the party arrives (the hex and its neighbours become
 * known), eats a ration, and may meet something on the road — unless the way is already a camped
 * route. A forced march takes the step without the day: it costs a point of fatigue instead.
 */
export function moveParty(map: HexMap, q: number, r: number, rng: Rng = Math.random, options: MoveOptions = {}): MoveResult | null {
  if (!canMoveTo(map, q, r)) return null;
  if (options.force && map.fatigue >= MAX_FATIGUE) return null;
  const next = neighbours(q, r);
  const hexes = map.hexes.map((hex) => {
    if (hex.q === q && hex.r === r) return { ...hex, visited: true, seen: true };
    if (next.some(([nq, nr]) => nq === hex.q && nr === hex.r)) return { ...hex, seen: true };
    return hex;
  });
  const camped = hexAt(map, q, r)?.camp === true;
  const forced = options.force === true;
  const hungry = !forced && map.rations <= 0;
  return {
    map: {
      ...map,
      hexes,
      party: { q, r },
      rations: forced ? map.rations : Math.max(0, map.rations - 1),
      fatigue: forced ? map.fatigue + 1 : map.fatigue,
    },
    encounter: !camped && die(6, rng) <= (options.encounterOn ?? 1),
    hungry,
    dayPassed: !forced,
  };
}

/**
 * A day's rest. Camped, it takes off two points of fatigue and nothing finds you; in the open, one
 * point, and a d6 of 1 brings something to the fire.
 */
export function restDay(map: HexMap, rng: Rng = Math.random): { map: HexMap; encounter: boolean; hungry: boolean } {
  const hex = hexAt(map, map.party.q, map.party.r);
  const camped = hex?.camp === true;
  return {
    map: { ...map, fatigue: Math.max(0, map.fatigue - (camped ? 2 : 1)), rations: Math.max(0, map.rations - 1) },
    encounter: !camped && die(6, rng) === 1,
    hungry: map.rations <= 0,
  };
}

/** Making camp takes the day like a rest does, and the camp it leaves is there from that night: two points of fatigue, nothing at the fire. */
export function makeCamp(map: HexMap, rng: Rng = Math.random): { map: HexMap; encounter: boolean; hungry: boolean } {
  const hexes = map.hexes.map((hex) => (hex.q === map.party.q && hex.r === map.party.r ? { ...hex, camp: true } : hex));
  return restDay({ ...map, hexes }, rng);
}

/** Foraging for a day instead of travelling: d6 (plus the season's modifier), 1–2 nothing, 3–5 one ration, 6 two. */
export function forage(map: HexMap, rng: Rng = Math.random, modifier = 0): { map: HexMap; found: number } {
  const roll = Math.min(6, Math.max(1, die(6, rng) + modifier));
  const found = roll <= 2 ? 0 : roll === 6 ? 2 : 1;
  return { map: { ...map, rations: map.rations + found }, found };
}

/** What happens at a landmark when the party looks around it (d6: hazard, nothing, nothing, something odd, monsters, monsters). */
export type LandmarkOutcome = 'hazard' | 'empty' | 'special' | 'monsters';
export function landmarkOutcome(roll: number): LandmarkOutcome {
  if (roll === 1) return 'hazard';
  if (roll <= 3) return 'empty';
  if (roll === 4) return 'special';
  return 'monsters';
}

import type { Monster } from '../data/monsters/types';
import type { StatusEffect } from '../types/character';
import { upsertManagedEffect } from './formulas/status-effects';
import type { Rng } from './encounter';
import type { Faction, RelationEntry } from './factions';

/*
 * The hex sandbox. Sword World has no overland rules of its own, so this is a small procedure of
 * our own, built on the common idea of hexcrawl generators: lay out a patch of hexes with biomes
 * from the outside in, give each a feature, reveal the map as the party walks it. Every number and
 * every word below is original; the monster tables are not written out at all — a biome asks the
 * monster catalogue (Monstrous Lore) for what lives there, at the party's level.
 */

export const BIOMES = ['grassland', 'forest', 'hills', 'marsh', 'mountains', 'sea'] as const;
export type Biome = (typeof BIOMES)[number];

/** The biomes a party walks on; the sea is crossed by ship. */
export const LAND_BIOMES = ['grassland', 'forest', 'hills', 'marsh', 'mountains'] as const;
export const isWater = (biome: Biome): boolean => biome === 'sea';

/** 'island' and 'reef' are features of the sea: a landing to search, a rock that tears a hull. */
export type FeatureKind = 'landmark' | 'settlement' | 'lair' | 'dungeon' | 'empty' | 'island' | 'reef';
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
  /** The name the campaign log knows this hex by: what the journal's "where the story is" is set to here. */
  place?: string;
  /** A river runs through the hex: a ford costs the party an extra day unless a settlement stands on it (a bridge). */
  river?: boolean;
  /** A harbour's market: one d6 per good (GOODS order), made when a ship first calls and drifting daily. */
  market?: number[];
  /** An island already searched. */
  explored?: boolean;
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
  /** The journal's active place follows the party onto every hex that has a name or a feature. */
  followJournal?: boolean;
}

export const EMPTY_HEXMAP: HexMap = { hexes: [], party: { q: 0, r: 0 }, rations: 0, fatigue: 0, patches: [], level: 1, factions: [], relations: [] };

export const START_RATIONS = 7;
export const MAX_FATIGUE = 5;

/** Id of the status effect that carries the party's fatigue onto a character sheet. */
export const FATIGUE_EFFECT_ID = 'hexmap-fatigue';

/**
 * The character's status effects with the fatigue effect brought up to date: -N to Accuracy, Evasion,
 * Fortitude, Willpower and every other check, and gone at 0. Returns the same array when nothing changes,
 * so it can be compared by identity.
 */
export function withFatigueEffect(effects: StatusEffect[], fatigue: number, name: string): StatusEffect[] {
  const modifiers = fatigue > 0 ? PENALTY_FIELDS.map((field) => ({ field, value: -fatigue })) : [];
  return upsertManagedEffect(effects, FATIGUE_EFFECT_ID, name, 'hexmap', modifiers);
}

/** The fields a general weariness (fatigue, hunger) lowers: Accuracy, Evasion, the saves and every other check. */
export const PENALTY_FIELDS = ['accuracy', 'evasion', 'fortitude', 'willpower', 'actionCheck'] as const;

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

/**
 * Every further hex tends to continue what it grows from (d10: 1–4 and 10 the same, then one land biome per number).
 * Water clings together more: out of the sea d10 1–7 stays sea, 8 a grassland shore, 9 a marsh, 10 hills.
 */
export function nextBiome(roll: number, previous: Biome): Biome {
  if (previous === 'sea') return roll <= 7 ? 'sea' : roll === 8 ? 'grassland' : roll === 9 ? 'marsh' : 'hills';
  if (roll <= 4 || roll === 10) return previous;
  return BIOMES[roll - 5];
}

/** Land that, on a d6 of 6, gives way to sea: about one hex in six becomes water, mostly in clusters since the sea keeps itself. */
export const SEA_ROLL = 6;

/** What a hex of open water holds: d6, 1 a reef, 2 an island, otherwise nothing but waves. */
export function seaFeature(roll: number): FeatureKind {
  return roll === 1 ? 'reef' : roll === 2 ? 'island' : 'empty';
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
  sea: /sea|ocean|coast|water|reef|deep/i,
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
  if (isWater(biome)) return { kind: seaFeature(die(6, rng)) };
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
    const parent: Biome | undefined = centreCell ? patch.from : placed[cell.from].biome;
    let biome = parent === undefined ? startBiome(die(6, rng)) : nextBiome(die(10, rng), parent);
    // the start of the first patch is always land: it holds the village the party sets out from
    const village = centreCell && patch.start;
    if (!village && parent !== undefined && !isWater(parent) && !isWater(biome) && die(6, rng) === SEA_ROLL) biome = 'sea';
    const feature: HexFeature = village ? { kind: 'settlement', settlement: 'village' } : makeFeature(featureKind(die(12, rng)), biome, options, rng);
    placed.push({ q: centre.q + cell.q, r: centre.r + cell.r, biome, feature, visited: village, seen: village });
  }
  if (patch.start) ensureHarbour(placed, options, rng);
  if (!placed.some((hex) => hex.feature.kind === 'dungeon')) {
    const candidates = placed.filter((hex) => !isWater(hex.biome) && (hex.feature.kind === 'landmark' || hex.feature.kind === 'empty'));
    const hex = candidates[Math.floor(rng() * candidates.length)] ?? placed.find((entry) => !isWater(entry.biome)) ?? placed[placed.length - 1];
    hex.feature = makeFeature('dungeon', hex.biome, options, rng);
  }
  if (die(6, rng) <= RIVER_ON) addRiver(placed, rng);
  return placed;
}

/** A patch has a river on a d6 of this or less. */
export const RIVER_ON = 4;

/** The start village always has water beside it: if the dice left none, a bay is cut from the ring around it. */
function ensureHarbour(placed: Hex[], options: GenerateOptions, rng: Rng): void {
  const centre = placed[0];
  const ring = placed.filter((hex) => hexDistance(hex, centre) === 1);
  if (ring.some((hex) => isWater(hex.biome))) return;
  const shore = ring[Math.floor(rng() * ring.length)];
  const bay = [shore, ...placed.filter((hex) => hexDistance(hex, centre) === 2 && hexDistance(hex, shore) === 1)];
  for (const hex of bay) {
    hex.biome = 'sea';
    hex.feature = makeFeature('empty', 'sea', options, rng);
  }
}

/**
 * A river for the patch: from the hills or mountains (any land failing those) down to the nearest water of the
 * patch, one hex at a time, or — with no water in the patch — straight across it in one direction. The hexes it
 * passes are marked; sea and the start village's hex are not.
 */
function addRiver(placed: Hex[], rng: Rng): void {
  const land = placed.filter((hex) => !isWater(hex.biome));
  if (land.length === 0) return;
  const high = land.filter((hex) => hex.biome === 'mountains' || hex.biome === 'hills');
  const sources = high.length > 0 ? high : land;
  let at = sources[Math.floor(rng() * sources.length)];
  const water = placed.filter((hex) => isWater(hex.biome));
  const target = water.length > 0 ? [...water].sort((a, b) => hexDistance(a, at) - hexDistance(b, at))[0] : undefined;
  const heading = DIRECTIONS[Math.floor(rng() * 6)];
  at.river = true;
  for (let step = 0; step < 8; step += 1) {
    const options = neighbours(at.q, at.r)
      .map(([q, r]) => placed.find((hex) => hex.q === q && hex.r === r))
      .filter((hex): hex is Hex => hex !== undefined && !hex.river);
    if (options.length === 0) return;
    let next: Hex | undefined;
    if (target) {
      const best = Math.min(...options.map((hex) => hexDistance(hex, target)));
      const nearest = options.filter((hex) => hexDistance(hex, target) === best);
      next = nearest[Math.floor(rng() * nearest.length)];
    } else {
      const goal = { q: at.q + heading[0] * 3, r: at.r + heading[1] * 3 };
      next = [...options].sort((a, b) => hexDistance(a, goal) - hexDistance(b, goal))[0];
    }
    if (!next || isWater(next.biome)) return;
    next.river = true;
    at = next;
  }
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

/**
 * Landfall: the party steps ashore in a new land. A fresh patch of 19 hexes whose centre is the harbour town
 * (of the kind the quay belonged to), with the party in it, fed and rested. The old land stays behind.
 */
export function landfall(options: GenerateOptions, settlement: SettlementKind): HexMap {
  const map = generateHexMap(options);
  return { ...map, hexes: map.hexes.map((hex) => (hex.q === 0 && hex.r === 0 ? { ...hex, feature: { kind: 'settlement' as const, settlement } } : hex)) };
}

/**
 * The party comes back ashore at a hex of the land map it sailed from ("q,r", as a voyage keeps it): the
 * hex is theirs again, fed and rested as after any stay in a harbour town. Null when the key is not a hex of this map
 * (the land was replaced in the meantime).
 */
export function returnToHex(map: HexMap, key: string): HexMap | null {
  const match = /^(-?\d+),(-?\d+)$/.exec(key);
  if (!match) return null;
  const q = Number(match[1]);
  const r = Number(match[2]);
  if (!hexAt(map, q, r)) return null;
  const hexes = map.hexes.map((hex) => (hex.q === q && hex.r === r ? { ...hex, visited: true, seen: true } : hex));
  return { ...map, hexes, party: { q, r }, rations: Math.max(map.rations, START_RATIONS), fatigue: 0 };
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

/**
 * Whether the party can walk onto this hex: it is on the map, next to where they stand and land — the sea is
 * crossed in a ship (lib/voyage.ts), which the party may also step back aboard from the shore (`ship`).
 */
export function canMoveTo(map: HexMap, q: number, r: number, ship?: { q: number; r: number } | null): boolean {
  const target = hexAt(map, q, r);
  if (!target || hexDistance(map.party, { q, r }) !== 1) return false;
  return !isWater(target.biome) || (!!ship && ship.q === q && ship.r === r);
}

/** Whether a river here must be forded: the hex has one and no settlement to bridge it. */
export function needsFord(hex: Hex | undefined): boolean {
  return !!hex?.river && hex.feature.kind !== 'settlement';
}

export interface MoveResult {
  map: HexMap;
  /** A wandering encounter met on the way (d6 at or below the threshold). */
  encounter: boolean;
  /** The party had no ration left to eat at the day's end. */
  hungry: boolean;
  /** A day went by: false for a forced march, which spends fatigue instead of a day. */
  dayPassed: boolean;
  /** Days the step took: 1, or 2 when a river had to be forded (0 on a forced march). */
  days: number;
  /** A river was forded on this step. */
  forded: boolean;
}

export interface MoveOptions {
  /** Push on without stopping: +1 fatigue, no day, no ration (not past MAX_FATIGUE). */
  force?: boolean;
  /** A wandering encounter on a d6 of this or less (the calendar raises it at a full moon). */
  encounterOn?: number;
  /** Where the party's ship lies: the one water hex it may step onto. */
  ship?: { q: number; r: number } | null;
}

/**
 * One day's travel into a neighbouring hex: the party arrives (the hex and its neighbours become
 * known), eats a ration, and may meet something on the road — unless the way is already a camped
 * route. A forced march takes the step without the day: it costs a point of fatigue instead.
 */
export function moveParty(map: HexMap, q: number, r: number, rng: Rng = Math.random, options: MoveOptions = {}): MoveResult | null {
  if (!canMoveTo(map, q, r, options.ship)) return null;
  if (options.force && map.fatigue >= MAX_FATIGUE) return null;
  const next = neighbours(q, r);
  const hexes = map.hexes.map((hex) => {
    if (hex.q === q && hex.r === r) return { ...hex, visited: true, seen: true };
    if (next.some(([nq, nr]) => nq === hex.q && nr === hex.r)) return { ...hex, seen: true };
    return hex;
  });
  const camped = hexAt(map, q, r)?.camp === true;
  const forced = options.force === true;
  // A river without a bridge is a day lost at the ford; on a forced march it is a second point of fatigue.
  const forded = needsFord(hexAt(map, q, r)) && !(options.ship && options.ship.q === q && options.ship.r === r);
  const days = forced ? 0 : forded ? 2 : 1;
  const hungry = !forced && map.rations < days;
  return {
    map: {
      ...map,
      hexes,
      party: { q, r },
      rations: Math.max(0, map.rations - days),
      fatigue: forced ? Math.min(MAX_FATIGUE, map.fatigue + (forded ? 2 : 1)) : map.fatigue,
    },
    encounter: !camped && die(6, rng) <= (options.encounterOn ?? 1),
    hungry,
    dayPassed: !forced,
    days,
    forded,
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

// ---- places: the campaign log's "where the story is" tied to hexes ----

/** The longest place name; the same limit the campaign log keeps for its own places. */
export const HEX_PLACE_LIMIT = 40;

const sameName = (a: string, b: string): boolean => a.trim().toLowerCase() === b.trim().toLowerCase();

/**
 * Gives a hex its name (a blank name removes it). The name is kept as typed, spaces and all, because it is
 * set keystroke by keystroke; whoever reads it trims. Nothing changes when the hex is not on the map.
 */
export function setHexPlace(map: HexMap, q: number, r: number, name: string): HexMap {
  const place = name.slice(0, HEX_PLACE_LIMIT);
  return { ...map, hexes: map.hexes.map((hex) => (hex.q === q && hex.r === r ? { ...hex, place: place.trim() === '' ? undefined : place } : hex)) };
}

/** The hexes that carry this place name (case aside); none for an empty one. */
export function hexesAtPlace(map: HexMap, place: string): Hex[] {
  return place.trim() === '' ? [] : map.hexes.filter((hex) => hex.place !== undefined && sameName(hex.place, place));
}

/** Every name hexes carry, for the journal's list of places. */
export const hexPlaces = (map: HexMap): string[] => [...new Set(map.hexes.map((hex) => hex.place?.trim()).filter((place): place is string => !!place))].sort();

/**
 * Where the journal goes when the party stands on this hex: the hex's own name, else (for a place with a
 * feature — a settlement, lair, dungeon or landmark) the name `label` gives it, which is then kept on the hex so
 * the journal can find its way back. A bare hex of open country says nothing and returns null — unless
 * the player asked for it (`force`), when it is named too.
 */
export function journalPlaceFor(map: HexMap, hex: Hex, label: string, force = false): { map: HexMap; place: string } | null {
  if (hex.place?.trim()) return { map, place: hex.place.trim() };
  if (hex.feature.kind === 'empty' && !force) return null;
  const place = label.trim().slice(0, HEX_PLACE_LIMIT);
  return { map: setHexPlace(map, hex.q, hex.r, place), place };
}

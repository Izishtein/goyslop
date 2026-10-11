import { EMPTY_HEXMAP, type Biome, type Hex, type HexFeature, type HexMap } from '../lib/hexmap';

const hex = (q: number, r: number, biome: Biome, feature: HexFeature = { kind: 'empty' }, extra: Partial<Hex> = {}): Hex => ({ q, r, biome, feature, visited: true, seen: true, ...extra });

/**
 * A small coast for tests, the party in the home village at 0,0:
 *
 *   (0,0) village — a harbour       (1,0) open water            (2,0) a reef
 *   (1,-1) an island                (2,-1) open water           (3,-1) a town — a second harbour
 *   (-1,0) and (0,-1) grassland      (0,1) and (-1,1) open water
 */
export function harbourMap(): HexMap {
  return {
    ...EMPTY_HEXMAP,
    hexes: [
      hex(0, 0, 'grassland', { kind: 'settlement', settlement: 'village' }),
      hex(1, 0, 'sea'),
      hex(2, 0, 'sea', { kind: 'reef' }),
      hex(1, -1, 'sea', { kind: 'island' }),
      hex(2, -1, 'sea'),
      hex(3, -1, 'grassland', { kind: 'settlement', settlement: 'town' }),
      hex(-1, 0, 'grassland'),
      hex(0, -1, 'grassland'),
      hex(0, 1, 'sea'),
      hex(-1, 1, 'sea'),
    ],
    party: { q: 0, r: 0 },
    rations: 7,
    patches: [{ q: 0, r: 0 }],
  };
}

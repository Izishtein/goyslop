import { describe, expect, it } from 'vitest';
import {
  getTreasureDropTable,
  listTreasureDropTables,
  TREASURE_DROP_TABLES,
  TREASURE_ENHANCEMENT_ABILITIES,
  TREASURE_POINTS_ESTIMATE,
} from './treasure-drop';

describe('treasure drop tables', () => {
  it('holds the 13 tables the book prints (A1, A2, B-L)', () => {
    expect(TREASURE_DROP_TABLES.map((t) => t.table)).toEqual([
      'A1',
      'A2',
      'B',
      'C',
      'D',
      'E',
      'F',
      'G',
      'H',
      'I',
      'J',
      'K',
      'L',
    ]);
  });

  it('has unique table ids', () => {
    expect(new Set(TREASURE_DROP_TABLES.map((t) => t.id)).size).toBe(TREASURE_DROP_TABLES.length);
  });

  it('gives every table six rows per group and every group six rows', () => {
    for (const table of TREASURE_DROP_TABLES) {
      for (const g of table.groups) {
        expect(g.rows).toHaveLength(6);
        for (const r of g.rows) {
          expect(r.name.length).toBeGreaterThan(0);
          expect(r.category.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('splits A1-F into six groups of six (36 items) and G-L into two groups of six (12 items)', () => {
    const sixGroupTables = ['A1', 'A2', 'B', 'C', 'D', 'E', 'F'];
    const twoGroupTables = ['G', 'H', 'I', 'J', 'K', 'L'];
    for (const table of TREASURE_DROP_TABLES) {
      if (sixGroupTables.includes(table.table)) expect(table.groups).toHaveLength(6);
      if (twoGroupTables.includes(table.table)) expect(table.groups).toHaveLength(2);
    }
  });

  it('holds 324 items in total, matching the book count (7×36 + 6×12)', () => {
    const total = TREASURE_DROP_TABLES.reduce((sum, table) => sum + table.groups.reduce((s, g) => s + g.rows.length, 0), 0);
    expect(total).toBe(324);
  });

  it('prices every table with the point cost printed in its heading', () => {
    const expected: Record<string, number> = {
      A1: 1,
      A2: 1,
      B: 2,
      C: 3,
      D: 4,
      E: 6,
      F: 8,
      G: 10,
      H: 12,
      I: 16,
      J: 20,
      K: 25,
      L: 40,
    };
    for (const table of TREASURE_DROP_TABLES) expect(table.points).toBe(expected[table.table]);
  });

  it('looks up a table by id', () => {
    expect(getTreasureDropTable('l')?.points).toBe(40);
    expect(getTreasureDropTable('nonexistent')).toBeUndefined();
    expect(listTreasureDropTables()).toBe(TREASURE_DROP_TABLES);
  });
});

describe('treasure points estimate chart', () => {
  it('holds all 15 rows from the book, in ascending order', () => {
    expect(TREASURE_POINTS_ESTIMATE).toHaveLength(15);
    expect(TREASURE_POINTS_ESTIMATE[0]).toEqual({ levelRange: '8 or less', points: '1' });
    expect(TREASURE_POINTS_ESTIMATE.at(-1)).toEqual({ levelRange: '60–75', points: '50–65' });
  });
});

describe('treasure enhancement abilities list', () => {
  it('holds the 8 abilities, each priced across all 10 point columns', () => {
    expect(TREASURE_ENHANCEMENT_ABILITIES).toHaveLength(8);
    for (const ability of TREASURE_ENHANCEMENT_ABILITIES) {
      expect(ability.costs).toHaveLength(10);
      expect(ability.description.length).toBeGreaterThan(0);
    }
  });

  it('prices Instant Damage the way the book does, point for point', () => {
    const instantDamage = TREASURE_ENHANCEMENT_ABILITIES.find((a) => a.name === 'Instant Damage');
    expect(instantDamage?.costs).toEqual(['+2', '+4', '+6', '+8', null, '+10', null, '+12', null, '+14']);
  });
});

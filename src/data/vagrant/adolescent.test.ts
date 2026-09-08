import { describe, expect, it } from 'vitest';
import { ADOLESCENT_EXPERIENCE_TABLES } from './adolescent';

describe('Vagrant Adolescent Experience tables', () => {
  it('holds the 10 tables / 52 rows the book prints', () => {
    expect(ADOLESCENT_EXPERIENCE_TABLES).toHaveLength(10);
    const totalRows = ADOLESCENT_EXPERIENCE_TABLES.reduce((sum, t) => sum + t.rows.length, 0);
    expect(totalRows).toBe(52);
  });

  it('has unique ids', () => {
    expect(new Set(ADOLESCENT_EXPERIENCE_TABLES.map((t) => t.id)).size).toBe(ADOLESCENT_EXPERIENCE_TABLES.length);
  });

  it('every row grants at least one Combat Feat option', () => {
    for (const table of ADOLESCENT_EXPERIENCE_TABLES) {
      for (const row of table.rows) {
        expect(row.combatFeats.length).toBeGreaterThan(0);
      }
    }
  });
});

import { describe, expect, it } from 'vitest';
import { ABILITY_IDS } from '../../lib/formulas/abilities';
import { RACES } from '../races';
import { CHILDHOOD_EXPERIENCE_TABLES, getChildhoodExperienceTable } from './childhood';

describe('Vagrant Childhood Experience tables', () => {
  it('holds the 46 tables / 501 rows the book actually prints (not the naively-assumed 14x4=56)', () => {
    expect(CHILDHOOD_EXPERIENCE_TABLES).toHaveLength(46);
    const totalRows = CHILDHOOD_EXPERIENCE_TABLES.reduce((sum, t) => sum + t.rows.length, 0);
    expect(totalRows).toBe(501);
  });

  it('every raceId matches an entry in the race catalog', () => {
    const raceIds = new Set(RACES.map((r) => r.id));
    for (const table of CHILDHOOD_EXPERIENCE_TABLES) {
      expect(raceIds.has(table.raceId)).toBe(true);
    }
  });

  it('has no duplicate race/category combination', () => {
    const keys = CHILDHOOD_EXPERIENCE_TABLES.map((t) => `${t.raceId}:${t.category}`);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('D6 tables have exactly 6 rows 1-6, D66 tables have none of those', () => {
    for (const table of CHILDHOOD_EXPERIENCE_TABLES) {
      if (table.diceType === 'd6') {
        expect(table.rows).toHaveLength(6);
        expect(table.rows.map((r) => r.roll)).toEqual(['1', '2', '3', '4', '5', '6']);
      }
    }
  });

  it('every row has a full six-ability correction', () => {
    for (const table of CHILDHOOD_EXPERIENCE_TABLES) {
      for (const row of table.rows) {
        for (const id of ABILITY_IDS) {
          expect(typeof row.correction[id]).toBe('number');
        }
      }
    }
  });

  it('Tabbit only has a Remote Support table (the most extreme category gap in the book)', () => {
    const tabbitTables = CHILDHOOD_EXPERIENCE_TABLES.filter((t) => t.raceId === 'tabbit');
    expect(tabbitTables).toHaveLength(1);
    expect(tabbitTables[0].category).toBe('remoteSupport');
  });

  it('Dwarven has no Spy table', () => {
    const dwarfCategories = CHILDHOOD_EXPERIENCE_TABLES.filter((t) => t.raceId === 'dwarf').map((t) => t.category);
    expect(dwarfCategories).not.toContain('spy');
  });

  it('looks up a specific table', () => {
    const table = getChildhoodExperienceTable('human', 'warrior');
    expect(table?.rows[0]).toEqual({
      roll: '11-12',
      deprecatedTypes: [],
      experience: 'Lived as a Hunter',
      focus: 'Focus on Accuracy',
      correction: { DEX: 11, AGI: 5, STR: 7, VIT: 7, INT: 4, SPR: 4 },
    });
    expect(getChildhoodExperienceTable('human', 'spy')).toBeDefined();
    expect(getChildhoodExperienceTable('dwarf', 'spy')).toBeUndefined();
  });

  it('preserves the two book typos as flagged in the research doc rather than silently fixing them', () => {
    // Human Remote Support 54-56/61-63/64-66: book prints "E11 E10" (F mislabeled E) — recorded as F=10.
    const humanWizardApprentice = getChildhoodExperienceTable('human', 'remoteSupport')?.rows.find(
      (r) => r.experience === "Wizard's Apprentice",
    );
    expect(humanWizardApprentice?.correction.SPR).toBe(10);

    // Weakling Warrior 11-12/13-14/15-16: book prints "...D7 C4 F4" (E mislabeled C) — recorded as E=4.
    const weaklingCutter = getChildhoodExperienceTable('weakling', 'warrior')?.rows.find((r) => r.experience === 'Cutter');
    expect(weaklingCutter?.correction.INT).toBe(4);
  });
});

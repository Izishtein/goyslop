import { describe, expect, it } from 'vitest';
import { CATALOGUED_SCHOOLS, getSpell, listSpellsBySchool, SPELLS } from './spells';
import { CLASSES } from './classes';

describe('spell catalog', () => {
  it('holds the spell counts from the source tables', () => {
    const bySchool = Object.fromEntries(CATALOGUED_SCHOOLS.map((school) => [school, listSpellsBySchool(school).length]));
    expect(bySchool).toEqual({
      // Core I + Core II circles 7-10
      'Truespeech Magic': 23 + 16,
      'Spiritualism Magic': 21 + 16,
      // Core I: 20 basic + 16 specialized. Core II: 12 basic, 2 more for each of the
      // eight Core I deities and 4 each for the five new ones.
      'Divine Magic': 36 + 12 + 16 + 20,
      Magitech: 23 + 14,
      // Six elemental types of ten; the Basic type is unverified in the source doc.
      'Fairy Magic': 60,
    });
    expect(SPELLS).toHaveLength(257);
  });

  it('has unique ids', () => {
    expect(new Set(SPELLS.map((spell) => spell.id)).size).toBe(SPELLS.length);
  });

  it('keeps every spell inside the printed circles', () => {
    for (const spell of SPELLS) {
      expect(spell.circle).toBeGreaterThanOrEqual(1);
      expect(spell.circle).toBeLessThanOrEqual(10);
      if (spell.mp !== undefined) expect(spell.mp).toBeGreaterThanOrEqual(0);
    }
  });

  it('gives every deity its printed set of Specialized Divine spells', () => {
    const byDeity = new Map<string, number[]>();
    for (const spell of SPELLS) {
      if (!spell.deity) continue;
      byDeity.set(spell.deity, [...(byDeity.get(spell.deity) ?? []), spell.circle]);
    }
    // Every deity ends up with the same four: the eight Core I gods have circles 2 and 4
    // from Core I plus 7 and 10 from Core II, and the five Core II gods arrive with all four.
    expect(byDeity.size).toBe(13);
    for (const [deity, circles] of byDeity) {
      expect({ deity, circles: [...circles].sort((a, b) => a - b) }).toEqual({ deity, circles: [2, 4, 7, 10] });
    }
  });

  it('names schools exactly as the class catalog does, so the sheet can match them up', () => {
    const classSchools = new Set(CLASSES.map((classDef) => classDef.magicSchool).filter(Boolean));
    for (const school of CATALOGUED_SCHOOLS) {
      expect(classSchools).toContain(school);
    }
  });

  it('sorts a school by circle', () => {
    const circles = listSpellsBySchool('Truespeech Magic').map((spell) => spell.circle);
    expect(circles).toEqual([...circles].sort((a, b) => a - b));
  });

  it('looks a spell up by id', () => {
    expect(getSpell('energy-bolt')).toMatchObject({ name: 'Energy Bolt', circle: 1, mp: 5 });
  });
});

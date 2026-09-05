import { describe, expect, it } from 'vitest';
import { CATALOGUED_SCHOOLS, getSpell, listSpellsBySchool, SPELLS } from './spells';
import { CLASSES } from './classes';

describe('spell catalog', () => {
  it('holds the Core I spell counts from the source tables', () => {
    const bySchool = Object.fromEntries(CATALOGUED_SCHOOLS.map((school) => [school, listSpellsBySchool(school).length]));
    expect(bySchool).toEqual({
      'Truespeech Magic': 23,
      'Spiritualism Magic': 21,
      // 20 basic + 16 specialized (8 deities x 2)
      'Divine Magic': 36,
      Magitech: 23,
    });
  });

  it('has unique ids', () => {
    expect(new Set(SPELLS.map((spell) => spell.id)).size).toBe(SPELLS.length);
  });

  it('keeps every spell inside the Core I circles', () => {
    for (const spell of SPELLS) {
      expect(spell.circle).toBeGreaterThanOrEqual(1);
      expect(spell.circle).toBeLessThanOrEqual(6);
      expect(spell.mp).toBeGreaterThanOrEqual(0);
    }
  });

  it('gives every specialized Divine deity exactly one circle 2 and one circle 4 spell', () => {
    const byDeity = new Map<string, number[]>();
    for (const spell of SPELLS) {
      if (!spell.deity) continue;
      byDeity.set(spell.deity, [...(byDeity.get(spell.deity) ?? []), spell.circle]);
    }
    expect(byDeity.size).toBe(8);
    for (const circles of byDeity.values()) {
      expect(circles.sort()).toEqual([2, 4]);
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

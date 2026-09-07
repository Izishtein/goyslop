import { describe, expect, it } from 'vitest';
import { CATALOGUED_SCHOOLS, getSpell, listSpellsBySchool, SPELLS } from './spells';
import { CLASSES } from './classes';

describe('spell catalog', () => {
  it('holds the spell counts from the source tables', () => {
    const bySchool = Object.fromEntries(CATALOGUED_SCHOOLS.map((school) => [school, listSpellsBySchool(school).length]));
    expect(bySchool).toEqual({
      // Core I + Core II circles 7-10 + Core III circles 11-15
      'Truespeech Magic': 23 + 16 + 15,
      // The +1 is Possession, a circle 9 spell missing from our Core I/II transcription
      // and found by the cross-check — see data/spells/core3.ts.
      'Spiritualism Magic': 21 + 16 + 13 + 1,
      // Core I: 20 basic + 16 specialized. Core II: 12 basic, 2 more for each of the
      // eight Core I deities and 4 each for the five new ones.
      'Divine Magic': 36 + 12 + 16 + 20,
      Magitech: 23 + 14,
      // Six elemental types of ten; the Basic type is unverified in the source doc.
      'Fairy Magic': 60,
      // Monstrous Lore and Abyss Breaker run to level 15: four Nature spells per level,
      // three Summoning Arts per level (four at level 2), two or three Abyssal per level.
      'Nature Magic': 60,
      'Summoning Arts': 46,
      'Abyssal Magic': 35,
      // Bibliomancer, five ranks — see docs/sheet-content/17-arcane-magic.md.
      'Arcane Magic': 28,
    });
    expect(SPELLS).toHaveLength(398 + 28 + 29);
  });

  it('has unique ids', () => {
    expect(new Set(SPELLS.map((spell) => spell.id)).size).toBe(SPELLS.length);
  });

  it('keeps every spell inside the printed circles', () => {
    // Divine, Magitech and Fairy Magic still stop at circle 10 here — their circles 11-15
    // sit in Core III Part 3 and are not transcribed yet (roadmap § 1.0). Truespeech and
    // Spiritualism already reach 15, as do the three supplement schools. Arcane Magic's five
    // ranks unlock as late as level 13, stored as a pseudo-circle (see data/spells/arcane.ts).
    const toFifteen = [
      'Truespeech Magic',
      'Spiritualism Magic',
      'Nature Magic',
      'Summoning Arts',
      'Abyssal Magic',
      'Arcane Magic',
    ];
    const topCircle = (school: string) => (toFifteen.includes(school) ? 15 : 10);
    for (const spell of SPELLS) {
      expect(spell.circle).toBeGreaterThanOrEqual(1);
      expect(spell.circle).toBeLessThanOrEqual(topCircle(spell.school));
      if (spell.mp !== undefined) expect(spell.mp).toBeGreaterThanOrEqual(0);
    }
  });

  it('carries the circles 11-15 Core III prints for Truespeech and Spiritualism', () => {
    const perCircle = (school: string) => {
      const counts: Record<number, number> = {};
      for (const spell of listSpellsBySchool(school)) {
        if (spell.circle >= 11) counts[spell.circle] = (counts[spell.circle] ?? 0) + 1;
      }
      return counts;
    };
    // Core III pp. 133-137 and pp. 138-142; Magus Arts pp. 78-93 reprints both and agrees.
    expect(perCircle('Truespeech Magic')).toEqual({ 11: 3, 12: 3, 13: 3, 14: 3, 15: 3 });
    expect(perCircle('Spiritualism Magic')).toEqual({ 11: 3, 12: 3, 13: 2, 14: 2, 15: 3 });
    expect(getSpell('save-the-world')).toMatchObject({ circle: 15, mp: 50, school: 'Truespeech Magic' });
    expect(getSpell('possession')).toMatchObject({ circle: 9, mp: 7, sourceBook: 'Magus Arts' });
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

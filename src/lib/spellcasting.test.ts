import { describe, expect, it } from 'vitest';
import { DEEP_MAGIC } from '../data/spells';
import { deepMagicPower, deityAllows, listDeities, magicSchoolsOf, mpAfterCast, schoolLevel, spellProblems } from './spellcasting';

const classes = (...entries: [string, number][]) => ({ classes: entries.map(([classId, level]) => ({ classId, level })) });

describe('Deep Magic', () => {
  // Magus Arts p. 95: 4th-level Sorcerer + 3rd-level Conjurer → 3 levels of Deep Magic, power 4 + INT.
  it('takes the circle from the lower class and the power from the higher', () => {
    const wizard = classes(['sorcerer', 4], ['conjurer', 3]);
    expect(schoolLevel(wizard, DEEP_MAGIC)).toBe(3);
    expect(deepMagicPower(wizard, 2)).toBe(6);
  });

  it('is absent without both classes', () => {
    expect(deepMagicPower(classes(['sorcerer', 4]), 2)).toBeNull();
    expect(magicSchoolsOf(classes(['sorcerer', 4]))).not.toContain(DEEP_MAGIC);
    expect(magicSchoolsOf(classes(['sorcerer', 1], ['conjurer', 1]))).toContain(DEEP_MAGIC);
  });
});

describe('Specialized Divine Magic', () => {
  it('opens basic spells to everyone and a specialized one to its own god only', () => {
    expect(deityAllows(undefined, '')).toBe(true);
    expect(deityAllows('Tidan', 'Tidan')).toBe(true);
    expect(deityAllows('Tidan', 'Lyphos')).toBe(false);
    expect(deityAllows('Tidan', '')).toBe(false);
  });

  it('lists the catalog gods', () => {
    expect(listDeities()).toContain('Tidan');
  });

  it('flags a known spell of another god', () => {
    const priest = { ...classes(['priest', 4]), deity: 'Lyphos' };
    expect(spellProblems(priest, { name: 'Sunlight', school: 'Divine Magic', circle: 2 })).toEqual(['wrongDeity']);
    expect(spellProblems({ ...priest, deity: 'Tidan' }, { name: 'Sunlight', school: 'Divine Magic', circle: 2 })).toEqual([]);
  });
});

describe('circle against class level', () => {
  it('flags a spell above the school level, and a school the character has no class for', () => {
    const sorcerer = { ...classes(['sorcerer', 2]), deity: '' };
    expect(spellProblems(sorcerer, { name: 'X', school: 'Truespeech Magic', circle: 3 })).toEqual(['aboveLevel']);
    expect(spellProblems(sorcerer, { name: 'X', school: 'Truespeech Magic', circle: 2 })).toEqual([]);
    expect(spellProblems(sorcerer, { name: 'X', school: 'Fairy Magic', circle: 1 })).toEqual(['aboveLevel']);
  });
});

describe('casting', () => {
  it('spends MP and refuses what cannot be paid', () => {
    expect(mpAfterCast(10, 4)).toBe(6);
    expect(mpAfterCast(4, 4)).toBe(0);
    expect(mpAfterCast(3, 4)).toBeNull();
  });
});

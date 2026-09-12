import { describe, expect, it } from 'vitest';
import {
  ABYSS_CURSES,
  ADDITIONAL_ABYSS_CURSES,
  abyssSkillsFor,
  ARMOR_ABYSS_SKILLS,
  enhancementsFor,
  getAbyssCurse,
  getAdditionalAbyssCurse,
  SHIELD_ABYSS_SKILLS,
  WEAPON_ABYSS_SKILLS,
} from './abyss';

describe('abyss catalog', () => {
  it('has 36 unique rolls in each curse table', () => {
    for (const table of [ABYSS_CURSES, ADDITIONAL_ABYSS_CURSES]) {
      expect(table).toHaveLength(36);
      expect(new Set(table.map((curse) => curse.roll)).size).toBe(36);
    }
  });

  it('gives every enhancement target at least one typical enhancement and one Abyss Skill', () => {
    for (const target of ['weapon', 'armor', 'shield'] as const) {
      expect(enhancementsFor(target).length).toBeGreaterThan(0);
      expect(abyssSkillsFor(target).length).toBeGreaterThan(0);
    }
  });

  it('holds the Abyss Skill counts the book prints (Abyss Breaker pp. 44-46)', () => {
    expect(WEAPON_ABYSS_SKILLS).toHaveLength(6);
    expect(ARMOR_ABYSS_SKILLS).toHaveLength(3);
    expect(SHIELD_ABYSS_SKILLS).toHaveLength(3);
  });

  it('looks a curse up by roll in both tables', () => {
    expect(getAbyssCurse('6-6')).toMatchObject({ name: 'Gullible' });
    expect(getAdditionalAbyssCurse('1-1')).toMatchObject({ name: 'Of Decay' });
    // The book reuses this name for two different rolls in the additional table.
    expect(getAdditionalAbyssCurse('1-4')).toMatchObject({ name: 'Choking' });
    expect(getAdditionalAbyssCurse('3-5')).toMatchObject({ name: 'Choking' });
  });
});

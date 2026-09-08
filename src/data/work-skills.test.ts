import { describe, expect, it } from 'vitest';
import { getWorkSkill, listWorkSkillsByCategory, WORK_SKILL_CATEGORIES, WORK_SKILLS } from './work-skills';

describe('work skills catalog', () => {
  it('holds the 81 skills Raxia Life p. 51 lists', () => {
    expect(WORK_SKILLS).toHaveLength(81);
  });

  it('has unique ids', () => {
    expect(new Set(WORK_SKILLS.map((entry) => entry.id)).size).toBe(WORK_SKILLS.length);
  });

  it('splits into the book\'s six categories, matching its page ranges', () => {
    const byCategory: Record<string, number> = {};
    for (const entry of WORK_SKILLS) byCategory[entry.category] = (byCategory[entry.category] ?? 0) + 1;
    expect(byCategory).toEqual({
      towns: 23,
      craftsmen: 14,
      knowledge: 23,
      military: 8,
      countryside: 9,
      rivers: 4,
    });
  });

  it('every entry is one of the declared categories', () => {
    for (const entry of WORK_SKILLS) expect(WORK_SKILL_CATEGORIES).toContain(entry.category);
  });

  it('every entry has a profession and a page in the book', () => {
    for (const entry of WORK_SKILLS) {
      expect(entry.profession.length).toBeGreaterThan(0);
      expect(entry.page).toBeGreaterThanOrEqual(53);
      expect(entry.page).toBeLessThanOrEqual(108);
    }
  });

  it('looks up by id and sorts a category alphabetically', () => {
    expect(getWorkSkill('blacksmith-skill')?.profession).toBe('Smith');
    expect(getWorkSkill('nonexistent')).toBeUndefined();

    const rivers = listWorkSkillsByCategory('rivers');
    expect(rivers.map((entry) => entry.name)).toEqual([...rivers.map((entry) => entry.name)].sort());
  });
});

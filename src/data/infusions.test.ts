import { describe, expect, it } from 'vitest';
import en from '../i18n/locales/en.json';
import ru from '../i18n/locales/ru.json';
import { getInfusion, INFUSIONS, listInfusionsByLevel, listInfusionsByRace, missingPrerequisites } from './infusions';

describe('Heritor Infusions catalogue', () => {
  it('holds the 60 Infusions the book lists: 20 open to all, 40 exclusive to four races (Barbarous Rage p. 58)', () => {
    expect(INFUSIONS).toHaveLength(60);
    expect(listInfusionsByRace('any')).toHaveLength(20);
    expect(listInfusionsByRace('diablo')).toHaveLength(13);
    expect(listInfusionsByRace('drake')).toHaveLength(8);
    expect(listInfusionsByRace('basilisk')).toHaveLength(13);
    expect(listInfusionsByRace('scissorscorpion')).toHaveLength(6);
  });

  it('splits the common ones 7 / 7 / 6 across the 1st, 5th and 10th tier', () => {
    const common = INFUSIONS.filter((entry) => entry.race === 'any');
    for (const [level, count] of [[1, 7], [5, 7], [10, 6]] as const) expect(common.filter((entry) => entry.requiredLevel === level)).toHaveLength(count);
    expect(listInfusionsByLevel(1).length + listInfusionsByLevel(5).length + listInfusionsByLevel(10).length).toBe(60);
  });

  it('has unique ids and names', () => {
    expect(new Set(INFUSIONS.map((entry) => entry.id)).size).toBe(INFUSIONS.length);
    expect(new Set(INFUSIONS.map((entry) => entry.name)).size).toBe(INFUSIONS.length);
  });

  it('points every prerequisite Infusion at one that exists, of a lower tier or the same race', () => {
    for (const entry of INFUSIONS) {
      for (const id of entry.requires) {
        const needed = getInfusion(id);
        expect(needed, `${entry.name} needs ${id}`).toBeDefined();
        expect(needed!.requiredLevel).toBeLessThanOrEqual(entry.requiredLevel);
        expect(needed!.race === entry.race || needed!.race === 'any').toBe(true);
      }
    }
  });

  it('keeps the chains the book prints: Resilient Core I → II → Mastery, Evil Eye A → S → SS', () => {
    expect(getInfusion('resilient-core-ii')?.requires).toEqual(['resilient-core-i']);
    expect(getInfusion('resilient-core-mastery')?.requires).toEqual(['resilient-core-ii']);
    expect(getInfusion('enhanced-evil-eye-ss')?.requires).toEqual(['enhanced-evil-eye-s']);
    expect(getInfusion('enhanced-magic-sword-a')?.otherPrerequisite).toMatch(/Weapon Prof/);
  });

  it('reports the prerequisites a character still lacks', () => {
    const second = getInfusion('resilient-core-ii')!;
    expect(missingPrerequisites(second, new Set()).map((entry) => entry.name)).toEqual(['Resilient Core I']);
    expect(missingPrerequisites(second, new Set(['Resilient Core I']))).toEqual([]);
  });

  it('marks the one entry the book does not print in its body', () => {
    expect(INFUSIONS.filter((entry) => entry.inferred).map((entry) => entry.name)).toEqual(['Daemonic Eyes']);
  });

  it('describes every Infusion in both languages, and nothing else', () => {
    const ids = INFUSIONS.map((entry) => entry.id).sort();
    for (const book of [en, ru]) {
      expect(Object.keys(book.reference.infusionSummary).sort()).toEqual(ids);
      expect(Object.keys(book.reference.infusionEffect).sort()).toEqual(ids);
      for (const id of ids) {
        expect((book.reference.infusionSummary as Record<string, string>)[id].length).toBeGreaterThan(5);
        expect((book.reference.infusionEffect as Record<string, string>)[id].length).toBeGreaterThan(20);
      }
    }
  });

  it('leaves no page furniture in the text', () => {
    for (const text of [...Object.values(en.reference.infusionEffect), ...Object.values(en.reference.infusionSummary)]) {
      expect(text).not.toMatch(/Part 2 Rules|Basic Values of Multiple/);
    }
  });
});

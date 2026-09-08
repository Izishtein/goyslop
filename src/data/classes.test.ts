import { describe, expect, it } from 'vitest';
import { ABILITY_IDS } from '../lib/formulas/abilities';
import { CLASSES, getClass, isWarriorType, isWizardType } from './classes';

describe('class catalog', () => {
  it('holds all 25 classes with unique ids', () => {
    // 24 from Core I-III and the supplements, plus Heritor from Barbarous Rage.
    expect(CLASSES).toHaveLength(25);
    expect(new Set(CLASSES.map((c) => c.id)).size).toBe(CLASSES.length);
  });

  it('gives every class at least one key ability, and only real ones', () => {
    for (const classDef of CLASSES) {
      expect(classDef.keyAbilities.length, classDef.id).toBeGreaterThan(0);
      for (const ability of classDef.keyAbilities) {
        expect(ABILITY_IDS, `${classDef.id} lists ${ability}`).toContain(ability);
      }
    }
  });

  it('gives a magic school to the wizard classes and to nobody else', () => {
    for (const classDef of CLASSES) {
      expect(Boolean(classDef.magicSchool), classDef.id).toBe(classDef.type === 'wizard');
    }
  });

  it('rolls INT and SPR for every wizard class — derived from Magic Power and MP max', () => {
    // The book prints a magic school where the other tables print a key ability, so these
    // come from the two formulas rather than from a column. See the note in classes.ts.
    for (const classDef of CLASSES.filter((c) => c.type === 'wizard')) {
      expect(classDef.keyAbilities, classDef.id).toEqual(['INT', 'SPR']);
    }
  });

  it('keeps the ranks that decide what a level costs', () => {
    // Rank is the whole XP price of a level (1000 for major, 500 for minor), and Battle
    // Dancer had it wrong until 2026-09-07: our research doc said Minor. Battle Mastery
    // settles it — "Battle Dancer (Warrior-Type Major Class)" — but that book lives in the
    // owner's collection, not in files/, so nothing in the repo can catch a regression here.
    expect(getClass('battle-dancer')).toMatchObject({ type: 'warrior', rank: 'major' });
    const ranks = Object.fromEntries(CLASSES.map((c) => [c.id, c.rank]));
    expect(Object.values(ranks).filter((r) => r === 'major')).toHaveLength(12);
    expect(Object.values(ranks).filter((r) => r === 'minor')).toHaveLength(13);
  });

  it('looks a class up by id and answers what type it is', () => {
    expect(getClass('fencer')?.name).toBe('Fencer');
    expect(getClass('nonesuch')).toBeUndefined();
    expect(isWarriorType('fencer')).toBe(true);
    expect(isWizardType('fencer')).toBe(false);
    expect(isWizardType('sorcerer')).toBe(true);
  });
});

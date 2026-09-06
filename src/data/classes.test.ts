import { describe, expect, it } from 'vitest';
import { ABILITY_IDS } from '../lib/formulas/abilities';
import { CLASSES, getClass, isWarriorType, isWizardType } from './classes';

describe('class catalog', () => {
  it('holds all 24 classes with unique ids', () => {
    expect(CLASSES).toHaveLength(24);
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

  it('looks a class up by id and answers what type it is', () => {
    expect(getClass('fencer')?.name).toBe('Fencer');
    expect(getClass('nonesuch')).toBeUndefined();
    expect(isWarriorType('fencer')).toBe(true);
    expect(isWizardType('fencer')).toBe(false);
    expect(isWizardType('sorcerer')).toBe(true);
  });
});

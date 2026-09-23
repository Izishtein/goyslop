import { describe, expect, it } from 'vitest';
import { ARTS } from '../data/arts';
import { CLASSES } from '../data/classes';
import { COMBAT_FEATS } from '../data/combat-feats';
import { SCHOOL_SECRETS } from '../data/schools';
import { WORK_SKILLS } from '../data/work-skills';
import en from './locales/en.json';
import ru from './locales/ru.json';

/** Every leaf key, dotted — "sheet.spells", "reference.classDescription.fighter". */
function leafKeys(value: unknown, prefix = ''): string[] {
  if (typeof value !== 'object' || value === null) return [prefix];
  return Object.entries(value).flatMap(([key, child]) => leafKeys(child, prefix ? `${prefix}.${key}` : key));
}

/**
 * Languages do not share plural categories — English wants `_one`/`_other` where Russian
 * wants `_one`/`_few`/`_many` — and i18next expects exactly that difference. Comparing the
 * suffixed keys literally would report correct pluralisation as drift, so parity is checked
 * on the base key, which every locale must carry regardless.
 */
function baseKeys(bundle: unknown): Set<string> {
  return new Set(leafKeys(bundle).map((key) => key.replace(/_(zero|one|two|few|many|other)$/, '')));
}

describe('locale files', () => {
  it('carry exactly the same keys in both languages', () => {
    // A key present in one locale only shows up as a raw dotted string on screen, and
    // nothing else in the app would catch it.
    const enKeys = baseKeys(en);
    const ruKeys = baseKeys(ru);

    expect([...enKeys].filter((key) => !ruKeys.has(key))).toEqual([]);
    expect([...ruKeys].filter((key) => !enKeys.has(key))).toEqual([]);
  });

  it('leave no value empty', () => {
    for (const [locale, bundle] of [
      ['en', en],
      ['ru', ru],
    ] as const) {
      for (const key of leafKeys(bundle)) {
        const value = key.split('.').reduce<unknown>((node, part) => (node as Record<string, unknown>)[part], bundle);
        expect(String(value).trim(), `${locale}.${key}`).not.toBe('');
      }
    }
  });

  it('describes every class in both languages', () => {
    // The reference screen looks these up with a dynamic t() key built from the class id,
    // so a missing one stays invisible until someone opens that row.
    for (const classDef of CLASSES) {
      expect(en.reference.classDescription, `en ${classDef.id}`).toHaveProperty(classDef.id);
      expect(ru.reference.classDescription, `ru ${classDef.id}`).toHaveProperty(classDef.id);
    }
  });

  it('describes no class that does not exist', () => {
    const ids = new Set(CLASSES.map((classDef) => classDef.id));
    expect(Object.keys(en.reference.classDescription).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('describes no combat feat that does not exist', () => {
    // combatFeatEffect is filled in feat by feat (see docs/roadmap.md § 5.1), so unlike
    // classDescription it is not expected to cover every entry — only to never carry a
    // typoed id that silently never renders.
    const ids = new Set(COMBAT_FEATS.map((feat) => feat.id));
    expect(Object.keys(en.reference.combatFeatEffect).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('does not leave a description identical in both languages', () => {
    // A copy-paste of the English column into ru.json would pass every check above while
    // shipping English text to Russian readers.
    const identical = CLASSES.map((c) => c.id).filter(
      (id) =>
        en.reference.classDescription[id as keyof typeof en.reference.classDescription] ===
        ru.reference.classDescription[id as keyof typeof ru.reference.classDescription],
    );
    expect(identical).toEqual([]);
  });

  it('describes every Technique/Spellsong/Finale in both languages', () => {
    for (const art of ARTS) {
      expect(en.reference.artEffect, `en ${art.id}`).toHaveProperty(art.id);
      expect(ru.reference.artEffect, `ru ${art.id}`).toHaveProperty(art.id);
    }
  });

  it('describes no art that does not exist', () => {
    const ids = new Set(ARTS.map((art) => art.id));
    expect(Object.keys(en.reference.artEffect).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('describes every School Secret in both languages', () => {
    for (const secret of SCHOOL_SECRETS) {
      expect(en.reference.schoolSecretEffect, `en ${secret.id}`).toHaveProperty(secret.id);
      expect(ru.reference.schoolSecretEffect, `ru ${secret.id}`).toHaveProperty(secret.id);
    }
  });

  it('describes no School Secret that does not exist', () => {
    const ids = new Set(SCHOOL_SECRETS.map((secret) => secret.id));
    expect(Object.keys(en.reference.schoolSecretEffect).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('describes every Work Skill in both languages', () => {
    for (const skill of WORK_SKILLS) {
      expect(en.reference.workSkillDescription, `en ${skill.id}`).toHaveProperty(skill.id);
      expect(ru.reference.workSkillDescription, `ru ${skill.id}`).toHaveProperty(skill.id);
    }
  });

  it('describes no Work Skill that does not exist', () => {
    const ids = new Set(WORK_SKILLS.map((s) => s.id));
    expect(Object.keys(en.reference.workSkillDescription).filter((id) => !ids.has(id))).toEqual([]);
  });

  it('gives no Work Skill check effect for a check that does not take one, or that does not exist', () => {
    const skillsById = new Map(WORK_SKILLS.map((s) => [s.id, s]));
    for (const [skillId, checkEffects] of Object.entries(en.reference.workSkillCheckEffect)) {
      const skillDef = skillsById.get(skillId);
      expect(skillDef, `unknown work skill ${skillId}`).toBeDefined();
      const checksById = new Map(skillDef!.checks.map((c) => [c.id, c]));
      for (const checkId of Object.keys(checkEffects)) {
        const checkDef = checksById.get(checkId);
        expect(checkDef, `${skillId}.${checkId} is not a check of that skill`).toBeDefined();
        expect(checkDef!.timeRequired, `${skillId}.${checkId} is a reference check, not a unique one`).toBeDefined();
      }
    }
    expect(Object.keys(en.reference.workSkillCheckEffect).sort()).toEqual(Object.keys(ru.reference.workSkillCheckEffect).sort());
  });

  it('gives every Work Skill bonuses for level 5/10/15, in both languages', () => {
    for (const skill of WORK_SKILLS) {
      expect(en.reference.workSkillBonus, `en ${skill.id}`).toHaveProperty(skill.id);
      expect(ru.reference.workSkillBonus, `ru ${skill.id}`).toHaveProperty(skill.id);
      expect(Object.keys(en.reference.workSkillBonus[skill.id as keyof typeof en.reference.workSkillBonus]).sort()).toEqual([
        'level10',
        'level15',
        'level5',
      ]);
    }
  });

  it('gives Work Skill bonuses to no skill that does not exist', () => {
    const ids = new Set(WORK_SKILLS.map((s) => s.id));
    expect(Object.keys(en.reference.workSkillBonus).filter((id) => !ids.has(id))).toEqual([]);
  });
});

import { describe, expect, it } from 'vitest';
import { CLASSES } from '../data/classes';
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
});

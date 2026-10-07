import { describe, expect, it } from 'vitest';
import en from '../i18n/locales/en.json';
import ru from '../i18n/locales/ru.json';
import { GEN_COUNTS, joinName, rollNpc, rollSettlement, rollTavern } from './generators';

const rng = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};

describe('generator tables', () => {
  it('have a word for every number the generators can draw, in both languages', () => {
    for (const [lang, locale] of [['en', en], ['ru', ru]] as const) {
      const gen = locale.solo.gen as unknown as Record<string, Record<string, string>>;
      const tables: Record<string, number> = {
        nameStart: GEN_COUNTS.namePart,
        nameEnd: GEN_COUNTS.namePart,
        nameMiddle: GEN_COUNTS.nameMiddle,
        occupation: GEN_COUNTS.occupation,
        trait: GEN_COUNTS.trait,
        want: GEN_COUNTS.want,
        secret: GEN_COUNTS.secret,
        tavernAdjective: GEN_COUNTS.tavernAdjective,
        tavernNoun: GEN_COUNTS.tavernNoun,
        specialty: GEN_COUNTS.specialty,
        rumor: GEN_COUNTS.rumor,
        patron: GEN_COUNTS.patron,
        knownFor: GEN_COUNTS.knownFor,
        trouble: GEN_COUNTS.trouble,
      };
      for (const [key, count] of Object.entries(tables)) {
        expect(Object.keys(gen[key]).length, `${lang} ${key}`).toBe(count);
        for (let n = 1; n <= count; n += 1) expect(gen[key][n], `${lang} ${key}.${n}`).toBeTruthy();
      }
    }
  });
});

describe('rolls', () => {
  it('stay inside the tables', () => {
    for (let i = 0; i < 200; i += 1) {
      const npc = rollNpc();
      expect(npc.occupation).toBeGreaterThanOrEqual(1);
      expect(npc.occupation).toBeLessThanOrEqual(GEN_COUNTS.occupation);
      expect(npc.name.start).toBeLessThanOrEqual(GEN_COUNTS.namePart);
      if (npc.name.middle !== null) expect(npc.name.middle).toBeLessThanOrEqual(GEN_COUNTS.nameMiddle);
      const tavern = rollTavern();
      expect(tavern.noun).toBeLessThanOrEqual(GEN_COUNTS.tavernNoun);
      expect(rollSettlement().tavern.rumor).toBeLessThanOrEqual(GEN_COUNTS.rumor);
    }
  });

  it('give a name a third syllable one time in three', () => {
    expect(rollNpc(rng(0, 0, 0, 0.99)).name).toEqual({ start: 1, middle: 1, end: 12 }); // d3 = 1 → a middle syllable
    expect(rollNpc(rng(0, 0.99, 0)).name.middle).toBeNull();
  });

  it('joins syllables into one capitalised word', () => {
    expect(joinName({ start: 'BAR', middle: 'a', end: 'Dan' })).toBe('Baradan');
    expect(joinName({ start: 'Del', middle: null, end: 'wen' })).toBe('Delwen');
  });
});

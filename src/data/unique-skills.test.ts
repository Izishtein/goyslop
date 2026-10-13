import { describe, expect, it } from 'vitest';
import en from '../i18n/locales/en.json';
import ru from '../i18n/locales/ru.json';
import { costParts, standardValueFor } from '../lib/unique-skills';
import { getUniqueSkill, UNIQUE_SKILLS, UNIQUE_SKILL_RACES, uniqueSkillsOf } from './unique-skills';
import { INFUSIONS } from './infusions';

const texts = (locale: typeof en | typeof ru) => (locale.reference as unknown as { uniqueSkill: Record<string, Record<string, string>> }).uniqueSkill;

describe('unique skills (Barbarous Rage pp. 65-68)', () => {
  it('lists 21 skills with unique ids: 6 Diablo, 1 Drake, 11 Basilisk, 2 Arbor, 1 Scissorscorpion', () => {
    expect(UNIQUE_SKILLS).toHaveLength(21);
    expect(new Set(UNIQUE_SKILLS.map((entry) => entry.id)).size).toBe(21);
    expect(UNIQUE_SKILL_RACES.map((race) => uniqueSkillsOf(race).length)).toEqual([6, 1, 11, 2, 1]);
  });

  it('gives every Basilisk eye four ranks and every other skill one', () => {
    for (const entry of UNIQUE_SKILLS) {
      expect(entry.ranks.map((rank) => rank.rank), entry.name).toEqual(entry.race === 'basilisk' ? ['B', 'A', 'S', 'SS'] : ['any']);
    }
  });

  it('has a text for every rank of every skill, in both languages', () => {
    for (const locale of [en, ru]) {
      for (const entry of UNIQUE_SKILLS) {
        for (const rank of entry.ranks) expect(texts(locale)[entry.id]?.[rank.rank], `${entry.id} ${rank.rank}`).toBeTruthy();
      }
    }
  });

  it('names the Diablo skills as the Infusions that teach them', () => {
    const infusions = new Set(INFUSIONS.filter((entry) => entry.race === 'diablo').map((entry) => entry.name));
    for (const entry of uniqueSkillsOf('diablo')) expect(infusions.has(entry.name), entry.name).toBe(true);
  });

  it('reads the Standard Values and costs the book prints', () => {
    const levels = { adventurer: 7, heritor: 3 };
    const modifiers = { INT: 2, VIT: 1, SPR: 3 };
    // Breath of Light: Adventurer level + VIT; Soul Absorption: Heritor + INT; the Evil Eyes: Adventurer + SPR; Raw Deal has none.
    expect(standardValueFor(getUniqueSkill('breath-of-light')!, levels, modifiers)).toBe(8);
    expect(standardValueFor(getUniqueSkill('soul-absorption')!, levels, modifiers)).toBe(5);
    expect(standardValueFor(getUniqueSkill('evil-eye-of-petrification')!, levels, modifiers)).toBe(10);
    expect(standardValueFor(getUniqueSkill('poisonous-tail')!, levels, modifiers)).toBe(4);
    expect(standardValueFor(getUniqueSkill('raw-deal')!, levels, modifiers)).toBeNull();
    expect(getUniqueSkill('evil-eye-of-petrification')?.ranks.map((rank) => rank.cost?.mp ?? null)).toEqual([5, null, null, 10]);
    expect(getUniqueSkill('evil-eye-of-the-soul-transfer')?.ranks.map((rank) => rank.cost?.mp)).toEqual([8, 12, 24, 36]);
    expect(getUniqueSkill('chain-of-curses')?.ranks[0].cost).toEqual({ mp: 4, hp: 5, perTarget: true });
    expect(costParts({ mp: 4, hp: 5, perTarget: true })).toEqual({ key: 'hpMpTarget', values: { mp: 4, hp: 5 } });
    expect(costParts({ mp: 2, perTarget: true }).key).toBe('mpTarget');
    expect(costParts({ mp: 6 }).key).toBe('mp');
  });
});

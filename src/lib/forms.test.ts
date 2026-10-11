import { describe, expect, it } from 'vitest';
import { basicValues, FORMS, INNATE_WEAPONS, infusionBonuses, innateRank } from '../data/sections';
import { EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../types/character';
import { deathCheckPart, enterForm, ensureParts, formFor, healPart, heritorLevelOf, hurtPart, inForm, leaveForm, restorePart, scorpionBodyArtEvasion, sectionSheet, setPartBonus, wakePart } from './forms';

const dice = (...faces: number[]) => {
  let index = 0;
  return () => (faces[index++] - 1 + 0.5) / 6;
};

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const score = (base: number) => ({ base, correction: 0, growth: 0, itemBonus: 0 });
  return {
    schemaVersion: 1,
    id: 'c1',
    name: 'Rudolf',
    raceId: 'basilisk',
    background: 'Shapeshifter',
    // Barbarous Rage p. 56: a Basilisk, Fighter 5, Sorcerer 3, Heritor 3 - HP 41, MP 30, DEX/AGI +3, STR +4.
    abilities: { DEX: score(18), AGI: score(18), STR: score(24), VIT: score(26), INT: score(24), SPR: score(21) },
    classes: [
      { classId: 'fighter', level: 5 },
      { classId: 'sorcerer', level: 3 },
      { classId: 'heritor', level: 3 },
    ],
    hp: { current: 20 },
    mp: { current: 5 },
    statusEffects: [],
    abyssCorruptionLevel: 0,
    deity: '',
    equipment: { weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
    currency: { cash: 0, savings: 0, debt: 0, spendingLog: '' },
    combatFeats: [],
    experience: { total: 0, spent: 0 },
    spells: [],
    arts: [],
    evocations: [],
    materialCards: {},
    mounts: [],
    performance: EMPTY_PERFORMANCE,
    growthLog: [],
    reputation: 0,
    profile: { gender: '', age: '', avatar: '' },
    notes: { story: '', goals: '', gm: '' },
    connections: [],
    fellow: EMPTY_FELLOW,
    workSkills: [],
    stunts: [],
    aspects: [],
    geomancerQi: EMPTY_GEOMANCER_QI,
    stratagems: [],
    maneuvers: [],
    tacticianEdge: 0,
    essenceWeavings: [],
    schools: [],
    schoolSecrets: [],
    makoStone: 0,
    infusions: [
      { id: 'i1', name: 'Section Quick Reaction I' },
      { id: 'i2', name: 'Tenacious Infusion I' },
    ],
    ...overrides,
  };
}

const sectionOf = (character: Character, id: string) => sectionSheet(character, formFor(character)!.sections.find((entry) => entry.id === id)!);

describe('Basic Values of Multiple Sections (p. 63)', () => {
  it('reads the printed rows', () => {
    expect(basicValues('head', 0)).toEqual({ hp: 14, mp: 10, defense: 1 });
    expect(basicValues('body', 9)).toEqual({ hp: 58, mp: 31, defense: 10 });
    expect(basicValues('wing', 15)).toEqual({ hp: 68, mp: 38, defense: 15 });
    expect(basicValues('evilEye', 8)).toEqual({ hp: 27, mp: 27, defense: 2 });
    expect(basicValues('scorpion', 15)).toEqual({ hp: 97, mp: 48, defense: 17 });
    expect(basicValues('pincers', 6)).toEqual({ hp: 31, mp: 18, defense: 5 });
  });

  it('keeps a level of a column in step: every column grows with the Heritor level', () => {
    for (const column of ['head', 'body', 'wing', 'evilEye', 'scorpion', 'pincers'] as const) {
      for (let level = 1; level <= 15; level += 1) {
        const before = basicValues(column, level - 1);
        const now = basicValues(column, level);
        expect(now.hp, `${column} ${level}`).toBeGreaterThan(before.hp);
        expect(now.mp, `${column} ${level}`).toBeGreaterThanOrEqual(before.mp);
        expect(now.defense, `${column} ${level}`).toBeGreaterThanOrEqual(before.defense);
      }
    }
  });

  it('stops at 15, and a negative level is 0', () => {
    expect(basicValues('head', 40)).toEqual(basicValues('head', 15));
    expect(basicValues('head', -2)).toEqual(basicValues('head', 0));
  });
});

describe('innate weapons (p. 64)', () => {
  it('names a weapon at each rank and keeps its Accuracy modifier and Critical Value', () => {
    expect(INNATE_WEAPONS.bite.SS).toMatchObject({ name: 'Steel Rending Bite', power: 41, criticalValue: 10, stance: '2H#' });
    expect(INNATE_WEAPONS.claws.SS).toMatchObject({ name: 'Murderous Talons', accuracy: 1, criticalValue: 9 });
    expect(INNATE_WEAPONS.scorpionTail.B).toMatchObject({ accuracy: -1, power: 11 });
    expect(INNATE_WEAPONS.pincers.A).toMatchObject({ name: 'Hard Pincers', accuracy: 1, power: 16, criticalValue: 11 });
  });

  it('is raised by the Mastery Infusions, each needing the one before', () => {
    expect(innateRank([])).toBe('B');
    expect(innateRank(['Innate Weapons Mastery A'])).toBe('A');
    expect(innateRank(['Innate Weapons Mastery A', 'Innate Weapons Mastery S'])).toBe('S');
    expect(innateRank(['Innate Weapons Mastery A', 'Innate Weapons Mastery S', 'Innate Weapons Mastery SS'])).toBe('SS');
  });
});

describe('Infusion bonuses', () => {
  it('takes the highest tier as the total, not the sum', () => {
    expect(infusionBonuses([])).toEqual({ hp: 0, defense: 0, checks: 0 });
    expect(infusionBonuses(['Tenacious Infusion I'])).toEqual({ hp: 5, defense: 1, checks: 0 });
    expect(infusionBonuses(['Tenacious Infusion I', 'Tenacious Infusion II', 'Section Quick Reaction I', 'Section Quick Reaction II'])).toEqual({ hp: 10, defense: 2, checks: 2 });
    expect(infusionBonuses(['Tenacious Infusion Mastery', 'Meticulous Infusion Mastery'])).toEqual({ hp: 20, defense: 4, checks: 3 });
  });
});

describe('the worked example of Barbarous Rage p. 56 (a Basilisk, Heritor 3)', () => {
  const rudolf = makeCharacter();

  it('finds the form of the race and the Heritor level', () => {
    expect(formFor(rudolf)?.formName).toBe('Monstrous Form');
    expect(heritorLevelOf(rudolf.classes)).toBe(3);
  });

  it('gives the Head (Main) only its Defense from the table: 2', () => {
    expect(sectionOf(rudolf, 'head')).toMatchObject({ maxHp: 41, maxMp: 30, defense: 2, accuracy: null });
  });

  it('gives the Body 37 HP, 16 MP, Defense 5, Accuracy and Evasion +7 with the Claws', () => {
    expect(sectionOf(rudolf, 'body')).toMatchObject({ maxHp: 37, maxMp: 16, defense: 5, accuracy: 7, evasion: 7, extraDamage: 7 });
    expect(sectionOf(rudolf, 'body').weapon?.name).toBe('Claws');
  });

  it('gives the Evil Eye 21 HP, 16 MP, Defense 1 and no weapon', () => {
    expect(sectionOf(rudolf, 'evil-eye')).toMatchObject({ maxHp: 21, maxMp: 16, defense: 1, weapon: null });
  });
});

describe('a character without Heritor levels', () => {
  const plain = makeCharacter({ classes: [{ classId: 'fighter', level: 5 }], infusions: [] });

  it('reads the 0 column and rolls the sections straight', () => {
    expect(sectionOf(plain, 'body')).toMatchObject({ maxHp: 20, maxMp: 10, defense: 1, accuracy: 0, evasion: 0, extraDamage: 0 });
    expect(scorpionBodyArtEvasion(plain)).toBeNull();
  });
});

describe('transformation', () => {
  it('fills every section to its maximum and restores the Main Section too', () => {
    const changed = enterForm(makeCharacter());
    expect(inForm(changed)).toBe(true);
    expect(changed.form?.parts).toMatchObject({ body: { hp: 37, mp: 16, status: 'ok' }, 'evil-eye': { hp: 21, mp: 16, status: 'ok' } });
    expect(changed.hp.current).toBe(41);
    expect(changed.mp.current).toBe(30);
  });

  it('lets go of the other sections on return and keeps the Main Section as it was', () => {
    const hurt = { ...enterForm(makeCharacter()), hp: { current: 12 } };
    const back = leaveForm(hurt);
    expect(inForm(back)).toBe(false);
    expect(back.hp.current).toBe(12);
    expect(back.form?.parts).toEqual({});
  });

  it('is a no-op for a race without sections, and for a Scissorscorpion, who needs none', () => {
    const human = makeCharacter({ raceId: 'human' });
    expect(enterForm(human)).toBe(human);
    const scorpion = makeCharacter({ raceId: 'scissorscorpion' });
    expect(enterForm(scorpion)).toBe(scorpion);
    expect(inForm(scorpion)).toBe(true);
  });

  it('keeps a knocked-out section knocked out through a new transformation', () => {
    const base = enterForm(makeCharacter());
    const out = { ...base, form: { transformed: true, parts: { ...base.form!.parts, body: { ...base.form!.parts.body, hp: -5, status: 'unconscious' as const } } } };
    const again = enterForm(leaveForm(out));
    expect(again.form?.parts.body).toMatchObject({ hp: -5, status: 'unconscious' });
    expect(again.form?.parts['evil-eye']).toMatchObject({ hp: 21, status: 'ok' });
  });

  it("counts a section's manual bonus in its maximum", () => {
    const base = enterForm(makeCharacter());
    const bonus = setPartBonus(base, 'body', { hp: 4, defense: 2 });
    expect(sectionOf(bonus, 'body')).toMatchObject({ maxHp: 41, defense: 7 });
  });
});

describe('damage to an other section', () => {
  const body = () => enterForm(makeCharacter());

  it('takes Defense off physical damage but not off magic', () => {
    expect(hurtPart(body(), 'body', 12, true).form?.parts.body.hp).toBe(37 - 7); // Defense 5
    expect(hurtPart(body(), 'body', 12, false).form?.parts.body.hp).toBe(37 - 12);
    expect(hurtPart(body(), 'body', 3, true).form?.parts.body.hp).toBe(37);
  });

  it('heals no further than the maximum', () => {
    expect(healPart(hurtPart(body(), 'body', 20, false), 'body', 99).form?.parts.body.hp).toBe(37);
  });

  it('never touches the Main Section, which is the sheet itself', () => {
    const start = body();
    expect(hurtPart(start, 'head', 10, false)).toBe(start);
  });

  it('asks for a Death Check at 0 HP on the Main Section Fortitude: survive = unconscious, fail = disabled', () => {
    const down = hurtPart(body(), 'body', 40, false); // HP -3
    // Fortitude: level 5 + VIT 26/6 = 4 -> 9. Roll 6+6 would be a double 6; take 4+4 = 8 + 9 = 17 >= 3.
    const alive = deathCheckPart(down, 'body', false, dice(4, 4))!;
    expect(alive.character.form?.parts.body.status).toBe('unconscious');
    expect(alive.check.result).toBe('survived');
    // Double 1s fail whatever the numbers.
    const dead = deathCheckPart(down, 'body', false, dice(1, 1))!;
    expect(dead.character.form?.parts.body.status).toBe('disabled');
    // Double 6s get it back on its feet with 1 HP.
    const revived = deathCheckPart(down, 'body', false, dice(6, 6))!;
    expect(revived.character.form?.parts.body).toMatchObject({ status: 'ok', hp: 1 });
  });

  it('asks nothing of a section still standing, and wakes or restores one that is not', () => {
    expect(deathCheckPart(body(), 'body', true)).toBeNull();
    const out = deathCheckPart(hurtPart(body(), 'body', 40, false), 'body', true)!.character; // fixed: 9+7 = 16 >= 3
    expect(out.form?.parts.body.status).toBe('unconscious');
    expect(wakePart(out, 'body').form?.parts.body).toMatchObject({ status: 'ok', hp: 1 });
    const disabled = { ...out, form: { transformed: true, parts: { ...out.form!.parts, body: { ...out.form!.parts.body, status: 'disabled' as const } } } };
    expect(wakePart(disabled, 'body').form?.parts.body.status).toBe('disabled');
    expect(healPart(disabled, 'body', 10).form?.parts.body.hp).toBe(-3);
    expect(restorePart(disabled, 'body').form?.parts.body).toMatchObject({ status: 'ok', hp: 37, mp: 16 });
  });
});

describe('the Scissorscorpion', () => {
  const scorpion = makeCharacter({ raceId: 'scissorscorpion', classes: [{ classId: 'fighter', level: 4 }, { classId: 'heritor', level: 2 }], infusions: [] });

  it('wears armor on the Upper Body, which has no Defense of the table', () => {
    expect(sectionOf(scorpion, 'upper-body')).toMatchObject({ defense: null, accuracy: null });
  });

  it('is in its sections from the start; their state is made on first use at the maxima', () => {
    expect(inForm(scorpion)).toBe(true);
    const made = ensureParts(scorpion);
    expect(made.form?.parts).toMatchObject({ scorpion: { hp: 24, mp: 10, status: 'ok' }, pincers: { hp: 18, mp: 10, status: 'ok' } });
    expect(ensureParts(made)).toBe(made);
  });

  it('may roll Evasion with Heritor level + AGI modifier on the Main Section', () => {
    expect(scorpionBodyArtEvasion(scorpion)).toBe(2 + 3);
  });

  it('carries the Scorpion Tail and the Pincers with their own modifiers', () => {
    expect(sectionOf(scorpion, 'scorpion').weapon).toMatchObject({ name: 'Scorpion Tail', accuracy: -1 });
    expect(sectionOf(scorpion, 'pincers').weapon).toMatchObject({ name: 'Pincers', accuracy: 1 });
  });
});

describe('the forms catalog', () => {
  it('has the four races, each with exactly one Main Section', () => {
    expect(FORMS.map((form) => form.raceId)).toEqual(['diablo', 'drake', 'basilisk', 'scissorscorpion']);
    for (const form of FORMS) expect(form.sections.filter((entry) => entry.main), form.raceId).toHaveLength(1);
  });

  it('counts 2, 3, 3 and 3 sections', () => {
    expect(FORMS.map((form) => form.sections.length)).toEqual([2, 3, 3, 3]);
  });
});

import { describe, expect, it } from 'vitest';
import {
  answerFor,
  askFate,
  askOracle,
  fateAnswer,
  fateModifier,
  chaosAfterScene,
  checkScene,
  clampChaos,
  eventChance,
  FOCUS_FEATURE,
  FOCUS_SITUATION,
  interruptScene,
  pickFromJournal,
  pushEntry,
  rollAdjustment,
  rollEvent,
  openingScene,
  rollOpening,
  rollThemed,
  rollWords,
  THEME_WORDS,
  THEMES,
  sceneTwist,
  yesChance,
  EMPTY_ORACLE,
  LOG_LIMIT,
  type OracleEntry,
} from './oracle';

/** An Rng that hands out the given values in order; each is the fraction of the die's range. */
const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
/** The fraction that makes a d100 land on `n`. */
const pct = (n: number) => (n - 0.5) / 100;

describe('chance of yes', () => {
  it('is the base chance at neutral chaos and moves 5 points per step', () => {
    expect(yesChance('even', 5)).toBe(50);
    expect(yesChance('even', 9)).toBe(70);
    expect(yesChance('even', 1)).toBe(30);
  });

  it('never leaves 3–97, so nothing is certain', () => {
    expect(yesChance('certain', 9)).toBe(97);
    expect(yesChance('impossible', 1)).toBe(3);
  });

  it('keeps chaos in 1–9', () => {
    expect(clampChaos(0)).toBe(1);
    expect(clampChaos(12)).toBe(9);
    expect(eventChance(9)).toBe(27);
  });
});

describe('answers', () => {
  it('reads the roll against the chance, with exceptional ends', () => {
    expect(answerFor(10, 50)).toBe('exceptionalYes');
    expect(answerFor(11, 50)).toBe('yes');
    expect(answerFor(50, 50)).toBe('yes');
    expect(answerFor(51, 50)).toBe('no');
    expect(answerFor(91, 50)).toBe('exceptionalNo');
    expect(answerFor(90, 50)).toBe('no');
  });

  it('adds an event only when the event roll is within the chaos chance', () => {
    expect(askOracle('even', 5, sequence(pct(30), pct(15), 0, 0, 0)).event).not.toBeNull(); // 15 <= 15
    expect(askOracle('even', 5, sequence(pct(30), pct(16), 0, 0, 0)).event).toBeNull();
  });
});

describe('scenes', () => {
  it('goes as expected above half the chaos, bends on odd, breaks in on even', () => {
    expect(sceneTwist(4, 5)).toBe('expected'); // threshold 3
    expect(sceneTwist(3, 5)).toBe('altered');
    expect(sceneTwist(2, 5)).toBe('interrupted');
  });

  it('draws an event only for an interruption', () => {
    expect(checkScene(1, 5, sequence(0.25)).event).toBeNull(); // d10 = 3 → altered
    expect(checkScene(1, 5, sequence(0.15, 0, 0, 0)).event).not.toBeNull();
    expect(checkScene(1, 5, sequence(0.95)).twist).toBe('expected');
  });
});

describe('log', () => {
  it('keeps the newest entries first and trims to the limit', () => {
    let state = EMPTY_ORACLE;
    for (let i = 0; i < LOG_LIMIT + 5; i += 1) {
      state = pushEntry(state, { id: String(i), kind: 'event', event: { focus: 1, action: 1, subject: 1 } } as OracleEntry);
    }
    expect(state.log).toHaveLength(LOG_LIMIT);
    expect(state.log[0].id).toBe(String(LOG_LIMIT + 4));
  });
});

const journal = (...items: Array<[string, 'npc' | 'threat' | 'thread' | 'scene', number, boolean?]>) =>
  items.map(([title, kind, weight, closed = false]) => ({ id: title, kind, title, weight, closed }));

describe('events and the journal', () => {
  it('draws the person from the journal when the focus names one', () => {
    const event = rollEvent(sequence(0.15, 0, 0, 0), { journal: journal(['Marta', 'npc', 1]) }); // d11 = 2: a known character acts
    expect(event).toMatchObject({ focus: 2, ref: { kind: 'npc', title: 'Marta' } });
  });

  it('favours heavier entries', () => {
    const entries = journal(['Light', 'npc', 1], ['Heavy', 'npc', 3]);
    expect(pickFromJournal(entries, 'npc', () => 0)?.title).toBe('Light');
    expect(pickFromJournal(entries, 'npc', () => 0.3)?.title).toBe('Heavy'); // point 1 of 4: past Light's single slot
    expect(pickFromJournal(entries, 'npc', () => 0.99)?.title).toBe('Heavy');
  });

  it('skips settled entries and other kinds; with nobody left the event is about the current situation', () => {
    const entries = journal(['Old wolves', 'threat', 3, true], ['Marta', 'npc', 2], ['Inn', 'scene', 1]);
    expect(pickFromJournal(entries, 'threat')).toBeNull();
    const event = rollEvent(sequence(0.25, 0, 0, 0), { journal: entries }); // d11 = 3: a threat grows, but none is open
    expect(event).toMatchObject({ focus: FOCUS_SITUATION, ref: null });
  });

  it('keeps the focus rolled for foci that point at nobody, and obeys a chosen focus', () => {
    expect(rollEvent(sequence(0.9, 0, 0)).focus).toBe(10);
    expect(rollEvent(sequence(0.9, 0, 0), { focus: 7 }).focus).toBe(7);
    expect(rollEvent(sequence(0.9, 0, 0), { focus: 99 }).focus).toBe(10);
  });

  it('reaches events from questions and from interrupted scenes', () => {
    const entries = journal(['Marta', 'npc', 1]);
    const asked = askOracle('even', 5, sequence(pct(30), pct(1), 0.15, 0, 0, 0), { journal: entries });
    expect(asked.event?.ref?.title).toBe('Marta');
    const stuck = interruptScene(3, 5, sequence(0.15, 0, 0, 0), { journal: entries });
    expect(stuck).toMatchObject({ twist: 'interrupted', roll: 0 });
    expect(stuck.event?.ref?.title).toBe('Marta');
  });
});

describe('chaos after a scene', () => {
  it('normal: control calms, losing it stirs', () => {
    expect(chaosAfterScene('normal', 5, true)).toBe(4);
    expect(chaosAfterScene('normal', 5, false)).toBe(6);
  });

  it('mean: the other way round', () => {
    expect(chaosAfterScene('mean', 5, true)).toBe(6);
    expect(chaosAfterScene('mean', 5, false)).toBe(4);
  });

  it('random: a d10 at or under the chaos lowers it, above raises it; the scene is not judged', () => {
    expect(chaosAfterScene('random', 5, true, sequence(0.45))).toBe(4); // d10 = 5
    expect(chaosAfterScene('random', 5, false, sequence(0.55))).toBe(6); // d10 = 6
  });

  it('never leaves 1–9', () => {
    expect(chaosAfterScene('normal', 1, true)).toBe(1);
    expect(chaosAfterScene('normal', 9, false)).toBe(9);
  });
});

describe('altered scene', () => {
  it('a d10 of 1–6 is one edit, named by the die itself', () => {
    expect(rollAdjustment(sequence(0.25))).toEqual({ roll: 3, edits: [3] });
  });

  it('a d10 of 7–10 is two different edits', () => {
    // d10 = 8, then d6 = 2, then d6 = 2 again (repeat, rolled again) and d6 = 5
    expect(rollAdjustment(sequence(0.75, 0.25, 0.25, 0.75))).toEqual({ roll: 8, edits: [2, 5] });
  });

  it('comes with an altered scene and with nothing else', () => {
    expect(checkScene(1, 5, sequence(0.25, 0.25)).adjustment).toEqual({ roll: 3, edits: [3] }); // scene d10 = 3: altered
    expect(checkScene(1, 5, sequence(0.95)).adjustment).toBeNull();
    expect(checkScene(1, 5, sequence(0.15, 0, 0, 0)).adjustment).toBeNull();
  });
});

describe('deeper meaning', () => {
  it('rolls two words and a connector', () => {
    expect(rollWords(sequence(0, 0.99, 0.99))).toEqual({ action: 1, subject: 20, connector: 6 });
  });
});

describe('oracle as a rule', () => {
  it('uses neutral chaos, turns exceptional answers into plain ones and never brings an event', () => {
    const answer = askOracle('even', 9, sequence(pct(5), pct(1), 0, 0, 0), { asRule: true });
    expect(answer).toMatchObject({ chaos: 5, chance: 50, answer: 'yes', event: null, asRule: true });
    expect(askOracle('even', 1, sequence(pct(99), pct(1)), { asRule: true }).answer).toBe('no');
  });

  it('leaves ordinary questions alone', () => {
    const answer = askOracle('even', 9, sequence(pct(5), pct(1), 0, 0, 0));
    expect(answer).toMatchObject({ chaos: 9, answer: 'exceptionalYes' });
    expect(answer.event).not.toBeNull();
    expect(answer.asRule).toBeUndefined();
  });
});

describe('prepared adventures', () => {
  it('roll the focus from the shorter table', () => {
    // d6 index 0 → the adventure feature; with no features it falls back to the current situation
    expect(rollEvent(sequence(0, 0, 0), { prepared: true }).focus).toBe(FOCUS_SITUATION);
    expect(rollEvent(sequence(0, 0, 0, 0), { prepared: true, features: ['Fog'] })).toMatchObject({ focus: FOCUS_FEATURE, note: 'Fog' });
    expect(rollEvent(sequence(0.99, 0, 0), { prepared: true }).focus).toBe(FOCUS_SITUATION);
    expect(rollEvent(sequence(0.5, 0, 0), { prepared: true }).focus).toBe(7); // d6 = 4: luck
  });

  it('allow the feature focus only in a prepared adventure', () => {
    expect(rollEvent(sequence(0.9, 0, 0), { focus: FOCUS_FEATURE }).focus).toBe(10);
    expect(rollEvent(sequence(0.9, 0, 0, 0), { focus: FOCUS_FEATURE, prepared: true, features: ['Fog'] }).note).toBe('Fog');
  });

  it('never bend a scene: the check only brings an extra event', () => {
    expect(sceneTwist(1, 5, true)).toBe('bonusEvent');
    expect(sceneTwist(2, 5, true)).toBe('bonusEvent');
    expect(sceneTwist(4, 5, true)).toBe('expected');
    const check = checkScene(1, 5, sequence(0.05, 0.2, 0, 0), { prepared: true });
    expect(check.twist).toBe('bonusEvent');
    expect(check.event).not.toBeNull();
    expect(check.adjustment).toBeNull();
  });
});

describe('weight of chaos', () => {
  it('softens or removes the pull of chaos on "yes"', () => {
    expect(yesChance('even', 9)).toBe(70);
    expect(yesChance('even', 9, 'mild')).toBe(62);
    expect(yesChance('even', 1, 'mild')).toBe(38);
    expect(yesChance('even', 9, 'none')).toBe(50);
    expect(yesChance('even', 1, 'none')).toBe(50);
  });

  it('softens the event chance, and fixes it with no chaos', () => {
    expect(eventChance(9)).toBe(27);
    expect(eventChance(9, 'mild')).toBe(18);
    expect(eventChance(1, 'none')).toBe(15);
    expect(eventChance(9, 'none')).toBe(15);
  });

  it('is used by the question', () => {
    expect(askOracle('even', 9, sequence(pct(30), pct(99)), { flavor: 'none' })).toMatchObject({ chance: 50, chaos: 9 });
  });
});

describe('themed words', () => {
  it('rolls one word from each of the theme\'s two lists', () => {
    expect(rollThemed('magic', sequence(0, 0.99))).toEqual({ theme: 'magic', a: 1, b: 20 });
  });

  it('has twenty distinct words in each list, in both languages', async () => {
    const en = (await import('../i18n/locales/en.json')).default.solo.oracle.themes as Record<string, { name: string; a: Record<string, string>; b: Record<string, string> }>;
    const ru = (await import('../i18n/locales/ru.json')).default.solo.oracle.themes as typeof en;
    for (const theme of THEMES) {
      for (const book of [en, ru]) {
        for (const side of ['a', 'b'] as const) {
          const list = Object.values(book[theme][side]);
          expect(list, `${theme}.${side}`).toHaveLength(THEME_WORDS);
          expect(new Set(list).size, `${theme}.${side} repeats a word`).toBe(THEME_WORDS);
        }
      }
    }
    expect(Object.keys(en)).toEqual(Object.keys(ru));
  });
});

describe('opening an adventure', () => {
  it('asks who, what, where and why from themed tables', () => {
    const opening = rollOpening(sequence(0, 0.99));
    expect(opening.parts.map((part) => part.theme)).toEqual(['character', 'world', 'place', 'character']);
    expect(opening.parts[0]).toEqual({ theme: 'character', a: 1, b: 20 });
  });

  it('starts the first scene with no check', () => {
    expect(openingScene(7)).toMatchObject({ scene: 1, chaos: 7, roll: 0, twist: 'expected', event: null });
  });
});

describe('answering with two d10', () => {
  /** The fraction that makes a d10 land on `n`. */
  const d10 = (n: number) => (n - 0.5) / 10;

  it('adds the likelihood and the chaos to the sum', () => {
    expect(fateModifier('even', 5)).toBe(0);
    expect(fateModifier('likely', 9)).toBe(6);
    expect(fateModifier('unlikely', 1)).toBe(-6);
    expect(fateModifier('likely', 9, 'none')).toBe(2);
    expect(fateModifier('even', 9, 'mild')).toBe(2);
  });

  it('reads the total: 11 yes, 18 exceptional yes, 4 exceptional no', () => {
    expect(fateAnswer(10)).toBe('no');
    expect(fateAnswer(11)).toBe('yes');
    expect(fateAnswer(17)).toBe('yes');
    expect(fateAnswer(18)).toBe('exceptionalYes');
    expect(fateAnswer(5)).toBe('no');
    expect(fateAnswer(4)).toBe('exceptionalNo');
  });

  it('keeps the dice, the modifier and the total in the answer', () => {
    const answer = askFate('likely', 5, sequence(d10(4), d10(8)));
    expect(answer).toMatchObject({ answer: 'yes', roll: 12, fate: { dice: [4, 8], modifier: 2, total: 14 }, event: null });
  });

  it('brings an event on doubles within the chaos', () => {
    expect(askFate('even', 5, sequence(d10(3), d10(3), 0, 0, 0)).event).not.toBeNull();
    expect(askFate('even', 5, sequence(d10(7), d10(7), 0, 0, 0)).event).toBeNull(); // 7 is above the chaos
    expect(askFate('even', 5, sequence(d10(3), d10(4), 0, 0, 0)).event).toBeNull(); // not doubles
  });

  it('as a rule: neutral chaos, no exceptional answers, no events', () => {
    const answer = askFate('even', 9, sequence(d10(10), d10(10), 0, 0, 0), { asRule: true });
    expect(answer).toMatchObject({ answer: 'yes', event: null, asRule: true, chaos: 5 });
  });
});

describe('places', () => {
  const placed = (...items: Array<[string, string]>) =>
    items.map(([title, place]) => ({ id: title, kind: 'npc' as const, title, weight: 1, closed: false, place }));

  it('leaves out entries tied to other places, keeps those of the place and those of everywhere', () => {
    const entries = placed(['Harbour clerk', 'Port'], ['Hermit', 'Mountains'], ['Wanderer', '']);
    const titles = new Set<string | undefined>();
    for (const roll of [0, 0.4, 0.99]) titles.add(pickFromJournal(entries, 'npc', () => roll, 'Port')?.title);
    expect([...titles].sort()).toEqual(['Harbour clerk', 'Wanderer']);
  });

  it('plays everything when no place is set', () => {
    const entries = placed(['Hermit', 'Mountains']);
    expect(pickFromJournal(entries, 'npc', () => 0, '')?.title).toBe('Hermit');
  });

  it('gives an event about the situation when the place has nobody', () => {
    const entries = placed(['Hermit', 'Mountains']);
    expect(rollEvent(sequence(0.15, 0, 0, 0), { journal: entries, place: 'Port' })).toMatchObject({ focus: FOCUS_SITUATION, ref: null });
  });
});

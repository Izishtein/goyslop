import { describe, expect, it } from 'vitest';
import {
  answerFor,
  askOracle,
  chaosAfterScene,
  checkScene,
  clampChaos,
  eventChance,
  FOCUS_SITUATION,
  interruptScene,
  pickFromJournal,
  pushEntry,
  rollEvent,
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

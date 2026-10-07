import { describe, expect, it } from 'vitest';
import { answerFor, askOracle, checkScene, clampChaos, eventChance, pushEntry, sceneTwist, yesChance, EMPTY_ORACLE, LOG_LIMIT, type OracleEntry } from './oracle';

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

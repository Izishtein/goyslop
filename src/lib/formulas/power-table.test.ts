import { describe, expect, it } from 'vitest';
import { POWER_TABLE_MAX, powerTableRoll } from './power-table';

describe('power table', () => {
  it('matches the two worked examples in Core Rulebook I p. 137', () => {
    // "if the 2d roll is '5,' we get '3' as the damage value" on the Power 20 table.
    expect(powerTableRoll(20, 5)).toBe(3);
    // Power 27, 2d roll of 5+5=10 -> "remember the result of 9 from the '10 Column'".
    expect(powerTableRoll(27, 10)).toBe(9);
  });

  it('never decreases within a row as the roll improves', () => {
    for (let power = 0; power <= POWER_TABLE_MAX; power++) {
      let previous = -Infinity;
      for (let sum = 3; sum <= 12; sum++) {
        const value = powerTableRoll(power, sum);
        expect(value).toBeGreaterThanOrEqual(previous);
        previous = value;
      }
    }
  });

  it('never decreases within a column as Power increases', () => {
    for (let sum = 3; sum <= 12; sum++) {
      let previous = -Infinity;
      for (let power = 0; power <= POWER_TABLE_MAX; power++) {
        const value = powerTableRoll(power, sum);
        expect(value).toBeGreaterThanOrEqual(previous);
        previous = value;
      }
    }
  });

  it('clamps Power to the printed range instead of reading past the table', () => {
    expect(powerTableRoll(-5, 7)).toBe(powerTableRoll(0, 7));
    expect(powerTableRoll(500, 7)).toBe(powerTableRoll(POWER_TABLE_MAX, 7));
  });

  it('rejects a sum outside 3-12 — a natural 2 is not part of this table', () => {
    expect(() => powerTableRoll(20, 2)).toThrow(RangeError);
    expect(() => powerTableRoll(20, 13)).toThrow(RangeError);
  });
});

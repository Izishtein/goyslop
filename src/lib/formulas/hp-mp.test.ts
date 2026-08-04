import { describe, expect, it } from 'vitest';
import { hpMax, mpMax } from './hp-mp';

describe('hpMax', () => {
  it('adds adventurer level x3 to VIT total', () => {
    expect(hpMax(5, 12)).toBe(5 * 3 + 12);
  });

  it('handles level 1 minimum', () => {
    expect(hpMax(1, 6)).toBe(9);
  });
});

describe('mpMax', () => {
  it('sums wizard-type class levels x3 plus SPR total', () => {
    // Sorcerer Lv3 + Priest Lv2 -> (3 + 2) * 3 + SPR
    expect(mpMax(3 + 2, 10)).toBe(5 * 3 + 10);
  });

  it('is zero-based when character has no wizard-type class levels', () => {
    expect(mpMax(0, 8)).toBe(8);
  });
});

import { describe, expect, it } from 'vitest';
import { totalDefense, totalEvasion, weaponTotalAccuracy, weaponTotalExtraDamage } from './weapon-stats';

describe('weaponTotalAccuracy', () => {
  it('sums warrior class level, DEX modifier, and weapon accuracy bonus', () => {
    expect(weaponTotalAccuracy(3, 2, 1)).toBe(6);
  });
});

describe('weaponTotalExtraDamage', () => {
  it('sums warrior class level, STR modifier, and weapon extra damage bonus', () => {
    expect(weaponTotalExtraDamage(3, 4, 2)).toBe(9);
  });
});

describe('totalDefense', () => {
  it('sums all armor defense values plus shield bonus', () => {
    expect(totalDefense([5, 3], 2)).toBe(10);
  });

  it('handles no armor equipped', () => {
    expect(totalDefense([], 0)).toBe(0);
  });
});

describe('totalEvasion', () => {
  it('adds base evasion, armor modifiers, and shield bonus', () => {
    expect(totalEvasion(4, [1, -1], 2)).toBe(6);
  });
});

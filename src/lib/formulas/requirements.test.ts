import { describe, expect, it } from 'vitest';
import {
  aspectSlots,
  combatFeatSlots,
  combatFeatsSpendingSlots,
  meetsStrength,
  requiredStrength,
  stuntSlots,
  tacticianSlots,
} from './requirements';
import type { CombatFeat } from '../../types/character';

describe('requiredStrength', () => {
  it('is the printed value for everyone but a Fencer', () => {
    expect(requiredStrength(18, false)).toBe(18);
  });

  it('is halved for a Fencer', () => {
    expect(requiredStrength(18, true)).toBe(9);
  });

  it('rounds an odd requirement up rather than down', () => {
    expect(requiredStrength(15, true)).toBe(8);
  });
});

describe('meetsStrength', () => {
  it('compares the full score, not the modifier', () => {
    expect(meetsStrength(18, 18)).toBe(true);
    expect(meetsStrength(17, 18)).toBe(false);
  });

  it('lets a Fencer carry what their raw strength could not', () => {
    expect(meetsStrength(12, 20)).toBe(false);
    expect(meetsStrength(12, 20, true)).toBe(true);
  });
});

describe('combatFeatSlots', () => {
  it('gives one at level 1 — the creation feat and the level 1 feat are the same slot', () => {
    expect(combatFeatSlots(1)).toBe(1);
  });

  it('adds one on each odd level and nothing on the even ones', () => {
    expect([2, 3, 4, 5, 6, 7].map(combatFeatSlots)).toEqual([1, 2, 2, 3, 3, 4]);
  });

  it('covers eight slots by level 15, the range the sheet is drawn for', () => {
    expect(combatFeatSlots(15)).toBe(8);
  });
});

describe('combatFeatsSpendingSlots', () => {
  it('ignores auto-acquired feats, which arrive with a class level and cost nothing', () => {
    const feats: CombatFeat[] = [
      { id: '1', name: 'Dodge', category: 'passive' },
      { id: '2', name: 'Chain Attack', category: 'auto' },
      { id: '3', name: 'Snipe', category: 'majorAction' },
    ];

    expect(combatFeatsSpendingSlots(feats)).toBe(2);
  });
});

describe('stuntSlots', () => {
  it('gives one slot per Rider level, including the first', () => {
    expect([0, 1, 5, 10, 15].map(stuntSlots)).toEqual([0, 1, 5, 10, 15]);
  });

  it('never goes negative', () => {
    expect(stuntSlots(-3)).toBe(0);
  });
});

describe('aspectSlots', () => {
  it('gives one slot per Geomancer level, including the first', () => {
    expect([0, 1, 5, 10, 15].map(aspectSlots)).toEqual([0, 1, 5, 10, 15]);
  });

  it('never goes negative', () => {
    expect(aspectSlots(-3)).toBe(0);
  });
});

describe('tacticianSlots', () => {
  it('gives one shared slot per Tactician level, including the first', () => {
    expect([0, 1, 5, 10, 15].map(tacticianSlots)).toEqual([0, 1, 5, 10, 15]);
  });

  it('never goes negative', () => {
    expect(tacticianSlots(-3)).toBe(0);
  });
});

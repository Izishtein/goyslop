import { describe, expect, it } from 'vitest';
import {
  COMBAT_OPENING_DISTANCES,
  MOVEMENT_DISTANCES,
  SKIRMISH_RANGE,
  SURPRISE_MODIFIERS,
} from './advanced-combat';

describe('Advanced Combat reference tables', () => {
  it('holds the four tables the book prints, each in full', () => {
    expect(COMBAT_OPENING_DISTANCES).toHaveLength(6);
    expect(MOVEMENT_DISTANCES).toHaveLength(3);
    expect(SKIRMISH_RANGE).toHaveLength(4);
    expect(SURPRISE_MODIFIERS).toHaveLength(9);
  });

  it('skirmish range covers 2 to 20 participants without gaps', () => {
    expect(SKIRMISH_RANGE.map((row) => row.participants)).toEqual(['2-5', '6-10', '11-15', '16-20']);
  });
});

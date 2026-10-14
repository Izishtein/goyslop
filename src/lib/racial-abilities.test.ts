import { describe, expect, it } from 'vitest';
import { powerTableRoll } from './formulas/power-table';
import { rollWeaponDamage } from './formulas/damage-roll';
import {
  babaYagaSoulscars,
  limitedRegeneration,
  markUsed,
  newCombat,
  newDay,
  regenerate,
  racialStateOf,
  WEAKENED_EFFECT_ID,
  witchMagicPowerBonus,
  witchsFireBoost,
  witchsFireCost,
  withWeakened,
} from './racial-abilities';

/** An rng that deals the given die faces in order. */
const dice = (...faces: number[]) => {
  let index = 0;
  return () => (faces[index++] - 1 + 0.5) / 6;
};

const state = (witch: boolean) => ({ sunlight: false, witch, usedToday: [], usedInCombat: [] });

describe('Dark Troll', () => {
  it('takes -2 to Accuracy and Evasion in sunlight, as a managed status effect that goes away again', () => {
    const on = withWeakened([], true, 'Weakened');
    expect(on).toHaveLength(1);
    expect(on[0]).toMatchObject({ id: WEAKENED_EFFECT_ID, modifiers: [{ field: 'accuracy', value: -2 }, { field: 'evasion', value: -2 }] });
    expect(withWeakened(on, true, 'Weakened')).toBe(on);
    expect(withWeakened(on, false, 'Weakened')).toEqual([]);
  });

  it('recovers Adventurer level x 5 HP once a day from level 6, as a Minor Action from level 11, never past the maximum', () => {
    expect(limitedRegeneration(5)).toMatchObject({ available: false });
    expect(limitedRegeneration(6)).toEqual({ available: true, minor: false, amount: 30 });
    expect(limitedRegeneration(11)).toEqual({ available: true, minor: true, amount: 55 });
    expect(regenerate(10, 100, 6)).toBe(40);
    expect(regenerate(90, 100, 6)).toBe(100);
    expect(regenerate(120, 100, 6)).toBe(120);
  });
});

describe('spent abilities', () => {
  it('are marked once, freed by a new combat (the once-a-combat ones) or a new day (all)', () => {
    const fresh = racialStateOf({});
    const spent = markUsed(markUsed(fresh, 'limited-regeneration', 'day'), 'disregard', 'combat');
    expect(spent).toMatchObject({ usedToday: ['limited-regeneration'], usedInCombat: ['disregard'] });
    expect(markUsed(spent, 'disregard', 'combat')).toBe(spent);
    expect(newCombat(spent)).toMatchObject({ usedToday: ['limited-regeneration'], usedInCombat: [] });
    expect(newDay(spent)).toMatchObject({ usedToday: [], usedInCombat: [] });
  });
});

describe('Baba Yaga', () => {
  it('has +1 Magic Power and 4 soulscars in the witch’s shape, and only she', () => {
    expect(witchMagicPowerBonus({ raceId: 'baba-yaga', racial: state(true) })).toBe(1);
    expect(witchMagicPowerBonus({ raceId: 'baba-yaga', racial: state(false) })).toBe(0);
    expect(witchMagicPowerBonus({ raceId: 'human', racial: state(true) })).toBe(0);
    expect(babaYagaSoulscars(false)).toBe(2);
    expect(babaYagaSoulscars(true)).toBe(4);
  });

  it('pays the spell’s circle in extra MP for Witch’s Fire, half of it (rounded up) from level 11', () => {
    expect(witchsFireCost(5, 7)).toBe(5);
    expect(witchsFireCost(5, 11)).toBe(3);
    expect(witchsFireCost(4, 12)).toBe(2);
    expect(witchsFireBoost('target')).toBe(2);
    expect(witchsFireBoost('area')).toBe(1);
  });

  it('counts a power roll of 3-10 as +2 (+1 for an area), up to 12, and leaves double 1s and double 6s alone', () => {
    // 2+3 = 5 counts as 7 on the Power 20 row
    expect(rollWeaponDamage(20, 13, 0, false, dice(2, 3), 2).powerTableTotal).toBe(powerTableRoll(20, 7));
    expect(rollWeaponDamage(20, 13, 0, false, dice(2, 3), 1).powerTableTotal).toBe(powerTableRoll(20, 6));
    expect(rollWeaponDamage(20, 13, 0, false, dice(2, 3), 0).powerTableTotal).toBe(powerTableRoll(20, 5));
    // a 10 counts as 12 (capped) and so reaches a Critical Value of 11, which a plain 10 does not
    expect(rollWeaponDamage(20, 11, 0, false, dice(5, 5, 3, 3), 2).steps).toHaveLength(2);
    expect(rollWeaponDamage(20, 11, 0, false, dice(5, 5, 3, 3), 0).steps).toHaveLength(1);
    // double 1s still deal nothing; double 6s stay 12
    expect(rollWeaponDamage(20, 13, 5, false, dice(1, 1), 2)).toMatchObject({ fumble: true, calculatedDamage: 0 });
    expect(rollWeaponDamage(20, 13, 0, false, dice(6, 6), 2).powerTableTotal).toBe(powerTableRoll(20, 12));
  });
});

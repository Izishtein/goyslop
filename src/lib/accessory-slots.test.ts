import { describe, expect, it } from 'vitest';
import { ACCESSORY_SLOTS, isAccessorySlot, slotCapacity, slotProblems } from './accessory-slots';

describe('accessory slots', () => {
  it('takes one accessory in each of nine slots, for most races', () => {
    expect(ACCESSORY_SLOTS).toHaveLength(9);
    expect(ACCESSORY_SLOTS.every((slot) => slotCapacity('human', slot) === 1)).toBe(true);
    expect(isAccessorySlot('waist')).toBe(true);
    expect(isAccessorySlot('ankle')).toBe(false);
    expect(isAccessorySlot(undefined)).toBe(false);
  });

  it('gives a Centaur two waist slots and no feet slot (Barbarous Rage p. 35)', () => {
    expect(slotCapacity('centaur', 'waist')).toBe(2);
    expect(slotCapacity('centaur', 'feet')).toBe(0);
    expect(slotCapacity('centaur', 'neck')).toBe(1);
  });

  it('bars a Scissorscorpion from the waist and the feet', () => {
    expect(slotCapacity('scissorscorpion', 'waist')).toBe(0);
    expect(slotCapacity('scissorscorpion', 'feet')).toBe(0);
    expect(slotCapacity('scissorscorpion', 'head')).toBe(1);
  });

  it('finds the slots that hold too much or cannot be used, and leaves unslotted rows alone', () => {
    const rows = [{ slot: 'waist' }, { slot: 'waist' }, { slot: 'feet' }, { slot: undefined }, { slot: 'neck' }];
    expect(slotProblems(rows, 'human')).toEqual([{ slot: 'waist', kind: 'crowded', count: 2, capacity: 1 }]);
    expect(slotProblems(rows, 'centaur')).toEqual([{ slot: 'feet', kind: 'forbidden', count: 1, capacity: 0 }]);
    expect(slotProblems([{ slot: 'waist' }, { slot: 'waist' }, { slot: 'waist' }], 'centaur')).toEqual([{ slot: 'waist', kind: 'crowded', count: 3, capacity: 2 }]);
  });
});

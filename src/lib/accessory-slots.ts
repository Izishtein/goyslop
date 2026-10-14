import type { Accessory } from '../types/character';

/**
 * Where accessories are worn (Core Rulebook I): nine slots, one accessory in each — head, face, ears, neck, back, the
 * right and left hand, waist, feet. A race can change that: a Centaur has no feet to put anything on and a second waist
 * in their place ([Half-Horse, Half-Human], Barbarous Rage p. 35), a Scissorscorpion cannot wear anything at the waist or
 * on the feet at all (p. 54).
 */
export const ACCESSORY_SLOTS = ['head', 'face', 'ears', 'neck', 'back', 'rightHand', 'leftHand', 'waist', 'feet'] as const;
export type AccessorySlot = (typeof ACCESSORY_SLOTS)[number];

export const isAccessorySlot = (value: string | undefined): value is AccessorySlot => (ACCESSORY_SLOTS as readonly string[]).includes(value ?? '');

/** How many accessories the slot takes on this race: 1 as a rule, 0 where it cannot be worn, 2 for the Centaur's waist. */
export function slotCapacity(raceId: string, slot: AccessorySlot): number {
  if (raceId === 'centaur') return slot === 'feet' ? 0 : slot === 'waist' ? 2 : 1;
  if (raceId === 'scissorscorpion' && (slot === 'waist' || slot === 'feet')) return 0;
  return 1;
}

export interface SlotProblem {
  slot: AccessorySlot;
  kind: 'forbidden' | 'crowded';
  count: number;
  capacity: number;
}

/** Slots that hold more than they may — or that the race cannot use at all — with how many sit there. Rows with no slot, or a slot the sheet does not know, are left alone. */
export function slotProblems(accessories: Pick<Accessory, 'slot'>[], raceId: string): SlotProblem[] {
  const problems: SlotProblem[] = [];
  for (const slot of ACCESSORY_SLOTS) {
    const count = accessories.filter((entry) => entry.slot === slot).length;
    const capacity = slotCapacity(raceId, slot);
    if (count > capacity) problems.push({ slot, kind: capacity === 0 ? 'forbidden' : 'crowded', count, capacity });
  }
  return problems;
}

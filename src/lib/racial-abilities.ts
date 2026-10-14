import type { Character, RacialState, StatusEffect } from '../types/character';
import { upsertManagedEffect } from './formulas/status-effects';

/*
 * The active abilities of the Barbarous races that have no sections (Barbarous Rage pp. 24, 32, 48): what they do to
 * the numbers on the sheet, and the bookkeeping of "once per day" and "once per combat". The sheet does the sums;
 * deciding when an ability is used stays with the player.
 */

/** A Dark Troll under the sun takes -2 to Accuracy and Evasion checks ([Weakened], p. 24). */
export const WEAKENED_PENALTY = 2;
export const WEAKENED_EFFECT_ID = 'racial-weakened';

/** The character's status effects with [Weakened] on or off; the same array comes back when nothing changes. */
export function withWeakened(effects: StatusEffect[], sunlight: boolean, name: string): StatusEffect[] {
  const modifiers = sunlight ? (['accuracy', 'evasion'] as const).map((field) => ({ field, value: -WEAKENED_PENALTY })) : [];
  return upsertManagedEffect(effects, WEAKENED_EFFECT_ID, name, 'racial', modifiers);
}

/**
 * [Limited Regeneration] (Dark Troll, from level 6, p. 24): once per day recover "Adventurer level x 5" HP with a
 * Major Action — a Minor Action from level 11.
 */
export function limitedRegeneration(level: number): { available: boolean; minor: boolean; amount: number } {
  return { available: level >= 6, minor: level >= 11, amount: level * 5 };
}

export const LIMITED_REGENERATION = 'limited-regeneration';
export const DISREGARD = 'disregard';

/** [Witch Transformation] (p. 32): Magic Power +1 for every class while in the witch's shape. */
export const WITCH_MAGIC_POWER = 1;

export const witchMagicPowerBonus = (character: Partial<Pick<Character, 'raceId' | 'racial'>>): number =>
  character.raceId === 'baba-yaga' && character.racial?.witch ? WITCH_MAGIC_POWER : 0;

/** The soulscars a Baba Yaga has: 2, and 2 more in the witch's shape (p. 32). */
export const babaYagaSoulscars = (witch: boolean): number => (witch ? 4 : 2);

/** What [Witch's Fire] adds to the power roll: +2 to a 2d roll of 3-10 against "Target: 1 Character", +1 against "Target: 1 Area" (from level 6). */
export type WitchsFireMode = 'target' | 'area';
export const witchsFireBoost = (mode: WitchsFireMode): 1 | 2 => (mode === 'target' ? 2 : 1);

/** The extra MP [Witch's Fire] takes: the spell's circle, half of it (rounded up) from level 11. */
export const witchsFireCost = (circle: number, level: number): number => (level >= 11 ? Math.ceil(circle / 2) : circle);

/** Whether a spell of an Area target may take [Witch's Fire]: level 6 and up. */
export const witchsFireAreaFrom = 6;

export const racialStateOf = (character: Pick<Character, 'racial'>): RacialState => character.racial ?? { sunlight: false, witch: false, usedToday: [], usedInCombat: [] };

/** An ability marked spent, once a day or once a combat. */
export function markUsed(state: RacialState, id: string, scope: 'day' | 'combat'): RacialState {
  const key = scope === 'day' ? 'usedToday' : 'usedInCombat';
  return state[key].includes(id) ? state : { ...state, [key]: [...state[key], id] };
}

/** A new combat frees the once-a-combat abilities; a new day frees everything. */
export const newCombat = (state: RacialState): RacialState => ({ ...state, usedInCombat: [] });
export const newDay = (state: RacialState): RacialState => ({ ...state, usedToday: [], usedInCombat: [] });

/** HP after [Limited Regeneration]: the amount, never past the maximum (and never less than it was). */
export const regenerate = (current: number, max: number, level: number): number => Math.max(current, Math.min(max, current + limitedRegeneration(level).amount));

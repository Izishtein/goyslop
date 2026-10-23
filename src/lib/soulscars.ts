import type { Character, StatusEffect } from '../types/character';
import { upsertManagedEffect } from './formulas/status-effects';
import { babaYagaSoulscars } from './racial-abilities';

/*
 * "Soulscars" (Barbarous Rage and Barbarous Saga): the depth of a Barbarous lineage, printed in each race's table.
 * Several items of Barbarous Rage pp. 69-72 run on the number; the sheet works the sums out, and a player may
 * overwrite the count (a soulscar taken in play, a GM's ruling).
 */
export const RACE_SOULSCARS: Record<string, number> = {
  'dark-troll': 4,
  arbor: 2,
  'baba-yaga': 2,
  centaur: 3,
  dawn: 2,
  kobold: 1,
  diablo: 4,
  drake: 4,
  basilisk: 4,
  scissorscorpion: 4,
  'broken-drake': 3,
  lamia: 2,
  dhampir: 2,
  // Core I (Nightmare; Soulscars, p. 319) and the Outlaw Profile Book: a Nightmare is "born with a single Soulscar" (the Shadowborn and Soleilborn are Nightmares).
  nightmare: 1,
  'shadowborn-nightmare': 1,
  'soleilborn-nightmare': 1,
  // Arcane Relic pp. 14-33 and Raxia Life pp. 45-46 print the count for each of these (0 is written out because the book says so).
  alv: 1,
  weakling: 2,
  shadow: 0,
  soleil: 0,
  abyssborn: 0,
  newman: 0,
  spriggan: 0,
  fluorite: 0,
  'dark-dwarf': 0,
};

/** "Once five soulscars have been accumulated ... the character immediately becomes a Revenant" (Core I p. 185). */
export const REVENANT_AT = 5;

/** The soulscars of a race as printed; a Baba Yaga in the witch's shape has two more. */
export function raceSoulscars(raceId: string, witch = false): number {
  return raceId === 'baba-yaga' ? babaYagaSoulscars(witch) : (RACE_SOULSCARS[raceId] ?? 0);
}

/** The character's soulscars: the player's own count when there is one, else the race's. */
export const soulscarsOf = (character: Pick<Character, 'raceId' | 'racial'>): number =>
  character.racial?.soulscars ?? raceSoulscars(character.raceId, character.racial?.witch === true);

/**
 * [Soulscar Shackles] (p. 70): "0-1 soulscars: speed 1 and all skill checks -4; 2: all skill checks -2; 3: no
 * restriction; 4+: no effect". The penalty to skill checks, 0 when the shackles do not hold.
 */
export const shacklesPenalty = (soulscars: number): number => (soulscars <= 1 ? 4 : soulscars === 2 ? 2 : 0);
export const shacklesSlowed = (soulscars: number): boolean => soulscars <= 1;

/**
 * The Mirror (p. 73) against an [Evil Eye of Petrification]: the Willpower check is made as usual; a result 4 or
 * more over the eye's Success Value turns the eye back on the Basilisk, who may not resist it.
 */
export const MIRROR_MARGIN = 4;
export const mirrorReflects = (willpowerResult: number, eyeValue: number): boolean => willpowerResult - eyeValue >= MIRROR_MARGIN;

/** What the soulscar items add up to for this character (the amounts the book gives as a function of the count). */
export function soulscarSums(soulscars: number, rangerLevel: number, intModifier: number) {
  return {
    /** Ignis Charm, Wrath Cloaker, Hell's Earrings (Listen), Soulscar Processing (Extra Damage): the count itself. */
    bonus: soulscars,
    /** Tinted Potion: Power 20 + Ranger level + INT modifier + soulscars. */
    tintedPower: 20 + rangerLevel + intModifier + soulscars,
    /** Jet Black Revitalizing Wine: Max HP up for 3 minutes. */
    wineHp: soulscars * 5,
    /** Soulscar Night Visor: hours of darkvision. */
    visorHours: soulscars,
  };
}

export const SHACKLES_EFFECT_ID = 'racial-shackles';

/** The status effects with the shackles' penalty on or off — it follows the soulscar count; the same array when nothing changes. */
export function withShackles(effects: StatusEffect[], worn: boolean, soulscars: number, name: string): StatusEffect[] {
  const penalty = worn ? shacklesPenalty(soulscars) : 0;
  return upsertManagedEffect(effects, SHACKLES_EFFECT_ID, name, 'racial', penalty > 0 ? [{ field: 'skillChecks', value: -penalty }] : []);
}

export function fortitude(adventurerLevel: number, vitModifier: number): number {
  return adventurerLevel + vitModifier;
}

export function willpower(adventurerLevel: number, sprModifier: number): number {
  return adventurerLevel + sprModifier;
}

export function accuracy(warriorClassLevel: number, dexModifier: number): number {
  return warriorClassLevel + dexModifier;
}

/** Marksman does not add its class level to Evasion. */
export function evasion(warriorClassLevel: number, agiModifier: number): number {
  return warriorClassLevel + agiModifier;
}

export function extraDamage(warriorClassLevel: number, strModifier: number): number {
  return warriorClassLevel + strModifier;
}

export function magicPower(wizardClassLevel: number, intModifier: number): number {
  return wizardClassLevel + intModifier;
}

/** Bard: the Standard Value behind Performance checks and the Power of every Finale. */
export function bardicPower(bardClassLevel: number, intModifier: number): number {
  return bardClassLevel + intModifier;
}

/** Enhancer: the Standard Value for Techniques that attack, such as [Fire Breath]. */
export function enhancerPower(enhancerClassLevel: number, intModifier: number): number {
  return enhancerClassLevel + intModifier;
}

/** Alchemist: the Standard Value of every Evocation check (Core III p. 107). */
export function evocationPower(alchemistClassLevel: number, intModifier: number): number {
  return alchemistClassLevel + intModifier;
}

/*
 * Check packages: Standard Values a player rolls against all session long, each of them
 * "class level + ability modifier" like the combat ones above
 * (docs/sheet-content/04-combat-and-scas.md, "Check Packages"). A character without the
 * class still rolls the universal ones on a level of 0 — the modifier alone.
 */

/**
 * Initiative. The derived-values table gives the Scout (or Tactician) level, and the
 * universal-checks list files Initiative under AGI, so both terms are in: without either
 * class it is the AGI modifier by itself, which is the "базовая инициатива" of the docs.
 */
export function initiative(scoutOrTacticianLevel: number, agiModifier: number): number {
  return scoutOrTacticianLevel + agiModifier;
}

/** First Aid is a universal check — every character has it, on Adventurer Level. */
export function firstAid(adventurerLevel: number, dexModifier: number): number {
  return adventurerLevel + dexModifier;
}

/** Danger Sense / Observation — the Scout's package. */
export function dangerSense(scoutClassLevel: number, intModifier: number): number {
  return scoutClassLevel + intModifier;
}

/** Monster Knowledge — the Sage's package, and what finds a monster's weak point. */
export function monsterKnowledge(sageClassLevel: number, intModifier: number): number {
  return sageClassLevel + intModifier;
}

/** Healing Power — how much a Priest's healing restores. */
export function healingPower(priestClassLevel: number, intModifier: number): number {
  return priestClassLevel + intModifier;
}

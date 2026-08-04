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

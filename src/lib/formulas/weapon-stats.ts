/** Total Accuracy (SV) = Warrior Class Level + DEX modifier + weapon's own accuracy bonus. */
export function weaponTotalAccuracy(warriorClassLevel: number, dexModifier: number, weaponAccuracyBonus: number): number {
  return warriorClassLevel + dexModifier + weaponAccuracyBonus;
}

/** Total Extra Damage = Warrior Class Level + STR modifier + weapon's own extra damage bonus. */
export function weaponTotalExtraDamage(warriorClassLevel: number, strModifier: number, weaponExtraDamageBonus: number): number {
  return warriorClassLevel + strModifier + weaponExtraDamageBonus;
}

/** Total Defense = sum of all equipped armor's defense + shield's defense bonus. */
export function totalDefense(armorDefenseValues: number[], shieldDefenseBonus: number): number {
  return armorDefenseValues.reduce((sum, value) => sum + value, 0) + shieldDefenseBonus;
}

/** Total Evasion = base Evasion (Warrior Lv + AGI mod) + armor/shield evasion modifiers. */
export function totalEvasion(baseEvasion: number, armorEvasionModifiers: number[], shieldEvasionBonus: number): number {
  return baseEvasion + armorEvasionModifiers.reduce((sum, value) => sum + value, 0) + shieldEvasionBonus;
}

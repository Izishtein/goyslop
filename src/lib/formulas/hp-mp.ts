/** HP max = Adventurer Level * 3 + VIT (total value, not modifier) */
export function hpMax(adventurerLevel: number, vitTotal: number): number {
  return adventurerLevel * 3 + vitTotal;
}

/** MP max = sum of Wizard-type class levels * 3 + SPR (total value, not modifier) */
export function mpMax(wizardClassLevelSum: number, sprTotal: number): number {
  return wizardClassLevelSum * 3 + sprTotal;
}

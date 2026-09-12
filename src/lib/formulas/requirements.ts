import type { CombatFeat } from '../../types/character';

/**
 * A weapon's Required Strength, as the wielder actually experiences it.
 *
 * A Fencer treats it as half (docs/sheet-content/06-equipment.md, "Min STR"). The book
 * gives no rounding for the odd values, so this rounds the requirement up — the strict
 * reading, and the one that never tells a player a weapon is fine when it might not be.
 * Armor is unaffected: the halving is a weapon rule.
 */
export function requiredStrength(minStr: number, isFencer: boolean): number {
  return isFencer ? Math.ceil(minStr / 2) : minStr;
}

/** Strength is compared as the full score, not its modifier. */
export function meetsStrength(strTotal: number, minStr: number, isFencer = false): boolean {
  return strTotal >= requiredStrength(minStr, isFencer);
}

/**
 * Combat Feat slots: one at character creation and one at every odd Adventurer Level
 * (1, 3, 5, 7 … — docs/sheet-content/04-combat-and-scas.md). The level-1 slot and the
 * creation slot are the same one, so a level 1 character has exactly one.
 */
export function combatFeatSlots(adventurerLevel: number): number {
  return Math.floor((Math.max(0, adventurerLevel) + 1) / 2);
}

/** Auto-acquired feats arrive with a class level and cost no slot, so they do not count. */
export function combatFeatsSpendingSlots(feats: CombatFeat[]): number {
  return feats.filter((feat) => feat.category !== 'auto').length;
}

/** Rider Stunt slots: "When taking a level of the Rider class, including the first, you can
 *  choose a Stunt" (Core III p. 86) — one slot per Rider level, no odd/even split like SCA. */
export function stuntSlots(riderLevel: number): number {
  return Math.max(0, riderLevel);
}

/** Geomancer Aspect slots: "Geomancer level = you may open one Aspect of a matching level"
 *  (Magus Arts p. 19) — one slot per Geomancer level, the same shape as Rider Stunts. */
export function aspectSlots(geomancerLevel: number): number {
  return Math.max(0, geomancerLevel);
}

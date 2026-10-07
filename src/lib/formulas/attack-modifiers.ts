import type { CombatFeat } from '../../types/character';

/** What the combat feats declared for an attack do to its numbers. */
export interface AttackModifiers {
  /** Added to the Accuracy check. */
  accuracy: number;
  /** Added to the weapon's Critical Value (before the floor of 8). */
  criticalValue: number;
  /** Flat damage added after the Power Table chain ("Total Damage", CR I p. 137). */
  damage: number;
  /** Each 2d roll of 3-11 counts one higher on the Power Table ([Lethal Strike]). */
  lethal: boolean;
  /** Names of the feats that actually changed something, for the roll's own readout. */
  applied: string[];
}

interface FeatEffect {
  accuracy?: number;
  criticalValue?: number;
  damage?: number;
  /** Damage equal to the caster's Magic Power ([Mana Strike]). */
  magicPower?: boolean;
  lethal?: boolean;
}

/**
 * The declared feats that touch a weapon attack, read from their effect text (CR I pp. 255+,
 * CR II pp. 198+, CR III pp. 199+). Only effects that are a plain number are here: feats whose
 * effect depends on the target ([Armor Piercer]'s Defense, [Cleave]'s three targets,
 * [Snipe]'s doubling, [Repeated Strike]'s second attack) are left to the table.
 */
const FEAT_EFFECTS: Record<string, FeatEffect> = {
  'power strike i': { damage: 4 },
  'power strike ii': { damage: 12 },
  'power strike iii': { damage: 20 },
  'decoy attack i': { accuracy: -2, damage: 2 },
  'decoy attack ii': { accuracy: -2, damage: 8 },
  'aimed attack i': { accuracy: 1, criticalValue: 1 },
  'aimed attack ii': { accuracy: 2 },
  'aimed attack iii': { accuracy: 3 },
  'armor piercer i': { criticalValue: 1 },
  'armor piercer ii': { criticalValue: 1 },
  'lethal strike i': { lethal: true },
  'lethal strike ii': { lethal: true },
  'lethal strike iii': { lethal: true },
  'mana strike': { magicPower: true },
};

export function declaredAttackModifiers(declared: CombatFeat[], magicPower: number): AttackModifiers {
  const result: AttackModifiers = { accuracy: 0, criticalValue: 0, damage: 0, lethal: false, applied: [] };
  for (const feat of declared) {
    const effect = FEAT_EFFECTS[feat.name.trim().toLowerCase()];
    if (!effect) continue;
    result.accuracy += effect.accuracy ?? 0;
    result.criticalValue += effect.criticalValue ?? 0;
    result.damage += (effect.damage ?? 0) + (effect.magicPower ? magicPower : 0);
    result.lethal ||= effect.lethal === true;
    result.applied.push(feat.name);
  }
  return result;
}

/**
 * The Critical Value actually rolled against: every modifier applies, but "in SW2.5 the final
 * Critical Value will never be 7 or less" — it is raised to 8 (CR I p. 137). A value of 13 or
 * more simply never triggers, since 2d6 tops out at 12.
 */
export function effectiveCriticalValue(base: number, modifier: number): number {
  return Math.max(8, base + modifier);
}

/** A Fencer's attacks have their Critical Value lowered by 1 (CR I p. 137). */
export const FENCER_CRITICAL_MODIFIER = -1;

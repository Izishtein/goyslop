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
  /** [Snipe] declared: Total Damage doubles when the Success Value beats the target's by 3 or more. */
  snipe: boolean;
  /** [Repeated Strike II] declared: +4 damage when the first Accuracy check hit. */
  repeatedStrikeII: boolean;
  /** Targets one Accuracy check may cover: 3 under [Cleave I], 5 under [Cleave II], otherwise 1. */
  targets: 1 | 3 | 5;
  /** [Repeated Strike I/II] declared: a target that evaded may be attacked again. */
  repeatedStrike: boolean;
  /** Names of the feats that actually changed something, for the roll's own readout. */
  applied: string[];
  /** Highest [Armor Piercer] tier declared (0 = none): it works on the target's Defense, not on a number here. */
  armorPiercer: 0 | 1 | 2 | 3;
  /** [Taunting Strike I/II] declared (0 = none): what a hit provokes is played out by lib/player-attack.ts. */
  taunt: 0 | 1 | 2;
}

/**
 * The target's Defense under [Armor Piercer] on a hit: half, rounded up (all tiers); 0 when the damage
 * was a critical and the tier is II or III (CR I p. 258 and the supplements).
 */
export function armorPiercerDefense(tier: 0 | 1 | 2 | 3, defense: number, critical: boolean): number {
  if (tier === 0) return defense;
  if (critical && tier >= 2) return 0;
  return Math.ceil(defense / 2);
}

const ARMOR_PIERCER_TIER: Record<string, 1 | 2 | 3> = { 'armor piercer i': 1, 'armor piercer ii': 2, 'armor piercer iii': 3 };

interface FeatEffect {
  accuracy?: number;
  criticalValue?: number;
  damage?: number;
  /** Damage equal to the caster's Magic Power ([Mana Strike]). */
  magicPower?: boolean;
  lethal?: boolean;
  snipe?: boolean;
  repeatedStrikeII?: boolean;
  repeatedStrike?: boolean;
  targets?: 3 | 5;
  taunt?: 1 | 2;
}

/**
 * The declared feats that touch a weapon attack, read from their effect text (CR I pp. 255+,
 * CR II pp. 198+, CR III pp. 199+). Only effects that are a plain number are here: feats whose
 * effect depends on the target ([Snipe]'s doubling, [Repeated Strike]'s second attack, how many
 * targets [Cleave] reaches) are only flagged here and played out by lib/player-attack.ts; [Armor Piercer]'s Defense is `armorPiercerDefense`.
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
  // [Cleave I]: every target hit takes -3 damage; [Cleave II] has no such reduction.
  'cleave i': { damage: -3, targets: 3 },
  'cleave ii': { targets: 5 },
  'repeated strike i': { repeatedStrike: true },
  snipe: { snipe: true },
  'repeated strike ii': { repeatedStrike: true, repeatedStrikeII: true },
  'lethal strike i': { lethal: true },
  'lethal strike ii': { lethal: true },
  'lethal strike iii': { lethal: true },
  'mana strike': { magicPower: true },
  // Taunting Strike: -2 damage whatever the target (the damage is still dealt as 0 and the taunt holds); II is the same with a milder taunt for the clever
  'taunting strike i': { damage: -2, taunt: 1 },
  'taunting strike ii': { damage: -2, taunt: 2 },
};

export function declaredAttackModifiers(declared: CombatFeat[], magicPower: number): AttackModifiers {
  const result: AttackModifiers = { accuracy: 0, criticalValue: 0, damage: 0, lethal: false, snipe: false, repeatedStrikeII: false, targets: 1, repeatedStrike: false, applied: [], armorPiercer: 0, taunt: 0 };
  for (const feat of declared) {
    const tier = ARMOR_PIERCER_TIER[feat.name.trim().toLowerCase()];
    if (tier && tier > result.armorPiercer) result.armorPiercer = tier;
    const effect = FEAT_EFFECTS[feat.name.trim().toLowerCase()];
    if (!effect) continue;
    result.accuracy += effect.accuracy ?? 0;
    result.criticalValue += effect.criticalValue ?? 0;
    result.damage += (effect.damage ?? 0) + (effect.magicPower ? magicPower : 0);
    result.lethal ||= effect.lethal === true;
    result.snipe ||= effect.snipe === true;
    result.repeatedStrikeII ||= effect.repeatedStrikeII === true;
    result.repeatedStrike ||= effect.repeatedStrike === true;
    if (effect.targets && effect.targets > result.targets) result.targets = effect.targets;
    if (effect.taunt && effect.taunt > result.taunt) result.taunt = effect.taunt;
    if (effect.accuracy || effect.criticalValue || effect.damage || effect.magicPower || effect.lethal) result.applied.push(feat.name);
  }
  return result;
}

/** Pinpoint Attack I / II raise every Accuracy check by +1 / +2 (CR I); the higher one counts. */
export function passiveAccuracyBonus(feats: CombatFeat[]): number {
  let best = 0;
  for (const feat of feats) {
    const name = feat.name.trim().toLowerCase();
    if (name === 'pinpoint attack i') best = Math.max(best, 1);
    if (name === 'pinpoint attack ii') best = Math.max(best, 2);
  }
  return best;
}

/** "Swords" / "Axes" / "War Hammer" → the singular, spaceless word the weapon categories use. */
function categoryKey(text: string): string {
  return text.toLowerCase().replace(/[^a-z]/g, '').replace(/s$/, '');
}

/**
 * Weapon Proficiency A/** adds +1 damage and Weapon Proficiency S/** +3 in total (CR I) to weapons of
 * the category the player wrote after the slash. Both held: the S value counts. A weapon whose
 * category is unknown, or a feat with no category written, changes nothing.
 */
export function proficiencyDamage(feats: CombatFeat[], category: string | undefined): number {
  if (!category) return 0;
  let best = 0;
  for (const feat of feats) {
    const match = /^weapon proficiency ([as])\s*\/\s*(.+)$/i.exec(feat.name.trim());
    if (!match || categoryKey(match[2]) !== categoryKey(category)) continue;
    best = Math.max(best, match[1].toLowerCase() === 's' ? 3 : 1);
  }
  return best;
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

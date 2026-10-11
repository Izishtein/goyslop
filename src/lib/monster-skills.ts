import type { Monster, MonsterSection, MonsterSkill } from '../data/monsters/types';
import { damageModifier, rollD6, rollMonsterAttack, type EvasionRoll, type Rng } from './encounter';
import { rollSpellcastingCheck, spellResisted, type SpellcastingCheck } from './spell-check';

/** Whether a section can strike at all: it prints an Accuracy value and a damage formula. */
export function isAttackSection(section: MonsterSection): boolean {
  return section.accuracy !== null && 'value' in section.accuracy && section.damage !== null;
}

/**
 * The section a skill works from. A skill that names sections ("Tail", "Right Side/Left Side") belongs to
 * the first attacking section whose style names one of them; "All Sections" and an unnamed skill fall to the
 * first attacking section. -1 when the monster has none.
 */
export function skillSectionIndex(monster: Monster, skill: MonsterSkill): number {
  const named = (skill.section ?? '')
    .split('/')
    .map((part) => part.replace(/ Sections?$/, '').trim())
    .filter((part) => part !== '' && part !== 'All');
  const attacking = monster.sections.map((section, index) => ({ section, index })).filter((entry) => isAttackSection(entry.section));
  const match = named.length > 0 ? attacking.find((entry) => named.some((part) => entry.section.style.includes(part))) : undefined;
  return (match ?? attacking[0])?.index ?? -1;
}

/** An attack on several characters with a single Accuracy check: [Cleave I/II] and Tail Sweep. */
export interface AreaAttack {
  name: string;
  /** Characters it can reach. */
  max: number;
  /** Added to each damage roll ([Cleave I]: -3). */
  damage: number;
  sectionIndex: number;
  /** The book's own limit on using it, in its words (Tail Sweep: not in consecutive rounds). */
  restriction: string | null;
}

export function areaAttacksOf(monster: Monster): AreaAttack[] {
  const found: AreaAttack[] = [];
  for (const skill of monster.skills) {
    const name = skill.name.trim();
    if (!/^(Cleave I{1,2}|Tail Sweep)$/.test(name)) continue;
    const text = skill.text.join(' ');
    const max = Number(/up to (\d+)/.exec(text)?.[1]) || (name === 'Cleave II' ? 5 : name === 'Cleave I' ? 3 : 0);
    const sectionIndex = skillSectionIndex(monster, skill);
    if (max < 2 || sectionIndex < 0 || found.some((entry) => entry.name === name)) continue;
    const reduced = /reduced by -(\d+)/.exec(text);
    found.push({
      name,
      max,
      damage: reduced ? -Number(reduced[1]) : 0,
      sectionIndex,
      restriction: /consecutive (?:rounds|turns)/i.test(text) ? 'consecutive' : null,
    });
  }
  return found;
}

/** [Charge]: an attack with its own target number, usable in a round that moves, dealing its own damage. */
export interface ChargeAttack {
  name: string;
  accuracy: number;
  fixed: number | null;
  damage: string;
  sectionIndex: number;
}

export function chargeOf(monster: Monster): ChargeAttack | null {
  for (const skill of monster.skills) {
    const match = /^Charge\s*\/\s*(\d+)\s*\((\d+)\)/.exec(skill.name.trim());
    const damage = /"(2d[+-]?\d*)"/.exec(skill.text.join(' '))?.[1];
    if (!match || !damage) continue;
    const sectionIndex = skillSectionIndex(monster, skill);
    if (sectionIndex < 0) continue;
    return { name: 'Charge', accuracy: Number(match[1]), fixed: Number(match[2]), damage, sectionIndex };
  }
  return null;
}

/** The monster's Accuracy check for a charge, from its own number rather than the section's. */
export function rollChargeAttack(charge: ChargeAttack, fixed: boolean, rng: Rng = Math.random) {
  const section = { style: charge.name, accuracy: { value: charge.accuracy, fixed: charge.fixed }, damage: charge.damage, evasion: null, defense: null, hp: null, mp: null };
  return rollMonsterAttack(section, fixed, rng);
}

/** "Poison/5 (12)/Fortitude/Neg": extra poison damage on a hit, which a Fortitude check can negate. */
export interface PoisonRider {
  name: string;
  value: number;
  fixed: number | null;
  /** A flat number of points, or "2d" plus a modifier. */
  damage: { flat: number } | { dice: true; modifier: number };
  /** A rider that needs the hit to have inflicted damage (Desert Scorpion). */
  needsDamage: boolean;
  sectionIndex: number | null;
}

export function poisonRiderOf(monster: Monster, sectionIndex: number): PoisonRider | null {
  for (const skill of monster.skills) {
    const head = /^Poison\s*\/\s*(\d+)\s*\(\s*(\d+)\s*\)\s*\/\s*Fortitude/.exec(skill.name.trim());
    if (!head) continue;
    const text = skill.text.join(' ');
    const flat = /(\d+)\s*(?:points? of )?poison/i.exec(text);
    const dice = /(2d(?:[+-]\d+)?)\s+poison/i.exec(text);
    const damage = dice ? ({ dice: true, modifier: damageModifier(dice[1]) } as const) : flat ? { flat: Number(flat[1]) } : null;
    if (!damage) continue;
    const named = skill.section ? skillSectionIndex(monster, skill) : null;
    if (named !== null && named !== sectionIndex) continue;
    return { name: 'Poison', value: Number(head[1]), fixed: Number(head[2]), damage, needsDamage: /1 or more applied damage/i.test(text), sectionIndex: named };
  }
  return null;
}

export interface PoisonResult {
  /** The monster's check against the target's Fortitude check. */
  check: SpellcastingCheck;
  /** Whether the target's Fortitude check negated the poison. */
  resisted: boolean;
  /** Points of poison magic damage that got through (no Defense applies). */
  dealt: number;
}

/**
 * Poison after a hit: the monster rolls 2d6 + its number (or takes the Fixed Value) against the target's
 * Fortitude check; "Neg" means a tie or better for the target cancels it (like any resisted effect).
 */
export function resolvePoison(rider: PoisonRider, save: EvasionRoll, fixed: boolean, rng: Rng = Math.random): PoisonResult {
  const check: SpellcastingCheck = fixed
    ? { dice: [0, 0], value: rider.fixed ?? rider.value + 7, outcome: null }
    : rollSpellcastingCheck(rider.value, rng);
  const resisted = spellResisted(check, save);
  const points = 'flat' in rider.damage ? rider.damage.flat : rollD6(rng) + rollD6(rng) + rider.damage.modifier;
  return { check, resisted, dealt: resisted ? 0 : Math.max(0, points) };
}

/** How a monster takes damage of certain kinds: [Tough Skin] and [Fire Vulnerability]. */
export interface DamageTraits {
  /** Taken off every hit of the bludgeoning type. */
  bludgeoningReduction: number;
  /** Added to every hit of the fire type. */
  fireBonus: number;
}

export function damageTraitsOf(monster: Monster, sectionIndex: number): DamageTraits {
  const style = monster.sections[sectionIndex]?.style ?? '';
  const traits: DamageTraits = { bludgeoningReduction: 0, fireBonus: 0 };
  for (const skill of monster.skills) {
    const named = (skill.section ?? '')
      .split('/')
      .map((part) => part.replace(/ Sections?$/, '').trim())
      .filter((part) => part !== '' && part !== 'All');
    if (named.length > 0 && !named.some((part) => style.includes(part))) continue;
    const text = skill.text.join(' ');
    if (/^Tough Skin/.test(skill.name)) traits.bludgeoningReduction = Math.max(traits.bludgeoningReduction, Number(/reduced by -(\d+)/.exec(text)?.[1]) || 0);
    if (/^Fire Vulnerability/.test(skill.name)) traits.fireBonus = Math.max(traits.fireBonus, Number(/extra (\d+) damage/.exec(text)?.[1]) || 0);
  }
  return traits;
}

/** What the damage type of a hit does to the damage that got through Defense (0 stays 0: nothing was dealt to add to or take from). */
export function traitAdjustment(traits: DamageTraits, kind: { bludgeoning: boolean; fire: boolean }): number {
  return (kind.fire ? traits.fireBonus : 0) - (kind.bludgeoning ? traits.bludgeoningReduction : 0);
}

/** Weapon categories whose blows are bludgeoning (the mace/staff/flail/hammer groups and bare fists). */
export function isBludgeoningCategory(category: string | undefined): boolean {
  return category === 'mace' || category === 'staff' || category === 'flail' || category === 'warhammer' || category === 'wrestling';
}

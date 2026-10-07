import type { Monster, MonsterLoot, MonsterSection } from '../data/monsters/types';

/** Dice are injectable so a roll can be checked; the default is the browser's. */
export type Rng = () => number;

export function rollD6(rng: Rng = Math.random): number {
  return 1 + Math.floor(rng() * 6);
}

/** The number the book prints for a section's HP/MP; a template mark ("※+1") counts as 0. */
export function numberOf(value: number | string | null | undefined): number {
  return typeof value === 'number' ? value : 0;
}

/** One monster on the table: only what changes in play is stored, the rest is the catalogue's. */
export interface EncounterMonster {
  id: string;
  monsterId: string;
  /** "Goblin 2" — several of the same monster need telling apart. */
  label: string;
  /** Current HP and MP of each section, in the order of the monster's rows. */
  sections: { hp: number; mp: number }[];
}

export interface Encounter {
  round: number;
  monsters: EncounterMonster[];
}

export const EMPTY_ENCOUNTER: Encounter = { round: 0, monsters: [] };

/** A fresh instance at full HP and MP; `taken` is the labels already in use. */
export function spawnMonster(monster: Monster, taken: string[], id: string): EncounterMonster {
  let label = monster.name;
  for (let n = 2; taken.includes(label); n += 1) label = `${monster.name} ${n}`;
  return {
    id,
    monsterId: monster.id,
    label,
    sections: monster.sections.map((section) => ({ hp: numberOf(section.hp), mp: numberOf(section.mp) })),
  };
}

/**
 * Damage dealt to one section. Physical damage is reduced by the section's Defense, magic
 * is not (CR I p. 135); HP may go below zero — the section is then down, and a Death Check
 * (or the GM's word) says whether it dies. Returns the new instance and the damage that
 * actually landed.
 */
export function damageSection(
  instance: EncounterMonster,
  index: number,
  amount: number,
  defense: number,
  physical: boolean,
): { instance: EncounterMonster; dealt: number } {
  const dealt = Math.max(0, amount - (physical ? defense : 0));
  return {
    dealt,
    instance: {
      ...instance,
      sections: instance.sections.map((section, i) => (i === index ? { ...section, hp: section.hp - dealt } : section)),
    },
  };
}

export function healSection(instance: EncounterMonster, index: number, amount: number, max: number): EncounterMonster {
  return {
    ...instance,
    sections: instance.sections.map((section, i) => (i === index ? { ...section, hp: Math.min(max, section.hp + amount) } : section)),
  };
}

/** A section at 0 HP or less is down. */
export const isDown = (section: { hp: number }): boolean => section.hp <= 0;

/** The monster is out of the fight when its main section — or, with none named, every section — is down. */
export function isDefeated(monster: Monster, instance: EncounterMonster): boolean {
  const main = monster.mainSection ? monster.sections.findIndex((section) => monster.mainSection && section.style.includes(`(${monster.mainSection})`)) : -1;
  if (main >= 0 && instance.sections[main]) return isDown(instance.sections[main]);
  return instance.sections.every(isDown);
}

/** "2d+12" / "2d-2" / "2d" → the modifier. */
export function damageModifier(damage: string): number {
  const match = /^2d([+-]\d+)?$/.exec(damage.trim());
  return match?.[1] ? Number(match[1]) : 0;
}

export interface MonsterAttackRoll {
  dice: [number, number];
  /** 2d6 + the monster's Accuracy. */
  successValue: number;
  /** Snake eyes always miss, boxcars always hit (CR I p. 106). */
  outcome: 'fumble' | 'critical' | null;
}

/** The attacker's Accuracy check. In fixed mode nothing is rolled: the printed Fixed Value is the Success Value. */
export function rollMonsterAttack(section: MonsterSection, fixed: boolean, rng: Rng = Math.random): MonsterAttackRoll | null {
  const accuracy = section.accuracy;
  if (!accuracy || !('value' in accuracy)) return null;
  if (fixed) return { dice: [0, 0], successValue: accuracy.fixed ?? accuracy.value + 7, outcome: null };
  const dice: [number, number] = [rollD6(rng), rollD6(rng)];
  const sum = dice[0] + dice[1];
  return { dice, successValue: sum + accuracy.value, outcome: sum === 2 ? 'fumble' : sum === 12 ? 'critical' : null };
}

/** A hit needs a Success Value above the defender's: with an Evasion fixed at 10 the attacker
 *  needs 11 (CR I p. 137). A fumble never hits, an automatic success always does. */
export function attackHits(attack: MonsterAttackRoll, evasionValue: number): boolean {
  if (attack.outcome === 'fumble') return false;
  if (attack.outcome === 'critical') return true;
  return attack.successValue > evasionValue;
}

export interface EvasionRoll {
  dice: [number, number] | null;
  /** 2d6 + Evasion, or the Fixed Value. */
  value: number;
  outcome: 'fumble' | 'critical' | null;
}

/** The defender's Evasion check against `successValue` — rolled, or the Fixed Value (Evasion + 7). */
export function rollEvasion(evasion: number, fixed: boolean, rng: Rng = Math.random): EvasionRoll {
  if (fixed) return { dice: null, value: evasion + 7, outcome: null };
  const dice: [number, number] = [rollD6(rng), rollD6(rng)];
  const sum = dice[0] + dice[1];
  return { dice, value: sum + evasion, outcome: sum === 2 ? 'fumble' : sum === 12 ? 'critical' : null };
}

/**
 * Whether an attack lands against a rolled Evasion. A natural 2 fails and a natural 12 succeeds
 * whatever the numbers; when both sides have one, the defender's double 6s and the attacker's
 * cancel to a plain comparison, and a double 1 on either side loses to the other side's
 * automatic success.
 */
export function resolveAttack(attack: MonsterAttackRoll, evasion: EvasionRoll): boolean {
  if (attack.outcome === 'fumble') return false;
  if (evasion.outcome === 'critical' && attack.outcome !== 'critical') return false;
  if (attack.outcome === 'critical') return true;
  if (evasion.outcome === 'fumble') return true;
  return attackHits(attack, evasion.value);
}

export interface MonsterDamageRoll {
  dice: [number, number] | null;
  modifier: number;
  total: number;
}

/** The monster's damage: 2d + X, rolled as it stands — monsters never roll criticals (CR I p. 135). */
export function rollMonsterDamage(section: MonsterSection, fixed: boolean, rng: Rng = Math.random): MonsterDamageRoll | null {
  if (!section.damage) return null;
  const modifier = damageModifier(section.damage);
  if (fixed) return { dice: null, modifier, total: 7 + modifier };
  const dice: [number, number] = [rollD6(rng), rollD6(rng)];
  return { dice, modifier, total: dice[0] + dice[1] + modifier };
}

/** Whether a loot row's "2–7" / "11+" / "Always" covers a 2d roll. */
export function lootRowMatches(roll: string, sum: number): boolean {
  if (roll === 'Always') return true;
  const range = /^(\d+)–(\d+)$/.exec(roll);
  if (range) return sum >= Number(range[1]) && sum <= Number(range[2]);
  const open = /^(\d+)\+$/.exec(roll);
  return open ? sum >= Number(open[1]) : false;
}

/** Everything a 2d roll drops: every "Always" row plus the one row the roll lands in. */
export function lootFor(loot: MonsterLoot[], sum: number): MonsterLoot[] {
  return loot.filter((row) => row.roll === 'Always' || lootRowMatches(row.roll, sum));
}

/** Monster Knowledge: a Sage's check at or above the target number reveals what the monster is
 *  (Reputation) or its weak point (Weakness). */
export function knowledgeResult(monster: Monster, successValue: number): { identified: boolean; weak: boolean } {
  return {
    identified: monster.reputation !== null && successValue >= monster.reputation,
    weak: monster.weakness !== null && successValue >= monster.weakness,
  };
}

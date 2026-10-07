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
/** What a Death Check left of a section at 0 HP or less: alive but out cold, or gone for good. */
export type SectionFate = 'out' | 'dead';

export interface EncounterMonster {
  id: string;
  monsterId: string;
  /** "Goblin 2" — several of the same monster need telling apart. */
  label: string;
  /** Current HP and MP of each section, in the order of the monster's rows. */
  sections: { hp: number; mp: number; fate?: SectionFate }[];
  /** Monster Knowledge has told the player what this is / where it is weak (CR I p. 108). */
  identified?: boolean;
  weakKnown?: boolean;
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
      // Fresh damage on a section that was out cold asks for a new Death Check (CR I p. 184).
      sections: instance.sections.map((section, i) => (i === index ? { hp: section.hp - dealt, mp: section.mp } : section)),
    },
  };
}

export function healSection(instance: EncounterMonster, index: number, amount: number, max: number): EncounterMonster {
  return {
    ...instance,
    sections: instance.sections.map((section, i) => {
      if (i !== index) return section;
      const hp = Math.min(max, section.hp + amount);
      return hp > 0 ? { hp, mp: section.mp } : { ...section, hp };
    }),
  };
}

export interface DeathCheckRoll {
  dice: [number, number] | null;
  value: number;
  /** The HP deficit without its minus sign (CR I p. 110). */
  target: number;
  /** 'revived' = double 6s, back on 1 HP; 'survived' = unconscious but alive; 'dead'. */
  result: 'revived' | 'survived' | 'dead';
}

/**
 * A Death Check (CR I p. 110): 2d6 + the Standard Value against the HP deficit. Double 6s wake the
 * character with 1 HP, double 1s are a failure whatever the numbers; with Fixed Values neither
 * happens (p. 383). A monster rolls with its Fortitude, a PC with Adventurer Level + VIT bonus.
 */
export function rollDeathCheck(standard: number, hp: number, fixed: boolean, rng: Rng = Math.random): DeathCheckRoll {
  const target = Math.max(0, -hp);
  const roll = rollEvasion(standard, fixed, rng);
  const base = { dice: roll.dice, value: roll.value, target };
  if (roll.outcome === 'critical') return { ...base, result: 'revived' };
  if (roll.outcome === 'fumble') return { ...base, result: 'dead' };
  return { ...base, result: roll.value >= target ? 'survived' : 'dead' };
}

/** Writes a Death Check into a section: dead, out cold, or back up on 1 HP. */
export function applyDeathCheck(instance: EncounterMonster, index: number, check: DeathCheckRoll): EncounterMonster {
  return {
    ...instance,
    sections: instance.sections.map((section, i) => {
      if (i !== index) return section;
      if (check.result === 'revived') return { hp: 1, mp: section.mp };
      return { ...section, fate: check.result === 'dead' ? 'dead' : 'out' };
    }),
  };
}

/** What a monster's declared attack changes: a bonus or penalty to its Accuracy and to its damage. */
export interface Declaration {
  name: string;
  accuracy: number;
  damage: number;
}

/** The declarations whose effect is a plain number (the same ones a PC's combat feat gives), by the name the book prints. */
const DECLARATION_EFFECTS: Record<string, { accuracy: number; damage: number }> = {
  'Power Strike': { accuracy: 0, damage: 4 },
  'Power Strike I': { accuracy: 0, damage: 4 },
  'Power Strike II': { accuracy: 0, damage: 12 },
  'Power Strike III': { accuracy: 0, damage: 20 },
  'Decoy Attack I': { accuracy: -2, damage: 2 },
  'Decoy Attack II': { accuracy: -2, damage: 8 },
  'All-Out Attack': { accuracy: 0, damage: 8 },
  'Aimed Attack': { accuracy: 1, damage: 0 },
  'Improved Aimed Attack': { accuracy: 4, damage: -8 },
};

/**
 * The declarations a monster's Unique Skills offer that change a single attack by a fixed amount.
 * A skill that names a body section ("●Head") only works from rows of that section.
 */
export function declarationsOf(monster: Monster, sectionIndex: number): Declaration[] {
  const style = monster.sections[sectionIndex]?.style ?? '';
  const found: Declaration[] = [];
  for (const skill of monster.skills) {
    const effect = DECLARATION_EFFECTS[skill.name.replace(/\s*[=/].*$/, '').trim()];
    if (!effect) continue;
    const named = skill.section ? skill.section.replace(/ Sections?$/, '') : '';
    if (named && named !== 'All' && !style.includes(named)) continue;
    const name = skill.name.replace(/\s*[=/].*$/, '').trim();
    if (!found.some((entry) => entry.name === name)) found.push({ name, ...effect });
  }
  return found;
}

/** The HP a monster's "Regeneration = N points" returns at the end of each round, and whether it works on every section. */
export function regenerationOf(monster: Monster): { amount: number; allSections: boolean } | null {
  const skill = monster.skills.find((entry) => /^Regeneration\s*=\s*\d+/.test(entry.name));
  if (!skill) return null;
  const amount = Number(/(\d+)/.exec(skill.name)?.[1]);
  const text = skill.text.join(' ');
  return { amount, allSections: /each section|all remaining|all sections/i.test(text) };
}

/**
 * End of round: each standing section a regenerating monster has recovers its points (a section at 0 HP or
 * less does not). A monster with several sections that names none recovers on its first.
 */
export function regenerate(monster: Monster, instance: EncounterMonster): { instance: EncounterMonster; healed: number } {
  const rule = regenerationOf(monster);
  if (!rule) return { instance, healed: 0 };
  let healed = 0;
  const sections = instance.sections.map((section, index) => {
    if (section.hp <= 0 || (!rule.allSections && index !== 0)) return section;
    const max = numberOf(monster.sections[index]?.hp);
    const hp = Math.min(max, section.hp + rule.amount);
    healed += hp - section.hp;
    return { ...section, hp };
  });
  return { instance: { ...instance, sections }, healed };
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

export interface KnowledgeRoll {
  dice: [number, number] | null;
  value: number;
  /** A natural 2 learns nothing, a natural 12 learns everything there is to learn. */
  outcome: 'fumble' | 'critical' | null;
  identified: boolean;
  weak: boolean;
}

/** A Monster Knowledge check: 2d6 + Sage Lv + INT bonus (or the Fixed Value) against the two target numbers. */
export function rollKnowledge(monster: Monster, modifier: number, fixed: boolean, rng: Rng = Math.random): KnowledgeRoll {
  const roll = rollEvasion(modifier, fixed, rng);
  const base = { dice: roll.dice, value: roll.value, outcome: roll.outcome };
  if (roll.outcome === 'fumble') return { ...base, identified: false, weak: false };
  if (roll.outcome === 'critical') return { ...base, identified: monster.reputation !== null, weak: monster.weakness !== null };
  return { ...base, ...knowledgeResult(monster, roll.value) };
}

/**
 * Classes that recognise a whole kind of monster without a roll: the Conjurer knows golems, the
 * Sorcerer familiars, the Fairy Tamer ordinary fairies (not the olden ones). The weak point still
 * takes a Sage's roll.
 */
export function autoIdentifies(monster: Monster, classIds: string[]): boolean {
  if (monster.category === 'Golems') return classIds.includes('conjurer');
  if (monster.category === 'Familiars') return classIds.includes('sorcerer');
  if (monster.category === 'Fairies') return classIds.includes('fairy-tamer') && !monster.skills.some((skill) => skill.name.startsWith('Olden'));
  return false;
}

/** Monster Knowledge: a Sage's check at or above the target number reveals what the monster is
 *  (Reputation) or its weak point (Weakness). */
export function knowledgeResult(monster: Monster, successValue: number): { identified: boolean; weak: boolean } {
  return {
    identified: monster.reputation !== null && successValue >= monster.reputation,
    weak: monster.weakness !== null && successValue >= monster.weakness,
  };
}

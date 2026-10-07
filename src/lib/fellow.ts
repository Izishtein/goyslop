import type { Character, FellowAction } from '../types/character';
import { abilityModifier, abilityTotal } from './formulas/abilities';
import { primaryWarriorLevel } from './formulas/character-defense';
import { adventurerLevel } from './formulas/character-levels';
import { getSpellPower } from '../data/spell-power';
import { effectiveCriticalValue, FENCER_CRITICAL_MODIFIER } from './formulas/attack-modifiers';
import { magicPower } from './formulas/derived-stats';
import { mpMax } from './formulas/hp-mp';
import { wizardLevelSum } from './formulas/character-levels';
import { schoolLevel } from './spellcasting';
import { sumModifiersForField } from './formulas/status-effects';

/** The faces of a d6 a Fellow Action Table row answers to: "1-2", "3 – 4", "5", "1, 2". */
export function parseFellowRoll(text: string): number[] {
  const faces = new Set<number>();
  for (const part of text.split(',')) {
    const range = /^\s*([1-6])\s*[-–—]\s*([1-6])\s*$/.exec(part);
    if (range) {
      for (let face = Number(range[1]); face <= Number(range[2]); face += 1) faces.add(face);
      continue;
    }
    const single = /^\s*([1-6])\s*$/.exec(part);
    if (single) faces.add(Number(single[1]));
  }
  return [...faces].sort((a, b) => a - b);
}

/** The row of the table a roll of 1d lands on, if any row claims that face. */
export function fellowActionFor(actions: FellowAction[], die: number): FellowAction | null {
  return actions.find((action) => parseFellowRoll(action.roll).includes(die)) ?? null;
}

/** The check value printed in the Value column: the Success Value the action counts as having rolled. */
export function fellowValue(action: FellowAction): number | null {
  const match = /-?\d+/.exec(action.value ?? '');
  return match ? Number(match[0]) : null;
}

export interface FellowAttack {
  power: number;
  criticalValue: number;
  extraDamage: number;
  /** A spell ("Power 10+5") ignores Defense and crits at 10; a weapon's Crit Value is printed. */
  magic: boolean;
}

/**
 * Reads an attack's Effect cell: "Power 25/Crit Value 10 + 4" for a weapon, "Power 10+5" for a
 * spell (whose Critical Value is 10 unless stated, CR I p. 169). Anything else — a check, a
 * heal with no Power — is not an attack.
 */
export function fellowAttack(action: FellowAction): FellowAttack | null {
  const text = action.effect ?? '';
  const weapon = /Power\s*(\d+)\s*\/\s*(?:C(?:rit(?:ical)?)?\.?\s*Value|CV)\s*(\d+)\s*\+\s*(\d+)/i.exec(text);
  if (weapon) return { power: Number(weapon[1]), criticalValue: Number(weapon[2]), extraDamage: Number(weapon[3]), magic: false };
  // A healing spell reads "Heal Power 20+5": it has Power too, but nothing to hit.
  const spell = /^\s*heal/i.test(text) ? null : /Power\s*(\d+)\s*\+\s*(\d+)/i.exec(text);
  if (spell) return { power: Number(spell[1]), criticalValue: 10, extraDamage: Number(spell[2]), magic: true };
  return null;
}

/** A healing spell row: "Heal Power 20+5" — the Power and the Magic Power added to it. */
export function fellowHeal(action: FellowAction): { power: number; bonus: number } | null {
  const match = /^\s*heal\w*:?\s*Power\s*(\d+)\s*\+\s*(\d+)/i.exec(action.effect ?? '');
  return match ? { power: Number(match[1]), bonus: Number(match[2]) } : null;
}

/** The MP a row spends when it is carried out, written in the action's name as "MP5" (CR I p. 202, p. 206). */
export function mpCostOf(action: FellowAction): number {
  const match = /\bMP\s*(\d+)/i.exec(action.name);
  return match ? Number(match[1]) : 0;
}

/** The Fellow's MP pool, as the sheet derives it. */
export function fellowMpMax(character: Character): number {
  return mpMax(wizardLevelSum(character.classes), abilityTotal(character.abilities.SPR));
}

/**
 * The damage spell a Fellow would cast: of the spells the sheet lists, the one with the most Power it
 * can pay for out of its full MP (ties: the cheaper). Its Magic Power is the level of the class that
 * casts that school plus the INT bonus. Spells with no Power in the catalogue are not considered.
 */
export function bestDamageSpell(character: Character): { name: string; mp: number; power: number; magicPower: number } | null {
  const intMod = abilityModifier(abilityTotal(character.abilities.INT));
  const budget = fellowMpMax(character);
  let best: { name: string; mp: number; power: number; magicPower: number } | null = null;
  for (const spell of character.spells) {
    const data = getSpellPower(spell.id);
    if (!data || data.kind !== 'damage' || spell.mp > budget) continue;
    const level = schoolLevel(character, spell.school);
    if (level <= 0) continue;
    const candidate = { name: spell.name, mp: spell.mp, power: data.power, magicPower: magicPower(level, intMod) };
    if (!best || candidate.power > best.power || (candidate.power === best.power && candidate.mp < best.mp)) best = candidate;
  }
  return best;
}

/** "Round the Power": to the nearest 5 — 11–12 down to 10, 13–17 to 15, 18–19 up to 20 (CR I p. 205). */
export function roundPower(power: number): number {
  return Math.round(power / 5) * 5;
}

/** Text a generated row says, in the sheet's language — supplied by the caller. */
export interface SuggestedWording {
  /** The name used when the weapon row has none. */
  weapon: string;
  attack: (weapon: string) => string;
  spell: (spell: string, mp: number) => string;
  rangedAttack: (weapon: string, range: string) => string;
  attackWithFeat: (weapon: string, feat: string) => string;
  observation: string;
  scoutObservation: string;
  movement: string;
  scoutMovement: string;
  dialogue: { attack: string; feat: string; observation: string; movement: string; spell: string };
}

/**
 * A starting Fellow Action Table built from the sheet, by the book's own rules (CR I pp. 200–205):
 * four rows answering to 1–2, 3–4, 5 and 6, whose Results are 7, 8, 9 and 10, and whose Value is
 * that Result plus the action's Standard Value. A weapon attack carries Power (rounded to 5),
 * Crit Value and Extra Damage in its Effect. The player edits it afterwards — the book leaves
 * the choice of actions to them; this only saves the arithmetic.
 */
export function suggestFellowActions(character: Character, words: SuggestedWording, newId: () => string): FellowAction[] {
  const level = adventurerLevel(character.classes);
  const warriorLevel = primaryWarriorLevel(character);
  const mod = (id: 'DEX' | 'AGI' | 'STR' | 'INT') => abilityModifier(abilityTotal(character.abilities[id]));
  const scout = character.classes.filter((entry) => entry.classId === 'scout').reduce((max, entry) => Math.max(max, entry.level), 0);
  const isFencer = character.classes.some((entry) => entry.classId === 'fencer');
  const accuracyStatus = sumModifiersForField(character.statusEffects, 'accuracy');
  const weapon = [...character.equipment.weapons].filter((entry) => !entry.gun).sort((a, b) => b.power - a.power)[0];
  const weaponName = weapon?.name || words.weapon;

  /** One attack row: Value = Result + Accuracy, Effect = Power/Crit Value + Extra Damage, each
   *  nudged by the feat the row declares ([Power Strike I] +4 damage, [Aimed Attack I] +1 Accuracy, +1 Crit Value). */
  const attackRow = (roll: string, result: number, name: string, dialogue: string, bonus = { accuracy: 0, critical: 0, damage: 0 }): FellowAction => {
    const accuracy = warriorLevel + mod('DEX') + (weapon?.accuracyBonus ?? 0) + accuracyStatus + bonus.accuracy;
    const extra = warriorLevel + mod('STR') + (weapon?.extraDamageBonus ?? 0) + bonus.damage;
    const critical = effectiveCriticalValue(weapon?.criticalValue ?? 10, (isFencer ? FENCER_CRITICAL_MODIFIER : 0) + bonus.critical);
    return { id: newId(), roll, name, dialogue, value: String(result + accuracy), effect: `Power ${roundPower(weapon?.power ?? 0)}/Crit Value ${critical} + ${extra}` };
  };
  const spell = bestDamageSpell(character);
  /** A spell row: Value = Result + Magic Power (the spellcasting check), Effect = "Power 10+5"; the MP cost sits in the name. */
  const spellRow = (roll: string, result: number): FellowAction => ({
    id: newId(),
    roll,
    name: words.spell(spell!.name, spell!.mp),
    dialogue: words.dialogue.spell,
    value: String(result + spell!.magicPower),
    effect: `Power ${spell!.power}+${spell!.magicPower}`,
  });
  const plainName = weapon?.range ? words.rangedAttack(weaponName, weapon.range) : words.attack(weaponName);

  const rows: FellowAction[] = [];
  if (weapon) rows.push(attackRow('1-2', 7, plainName, words.dialogue.attack));
  else if (spell) rows.push(spellRow('1-2', 7));

  rows.push({
    id: newId(),
    roll: '3-4',
    name: scout > 0 ? words.scoutObservation : words.observation,
    dialogue: words.dialogue.observation,
    value: String(8 + (scout > 0 ? scout : level) + mod('INT')),
  });

  if (spell && !weapon) {
    rows.push(spellRow('5', 9));
  } else if (weapon) {
    const has = (name: string) => character.combatFeats.some((entry) => entry.name === name);
    if (has('Power Strike I')) rows.push(attackRow('5', 9, words.attackWithFeat(weaponName, 'Power Strike I'), words.dialogue.feat, { accuracy: 0, critical: 0, damage: 4 }));
    else if (has('Aimed Attack I')) rows.push(attackRow('5', 9, words.attackWithFeat(weaponName, 'Aimed Attack I'), words.dialogue.feat, { accuracy: 1, critical: 1, damage: 0 }));
    // The same attack may be entered twice, once in 1-2/3-4 and once in 5/6 (CR I p. 204).
    else if (spell && spell.power > (weapon.power ?? 0)) rows.push(spellRow('5', 9));
    else rows.push(attackRow('5', 9, plainName, words.dialogue.attack));
  }

  rows.push({
    id: newId(),
    roll: '6',
    name: scout > 0 ? words.scoutMovement : words.movement,
    dialogue: words.dialogue.movement,
    value: String(10 + (scout > 0 ? scout : level) + mod('AGI')),
  });
  return rows;
}

import { basicValues, formOf, infusionBonuses, innateRank, INNATE_WEAPONS, type FormDefinition, type FormSection, type InnateWeapon } from '../data/sections';
import type { Character, FormPartState, FormState } from '../types/character';
import { rollDeathCheck, type DeathCheckRoll, type Rng } from './encounter';
import { abilityModifier, abilityTotal } from './formulas/abilities';
import { characterFortitude } from './formulas/character-defense';
import { adventurerLevel, wizardLevelSum } from './formulas/character-levels';
import { hpMax, mpMax } from './formulas/hp-mp';

export const NO_BONUS = { hp: 0, mp: 0, defense: 0 };

/** The Heritor class level, which every value of the other sections is looked up by (0 without the class). */
export function heritorLevelOf(classes: Character['classes']): number {
  return classes.filter((entry) => entry.classId === 'heritor').reduce((max, entry) => Math.max(max, entry.level), 0);
}

/** The form of the character's race, if the race has sections. */
export function formFor(character: Pick<Character, 'raceId'>): FormDefinition | undefined {
  return formOf(character.raceId);
}

/** Whether the character stands in its sections now: always for a Scissorscorpion, between transformation and return for the others. */
export function inForm(character: Pick<Character, 'raceId' | 'form'>): boolean {
  const form = formOf(character.raceId);
  return !!form && (form.always || character.form?.transformed === true);
}

export interface SectionSheet {
  section: FormSection;
  /** Maximum HP and MP: the Main Section's are the sheet's own. */
  maxHp: number;
  maxMp: number;
  /** Defense from the table; null for a Main Section that wears armor instead (the Scissorscorpion's Upper Body). */
  defense: number | null;
  /** Standard Values of the Heritor class: Accuracy (Heritor level + DEX modifier) and Evasion (Heritor level + AGI modifier); 0 is a straight roll. Null for the Main Section, which rolls as the sheet does. */
  accuracy: number | null;
  evasion: number | null;
  /** Heritor level + STR modifier, which counts as Extra Damage when the Accuracy check was made with the class. */
  extraDamage: number | null;
  weapon: InnateWeapon | null;
  state: FormPartState | null;
}

const maxOf = (character: Character) => ({
  hp: hpMax(adventurerLevel(character.classes), abilityTotal(character.abilities.VIT)),
  mp: mpMax(wizardLevelSum(character.classes), abilityTotal(character.abilities.SPR)),
});

/** Everything the sheet shows and rolls for one section. */
export function sectionSheet(character: Character, section: FormSection): SectionSheet {
  const level = heritorLevelOf(character.classes);
  const values = basicValues(section.column, level);
  const infusions = character.infusions.map((entry) => entry.name);
  const bonuses = infusionBonuses(infusions);
  const state = character.form?.parts[section.id] ?? null;
  const manual = state?.bonus ?? NO_BONUS;
  const weapon = section.weapon ? INNATE_WEAPONS[section.weapon][innateRank(infusions)] : null;
  if (section.main) {
    const max = maxOf(character);
    return { section, maxHp: max.hp, maxMp: max.mp, defense: section.defenseFromTable ? values.defense : null, accuracy: null, evasion: null, extraDamage: null, weapon, state: null };
  }
  const dex = abilityModifier(abilityTotal(character.abilities.DEX));
  const agi = abilityModifier(abilityTotal(character.abilities.AGI));
  const str = abilityModifier(abilityTotal(character.abilities.STR));
  // Without Heritor levels these checks are straight rolls: no Standard Value at all.
  const standard = (modifier: number) => (level > 0 ? level + modifier : 0) + bonuses.checks;
  return {
    section,
    maxHp: values.hp + bonuses.hp + manual.hp,
    maxMp: values.mp + manual.mp,
    defense: values.defense + bonuses.defense + manual.defense,
    accuracy: standard(dex),
    evasion: standard(agi),
    extraDamage: level > 0 ? level + str : 0,
    weapon,
    state,
  };
}

/**
 * The Scissorscorpion's Main Section may roll Evasion on "Heritor class level + AGI modifier" (Scorpion Body Art, p. 40);
 * null without Heritor levels, where it keeps its Warrior class or rolls straight.
 */
export function scorpionBodyArtEvasion(character: Character): number | null {
  const level = heritorLevelOf(character.classes);
  return level > 0 ? level + abilityModifier(abilityTotal(character.abilities.AGI)) : null;
}

const fresh = (sheet: SectionSheet, previous: FormPartState | undefined): FormPartState => {
  const bonus = previous?.bonus ?? NO_BONUS;
  // A section that was knocked out or disabled stays so across a new transformation (p. 55).
  if (previous && previous.status !== 'ok') return previous;
  return { hp: sheet.maxHp, mp: sheet.maxMp, status: 'ok', bonus };
};

/**
 * The shapeshift (pp. 12, 16, 20, 53-55): every other section stands at its maximum, and the Main Section is
 * restored to full too — "no matter how much HP and MP are reduced in the human form". Sections that were out
 * cold or disabled before stay as they were.
 */
export function enterForm(character: Character): Character {
  const form = formOf(character.raceId);
  if (!form || form.always || character.form?.transformed) return character;
  const parts: Record<string, FormPartState> = {};
  for (const section of form.sections.filter((entry) => !entry.main)) {
    // the bonus is read through the previous state, so the maxima count it
    parts[section.id] = fresh(sectionSheet(character, section), character.form?.parts[section.id]);
  }
  const max = maxOf(character);
  return { ...character, hp: { current: max.hp }, mp: { current: max.mp }, form: { transformed: true, parts } };
}

/** Back to the original form: the Main Section keeps its HP and MP, the other sections are let go (their knocked-out state is remembered). */
export function leaveForm(character: Character): Character {
  const form = formOf(character.raceId);
  if (!form || form.always || !character.form?.transformed) return character;
  const parts = Object.fromEntries(Object.entries(character.form.parts).filter(([, part]) => part.status !== 'ok'));
  return { ...character, form: { transformed: false, parts } };
}

function setPart(character: Character, id: string, change: (part: FormPartState) => FormPartState): Character {
  const part = character.form?.parts[id];
  if (!part) return character;
  const form: FormState = { transformed: character.form?.transformed ?? false, parts: { ...character.form?.parts, [id]: change(part) } };
  return { ...character, form };
}

/** A section of a Scissorscorpion has no transformation to start from: its state is made on first use, at the maxima. */
export function ensureParts(character: Character): Character {
  const form = formOf(character.raceId);
  if (!form || !form.always) return character;
  const parts: Record<string, FormPartState> = { ...character.form?.parts };
  let changed = false;
  for (const section of form.sections.filter((entry) => !entry.main)) {
    if (parts[section.id]) continue;
    const sheet = sectionSheet(character, section);
    parts[section.id] = { hp: sheet.maxHp, mp: sheet.maxMp, status: 'ok', bonus: NO_BONUS };
    changed = true;
  }
  return changed ? { ...character, form: { transformed: character.form?.transformed ?? false, parts } } : character;
}

/** Damage to an other section: physical damage is reduced by its Defense, magic is not; HP may go below 0, which asks for a Death Check. */
export function hurtPart(character: Character, id: string, amount: number, physical: boolean): Character {
  const form = formOf(character.raceId);
  const section = form?.sections.find((entry) => entry.id === id);
  if (!section || section.main) return character;
  const defense = physical ? (sectionSheet(character, section).defense ?? 0) : 0;
  const dealt = Math.max(0, amount - defense);
  return setPart(character, id, (part) => ({ ...part, hp: part.hp - dealt }));
}

export function healPart(character: Character, id: string, amount: number): Character {
  const form = formOf(character.raceId);
  const section = form?.sections.find((entry) => entry.id === id);
  if (!section || section.main) return character;
  const max = sectionSheet(character, section).maxHp;
  return setPart(character, id, (part) => (part.status === 'disabled' ? part : { ...part, hp: Math.min(max, part.hp + Math.max(0, amount)) }));
}

export function setPartMp(character: Character, id: string, mp: number): Character {
  const form = formOf(character.raceId);
  const section = form?.sections.find((entry) => entry.id === id);
  if (!section || section.main) return character;
  const max = sectionSheet(character, section).maxMp;
  return setPart(character, id, (part) => ({ ...part, mp: Math.max(0, Math.min(max, Math.floor(mp))) }));
}

export function setPartBonus(character: Character, id: string, bonus: Partial<FormPartState['bonus']>): Character {
  return setPart(character, id, (part) => ({ ...part, bonus: { ...part.bonus, ...bonus } }));
}

/** An other section at 0 HP or less makes a Death Check on the Main Section's Fortitude (p. 55): success leaves it unconscious, failure disables it for good. */
export function deathCheckPart(character: Character, id: string, fixed: boolean, rng: Rng = Math.random): { character: Character; check: DeathCheckRoll } | null {
  const part = character.form?.parts[id];
  if (!part || part.hp > 0 || part.status !== 'ok') return null;
  const check = rollDeathCheck(characterFortitude(character), part.hp, fixed, rng);
  const next = setPart(character, id, (current) => {
    if (check.result === 'revived') return { ...current, hp: 1 };
    return { ...current, status: check.result === 'dead' ? 'disabled' : 'unconscious' };
  });
  return { character: next, check };
}

/** [Awaken]-style effects wake an unconscious section on 1 HP; a disabled one needs [Resurrection] or the like (p. 55). */
export function wakePart(character: Character, id: string): Character {
  return setPart(character, id, (part) => (part.status === 'unconscious' ? { ...part, status: 'ok', hp: 1 } : part));
}

/** Resurrection and the like give a disabled section back, at full strength (no soulscar for this, p. 55). */
export function restorePart(character: Character, id: string): Character {
  const form = formOf(character.raceId);
  const section = form?.sections.find((entry) => entry.id === id);
  if (!section) return character;
  const sheet = sectionSheet(character, section);
  return setPart(character, id, (part) => ({ ...part, status: 'ok', hp: sheet.maxHp, mp: sheet.maxMp }));
}

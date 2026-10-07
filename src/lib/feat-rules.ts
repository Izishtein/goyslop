import {
  BATTLE_DANCER_BONUS_FEATS,
  COMBAT_FEAT_PREREQUISITES,
  CREATION_COMBAT_FEATS,
  type FeatRequirement,
} from '../data/combat-feat-prerequisites';
import { getClass } from '../data/classes';
import { COMBAT_FEATS } from '../data/combat-feats';
import type { Character, CombatFeat } from '../types/character';
import { adventurerLevel } from './formulas/character-levels';
import { splitNumeral } from './feat-names';
import { classLevel } from './spellcasting';

/**
 * Whether a feat the character holds satisfies a feat named as a requirement. "Cover I" is
 * met by [Cover I] or any higher numeral (II replaces I on the sheet); a bare "Cover" by
 * either; a name ending in "/" is a family ("Metamagic/" — any [Metamagic/**]); and a
 * requirement like "Weapon Proficiency A" is met by the category-finished "Weapon
 * Proficiency A/Swords" the player typed in.
 */
export function holdsFeat(held: string, required: string): boolean {
  const have = held.trim().toLowerCase();
  const need = required.trim().toLowerCase();
  if (need.endsWith('/')) return have.startsWith(need);
  if (have === need || have.startsWith(`${need}/`)) return true;
  const a = splitNumeral(have);
  const b = splitNumeral(need);
  if (a.base !== b.base) return false;
  return b.rank === 0 || a.rank >= b.rank;
}

function meets(requirement: FeatRequirement, character: Pick<Character, 'classes'>, held: string[]): boolean {
  switch (requirement.kind) {
    case 'adventurerLevel':
      return adventurerLevel(character.classes) >= requirement.level;
    case 'classLevel':
      return requirement.classIds.some((id) => classLevel(character, id) >= requirement.level);
    case 'wizardClasses': {
      const qualifying = new Set(
        character.classes.filter((entry) => getClass(entry.classId)?.type === 'wizard' && entry.level >= requirement.level).map((e) => e.classId),
      );
      return qualifying.size >= requirement.count;
    }
    case 'feat':
      return held.some((name) => holdsFeat(name, requirement.name));
  }
}

/** The prerequisites of a feat the character does not meet; empty when it is fine, or when
 *  the catalog has no prerequisite data for it (hand-written feats, supplement feats). */
export function unmetRequirements(character: Pick<Character, 'classes' | 'combatFeats'>, feat: CombatFeat): FeatRequirement[] {
  const requirements = COMBAT_FEAT_PREREQUISITES[feat.name] ?? [];
  const held = character.combatFeats.filter((other) => other.id !== feat.id).map((other) => other.name);
  return requirements.filter((requirement) => !meets(requirement, character, held));
}

/**
 * At creation only the short list of CR I p. 77 is open. The sheet cannot tell "just
 * created" from "level 1 today", but a level-1 character has had no other chance to learn
 * anything, so the list is applied to Adventurer Level 1 — and widened by the Battle
 * Dancer's own bonus list when the class is held.
 */
export function outsideCreationList(character: Pick<Character, 'classes'>, feat: CombatFeat): boolean {
  if (feat.category === 'auto' || adventurerLevel(character.classes) !== 1) return false;
  const name = feat.name.trim().toLowerCase();
  // A name the catalog does not know (hand-written, another supplement) is not second-guessed.
  if (!COMBAT_FEATS.some((entry) => entry.name.toLowerCase() === name || name.startsWith(`${entry.name.toLowerCase()}/`))) return false;
  const allowed = classLevel(character, 'battle-dancer') > 0 ? [...CREATION_COMBAT_FEATS, ...BATTLE_DANCER_BONUS_FEATS] : CREATION_COMBAT_FEATS;
  return !allowed.some((entry) => name === entry.toLowerCase() || name.startsWith(`${entry.toLowerCase()}/`));
}

/** Feats that are not a "declaration" at all and so never use up the turn's allowance:
 *  "[Cover II] is not a declaration and doesn't count toward several active combat feats
 *  per turn" (Core II p. 199). */
const FREE_DECLARATIONS = ['cover ii'];

export function countsAsDeclaration(feat: CombatFeat): boolean {
  return feat.category === 'declaration' && !FREE_DECLARATIONS.includes(feat.name.trim().toLowerCase());
}

/**
 * How many active feats may be declared in one turn: one, "even if you have acquired
 * multiple active combat feats" (CR I p. 182), raised to two by [Ever-Changing I] and three
 * by [Ever-Changing II].
 */
export function declarationLimit(feats: CombatFeat[]): number {
  if (feats.some((feat) => holdsFeat(feat.name, 'Ever-Changing II'))) return 3;
  if (feats.some((feat) => holdsFeat(feat.name, 'Ever-Changing I'))) return 2;
  return 1;
}

/** Major Action feats take the turn's one Major Action, so only one can be used a turn
 *  (CR I p. 182) — and then no weapon attack or Major Action spell can be made. */
export const MAJOR_ACTION_LIMIT = 1;

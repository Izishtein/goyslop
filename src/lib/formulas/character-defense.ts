import { getClass } from '../../data/classes';
import type { Character } from '../../types/character';
import { abilityModifier, abilityTotal } from './abilities';
import { evasion as baseEvasion } from './derived-stats';
import { sumModifiersForField } from './status-effects';
import { totalDefense, totalEvasion } from './weapon-stats';

/** The highest level among a character's Warrior-type classes. */
export function primaryWarriorLevel(character: Pick<Character, 'classes'>): number {
  return character.classes
    .filter((classLevel) => getClass(classLevel.classId)?.type === 'warrior')
    .reduce((max, classLevel) => Math.max(max, classLevel.level), 0);
}

/** Total Defense: armor and shield plus status effects — what is subtracted from physical damage. */
export function characterDefense(character: Pick<Character, 'equipment' | 'statusEffects'>): number {
  return (
    totalDefense(character.equipment.armor.map((piece) => piece.defense), character.equipment.shield?.defenseBonus ?? 0) +
    sumModifiersForField(character.statusEffects, 'defense')
  );
}

/** Total Evasion: Warrior Level + AGI modifier, then armor, shield and status effects — the
 *  Standard Value an Evasion check rolls on top of. */
export function characterEvasion(character: Pick<Character, 'classes' | 'abilities' | 'equipment' | 'statusEffects'>): number {
  const agiMod = abilityModifier(abilityTotal(character.abilities.AGI));
  return (
    totalEvasion(
      baseEvasion(primaryWarriorLevel(character), agiMod),
      character.equipment.armor.map((piece) => piece.evasionModifier),
      character.equipment.shield?.evasionBonus ?? 0,
    ) + sumModifiersForField(character.statusEffects, 'evasion')
  );
}

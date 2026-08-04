import { isWizardType } from '../../data/classes';
import type { ClassLevel } from '../../types/character';

/** Adventurer Level = highest level among all of a character's classes. */
export function adventurerLevel(classes: ClassLevel[]): number {
  return classes.reduce((max, classLevel) => Math.max(max, classLevel.level), 0);
}

/** Sum of levels across all Wizard-type classes, used for MP max. */
export function wizardLevelSum(classes: ClassLevel[]): number {
  return classes.filter((classLevel) => isWizardType(classLevel.classId)).reduce((sum, classLevel) => sum + classLevel.level, 0);
}

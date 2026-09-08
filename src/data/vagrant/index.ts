export type { AdolescentExperienceRow, AdolescentExperienceTable } from './adolescent';
export { ADOLESCENT_EXPERIENCE_TABLES } from './adolescent';
export type { ChildhoodExperienceRow, ChildhoodExperienceTable, VagrantCategory } from './childhood';
export { CHILDHOOD_EXPERIENCE_TABLES, getChildhoodExperienceTable } from './childhood';
export type { VagrantSelectableRace, VagrantType } from './types';
export { VAGRANT_TYPES, getVagrantType, listVagrantTypesByCategory } from './types';

import { CHILDHOOD_EXPERIENCE_TABLES, type VagrantCategory } from './childhood';

export const VAGRANT_CATEGORIES: VagrantCategory[] = ['warrior', 'spy', 'remoteSupport', 'magicWarrior'];

/** Which races have at least one Childhood Experience table — not every race gets all 4 categories, some (e.g. Tabbit) get exactly one. */
export function listVagrantRaceIds(): string[] {
  const ids = new Set(CHILDHOOD_EXPERIENCE_TABLES.map((t) => t.raceId));
  return Array.from(ids);
}

export function listCategoriesForRace(raceId: string): VagrantCategory[] {
  return CHILDHOOD_EXPERIENCE_TABLES.filter((t) => t.raceId === raceId).map((t) => t.category);
}

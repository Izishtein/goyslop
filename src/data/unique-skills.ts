/**
 * Unique skills of the Barbarous races — Barbarous Rage "List of Unique Skills" (pp. 65-68), and the rules of
 * pp. 72-73 about them. A unique skill is an ability a race has instead of a spell: it names a Standard Value, a
 * resistance, a cost, and per rank what it does. The Success Value is 2d6 + the Standard Value, set against the
 * target's Resistance Standard Value where the skill allows resistance.
 *
 * Names and numbers are the book's; the text of each rank (`reference.uniqueSkill.<id>.<rank>`, English and Russian)
 * is a short statement of range, power and effect — the book's wording is not copied. How the skills are acquired:
 * a Diablo's by the Infusion of the same name (Heritor, pp. 58-62), a Drake's Breath of Light from the start (the
 * Infusions Shining Light Breath and Radiant Breath strengthen it), a Basilisk's Evil Eye of Petrification at rank B
 * from creation and the others through Infusions, an Arbor's Fire Weapon or Fire Shield at creation, a
 * Scissorscorpion's Poisonous Tail from the start.
 */
export const UNIQUE_SKILL_RACES = ['diablo', 'drake', 'basilisk', 'arbor', 'scissorscorpion'] as const;
export type UniqueSkillRace = (typeof UNIQUE_SKILL_RACES)[number];

/** A rank of a skill: B/A/S/SS where the book prints four, `any` where it prints none. */
export const UNIQUE_SKILL_RANKS = ['any', 'B', 'A', 'S', 'SS'] as const;
export type UniqueSkillRank = (typeof UNIQUE_SKILL_RANKS)[number];

/** The "Res." box of the skill: how a target's resistance check treats it. `none` is the "-" of a skill with nothing to resist. */
export type UniqueSkillResistance = 'neg' | 'half' | 'temporary' | 'optional' | 'cant' | 'none';

/** What the Success Value is built from: a class level (Heritor or Adventurer) plus an ability modifier; `none` where the book prints "-". */
export interface StandardValueBasis {
  level: 'heritor' | 'adventurer';
  ability: 'INT' | 'VIT' | 'SPR';
}

/** What using a skill costs: MP (and HP, once, for Chain of Curses), once or for each target. */
export interface UniqueSkillCost {
  mp: number;
  hp?: number;
  perTarget?: boolean;
}

export interface UniqueSkillRankEntry {
  rank: UniqueSkillRank;
  /** What using it costs; null where the rank prints none of its own. */
  cost: UniqueSkillCost | null;
}

export interface UniqueSkillDefinition {
  id: string;
  name: string;
  race: UniqueSkillRace;
  standard: StandardValueBasis | null;
  resistance: UniqueSkillResistance;
  /** The save the target rolls against the Success Value. */
  resistSave: 'Fortitude' | 'Willpower' | null;
  ranks: UniqueSkillRankEntry[];
  sourceBook: string;
}

const BOOK = 'Barbarous Rage';

export const slugOf = (name: string): string => name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

function skill(
  name: string,
  race: UniqueSkillRace,
  standard: StandardValueBasis | null,
  resistance: UniqueSkillResistance,
  resistSave: UniqueSkillDefinition['resistSave'],
  ranks: UniqueSkillRankEntry[],
): UniqueSkillDefinition {
  return { id: slugOf(name), name, race, standard, resistance, resistSave, ranks, sourceBook: BOOK };
}

const mp = (points: number, extra: Omit<UniqueSkillCost, 'mp'> = {}): UniqueSkillCost => ({ mp: points, ...extra });
const single = (cost: UniqueSkillCost | null): UniqueSkillRankEntry[] => [{ rank: 'any', cost }];
/** Four ranks with the costs the book prints for each (MP only, null where a rank prints none of its own). */
const ranked = (b: number | null, a: number | null, s: number | null, ss: number | null): UniqueSkillRankEntry[] => [
  { rank: 'B', cost: b === null ? null : mp(b) },
  { rank: 'A', cost: a === null ? null : mp(a) },
  { rank: 'S', cost: s === null ? null : mp(s) },
  { rank: 'SS', cost: ss === null ? null : mp(ss) },
];

const heritor = (ability: StandardValueBasis['ability']): StandardValueBasis => ({ level: 'heritor', ability });
const adventurer = (ability: StandardValueBasis['ability']): StandardValueBasis => ({ level: 'adventurer', ability });
const EYE = adventurer('SPR');

export const UNIQUE_SKILLS: UniqueSkillDefinition[] = [
  // Diablo — p. 65: pieces of Summoning Arts turned into unique skills; one rank each.
  skill('Daemonic Roar', 'diablo', heritor('SPR'), 'temporary', 'Willpower', single(mp(6))),
  skill('Raw Deal', 'diablo', null, 'cant', null, single(mp(4))),
  skill('Daemonic Eyes', 'diablo', null, 'cant', null, single(mp(2, { perTarget: true }))),
  skill('Soul Absorption', 'diablo', heritor('INT'), 'half', 'Willpower', single(mp(20, { perTarget: true }))),
  skill('Chain of Curses', 'diablo', heritor('INT'), 'half', 'Willpower', single(mp(4, { hp: 5, perTarget: true }))),
  skill('Erosive Poisonous Breath', 'diablo', heritor('VIT'), 'half', 'Fortitude', single(mp(8))),

  // Drake — p. 65.
  skill('Breath of Light', 'drake', adventurer('VIT'), 'half', 'Fortitude', single(null)),

  // Basilisk — pp. 66-68: every one an "Evil Eye", four ranks each; a lower rank may always be used instead.
  skill('Evil Eye of Petrification', 'basilisk', EYE, 'neg', 'Willpower', ranked(5, null, null, 10)),
  skill('Evil Eye of Destruction', 'basilisk', EYE, 'half', 'Willpower', ranked(4, 8, 12, 20)),
  skill('Evil Eye of Unlocking', 'basilisk', EYE, 'neg', 'Willpower', ranked(4, 8, 24, 32)),
  skill('Evil Eye of Revitalization', 'basilisk', EYE, 'neg', 'Willpower', ranked(3, 6, 12, 36)),
  skill('Evil Eye of Exaltation', 'basilisk', EYE, 'optional', null, ranked(6, null, null, 18)),
  skill('Evil Eye of Dissipation', 'basilisk', EYE, 'neg', 'Willpower', ranked(6, 9, 18, null)),
  skill('Evil Eye of Revivification', 'basilisk', EYE, 'optional', 'Willpower', ranked(3, 6, 12, 24)),
  skill('All-Seeing Evil Eye', 'basilisk', null, 'none', null, ranked(0, null, 5, null)),
  skill('Evil Eye of Manipulation', 'basilisk', EYE, 'neg', 'Willpower', ranked(4, 8, null, 32)),
  skill('Evil Eye of Stagnation', 'basilisk', EYE, 'neg', 'Willpower', ranked(6, null, null, 12)),
  skill('Evil Eye of the Soul Transfer', 'basilisk', EYE, 'neg', 'Willpower', ranked(8, 12, 24, 36)),

  // Arbor — p. 68: one of the two is chosen at creation ([Flame of Anger]).
  skill('Fire Weapon', 'arbor', adventurer('INT'), 'optional', null, single(mp(8))),
  skill('Fire Shield', 'arbor', adventurer('INT'), 'optional', null, single(mp(8))),

  // Scissorscorpion — p. 68: rides on the Scorpion Tail innate weapon.
  skill('Poisonous Tail', 'scissorscorpion', heritor('VIT'), 'neg', 'Fortitude', single(null)),
];

export function getUniqueSkill(id: string): UniqueSkillDefinition | undefined {
  return UNIQUE_SKILLS.find((entry) => entry.id === id);
}

export const uniqueSkillsOf = (race: UniqueSkillRace): UniqueSkillDefinition[] => UNIQUE_SKILLS.filter((entry) => entry.race === race);

export const isUniqueSkillRace = (raceId: string): raceId is UniqueSkillRace => (UNIQUE_SKILL_RACES as readonly string[]).includes(raceId);

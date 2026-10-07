/** A Standard Value with the Fixed Value the book prints beside it: "3 (10)". */
export interface ValuePair {
  value: number;
  fixed: number | null;
}

/** A value the book gives as a template mark ("※+2" — the monster is built on another's data). */
export interface TemplateValue {
  raw: string;
}

export type MonsterValue = ValuePair | TemplateValue | null;

/** One body section of a monster: a single-section monster has one row, a Drake in Dragon
 *  Form has Body and two Wings. HP and MP are tracked per section. */
export interface MonsterSection {
  style: string;
  accuracy: MonsterValue;
  /** "2d+12" — the monster's physical damage, rolled as it is; monsters never roll criticals. */
  damage: string | null;
  evasion: MonsterValue;
  defense: number | string | null;
  hp: number | string | null;
  mp: number | string | null;
}

/** An entry under "Unique Skills". `icons` are the action symbols the book prints (◯ passive,
 *  ► major action, 🗨 declaration, ⏩ minor action); `section` names the body section on a
 *  multi-section monster. */
export interface MonsterSkill {
  section?: string;
  icons: string;
  name: string;
  text: string[];
}

export interface MonsterLoot {
  /** "Always", "2–7", "11+" — the 2d result that yields the item. */
  roll: string;
  item: string;
}

export interface Monster {
  id: string;
  name: string;
  level: number;
  /** Variable-level monsters (Revenant, Magireplica) print "1+". */
  levelPlus?: true;
  /** First appearance: "CR I p. 397", "New", "KF" … */
  source: string;
  category: string;
  /** Printed page in Monstrous Lore. */
  page: number;
  intelligence: string;
  perception: string;
  disposition: string;
  soulscars?: string;
  language: string;
  habitat: string;
  /** Monster Knowledge target number for knowing what it is. */
  reputation: number | null;
  reputationNote?: string;
  /** Monster Knowledge target number for knowing its Weak Point. */
  weakness: number | null;
  weakPoint: string;
  initiative: string;
  movement: string;
  fortitude: MonsterValue;
  willpower: MonsterValue;
  sections: MonsterSection[];
  sectionsNote?: string;
  mainSection?: string;
  skills: MonsterSkill[];
  loot: MonsterLoot[];
  description: string[];
}

export const MONSTER_CATEGORIES = [
  'Barbarous',
  'Animals',
  'Plants',
  'Undead',
  'Constructs',
  'Magitech',
  'Mythical Beasts',
  'Fairies',
  'Daemons',
  'Humanoids',
] as const;

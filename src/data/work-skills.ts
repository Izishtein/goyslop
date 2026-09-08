/**
 * Work Skills — the § 3 optional system (Epic Treasury pp. 65-68, Raxia Life pp. 47-108),
 * transcribed in docs/sheet-content/19-work-skills.md.
 *
 * Non-adventuring professions, levels 1-15, used for out-of-combat checks the same way a
 * class is. Like the spell and arts catalogs, this carries the index only — name, the
 * profession it represents, and where in Raxia Life to read its full write-up — never the
 * per-skill check list or level bonuses, which run to a page or more of prose per skill and
 * do not feed anything the sheet calculates. A known work skill's own note field is where a
 * player writes what it does, if they want that written down at all.
 */

export const WORK_SKILL_CATEGORIES = ['towns', 'craftsmen', 'knowledge', 'military', 'countryside', 'rivers'] as const;
export type WorkSkillCategory = (typeof WORK_SKILL_CATEGORIES)[number];

export interface WorkSkillDefinition {
  id: string;
  name: string;
  /** The occupation title the book pairs with the skill name, e.g. "Armor Craftsman". */
  profession: string;
  category: WorkSkillCategory;
  /** Raxia Life page where the full write-up (checks, bonuses) starts. */
  page: number;
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function skill(name: string, profession: string, category: WorkSkillCategory, page: number): WorkSkillDefinition {
  return { id: slug(name), name, profession, category, page };
}

/** Raxia Life p. 51, "Work Skill List & Random Decision Table" — row by row, left to right. */
export const WORK_SKILLS: WorkSkillDefinition[] = [
  skill('Armorer Skill', 'Armor Craftsman', 'craftsmen', 69),
  skill('Inventor Skill', 'Tinkerer', 'knowledge', 79),
  skill('Weaver Skill', 'Weaver', 'craftsmen', 69),
  skill('Witch Doctor Skill', 'Medicine Man', 'towns', 53),
  skill('Waiter/Waitress Skill', 'Table Service', 'towns', 53),
  skill('Weatherman Skill', 'Meteorologist', 'rivers', 106),
  skill('Weaponsmith Skill', 'Weapon Craftsman', 'craftsmen', 70),
  skill('Woodworker Skill', 'Wood Craftsman', 'craftsmen', 71),
  skill('Explorer Skill', 'Explorer', 'countryside', 100),

  skill('Engineer Skill', 'Engineer', 'knowledge', 79),
  skill('Enchanter Skill', 'Enchanter', 'knowledge', 80),
  skill('Author Skill', 'Writer', 'knowledge', 81),
  skill('Official Skill', 'Government Official', 'military', 94),
  skill('Orator Skill', 'Orator', 'military', 94),
  skill('Gardener Skill', 'Groundskeeper', 'towns', 54),
  skill('Cartographer Skill', 'Cartographer', 'knowledge', 82),
  skill('Carpenter Skill', 'Woodworker', 'towns', 55),
  skill('Color Man Skill', 'Dyer', 'craftsmen', 71),

  skill('Locksmith Skill', 'Locksmith', 'craftsmen', 72),
  skill('Gangster Skill', 'Gangster', 'towns', 56),
  skill('Gambler Skill', 'Gambler', 'towns', 56),
  skill('Gravekeeper Skill', 'Gravekeeper', 'towns', 58),
  skill('Cleric Skill', 'Cleric', 'military', 95),
  skill('Carriage Driver Skill', 'Coachman', 'towns', 58),
  skill('Courtesan Skill', 'Escort', 'military', 96),
  skill('Cook Skill', 'Chef', 'towns', 59),
  skill('Composer Skill', 'Composer', 'knowledge', 82),

  skill('Surgeon Skill', 'Surgeon', 'knowledge', 83),
  skill('Signalman Skill', 'Signalman', 'countryside', 100),
  skill('Cobbler Skill', 'Shoemaker', 'craftsmen', 73),
  skill('Whitesmith Skill', 'Jeweler', 'craftsmen', 74),
  skill('Singer Skill', 'Vocalist', 'knowledge', 84),
  skill('Scholar Skill', 'Student/Scholar', 'knowledge', 84),
  skill('Sculptor Skill', 'Sculptor', 'knowledge', 85),
  skill('Scribe Skill', 'Scrivener', 'knowledge', 85),
  skill('Storyteller Skill', 'Storyteller', 'knowledge', 86),

  skill('Sailor Skill', 'Sailor', 'rivers', 106),
  skill('Soldier Skill', 'Soldier', 'military', 96),
  skill('Towerman Skill', 'High-Rise Laborer', 'towns', 60),
  skill('Dancer Skill', 'Dancer', 'knowledge', 87),
  skill('Tour Guide Skill', 'Tour Guide', 'countryside', 101),
  skill('Distiller Skill', 'Distiller', 'craftsmen', 74),
  skill('Detective Skill', 'Detective', 'towns', 60),
  skill('Tamer Skill', 'Animal Trainer', 'countryside', 101),
  skill('Tailor Skill', 'Dressmaker', 'towns', 61),

  skill('Doctor Skill', 'Doctor', 'knowledge', 87),
  skill('Apothecary Skill', 'Pharmacist', 'knowledge', 88),
  skill('Nurse Skill', 'Nurse', 'military', 97),
  skill('Navigator Skill', 'Navigator', 'rivers', 107),
  skill('Noble Skill', 'Aristocrat', 'military', 98),
  skill('Shepherd Skill', 'Shepherd', 'countryside', 102),
  skill('Barber Skill', 'Hairdresser/Barber', 'towns', 62),
  skill('Housekeeper Skill', 'Housekeeper', 'towns', 62),
  skill('Butler Skill', 'Steward', 'military', 98),

  skill('Hunter Skill', 'Hunter', 'countryside', 103),
  skill('Perfumer Skill', 'Perfumer', 'knowledge', 89),
  skill('Performer Skill', 'Entertainer', 'towns', 63),
  skill('Farmer Skill', 'Farmhand', 'countryside', 104),
  skill('Fisherman Skill', 'Fisherman', 'rivers', 108),
  skill('Fortune Teller Skill', 'Psychic', 'towns', 63),
  skill('Blacksmith Skill', 'Smith', 'craftsmen', 75),
  skill('Brewer Skill', 'Brewer', 'craftsmen', 75),
  skill('Prestidigitator Skill', 'Magician', 'knowledge', 89),

  skill('Prostitute Skill', 'Harlot/Gigolo', 'towns', 64),
  skill('Painter Skill', 'Artist', 'knowledge', 90),
  skill('Beggar Skill', 'Tramp', 'towns', 65),
  skill('Heraldist Skill', 'Heraldic Scholar', 'knowledge', 91),
  skill('Bone Carver Skill', 'Bone Craftsman', 'craftsmen', 76),
  skill('Merchant Skill', 'Merchant', 'towns', 65),
  skill('Miner Skill', 'Miner', 'countryside', 104),
  skill('Manager Skill', 'Manager', 'towns', 66),
  skill('Butcher Skill', 'Butcher', 'towns', 66),

  skill('Midwife Skill', 'Midwife', 'towns', 67),
  skill('Musician Skill', 'Musician', 'knowledge', 91),
  skill('Mason Skill', 'Stonemason', 'craftsmen', 77),
  skill('Librarian Skill', 'Librarian', 'knowledge', 92),
  skill('Lumberjack Skill', 'Logger', 'countryside', 105),
  skill('Restorer Skill', 'Restorer', 'knowledge', 92),
  skill('Linguist Skill', 'Interpreter', 'knowledge', 93),
  skill('Teamster Skill', 'Manual Laborer', 'towns', 68),
  skill('Leatherworker Skill', 'Leather Craftsman', 'craftsmen', 78),
];

export function listWorkSkillsByCategory(category: WorkSkillCategory): WorkSkillDefinition[] {
  return WORK_SKILLS.filter((entry) => entry.category === category).sort((a, b) => a.name.localeCompare(b.name));
}

export function getWorkSkill(id: string): WorkSkillDefinition | undefined {
  return WORK_SKILLS.find((entry) => entry.id === id);
}

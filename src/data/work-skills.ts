/**
 * Work Skills — the § 3 optional system (Epic Treasury pp. 65-68, Raxia Life pp. 47-108),
 * transcribed in docs/sheet-content/19-work-skills.md.
 *
 * Non-adventuring professions, levels 1-15, used for out-of-combat checks the same way a
 * class is. `checks` records each skill's own "[Name] check [Ability]" list as printed —
 * either a `reference` to an existing Core Rulebook check, or a `timeRequired` for one unique
 * to this Work Skill (that check's Description text lives in `reference.workSkillCheckEffect`
 * in the locale files, per § 5.1 — see roadmap.md). None of this feeds anything the sheet
 * calculates. A known work skill's own note field is where a player writes what a check does
 * for their character, if they want that written down at all.
 */

export const WORK_SKILL_CATEGORIES = ['towns', 'craftsmen', 'knowledge', 'military', 'countryside', 'rivers'] as const;
export type WorkSkillCategory = (typeof WORK_SKILL_CATEGORIES)[number];

export interface WorkSkillCheck {
  id: string;
  /** As printed, e.g. "Prayer Judgment check" or "First Aid check". */
  name: string;
  /** The ability modifier the check uses, e.g. "Intelligence". */
  ability: string;
  /**
   * Set when this entry merely points at a check defined elsewhere (almost always an existing
   * Core Rulebook skill check, e.g. "First Aid check (see CR I, p. 102)") rather than a new
   * check this Work Skill introduces — mutually exclusive with `timeRequired`.
   */
  reference?: string;
  /**
   * Set when this check is unique to the Work Skill and the book gives it its own "Time
   * Required" + "Description" — mutually exclusive with `reference`. The Description text
   * itself lives in `reference.workSkillCheckEffect.<skillId>.<checkId>` in the locale files,
   * the same place as every other effect-text catalog in this project.
   */
  timeRequired?: string;
}

export interface WorkSkillDefinition {
  id: string;
  name: string;
  /** The occupation title the book pairs with the skill name, e.g. "Armor Craftsman". */
  profession: string;
  category: WorkSkillCategory;
  /** Raxia Life page where the full write-up (checks, bonuses) starts. */
  page: number;
  /** As printed under the skill's own "[Name] check" list heading, book order. */
  checks: WorkSkillCheck[];
}

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function check(name: string, ability: string, options: { reference?: string; timeRequired?: string }): WorkSkillCheck {
  return { id: slug(name), name, ability, reference: options.reference, timeRequired: options.timeRequired };
}

function skill(
  name: string,
  profession: string,
  category: WorkSkillCategory,
  page: number,
  checks: WorkSkillCheck[] = [],
): WorkSkillDefinition {
  return { id: slug(name), name, profession, category, page, checks };
}

/** Raxia Life p. 51, "Work Skill List & Random Decision Table" — row by row, left to right. */
export const WORK_SKILLS: WorkSkillDefinition[] = [
  skill('Armorer Skill', 'Armor Craftsman', 'craftsmen', 69, [
    check('Armor Enhancement check', 'DEX', { timeRequired: '1 day - 1 week' }),
    check('Armor Crafting check', 'DEX', { timeRequired: '1 day - 1 year' }),
    check('Mineral Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Leather Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Appraise check (Armor only)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Inventor Skill', 'Tinkerer', 'knowledge', 79, [
    check('Herbology check', 'INT', { reference: 'CR I, p. 108' }),
    check('Tinkering check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
    check('Inspiration check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
  ]),
  skill('Weaver Skill', 'Weaver', 'craftsmen', 69, [
    check('Disguise check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Weaving check', 'DEX', { timeRequired: '1 day - 3 months' }),
    check('Fabric Appraisal check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Witch Doctor Skill', 'Medicine Man', 'towns', 53, [
    check('First Aid check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Prayer Judgment check', 'INT', { timeRequired: '1 hour' }),
    check('Folk Medicine check', 'INT', { timeRequired: '3-8 hours' }),
  ]),
  skill('Waiter/Waitress Skill', 'Table Service', 'towns', 53, [
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Table Service check', 'INT', { timeRequired: '3-8 hours' }),
    check('Rumor Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Weatherman Skill', 'Meteorologist', 'rivers', 106, [
    check('Meteorology check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
    check('Notice check (weather-specific)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Weaponsmith Skill', 'Weapon Craftsman', 'craftsmen', 70, [
    check('Weapon Enhancement check', 'DEX', { timeRequired: '1 day - 1 week' }),
    check('Weapon Crafting check', 'DEX', { timeRequired: '1 day - 1 year' }),
    check('Mineral Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Appraise check (Weapons only)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Woodworker Skill', 'Wood Craftsman', 'craftsmen', 71, [
    check('Woodworking check', 'DEX', { timeRequired: '1 hour - 1 year' }),
    check('Wood Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Appraise check (limited to woodworking products)', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Explorer Skill', 'Explorer', 'countryside', 100, [
    check('Conceal check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Tumble check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Hide check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Acrobatics check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Jump check', 'AGI', { reference: 'CR I, p. 112' }),
    check('Climb check', 'AGI, STR', { reference: 'CR I, p. 104' }),
    check('Track check', 'INT', { reference: 'CR I, p. 106' }),
    check('Search check', 'INT', { reference: 'CR I, p. 108' }),
    check('Cartography check', 'INT', { reference: 'CR I, p. 107' }),
    check('Swim check', 'AGI', { reference: 'CR II, p. 74' }),
    check('Monster Detection check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),

  skill('Engineer Skill', 'Engineer', 'knowledge', 79, [
    check('Magitech Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Driving check', 'DEX', { timeRequired: '1 minute (6 rounds)' }),
    check('Maintenance check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Enchanter Skill', 'Enchanter', 'knowledge', 80, [
    check('Appraise check', 'INT', { reference: 'CR I, p. 108' }),
    check('Magic Imbuing check', 'INT', { timeRequired: '1 day - 1 month' }),
  ]),
  skill('Author Skill', 'Writer', 'knowledge', 81, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Writing check', 'INT', { timeRequired: '1 week - 1 year' }),
    check('Creation check', 'INT', { timeRequired: '10 seconds (1 round)' }),
  ]),
  skill('Official Skill', 'Government Official', 'military', 94, [
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Administrative check', 'INT', { timeRequired: '1 hour - 1 month' }),
    check('Local Knowledge check', 'INT', { timeRequired: 'Instant - 10 minutes (60 rounds)' }),
  ]),
  skill('Orator Skill', 'Orator', 'military', 94, [
    check('Speech check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
    check('Debate check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
  ]),
  skill('Gardener Skill', 'Groundskeeper', 'towns', 54, [
    check('Landscaping check', 'INT', { timeRequired: 'Several days to several months' }),
    check('Monster Knowledge check (limited to Plants)', 'INT', { timeRequired: 'Instant' }),
    check('Herbology check (limited to plants)', 'INT', { timeRequired: '1 minute (6 rounds)' }),
  ]),
  skill('Cartographer Skill', 'Cartographer', 'knowledge', 82, [
    check('Cartography check', 'INT', { reference: 'CR I, p. 107' }),
    check('Map Drawing check', 'DEX', { timeRequired: '1 hour - 1 month' }),
    check('Distance Measurement check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Carpenter Skill', 'Woodworker', 'towns', 55, [
    check('Acrobatics check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Construction check (Wood)', 'DEX', { timeRequired: 'Several days to 1 year' }),
    check('Drafting check', 'INT', { timeRequired: '1 hour to 1 day' }),
    check('Wood Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Color Man Skill', 'Dyer', 'craftsmen', 71, [
    check('Herbology check', 'INT', { reference: 'CR I, p. 108' }),
    check('Paint-making check', 'DEX', { timeRequired: '1 hour - 6 hours' }),
    check('Insight check (limited to coloring agents)', 'INT', { timeRequired: 'Instant' }),
    check('Dyeing check', 'INT', { timeRequired: '6 hours' }),
  ]),

  skill('Locksmith Skill', 'Locksmith', 'craftsmen', 72, [
    check('Disable Device check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Device Crafting check', 'DEX', { timeRequired: 'Several days to 1 month' }),
  ]),
  skill('Gangster Skill', 'Gangster', 'towns', 56, [
    check('Detect check', 'INT', { reference: 'CR I, p. 111' }),
    check('Appraise check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Herbology check', 'INT', { reference: 'CR I, p. 108' }),
    check('Monster Knowledge check (limited to Humanoids)', 'INT', { timeRequired: 'Instant' }),
    check('Intimidation check', 'SPR', { timeRequired: '10 seconds (1 round)' }),
  ]),
  skill('Gambler Skill', 'Gambler', 'towns', 56, [
    check('Pickpocket check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Notice check', 'INT', { reference: 'CR I, p. 196' }),
    check('Expression Manipulation check', 'DEX', { timeRequired: 'Instant' }),
    check('Sleight of Hand check', 'DEX', { timeRequired: 'Instant' }),
    check('Gambling Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Gravekeeper Skill', 'Gravekeeper', 'towns', 58, [
    check('Gravedigger check', 'STR', { timeRequired: '1 hour' }),
    check('Gravekeeper Funeral check', 'INT', { timeRequired: '8 hours-3 days' }),
    check('Monster Knowledge check (limited to Undead)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Cleric Skill', 'Cleric', 'military', 95, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Detect check', 'INT', { reference: 'CR I, p. 111' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Mythological Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Religious Knowledge check', 'INT', { timeRequired: '10 seconds (1 round)' }),
    check('Storytelling check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Carriage Driver Skill', 'Coachman', 'towns', 58, [
    check('Cartography check', 'INT', { reference: 'CR I, p. 107' }),
    check('Carriage Operation check', 'DEX', { timeRequired: '4 hours - 12 hours' }),
    check('Monster Knowledge check (limited to Animals)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Courtesan Skill', 'Escort', 'military', 96, [
    check('Disguise check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Appraise check', 'INT', { reference: 'CR I, p. 108' }),
    check('Sexual Technique check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
    check('Social check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
    check('Etiquette check', 'INT', { timeRequired: 'Instant' }),
    check('Seduction check', 'SPR', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Cook Skill', 'Chef', 'towns', 59, [
    check('Cooking check', 'DEX', { timeRequired: '10 minutes - 1 day' }),
    check('Ingredient Appraisal check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Composer Skill', 'Composer', 'knowledge', 82, [
    check('Performance Knowledge check', 'INT', { timeRequired: 'Instant or 10 minutes (60 rounds) or 1 hour' }),
    check('Insight check', 'INT', { timeRequired: 'Instant' }),
    check('Composition check', 'INT', { timeRequired: '1 week - 1 year' }),
  ]),

  skill('Surgeon Skill', 'Surgeon', 'knowledge', 83, [
    check('First Aid check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Pathology check', 'INT', { reference: 'CR I, p. 107' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Herbology check', 'INT', { reference: 'CR I, p. 108' }),
    check('Surgery check', 'DEX', { timeRequired: '1 hour - 12 hours' }),
  ]),
  skill('Signalman Skill', 'Signalman', 'countryside', 100, [
    check('Acrobatics check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Flag Signals check', 'DEX, INT', { timeRequired: 'Instant' }),
  ]),
  skill('Cobbler Skill', 'Shoemaker', 'craftsmen', 73, [
    check('Track check', 'INT', { reference: 'CR I, p. 106' }),
    check('Shoe Crafting check', 'DEX', { timeRequired: '1 day - 1 week' }),
    check('Appraise check (limited to "accessory: feet")', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Whitesmith Skill', 'Jeweler', 'craftsmen', 74, [
    check('Appraise check', 'INT', { reference: 'CR I, p. 108' }),
    check('Jewelry Crafting check', 'DEX', { timeRequired: '1 day - 1 month' }),
    check('Mineral Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Singer Skill', 'Vocalist', 'knowledge', 84, [
    check('Listen check', 'INT', { reference: 'CR I, p. 106' }),
    check('Aural Memory check', 'INT', { timeRequired: '10 seconds (1 round) - 10 minutes (60 rounds)' }),
    check('Singing check', 'SPR', { timeRequired: '1 minute (6 rounds) - 10 minutes (60 rounds)' }),
  ]),
  skill('Scholar Skill', 'Student/Scholar', 'knowledge', 84, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Natural History check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Specialized Field check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Sculptor Skill', 'Sculptor', 'knowledge', 85, [
    check('Climb check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Sculpture Creation check', 'DEX', { timeRequired: '1 day - 1 year' }),
    check('Appraise check (value limited)', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Scribe Skill', 'Scrivener', 'knowledge', 85, [
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Ghostwriting check', 'INT', { timeRequired: '6 hours - 1 week' }),
    check('Transcription check', 'INT', { timeRequired: '6 hours - 6 months' }),
  ]),
  skill('Storyteller Skill', 'Storyteller', 'knowledge', 86, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Storytelling check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Story Creation check', 'INT', { timeRequired: '1 day - 6 months' }),
  ]),

  skill('Sailor Skill', 'Sailor', 'rivers', 106, [
    check('Swim check', 'AGI', { reference: 'CR II, p. 74' }),
    check('Climb check', 'AGI, STR', { reference: 'CR I, p. 104' }),
    check('Ropework check', 'DEX', { timeRequired: '1 minute (6 rounds)' }),
    check('Ship Steering check (small vessels)', 'DEX', { timeRequired: 'Instant' }),
    check('Ship Steering check (large vessels)', 'INT', { timeRequired: '10 seconds (1 round)' }),
    check('Ship Steering check (flying magic ships)', 'INT', { timeRequired: '10 seconds (1 round)' }),
  ]),
  skill('Soldier Skill', 'Soldier', 'military', 96, [
    check('First Aid check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Jump check', 'AGI', { reference: 'CR I, p. 112' }),
    check('Climb check', 'AGI, STR', { reference: 'CR I, p. 104' }),
    check('Strength check', 'STR', { reference: 'CR I, p. 113' }),
    check('Death Check', 'VIT', { reference: 'CR I, p. 110' }),
    check('Military Knowledge check', 'INT', { timeRequired: '10 seconds (1 round)' }),
    check('Long-distance Movement check', 'VIT', { timeRequired: '1 hour' }),
    check('Leadership check', 'SPR', { timeRequired: '10 seconds (1 round)' }),
  ]),
  skill('Towerman Skill', 'High-Rise Laborer', 'towns', 60, [
    check('Tumble check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Acrobatics check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Jump check', 'AGI', { reference: 'CR I, p. 112' }),
    check('Climb check', 'AGI, STR', { reference: 'CR I, p. 104, 113' }),
  ]),
  skill('Dancer Skill', 'Dancer', 'knowledge', 87, [
    check('Tumble check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Acrobatics check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Dance check', 'AGI', { timeRequired: '10 seconds (1 round) - 10 minutes (60 rounds)' }),
  ]),
  skill('Tour Guide Skill', 'Tour Guide', 'countryside', 101, [
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Cartography check', 'INT', { reference: 'CR I, p. 107' }),
    check('Engineering check', 'INT', { reference: 'CR I, p. 108' }),
    check('Tour Guide check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Distiller Skill', 'Distiller', 'craftsmen', 74, [
    check('Herbology check', 'INT', { reference: 'CR I, p. 108' }),
    check('Brewing check (distillation only)', 'INT', { timeRequired: '1 month - 1 year' }),
  ]),
  skill('Detective Skill', 'Detective', 'towns', 60, [
    check('Disable Device check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Disguise check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Hide check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Follow check', 'AGI', { reference: 'CR I, p. 105' }),
    check('Track check', 'INT', { reference: 'CR I, p. 106' }),
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Detect check', 'INT', { reference: 'CR I, p. 111' }),
    check('Search check', 'INT', { reference: 'CR I, p. 108' }),
  ]),
  skill('Tamer Skill', 'Animal Trainer', 'countryside', 101, [
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Training check', 'INT', { timeRequired: '1 week - 6 months' }),
    check('Monster Knowledge check (limited to Animals)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Tailor Skill', 'Dressmaker', 'towns', 61, [
    check('Tailoring check', 'DEX', { timeRequired: '6 hours - 1 month' }),
    check('Fabric Appraisal check', 'INT', { timeRequired: 'Instant' }),
  ]),

  skill('Doctor Skill', 'Doctor', 'knowledge', 87, [
    check('First Aid check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Pathology check', 'INT', { reference: 'CR I, p. 107' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Herbology check', 'INT', { reference: 'CR I, p. 108' }),
    check('Prescription check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Apothecary Skill', 'Pharmacist', 'knowledge', 88, [
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Herbology check', 'INT', { reference: 'CR I, p. 107' }),
    check('Preparing Medicine check', 'INT', { timeRequired: '6 hours to 1 month' }),
  ]),
  skill('Nurse Skill', 'Nurse', 'military', 97, [
    check('First Aid check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Pathology check', 'INT', { reference: 'CR I, p. 107' }),
    check('Nursing check', 'VIT', { timeRequired: '1 hour - 1 week' }),
  ]),
  skill('Navigator Skill', 'Navigator', 'rivers', 107, [
    check('Cartography check', 'INT', { reference: 'CR I, p. 107' }),
    check('Navigation check', 'INT', { timeRequired: '10 seconds (1 round)' }),
  ]),
  skill('Noble Skill', 'Aristocrat', 'military', 98, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Genealogy Knowledge check', 'INT', { timeRequired: '10 seconds (1 round)' }),
    check('Social check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
    check('Etiquette check', 'INT', { timeRequired: 'Instant' }),
    check('Dignity check', 'SPR', { timeRequired: 'Instant' }),
  ]),
  skill('Shepherd Skill', 'Shepherd', 'countryside', 102, [
    check('Track check', 'INT', { reference: 'CR I, p. 106' }),
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Animal Husbandry check', 'INT', { timeRequired: '1 day - 6 months' }),
    check('Monster Knowledge check (limited to Animal)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Barber Skill', 'Hairdresser/Barber', 'towns', 62, [
    check('First Aid check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Disguise check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Simple Surgery check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
    check('Barbering check', 'DEX', { timeRequired: '1 hour to 6 hours' }),
  ]),
  skill('Housekeeper Skill', 'Housekeeper', 'towns', 62, [
    check('Cooking check', 'DEX', { timeRequired: '10 minutes - 1 day' }),
    check('Cleaning and Organizing check', 'DEX', { timeRequired: '1 hour' }),
    check('Etiquette check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Butler Skill', 'Steward', 'military', 98, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Cleaning and Organizing check', 'DEX', { timeRequired: '1 hour' }),
    check('Genealogy Knowledge check', 'INT', { timeRequired: '10 seconds (1 round)' }),
    check('Social check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
    check('Etiquette check', 'INT', { timeRequired: 'Instant' }),
    check('Leadership check', 'SPR', { timeRequired: '10 seconds (1 round)' }),
  ]),

  skill('Hunter Skill', 'Hunter', 'countryside', 103, [
    check('Conceal check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Disable Device check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Set Trap check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Hide check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Track check', 'INT', { reference: 'CR I, p. 106' }),
    check('Search check', 'INT', { reference: 'CR I, p. 108' }),
    check('Spot Trap check', 'INT', { reference: 'CR I, p. 109' }),
    check('Material Processing check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
    check('Hunting Ground Knowledge check', 'INT', { timeRequired: '10 seconds (1 round)' }),
    check('Monster Knowledge check (limited to Animals and Plants)', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Perfumer Skill', 'Perfumer', 'knowledge', 89, [
    check('Herbology check', 'INT', { reference: 'CR I, p. 107' }),
    check('Fragrance Creation check', 'DEX', { timeRequired: '1 hour - 1 month' }),
    check('Social check', 'INT', { timeRequired: '1 minute (6 rounds)' }),
  ]),
  skill('Performer Skill', 'Entertainer', 'towns', 63, [
    check('Performance check', 'Various', { timeRequired: 'Various' }),
  ]),
  skill('Farmer Skill', 'Farmhand', 'countryside', 104, [
    check('Farming check', 'INT', { timeRequired: '1 month - 1 year' }),
    check('Monster Knowledge check (limited to Plants)', 'INT', { timeRequired: 'Instant' }),
    check('Herbology check (limited to Plants)', 'INT', { timeRequired: '1 minute (6 rounds)' }),
  ]),
  skill('Fisherman Skill', 'Fisherman', 'rivers', 108, [
    check('Swim check', 'AGI', { reference: 'CR II, p. 74' }),
    check('Net Setting check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
    check('Ship Steering check (small vessels)', 'DEX', { timeRequired: 'Instant' }),
    check('Fishing check', 'DEX, INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Aquatic Product Knowledge check', 'INT', { timeRequired: '10 seconds (1 round)' }),
  ]),
  skill('Fortune Teller Skill', 'Psychic', 'towns', 63, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Detect check', 'INT', { reference: 'CR I, p. 111' }),
    check('Meteorology check', 'INT', { reference: 'CR I, p. 107' }),
    check('Fortune-telling check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Blacksmith Skill', 'Smith', 'craftsmen', 75, [
    check('Blacksmithing check', 'DEX', { timeRequired: '1 hour - 1 month' }),
    check('Mineral Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Brewer Skill', 'Brewer', 'craftsmen', 75, [
    check('Herbology check', 'INT', { reference: 'CR I, p. 108' }),
    check('Brewing check (brewing only)', 'INT', { timeRequired: '3 days - 1 month' }),
    check('Fermentation check', 'INT', { timeRequired: '1 month to 1 year' }),
  ]),
  skill('Prestidigitator Skill', 'Magician', 'knowledge', 89, [
    check('Conceal check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Pickpocket check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Sleight of Hand check', 'DEX', { timeRequired: 'Instant' }),
    check('Prestidigitation check', 'DEX', { timeRequired: '10 seconds (1 round)' }),
  ]),

  skill('Prostitute Skill', 'Harlot/Gigolo', 'towns', 64, [
    check('Disguise check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Sexual Technique check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
    check('Seduction check', 'SPR', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Painter Skill', 'Artist', 'knowledge', 90, [
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Search check', 'INT', { reference: 'CR I, p. 108' }),
    check('Cartography check', 'INT', { reference: 'CR I, p. 107' }),
    check('Painting check', 'SPR', { timeRequired: '1 day - 6 months' }),
  ]),
  skill('Beggar Skill', 'Tramp', 'towns', 65, [
    check('Disguise check', 'DEX', { reference: 'CR I, p. 103' }),
    check('Hide check', 'AGI', { reference: 'CR I, p. 104' }),
    check('Notice check', 'INT', { reference: 'CR I, p. 106' }),
    check('Listen check', 'INT', { reference: 'CR I, p. 106' }),
    check('Tramp check', 'SPR', { timeRequired: '6 hours - 1 day' }),
  ]),
  skill('Heraldist Skill', 'Heraldic Scholar', 'knowledge', 91, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Genealogy Knowledge check', 'INT', { timeRequired: '10 seconds (1 round)' }),
    check('Heraldry check', 'INT', { timeRequired: '10 seconds (1 round) - 1 hour' }),
  ]),
  skill('Bone Carver Skill', 'Bone Craftsman', 'craftsmen', 76, [
    check('Bone Crafting check', 'DEX', { timeRequired: '6 hours - 1 month' }),
    check('Appraise check (limited to bone crafting)', 'INT', { timeRequired: 'Instant' }),
    check('Bone Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Merchant Skill', 'Merchant', 'towns', 65, [
    check('Price Insight check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Negotiation check', 'SPR', { timeRequired: '10 minutes (60 rounds)' }),
  ]),
  skill('Miner Skill', 'Miner', 'countryside', 104, [
    check('Mining check', 'DEX', { timeRequired: '6 hours - 1 week' }),
    check('Excavation check', 'STR', { timeRequired: '1 day' }),
    check('Mineral Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Manager Skill', 'Manager', 'towns', 66, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Detect check', 'INT', { reference: 'CR I, p. 111' }),
    check('Appraise check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Management check', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Leadership check', 'SPR', { timeRequired: '10 seconds (1 round)' }),
  ]),
  skill('Butcher Skill', 'Butcher', 'towns', 66, [
    check('Meat Butchering check', 'DEX', { timeRequired: '10 minutes to 6 hours' }),
    check('Meat Processing check', 'DEX', { timeRequired: '10 minutes to 1 day' }),
  ]),

  skill('Midwife Skill', 'Midwife', 'towns', 67, [
    check('First Aid check', 'DEX', { reference: 'CR I, p. 102' }),
    check('Pathology check', 'INT', { reference: 'CR I, p. 107' }),
    check('Childbirth Assistance check', 'INT', { timeRequired: '6 hours to 1 day' }),
    check('Disinfection check', 'INT', { timeRequired: '1 hour' }),
  ]),
  skill('Musician Skill', 'Musician', 'knowledge', 91, [
    check('Listen check', 'INT', { reference: 'CR I, p. 106' }),
    check('Melody Comprehension check', 'INT', { timeRequired: '1 minute (6 rounds) - 10 minutes (60 rounds)' }),
    check('Instrument Performance check', 'SPR', { timeRequired: '1 minute (6 rounds) - 10 minutes (60 rounds)' }),
  ]),
  skill('Mason Skill', 'Stonemason', 'craftsmen', 77, [
    check('Stonecutting check', 'DEX', { timeRequired: '10 minutes (60 rounds)' }),
    check('Construction check (stone materials only)', 'DEX', { timeRequired: '1 week - 1 year' }),
    check('Mineral Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Drafting check', 'INT', { timeRequired: '1 hour - 1 year' }),
  ]),
  skill('Librarian Skill', 'Librarian', 'knowledge', 92, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Engineering check', 'INT', { reference: 'CR I, p. 108' }),
    check('Library Management check', 'INT', { timeRequired: '1 hour - 1 day' }),
  ]),
  skill('Lumberjack Skill', 'Logger', 'countryside', 105, [
    check('Logging check', 'STR', { timeRequired: '10 minutes (60 rounds) - 6 hours' }),
    check('Wood Processing check', 'DEX', { timeRequired: '6 hours - 1 week' }),
    check('Plant Knowledge check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Restorer Skill', 'Restorer', 'knowledge', 92, [
    check('Appraise check (Magitech Civilization only)', 'INT', { timeRequired: '10 minutes (60 rounds)' }),
    check('Magitech Repair check', 'DEX', { timeRequired: '1 hour' }),
  ]),
  skill('Linguist Skill', 'Interpreter', 'knowledge', 93, [
    check('Insight check', 'INT', { reference: 'CR I, p. 106' }),
    check('Literature check', 'INT', { reference: 'CR I, p. 107' }),
    check('Engineering check', 'INT', { reference: 'CR I, p. 108' }),
    check('Linguistics check', 'INT', { timeRequired: 'Instant' }),
  ]),
  skill('Teamster Skill', 'Manual Laborer', 'towns', 68, [
    check('Strength check', 'STR', { reference: 'CR I, p. 113' }),
    check('Carrying check', 'STR', { timeRequired: '1 minute (6 rounds)' }),
  ]),
  skill('Leatherworker Skill', 'Leather Craftsman', 'craftsmen', 78, [
    check('Leather Crafting check', 'DEX', { timeRequired: '6 hours - 1 month' }),
    check('Tanning check', 'DEX', { timeRequired: '1 week - 1 year' }),
    check('Leather Knowledge check', 'INT', { timeRequired: 'Instant' }),
    check('Appraise check (leather-specific)', 'INT', { timeRequired: 'Instant' }),
  ]),
];

export function listWorkSkillsByCategory(category: WorkSkillCategory): WorkSkillDefinition[] {
  return WORK_SKILLS.filter((entry) => entry.category === category).sort((a, b) => a.name.localeCompare(b.name));
}

export function getWorkSkill(id: string): WorkSkillDefinition | undefined {
  return WORK_SKILLS.find((entry) => entry.id === id);
}

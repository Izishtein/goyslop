/**
 * Spell catalog, Core Rulebook I (docs/sheet-content/09-spells-core1.md).
 *
 * Index data only — name, school, circle and MP cost. Effect text is deliberately not
 * carried here: the research docs hold it in Russian only, and this app ships EN and RU
 * side by side. Each spell a character knows has its own free-text note on the sheet.
 *
 * `school` matches ClassDefinition.magicSchool, which is how the sheet works out which
 * spells a given character can pick.
 */
export interface SpellDefinition {
  id: string;
  name: string;
  school: string;
  /** 1-6 in Core I; a caster knows circles up to their class level. */
  circle: number;
  mp: number;
  /** True when the book prints the cost as a base plus an open-ended extra. */
  mpVariable?: boolean;
  /** Specialized Divine spells belong to a single deity. */
  deity?: string;
  /** Magitech spells are cast through a magisphere of the given size. */
  magisphere?: string;
  sourceBook: string;
}

const CORE1 = 'Core Rulebook I';

function spell(
  school: string,
  circle: number,
  name: string,
  mp: number,
  extra: Partial<SpellDefinition> = {},
): SpellDefinition {
  return {
    id: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
    name,
    school,
    circle,
    mp,
    sourceBook: CORE1,
    ...extra,
  };
}

const TRUESPEECH = 'Truespeech Magic';
const SPIRITUALISM = 'Spiritualism Magic';
const DIVINE = 'Divine Magic';
const MAGITECH = 'Magitech';

export const SPELLS: SpellDefinition[] = [
  // --- Truespeech Magic (Sorcerer), pp. 219-224 ---
  spell(TRUESPEECH, 1, 'Energy Bolt', 5),
  spell(TRUESPEECH, 1, 'Dull Weapon', 2),
  spell(TRUESPEECH, 1, 'Light', 1),
  spell(TRUESPEECH, 1, 'Lock', 1),
  spell(TRUESPEECH, 2, 'Sense Magic', 1),
  spell(TRUESPEECH, 2, 'Dispel Magic', 3),
  spell(TRUESPEECH, 2, 'Nap', 5),
  spell(TRUESPEECH, 2, 'Vitality', 2),
  spell(TRUESPEECH, 3, 'Unlock', 2),
  spell(TRUESPEECH, 3, 'Sense Enemy', 2),
  spell(TRUESPEECH, 3, 'Paralyze', 3),
  spell(TRUESPEECH, 3, 'Reaping Slash', 7),
  spell(TRUESPEECH, 4, 'Familiar', 15),
  spell(TRUESPEECH, 4, 'Marking', 2),
  spell(TRUESPEECH, 4, 'Lightning', 7),
  spell(TRUESPEECH, 5, 'Weapon Mastery', 5),
  spell(TRUESPEECH, 5, 'Wall Walking', 3),
  spell(TRUESPEECH, 5, 'Translate', 2),
  spell(TRUESPEECH, 5, 'Blast', 6),
  spell(TRUESPEECH, 6, 'Conceal Self', 15),
  spell(TRUESPEECH, 6, 'Hard Lock', 4),
  spell(TRUESPEECH, 6, 'Fireball', 8),
  spell(TRUESPEECH, 6, 'Levitation', 6),

  // --- Spiritualism Magic (Conjurer), pp. 225-230 ---
  spell(SPIRITUALISM, 1, 'Enchant Weapon', 2),
  spell(SPIRITUALISM, 1, 'Spark', 6),
  spell(SPIRITUALISM, 1, 'Dark Mist', 2),
  spell(SPIRITUALISM, 1, 'Protection', 1),
  spell(SPIRITUALISM, 2, 'Earth Heal', 3),
  spell(SPIRITUALISM, 2, 'Counter Magic', 1),
  spell(SPIRITUALISM, 2, 'Command Doll', 4),
  spell(SPIRITUALISM, 2, 'Fanaticism', 3),
  spell(SPIRITUALISM, 3, 'Fire Weapon', 4),
  spell(SPIRITUALISM, 3, 'Raging Earth', 7),
  spell(SPIRITUALISM, 4, 'Disguise', 3),
  spell(SPIRITUALISM, 4, 'Doll Sight', 3),
  spell(SPIRITUALISM, 4, 'Forbid Magic', 5),
  spell(SPIRITUALISM, 4, 'Poison Cloud', 6),
  spell(SPIRITUALISM, 5, 'Earth Shield', 4),
  spell(SPIRITUALISM, 5, 'Intense Control', 5),
  spell(SPIRITUALISM, 5, 'Spell Enhance', 3),
  spell(SPIRITUALISM, 6, 'Counter Sense', 3),
  spell(SPIRITUALISM, 6, 'Stun Cloud', 6),
  spell(SPIRITUALISM, 6, 'Mana Absorb', 6),
  spell(SPIRITUALISM, 6, 'Remote Doll', 5),

  // --- Divine Magic (Priest), basic spells, pp. 231-238 ---
  spell(DIVINE, 1, 'Sanity', 3),
  spell(DIVINE, 1, 'Banish', 3),
  spell(DIVINE, 1, 'Field Protection', 2),
  spell(DIVINE, 2, 'Awaken', 5),
  spell(DIVINE, 2, 'Cure Wounds', 3),
  spell(DIVINE, 2, 'Detect Faith', 4),
  spell(DIVINE, 3, 'Cure Blindness', 2),
  spell(DIVINE, 3, 'Cure Poison', 3),
  spell(DIVINE, 3, 'Field Resistance', 5),
  spell(DIVINE, 3, 'Force', 4),
  spell(DIVINE, 4, 'Sacred Weapon', 3),
  spell(DIVINE, 4, 'Sacred Shield', 4),
  spell(DIVINE, 4, 'Affirmation of Faith', 5),
  spell(DIVINE, 5, 'Cure Disease', 4),
  spell(DIVINE, 5, 'Cure Heart', 5),
  spell(DIVINE, 5, 'Transfer Mana', 1, { mpVariable: true }),
  spell(DIVINE, 5, 'Holy Light', 6),
  spell(DIVINE, 6, 'Bless', 5),
  spell(DIVINE, 6, 'Holy Cradle', 4),
  spell(DIVINE, 6, 'Remove Curse', 5),

  // --- Specialized Divine Spells: one deity per Priest, circles 2 and 4 ---
  spell(DIVINE, 2, 'Search Barbarous', 3, { deity: 'Lyphos' }),
  spell(DIVINE, 4, 'Mind Sending', 4, { deity: 'Lyphos' }),
  spell(DIVINE, 2, 'Sunlight', 3, { deity: 'Tidan' }),
  spell(DIVINE, 4, 'Ray', 5, { deity: 'Tidan' }),
  spell(DIVINE, 2, 'Penetrate', 2, { deity: 'Kilhia' }),
  spell(DIVINE, 4, 'Weak Point', 4, { deity: 'Kilhia' }),
  spell(DIVINE, 2, 'Nightwalker', 2, { deity: 'Sien' }),
  spell(DIVINE, 4, 'Blindness', 4, { deity: 'Sien' }),
  spell(DIVINE, 2, 'Retry', 2, { deity: 'Mirtabar' }),
  spell(DIVINE, 4, 'Appraisal', 1, { deity: 'Mirtabar' }),
  spell(DIVINE, 2, 'Counter Daemon', 3, { deity: 'Eve' }),
  spell(DIVINE, 4, 'Sacred Aura', 4, { deity: 'Eve' }),
  spell(DIVINE, 2, 'Star Guide', 1, { deity: 'Harula' }),
  spell(DIVINE, 4, 'Disclose Daemons', 2, { deity: 'Harula' }),
  spell(DIVINE, 2, 'Wind Circulation', 3, { deity: 'Furusil' }),
  spell(DIVINE, 4, 'Cold Rain', 7, { deity: 'Furusil' }),

  // --- Magitech (Artificer), pp. 242-247 ---
  spell(MAGITECH, 1, 'Solid Bullet', 1, { magisphere: 'Small' }),
  spell(MAGITECH, 1, 'Targeting Sight', 2, { magisphere: 'Small' }),
  spell(MAGITECH, 1, 'Flashlight', 2, { magisphere: 'Small' }),
  spell(MAGITECH, 1, 'Mana Search', 3, { magisphere: 'Small/Medium/Large' }),
  spell(MAGITECH, 2, 'Explorer Aid', 4, { magisphere: 'Small' }),
  spell(MAGITECH, 2, 'Critical Bullet', 2, { magisphere: 'Small' }),
  spell(MAGITECH, 2, 'Healing Bullet', 1, { magisphere: 'Small' }),
  spell(MAGITECH, 2, 'Knocker Bomb', 3, { magisphere: 'Small' }),
  spell(MAGITECH, 3, 'Element Bullet', 1, { magisphere: 'Small' }),
  spell(MAGITECH, 3, 'Effect Weapon', 2, { magisphere: 'Small' }),
  spell(MAGITECH, 3, 'Jump Boots', 3, { magisphere: 'Small/Medium/Large' }),
  spell(MAGITECH, 3, 'Shock Bomb', 3, { magisphere: 'Medium' }),
  spell(MAGITECH, 4, 'Analyze', 2, { magisphere: 'Small' }),
  spell(MAGITECH, 4, 'Quick Loader', 4, { magisphere: 'Small' }),
  spell(MAGITECH, 4, 'Automobile', 10, { magisphere: 'Large' }),
  spell(MAGITECH, 4, 'Smoke Bomb', 4, { magisphere: 'Medium' }),
  spell(MAGITECH, 5, 'Shotgun Bullet', 2, { magisphere: 'Small' }),
  spell(MAGITECH, 5, 'Grenade', 6, { magisphere: 'Small' }),
  spell(MAGITECH, 5, 'Wire Anchor', 4, { magisphere: 'Medium' }),
  spell(MAGITECH, 6, 'Burst Shot', 3, { magisphere: 'Small' }),
  spell(MAGITECH, 6, 'Create Weapon', 7, { magisphere: 'Small' }),
  spell(MAGITECH, 6, 'Set Disguise', 3, { magisphere: 'Small' }),
  spell(MAGITECH, 6, 'Resist Bomb', 6, { magisphere: 'Medium' }),
];

/** Schools the catalog covers; other schools exist but have no data yet (Core II+). */
export const CATALOGUED_SCHOOLS = [TRUESPEECH, SPIRITUALISM, DIVINE, MAGITECH];

export function listSpellsBySchool(school: string): SpellDefinition[] {
  return SPELLS.filter((spellDef) => spellDef.school === school).sort(
    (a, b) => a.circle - b.circle || a.name.localeCompare(b.name),
  );
}

export function getSpell(id: string): SpellDefinition | undefined {
  return SPELLS.find((spellDef) => spellDef.id === id);
}

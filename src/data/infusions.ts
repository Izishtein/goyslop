/**
 * Heritor Infusions — Barbarous Rage pp. 57-63 ("Heritor Class And Infusions", "List of Infusions"),
 * transcribed in docs/sheet-content/42-heritor-infusions.md.
 *
 * "Each time a character takes a level in Heritor, they may choose an Infusion from the list of
 * Infusions and learn it. Some Infusions require a minimum Heritor level" (p. 57): one slot per
 * Heritor level, a pick of the 1st, 5th or 10th tier no higher than the class level — the same
 * shape as Essence Weavings and Rider Stunts. An Infusion whose prerequisite is another Infusion
 * "cannot be newly acquired unless all the Infusions written in that item have already been acquired".
 *
 * The list is 20 Infusions open to every Heritor and 40 "Exclusive Infusions" for the four races with
 * several sections (Diablo 13, Drake 8, Basilisk 13, Scissorscorpion 6) — the totals the book's own
 * table on p. 58 gives. The catalogue does not enforce the race: those four races are not in the
 * races catalogue, and every section of such a character is bookkeeping done by hand.
 *
 * The English text is the book's, in reference.infusionSummary / reference.infusionEffect; the Russian
 * is the digest in files/Вливания Наследника for the 33 it covers (common and Basilisk), our own
 * translation for the other 27.
 */
export const INFUSION_TIERS = [1, 5, 10] as const;
export type InfusionTier = (typeof INFUSION_TIERS)[number];

export const INFUSION_RACES = ['any', 'diablo', 'drake', 'basilisk', 'scissorscorpion'] as const;
export type InfusionRace = (typeof INFUSION_RACES)[number];

/** The "Appl. Section" cell: which section of the transformed body the Infusion works on. */
export const INFUSION_SECTIONS = ['main', 'all', 'others', 'none', 'evilEye', 'body', 'scorpion', 'pincers'] as const;
export type InfusionSection = (typeof INFUSION_SECTIONS)[number];

export interface InfusionDefinition {
  id: string;
  name: string;
  /** The Heritor level the Infusion needs: 1, 5 or 10. */
  requiredLevel: InfusionTier;
  race: InfusionRace;
  section: InfusionSection;
  /** "Human Form": does it work before the transformation too. null where the book prints "-". */
  humanForm: boolean | null;
  /** Infusions that must already be known (ids). */
  requires: string[];
  /** A prerequisite that is not an Infusion — a Combat Feat — as the book prints it. */
  otherPrerequisite?: string;
  /** The entry is not printed in the body of the book: its fields follow the sibling Infusions of its race. */
  inferred?: boolean;
  sourceBook: string;
}

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function infusion(
  name: string,
  requiredLevel: InfusionTier,
  race: InfusionRace,
  section: InfusionSection,
  humanForm: boolean | null,
  options: { requires?: string[]; otherPrerequisite?: string; inferred?: boolean } = {},
): InfusionDefinition {
  return {
    id: slug(name),
    name,
    requiredLevel,
    race,
    section,
    humanForm,
    requires: options.requires ?? [],
    otherPrerequisite: options.otherPrerequisite,
    inferred: options.inferred,
    sourceBook: 'Barbarous Rage',
  };
}

export const INFUSIONS: InfusionDefinition[] = [
  infusion('Core of Holding', 1, 'any', 'main', false),
  infusion('Resilient Core I', 1, 'any', 'main', false),
  infusion('Innate Weapons Mastery A', 1, 'any', 'all', false),
  infusion('Section Quick Reaction I', 1, 'any', 'others', false),
  infusion('Natural Aspect', 1, 'any', 'others', false),
  infusion('Tenacious Infusion I', 1, 'any', 'others', false),
  infusion('Heritor\'s Eyes', 1, 'any', 'main', true),
  infusion('Active Combat Feats Use', 1, 'diablo', 'others', false),
  infusion('Warrior-Type Classes Use', 1, 'diablo', 'others', false),
  infusion('Chain of Curses', 1, 'diablo', 'main', true),
  infusion('Daemonic Eyes', 1, 'diablo', 'main', true, { inferred: true }),
  infusion('Daemonic Mastery/Success Value', 1, 'diablo', 'main', true),
  infusion('Shining Light Breath', 1, 'drake', 'main', false),
  infusion('Magic Sword Reforged', 1, 'drake', 'none', true),
  infusion('Enhanced Magic Sword A', 1, 'drake', 'none', true, { otherPrerequisite: 'Weapon Prof. A/**' }),
  infusion('Darkvision', 1, 'basilisk', 'none', true),
  infusion('Evil Eye Half MP/**', 1, 'basilisk', 'evilEye', true),
  infusion('Enhanced Evil Eye A/**', 1, 'basilisk', 'evilEye', true),
  infusion('Evil Eye Success Value Amplification', 1, 'basilisk', 'evilEye', false),
  infusion('Mobile Shooting', 1, 'scissorscorpion', 'main', null, { otherPrerequisite: 'Targeting' }),
  infusion('Weakening Venom', 1, 'scissorscorpion', 'scorpion', null),
  infusion('Resilient Core II', 5, 'any', 'main', false, { requires: ['resilient-core-i'] }),
  infusion('All-Out Attack', 5, 'any', 'others', false),
  infusion('Innate Weapons Mastery S', 5, 'any', 'all', false, { requires: ['innate-weapons-mastery-a'] }),
  infusion('Tenacious Infusion II', 5, 'any', 'others', false, { requires: ['tenacious-infusion-i'] }),
  infusion('Section Quick Reaction II', 5, 'any', 'others', false, { requires: ['section-quick-reaction-i'] }),
  infusion('Experienced Heritor', 5, 'any', 'main', true),
  infusion('Technique Infusion', 5, 'any', 'others', false),
  infusion('Erosive Poisonous Breath', 5, 'diablo', 'main', true),
  infusion('Body Effects Continuation I', 5, 'diablo', 'others', false),
  infusion('Daemonic Roar', 5, 'diablo', 'main', true),
  infusion('Magic Sword Reinforced', 5, 'drake', 'none', true),
  infusion('Magic Sword Absorption', 5, 'drake', 'main', false),
  infusion('Enhanced Magic Sword S', 5, 'drake', 'none', true, { requires: ['enhanced-magic-sword-a'], otherPrerequisite: 'Weapon Proficiency S/**' }),
  infusion('Titanic Physique', 5, 'basilisk', 'body', false),
  infusion('Evil Eye Free MP/**', 5, 'basilisk', 'evilEye', true, { requires: ['evil-eye-half-mp'] }),
  infusion('Enhanced Evil Eye S/**', 5, 'basilisk', 'evilEye', true, { requires: ['enhanced-evil-eye-a'] }),
  infusion('Evil Eye Mutation I', 5, 'basilisk', 'evilEye', true),
  infusion('Cross Strike', 5, 'scissorscorpion', 'pincers', null),
  infusion('Stronger Poison', 5, 'scissorscorpion', 'scorpion', null),
  infusion('Resilient Core Mastery', 10, 'any', 'main', false, { requires: ['resilient-core-ii'] }),
  infusion('Innate Weapons Mastery SS', 10, 'any', 'all', false, { requires: ['innate-weapons-mastery-s'] }),
  infusion('Meticulous Infusion Mastery', 10, 'any', 'others', false, { requires: ['section-quick-reaction-ii'] }),
  infusion('Tenacious Infusion Mastery', 10, 'any', 'others', false, { requires: ['tenacious-infusion-ii'] }),
  infusion('Realm of the Malevolent One', 10, 'any', 'none', true),
  infusion('Mana Release', 10, 'any', 'all', true),
  infusion('Otherworldly Behavior', 10, 'diablo', 'all', false),
  infusion('Soul Absorption', 10, 'diablo', 'main', true),
  infusion('Body Effects Continuation II', 10, 'diablo', 'body', false, { requires: ['body-effects-continuation-i'] }),
  infusion('Raw Deal', 10, 'diablo', 'main', true),
  infusion('Great Daemonic Mastery/Success Value', 10, 'diablo', 'main', true, { requires: ['daemonic-mastery-success-value'] }),
  infusion('Radiant Breath', 10, 'drake', 'main', false, { requires: ['shining-light-breath'] }),
  infusion('Enhanced Magic Sword SS', 10, 'drake', 'none', true, { requires: ['enhanced-magic-sword-s'], otherPrerequisite: 'Weapon Master' }),
  infusion('Second Evil Eye', 10, 'basilisk', 'evilEye', true, { requires: ['evil-eye-mutation-i'] }),
  infusion('Evil Eye Destruction Control', 10, 'basilisk', 'evilEye', true, { requires: ['enhanced-evil-eye-ss'], otherPrerequisite: 'Magic Control' }),
  infusion('Enhanced Evil Eye SS/**', 10, 'basilisk', 'evilEye', true, { requires: ['enhanced-evil-eye-s'] }),
  infusion('Evil Eye Mutation II', 10, 'basilisk', 'evilEye', true, { requires: ['evil-eye-mutation-i'] }),
  infusion('Casting Magic', 10, 'basilisk', 'evilEye', false),
  infusion('Scorpion Attitude Control', 10, 'scissorscorpion', 'scorpion', null),
  infusion('Deadly Poison', 10, 'scissorscorpion', 'scorpion', null, { requires: ['stronger-poison'] }),
];

export function getInfusion(id: string): InfusionDefinition | undefined {
  return INFUSIONS.find((entry) => entry.id === id);
}

export function listInfusionsByLevel(level: InfusionTier): InfusionDefinition[] {
  return INFUSIONS.filter((entry) => entry.requiredLevel === level);
}

export function listInfusionsByRace(race: InfusionRace): InfusionDefinition[] {
  return INFUSIONS.filter((entry) => entry.race === race);
}

/** The Infusions a known one still lacks: prerequisite Infusions that are not among `knownNames`. */
export function missingPrerequisites(definition: InfusionDefinition, knownNames: Set<string>): InfusionDefinition[] {
  return definition.requires
    .map((id) => getInfusion(id))
    .filter((required): required is InfusionDefinition => required !== undefined && !knownNames.has(required.name));
}

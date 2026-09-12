/**
 * Dark Hunter Essence Weavings — Abyss Breaker pp. 29-35 ("Essence Weaving List"), transcribed
 * in docs/sheet-content/36-essence-weavings.md.
 *
 * "For each level gained in the Dark Hunter class, the character chooses and acquires one
 * Essence Weaving from the Essence Weaving list. It cannot be postponed" (p. 28) — one slot
 * per Dark Hunter class level, exactly the Rider Stunt pattern (see data/stunts.ts).
 *
 * The English book prints no level-tier headers at all (unlike Stunts/Aspects, which split
 * pages into "1st/5th/10th Level Required" banners) — every entry's tier had to come from the
 * Russian digest (`files/.../Плетения Эссенции Тёмного Охотника.docx`), which groups all 28
 * under "1 уровень"/"5 уровень"/"10 уровень" headers. Cross-checked against the book's own
 * Cost column: every entry the digest puts at level 5 or 10 also carries a "some Essence
 * Weavings have a minimum required class level (5 or 10)" note in the book's rules text
 * (Strong Throws, Mass Looting, Monster Watch, Affliction Ward all describe a level-5/10
 * upgrade to an already-owned Weaving, distinct from the acquisition-level split used here) —
 * zero disagreements between the two sources on which of the 28 sit at which tier.
 *
 * Passive/Minor/Major Action is a glyph before the name in both book and digest, unrenderable
 * by pdftotext — recovered from the digest's ⏩/◯/► markers, then cross-checked against the
 * book's own Cost/skill-check rules text (Major Action Weavings always involve a skill check
 * and a "2d" cost; Passive Weavings never have a Target/Range/Duration row; everything else is
 * Minor Action) with zero disagreements.
 */
export const ESSENCE_WEAVING_TYPES = ['passive', 'minorAction', 'majorAction'] as const;
export type EssenceWeavingType = (typeof ESSENCE_WEAVING_TYPES)[number];

export interface EssenceWeavingDefinition {
  id: string;
  name: string;
  type: EssenceWeavingType;
  requiredLevel: 1 | 5 | 10;
  /** As the book prints it in the Cost column: "-", "2", "1d", "2d", "2d(6)", "2d(9)". */
  cost: string;
  /** Name of the Essence Weaving that must already be known, if any; "or" joins alternatives. */
  prerequisite?: string;
  /** The digest's "△" marker: usable as a Minor Action during Combat Preparation too. */
  usableInPreparation?: boolean;
  sourceBook: string;
}

const ABYSS_BREAKER = 'Abyss Breaker';

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function weaving(
  name: string,
  type: EssenceWeavingType,
  requiredLevel: 1 | 5 | 10,
  cost: string,
  options: { prerequisite?: string; usableInPreparation?: boolean } = {},
): EssenceWeavingDefinition {
  return {
    id: slug(name),
    name,
    type,
    requiredLevel,
    cost,
    prerequisite: options.prerequisite,
    usableInPreparation: options.usableInPreparation,
    sourceBook: ABYSS_BREAKER,
  };
}

export const ESSENCE_WEAVINGS: EssenceWeavingDefinition[] = [
  // --- 1st Level Dark Hunter Required, pp. 29-30 ---
  weaving('Abyss Exploration Techniques', 'minorAction', 1, '1d', { usableInPreparation: true }),
  weaving('Essence Focus', 'minorAction', 1, '1d'),
  weaving('Mass Looting', 'passive', 1, '-'),
  weaving('Mind Binding Technique I', 'minorAction', 1, '1d'),
  weaving('Monster Watch', 'passive', 1, '-'),
  weaving('Pull of Soul Tethers', 'minorAction', 1, '2'),
  weaving('Spectral Protective Circle', 'minorAction', 1, '1d', { usableInPreparation: true }),
  weaving('Spectral Throw', 'majorAction', 1, '2d(6)'),
  weaving('Strong Throws', 'passive', 1, '-'),
  weaving('Type Infusion: Roar', 'minorAction', 1, '1d'),
  weaving('Type Infusion: Tear', 'minorAction', 1, '1d'),

  // --- 5th Level Dark Hunter Required, pp. 30-32 ---
  weaving('Affliction Ward', 'minorAction', 5, '1d', { usableInPreparation: true }),
  weaving('Dark Life', 'passive', 5, '-'),
  weaving('Dual Weaving', 'minorAction', 5, '2', { prerequisite: 'Spectral Throw' }),
  weaving('Evil-Banishing Light Bullet', 'majorAction', 5, '2d(9)'),
  weaving('Levitation Technique', 'minorAction', 5, '1d', { usableInPreparation: true }),
  weaving('Long-Range Technique', 'passive', 5, '-', { prerequisite: 'Spectral Throw' }),
  weaving('Mind Binding Technique II', 'minorAction', 5, '1d', { prerequisite: 'Mind Binding Technique I' }),
  weaving('Soul Protection Seal', 'minorAction', 5, '2', { prerequisite: 'Spectral Curve' }),
  weaving('Soul Tethers Hands I', 'majorAction', 5, '2d(9)'),
  weaving('Spectral Curve', 'minorAction', 5, '1d', { prerequisite: 'Pull of Soul Tethers' }),
  weaving('Universal Manipulation', 'passive', 5, '-', { prerequisite: 'Spectral Throw' }),

  // --- 10th Level Dark Hunter Required, pp. 32-35 ---
  weaving('Dark Magic Techniques', 'passive', 10, '-', { prerequisite: 'Abyss Exploration Techniques or Dark Life' }),
  weaving('Evil-Banishing Light Lance', 'majorAction', 10, '2d', { prerequisite: 'Evil-Banishing Light Bullet' }),
  weaving('Heavy Throws', 'passive', 10, '-', { prerequisite: 'Universal Manipulation' }),
  weaving('Mind Binding Technique III', 'minorAction', 10, '1d', { prerequisite: 'Mind Binding Technique II' }),
  // Book prints "Prer. [Mind Binding Technique]" generically — the effect applies "regardless
  // of whether it's I, II, or III". Since II requires I and III requires II (a strict chain),
  // knowing any of the three already implies knowing I, so pointing the prerequisite at I is
  // both accurate and the one name guaranteed to already be in the catalog.
  weaving('Mind Binding Technique Enhancement', 'minorAction', 10, '1d', {
    prerequisite: 'Mind Binding Technique I',
    usableInPreparation: true,
  }),
  weaving('Soul Tethers Hands II', 'majorAction', 10, '2d', { prerequisite: 'Soul Tethers Hands I' }),
];

export function getEssenceWeaving(id: string): EssenceWeavingDefinition | undefined {
  return ESSENCE_WEAVINGS.find((w) => w.id === id);
}

export function listEssenceWeavingsByLevel(level: 1 | 5 | 10): EssenceWeavingDefinition[] {
  return ESSENCE_WEAVINGS.filter((w) => w.requiredLevel === level);
}

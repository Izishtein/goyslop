/**
 * Techniques, Spellsongs and Finales — Core Rulebook II pp. 182–197, transcribed in
 * docs/sheet-content/12-techniques-spellsongs.md.
 *
 * Three systems belonging to two Minor classes: the Enhancer's Techniques and the Bard's
 * Spellsongs and Finales. They do not fit the spell table — no circle, no MP, and a
 * required class level instead — so they get their own section on the sheet.
 *
 * Like the spell catalog this stores names and mechanics, never effect text: the research
 * docs carry the effects in Russian only, and half an English catalog is worse than none.
 * The row's own note field is where a player writes what the art actually does.
 *
 * Durations are codes rather than strings so both locales can print them properly; every
 * other value here (rhythm marks, "Neg", "Psychic (Weak)", pet names) is a game term and
 * stays as the book writes it, exactly like the B/A/S equipment ranks.
 */

export type ArtKind = 'technique' | 'spellsong' | 'finale';

/** The five durations the Technique table uses; rounds are shown alongside in the UI. */
export type DurationCode = '10s' | '30s' | '3min' | '1h' | 'instant';

export interface ArtDefinition {
  id: string;
  kind: ArtKind;
  name: string;
  /** Enhancer or Bard class level the book requires before this can be learned. */
  requiredLevel: number;
  /** Technique: usable during Combat Preparation (marked △ in the book). */
  preparation?: boolean;
  /** Technique: how long it lasts. */
  duration?: DurationCode;
  /** Spellsong: the Bard must actually sing, so it fails while silenced. */
  singing?: boolean;
  /** Spellsong: pets that can carry the song instead. */
  pets?: string;
  /** Spellsong: rhythm that must already be banked for the effect to fire. */
  effectCondition?: string;
  /** Spellsong: rhythm generated per performance. Finale: rhythm it spends. */
  rhythm?: string;
  /** Spellsong: Standard Value that earns the extra rhythm. */
  flourish?: number;
  /** Spellsong: rhythm added when the performance beats the Flourish Value. */
  extraRhythm?: string;
  resistance?: string;
  /** Damage/effect type, as printed: "Psychic (Weak)", "Water/Ice", "—" when none. */
  damageType?: string;
}

const technique = (name: string, requiredLevel: number, duration: DurationCode, preparation = false): ArtDefinition => ({
  id: slug(name),
  kind: 'technique',
  name,
  requiredLevel,
  duration,
  preparation,
});

const spellsong = (
  name: string,
  requiredLevel: number,
  singing: boolean,
  pets: string,
  rhythm: string,
  flourish: number,
  extraRhythm: string,
  resistance: string,
  damageType: string,
  effectCondition = '',
): ArtDefinition => ({
  id: slug(name),
  kind: 'spellsong',
  name,
  requiredLevel,
  singing,
  pets,
  rhythm,
  flourish,
  extraRhythm,
  resistance,
  damageType,
  effectCondition,
});

const finale = (name: string, requiredLevel: number, rhythm: string, resistance: string, damageType: string): ArtDefinition => ({
  id: slug(name),
  kind: 'finale',
  name,
  requiredLevel,
  rhythm,
  resistance,
  damageType,
});

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Core II pp. 182–186. */
const TECHNIQUES: ArtDefinition[] = [
  technique('Antibody', 1, '30s', true),
  technique('Owl Sight', 1, '3min'),
  technique('Gazelle Feet', 1, '30s', true),
  technique("Cat's Eyes", 1, '30s'),
  technique('Scale Leggings', 1, '1h'),
  technique('Strong Blood', 1, '30s'),
  technique('Chic Chick', 1, '1h'),
  technique('Dragon Tail', 1, '3min'),
  technique('Beetleskin', 1, '30s', true),
  technique('Bear Muscle', 1, '30s'),
  technique('Meditation', 1, '30s', true),
  technique('Rabbit Ears', 1, '3min'),
  technique('Centaur Legs', 5, '10s', true),
  technique('Animal Shape', 5, '1h'),
  technique('Giant Arms', 5, '10s'),
  technique('Sphinx Knowledge', 5, '10s', true),
  technique('Daemonfinger', 5, '10s'),
  technique('Fire Breath', 5, '30s'),
  technique('Recovery', 5, 'instant'),
  technique('Wide Wings', 5, '3min'),
];

/** Core II pp. 187–194. */
const SPELLSONGS: ArtDefinition[] = [
  spellsong('Early Bird', 1, false, 'Bird, Frog', '♩1', 13, '♡1', 'Neg', 'Psychic'),
  spellsong('Ambience', 1, false, 'Frog, Insect', '♩1', 13, '♩1', 'Neg', 'Psychic'),
  spellsong('Summon Small Animals', 1, false, 'Bird, Insect', '♡1', 13, '♡1', "Can't", 'Psychic'),
  spellsong('Summon Fish', 1, false, 'Bird, Frog', '♡1', 13, '♡1', "Can't", 'Psychic'),
  spellsong('Cacophony', 1, false, 'Bird, Frog, Insect', '♩1', 13, '♩1', 'Neg', 'Psychic'),
  spellsong('Ballad', 1, false, 'Frog, Insect', '♩1', 13, '♩1', 'Neg', 'Psychic'),
  spellsong('Morale', 1, false, 'Bird, Frog, Insect', '♩1', 13, '♩1', "Can't", 'Psychic'),
  spellsong('Requiem', 1, false, 'Bird, Frog, Insect', '♩1', 13, '♡1', 'Neg', '—', '♩2♡1'),
  spellsong('Resistance', 1, false, 'Bird, Frog', '♩1', 13, '♩1', "Can't", 'Psychic'),
  spellsong('Elements', 5, false, 'Bird, Frog', '♡2', 18, '♡1', "Can't", '—'),
  spellsong('Curiosity', 5, true, '—', '♡2', 18, '♡1', 'Neg', 'Psychic', '♡4'),
  spellsong('Charming', 5, true, '—', '♡2', 18, '♡1', 'Neg', 'Psychic (Weak)', '♡4'),
  spellsong('Trance', 5, false, 'Bird, Frog, Insect', '♩2', 18, '♩1', "Can't", 'Psychic'),
  spellsong('Nostalgia', 5, false, 'Bird, Frog, Insect', '♩2', 18, '♡1', 'Neg', 'Psychic (Weak)', '♩6♡6'),
  spellsong('Break', 5, false, 'Frog, Insect', '♩2', 18, '♩1', 'Neg', 'Psychic'),
  spellsong('Love Song', 5, true, '—', '♡2', 18, '♩1', 'Neg', 'Psychic (Weak)', '♩6♡6'),
  spellsong('Lullaby', 5, true, '—', '♡2', 18, '♡1', 'Neg', 'Psychic (Weak)', '♩4♡4'),
];

/** Core II pp. 195–197. */
const FINALES: ArtDefinition[] = [
  finale('Spring Breeze', 1, '♩2', 'Half', 'Wind'),
  finale('Summer Vitality', 1, '♩1♡1', 'Optional', '—'),
  finale('Autumn Harvest', 1, '♩1♡1', 'Optional', '—'),
  finale("Winter's Chill", 1, '♩2', 'Half', 'Water/Ice'),
  finale("Beast's Roar", 5, '♩4', 'Half', 'Bludgeoning'),
  finale('Breath of the Meadows', 5, '♩2♡2', 'Optional', '—'),
  finale('Banquet of Flowers', 5, '♩2♡2', 'Optional', '—'),
  finale('Screaming Snake-pit Symphony', 5, '♩4', 'Half', 'Curse'),
];

export const ARTS: ArtDefinition[] = [...TECHNIQUES, ...SPELLSONGS, ...FINALES];

/** The class whose level gates each kind, matching the ids in `data/classes.ts`. */
export const ART_CLASS_ID: Record<ArtKind, string> = {
  technique: 'enhancer',
  spellsong: 'bard',
  finale: 'bard',
};

export function listArtsByKind(kind: ArtKind): ArtDefinition[] {
  return ARTS.filter((art) => art.kind === kind);
}

export function getArt(id: string): ArtDefinition | undefined {
  return ARTS.find((art) => art.id === id);
}

/**
 * Geomancer Domain Aspects — Magus Arts pp. 24-27 ("Aspects Data"), transcribed in
 * docs/sheet-content/33-geomancer-aspects.md.
 *
 * "Geomancer level = you may open one Aspect of a matching level" (p. 19, cross-checked
 * against `files/Аспекты Геоманта.docx`) — one slot per Geomancer class level, exactly the
 * Rider Stunt pattern (see data/stunts.ts).
 *
 * 27 Aspects, not the ~35 the roadmap guessed before this book was read: 9 per level tier
 * (1/5/10), 3 per domain (Heavenly/Earthly/Spirit) at each tier. Cost is always paid in the
 * Qi type matching the Aspect's own domain, so `domain` alone tells you which Qi counter a
 * row spends from.
 *
 * Like the spell/feat/technique catalogs this carries no effect text — the research doc
 * holds it in Russian, and the sheet's own note field is where a player writes what an
 * Aspect does.
 */
export const ASPECT_DOMAINS = ['heavenly', 'earthly', 'spirit'] as const;
export type AspectDomain = (typeof ASPECT_DOMAINS)[number];

export interface AspectDefinition {
  id: string;
  name: string;
  domain: AspectDomain;
  requiredLevel: 1 | 5 | 10;
  /** Qi cost as the book prints it: a fixed number ("2") or a player-chosen range ("1-4"). */
  cost: string;
  duration: 'instant' | '10s';
  /** Only set where the book prints a Type for the Aspect's Sum row (e.g. "Curse", "Lightning"). */
  damageType?: string;
  sourceBook: string;
}

const MAGUS_ARTS = 'Magus Arts';

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function aspect(
  name: string,
  domain: AspectDomain,
  requiredLevel: 1 | 5 | 10,
  cost: string,
  duration: 'instant' | '10s',
  damageType?: string,
): AspectDefinition {
  return { id: slug(name), name, domain, requiredLevel, cost, duration, damageType, sourceBook: MAGUS_ARTS };
}

export const ASPECTS: AspectDefinition[] = [
  // --- 1st Level Geomancer Required, p. 24 ---
  aspect('Descending Thunder', 'heavenly', 1, '1-4', 'instant', 'Lightning'),
  aspect('Deflecting Skies', 'heavenly', 1, '2', '10s'),
  aspect('Invisible Pavilion', 'heavenly', 1, '1-3', '10s'),
  aspect('Healing Earth', 'earthly', 1, '1-4', 'instant'),
  aspect('Liquidation', 'earthly', 1, '1-2', '10s'),
  aspect('Quicksand', 'earthly', 1, '1-3', '10s'),
  aspect('Refresh', 'spirit', 1, '1-4', '10s'),
  aspect('Terror', 'spirit', 1, '1-4', '10s', 'Psychic (weak)'),
  aspect('Determination', 'spirit', 1, '1-4', 'instant'),

  // --- 5th Level Geomancer Required, pp. 24-26 ---
  aspect('Karma', 'heavenly', 5, '1-4', '10s', 'Curse'),
  aspect('Wrath of Tenma', 'heavenly', 5, '1-4', '10s'),
  aspect('Guiding Winds', 'heavenly', 5, '1-4', '10s'),
  aspect('Mountain Rapture', 'earthly', 5, '2', 'instant'),
  aspect('Sand Shield', 'earthly', 5, '1-4', '10s'),
  aspect('Shifting Energies', 'earthly', 5, '3', '10s', 'Curse'),
  aspect('Sundered Soul', 'spirit', 5, '1-4', '10s', 'Curse'),
  aspect('Mana Siphon', 'spirit', 5, '1-4', '10s', 'Curse'),
  aspect('Dream Eater', 'spirit', 5, '1-4', 'instant', 'Curse'),

  // --- 10th Level Geomancer Required, pp. 26-27 ---
  aspect('Way of the North Star', 'heavenly', 10, '1-4', '10s'),
  aspect('Mana Break', 'heavenly', 10, '1-4', 'instant'),
  aspect('Stigmata', 'heavenly', 10, '1-4', '10s'),
  aspect('Footfalls', 'earthly', 10, '1-3', '10s'),
  aspect('Cursed Snake Eyes', 'earthly', 10, '1-4', '10s', 'Curse'),
  aspect('Mirage', 'earthly', 10, '1-4', '10s'),
  aspect('Afterimage', 'spirit', 10, '4', '10s'),
  aspect('Vanishment', 'spirit', 10, '1-4', '10s'),
  aspect('Mirrored Soul', 'spirit', 10, '1-4', '10s', 'Curse'),
];

export function getAspect(id: string): AspectDefinition | undefined {
  return ASPECTS.find((a) => a.id === id);
}

export function listAspectsByLevel(level: 1 | 5 | 10): AspectDefinition[] {
  return ASPECTS.filter((a) => a.requiredLevel === level);
}

export function listAspectsByDomain(domain: AspectDomain): AspectDefinition[] {
  return ASPECTS.filter((a) => a.domain === domain);
}

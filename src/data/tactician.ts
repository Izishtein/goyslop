/**
 * Tactician Stratagems and Maneuvers — Magus Arts pp. 29-41 ("Stratagem Data" pp. 36-39,
 * "Maneuvers Data" pp. 39-41), transcribed in docs/sheet-content/34-tactician-stratagems-maneuvers.md.
 *
 * "For each level of the Tactician class that a character acquires, they can select one
 * Stratagem or Maneuver from the provided lists" (p. 29) — one shared slot pool per
 * Tactician class level, not one pool each; a slot spent on a Maneuver is a slot not spent
 * on a Stratagem. Some entries require a class level higher than 1 to acquire at all
 * (`requiredLevel`), independent of Rank (a Stratagem's in-combat "how strong right now"
 * axis, which this catalog also carries but which the sheet does not simulate — like Edge
 * itself, Rank cycles round to round at the table, not something a static sheet computes).
 *
 * 35 Stratagems + 15 Maneuvers, not the "33" the roadmap's one combined guess implied
 * before this book was read (see docs/sheet-content/33-geomancer-aspects.md for the same
 * kind of miss on the Geomancer side). The Russian digest
 * (`files/Стратагемы и Маневры Тактика.docx`) independently lists 33 Stratagems — it misses
 * "Ironclad Defense I" and "Surging Offense V: Hellfire" entirely, both printed with
 * complete, unambiguous stat blocks in the book; the book wins, per the project's standing
 * rule when the two disagree.
 *
 * Like the spell/feat/technique catalogs this carries no effect text — the research doc
 * holds it in Russian, and the sheet's own note field is where a player writes what an
 * entry does.
 */
export const STRATAGEM_TYPES = ['attack', 'evasion', 'defense', 'resistance', 'inspirational'] as const;
export type StratagemType = (typeof STRATAGEM_TYPES)[number];

export interface StratagemDefinition {
  id: string;
  name: string;
  type: StratagemType;
  /** 1-5: how strong the Stratagem is, and what it takes to use it mid-combat (p. 32) —
   *  carried for reference only, the sheet does not simulate round-to-round Rank cycling. */
  rank: 1 | 2 | 3 | 4 | 5;
  /** Class level needed to acquire this Stratagem at all — independent of Rank. */
  requiredLevel: 1 | 5 | 10;
  edgeCost: number;
  /** Edge gained when the Stratagem's effect is applied to an ally; 0 for the Rank 5 /
   *  high-Edge-cost Stratagems, which gain none. */
  edgeAccumulation: number;
  sourceBook: string;
}

export interface ManeuverDefinition {
  id: string;
  name: string;
  requiredLevel: 1 | 5;
  edgeCost: number;
  /** Name of the Maneuver that must already be known, if any. */
  prerequisite?: string;
  /** The book's condition text where the Maneuver isn't simply "None (used with Minor
   *  Action)" — these are also the ones marked usable during Combat Preparation. */
  condition?: string;
  sourceBook: string;
}

const MAGUS_ARTS = 'Magus Arts';

function slug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

function stratagem(
  name: string,
  type: StratagemType,
  rank: 1 | 2 | 3 | 4 | 5,
  requiredLevel: 1 | 5 | 10,
  edgeCost: number,
  edgeAccumulation: number,
): StratagemDefinition {
  return { id: slug(name), name, type, rank, requiredLevel, edgeCost, edgeAccumulation, sourceBook: MAGUS_ARTS };
}

function maneuver(
  name: string,
  requiredLevel: 1 | 5,
  edgeCost: number,
  prerequisite?: string,
  condition?: string,
): ManeuverDefinition {
  return { id: slug(name), name, requiredLevel, edgeCost, prerequisite, condition, sourceBook: MAGUS_ARTS };
}

export const STRATAGEMS: StratagemDefinition[] = [
  // --- 1st Level Tactician Required, pp. 36-37 ---
  stratagem('Finding Flaws', 'inspirational', 1, 1, 0, 1),
  stratagem('Godspeed Stance', 'inspirational', 1, 1, 0, 1),
  stratagem('Surging Offense I', 'attack', 1, 1, 0, 1),
  stratagem('Surging Offense II: Raging Flame', 'attack', 2, 1, 0, 1),
  stratagem('Surging Offense II: Whirlwind', 'attack', 2, 1, 0, 1),
  stratagem('Flowing Fortunes I', 'evasion', 1, 1, 0, 1),
  stratagem('Flowing Fortunes II', 'evasion', 2, 1, 0, 1),
  stratagem('Ironclad Defense I', 'defense', 1, 1, 0, 1),
  stratagem('Ironclad Defense II: Solid Form', 'defense', 2, 1, 0, 1),
  stratagem('Ironclad Defense II: Iron Armor', 'defense', 2, 1, 0, 1),
  stratagem('Defiant Stand I', 'resistance', 1, 1, 0, 1),
  stratagem('Defiant Stand II', 'resistance', 2, 1, 0, 1),

  // --- 5th Level Tactician Required, pp. 37-39 ---
  stratagem('Hymn of the Brave', 'inspirational', 1, 5, 0, 1),
  stratagem('Secret Revival', 'inspirational', 2, 5, 0, 1),
  stratagem('Surging Offense III: Roaring Flame', 'attack', 3, 5, 0, 1),
  stratagem('Surging Offense III: True Aim', 'attack', 3, 5, 0, 1),
  stratagem('Surging Offense IV: Blaze', 'attack', 4, 5, 0, 2),
  stratagem('Surging Offense IV: Radiant Strikes', 'attack', 4, 5, 0, 2),
  stratagem('Flowing Fortunes III', 'evasion', 3, 5, 0, 1),
  stratagem('Flowing Fortunes IV', 'evasion', 4, 5, 0, 2),
  stratagem('Ironclad Defense III: Steel Armor', 'defense', 3, 5, 0, 1),
  stratagem('Ironclad Defense III: Armored Core', 'defense', 3, 5, 0, 1),
  stratagem('Ironclad Defense IV: Castle Armor', 'defense', 4, 5, 0, 2),
  stratagem('Ironclad Defense IV: Mirror Shield', 'defense', 4, 5, 0, 2),
  stratagem('Defiant Stand III', 'resistance', 3, 5, 0, 1),
  stratagem('Defiant Stand IV', 'resistance', 4, 5, 0, 2),

  // --- 10th Level Tactician Required, p. 39 ---
  stratagem('Great Challenge', 'inspirational', 2, 10, 1, 0),
  stratagem('Injury Assessment', 'inspirational', 2, 10, 1, 0),
  stratagem('Surging Offense V: Hellfire', 'attack', 5, 10, 5, 0),
  stratagem('Surging Offense V: Typhoon', 'attack', 5, 10, 5, 0),
  stratagem('Flowing Fortunes V', 'evasion', 5, 10, 5, 0),
  stratagem('Ironclad Defense V: Steel Citadel', 'defense', 5, 10, 5, 0),
  stratagem('Ironclad Defense V: Giant Wall', 'defense', 5, 10, 5, 0),
  stratagem('Defiant Stand V: Overflowing Life', 'resistance', 5, 10, 5, 0),
  stratagem('Defiant Stand V: Aetheric Spring', 'resistance', 5, 10, 5, 0),
];

export const MANEUVERS: ManeuverDefinition[] = [
  // --- 1st Level Tactician Required, p. 40 ---
  maneuver('Strategic Ingenuity', 1, 0, undefined, 'When making an Initiative check'),
  maneuver('Unexpected Blow I', 1, 3),
  maneuver('Careful Guard I', 1, 3),
  maneuver('Resistance I', 1, 3),
  maneuver('Concentration I', 1, 3),
  maneuver('Foresight I', 1, 3),
  maneuver('Efficiency I', 1, 3),

  // --- 5th Level Tactician Required, pp. 40-41 ---
  maneuver('Careful Guard II', 5, 5, 'Careful Guard I'),
  maneuver('Resistance II', 5, 5, 'Resistance I'),
  maneuver('Concentration II', 5, 5, 'Concentration I'),
  maneuver('Efficiency II', 5, 5, 'Efficiency I'),
  maneuver('Foresight II', 5, 5, 'Foresight I'),
  maneuver('Unexpected Blow II', 5, 5, 'Unexpected Blow I'),
  maneuver('Sweeping Victory', 5, 0, undefined, 'When a Tactician reduces an enemy to 0 HP or less'),
  maneuver('Solid Line', 5, 0, undefined, 'When a Tactician restores 30 or more points of HP to an ally'),
];

export function getStratagem(id: string): StratagemDefinition | undefined {
  return STRATAGEMS.find((s) => s.id === id);
}

export function listStratagemsByLevel(level: 1 | 5 | 10): StratagemDefinition[] {
  return STRATAGEMS.filter((s) => s.requiredLevel === level);
}

export function getManeuver(id: string): ManeuverDefinition | undefined {
  return MANEUVERS.find((m) => m.id === id);
}

export function listManeuversByLevel(level: 1 | 5): ManeuverDefinition[] {
  return MANEUVERS.filter((m) => m.requiredLevel === level);
}

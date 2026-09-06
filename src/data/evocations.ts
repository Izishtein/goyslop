/**
 * Evocations — Core Rulebook III pp. 190–198, transcribed in
 * docs/sheet-content/14-evocations.md. Magus Arts pp. 181–184 reprints the same 26 entries
 * unchanged, so there is nothing to merge from it.
 *
 * The Alchemist's system is not magic and does not fit the spell table: the cost is
 * Material Cards (five colours, four ranks) instead of MP, and the strength of every
 * Evocation depends on the rank of the card spent at the table, not on anything stored on
 * the sheet. So the catalog carries what the book prints above the effect — required class
 * level, cards, and whether it can be used as a Minor Action or during Combat Preparation.
 *
 * Effect text stays out, exactly as in the spell and arts catalogs: the research docs hold
 * it in Russian only, and each row on the sheet has its own free-text note.
 */

export const MATERIAL_COLORS = ['Red', 'Green', 'Black', 'White', 'Gold'] as const;
export type MaterialColor = (typeof MATERIAL_COLORS)[number];

/** Card ranks and their prices in gamels (Magus Arts p. 179). Same letters as equipment
 *  ranks, a different thing entirely — hence its own list. */
export const CARD_RANKS = ['B', 'A', 'S', 'SS'] as const;
export type CardRank = (typeof CARD_RANKS)[number];
export const CARD_PRICES: Record<CardRank, number> = { B: 20, A: 200, S: 2000, SS: 20000 };

export interface CardCost {
  color: MaterialColor;
  count: number;
}

export interface EvocationDefinition {
  id: string;
  name: string;
  /** Alchemist level the book requires: 1, 5 or 10. */
  requiredLevel: number;
  /** Cards consumed per use; two entries for the two that mix colours. */
  cards: CardCost[];
  /** Printed ▶▶ — usable as a Minor Action. */
  minorAction: boolean;
  /** Printed △ — usable during Combat Preparation. */
  preparation: boolean;
  sourceBook: string;
}

const CORE3 = 'Core Rulebook III';

function slug(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function evocation(
  requiredLevel: number,
  name: string,
  cards: CardCost[],
  markers: { minorAction?: boolean; preparation?: boolean } = {},
): EvocationDefinition {
  return {
    id: slug(name),
    name,
    requiredLevel,
    cards,
    minorAction: markers.minorAction ?? false,
    preparation: markers.preparation ?? false,
    sourceBook: CORE3,
  };
}

const card = (color: MaterialColor, count = 1): CardCost => ({ color, count });

/** Shorthand for the markers the book prints next to a name. */
const MINOR = { minorAction: true };
const MINOR_PREP = { minorAction: true, preparation: true };
const PREP = { preparation: true };

export const EVOCATIONS: EvocationDefinition[] = [
  // --- 1st Level Alchemist Required ---
  evocation(1, 'Instant Weapon', [card('White')], MINOR),
  evocation(1, 'Vorpal Weapon', [card('Red')], MINOR),
  evocation(1, 'Crush Fang', [card('Red')], MINOR_PREP),
  evocation(1, 'Critical Ray', [card('Gold')], MINOR),
  evocation(1, 'Barkmail', [card('Green')], MINOR_PREP),
  evocation(1, 'Paralyze Mist', [card('Green')], MINOR),
  evocation(1, 'Poison Needle', [card('Black')], MINOR),
  evocation(1, 'Mirage Daze', [card('White')], MINOR_PREP),
  evocation(1, 'Heal Spray', [card('Green', 2)], MINOR),

  // --- 5th Level Alchemist Required ---
  evocation(5, 'Armorust', [card('Black', 2)], MINOR),
  evocation(5, 'Unlock Needle', [card('Black', 2)], MINOR),
  evocation(5, 'Initiative Boost', [card('Red', 2)], PREP),
  evocation(5, 'Encyclopedia', [card('White', 2)], MINOR_PREP),
  evocation(5, 'Dispel Needle', [card('Black')], MINOR),
  evocation(5, 'Bind Ability', [card('White', 2)], MINOR_PREP),
  evocation(5, 'Vivid Liquid', [card('Green', 2)], MINOR),
  evocation(5, 'Mana Sprout', [card('Gold')], MINOR_PREP),
  evocation(5, 'Manadown', [card('Gold')], MINOR_PREP),
  evocation(5, 'Lean Force', [card('Red', 2)], MINOR),

  // --- 10th Level Alchemist Required. The five "Fields" are Major Action only. ---
  evocation(10, 'Clay Field', [card('Black', 3)]),
  evocation(10, 'Combine Materials', [card('White'), card('Black')], MINOR_PREP),
  evocation(10, 'Slash Field', [card('White', 3)]),
  evocation(10, 'Deluxe Materials', [card('Red'), card('Green')], MINOR_PREP),
  evocation(10, 'Barrier Field', [card('Gold', 3)]),
  evocation(10, 'Flame Field', [card('Red', 3)]),
  evocation(10, 'Rest Field', [card('Green', 3)]),
];

/** The class that owns the system; the sheet shows the section only for its holders. */
export const EVOCATION_CLASS_ID = 'alchemist';

/** "Green ×2", "White ×1 + Black ×1" — the cost as the sheet and the picker print it. */
export function formatCards(cards: CardCost[]): string {
  return cards.map((cost) => `${cost.color} ×${cost.count}`).join(' + ');
}

export function listEvocations(): EvocationDefinition[] {
  return [...EVOCATIONS].sort((a, b) => a.requiredLevel - b.requiredLevel || a.name.localeCompare(b.name));
}

export function getEvocation(id: string): EvocationDefinition | undefined {
  return EVOCATIONS.find((entry) => entry.id === id);
}

/** Key used by the stored card stock: colour and rank pinned together. */
export function cardKey(color: MaterialColor, rank: CardRank): string {
  return `${color}-${rank}`;
}

/** What a stock of cards is worth in gamels — the Alchemist's ammunition line. */
export function cardStockValue(stock: Record<string, number>): number {
  let total = 0;
  for (const color of MATERIAL_COLORS) {
    for (const rank of CARD_RANKS) {
      total += (stock[cardKey(color, rank)] ?? 0) * CARD_PRICES[rank];
    }
  }
  return total;
}

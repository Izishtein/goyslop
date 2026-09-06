import { describe, expect, it } from 'vitest';
import { CLASSES } from './classes';
import {
  cardKey,
  cardStockValue,
  EVOCATION_CLASS_ID,
  EVOCATIONS,
  formatCards,
  getEvocation,
  listEvocations,
} from './evocations';

describe('evocation catalog', () => {
  it('holds the counts the book prints per tier', () => {
    const byLevel: Record<number, number> = {};
    for (const entry of EVOCATIONS) byLevel[entry.requiredLevel] = (byLevel[entry.requiredLevel] ?? 0) + 1;
    // Core III pp. 190-198: three tiers, 26 Evocations in total.
    expect(byLevel).toEqual({ 1: 9, 5: 10, 10: 7 });
    expect(EVOCATIONS).toHaveLength(26);
  });

  it('has unique ids', () => {
    expect(new Set(EVOCATIONS.map((entry) => entry.id)).size).toBe(EVOCATIONS.length);
  });

  it('gives every Evocation at least one card to spend', () => {
    for (const entry of EVOCATIONS) {
      expect(entry.cards.length).toBeGreaterThan(0);
      for (const cost of entry.cards) expect(cost.count).toBeGreaterThan(0);
    }
  });

  it('leaves the five Fields on a Major Action, as printed', () => {
    const fields = EVOCATIONS.filter((entry) => entry.name.endsWith('Field'));
    expect(fields).toHaveLength(5);
    for (const field of fields) {
      expect(field.minorAction).toBe(false);
      expect(field.preparation).toBe(false);
    }
  });

  it('names the owning class exactly as the class catalog does', () => {
    expect(CLASSES.map((classDef) => classDef.id)).toContain(EVOCATION_CLASS_ID);
  });

  it('sorts by required level', () => {
    const levels = listEvocations().map((entry) => entry.requiredLevel);
    expect(levels).toEqual([...levels].sort((a, b) => a - b));
  });

  it('prints a card cost the way the book writes it', () => {
    expect(formatCards(getEvocation('heal-spray')!.cards)).toBe('Green ×2');
    expect(formatCards(getEvocation('combine-materials')!.cards)).toBe('White ×1 + Black ×1');
  });

  it('prices a stock of cards', () => {
    // One B card (20 g) plus two SS cards (20 000 g each).
    const stock = { [cardKey('Red', 'B')]: 1, [cardKey('Gold', 'SS')]: 2 };
    expect(cardStockValue(stock)).toBe(40_020);
    expect(cardStockValue({})).toBe(0);
  });
});

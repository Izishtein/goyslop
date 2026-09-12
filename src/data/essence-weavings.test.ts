import { describe, expect, it } from 'vitest';
import { ESSENCE_WEAVINGS, getEssenceWeaving, listEssenceWeavingsByLevel } from './essence-weavings';

describe('essence weaving catalog', () => {
  it('holds the count the book and the Russian digest agree on (Abyss Breaker pp. 29-35)', () => {
    expect(ESSENCE_WEAVINGS).toHaveLength(28);
    expect(listEssenceWeavingsByLevel(1)).toHaveLength(11);
    expect(listEssenceWeavingsByLevel(5)).toHaveLength(11);
    expect(listEssenceWeavingsByLevel(10)).toHaveLength(6);
  });

  it('has unique ids', () => {
    expect(new Set(ESSENCE_WEAVINGS.map((w) => w.id)).size).toBe(ESSENCE_WEAVINGS.length);
  });

  it('points every prerequisite (including "or" chains) at Essence Weavings that actually exist in the catalog', () => {
    const names = new Set(ESSENCE_WEAVINGS.map((w) => w.name));
    for (const w of ESSENCE_WEAVINGS) {
      if (!w.prerequisite) continue;
      for (const part of w.prerequisite.split(' or ')) expect(names).toContain(part);
    }
  });

  it('never gives a Passive Weaving a Cost other than "-"', () => {
    for (const w of ESSENCE_WEAVINGS) {
      if (w.type === 'passive') expect(w.cost).toBe('-');
    }
  });

  it('only marks Minor Action Weavings as usable during Combat Preparation', () => {
    for (const w of ESSENCE_WEAVINGS) {
      if (w.usableInPreparation) expect(w.type).toBe('minorAction');
    }
  });

  it('looks a weaving up by id', () => {
    expect(getEssenceWeaving('spectral-throw')).toMatchObject({ type: 'majorAction', requiredLevel: 1, cost: '2d(6)' });
    expect(getEssenceWeaving('dual-weaving')).toMatchObject({ prerequisite: 'Spectral Throw', requiredLevel: 5 });
  });
});

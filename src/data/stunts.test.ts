import { describe, expect, it } from 'vitest';
import { getStunt, listStuntsByLevel, STUNTS } from './stunts';

describe('stunt catalog', () => {
  it('holds the count the book and the Russian digest agree on (Core III pp. 180-189)', () => {
    expect(STUNTS).toHaveLength(31);
    expect(listStuntsByLevel(1)).toHaveLength(12);
    expect(listStuntsByLevel(5)).toHaveLength(9);
    expect(listStuntsByLevel(10)).toHaveLength(10);
  });

  it('has unique ids', () => {
    expect(new Set(STUNTS.map((s) => s.id)).size).toBe(STUNTS.length);
  });

  it('gives every Stunt at least one compatible mount category', () => {
    for (const s of STUNTS) expect(s.compatible.length).toBeGreaterThan(0);
  });

  it('points every prerequisite at a Stunt that actually exists in the catalog', () => {
    const names = new Set(STUNTS.map((s) => s.name));
    for (const s of STUNTS) {
      if (s.prerequisite) expect(names).toContain(s.prerequisite);
    }
  });

  it('looks a stunt up by id', () => {
    expect(getStunt('charge')).toMatchObject({ type: 'majorAction', requiredLevel: 1 });
    expect(getStunt('overdrive')).toMatchObject({ prerequisite: 'Limit Drive', compatible: ['magitech'] });
  });
});

import { describe, expect, it } from 'vitest';
import { ASPECT_DOMAINS, ASPECTS, getAspect, listAspectsByDomain, listAspectsByLevel } from './aspects';

describe('aspect catalog', () => {
  it('holds 27, not the ~35 the roadmap guessed before Magus Arts was read (pp. 24-27)', () => {
    expect(ASPECTS).toHaveLength(27);
    expect(listAspectsByLevel(1)).toHaveLength(9);
    expect(listAspectsByLevel(5)).toHaveLength(9);
    expect(listAspectsByLevel(10)).toHaveLength(9);
  });

  it('gives every level exactly 3 Aspects per domain', () => {
    for (const level of [1, 5, 10] as const) {
      for (const domain of ASPECT_DOMAINS) {
        expect(listAspectsByLevel(level).filter((a) => a.domain === domain)).toHaveLength(3);
      }
    }
  });

  it('has unique ids', () => {
    expect(new Set(ASPECTS.map((a) => a.id)).size).toBe(ASPECTS.length);
  });

  it('splits evenly across the three domains overall', () => {
    for (const domain of ASPECT_DOMAINS) {
      expect(listAspectsByDomain(domain)).toHaveLength(9);
    }
  });

  it('looks an aspect up by id', () => {
    expect(getAspect('descending-thunder')).toMatchObject({ domain: 'heavenly', requiredLevel: 1, damageType: 'Lightning' });
    expect(getAspect('mirrored-soul')).toMatchObject({ domain: 'spirit', requiredLevel: 10 });
  });
});

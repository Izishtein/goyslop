import { describe, expect, it } from 'vitest';
import { RACES } from '../races';
import { getVagrantType, listVagrantTypesByCategory, VAGRANT_TYPES } from './types';

describe('Vagrant Category/Type templates', () => {
  it('holds the 17 Types the book prints across 4 Categories', () => {
    expect(VAGRANT_TYPES).toHaveLength(17);
  });

  it('has unique ids', () => {
    expect(new Set(VAGRANT_TYPES.map((t) => t.id)).size).toBe(VAGRANT_TYPES.length);
  });

  it('splits into the 4 Categories with the book\'s own counts (3/3/6/5)', () => {
    expect(listVagrantTypesByCategory('warrior')).toHaveLength(3);
    expect(listVagrantTypesByCategory('spy')).toHaveLength(3);
    expect(listVagrantTypesByCategory('remoteSupport')).toHaveLength(6);
    expect(listVagrantTypesByCategory('magicWarrior')).toHaveLength(5);
  });

  it('every selectable race id matches an entry in the race catalog', () => {
    const raceIds = new Set(RACES.map((r) => r.id));
    for (const type of VAGRANT_TYPES) {
      expect(type.selectableRaces.length).toBeGreaterThan(0);
      for (const race of type.selectableRaces) {
        expect(raceIds.has(race.raceId)).toBe(true);
      }
    }
  });

  it('looks up by id', () => {
    expect(getVagrantType('hunter')?.name).toBe('Hunter');
    expect(getVagrantType('nonexistent')).toBeUndefined();
  });
});

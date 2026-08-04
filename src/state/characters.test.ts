import { createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { charactersAtom } from './characters';

beforeEach(() => {
  localStorage.clear();
});

const OLD_SHAPE_CHARACTER = {
  schemaVersion: 1,
  id: 'legacy-1',
  name: 'Legacy Hero',
  raceId: 'human',
  background: 'Artificer',
  abilities: {
    DEX: { base: 8, correction: 0, growth: 0, itemBonus: 0 },
    AGI: { base: 8, correction: 0, growth: 0, itemBonus: 0 },
    STR: { base: 4, correction: 0, growth: 0, itemBonus: 0 },
    VIT: { base: 4, correction: 0, growth: 0, itemBonus: 0 },
    INT: { base: 9, correction: 0, growth: 0, itemBonus: 0 },
    SPR: { base: 9, correction: 0, growth: 0, itemBonus: 0 },
  },
  classes: [{ classId: 'artificer', level: 1 }],
  hp: { current: 7 },
  mp: { current: 12 },
  statusEffects: [],
  // equipment / currency / combatFeats intentionally absent, as saved before those fields existed.
};

/** atomWithStorage only reads localStorage on mount (onMount), so subscribing mirrors
 * what actually happens when a component calls useAtom(charactersAtom) in the app. */
function mountAndGet(store: ReturnType<typeof createStore>) {
  const unsub = store.sub(charactersAtom, () => {});
  const value = store.get(charactersAtom);
  unsub();
  return value;
}

describe('charactersAtom storage migration', () => {
  it('backfills equipment/currency/combatFeats for characters saved before those fields existed', () => {
    localStorage.setItem('sw25.characters', JSON.stringify([OLD_SHAPE_CHARACTER]));

    const store = createStore();
    const [character] = mountAndGet(store);

    expect(character.equipment).toEqual({ weapons: [], armor: [], shield: null, accessories: [] });
    expect(character.currency).toEqual({ cash: 0, savings: 0, debt: 0 });
    expect(character.combatFeats).toEqual([]);
    expect(character.name).toBe('Legacy Hero');
  });

  it('drops entries that fail validation entirely instead of crashing', () => {
    localStorage.setItem('sw25.characters', JSON.stringify([OLD_SHAPE_CHARACTER, { not: 'a character' }]));
    const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

    const store = createStore();
    const characters = mountAndGet(store);

    expect(characters).toHaveLength(1);
    expect(characters[0].id).toBe('legacy-1');
    expect(warnSpy).toHaveBeenCalled();
    warnSpy.mockRestore();
  });
});

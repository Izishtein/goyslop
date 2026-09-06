import { createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EMPTY_INVENTORY } from '../types/character';
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

    expect(character.equipment).toEqual({ weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY });
    expect(character.currency).toEqual({ cash: 0, savings: 0, debt: 0, spendingLog: '' });
    expect(character.combatFeats).toEqual([]);
    expect(character.name).toBe('Legacy Hero');
  });

  it('keeps a character whose sheet has unnamed rows waiting to be filled in', () => {
    // Every "Add ..." button on the sheet creates a blank row that the player names
    // afterwards. Rejecting those cost the whole character on the next read.
    localStorage.setItem(
      'sw25.characters',
      JSON.stringify([
        {
          ...OLD_SHAPE_CHARACTER,
          equipment: {
            weapons: [{ id: 'w1', name: '', stance: '1H', minStr: 0, accuracyBonus: 0, power: 1, criticalValue: 10, extraDamageBonus: 0, rank: 'B' }],
            armor: [],
            shield: null,
            accessories: [{ id: 'a1', name: '' }],
          },
          combatFeats: [{ id: 'f1', name: '', category: 'passive' }],
          spells: [{ id: 's1', name: '', school: 'Truespeech Magic', circle: 1, mp: 0 }],
        },
      ]),
    );

    const store = createStore();
    const characters = mountAndGet(store);

    expect(characters).toHaveLength(1);
    expect(characters[0].equipment.weapons).toHaveLength(1);
    expect(characters[0].spells).toHaveLength(1);
  });

  it('keeps a character who knows a spell above circle 10', () => {
    // Nature Magic, Summoning Arts and Abyssal Magic run to circle 15. The schema capped
    // the circle at 10, so saving a Druid's 15th-circle spell and reloading dropped the
    // whole character — the catalog could hand the sheet a row its own schema rejected.
    localStorage.setItem(
      'sw25.characters',
      JSON.stringify([
        {
          ...OLD_SHAPE_CHARACTER,
          spells: [{ id: 's1', name: 'Natural Haven', school: 'Nature Magic', circle: 15, mp: 30 }],
        },
      ]),
    );

    const store = createStore();
    const characters = mountAndGet(store);

    expect(characters).toHaveLength(1);
    expect(characters[0].spells[0].circle).toBe(15);
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

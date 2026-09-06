import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import './i18n';
import App from './App';
import { activeCharacterIdAtom, charactersAtom, STORAGE_ERROR_EVENT } from './state/characters';
import { EMPTY_INVENTORY, type Character, EMPTY_PERFORMANCE } from './types/character';

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(id: string, name: string): Character {
  return {
    schemaVersion: 1,
    id,
    name,
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
    equipment: { weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
    currency: { cash: 1200, savings: 0, debt: 0, spendingLog: '' },
    combatFeats: [],
    experience: { total: 0, spent: 0 },
    spells: [],
    arts: [],
    evocations: [],
    materialCards: {},
    mounts: [],
    performance: EMPTY_PERFORMANCE,
    growthLog: [],
    reputation: 0,
    profile: { gender: '', age: '', avatar: '' },
    notes: { story: '', goals: '', gm: '' },
    connections: [],
  };
}

function renderApp(characters: Character[]) {
  const store = createStore();
  store.set(charactersAtom, characters);
  store.set(activeCharacterIdAtom, characters[0]?.id ?? null);
  render(
    <Provider store={store}>
      <App />
    </Provider>,
  );
  return store;
}

describe('character roster', () => {
  it('deletes a character only after the delete is confirmed', async () => {
    const user = userEvent.setup();
    const store = renderApp([makeCharacter('char-1', 'Doomed Hero')]);

    await user.click(screen.getByRole('button', { name: /^delete$/i }));

    // First click only arms the action.
    expect(store.get(charactersAtom)).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: /delete doomed hero\?/i }));

    expect(store.get(charactersAtom)).toHaveLength(0);
    expect(store.get(activeCharacterIdAtom)).toBeNull();
  });

  it('moves to another character instead of the creation form when the active one is deleted', async () => {
    // A null active id is how "New character" opens the form, so reusing it after a delete
    // dropped the player into that form with a full roster still sitting above it.
    const user = userEvent.setup();
    const store = renderApp([makeCharacter('char-1', 'Doomed Hero'), makeCharacter('char-2', 'Second Hero')]);

    await user.click(screen.getAllByRole('button', { name: /^delete$/i })[0]);
    await user.click(screen.getByRole('button', { name: /delete doomed hero\?/i }));

    expect(store.get(activeCharacterIdAtom)).toBe('char-2');
    expect(screen.queryByRole('heading', { name: 'Create character' })).not.toBeInTheDocument();
  });

  it('cancelling leaves the character in place', async () => {
    const user = userEvent.setup();
    const store = renderApp([makeCharacter('char-1', 'Safe Hero')]);

    await user.click(screen.getByRole('button', { name: /^delete$/i }));
    await user.click(screen.getByRole('button', { name: /^cancel$/i }));

    expect(screen.queryByRole('button', { name: /delete safe hero\?/i })).not.toBeInTheDocument();
    expect(store.get(charactersAtom)).toHaveLength(1);
    expect(store.get(activeCharacterIdAtom)).toBe('char-1');
  });
});

describe('storage failures', () => {
  it('says so when the browser refuses to save, instead of losing the change quietly', () => {
    renderApp([makeCharacter('char-1', 'Test Hero')]);

    expect(screen.queryByRole('alert')).toBeNull();

    // What the storage layer dispatches when localStorage throws (quota, or blocked).
    act(() => {
      window.dispatchEvent(new CustomEvent(STORAGE_ERROR_EVENT));
    });

    expect(screen.getByRole('alert')).toHaveTextContent(/could not be saved/i);
  });

  it('reports a refused write from an ordinary edit, both stores included', async () => {
    const user = userEvent.setup();
    const store = renderApp([makeCharacter('char-1', 'Doomed Hero'), makeCharacter('char-2', 'Second Hero')]);

    // Break storage only after the roster is up, the way a quota is reached mid-session.
    const setItem = Storage.prototype.setItem;
    Storage.prototype.setItem = () => {
      throw new DOMException('quota', 'QuotaExceededError');
    };
    try {
      await user.click(screen.getAllByRole('button', { name: /^delete$/i })[0]);
      await user.click(screen.getByRole('button', { name: /delete doomed hero?/i }));

      // Deleting writes the roster and the active id; neither may throw, and the player
      // is told the change did not reach disk.
      expect(store.get(charactersAtom)).toHaveLength(1);
      expect(store.get(activeCharacterIdAtom)).toBe('char-2');
      expect(screen.getByRole('alert')).toHaveTextContent(/could not be saved/i);
    } finally {
      Storage.prototype.setItem = setItem;
    }
  });
});

describe('reference screen', () => {
  it('replaces the sheet and gives the same character back on the way out', async () => {
    const user = userEvent.setup();
    const store = renderApp([makeCharacter('char-1', 'Doomed Hero'), makeCharacter('char-2', 'Second Hero')]);

    await user.click(screen.getByRole('button', { name: 'Reference' }));

    expect(screen.getByRole('heading', { name: 'Reference' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Ability scores' })).toBeNull();
    // The roster is the way back to a character, so it stays put.
    expect(screen.getByRole('button', { name: 'Doomed Hero' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Back to the sheet' }));

    expect(screen.getByRole('heading', { name: 'Ability scores' })).toBeInTheDocument();
    expect(store.get(activeCharacterIdAtom)).toBe('char-1');
  });

  it('closes when a character is picked, so the click is not swallowed', async () => {
    const user = userEvent.setup();
    const store = renderApp([makeCharacter('char-1', 'First Hero'), makeCharacter('char-2', 'Second Hero')]);

    await user.click(screen.getByRole('button', { name: 'Reference' }));
    await user.click(screen.getByRole('button', { name: 'Second Hero' }));

    expect(store.get(activeCharacterIdAtom)).toBe('char-2');
    expect(screen.queryByRole('heading', { name: 'Reference' })).toBeNull();
  });

  it('hides the creation form and brings it back on an empty roster', async () => {
    // The other direction of the activeId === null rule: with nobody in the roster the
    // form is what the reference has to hide, and restore.
    const user = userEvent.setup();
    renderApp([]);

    expect(screen.getByRole('heading', { name: 'Create character' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Reference' }));
    expect(screen.queryByRole('heading', { name: 'Create character' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Back to the sheet' }));
    expect(screen.getByRole('heading', { name: 'Create character' })).toBeInTheDocument();
  });
});

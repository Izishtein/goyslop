import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import './i18n';
import App from './App';
import { activeCharacterIdAtom, charactersAtom } from './state/characters';
import type { Character } from './types/character';

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
    equipment: { weapons: [], armor: [], shield: null, accessories: [] },
    currency: { cash: 1200, savings: 0, debt: 0 },
    combatFeats: [],
    experience: { total: 0, spent: 0 },
    spells: [],
    growthLog: [],
    reputation: 0,
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

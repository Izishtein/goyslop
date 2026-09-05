import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import type { Character } from '../../types/character';
import { ImportCharacterButton } from './ImportCharacterButton';

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(): Character {
  return {
    schemaVersion: 1,
    id: 'imported-1',
    name: 'Imported Hero',
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
  };
}

function renderImport() {
  const store = createStore();
  render(
    <Provider store={store}>
      <ImportCharacterButton />
    </Provider>,
  );
  return store;
}

function jsonFile(content: string) {
  return new File([content], 'character.sw25.json', { type: 'application/json' });
}

describe('ImportCharacterButton', () => {
  it('adds a valid imported character to the store and makes it active', async () => {
    const user = userEvent.setup();
    const store = renderImport();
    const character = makeCharacter();

    const input = screen.getByLabelText('Import JSON', { selector: 'input' });
    await user.upload(input, jsonFile(JSON.stringify(character)));

    expect(store.get(charactersAtom)).toEqual([character]);
    expect(store.get(activeCharacterIdAtom)).toBe('imported-1');
  });

  it('shows an error and does not touch the store for invalid JSON', async () => {
    const user = userEvent.setup();
    const store = renderImport();

    const input = screen.getByLabelText('Import JSON', { selector: 'input' });
    await user.upload(input, jsonFile('not valid json'));

    expect(await screen.findByRole('alert')).toHaveTextContent(/valid JSON/i);
    expect(store.get(charactersAtom)).toEqual([]);
  });
});

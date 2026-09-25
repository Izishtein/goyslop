import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { QuickStartView } from './QuickStartView';

beforeEach(() => {
  localStorage.clear();
});

function renderQuickStart(onClose = vi.fn()) {
  const store = createStore();
  render(
    <Provider store={store}>
      <QuickStartView onClose={onClose} />
    </Provider>,
  );
  return { store, onClose };
}

describe('QuickStartView', () => {
  it('lists all seven pregenerated characters', () => {
    renderQuickStart();
    expect(screen.getAllByRole('button', { name: 'Take this character' })).toHaveLength(7);
  });

  it('adds a fresh copy of the picked pregen to the roster and makes it active', async () => {
    const user = userEvent.setup();
    const { store, onClose } = renderQuickStart();

    const takeButtons = screen.getAllByRole('button', { name: 'Take this character' });
    await user.click(takeButtons[0]);

    const characters = store.get(charactersAtom);
    expect(characters).toHaveLength(1);
    expect(store.get(activeCharacterIdAtom)).toBe(characters[0].id);
    expect(onClose).toHaveBeenCalledOnce();
  });

  it('gives each take a new id, so the same archetype can be taken twice', async () => {
    const user = userEvent.setup();
    const { store } = renderQuickStart();

    const takeButtons = screen.getAllByRole('button', { name: 'Take this character' });
    await user.click(takeButtons[0]);
    await user.click(takeButtons[0]);

    const characters = store.get(charactersAtom);
    expect(characters).toHaveLength(2);
    expect(characters[0].id).not.toBe(characters[1].id);
    expect(characters[0].name).toBe(characters[1].name);
  });
});

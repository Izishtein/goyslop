import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterCreationForm } from './CharacterCreationForm';

beforeEach(() => {
  localStorage.clear();
});

function renderForm() {
  const store = createStore();
  const onCreated = vi.fn();
  render(
    <Provider store={store}>
      <CharacterCreationForm onCreated={onCreated} />
    </Provider>,
  );
  return { store, onCreated };
}

describe('CharacterCreationForm', () => {
  it('recomputes ability totals and HP/MP preview as inputs change, then creates a character on submit', async () => {
    const user = userEvent.setup();
    const { store, onCreated } = renderForm();

    await user.type(screen.getByLabelText(/^Name$/i), 'Test Hero');
    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:0');

    // Human Artificer background: base Skill/Body/Mind = 8/4/9 -> DEX/AGI base 8, STR/VIT base 4, INT/SPR base 9.
    expect(screen.getByLabelText('DEX Base')).toHaveTextContent('8');
    expect(screen.getByLabelText('DEX Total')).toHaveTextContent('8'); // no correction yet
    expect(screen.getByText(/HP max: 7/)).toBeInTheDocument();
    expect(screen.getByText(/MP max: 12/)).toBeInTheDocument();

    const dexCorrection = screen.getByLabelText('DEX Correction');
    await user.clear(dexCorrection);
    await user.type(dexCorrection, '3');
    expect(screen.getByLabelText('DEX Total')).toHaveTextContent('11');

    await user.click(screen.getByRole('button', { name: /create character/i }));

    expect(onCreated).toHaveBeenCalledTimes(1);
    const characters = store.get(charactersAtom);
    expect(characters).toHaveLength(1);
    expect(characters[0].name).toBe('Test Hero');
    expect(characters[0].abilities.DEX).toEqual({ base: 8, correction: 3, growth: 0, itemBonus: 0 });
    expect(characters[0].hp.current).toBe(7);
    expect(characters[0].mp.current).toBe(12);
    expect(characters[0].classes).toEqual([{ classId: 'artificer', level: 1 }]);
  });

  it('requires a starting-class choice when the background offers a choice of classes', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^Name$/i), 'Choice Hero');
    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'leprechaun');
    // Leprechaun additional background "Magician": Sorcerer or Conjurer (player picks one).
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'additional:4');

    expect(screen.getByLabelText(/^Starting class$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /create character/i })).toBeDisabled();

    await user.selectOptions(screen.getByLabelText(/^Starting class$/i), 'sorcerer');
    expect(screen.getByRole('button', { name: /create character/i })).toBeEnabled();
  });
});

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
    // The Artificer row grants 2000 XP; its starting class comes free on top of that.
    expect(characters[0].experience).toEqual({ total: 2000, spent: 0 });
  });

  it('flags a correction the racial dice cannot roll, without blocking submit', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.type(screen.getByLabelText(/^Name$/i), 'Typo Hero');
    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:0');

    // Human corrections are 2d6, so 2..12 are rollable and 13 is not.
    const dexCorrection = screen.getByLabelText('DEX Correction');
    await user.clear(dexCorrection);
    await user.type(dexCorrection, '13');

    expect(dexCorrection).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByText(/DEX — 2d6 \(2–12\)/)).toBeInTheDocument();
    // Advisory only: a house rule may legitimately land outside the die.
    expect(screen.getByRole('button', { name: /create character/i })).toBeEnabled();

    await user.clear(dexCorrection);
    await user.type(dexCorrection, '12');

    expect(dexCorrection).not.toHaveAttribute('aria-invalid');
    expect(screen.queryByText(/2d6 \(2–12\)/)).not.toBeInTheDocument();
  });

  it('lets the player enter Skill/Body/Mind for a background that rolls its own', async () => {
    const user = userEvent.setup();
    const { store } = renderForm();

    await user.type(screen.getByLabelText(/^Name$/i), 'Rolled Hero');
    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    // Human "Adventurer" (GM permission): the book prints 2d/2d/2d instead of fixed values.
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:7');

    await user.clear(screen.getByLabelText(/^Skill$/i));
    await user.type(screen.getByLabelText(/^Skill$/i), '9');
    await user.clear(screen.getByLabelText(/^Body$/i));
    await user.type(screen.getByLabelText(/^Body$/i), '6');
    await user.clear(screen.getByLabelText(/^Mind$/i));
    await user.type(screen.getByLabelText(/^Mind$/i), '7');

    expect(screen.getByLabelText('DEX Base')).toHaveTextContent('9'); // DEX/AGI from Skill
    expect(screen.getByLabelText('VIT Base')).toHaveTextContent('6'); // STR/VIT from Body
    expect(screen.getByLabelText('SPR Base')).toHaveTextContent('7'); // INT/SPR from Mind

    await user.click(screen.getByRole('button', { name: /create character/i }));
    expect(store.get(charactersAtom)[0].abilities.DEX.base).toBe(9);
  });

  it('previews HP at Adventurer Level 0 for a background that grants no starting class', async () => {
    const user = userEvent.setup();
    const { store } = renderForm();

    await user.type(screen.getByLabelText(/^Name$/i), 'Classless Hero');
    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    // Human "Normal": 7/7/7, starting class None -> Adventurer Level 0, so HP = 0 * 3 + VIT.
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:3');

    expect(screen.getByText('HP max: 7')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /create character/i }));
    const created = store.get(charactersAtom)[0];
    expect(created.classes).toEqual([]);
    // Stored current HP must not exceed the max the sheet recomputes from the same formula.
    expect(created.hp.current).toBe(7);
  });

  it('hides the Skill/Body/Mind inputs for backgrounds that list fixed values', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:0');

    expect(screen.queryByLabelText(/^Skill$/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText('DEX Base')).toHaveTextContent('8');
  });

  it('groups background options by source table and marks the GM-only row', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');

    const groups = screen.getByLabelText(/^Background$/i).querySelectorAll('optgroup');
    expect([...groups].map((group) => group.label)).toEqual([
      'Primary table',
      'Additional table (Core II)',
      'Supplemental table (Battle Mastery)',
    ]);
    // Both tables have a "2-4" row, so the grouping is what tells them apart.
    expect(screen.getByRole('option', { name: 'Artificer (2-4, 2000 XP)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Archer (2-4, 2500 XP)' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'Adventurer (GM permission, 3000 XP)' })).toBeInTheDocument();
  });

  it('shows a Point Buy cost next to Correction only once the toggle is on', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:0');

    const dexCorrection = screen.getByLabelText('DEX Correction');
    await user.clear(dexCorrection);
    await user.type(dexCorrection, '3');

    // Human is 2d6 for every ability; a picked 3 costs -20 (Epic Treasury p. 64).
    expect(screen.queryByText('-20')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText(/Point Buy \(no dice\)/i));
    expect(screen.getByText('-20')).toBeInTheDocument();
  });

  it('totals the six A-F picks and flags going over the 0-point budget', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:0');
    await user.click(screen.getByLabelText(/Point Buy \(no dice\)/i));

    expect(screen.getByText(/Point Buy total \(A–F\): 0/)).toBeInTheDocument();

    // Two 12s (+70 each) blow well past a 0-or-less budget.
    for (const id of ['DEX', 'STR']) {
      const field = screen.getByLabelText(`${id} Correction`);
      await user.clear(field);
      await user.type(field, '12');
    }

    const total = screen.getByText(/Point Buy total \(A–F\)/);
    expect(total).toHaveTextContent('+140');
    expect(total.className).toMatch(/warning/);
  });

  it('gives a rolled Skill/Body/Mind its own separate Point Buy budget', async () => {
    const user = userEvent.setup();
    renderForm();

    await user.selectOptions(screen.getByLabelText(/^Race$/i), 'human');
    // Human "Adventurer" (GM permission): rolls its own Skill/Body/Mind on 2d.
    await user.selectOptions(screen.getByLabelText(/^Background$/i), 'primary:7');
    await user.click(screen.getByLabelText(/Point Buy \(no dice\)/i));

    const skillField = screen.getByLabelText(/^Skill$/i);
    await user.clear(skillField);
    await user.type(skillField, '12');

    // A rolled 12 costs +160 on the Adventurer 2d Table — nothing to do with the A-F budget.
    expect(screen.getByText(/Point Buy total \(Skill\/Body\/Mind\): \+160/)).toBeInTheDocument();
    expect(screen.getByText(/Point Buy total \(A–F\): 0/)).toBeInTheDocument();
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

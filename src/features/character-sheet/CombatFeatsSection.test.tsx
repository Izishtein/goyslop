import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { CombatFeatsSection } from './CombatFeatsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <CombatFeatsSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Test Hero',
    raceId: 'human',
    background: 'Artificer',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'fighter', level: 3 }],
    hp: { current: 10 },
    mp: { current: 0 },
    statusEffects: [],
    equipment: { weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
    currency: { cash: 0, savings: 0, debt: 0, spendingLog: '' },
    combatFeats: [],
    experience: { total: 0, spent: 0 },
    spells: [],
    arts: [],
    performance: EMPTY_PERFORMANCE,
    growthLog: [],
    reputation: 0,
    profile: { gender: '', age: '', avatar: '' },
    notes: { story: '', goals: '', gm: '' },
    connections: [],
    ...overrides,
  };
}

function renderSection(character: Character) {
  const store = createStore();
  store.set(charactersAtom, [character]);
  render(
    <Provider store={store}>
      <Harness id={character.id} />
    </Provider>,
  );
  return store;
}

describe('CombatFeatsSection catalog', () => {
  it('adds a feat from the catalog with its category already set', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add feat from catalog'), 'cleave-i');
    await user.click(screen.getByRole('button', { name: 'Add feat' }));

    expect(store.get(charactersAtom)[0].combatFeats).toEqual([{ id: expect.any(String), name: 'Cleave I', category: 'declaration' }]);
  });

  it('groups the catalog by the four feat categories', () => {
    renderSection(makeCharacter());

    const groups = [...screen.getByLabelText('Add feat from catalog').querySelectorAll('optgroup')].map((group) => group.label);

    expect(groups).toEqual(['Passive', 'Declaration', 'Major Action', 'Auto-Acquired']);
  });

  it('greys out a feat the character already took', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add feat from catalog'), 'targeting');
    await user.click(screen.getByRole('button', { name: 'Add feat' }));

    expect(screen.getByRole('option', { name: 'Targeting' })).toBeDisabled();
  });

  it('suggests catalog names on a hand-written row without binding it to them', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add by hand' }));

    const nameField = screen.getByLabelText('Name');
    const list = document.getElementById(nameField.getAttribute('list') ?? '');
    expect([...(list?.querySelectorAll('option') ?? [])].map((option) => option.value)).toContain('Mana Strike');

    // Core III feats are not in the docs yet, so anything can still be typed.
    await user.type(nameField, 'Some Core III feat');
    expect(store.get(charactersAtom)[0].combatFeats[0].name).toBe('Some Core III feat');
  });

  it('removes only the feat whose Remove button was pressed', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      makeCharacter({
        combatFeats: [
          { id: 'f1', name: 'Dodge', category: 'passive' },
          { id: 'f2', name: 'Snipe', category: 'majorAction' },
        ],
      }),
    );

    const row = screen.getByDisplayValue('Dodge').closest('tr');
    await user.click(within(row as HTMLElement).getByRole('button', { name: /Remove/ }));

    expect(store.get(charactersAtom)[0].combatFeats.map((feat) => feat.name)).toEqual(['Snipe']);
  });
});

describe('CombatFeatsSection slots', () => {
  it('counts the feats taken against the slots the level grants', () => {
    // Adventurer Level 3 grants two: one at creation, one at level 3.
    renderSection(makeCharacter({ combatFeats: [{ id: 'f1', name: 'Dodge', category: 'passive' }] }));

    expect(screen.getByText('Feats taken:').parentElement).toHaveTextContent('1 / 2');
  });

  it('leaves auto-acquired feats out of the count — they cost no slot', () => {
    renderSection(
      makeCharacter({
        combatFeats: [
          { id: 'f1', name: 'Dodge', category: 'passive' },
          { id: 'f2', name: 'Chain Attack', category: 'auto' },
        ],
      }),
    );

    expect(screen.getByText('Feats taken:').parentElement).toHaveTextContent('1 / 2');
  });

  it('flags a character carrying more feats than the level allows', () => {
    renderSection(
      makeCharacter({
        combatFeats: [
          { id: 'f1', name: 'Dodge', category: 'passive' },
          { id: 'f2', name: 'Targeting', category: 'passive' },
          { id: 'f3', name: 'Snipe', category: 'majorAction' },
        ],
      }),
    );

    const count = screen.getByText('3 / 2');
    expect(count.className).toMatch(/overspent/);
  });
});

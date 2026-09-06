import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character, type KnownEvocation } from '../../types/character';
import { EvocationsSection } from './EvocationsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <EvocationsSection character={character} />;
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
    background: 'Alchemist',
    // INT 12 gives a +2 modifier (floor(12 / 6)), which the Evocation check leans on.
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: { ...zero, base: 12 }, SPR: zero },
    classes: [{ classId: 'alchemist', level: 3 }],
    hp: { current: 10 },
    mp: { current: 6 },
    statusEffects: [],
    equipment: { weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
    currency: { cash: 0, savings: 0, debt: 0, spendingLog: '' },
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

const blankRow = (name: string): KnownEvocation => ({
  id: 'evo-1',
  name,
  requiredLevel: 1,
  cards: 'White ×1',
  minorAction: true,
  preparation: false,
  notes: '',
});

describe('EvocationsSection', () => {
  it('stays off the sheet of a character without the class', () => {
    // Evocations belong to the Alchemist alone; nobody else should carry an empty
    // twenty-cell card grid around.
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }] }));

    expect(screen.queryByRole('heading', { name: 'Evocations' })).toBeNull();
  });

  it('comes back for a character who kept rows after dropping the class', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }], evocations: [blankRow('Barkmail')] }));

    expect(screen.getByRole('heading', { name: 'Evocations' })).toBeInTheDocument();
  });

  it('shows the Evocation check and how many are known against the class level', () => {
    renderSection(makeCharacter({ evocations: [blankRow('Barkmail')] }));

    // Alchemist 3 + INT modifier 2.
    expect(screen.getByText(/Evocation check/)).toHaveTextContent('5');
    expect(screen.getByText(/Known: 1 of 3/)).toBeInTheDocument();
  });

  it('adds an Evocation from the catalog with its cards and action markers', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'heal-spray');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(store.get(charactersAtom)[0].evocations[0]).toMatchObject({
      name: 'Heal Spray',
      requiredLevel: 1,
      cards: 'Green ×2',
      minorAction: true,
      preparation: false,
    });
  });

  it('greys out an Evocation the character already knows', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'barkmail');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('option', { name: /^Barkmail/ })).toBeDisabled();
  });

  it('flags the tiers above the class level instead of hiding them', () => {
    renderSection(makeCharacter());

    const picker = screen.getByLabelText('Add from catalog');
    const groups = [...picker.querySelectorAll('optgroup')].map((group) => group.label);
    expect(groups).toEqual(['Level 1', 'Level 5 — above class level', 'Level 10 — above class level']);
  });

  it('keeps a stock of Material Cards and prices it', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    const goldSs = screen.getByLabelText('Gold SS');
    await user.clear(goldSs);
    await user.type(goldSs, '2');

    expect(store.get(charactersAtom)[0].materialCards['Gold-SS']).toBe(2);
    expect(screen.getByText(/Stock value/)).toHaveTextContent('40000');
  });

  it('adds a hand-written row for anything the catalog misses', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add by hand' }));
    await user.type(screen.getAllByLabelText('Name')[0], 'House rule brew');

    expect(store.get(charactersAtom)[0].evocations[0]).toMatchObject({ name: 'House rule brew', cards: '' });
  });

  it('removes a row', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ evocations: [blankRow('Barkmail')] }));

    await user.click(screen.getByRole('button', { name: 'Barkmail Remove' }));

    expect(store.get(charactersAtom)[0].evocations).toEqual([]);
  });
});

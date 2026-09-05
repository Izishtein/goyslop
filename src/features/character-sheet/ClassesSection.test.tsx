import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, type Character } from '../../types/character';
import { ClassesSection } from './ClassesSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <ClassesSection character={character} />;
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
    raceId: 'tabbit', // Tabbit is restricted from Priest, which the add-class list must respect.
    background: 'Scholar',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'fighter', level: 1 }],
    hp: { current: 8 },
    mp: { current: 8 },
    statusEffects: [],
    equipment: { weapons: [], armor: [], shield: null, accessories: [] },
    currency: { cash: 1200, savings: 0, debt: 0 },
    combatFeats: [],
    experience: { total: 3000, spent: 0 },
    spells: [],
    growthLog: [],
    reputation: 0,
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

describe('ClassesSection', () => {
  it('charges the level cost when levelling up and refunds the same level going back down', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    expect(screen.getByLabelText('XP left')).toHaveTextContent('3000');

    // Fighter is a Major class: level 2 costs 1000.
    await user.click(screen.getByRole('button', { name: 'Fighter level up' }));

    expect(store.get(charactersAtom)[0].classes[0].level).toBe(2);
    expect(store.get(charactersAtom)[0].experience.spent).toBe(1000);
    expect(screen.getByLabelText('XP left')).toHaveTextContent('2000');

    await user.click(screen.getByRole('button', { name: 'Fighter level down' }));

    expect(store.get(charactersAtom)[0].classes[0].level).toBe(1);
    expect(store.get(charactersAtom)[0].experience.spent).toBe(0);
  });

  it('adds a class at level 1 and charges its first-level cost', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    // Fencer is a Minor class: level 1 costs 500.
    await user.selectOptions(screen.getByLabelText('Add a class'), 'fencer');
    await user.click(screen.getByRole('button', { name: 'Add class' }));

    const character = store.get(charactersAtom)[0];
    expect(character.classes).toContainEqual({ classId: 'fencer', level: 1 });
    expect(character.experience.spent).toBe(500);
  });

  it('never refunds on removal, so a background-granted class cannot mint XP', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Fighter Remove' }));

    expect(store.get(charactersAtom)[0].classes).toEqual([]);
    expect(store.get(charactersAtom)[0].experience).toEqual({ total: 3000, spent: 0 });
  });

  it('offers neither classes already taken nor classes the race is restricted from', async () => {
    renderSection(makeCharacter());

    const select = screen.getByLabelText('Add a class');
    const options = within(select).getAllByRole('option').map((option) => option.textContent);

    expect(options.some((label) => label?.startsWith('Fighter'))).toBe(false); // already taken
    expect(options.some((label) => label?.startsWith('Priest'))).toBe(false); // restricted for Tabbit
    expect(options.some((label) => label?.startsWith('Fencer — 500 XP'))).toBe(true);
  });

  it('stops levelling at the Adventurer Level cap of 15', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 15 }], experience: { total: 0, spent: 0 } }));

    expect(screen.getByRole('button', { name: 'Fighter level up' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Fighter level down' }));
    expect(screen.getByRole('button', { name: 'Fighter level up' })).toBeEnabled();
  });

  it('flags overspending instead of silently going negative', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ experience: { total: 500, spent: 0 } }));

    await user.click(screen.getByRole('button', { name: 'Fighter level up' }));

    expect(screen.getByLabelText('XP left')).toHaveTextContent('-500');
  });

  it('backfills experience for characters saved before the field existed', () => {
    const legacy = { ...makeCharacter() } as Partial<Character>;
    delete legacy.experience;

    const parsed = CharacterSchema.parse(legacy);

    expect(parsed.experience).toEqual({ total: 0, spent: 0 });
  });
  it('derives the Adventurer Rank and the gap to the next one from reputation', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ reputation: 90 }));

    // Core II chart: 50 is Rapier, 100 is Broad Sword.
    expect(screen.getByLabelText('Adventurer Rank')).toHaveTextContent('Rapier');
    expect(screen.getByText(/10 to Broad Sword/)).toBeInTheDocument();

    await user.clear(screen.getByLabelText('Reputation'));
    await user.type(screen.getByLabelText('Reputation'), '100');

    expect(screen.getByLabelText('Adventurer Rank')).toHaveTextContent('Broad Sword');
    expect(screen.getByText(/Free Renown Items: 10/)).toBeInTheDocument();
  });
});

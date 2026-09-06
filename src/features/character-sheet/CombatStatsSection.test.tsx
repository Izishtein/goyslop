import { render, screen, within } from '@testing-library/react';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { CombatStatsSection } from './CombatStatsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <CombatStatsSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  // Every ability sits at 12, a +2 modifier, so each Standard Value reads as level + 2.
  const twelve = { base: 12, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Test Hero',
    raceId: 'human',
    background: 'Artificer',
    abilities: { DEX: twelve, AGI: twelve, STR: twelve, VIT: twelve, INT: twelve, SPR: twelve },
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

/** The Standard Value cell of the check package row with this label. */
function valueOf(label: RegExp): string {
  const row = screen.getByRole('row', { name: label });
  return within(row).getAllByRole('cell')[1].textContent ?? '';
}

describe('CombatStatsSection check packages', () => {
  it('gives every character Initiative and First Aid, class or no class', () => {
    // No Scout, so Initiative is the AGI modifier alone; First Aid is Adventurer Level 3 + 2.
    renderSection(makeCharacter());

    expect(valueOf(/^Initiative/)).toBe('2');
    expect(valueOf(/^First Aid/)).toBe('5');
  });

  it('adds the Scout level to Initiative and unlocks Danger Sense', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'scout', level: 4 }] }));

    expect(valueOf(/^Initiative/)).toBe('6');
    expect(valueOf(/^Danger Sense/)).toBe('6');
  });

  it('counts a Tactician for Initiative but not for Danger Sense', () => {
    // The docs give Initiative to Scout or Tactician; Danger Sense is the Scout's alone.
    renderSection(makeCharacter({ classes: [{ classId: 'tactician', level: 4 }] }));

    expect(valueOf(/^Initiative/)).toBe('6');
    expect(screen.queryByRole('row', { name: /^Danger Sense/ })).toBeNull();
  });

  it('leaves out the packages the character has no class for', () => {
    renderSection(makeCharacter());

    expect(screen.queryByRole('row', { name: /Monster Knowledge/ })).toBeNull();
    expect(screen.queryByRole('row', { name: /Healing Power/ })).toBeNull();
  });

  it('shows Monster Knowledge for a Sage and Healing Power for a Priest', () => {
    renderSection(
      makeCharacter({
        classes: [
          { classId: 'sage', level: 5 },
          { classId: 'priest', level: 2 },
        ],
      }),
    );

    expect(valueOf(/^Monster Knowledge/)).toBe('7');
    expect(valueOf(/^Healing Power/)).toBe('4');
  });

  it('renders for a character with neither a warrior nor a wizard class', () => {
    // The section used to disappear entirely, taking the universal checks with it.
    renderSection(makeCharacter({ classes: [{ classId: 'scout', level: 2 }] }));

    expect(screen.getByRole('heading', { name: 'Combat stats' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Check packages' })).toBeInTheDocument();
  });

  it('has no Movement row — the books give it no formula', () => {
    renderSection(makeCharacter());

    expect(screen.queryByRole('row', { name: /Movement/ })).toBeNull();
  });
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, type Character, EMPTY_INVENTORY, EMPTY_PERFORMANCE } from '../../types/character';
import { SpellsSection } from './SpellsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <SpellsSection character={character} />;
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
    background: 'Sorcerer',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'sorcerer', level: 2 }],
    hp: { current: 8 },
    mp: { current: 8 },
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

describe('SpellsSection', () => {
  it('adds a catalog spell with its circle and MP cost filled in', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'energy-bolt');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(store.get(charactersAtom)[0].spells).toEqual([
      { id: expect.any(String), name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 5 },
    ]);
    expect(screen.getByDisplayValue('Energy Bolt')).toBeInTheDocument();
  });

  it('offers only the schools the character actually casts from', () => {
    renderSection(makeCharacter());

    const select = screen.getByLabelText('Add from catalog');
    const options = within(select).getAllByRole('option').map((option) => option.textContent);

    expect(options.some((label) => label?.startsWith('Energy Bolt'))).toBe(true); // Truespeech
    expect(options.some((label) => label?.startsWith('Cure Wounds'))).toBe(false); // Divine
  });

  it('marks circles the class level cannot cast yet without hiding them', () => {
    renderSection(makeCharacter()); // Sorcerer Lv2 knows circles 1-2

    const groups = [...screen.getByLabelText('Add from catalog').querySelectorAll('optgroup')].map((g) => g.label);

    expect(groups[0]).toBe('Circle 1');
    expect(groups[1]).toBe('Circle 2');
    expect(groups[2]).toBe('Circle 3 — above class level');
  });

  it('greys out a spell the character already knows', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'light');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(screen.getByRole('option', { name: /^Light — 1 MP/ })).toBeDisabled();
  });

  it('supports hand-written spells for schools with no catalog', async () => {
    const user = userEvent.setup();
    // A Bibliomancer casts Arcane Magic, whose spell list sits in Tyrants Crypts and is
    // held back by the translation embargo — no per-spell list to build a catalog from.
    const store = renderSection(makeCharacter({ classes: [{ classId: 'bibliomancer', level: 1 }] }));

    expect(screen.getByText(/No catalog for this school yet/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add by hand' }));
    await user.type(screen.getAllByLabelText('Spell')[0], 'Thorn Bind');

    expect(store.get(charactersAtom)[0].spells[0]).toMatchObject({ name: 'Thorn Bind', school: 'Arcane Magic' });
  });

  it('offers the supplement schools from the catalog too', async () => {
    const user = userEvent.setup();
    // Nature Magic runs to level 15, well past the ten circles of the Core schools.
    const store = renderSection(makeCharacter({ classes: [{ classId: 'druid', level: 15 }] }));

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'natural-haven');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(store.get(charactersAtom)[0].spells[0]).toMatchObject({
      name: 'Natural Haven',
      school: 'Nature Magic',
      circle: 15,
      mp: 30,
    });
  });

  it('says so when the character has no Wizard-type class at all', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 1 }] }));

    expect(screen.getByText(/casts nothing/)).toBeInTheDocument();
  });

  it('removes a spell', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      makeCharacter({ spells: [{ id: 's1', name: 'Light', school: 'Truespeech Magic', circle: 1, mp: 1 }] }),
    );

    await user.click(screen.getByRole('button', { name: 'Light Remove' }));

    expect(store.get(charactersAtom)[0].spells).toEqual([]);
  });

  it('backfills spells for characters saved before the field existed', () => {
    const legacy = { ...makeCharacter() } as Partial<Character>;
    delete legacy.spells;

    expect(CharacterSchema.parse(legacy).spells).toEqual([]);
  });
});

describe('SpellsSection catalog search', () => {
  it('narrows the catalog to the spells whose name matches', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'bolt');

    const names = [...screen.getByLabelText('Add from catalog').querySelectorAll('option')]
      .map((option) => option.textContent ?? '')
      .filter((label) => label !== 'Select...');
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((label) => label.toLowerCase().includes('bolt'))).toBe(true);
  });

  it('keeps the circle grouping, so a filtered list still shows what is out of reach', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'a');

    const groups = [...screen.getByLabelText('Add from catalog').querySelectorAll('optgroup')].map((group) => group.label);
    expect(groups.some((label) => label.includes('above class level'))).toBe(true);
  });

  it('says so when nothing matches instead of showing an empty picker', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'zzzzz');

    expect(screen.getByText('Nothing in this school matches.')).toBeInTheDocument();
  });

  it('adds the spell that survived the filter', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'energy');
    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'energy-bolt');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(store.get(charactersAtom)[0].spells[0].name).toBe('Energy Bolt');
  });
});

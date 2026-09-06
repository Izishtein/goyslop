import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character, type ClassLevel } from '../../types/character';
import { ArtsSection } from './ArtsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <ArtsSection character={character} />;
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
    // INT 12 gives a +2 modifier (floor(12 / 6)), which the derived values lean on.
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: { ...zero, base: 12 }, SPR: zero },
    classes: [{ classId: 'enhancer', level: 3 }],
    hp: { current: 10 },
    mp: { current: 6 },
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

const bard = (level = 5): ClassLevel[] => [{ classId: 'bard', level }];

describe('ArtsSection', () => {
  it('stays off the sheet of a character with neither class', () => {
    // Techniques and Spellsongs belong to two Minor classes; a Fighter should not carry
    // three empty tables around.
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }] }));

    expect(screen.queryByRole('heading', { name: 'Techniques & Spellsongs' })).toBeNull();
  });

  it('comes back for a character who kept rows after dropping the class', () => {
    const store = renderSection(
      makeCharacter({
        classes: [{ classId: 'fighter', level: 3 }],
        arts: [{ ...blankTechnique(), name: 'Beetleskin' }],
      }),
    );

    expect(screen.getByRole('heading', { name: 'Techniques' })).toBeInTheDocument();
    expect(store.get(charactersAtom)[0].arts).toHaveLength(1);
  });

  it('shows an Enhancer only the Techniques block', () => {
    renderSection(makeCharacter());

    expect(screen.getByRole('heading', { name: 'Techniques' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Spellsongs' })).toBeNull();
    expect(screen.queryByRole('heading', { name: 'Finales' })).toBeNull();
  });

  it('adds a Technique from the catalog with its duration and preparation mark', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'beetleskin');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(store.get(charactersAtom)[0].arts).toEqual([
      expect.objectContaining({ kind: 'technique', name: 'Beetleskin', requiredLevel: 1, duration: '30s', preparation: true }),
    ]);
    expect(screen.getByDisplayValue('Beetleskin')).toBeInTheDocument();
  });

  it('flags the entries the class level cannot learn yet without hiding them', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'enhancer', level: 3 }] }));

    const groups = [...screen.getByLabelText('Add from catalog').querySelectorAll('optgroup')].map((group) => group.label);

    expect(groups).toEqual(['Level 1', 'Level 5 — above class level']);
  });

  it('greys out an art the character already knows', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'meditation');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('option', { name: /^Meditation/ })).toBeDisabled();
  });

  it('gives a Bard the performance tracker, songs and finales instead', () => {
    renderSection(makeCharacter({ classes: bard() }));

    expect(screen.getByRole('heading', { name: 'Spellsongs' })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Finales' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Techniques' })).toBeNull();
    // Bardic Power = Bard level 5 + INT modifier 2.
    expect(screen.getByText('Bardic Power:').parentElement).toHaveTextContent('7');
  });

  it('adds a Finale with the rhythm it spends and how it can be resisted', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ classes: bard() }));

    await user.selectOptions(screen.getByLabelText('Kind'), 'finale');
    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'winter-s-chill');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(store.get(charactersAtom)[0].arts).toEqual([
      expect.objectContaining({ kind: 'finale', name: "Winter's Chill", rhythm: '♩2', resistance: 'Half', damageType: 'Water/Ice' }),
    ]);
  });

  it('banks rhythm and the pet on the performance tracker', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ classes: bard() }));

    await user.type(screen.getByLabelText('Pet'), 'Frog');
    const note = screen.getByLabelText('Rhythm ♩');
    await user.clear(note);
    await user.type(note, '4');

    expect(store.get(charactersAtom)[0].performance).toMatchObject({ pet: 'Frog', rhythmNote: 4, rhythmHeart: 0 });
  });

  it('adds a blank row of the kind being browsed', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ classes: bard() }));

    await user.selectOptions(screen.getByLabelText('Kind'), 'spellsong');
    await user.click(screen.getByRole('button', { name: 'Add by hand' }));

    expect(store.get(charactersAtom)[0].arts).toEqual([expect.objectContaining({ kind: 'spellsong', name: '' })]);
  });

  it('removes only the row whose Remove button was pressed', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      makeCharacter({
        arts: [
          { ...blankTechnique(), name: 'Antibody' },
          { ...blankTechnique(), id: 'a2', name: 'Owl Sight' },
        ],
      }),
    );

    const row = screen.getByDisplayValue('Antibody').closest('tr');
    await user.click(within(row as HTMLElement).getByRole('button', { name: /Remove/ }));

    expect(store.get(charactersAtom)[0].arts.map((art) => art.name)).toEqual(['Owl Sight']);
  });

  it('backfills arts and the performance tracker for characters saved before them', () => {
    const character = makeCharacter();
    const { arts: _arts, performance: _performance, ...oldShape } = character;

    const parsed = CharacterSchema.parse(oldShape);

    expect(parsed.arts).toEqual([]);
    expect(parsed.performance).toEqual(EMPTY_PERFORMANCE);
  });
});

function blankTechnique() {
  return {
    id: 'a1',
    kind: 'technique' as const,
    name: '',
    requiredLevel: 1,
    duration: '',
    preparation: false,
    singing: false,
    pets: '',
    effectCondition: '',
    rhythm: '',
    flourish: 0,
    extraRhythm: '',
    resistance: '',
    damageType: '',
    notes: '',
  };
}

import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import {
  CharacterSchema,
  EMPTY_FELLOW,
  EMPTY_GEOMANCER_QI,
  EMPTY_INVENTORY,
  EMPTY_PERFORMANCE,
  type Character,
} from '../../types/character';
import { EssenceWeavingSection } from './EssenceWeavingSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <EssenceWeavingSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Hunter',
    raceId: 'human',
    background: 'Hunter',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'dark-hunter', level: 5 }],
    hp: { current: 8 },
    mp: { current: 0 },
    statusEffects: [],
    abyssCorruptionLevel: 0,
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
    fellow: EMPTY_FELLOW,
    workSkills: [],
    stunts: [],
    aspects: [],
    geomancerQi: EMPTY_GEOMANCER_QI,
    stratagems: [],
    maneuvers: [],
    tacticianEdge: 0,
    essenceWeavings: [],
    schools: [],
    schoolSecrets: [],
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

describe('EssenceWeavingSection', () => {
  it('stays out of the way of a character with no Dark Hunter levels and no Essence Weavings', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }] }));
    expect(screen.queryByRole('heading', { name: 'Essence Weavings' })).not.toBeInTheDocument();
  });

  it('adds an Essence Weaving from the catalog with the type the book prints', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Essence Weaving from catalog'), 'spectral-throw');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    const [weaving] = store.get(charactersAtom)[0].essenceWeavings;
    expect(weaving).toMatchObject({ name: 'Spectral Throw', type: 'majorAction' });
  });

  it('marks Essence Weavings above the Dark Hunter level without hiding them', () => {
    // Dark Hunter 5 (the fixture's level) can't yet reach 10th Level Weavings.
    renderSection(makeCharacter());

    const options = [...screen.getByLabelText('Essence Weaving from catalog').querySelectorAll('option')];
    const heavyThrows = options.find((option) => option.value === 'heavy-throws');
    expect(heavyThrows).toBeTruthy();
    expect(heavyThrows?.disabled).toBe(false);
    expect(heavyThrows?.closest('optgroup')?.label).toContain('above class level');
  });

  it('disables an Essence Weaving already known, so it cannot be taken twice', () => {
    renderSection(makeCharacter({ essenceWeavings: [{ id: 'w1', name: 'Spectral Throw', type: 'majorAction' }] }));

    const options = [...screen.getByLabelText('Essence Weaving from catalog').querySelectorAll('option')];
    expect(options.find((option) => option.value === 'spectral-throw')?.disabled).toBe(true);
  });

  it('counts Essence Weavings against one slot per Dark Hunter level and flags overspend', () => {
    // Dark Hunter 5 fixture: 5 slots. Six known Weavings should read 6 / 5 and flag red.
    const essenceWeavings = Array.from({ length: 6 }, (_, i) => ({ id: `w${i}`, name: `Weaving ${i}`, type: 'passive' as const }));
    renderSection(makeCharacter({ essenceWeavings }));

    const counter = screen.getByText('(6 / 5)');
    expect(counter.className).toMatch(/overspent/);
  });

  it('backfills essenceWeavings for characters saved before the field existed', () => {
    const character = makeCharacter();
    const { essenceWeavings: _essenceWeavings, ...oldCharacter } = character;

    const parsed = CharacterSchema.parse(oldCharacter);

    expect(parsed.essenceWeavings).toEqual([]);
  });
});

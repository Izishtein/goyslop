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
import { TacticianSection } from './TacticianSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <TacticianSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Commander',
    raceId: 'human',
    background: 'Commander',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'tactician', level: 5 }],
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

describe('TacticianSection', () => {
  it('stays out of the way of a character with no Tactician levels and nothing known', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }] }));
    expect(screen.queryByRole('heading', { name: 'Tactician Stratagems & Maneuvers' })).not.toBeInTheDocument();
  });

  it('adds a Stratagem from the catalog with the type and rank the book prints', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Stratagem from catalog'), 'ironclad-defense-i');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);

    const [stratagem] = store.get(charactersAtom)[0].stratagems;
    expect(stratagem).toMatchObject({ name: 'Ironclad Defense I', type: 'defense', rank: 1 });
  });

  it('adds a Maneuver from the catalog', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Maneuver from catalog'), 'concentration-i');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[1]);

    const [maneuver] = store.get(charactersAtom)[0].maneuvers;
    expect(maneuver).toMatchObject({ name: 'Concentration I' });
  });

  it('marks entries above the Tactician level without hiding them', () => {
    // Tactician 5 (the fixture's level) can't yet reach 10th Level Stratagems.
    renderSection(makeCharacter());

    const options = [...screen.getByLabelText('Stratagem from catalog').querySelectorAll('option')];
    const hellfire = options.find((option) => option.value === 'surging-offense-v-hellfire');
    expect(hellfire).toBeTruthy();
    expect(hellfire?.disabled).toBe(false);
    expect(hellfire?.closest('optgroup')?.label).toContain('above class level');
  });

  it('disables a Stratagem or Maneuver already known, so it cannot be taken twice', () => {
    renderSection(
      makeCharacter({
        stratagems: [{ id: 's1', name: 'Finding Flaws', type: 'inspirational', rank: 1, notes: '' }],
        maneuvers: [{ id: 'm1', name: 'Foresight I', notes: '' }],
      }),
    );

    const stratagemOptions = [...screen.getByLabelText('Stratagem from catalog').querySelectorAll('option')];
    expect(stratagemOptions.find((option) => option.value === 'finding-flaws')?.disabled).toBe(true);
    const maneuverOptions = [...screen.getByLabelText('Maneuver from catalog').querySelectorAll('option')];
    expect(maneuverOptions.find((option) => option.value === 'foresight-i')?.disabled).toBe(true);
  });

  it('counts Stratagems and Maneuvers against one shared slot pool per Tactician level', async () => {
    // Tactician 5 fixture: 5 slots. Three Stratagems + three Maneuvers should read 6 / 5.
    const stratagems = Array.from({ length: 3 }, (_, i) => ({ id: `s${i}`, name: `S${i}`, type: 'attack' as const, rank: 1 as const, notes: '' }));
    const maneuvers = Array.from({ length: 3 }, (_, i) => ({ id: `m${i}`, name: `M${i}`, notes: '' }));
    renderSection(makeCharacter({ stratagems, maneuvers }));

    const counter = screen.getByText('(6 / 5)');
    expect(counter.className).toMatch(/overspent/);
  });

  it('tracks Edge as a single counter', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.clear(screen.getByLabelText('Edge'));
    await user.type(screen.getByLabelText('Edge'), '4');

    expect(store.get(charactersAtom)[0].tacticianEdge).toBe(4);
  });

  it('backfills stratagems, maneuvers and Edge for characters saved before the fields existed', () => {
    const character = makeCharacter();
    const { stratagems: _stratagems, maneuvers: _maneuvers, tacticianEdge: _tacticianEdge, ...oldCharacter } = character;

    const parsed = CharacterSchema.parse(oldCharacter);

    expect(parsed.stratagems).toEqual([]);
    expect(parsed.maneuvers).toEqual([]);
    expect(parsed.tacticianEdge).toBe(0);
  });
});

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
import { GeomancerSection } from './GeomancerSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <GeomancerSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Surveyor',
    raceId: 'human',
    background: 'Surveyor',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'geomancer', level: 5 }],
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

describe('GeomancerSection', () => {
  it('stays out of the way of a character with no Geomancer levels and no Aspects', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }] }));
    expect(screen.queryByRole('heading', { name: 'Geomancer Aspects' })).not.toBeInTheDocument();
  });

  it('adds an Aspect from the catalog with the domain the book prints', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Aspect from catalog'), 'descending-thunder');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    const [aspect] = store.get(charactersAtom)[0].aspects;
    expect(aspect).toMatchObject({ name: 'Descending Thunder', domain: 'heavenly' });
  });

  it('marks Aspects above the Geomancer level without hiding them', () => {
    // Geomancer 5 (the fixture's level) can't yet reach 10th Level Aspects.
    renderSection(makeCharacter());

    const options = [...screen.getByLabelText('Aspect from catalog').querySelectorAll('option')];
    const mirage = options.find((option) => option.value === 'mirage');
    expect(mirage).toBeTruthy();
    expect(mirage?.disabled).toBe(false);
    expect(mirage?.closest('optgroup')?.label).toContain('above class level');
  });

  it('disables an Aspect already known, so it cannot be taken twice', () => {
    renderSection(makeCharacter({ aspects: [{ id: 'a1', name: 'Descending Thunder', domain: 'heavenly', notes: '' }] }));

    const options = [...screen.getByLabelText('Aspect from catalog').querySelectorAll('option')];
    expect(options.find((option) => option.value === 'descending-thunder')?.disabled).toBe(true);
  });

  it('counts Aspects against one slot per Geomancer level and flags overspend', () => {
    // Geomancer 5 fixture: 5 slots. Six known Aspects should read 6 / 5 and flag red.
    const aspects = Array.from({ length: 6 }, (_, i) => ({ id: `a${i}`, name: `Aspect ${i}`, domain: 'heavenly' as const, notes: '' }));
    renderSection(makeCharacter({ aspects }));

    const counter = screen.getByText('(6 / 5)');
    expect(counter.className).toMatch(/overspent/);
  });

  it('tracks Qi Points per domain', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.clear(screen.getByLabelText('Heavenly Qi'));
    await user.type(screen.getByLabelText('Heavenly Qi'), '3');

    expect(store.get(charactersAtom)[0].geomancerQi.heavenly).toBe(3);
  });

  it('backfills aspects and Qi for characters saved before the fields existed', () => {
    const character = makeCharacter();
    const { aspects: _aspects, geomancerQi: _geomancerQi, ...oldCharacter } = character;

    const parsed = CharacterSchema.parse(oldCharacter);

    expect(parsed.aspects).toEqual([]);
    expect(parsed.geomancerQi).toEqual({ heavenly: 0, earthly: 0, spirit: 0 });
  });
});

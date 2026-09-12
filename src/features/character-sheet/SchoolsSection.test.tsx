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
import { SchoolsSection } from './SchoolsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <SchoolsSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Duelist',
    raceId: 'human',
    background: 'Duelist',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'fighter', level: 3 }],
    hp: { current: 10 },
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

describe('SchoolsSection', () => {
  it('always shows the section — School membership is not gated by any class', () => {
    renderSection(makeCharacter());
    expect(screen.getByRole('heading', { name: 'Battle Mastery Schools' })).toBeInTheDocument();
  });

  it('joins a School from the catalog', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('School from catalog'), 'ivar-frenzy-style');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[0]);

    const [joined] = store.get(charactersAtom)[0].schools;
    expect(joined).toMatchObject({ name: 'Ivar Frenzy Style' });
  });

  it('adds a Secret from the catalog with the type and school the book prints', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Secret from catalog'), 'angry-bear-strike');
    await user.click(screen.getAllByRole('button', { name: 'Add' })[1]);

    const [secret] = store.get(charactersAtom)[0].schoolSecrets;
    expect(secret).toMatchObject({ name: 'Angry Bear Strike', schoolId: 'ivar-frenzy-style', type: 'declaration' });
  });

  it('marks a Secret whose School has not been joined without hiding it', () => {
    renderSection(makeCharacter());

    const options = [...screen.getByLabelText('Secret from catalog').querySelectorAll('option')];
    const angryBear = options.find((option) => option.value === 'angry-bear-strike');
    expect(angryBear).toBeTruthy();
    expect(angryBear?.disabled).toBe(false);
    expect(angryBear?.closest('optgroup')?.label).toContain('not joined');
  });

  it('disables a Secret already known, so it cannot be taken twice', () => {
    renderSection(makeCharacter({ schoolSecrets: [{ id: 's1', name: 'Angry Bear Strike', schoolId: 'ivar-frenzy-style', type: 'declaration', notes: '' }] }));

    const options = [...screen.getByLabelText('Secret from catalog').querySelectorAll('option')];
    expect(options.find((option) => option.value === 'angry-bear-strike')?.disabled).toBe(true);
  });

  it('backfills schools/schoolSecrets for characters saved before the fields existed', () => {
    const character = makeCharacter();
    const { schools: _schools, schoolSecrets: _schoolSecrets, ...oldCharacter } = character;

    const parsed = CharacterSchema.parse(oldCharacter);

    expect(parsed.schools).toEqual([]);
    expect(parsed.schoolSecrets).toEqual([]);
  });
});

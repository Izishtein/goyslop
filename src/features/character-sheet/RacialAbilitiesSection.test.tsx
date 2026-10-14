import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { RacialAbilitiesSection } from './RacialAbilitiesSection';

function Harness({ id }: { id: string }) {
  const character = useAtomValue(charactersAtom).find((entry) => entry.id === id);
  return character ? <RacialAbilitiesSection character={character} /> : null;
}

beforeEach(() => localStorage.clear());

function makeCharacter(overrides: Record<string, unknown> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return CharacterSchema.parse({
    schemaVersion: 1,
    id: 'c1',
    name: 'Rudolf',
    raceId: 'dark-troll',
    background: '',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'fighter', level: 6 }],
    hp: { current: 10 },
    mp: { current: 8 },
    statusEffects: [],
    abyssCorruptionLevel: 0,
    deity: '',
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
    makoStone: 0,
    infusions: [],
    ...overrides,
  });
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

describe('RacialAbilitiesSection', () => {
  it('is hidden for a race with nothing to press', () => {
    renderSection(makeCharacter({ raceId: 'human' }));
    expect(screen.queryByRole('heading', { name: 'Racial abilities' })).not.toBeInTheDocument();
  });

  it('puts a Dark Troll under the sun: Weakened is a status effect of -2 Accuracy and Evasion, and lifts again', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    await user.click(screen.getByLabelText(/Under the sun/));
    const [effect] = store.get(charactersAtom)[0].statusEffects;
    expect(effect).toMatchObject({ name: 'Weakened (sunlight)', modifiers: [{ field: 'accuracy', value: -2 }, { field: 'evasion', value: -2 }] });
    await user.click(screen.getByLabelText(/Under the sun/));
    expect(store.get(charactersAtom)[0].statusEffects).toEqual([]);
    expect(store.get(charactersAtom)[0].racial?.sunlight).toBe(false);
  });

  it('regenerates Adventurer level x 5 HP once a day, up to the maximum, and again after a new day', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    const button = screen.getByRole('button', { name: 'Limited Regeneration: recover 30 HP' });
    await user.click(button);
    expect(store.get(charactersAtom)[0].hp.current).toBeGreaterThan(10);
    const after = store.get(charactersAtom)[0].hp.current;
    expect(button).toBeDisabled();
    expect(screen.getByText(/spent/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'New combat' }));
    expect(button).toBeDisabled(); // a combat does not give a day back
    await user.click(screen.getByRole('button', { name: 'New day' }));
    expect(button).toBeEnabled();
    expect(store.get(charactersAtom)[0].hp.current).toBe(after);
  });

  it('offers Limited Regeneration only from level 6', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 5 }] }));
    expect(screen.queryByRole('button', { name: /Limited Regeneration/ })).not.toBeInTheDocument();
  });

  it('keeps a Baba Yaga’s witch shape: +1 Magic Power and 4 soulscars', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ raceId: 'baba-yaga' }));
    expect(screen.getByText(/soulscars 2/)).toBeInTheDocument();
    await user.click(screen.getByLabelText(/Witch’s shape/));
    expect(store.get(charactersAtom)[0].racial?.witch).toBe(true);
    expect(screen.getByText(/Magic Power \+1 in every class; soulscars 4/)).toBeInTheDocument();
  });

  it('lets a Kobold use Disregard once a combat, and a new combat gives it back', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ raceId: 'kobold' }));
    const button = screen.getByRole('button', { name: /^Disregard/ });
    await user.click(button);
    expect(button).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'New combat' }));
    expect(button).toBeEnabled();
  });
});

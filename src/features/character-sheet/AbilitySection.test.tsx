import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, type Character, EMPTY_INVENTORY, EMPTY_PERFORMANCE } from '../../types/character';
import { AbilitySection } from './AbilitySection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <AbilitySection character={character} />;
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
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'fighter', level: 3 }],
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

describe('AbilitySection growth log', () => {
  it('taking a growth raises the ability and logs it at the current Adventurer Level', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'STR Take a growth' }));

    const character = store.get(charactersAtom)[0];
    expect(character.abilities.STR.growth).toBe(1);
    expect(character.growthLog).toEqual([
      { id: expect.any(String), ability: 'STR', adventurerLevel: 3 }, // Fighter Lv3
    ]);
    expect(screen.getByLabelText('STR Total')).toHaveTextContent('9'); // base 8 + growth 1
  });

  it('removing a log line takes its +1 back, so log and Growth cannot drift apart', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'INT Take a growth' }));
    await user.click(screen.getByRole('button', { name: 'INT Take a growth' }));
    expect(store.get(charactersAtom)[0].abilities.INT.growth).toBe(2);

    await user.click(screen.getAllByRole('button', { name: 'INT Remove' })[0]);

    const character = store.get(charactersAtom)[0];
    expect(character.abilities.INT.growth).toBe(1);
    expect(character.growthLog).toHaveLength(1);
  });

  it('keeps a note on a log line', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'AGI Take a growth' }));
    await user.type(screen.getByLabelText('Notes'), 'rolled 7');

    expect(store.get(charactersAtom)[0].growthLog[0].note).toBe('rolled 7');
  });

  it('backfills the growth log for characters saved before it existed', () => {
    const legacy = { ...makeCharacter() } as Partial<Character>;
    delete legacy.growthLog;

    expect(CharacterSchema.parse(legacy).growthLog).toEqual([]);
  });
});

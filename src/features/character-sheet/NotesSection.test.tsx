import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, type Character, EMPTY_INVENTORY, EMPTY_PERFORMANCE } from '../../types/character';
import { NotesSection } from './NotesSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <NotesSection character={character} />;
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
    classes: [{ classId: 'artificer', level: 1 }],
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

describe('NotesSection', () => {
  it('keeps each note field separately', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Background story'), 'Raised in Zaltehm.');
    await user.type(screen.getByLabelText('Personal goals'), 'Find the missing caravan.');

    expect(store.get(charactersAtom)[0].notes).toEqual({
      story: 'Raised in Zaltehm.',
      goals: 'Find the missing caravan.',
      gm: '',
    });
  });

  it('adds, edits and removes a connection', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add connection' }));
    await user.type(screen.getByLabelText('Name'), 'Sara');
    await user.type(screen.getByLabelText('Relation'), 'guild contact');

    expect(store.get(charactersAtom)[0].connections[0]).toMatchObject({ name: 'Sara', relation: 'guild contact' });

    await user.click(screen.getByRole('button', { name: 'Sara Remove' }));
    expect(store.get(charactersAtom)[0].connections).toEqual([]);
  });

  it('grows a note field to its content so print does not clip it', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    const story = screen.getByLabelText('Background story') as HTMLTextAreaElement;
    // jsdom reports no layout, so this only asserts the handler sets an explicit height.
    await user.type(story, 'a long history');

    expect(story.style.height).not.toBe('');
  });

  it('backfills notes, connections and profile for characters saved before they existed', () => {
    const legacy = { ...makeCharacter() } as Partial<Character>;
    delete legacy.notes;
    delete legacy.connections;
    delete legacy.profile;

    const parsed = CharacterSchema.parse(legacy);

    expect(parsed.notes).toEqual({ story: '', goals: '', gm: '' });
    expect(parsed.connections).toEqual([]);
    expect(parsed.profile).toEqual({ gender: '', age: '', avatar: '' });
  });
});

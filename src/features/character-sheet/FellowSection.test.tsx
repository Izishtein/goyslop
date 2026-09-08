import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, type Character, EMPTY_FELLOW, EMPTY_INVENTORY, EMPTY_PERFORMANCE } from '../../types/character';
import { FellowSection } from './FellowSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <FellowSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Wolfe',
    raceId: 'human',
    background: 'Fighter',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: { ...zero, base: 10 } },
    classes: [
      { classId: 'fighter', level: 2 },
      { classId: 'scout', level: 1 },
    ],
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
    profile: { gender: 'Male', age: '16', avatar: '' },
    notes: { story: '', goals: '', gm: '' },
    connections: [],
    fellow: EMPTY_FELLOW,
    workSkills: [],
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

describe('FellowSection', () => {
  it('reads name/race/gender/age/level/MP/classes off the sheet rather than storing them again', () => {
    renderSection(makeCharacter());

    // Adventurer Level 3 (Fighter 2 + Scout 1), MP 3 (0 Wizard levels x 3 + SPR mod 1 -> mpMax floors it, at least non-zero from SPR).
    expect(screen.getByText(/Human/)).toBeInTheDocument();
    expect(screen.getByText(/Male/)).toBeInTheDocument();
    expect(screen.getByText(/Fighter 2, Scout 1/)).toBeInTheDocument();
  });

  it('keeps the self-introduction and languages fields', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Self-introduction'), "I'm a hot-blooded guy!");
    await user.type(screen.getByLabelText('Languages'), 'Trade Common (Speak/Read)');

    expect(store.get(charactersAtom)[0].fellow).toMatchObject({
      selfIntroduction: "I'm a hot-blooded guy!",
      languages: 'Trade Common (Speak/Read)',
    });
  });

  it('toggles whether the Fellow wants experience and reward', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Wants experience'), 'no');
    await user.selectOptions(screen.getByLabelText('Wants reward'), 'yes');

    expect(store.get(charactersAtom)[0].fellow).toMatchObject({ wantsExperience: false, wantsReward: true });
  });

  it('adds, edits and removes a Fellow Action Table row', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add row' }));
    await user.type(screen.getByLabelText('1d'), '1-2');
    await user.type(screen.getByLabelText('Action'), 'Attack with Sword');
    await user.type(screen.getByLabelText('Fellow action value'), '12');
    await user.type(screen.getByLabelText('Effect'), 'Power 25/Crit Value 10+4');

    expect(store.get(charactersAtom)[0].fellow.actions[0]).toMatchObject({
      roll: '1-2',
      name: 'Attack with Sword',
      value: '12',
      effect: 'Power 25/Crit Value 10+4',
    });

    await user.click(screen.getByRole('button', { name: 'Attack with Sword Remove' }));
    expect(store.get(charactersAtom)[0].fellow.actions).toEqual([]);
  });

  it('says so when the Action Table is empty', () => {
    renderSection(makeCharacter());

    expect(screen.getByText(/No actions on the table yet/)).toBeInTheDocument();
  });

  it('backfills fellow for characters saved before it existed', () => {
    const legacy = { ...makeCharacter() } as Partial<Character>;
    delete legacy.fellow;

    expect(CharacterSchema.parse(legacy).fellow).toEqual(EMPTY_FELLOW);
  });
});

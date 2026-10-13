import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { UniqueSkillsSection } from './UniqueSkillsSection';

function Harness({ id }: { id: string }) {
  const character = useAtomValue(charactersAtom).find((entry) => entry.id === id);
  return character ? <UniqueSkillsSection character={character} /> : null;
}

beforeEach(() => localStorage.clear());

function makeCharacter(overrides: Record<string, unknown> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return CharacterSchema.parse({
    schemaVersion: 1,
    id: 'c1',
    name: 'Rudolf',
    raceId: 'basilisk',
    background: '',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'sorcerer', level: 5 }, { classId: 'heritor', level: 2 }],
    hp: { current: 8 },
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

describe('UniqueSkillsSection', () => {
  it('is hidden for a race without unique skills', () => {
    renderSection(makeCharacter({ raceId: 'human' }));
    expect(screen.queryByRole('heading', { name: 'Unique skills' })).not.toBeInTheDocument();
  });

  it('offers a Basilisk its Evil Eyes and adds one at rank B', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    const select = screen.getByLabelText('Add a skill');
    const names = within(select).getAllByRole('option').map((option) => option.textContent);
    expect(names).toContain('Evil Eye of Petrification');
    expect(names).not.toContain('Fire Weapon');

    await user.selectOptions(select, 'evil-eye-of-petrification');
    await user.click(screen.getByRole('button', { name: 'Add' }));
    expect(store.get(charactersAtom)[0].uniqueSkills).toEqual([{ id: 'evil-eye-of-petrification', rank: 'B' }]);
    expect(screen.getByText(/Taken automatically at creation/)).toBeInTheDocument();
    expect(screen.getByText('5 MP')).toBeInTheDocument();
  });

  it('works the Standard Value out of the Adventurer level and the Spirit modifier, and follows the rank chosen', async () => {
    const user = userEvent.setup();
    // sorcerer 5 + heritor 2 = Adventurer level 5 (the highest class); SPR 8 gives +1
    const store = renderSection(makeCharacter({ uniqueSkills: [{ id: 'evil-eye-of-destruction', rank: 'B' }] }));
    const row = screen.getByRole('row', { name: /Evil Eye of Destruction/ });
    expect(within(row).getByText(/^6/)).toBeInTheDocument();
    expect(within(row).getByText('4 MP')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Evil Eye of Destruction Rank'), 'S');
    expect(store.get(charactersAtom)[0].uniqueSkills).toEqual([{ id: 'evil-eye-of-destruction', rank: 'S' }]);
    expect(screen.getByText('12 MP')).toBeInTheDocument();
  });

  it('removes a skill', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ uniqueSkills: [{ id: 'evil-eye-of-stagnation', rank: 'B' }] }));
    await user.click(screen.getByRole('button', { name: 'Evil Eye of Stagnation Remove' }));
    expect(store.get(charactersAtom)[0].uniqueSkills).toEqual([]);
  });
});

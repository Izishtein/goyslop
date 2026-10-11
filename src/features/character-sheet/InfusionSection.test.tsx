import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { InfusionSection } from './InfusionSection';

function Harness({ id }: { id: string }) {
  const character = useAtomValue(charactersAtom).find((entry) => entry.id === id);
  return character ? <InfusionSection character={character} /> : null;
}

beforeEach(() => localStorage.clear());

function makeCharacter(overrides: Record<string, unknown> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return CharacterSchema.parse({
    schemaVersion: 1,
    id: 'c1',
    name: 'Rudolf',
    raceId: 'human',
    background: '',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'heritor', level: 3 }],
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

describe('InfusionSection', () => {
  it('is hidden for a character with no Heritor levels and no Infusions', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }] }));
    expect(screen.queryByRole('heading', { name: 'Infusions' })).not.toBeInTheDocument();
  });

  it('counts one slot per Heritor level and adds an Infusion from the catalogue', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    expect(screen.getByText('(0 / 3)')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Add an Infusion from the catalog'), 'resilient-core-i');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(store.get(charactersAtom)[0].infusions).toEqual([{ id: expect.any(String), name: 'Resilient Core I' }]);
    expect(screen.getByText('(1 / 3)')).toBeInTheDocument();
    expect(screen.getByText("Main Section's Defense +1, Max HP +5")).toBeInTheDocument();
  });

  it('groups the picker by race and offers each Infusion only once', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ infusions: [{ id: 'a', name: 'Darkvision' }] }));
    const picker = screen.getByLabelText('Add an Infusion from the catalog');
    expect(within(picker).getAllByRole('group').map((group) => group.getAttribute('label'))).toEqual([
      'Open to every Heritor',
      'Diablo only',
      'Drake only',
      'Basilisk only',
      'Scissorscorpion only',
    ]);
    expect(within(picker).getByRole('option', { name: /^Darkvision/ })).toBeDisabled();
    await user.selectOptions(picker, 'tenacious-infusion-i');
    expect(screen.getByRole('button', { name: 'Add' })).toBeEnabled();
  });

  it('warns of a missing prerequisite and of a tier above the Heritor level, and clears them once met', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ infusions: [{ id: 'a', name: 'Resilient Core II' }, { id: 'b', name: 'Resilient Core Mastery' }] }));
    expect(screen.getByText('Needs: Resilient Core I')).toBeInTheDocument();
    expect(screen.getByText('needs Heritor level 5')).toBeInTheDocument();
    expect(screen.getByText('needs Heritor level 10')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Add an Infusion from the catalog'), 'resilient-core-i');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.queryByText('Needs: Resilient Core I')).not.toBeInTheDocument();
    expect(store.get(charactersAtom)[0].infusions).toHaveLength(3);
  });

  it('flags more Infusions than Heritor levels, and removes one', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ classes: [{ classId: 'heritor', level: 1 }], infusions: [{ id: 'a', name: 'Core of Holding' }, { id: 'b', name: 'Darkvision' }] }));
    expect(screen.getByText('(2 / 1)').className).toMatch(/overspent/);

    await user.click(screen.getByRole('button', { name: 'Darkvision Remove' }));

    expect(store.get(charactersAtom)[0].infusions.map((entry) => entry.name)).toEqual(['Core of Holding']);
  });

  it('stays after a class change while Infusions are recorded, and an old character reads with none', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 1 }], infusions: [{ id: 'a', name: 'Darkvision' }] }));
    expect(screen.getByRole('heading', { name: 'Infusions' })).toBeInTheDocument();
    const older = { ...makeCharacter() } as Record<string, unknown>;
    delete older.infusions;
    expect(CharacterSchema.parse(older).infusions).toEqual([]);
  });
});

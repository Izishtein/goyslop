import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { EMPTY_INVENTORY, EMPTY_PERFORMANCE, EMPTY_FELLOW, EMPTY_GEOMANCER_QI, type Character } from '../../types/character';
import { WorkSkillsSection } from './WorkSkillsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <WorkSkillsSection character={character} />;
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

describe('WorkSkillsSection catalog', () => {
  it('adds a skill from the catalog at level 1', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add work skill from catalog'), 'blacksmith-skill');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(store.get(charactersAtom)[0].workSkills).toEqual([
      { id: expect.any(String), name: 'Blacksmith Skill', category: 'craftsmen', level: 1, notes: '' },
    ]);
  });

  it('groups the catalog by the book\'s six categories', () => {
    renderSection(makeCharacter());

    const groups = [...screen.getByLabelText('Add work skill from catalog').querySelectorAll('optgroup')].map((group) => group.label);

    expect(groups).toEqual([
      'Towns and Villages',
      'Craftsmen and Workshops',
      'Knowledge, Research, and Arts',
      'Castles, Temples, Courts, and Military',
      'Suburbs (Countryside, Mountains and Highways)',
      'Suburbs (Rivers and Seas)',
    ]);
  });

  it('greys out a skill the character already took', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add work skill from catalog'), 'merchant-skill');
    await user.click(screen.getByRole('button', { name: 'Add' }));

    expect(screen.getByRole('option', { name: /^Merchant Skill/ })).toBeDisabled();
  });

  it('suggests catalog names on a hand-written row without binding it to them', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add by hand' }));

    const nameField = screen.getByLabelText('Name');
    const list = document.getElementById(nameField.getAttribute('list') ?? '');
    expect([...(list?.querySelectorAll('option') ?? [])].map((option) => option.value)).toContain('Merchant Skill');

    await user.type(nameField, 'Something the GM approved');
    expect(store.get(charactersAtom)[0].workSkills[0].name).toBe('Something the GM approved');
  });

  it('edits level and notes independently per row', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      makeCharacter({ workSkills: [{ id: 'w1', name: 'Merchant Skill', category: 'towns', level: 1, notes: '' }] }),
    );

    const levelField = screen.getByLabelText('Level');
    await user.clear(levelField);
    await user.type(levelField, '5');
    await user.type(screen.getByLabelText("What it's good for"), 'Appraise checks');

    expect(store.get(charactersAtom)[0].workSkills[0]).toMatchObject({ level: 5, notes: 'Appraise checks' });
  });

  it('removes only the skill whose Remove button was pressed', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      makeCharacter({
        workSkills: [
          { id: 'w1', name: 'Merchant Skill', category: 'towns', level: 3, notes: '' },
          { id: 'w2', name: 'Blacksmith Skill', category: 'craftsmen', level: 2, notes: '' },
        ],
      }),
    );

    const row = screen.getByDisplayValue('Merchant Skill').closest('tr');
    await user.click(within(row as HTMLElement).getByRole('button', { name: /Remove/ }));

    expect(store.get(charactersAtom)[0].workSkills.map((entry) => entry.name)).toEqual(['Blacksmith Skill']);
  });
});

describe('WorkSkillsSection collapse', () => {
  it('collapses by default for a character with no Work Skills yet', () => {
    renderSection(makeCharacter());
    const details = screen.getByLabelText('Add work skill from catalog').closest('details');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
  });

  it('starts open for a character who already has a Work Skill', () => {
    renderSection(makeCharacter({ workSkills: [{ id: 'w1', name: 'Merchant Skill', category: 'towns', level: 1, notes: '' }] }));
    const details = screen.getByLabelText('Add work skill from catalog').closest('details');
    expect(details).toHaveAttribute('open');
  });
});

describe('WorkSkillsSection guideline', () => {
  it('flags a character carrying more than 10 levels total', () => {
    renderSection(
      makeCharacter({
        workSkills: [
          { id: 'w1', name: 'Merchant Skill', category: 'towns', level: 5, notes: '' },
          { id: 'w2', name: 'Blacksmith Skill', category: 'craftsmen', level: 6, notes: '' },
        ],
      }),
    );

    const count = screen.getByText('11 / 10');
    expect(count.className).toMatch(/overspent/);
  });

  it('does not flag a character within the guideline', () => {
    renderSection(makeCharacter({ workSkills: [{ id: 'w1', name: 'Merchant Skill', category: 'towns', level: 5, notes: '' }] }));

    const count = screen.getByText('5 / 10');
    expect(count.className).not.toMatch(/overspent/);
  });
});

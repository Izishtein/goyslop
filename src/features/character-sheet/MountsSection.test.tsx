import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { MountsSection } from './MountsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <MountsSection character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Jockey',
    raceId: 'human',
    background: 'Jockey',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'rider', level: 5 }],
    hp: { current: 8 },
    mp: { current: 0 },
    statusEffects: [],
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

describe('MountsSection', () => {
  it('stays out of the way of a character with no Rider levels and no mount', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 3 }] }));
    expect(screen.queryByRole('heading', { name: 'Mounts' })).not.toBeInTheDocument();
  });

  it('adds a mount at the level its rider can actually use', async () => {
    const user = userEvent.setup();
    // Rider 5 plus Fighter 3 is Adventurer Level 8, above the Horse's ceiling of 4.
    const store = renderSection(
      makeCharacter({ classes: [{ classId: 'rider', level: 5 }, { classId: 'fighter', level: 3 }] }),
    );

    await user.selectOptions(screen.getByLabelText('Mount from catalog'), 'horse');
    await user.click(screen.getByRole('button', { name: 'Add mount from catalog' }));

    const [mount] = store.get(charactersAtom)[0].mounts;
    expect(mount).toMatchObject({ mountId: 'horse', name: 'Horse', level: 4, contract: 'rental' });
    expect(mount.sections).toHaveLength(1);
    expect(mount.sections[0]).toMatchObject({ attack: 'Hoof', accuracy: 6, damage: '2d+3', defense: 4, hpMax: 34, hpCurrent: 34 });
  });

  it('refills the stat block when the level changes', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Mount from catalog'), 'dowles');
    await user.click(screen.getByRole('button', { name: 'Add mount from catalog' }));
    await user.selectOptions(screen.getByLabelText('Level'), '2');

    expect(store.get(charactersAtom)[0].mounts[0].sections[0]).toMatchObject({ hpMax: 20, accuracy: 4, damage: '2d+3' });
  });

  it('adds +10 Max HP to every section when the mount is bought outright', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ classes: [{ classId: 'rider', level: 10 }] }));

    await user.selectOptions(screen.getByLabelText('Mount from catalog'), 'tilgris');
    await user.click(screen.getByRole('button', { name: 'Add mount from catalog' }));
    expect(store.get(charactersAtom)[0].mounts[0].sections.map((s) => s.hpMax)).toEqual([83, 93]);

    // A Proprietary Contract is what grants the +10, and it applies to every section.
    await user.selectOptions(screen.getByLabelText('Contract'), 'proprietary');
    expect(store.get(charactersAtom)[0].mounts[0].sections.map((s) => s.hpMax)).toEqual([93, 103]);
  });

  it('gives a multi-section mount one row per section and resistances only on the main one', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ classes: [{ classId: 'rider', level: 10 }] }));

    await user.selectOptions(screen.getByLabelText('Mount from catalog'), 'tilgris');
    await user.click(screen.getByRole('button', { name: 'Add mount from catalog' }));

    const rows = screen.getAllByRole('row').slice(1);
    expect(rows).toHaveLength(2);
    // Front is the main section: it carries Fortitude 13 / Willpower 12; Back shows dashes.
    expect(within(rows[0]).getAllByRole('cell').at(-4)).toHaveTextContent('13');
    expect(within(rows[1]).getAllByRole('cell').at(-4)).toHaveTextContent('—');
  });

  it('offers no mount the jockey is too junior to handle', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'rider', level: 1 }] }));

    const options = [...screen.getByLabelText('Mount from catalog').querySelectorAll('option')];
    const horse = options.find((option) => option.value === 'horse');
    const dragon = options.find((option) => option.value === 'lesser-dragon');
    expect(horse?.disabled).toBe(false);
    // A Lesser Dragon needs Rider 13; the option stays visible but cannot be picked.
    expect(dragon?.disabled).toBe(true);
  });

  it('still takes a mount typed in by hand', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add mount by hand' }));

    const [mount] = store.get(charactersAtom)[0].mounts;
    expect(mount).toMatchObject({ mountId: '', name: '' });
    expect(mount.sections).toHaveLength(1);
  });
});

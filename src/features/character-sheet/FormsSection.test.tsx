import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { FormsSection } from './FormsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((entry) => entry.id === id);
  return character ? <FormsSection character={character} /> : null;
}

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const score = (base: number) => ({ base, correction: 0, growth: 0, itemBonus: 0 });
  return {
    schemaVersion: 1,
    id: 'c1',
    name: 'Rudolf',
    raceId: 'basilisk',
    background: 'Shapeshifter',
    abilities: { DEX: score(18), AGI: score(18), STR: score(24), VIT: score(26), INT: score(24), SPR: score(21) },
    classes: [
      { classId: 'fighter', level: 5 },
      { classId: 'sorcerer', level: 3 },
      { classId: 'heritor', level: 3 },
    ],
    hp: { current: 20 },
    mp: { current: 5 },
    statusEffects: [],
    abyssCorruptionLevel: 0,
    deity: '',
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
    makoStone: 0,
    infusions: [
      { id: 'i1', name: 'Section Quick Reaction I' },
      { id: 'i2', name: 'Tenacious Infusion I' },
    ],
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

describe('FormsSection', () => {
  it('stays off the sheet of a race without sections', () => {
    renderSection(makeCharacter({ raceId: 'human' }));
    expect(screen.queryByRole('heading', { name: 'Forms and sections' })).toBeNull();
  });

  it('shows the shapeshift button and no sections before the change', () => {
    renderSection(makeCharacter());
    expect(screen.getByRole('button', { name: 'Shapeshift: Monstrous Form (Major Action)' })).toBeInTheDocument();
    expect(screen.queryByRole('table')).toBeNull();
    expect(screen.getByText(/water\/ice damage \+3/)).toBeInTheDocument();
  });

  it('shapeshifts into the book example: Body 37/16 Defense 5, Evil Eye 21/16 Defense 1, Head Defense 2', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: /Shapeshift/ }));

    const rows = within(screen.getByRole('table')).getAllByRole('row');
    const cells = (name: string) => within(rows.find((row) => within(row).queryByText(name))!).getAllByRole('cell');
    expect(cells('Body')[1]).toHaveTextContent('37 / 37');
    expect(cells('Body')[3]).toHaveTextContent('5');
    expect(cells('Evil Eye')[1]).toHaveTextContent('21 / 21');
    expect(cells('Evil Eye')[3]).toHaveTextContent('1');
    expect(cells('Head')[3]).toHaveTextContent('2');
    expect(screen.getByText(/Intelligence −12/)).toBeInTheDocument();
    expect(store.get(charactersAtom)[0].hp.current).toBe(41);
  });

  it('hurts an other section through its Defense, magic ignoring it, and heals it', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    await user.click(screen.getByRole('button', { name: /Shapeshift/ }));

    await user.type(screen.getByLabelText('Body Amount'), '12');
    await user.click(within(screen.getByLabelText('Body Amount').closest('td')!).getByRole('button', { name: 'Damage' }));
    expect(store.get(charactersAtom)[0].form?.parts.body.hp).toBe(30);

    await user.click(screen.getByLabelText('Magic damage (ignores Defense)'));
    await user.type(screen.getByLabelText('Body Amount'), '10');
    await user.click(within(screen.getByLabelText('Body Amount').closest('td')!).getByRole('button', { name: 'Damage' }));
    expect(store.get(charactersAtom)[0].form?.parts.body.hp).toBe(20);

    await user.type(screen.getByLabelText('Body Amount'), '5');
    await user.click(within(screen.getByLabelText('Body Amount').closest('td')!).getByRole('button', { name: 'Heal' }));
    expect(store.get(charactersAtom)[0].form?.parts.body.hp).toBe(25);
  });

  it('asks for a Death Check at 0 HP and marks the section unconscious or disabled', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    await user.click(screen.getByRole('button', { name: /Shapeshift/ }));
    await user.click(screen.getByLabelText('Magic damage (ignores Defense)'));
    await user.type(screen.getByLabelText('Evil Eye Amount'), '30');
    await user.click(within(screen.getByLabelText('Evil Eye Amount').closest('td')!).getByRole('button', { name: 'Damage' }));
    expect(store.get(charactersAtom)[0].form?.parts['evil-eye'].hp).toBe(-9);

    vi.spyOn(Math, 'random').mockReturnValueOnce(0.5).mockReturnValueOnce(0.5);
    await user.click(screen.getByRole('button', { name: 'Death Check' }));
    expect(store.get(charactersAtom)[0].form?.parts['evil-eye'].status).toBe('unconscious');
    expect(screen.getByText('unconscious')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Wake' }));
    expect(store.get(charactersAtom)[0].form?.parts['evil-eye']).toMatchObject({ status: 'ok', hp: 1 });
  });

  it('returns to the original form, keeping the Main Section HP', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    await user.click(screen.getByRole('button', { name: /Shapeshift/ }));
    await user.click(screen.getByRole('button', { name: 'Return to the original form' }));
    expect(screen.queryByRole('table')).toBeNull();
    expect(store.get(charactersAtom)[0].hp.current).toBe(41);
  });

  it('shows the innate weapon of the section at the rank the Infusions give', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ infusions: [{ id: 'a', name: 'Innate Weapons Mastery A' }] }));
    await user.click(screen.getByRole('button', { name: /Shapeshift/ }));
    expect(screen.getByText(/Sharp Bite/)).toBeInTheDocument();
    expect(screen.getByText(/^Talons/)).toBeInTheDocument();
  });

  it('puts a Scissorscorpion in its sections at once, made at the maxima', async () => {
    const store = renderSection(
      makeCharacter({ raceId: 'scissorscorpion', classes: [{ classId: 'fighter', level: 4 }, { classId: 'heritor', level: 2 }], infusions: [] }),
    );
    expect(await screen.findByRole('table')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Shapeshift/ })).toBeNull();
    expect(store.get(charactersAtom)[0].form?.parts.scorpion).toMatchObject({ hp: 24, mp: 10 });
    expect(screen.getAllByText(/Evasion 5/)).toHaveLength(3);
  });

  it('is read back by the character schema, and a character without it still parses', () => {
    const shaped = { ...makeCharacter(), form: { transformed: true, parts: { body: { hp: 3, mp: 1, status: 'ok' as const, bonus: { hp: 0, mp: 0, defense: 0 } } } } };
    expect(CharacterSchema.parse(shaped).form?.parts.body.hp).toBe(3);
    expect(CharacterSchema.parse(makeCharacter()).form).toBeUndefined();
  });
});

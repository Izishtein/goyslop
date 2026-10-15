import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { RacialAbilitiesSection } from './RacialAbilitiesSection';
import { SoulscarsSection } from './SoulscarsSection';

function Harness({ id }: { id: string }) {
  const character = useAtomValue(charactersAtom).find((entry) => entry.id === id);
  return character ? <>
      <RacialAbilitiesSection character={character} />
      <SoulscarsSection character={character} />
    </> : null;
}

beforeEach(() => localStorage.clear());

function makeCharacter(overrides: Record<string, unknown> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return CharacterSchema.parse({
    schemaVersion: 1,
    id: 'c1',
    name: 'Rudolf',
    raceId: 'kobold',
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

describe('SoulscarsSection', () => {
  it('is only the count and the resurrection button for a race without soulscars', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ raceId: 'human' }));
    expect(screen.getByRole('spinbutton', { name: 'Soulscars' })).toHaveValue(0);
    expect(screen.queryByLabelText('Soulscar Shackles worn')).not.toBeInTheDocument();
    expect(screen.queryByText(/Mirror/)).not.toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Resurrected: +1 soulscar' }));
    expect(store.get(charactersAtom)[0].racial?.soulscars).toBe(1);
    expect(screen.getByLabelText('Soulscar Shackles worn')).toBeInTheDocument(); // there is a scar now
  });

  it('warns at five soulscars: a Revenant', async () => {
    renderSection(makeCharacter({ raceId: 'human', racial: { soulscars: 4 } }));
    expect(screen.queryByText(/Revenant/)).not.toBeInTheDocument();
    await userEvent.setup().click(screen.getByRole('button', { name: 'Resurrected: +1 soulscar' }));
    expect(screen.getByText(/Revenant/)).toBeInTheDocument();
  });

  it('starts a Nightmare at one soulscar', () => {
    renderSection(makeCharacter({ raceId: 'nightmare' }));
    expect(screen.getByRole('spinbutton', { name: 'Soulscars' })).toHaveValue(1);
  });

  it('starts an Alv at one soulscar and a Weakling at two, as Arcane Relic prints them', () => {
    renderSection(makeCharacter({ raceId: 'weakling' }));
    expect(screen.getByRole('spinbutton', { name: 'Soulscars' })).toHaveValue(2);
  });

  it('lets an Alv drain MP by Spirit Modifier + soulscars, as often as the Spirit Modifier a day', async () => {
    const user = userEvent.setup();
    // SPR 12 → modifier 2; the Alv has entered 3 soulscars → 5 MP, twice a day
    const twelve = { base: 12, correction: 0, growth: 0, itemBonus: 0 };
    const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
    const store = renderSection(makeCharacter({ raceId: 'alv', abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: twelve }, classes: [{ classId: 'sorcerer', level: 3 }], racial: { soulscars: 3 }, mp: { current: 0 } }));
    const button = screen.getByRole('button', { name: /Spirit Drain: take 5 MP/ });
    await user.click(button);
    expect(store.get(charactersAtom)[0].mp.current).toBe(5);
    expect(screen.getByText(/1 of 2 left today/)).toBeInTheDocument();
    await user.click(button);
    expect(store.get(charactersAtom)[0].mp.current).toBe(10);
    expect(button).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'New day' }));
    expect(button).toBeEnabled();
  });

  it('starts from the race, and the shackles take a status effect that follows the count', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());
    const count = screen.getByRole('spinbutton', { name: 'Soulscars' });
    expect(count).toHaveValue(1); // Kobold
    await user.click(screen.getByLabelText('Soulscar Shackles worn'));
    expect(store.get(charactersAtom)[0].statusEffects[0]).toMatchObject({ name: 'Soulscar Shackles', modifiers: [{ field: 'custom', customLabel: 'all skill checks', value: -4 }] });
    expect(screen.getByText(/Speed 1/)).toBeInTheDocument();
    await user.clear(count);
    await user.type(count, '2');
    expect(store.get(charactersAtom)[0].statusEffects[0].modifiers[0].value).toBe(-2);
    await user.clear(count);
    await user.type(count, '3');
    expect(store.get(charactersAtom)[0].statusEffects).toEqual([]);
    expect(screen.getByText(/no hold/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Back to the race’s 1' }));
    expect(store.get(charactersAtom)[0].racial?.soulscars).toBeUndefined();
    expect(store.get(charactersAtom)[0].statusEffects).toHaveLength(1); // 1 soulscar: shackles hold again
  });

  it('gives the sums of the items that run on the count', async () => {
    renderSection(makeCharacter({ classes: [{ classId: 'ranger', level: 3 }] }));
    expect(screen.getByText(/Tinted Potion heals Power 25/)).toBeInTheDocument(); // 20 + 3 + INT mod 1 (8 / 6) + 1
    expect(screen.getByText(/Max HP \+5/)).toBeInTheDocument();
  });

  it('judges the Mirror by a margin of 4 over the eye', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());
    await user.type(screen.getByLabelText('Your Willpower result'), '17');
    await user.type(screen.getByLabelText('Eye’s Success Value'), '13');
    expect(screen.getByRole('status')).toHaveTextContent(/^Reflected/);
    await user.clear(screen.getByLabelText('Eye’s Success Value'));
    await user.type(screen.getByLabelText('Eye’s Success Value'), '14');
    expect(screen.getByRole('status')).toHaveTextContent(/^Not reflected/);
  });
});

import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import type { Character } from '../../types/character';
import { CharacterSheetView } from './CharacterSheetView';

/** Mirrors how App.tsx re-derives the live character from the atom, so edits made via
 * useUpdateCharacter are reflected back into the props CharacterSheetView renders with. */
function SheetHarness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <CharacterSheetView character={character} />;
}

beforeEach(() => {
  localStorage.clear();
});

function makeCharacter(): Character {
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Test Hero',
    raceId: 'human',
    background: 'Artificer',
    abilities: {
      DEX: { base: 8, correction: 0, growth: 0, itemBonus: 0 },
      AGI: { base: 8, correction: 0, growth: 0, itemBonus: 0 },
      STR: { base: 4, correction: 2, growth: 0, itemBonus: 0 },
      VIT: { base: 4, correction: 0, growth: 0, itemBonus: 0 },
      INT: { base: 9, correction: 0, growth: 0, itemBonus: 0 },
      SPR: { base: 9, correction: 0, growth: 0, itemBonus: 0 },
    },
    classes: [{ classId: 'fighter', level: 2 }],
    hp: { current: 10 },
    mp: { current: 0 },
    statusEffects: [],
    equipment: { weapons: [], armor: [], shield: null, accessories: [] },
    currency: { cash: 1200, savings: 0, debt: 0 },
    combatFeats: [],
    experience: { total: 0, spent: 0 },
    spells: [],
    growthLog: [],
    reputation: 0,
    profile: { gender: '', age: '', avatar: '' },
    notes: { story: '', goals: '', gm: '' },
    connections: [],
  };
}

function renderSheet(character: Character) {
  const store = createStore();
  store.set(charactersAtom, [character]);
  render(
    <Provider store={store}>
      <SheetHarness id={character.id} />
    </Provider>,
  );
  return store;
}

describe('CharacterSheetView', () => {
  it('recomputes STR total/modifier and Extra Damage when growth is edited', async () => {
    const user = userEvent.setup();
    const store = renderSheet(makeCharacter());

    expect(screen.getByLabelText('STR Total')).toHaveTextContent('6'); // base 4 + correction 2

    const strGrowth = screen.getByLabelText('STR Growth');
    await user.clear(strGrowth);
    await user.type(strGrowth, '3');

    expect(screen.getByLabelText('STR Total')).toHaveTextContent('9'); // 4 + 2 + 3
    expect(screen.getByLabelText('STR Modifier')).toHaveTextContent('+1');

    // Fighter Lv2, STR total 9 -> modifier +1 -> Extra Damage = 2 + 1 = 3
    // Scope to the Combat stats card: several sections render tables, and their order
    // on the sheet is not something this test should depend on.
    const combatSection = screen.getByRole('heading', { name: /combat stats/i }).closest('section') as HTMLElement;
    const combatTable = within(combatSection).getByRole('table');
    const fighterRow = within(combatTable).getByRole('row', { name: /Fighter/ });
    expect(within(fighterRow).getAllByRole('cell')[3]).toHaveTextContent('3');

    expect(store.get(charactersAtom)[0].abilities.STR.growth).toBe(3);
  });

  it('adding a weapon computes Total Accuracy from the primary warrior class level', async () => {
    const user = userEvent.setup();
    renderSheet(makeCharacter());

    await user.click(screen.getByRole('button', { name: /add weapon/i }));

    // Fighter Lv2, DEX total 8 -> modifier +1 -> Total Accuracy = 2 + 1 + 0 = 3
    const weaponsHeading = screen.getByRole('heading', { name: /weapons/i });
    const weaponsTable = weaponsHeading.nextElementSibling as HTMLElement;
    const dataRow = within(weaponsTable).getAllByRole('row')[1];
    expect(within(dataRow).getAllByRole('cell')[4]).toHaveTextContent('3');
  });

  it('applying a status effect modifier updates Fortitude, and Next round ticks/expires it', async () => {
    const user = userEvent.setup();
    const store = renderSheet(makeCharacter());

    // Fighter Lv2, VIT total 4 -> modifier +0 -> base Fortitude = 2.
    expect(screen.getByLabelText('Fortitude')).toHaveTextContent('2');

    // Draft modifier defaults to field "accuracy", value -1; only the field needs changing.
    await user.type(screen.getByLabelText('Name', { selector: '#effect-name' }), 'Poison');
    await user.selectOptions(screen.getByLabelText('Field'), 'fortitude');
    const roundsInput = screen.getByLabelText('Rounds', { selector: '#effect-rounds' });
    await user.clear(roundsInput);
    await user.type(roundsInput, '1');

    await user.click(screen.getByRole('button', { name: /^add effect$/i }));

    expect(screen.getByLabelText('Fortitude')).toHaveTextContent('1'); // 2 + (-1)
    expect(screen.getByText('Poison')).toBeInTheDocument();
    expect(screen.getByText(/1 round left/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /next round/i }));

    expect(store.get(charactersAtom)[0].statusEffects).toHaveLength(0);
    expect(screen.getByLabelText('Fortitude')).toHaveTextContent('2');
  });
});

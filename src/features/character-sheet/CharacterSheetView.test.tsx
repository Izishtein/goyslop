import { fireEvent, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { EMPTY_INVENTORY, type Character, EMPTY_PERFORMANCE, EMPTY_FELLOW, EMPTY_GEOMANCER_QI } from '../../types/character';
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
    abyssCorruptionLevel: 0,
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
    // The section now holds two tables — the class rows and the check packages — so go
    // straight for the row rather than assuming which table comes first.
    const fighterRow = within(combatSection).getByRole('row', { name: /Fighter/ });
    expect(within(fighterRow).getAllByRole('cell')[3]).toHaveTextContent('3');

    expect(store.get(charactersAtom)[0].abilities.STR.growth).toBe(3);
  });

  it('adding a weapon computes Total Accuracy from the primary warrior class level', async () => {
    const user = userEvent.setup();
    renderSheet(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add weapon' }));

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

describe('CharacterSheetView HP and MP limits', () => {
  it('refuses a current HP above the maximum the character actually has', async () => {
    const user = userEvent.setup();
    const store = renderSheet(makeCharacter());
    const max = Number(screen.getByLabelText('HP').closest('span')?.textContent?.match(/\/ (\d+)/)?.[1]);

    const field = screen.getByLabelText('HP');
    await user.clear(field);
    await user.type(field, String(max + 12));

    expect(store.get(charactersAtom)[0].hp.current).toBe(max);
  });

  it('leaves negative HP alone — below zero is what a Death Check is for', () => {
    const store = renderSheet(makeCharacter());

    // fireEvent, not userEvent: typing a minus keystroke by keystroke goes through the
    // intermediate value "-", which is not a number, and a controlled field drops it.
    fireEvent.change(screen.getByLabelText('HP'), { target: { value: '-4' } });

    expect(store.get(charactersAtom)[0].hp.current).toBe(-4);
  });

  it('shows a stored value that outlived its maximum as the maximum', () => {
    // Drop a level of VIT and yesterday's total becomes impossible; the bar clamped to
    // 100% while the number kept claiming otherwise.
    renderSheet({ ...makeCharacter(), hp: { current: 9999 } });

    const field = screen.getByLabelText('HP') as HTMLInputElement;
    const max = Number(field.closest('span')?.textContent?.match(/\/ (\d+)/)?.[1]);
    expect(Number(field.value)).toBe(max);
  });

  it('keeps MP out of the negatives — unlike HP there is no state below empty', () => {
    const store = renderSheet(makeCharacter());

    fireEvent.change(screen.getByLabelText('MP'), { target: { value: '-3' } });

    expect(store.get(charactersAtom)[0].mp.current).toBe(0);
  });

  it('applies damage typed into the HP panel to the current value', async () => {
    const user = userEvent.setup();
    const store = renderSheet(makeCharacter());
    const before = Number((screen.getByLabelText('HP') as HTMLInputElement).value);

    // Both header gauges open the same panel, hence getAllBy.
    await user.click(screen.getAllByRole('button', { name: 'Edit HP and MP' })[0]);
    await user.type(screen.getByLabelText('HP Amount'), '4');
    await user.click(screen.getByRole('button', { name: 'HP Subtract' }));

    expect(store.get(charactersAtom)[0].hp.current).toBe(before - 4);
  });

  it('edits the purse from the header, beside HP and MP', async () => {
    const user = userEvent.setup();
    const store = renderSheet(makeCharacter());

    const cash = screen.getByLabelText('Cash');
    await user.clear(cash);
    await user.type(cash, '340');

    expect(store.get(charactersAtom)[0].currency.cash).toBe(340);
  });

  it('forces every collapsed section open for print and restores it afterward', () => {
    // makeCharacter() is a Fighter with no spells/schools/work skills, so Spells/Schools/
    // Work Skills all default collapsed — exactly the paper-vs-screen gap the beforeprint/
    // afterprint listeners exist to close.
    renderSheet(makeCharacter());
    const collapsible = () => [...document.querySelectorAll<HTMLDetailsElement>('details[data-collapsible]')];

    expect(collapsible().length).toBeGreaterThan(0);
    expect(collapsible().some((details) => details.open)).toBe(false);

    fireEvent(window, new Event('beforeprint'));
    expect(collapsible().every((details) => details.open)).toBe(true);

    fireEvent(window, new Event('afterprint'));
    expect(collapsible().some((details) => details.open)).toBe(false);
  });
});

describe('CharacterSheetView tabs', () => {
  it('opens on Gear and switches panels without unmounting the others', async () => {
    const user = userEvent.setup();
    renderSheet(makeCharacter());

    expect(screen.getByRole('tab', { name: 'Gear' })).toHaveAttribute('aria-selected', 'true');
    expect(document.getElementById('sheet-panel-equipment')).toHaveAttribute('data-active');

    await user.click(screen.getByRole('tab', { name: 'Combat' }));

    expect(document.getElementById('sheet-panel-combat')).toHaveAttribute('data-active');
    expect(document.getElementById('sheet-panel-equipment')).not.toHaveAttribute('data-active');
    /* Hidden, not unmounted: the print stylesheet shows every panel, and a half-filled row
       has to survive a look at another tab. */
    expect(screen.getByRole('heading', { name: /^equipment$/i })).toBeInTheDocument();
  });

  it('offers no Mounts tab to a character who does not ride', () => {
    renderSheet(makeCharacter());

    expect(screen.queryByRole('tab', { name: 'Mounts' })).not.toBeInTheDocument();
    expect(document.getElementById('sheet-panel-mounts')).toBeNull();
  });

  it('offers the Mounts tab to a Rider', () => {
    renderSheet({ ...makeCharacter(), classes: [{ classId: 'rider', level: 1 }] });

    expect(screen.getByRole('tab', { name: 'Mounts' })).toBeInTheDocument();
  });
});

describe('CharacterSheetView drawers', () => {
  it('opens the status effects panel from the header and closes it with Escape', async () => {
    const user = userEvent.setup();
    renderSheet(makeCharacter());

    // The drawer wrapper carries the open flag; the dialog itself is its child, and both
    // stay mounted so that print (and a half-typed effect) keep their contents.
    const drawer = screen.getByRole('dialog', { name: 'Status effects' }).parentElement as HTMLElement;
    expect(drawer).not.toHaveAttribute('data-open');

    await user.click(screen.getByRole('button', { name: 'Status effects' }));
    expect(drawer).toHaveAttribute('data-open');

    await user.keyboard('{Escape}');
    expect(drawer).not.toHaveAttribute('data-open');
  });

  it('shows how many effects are running on the button that opens them', async () => {
    const user = userEvent.setup();
    renderSheet(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Status effects' }));
    await user.type(screen.getByLabelText('Name', { selector: '#effect-name' }), 'Poison');
    await user.click(screen.getByRole('button', { name: /^add effect$/i }));

    expect(screen.getByRole('button', { name: 'Status effects (1)' })).toBeInTheDocument();
  });

  it('keeps only one panel open at a time', async () => {
    const user = userEvent.setup();
    renderSheet(makeCharacter());

    const statusDrawer = screen.getByRole('dialog', { name: 'Status effects' }).parentElement as HTMLElement;
    const notesDrawer = screen.getByRole('dialog', { name: 'Notes & connections' }).parentElement as HTMLElement;

    await user.click(screen.getByRole('button', { name: 'Status effects' }));
    await user.click(screen.getByRole('button', { name: 'Notes & connections' }));

    expect(notesDrawer).toHaveAttribute('data-open');
    expect(statusDrawer).not.toHaveAttribute('data-open');
  });
});

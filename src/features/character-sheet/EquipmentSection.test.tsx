import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { charactersAtom } from '../../state/characters';
import { CharacterSchema, EMPTY_INVENTORY, type Character, type Weapon, EMPTY_PERFORMANCE } from '../../types/character';
import { EquipmentSection } from './EquipmentSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <EquipmentSection character={character} />;
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
    classes: [{ classId: 'fighter', level: 1 }],
    hp: { current: 8 },
    mp: { current: 0 },
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

function withInventory(inventory: Partial<Character['equipment']['inventory']>, overrides: Partial<Character> = {}): Character {
  const base = makeCharacter(overrides);
  return { ...base, equipment: { ...base.equipment, inventory: { ...EMPTY_INVENTORY, ...inventory } } };
}

describe('EquipmentSection inventory', () => {
  it('adds an item row that starts at a quantity of one', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add item' }));

    expect(store.get(charactersAtom)[0].equipment.inventory.items).toEqual([
      { id: expect.any(String), name: '', quantity: 1, weight: '', notes: '' },
    ]);
  });

  it('records the name and count a player types into a row', async () => {
    const user = userEvent.setup();
    const store = renderSection(withInventory({ items: [{ id: 'i1', name: '', quantity: 1, weight: '', notes: '' }] }));

    await user.type(screen.getByLabelText('Name'), 'HP Potion');
    const quantity = screen.getByLabelText('Qty');
    await user.clear(quantity);
    await user.type(quantity, '3');

    const [item] = store.get(charactersAtom)[0].equipment.inventory.items;
    expect(item.name).toBe('HP Potion');
    expect(item.quantity).toBe(3);
  });

  it('suggests the consumables the rules name without limiting the field to them', async () => {
    const user = userEvent.setup();
    const store = renderSection(withInventory({ items: [{ id: 'i1', name: '', quantity: 1, weight: '', notes: '' }] }));

    const list = document.getElementById(screen.getByLabelText('Name').getAttribute('list') ?? '');
    expect([...(list?.querySelectorAll('option') ?? [])].map((option) => option.value)).toContain('Mana Crystal');

    await user.type(screen.getByLabelText('Name'), 'Chalk and string');
    expect(store.get(charactersAtom)[0].equipment.inventory.items[0].name).toBe('Chalk and string');
  });

  it('removes only the row whose Remove button was pressed', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      withInventory({
        items: [
          { id: 'i1', name: 'Rope', quantity: 1, weight: '', notes: '' },
          { id: 'i2', name: 'Antidote', quantity: 2, weight: '', notes: '' },
        ],
      }),
    );

    const ropeRow = screen.getByDisplayValue('Rope').closest('tr');
    await user.click(within(ropeRow as HTMLElement).getByRole('button', { name: 'Remove' }));

    expect(store.get(charactersAtom)[0].equipment.inventory.items.map((item) => item.name)).toEqual(['Antidote']);
  });

  it('keeps the ammunition counter separate from the item rows', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Ammunition type'), 'Arrows');
    const left = screen.getByLabelText('Ammunition left');
    await user.clear(left);
    await user.type(left, '20');

    const { inventory } = store.get(charactersAtom)[0].equipment;
    expect(inventory).toMatchObject({ ammoType: 'Arrows', ammoCount: 20, items: [] });
  });

  it('keeps the spending log with the money it explains', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Spending log'), 'Chain mail :: 800 G');

    expect(store.get(charactersAtom)[0].currency.spendingLog).toBe('Chain mail :: 800 G');
  });

  it('hides an untouched inventory from print', () => {
    // The block's only other content is the (print-hidden) "Add item" button, so an empty
    // one would print as a heading over nothing.
    renderSection(makeCharacter());

    expect(screen.getByRole('heading', { name: 'Inventory' }).closest('[data-print-empty]')).not.toBeNull();
  });

  it('shows the inventory on paper once anything is carried', () => {
    renderSection(withInventory({ adventurersSet: "Adventurer's Set" }));

    expect(screen.getByRole('heading', { name: 'Inventory' }).closest('[data-print-empty]')).toBeNull();
  });

  it('backfills the inventory for characters saved before it existed', () => {
    const character = makeCharacter();
    const { inventory: _inventory, ...oldEquipment } = character.equipment;
    const { spendingLog: _spendingLog, ...oldCurrency } = character.currency;

    const parsed = CharacterSchema.parse({ ...character, equipment: oldEquipment, currency: oldCurrency });

    expect(parsed.equipment.inventory).toEqual(EMPTY_INVENTORY);
    expect(parsed.currency.spendingLog).toBe('');
  });
});

function weapon(overrides: Partial<Weapon> = {}): Weapon {
  return {
    id: 'w1',
    name: 'Longsword',
    stance: '1H',
    minStr: 12,
    accuracyBonus: 0,
    power: 20,
    criticalValue: 10,
    extraDamageBonus: 0,
    rank: 'B',
    abyss: [],
    ...overrides,
  };
}

function withWeapon(w: Weapon, overrides: Partial<Character> = {}): Character {
  const base = makeCharacter(overrides);
  return { ...base, equipment: { ...base.equipment, weapons: [w] } };
}

describe('EquipmentSection Abyss Enhancement', () => {
  it('tells the player to bring equipment before there is anything to enhance', () => {
    renderSection(makeCharacter());

    expect(screen.getByText('Add a weapon, armor or a shield first.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Add enhancement' })).toBeNull();
  });

  it('burns an enhancement into the chosen weapon', async () => {
    const user = userEvent.setup();
    const store = renderSection(withWeapon(weapon()));

    await user.click(screen.getByRole('button', { name: 'Add enhancement' }));

    expect(store.get(charactersAtom)[0].equipment.weapons[0].abyss).toEqual([
      { id: expect.any(String), type: '', notes: '', curseRoll: '', curseName: '' },
    ]);
    // The enhancement row names its item as plain text, so it wraps on paper.
    const row = screen.getByLabelText('Enhancement').closest('tr');
    expect(within(row as HTMLElement).getAllByRole('cell')[0]).toHaveTextContent('Longsword');
  });

  it('offers the weapon list to a weapon and the shield list to a shield', async () => {
    const user = userEvent.setup();
    const base = makeCharacter();
    renderSection({
      ...base,
      equipment: {
        ...base.equipment,
        weapons: [weapon({ abyss: [{ id: 'e1', type: '', notes: '', curseRoll: '', curseName: '' }] })],
        shield: { id: 's1', name: 'Buckler', defenseBonus: 1, evasionBonus: 0, minStr: 8, notes: '', rank: 'B' as const, abyss: [{ id: 'e2', type: '', notes: '', curseRoll: '', curseName: '' }] },
      },
    });

    const [weaponRow, shieldRow] = screen.getAllByLabelText('Enhancement');
    const optionsOf = (select: HTMLElement) => [...select.querySelectorAll('option')].map((option) => option.value);

    // "Critical Threshold -1" is a weapon-only enhancement; "Evasion +1" is shield-only.
    expect(optionsOf(weaponRow)).toContain('Critical Threshold -1');
    expect(optionsOf(weaponRow)).not.toContain('Evasion +1');
    expect(optionsOf(shieldRow)).toContain('Evasion +1');
    await user.selectOptions(weaponRow, 'Accuracy +1');
  });

  it('stores the curse name alongside the roll that produced it', async () => {
    const user = userEvent.setup();
    const store = renderSection(withWeapon(weapon({ abyss: [{ id: 'e1', type: 'Accuracy +1', notes: '', curseRoll: '', curseName: '' }] })));

    await user.selectOptions(screen.getByLabelText('Abyss Curse'), '3-4');

    expect(store.get(charactersAtom)[0].equipment.weapons[0].abyss[0]).toMatchObject({ curseRoll: '3-4', curseName: 'Near Death' });
  });

  it('stops at the two enhancements the book allows', async () => {
    const user = userEvent.setup();
    const store = renderSection(withWeapon(weapon()));

    await user.click(screen.getByRole('button', { name: 'Add enhancement' }));
    await user.click(screen.getByRole('button', { name: 'Add enhancement' }));

    expect(store.get(charactersAtom)[0].equipment.weapons[0].abyss).toHaveLength(2);
    expect(screen.queryByRole('button', { name: 'Add enhancement' })).toBeDisabled();
    expect(screen.getByText('Every item already carries two.')).toBeInTheDocument();
  });

  it('removes an enhancement without touching the item it sat on', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      withWeapon(
        weapon({
          abyss: [
            { id: 'e1', type: 'Accuracy +1', notes: '', curseRoll: '1-1', curseName: 'Of Self-Harm' },
            { id: 'e2', type: 'Extra Damage +1', notes: '', curseRoll: '2-2', curseName: 'Difficult' },
          ],
        }),
      ),
    );

    const row = screen.getByDisplayValue('Accuracy +1').closest('tr');
    await user.click(within(row as HTMLElement).getByRole('button', { name: 'Remove' }));

    const [remaining] = store.get(charactersAtom)[0].equipment.weapons;
    expect(remaining.name).toBe('Longsword');
    expect(remaining.abyss.map((enhancement) => enhancement.type)).toEqual(['Extra Damage +1']);
  });

  it('backfills the enhancement list for equipment saved before it existed', () => {
    const character = withWeapon(weapon());
    const { abyss: _abyss, ...oldWeapon } = character.equipment.weapons[0];

    const parsed = CharacterSchema.parse({ ...character, equipment: { ...character.equipment, weapons: [oldWeapon] } });

    expect(parsed.equipment.weapons[0].abyss).toEqual([]);
  });
});

describe('EquipmentSection strength requirements', () => {
  // The fixture's STR is 8, so an 18 Min STR weapon is well out of reach.
  const heavy = () => weapon({ name: 'Greatsword', minStr: 18 });

  it('marks a weapon the character is not strong enough to wield', () => {
    renderSection(withWeapon(heavy()));

    const cell = screen.getAllByLabelText('Min STR')[0].closest('td');
    expect(cell).toHaveTextContent('⚠');
    expect(within(cell as HTMLElement).getByTitle(/Requires STR 18, this character has 8/)).toBeInTheDocument();
  });

  it('says nothing about a weapon within reach', () => {
    renderSection(withWeapon(weapon({ minStr: 8 })));

    expect(screen.getAllByLabelText('Min STR')[0].closest('td')).not.toHaveTextContent('⚠');
  });

  it('halves the requirement for a Fencer, who would otherwise be warned', () => {
    renderSection(withWeapon(heavy(), { classes: [{ classId: 'fencer', level: 3 }] }));

    // 18 halved is 9, still above STR 8 — but the message quotes the halved figure.
    expect(within(screen.getAllByLabelText('Min STR')[0].closest('td') as HTMLElement).getByTitle(/Requires STR 9/)).toBeInTheDocument();
  });

  it('does not halve armor for a Fencer — the rule is a weapon rule', () => {
    const base = makeCharacter({ classes: [{ classId: 'fencer', level: 3 }] });
    renderSection({
      ...base,
      equipment: { ...base.equipment, armor: [{ id: 'ar1', name: 'Plate', defense: 5, evasionModifier: -2, minStr: 18, rank: 'B', abyss: [] }] },
    });

    expect(within(screen.getAllByLabelText('Min STR')[0].closest('td') as HTMLElement).getByTitle(/Requires STR 18/)).toBeInTheDocument();
  });
});

describe('EquipmentSection catalog pickers', () => {
  it('fills a weapon row from the catalog, keeping the printed stance marker in the note', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    // Normal Lance prints two lines: 1H on foot and 1HR in the saddle. The mounted one is
    // the second option, and it is the reason a Jockey buys the lance at all.
    await user.selectOptions(screen.getByLabelText('Weapon from catalog'), 'normal-lance#1');
    await user.click(screen.getByRole('button', { name: 'Add weapon from catalog' }));

    const [weapon] = store.get(charactersAtom)[0].equipment.weapons;
    expect(weapon).toMatchObject({
      name: 'Normal Lance',
      stance: '1H',
      minStr: 20,
      accuracyBonus: -1,
      power: 35,
      criticalValue: 10,
      rank: 'A',
      notes: '1HR',
    });
  });

  it('starts a gun at Power 0, because the book prints none — the bullet carries it', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Weapon from catalog'), 'desperado#0');
    await user.click(screen.getByRole('button', { name: 'Add weapon from catalog' }));

    const [weapon] = store.get(charactersAtom)[0].equipment.weapons;
    expect(weapon).toMatchObject({ name: 'Desperado', power: 0, criticalValue: 11, range: '2(60m)' });
    expect(weapon.notes).toContain('Magazine 2');
  });

  it('fills an armor row and offers its SS rank, which the rank select used to be missing', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Armor from catalog'), 'imperial');
    await user.click(screen.getByRole('button', { name: 'Add armor from catalog' }));

    const [armor] = store.get(charactersAtom)[0].equipment.armor;
    expect(armor).toMatchObject({ name: 'Imperial', defense: 14, evasionModifier: -1, minStr: 30, rank: 'SS' });
    expect([...screen.getByLabelText('Rank').querySelectorAll('option')].map((option) => option.value)).toContain('SS');
  });

  it('notes Mount Protection on a shield that carries it', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Shield from catalog'), 'knight-shield');
    await user.click(screen.getByRole('button', { name: 'Add shield from catalog' }));

    expect(store.get(charactersAtom)[0].equipment.shield).toMatchObject({
      name: 'Knight Shield',
      defenseBonus: 2,
      minStr: 15,
      rank: 'A',
      notes: 'Mount Protection',
    });
  });

  it('still adds a blank row for anything the catalog does not carry', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    // The catalog holds Core III only; a Longsword out of Core I is still typed by hand.
    await user.click(screen.getByRole('button', { name: 'Add weapon' }));

    expect(store.get(charactersAtom)[0].equipment.weapons).toHaveLength(1);
    expect(store.get(charactersAtom)[0].equipment.weapons[0].name).toBe('');
  });
});

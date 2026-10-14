import { act, render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore, useAtomValue } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { encounterAtom } from '../../state/encounter';
import { CharacterSchema, type Character, EMPTY_INVENTORY, EMPTY_PERFORMANCE, EMPTY_FELLOW, EMPTY_GEOMANCER_QI } from '../../types/character';
import { SpellsSection } from './SpellsSection';

function Harness({ id }: { id: string }) {
  const characters = useAtomValue(charactersAtom);
  const character = characters.find((c) => c.id === id);
  if (!character) return null;
  return <SpellsSection character={character} />;
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
    background: 'Sorcerer',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'sorcerer', level: 2 }],
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

describe('SpellsSection', () => {
  it('adds a catalog spell with its circle and MP cost filled in', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'energy-bolt');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(store.get(charactersAtom)[0].spells).toEqual([
      { id: expect.any(String), name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 5 },
    ]);
    expect(screen.getByDisplayValue('Energy Bolt')).toBeInTheDocument();
  });

  it('offers only the schools the character actually casts from', () => {
    renderSection(makeCharacter());

    const select = screen.getByLabelText('Add from catalog');
    const options = within(select).getAllByRole('option').map((option) => option.textContent);

    expect(options.some((label) => label?.startsWith('Energy Bolt'))).toBe(true); // Truespeech
    expect(options.some((label) => label?.startsWith('Cure Wounds'))).toBe(false); // Divine
  });

  it('marks circles the class level cannot cast yet without hiding them', () => {
    renderSection(makeCharacter()); // Sorcerer Lv2 knows circles 1-2

    const groups = [...screen.getByLabelText('Add from catalog').querySelectorAll('optgroup')].map((g) => g.label);

    expect(groups[0]).toBe('Circle 1');
    expect(groups[1]).toBe('Circle 2');
    expect(groups[2]).toBe('Circle 3 — above class level');
  });

  it('greys out a spell the character already knows', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'light');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(screen.getByRole('option', { name: /^Light — 1 MP/ })).toBeDisabled();
  });

  it('offers Arcane Magic from the catalog, even though Tyrants Crypts is embargoed', async () => {
    const user = userEvent.setup();
    // Transcribed from the fan wiki, not the book — see docs/sheet-content/17-arcane-magic.md.
    const store = renderSection(makeCharacter({ classes: [{ classId: 'bibliomancer', level: 1 }] }));

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'acus-malitiae');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(store.get(charactersAtom)[0].spells[0]).toMatchObject({
      name: 'Acus Malitiae',
      school: 'Arcane Magic',
      circle: 1,
      mp: 3,
    });
  });

  it('still supports a hand-written spell alongside the catalog', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.click(screen.getByRole('button', { name: 'Add by hand' }));
    await user.type(screen.getAllByLabelText('Spell')[0], 'Thorn Bind');

    expect(store.get(charactersAtom)[0].spells[0]).toMatchObject({ name: 'Thorn Bind', school: 'Truespeech Magic' });
  });

  it('offers the supplement schools from the catalog too', async () => {
    const user = userEvent.setup();
    // Nature Magic runs to level 15, well past the ten circles of the Core schools.
    const store = renderSection(makeCharacter({ classes: [{ classId: 'druid', level: 15 }] }));

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'natural-haven');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(store.get(charactersAtom)[0].spells[0]).toMatchObject({
      name: 'Natural Haven',
      school: 'Nature Magic',
      circle: 15,
      mp: 30,
    });
  });

  it('grants Deep Magic only when the character holds both Sorcerer and Conjurer', async () => {
    const user = userEvent.setup();
    // Sorcerer 5 / Conjurer 3: Deep Magic's circle cap is the LOWER of the two (3), not the
    // higher, the opposite of every other school — see data/spells/deep.ts.
    const store = renderSection(
      makeCharacter({ classes: [{ classId: 'sorcerer', level: 5 }, { classId: 'conjurer', level: 3 }] }),
    );

    const select = screen.getByLabelText('School');
    const schoolNames = within(select).getAllByRole('option').map((option) => option.textContent);
    expect(schoolNames).toContain('Deep Magic');

    await user.selectOptions(select, 'Deep Magic');
    const groups = [...screen.getByLabelText('Add from catalog').querySelectorAll('optgroup')].map((g) => g.label);
    expect(groups).toContain('Circle 3');
    expect(groups.find((label) => label.startsWith('Circle 4'))).toContain('above class level');

    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'minor-illusion');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));
    expect(store.get(charactersAtom)[0].spells[0]).toMatchObject({ name: 'Minor Illusion', school: 'Deep Magic' });
  });

  it('does not offer Deep Magic with only one of the two classes', () => {
    // Sorcerer + Priest (Divine Magic) gives two pickable schools, so the School select
    // renders — but neither of them should be Deep Magic without a Conjurer level too.
    renderSection(makeCharacter({ classes: [{ classId: 'sorcerer', level: 5 }, { classId: 'priest', level: 1 }] }));
    const select = screen.getByLabelText('School');
    const schoolNames = within(select).getAllByRole('option').map((option) => option.textContent);
    expect(schoolNames).not.toContain('Deep Magic');
  });

  it('says so when the character has no Wizard-type class at all', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 1 }] }));

    expect(screen.getByText(/casts nothing/)).toBeInTheDocument();
  });

  it('collapses for a non-caster instead of disappearing — the message above stays reachable', () => {
    renderSection(makeCharacter({ classes: [{ classId: 'fighter', level: 1 }] }));

    const details = screen.getByText(/casts nothing/).closest('details');
    expect(details).not.toBeNull();
    expect(details).not.toHaveAttribute('open');
  });

  it('starts open for a caster, even with no spells written down yet', () => {
    renderSection(makeCharacter());

    const details = screen.getByRole('heading', { name: 'Spells' }).closest('details');
    expect(details).toHaveAttribute('open');
  });

  it('removes a spell', async () => {
    const user = userEvent.setup();
    const store = renderSection(
      makeCharacter({ spells: [{ id: 's1', name: 'Light', school: 'Truespeech Magic', circle: 1, mp: 1 }] }),
    );

    await user.click(screen.getByRole('button', { name: 'Light Remove' }));

    expect(store.get(charactersAtom)[0].spells).toEqual([]);
  });

  it('backfills spells for characters saved before the field existed', () => {
    const legacy = { ...makeCharacter() } as Partial<Character>;
    delete legacy.spells;

    expect(CharacterSchema.parse(legacy).spells).toEqual([]);
  });
});

describe('SpellsSection catalog search', () => {
  it('narrows the catalog to the spells whose name matches', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'bolt');

    const names = [...screen.getByLabelText('Add from catalog').querySelectorAll('option')]
      .map((option) => option.textContent ?? '')
      .filter((label) => label !== 'Select...');
    expect(names.length).toBeGreaterThan(0);
    expect(names.every((label) => label.toLowerCase().includes('bolt'))).toBe(true);
  });

  it('keeps the circle grouping, so a filtered list still shows what is out of reach', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'a');

    const groups = [...screen.getByLabelText('Add from catalog').querySelectorAll('optgroup')].map((group) => group.label);
    expect(groups.some((label) => label.includes('above class level'))).toBe(true);
  });

  it('says so when nothing matches instead of showing an empty picker', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'zzzzz');

    expect(screen.getByText('Nothing in this school matches.')).toBeInTheDocument();
  });

  it('adds the spell that survived the filter', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter());

    await user.type(screen.getByLabelText('Search'), 'energy');
    await user.selectOptions(screen.getByLabelText('Add from catalog'), 'energy-bolt');
    await user.click(screen.getByRole('button', { name: 'Add spell' }));

    expect(store.get(charactersAtom)[0].spells[0].name).toBe('Energy Bolt');
  });
});

describe('SpellsSection casting', () => {
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };

  it('spends the printed MP when a spell is cast', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));

    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));

    expect(store.get(charactersAtom)[0].mp.current).toBe(5);
  });

  it('refuses a cast the character cannot pay for', async () => {
    renderSection(makeCharacter({ spells: [bolt], mp: { current: 2 } }));

    expect(screen.getByRole('button', { name: 'Energy Bolt Cast' })).toBeDisabled();
  });

  it('refuses, and says why, for a circle above the class level', () => {
    renderSection(makeCharacter({ spells: [{ ...bolt, circle: 5 }], mp: { current: 20 } }));

    expect(screen.getByRole('button', { name: 'Energy Bolt Cast' })).toBeDisabled();
    expect(screen.getByRole('alert')).toHaveTextContent('above the class level');
  });
});

describe('SpellsSection Divine Magic and the worshipped god', () => {
  const priest = () => makeCharacter({ classes: [{ classId: 'priest', level: 4 }] });

  it('offers only the basic spells until a god is chosen, then that god\'s too', async () => {
    const user = userEvent.setup();
    renderSection(priest());

    const options = () => [...screen.getByLabelText('Add from catalog').querySelectorAll('option')].map((o) => o.textContent ?? '');
    expect(options().some((text) => text.includes('(Tidan)'))).toBe(false);

    await user.selectOptions(screen.getByLabelText('God worshipped'), 'Tidan');

    expect(options().some((text) => text.includes('(Tidan)'))).toBe(true);
    expect(options().some((text) => text.includes('(Lyphos)'))).toBe(false);
  });

  it('stores the chosen god on the character', async () => {
    const user = userEvent.setup();
    const store = renderSection(priest());

    await user.selectOptions(screen.getByLabelText('God worshipped'), 'Lyphos');

    expect(store.get(charactersAtom)[0].deity).toBe('Lyphos');
  });
});

describe('SpellsSection cast log', () => {
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };

  it('says what a cast cost and lets the last one be taken back', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));

    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));

    expect(screen.getByTestId('cast-log')).toHaveTextContent('spent 3 MP (8 → 5)');
    expect(store.get(charactersAtom)[0].mp.current).toBe(5);

    await user.click(screen.getByRole('button', { name: 'Undo last cast' }));

    expect(store.get(charactersAtom)[0].mp.current).toBe(8);
    expect(screen.queryByTestId('cast-log')).toBeNull();
  });
});

describe('SpellsSection Power roll', () => {
  afterEach(() => vi.restoreAllMocks());
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };

  it('offers the Power roll for a damaging spell after it is cast and ignores Defense', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // no snake eyes by chance: 1 in 36 would fail the test
    renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));

    expect(screen.queryByRole('button', { name: /^Damage: Power/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    // Sorcerer 2 + INT bonus 1 (INT 8): Magic Power 3.
    await user.click(screen.getByRole('button', { name: 'Damage: Power 10 + 3' }));

    expect(within(screen.getByTestId('cast-log')).getByRole('status')).toHaveTextContent(/Extra Damage 3 = /);
  });
});

describe("SpellsSection — a Baba Yaga's Witch's Fire", () => {
  afterEach(() => vi.restoreAllMocks());
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };
  const witch = { sunlight: false, witch: true, usedToday: [], usedInCombat: [] };

  it('adds +1 Magic Power in the witch shape, and charges the spell’s circle in extra MP for Witch’s Fire', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.5);
    const store = renderSection(makeCharacter({ raceId: 'baba-yaga', racial: witch, spells: [bolt], mp: { current: 8 } }));

    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    // Sorcerer 2 + INT bonus 1 = 3, +1 for the witch's shape
    expect(screen.getByRole('button', { name: 'Damage: Power 10 + 4' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Witch’s Fire (−1 MP)' }));
    expect(store.get(charactersAtom)[0].mp.current).toBe(4);
    expect(screen.getByText(/Witch’s Fire — Target: 1 Character.*1 MP paid/)).toBeInTheDocument();
    // undoing the cast gives back the 3 MP and the 1 of the fire
    await user.click(screen.getByRole('button', { name: 'Undo last cast' }));
    expect(store.get(charactersAtom)[0].mp.current).toBe(8);
  });

  it('offers the area kind only from level 6', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ raceId: 'baba-yaga', racial: witch, classes: [{ classId: 'sorcerer', level: 6 }], spells: [bolt], mp: { current: 20 } }));
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    expect(within(screen.getByTestId('cast-log')).getByRole('option', { name: /Target: 1 Area/ })).toBeInTheDocument();
  });

  it('does not offer Witch’s Fire out of the witch shape', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ raceId: 'baba-yaga', spells: [bolt], mp: { current: 8 } }));
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    expect(screen.queryByRole('button', { name: /Witch’s Fire/ })).toBeNull();
  });
});

describe('SpellsSection several targets', () => {
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };

  it('rolls the damage separately for each target under one casting check', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));

    const targets = screen.getByLabelText('Targets');
    await user.tripleClick(targets);
    await user.keyboard('3');

    expect(screen.getAllByRole('button', { name: /^Damage: Power 10 [+] 3 #/ })).toHaveLength(3);
    expect(screen.getAllByRole('button', { name: /Spellcasting check/ })).toHaveLength(1);
  });
});

describe('SpellsSection Resistance', () => {
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };
  const face = (n: number) => (n - 1) / 6;
  afterEach(() => vi.restoreAllMocks());

  it('halves the damage when the Willpower of the target holds against the casting check', async () => {
    const user = userEvent.setup();
    // Casting 3+4 + Magic Power 3 = 10; damage 2+3; Shield Hoodling Willpower 5 + 5+5 = 15 holds.
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(face(3)).mockReturnValueOnce(face(4))
      .mockReturnValueOnce(face(2)).mockReturnValueOnce(face(3))
      .mockReturnValueOnce(face(5)).mockReturnValueOnce(face(5));
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));
    store.set(encounterAtom, { round: 1, monsters: [{ id: 'm1', monsterId: 'shield-hoodling', label: 'Hoodling', sections: [{ hp: 19, mp: 12 }] }] });

    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    await user.click(screen.getByRole('button', { name: 'Spellcasting check: 2d6 + 3' }));
    await user.click(screen.getByRole('button', { name: 'Damage: Power 10 + 3' }));
    await screen.findByRole('option', { name: /Hoodling/ });
    await user.selectOptions(within(screen.getByTestId('cast-log')).getByRole('combobox'), 'm1:0');
    await user.click(screen.getByRole('button', { name: 'Target Willpower' }));

    const log = screen.getByTestId('cast-log');
    expect(log).toHaveTextContent('Willpower 15 vs casting 10 — resisted');
    expect(log).toHaveTextContent('resisted: damage halved');
    await user.click(within(log).getByRole('button', { name: /^Deal [0-9]+/ }));
    const hp = store.get(encounterAtom).monsters[0].sections[0].hp;
    expect(hp).toBeLessThan(19);
    expect(hp).toBeGreaterThanOrEqual(19 - 5);
  });
});

describe('SpellsSection fumble experience', () => {
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };
  afterEach(() => vi.restoreAllMocks());

  it('pays 50 XP for snake eyes on the casting check, once per fumble', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0); // 1 + 1
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));
    act(() => store.set(activeCharacterIdAtom, 'char-1'));
    const before = store.get(charactersAtom)[0].experience.total;
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    await user.click(screen.getByRole('button', { name: 'Spellcasting check: 2d6 + 3' }));

    await user.click(screen.getByRole('button', { name: '+50 XP' }));

    expect(store.get(charactersAtom)[0].experience.total).toBe(before + 50);
    expect(screen.getByRole('button', { name: '+50 XP added' })).toBeDisabled();
    // a fresh fumble is a fresh payment
    await user.click(screen.getByRole('button', { name: 'Spellcasting check: 2d6 + 3' }));
    expect(screen.getByRole('button', { name: '+50 XP' })).toBeEnabled();
  });

  it('pays 50 XP for a double 1 on the first Power roll of a spell', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));
    act(() => store.set(activeCharacterIdAtom, 'char-1'));
    const before = store.get(charactersAtom)[0].experience.total;
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    await user.click(screen.getByRole('button', { name: 'Damage: Power 10 + 3' }));

    await user.click(screen.getByRole('button', { name: '+50 XP' }));

    expect(store.get(charactersAtom)[0].experience.total).toBe(before + 50);
  });

  it('offers nothing when no character is open', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 } }));
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    await user.click(screen.getByRole('button', { name: 'Spellcasting check: 2d6 + 3' }));
    expect(screen.queryByRole('button', { name: '+50 XP' })).not.toBeInTheDocument();
  });
});

describe('SpellsSection resistance of a spell with no Power', () => {
  const bind = { id: 's2', name: 'Thorn Bind', school: 'Truespeech Magic', circle: 1, mp: 2 };
  const face = (n: number) => (n - 1) / 6;
  afterEach(() => vi.restoreAllMocks());

  it('offers the casting check and the target\'s Willpower, and reads the result', async () => {
    const user = userEvent.setup();
    // Casting 3+4 + Magic Power 3 = 10; the Hoodling's Willpower 5 + fixed... rolled 5+5 = 15 holds
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(face(3)).mockReturnValueOnce(face(4))
      .mockReturnValueOnce(face(5)).mockReturnValueOnce(face(5));
    const store = renderSection(makeCharacter({ spells: [bind], mp: { current: 8 } }));
    store.set(encounterAtom, { round: 1, monsters: [{ id: 'm1', monsterId: 'shield-hoodling', label: 'Hoodling', sections: [{ hp: 19, mp: 12 }] }] });
    await user.click(screen.getByRole('button', { name: 'Thorn Bind Cast' }));

    expect(screen.queryByRole('button', { name: /^Damage: Power/ })).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Spellcasting check: 2d6 + 3' }));
    await screen.findByRole('button', { name: 'Target Willpower' });
    await user.click(screen.getByRole('button', { name: 'Target Willpower' }));

    const log = screen.getByTestId('cast-log');
    expect(log).toHaveTextContent('Willpower 15 vs casting 10');
    expect(log).toHaveTextContent('“Resistance: Neg” cancels the effect');
  });

  it('shows no target to resist when the table is empty', async () => {
    const user = userEvent.setup();
    renderSection(makeCharacter({ spells: [bind], mp: { current: 8 } }));
    await user.click(screen.getByRole('button', { name: 'Thorn Bind Cast' }));
    await user.click(screen.getByRole('button', { name: 'Spellcasting check: 2d6 + 3' }));
    expect(screen.queryByRole('button', { name: 'Target Willpower' })).not.toBeInTheDocument();
  });
});

describe('SpellsSection mako stone', () => {
  const bolt = { id: 's1', name: 'Energy Bolt', school: 'Truespeech Magic', circle: 1, mp: 3 };

  async function setStoneUse(user: ReturnType<typeof userEvent.setup>, value: string) {
    const field = screen.getByLabelText('MP drawn from it for the next spell');
    await user.tripleClick(field);
    await user.keyboard(value);
  }

  it('pays part of a spell from the stone, and the stone loses what it gave', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 }, makoStone: 5 }));

    await setStoneUse(user, '2');
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));

    expect(store.get(charactersAtom)[0].mp.current).toBe(7); // 3 − 2 from the stone = 1 of its own
    expect(store.get(charactersAtom)[0].makoStone).toBe(3);
    expect(screen.getByTestId('cast-log')).toHaveTextContent('2 of them from the mako stone');
  });

  it('never draws more than the spell costs or the stone holds', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 }, makoStone: 2 }));

    await setStoneUse(user, '9');
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));

    expect(store.get(charactersAtom)[0].makoStone).toBe(0);
    expect(store.get(charactersAtom)[0].mp.current).toBe(7); // only 2 came from the stone
  });

  it('lets a caster with too little MP of their own cast on the stone', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 1 }, makoStone: 5 }));
    expect(screen.getByRole('button', { name: 'Energy Bolt Cast' })).toBeDisabled();

    await setStoneUse(user, '2');
    expect(screen.getByRole('button', { name: 'Energy Bolt Cast' })).toBeEnabled();
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));

    expect(store.get(charactersAtom)[0].mp.current).toBe(0);
  });

  it('gives the stone its points back when the cast is undone', async () => {
    const user = userEvent.setup();
    const store = renderSection(makeCharacter({ spells: [bolt], mp: { current: 8 }, makoStone: 5 }));
    await setStoneUse(user, '3');
    await user.click(screen.getByRole('button', { name: 'Energy Bolt Cast' }));
    expect(store.get(charactersAtom)[0].makoStone).toBe(2);

    await user.click(screen.getByRole('button', { name: /Undo/ }));

    expect(store.get(charactersAtom)[0]).toMatchObject({ makoStone: 5, mp: { current: 8 } });
  });

  it('keeps the stone on the character: a card in the roster reads back with its points', () => {
    const parsed = CharacterSchema.parse({ ...makeCharacter({ makoStone: 7 }) });
    expect(parsed.makoStone).toBe(7);
    const { makoStone: _ignored, ...older } = makeCharacter();
    expect(CharacterSchema.parse(older).makoStone).toBe(0);
  });
});

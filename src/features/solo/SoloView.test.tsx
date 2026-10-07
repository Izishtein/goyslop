import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { encounterAtom } from '../../state/encounter';
import { partyAtom } from '../../state/party';
import { EMPTY_ENCOUNTER } from '../../lib/encounter';
import { EMPTY_FELLOW, EMPTY_INVENTORY, EMPTY_PERFORMANCE, EMPTY_GEOMANCER_QI, type Character } from '../../types/character';
import { SoloView } from './SoloView';

beforeEach(() => {
  localStorage.clear();
});
afterEach(() => {
  vi.restoreAllMocks();
});

const face = (n: number) => (n - 1) / 6;

function makeCharacter(overrides: Partial<Character> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1,
    id: 'char-1',
    name: 'Test Hero',
    raceId: 'human',
    background: 'Fighter',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'fighter', level: 1 }],
    hp: { current: 30 },
    mp: { current: 0 },
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
    ...overrides,
  };
}

function renderSolo(withCharacter = true, others: Character[] = []) {
  const store = createStore();
  const character = makeCharacter();
  store.set(charactersAtom, withCharacter ? [character, ...others] : []);
  store.set(partyAtom, []);
  store.set(activeCharacterIdAtom, withCharacter ? character.id : null);
  store.set(encounterAtom, EMPTY_ENCOUNTER);
  render(
    <Provider store={store}>
      <SoloView onClose={() => {}} />
    </Provider>,
  );
  return store;
}

async function addMonster(user: ReturnType<typeof userEvent.setup>, name: string, count = 1) {
  const select = await screen.findByLabelText('Monster');
  await waitFor(() => expect(select).toBeEnabled());
  await user.type(screen.getByLabelText('Search'), name);
  const option = [...select.querySelectorAll('option')].find((entry) => entry.textContent?.endsWith(`· ${name}`));
  await user.selectOptions(select, option!.value);
  if (count > 1) {
    const field = screen.getByLabelText('How many');
    await user.clear(field);
    await user.type(field, String(count));
  }
  await user.click(screen.getByRole('button', { name: 'Add to the table' }));
}

describe('SoloView encounter', () => {
  it('fights a golem but never offers a Familiar, which has no HP of its own', async () => {
    const user = userEvent.setup();
    renderSolo();
    const select = await screen.findByLabelText('Monster');
    await waitFor(() => expect(select).toBeEnabled());

    await user.type(screen.getByLabelText('Search'), 'Familiar');
    expect([...select.querySelectorAll('option')].filter((o) => o.value)).toHaveLength(0);

    await user.clear(screen.getByLabelText('Search'));
    await addMonster(user, 'Oak Golem');
    expect(await screen.findByRole('article', { name: 'Oak Golem' })).toBeInTheDocument();
  });

  it('puts a monster on the table at full HP, and tells copies apart', async () => {
    const user = userEvent.setup();
    const store = renderSolo();

    await addMonster(user, 'Goblin', 2);

    expect(await screen.findByRole('article', { name: 'Goblin' })).toBeInTheDocument();
    expect(screen.getByRole('article', { name: 'Goblin 2' })).toBeInTheDocument();
    expect(store.get(encounterAtom).monsters.map((m) => m.sections[0].hp)).toEqual([16, 16]);
  });

  it('subtracts Defense from physical damage but not from magic', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    await addMonster(user, 'Goblin'); // Defense 2, HP 16
    const card = await screen.findByRole('article', { name: 'Goblin' });

    await user.type(within(card).getByLabelText('Weapon Amount'), '10');
    await user.click(within(card).getByRole('button', { name: 'Damage' }));
    expect(store.get(encounterAtom).monsters[0].sections[0].hp).toBe(8);

    await user.click(within(card).getByLabelText('Magic damage (ignores Defense)'));
    await user.type(within(card).getByLabelText('Weapon Amount'), '3');
    await user.click(within(card).getByRole('button', { name: 'Damage' }));
    expect(store.get(encounterAtom).monsters[0].sections[0].hp).toBe(5);
  });

  it('marks a monster defeated at 0 HP and offers its loot', async () => {
    const user = userEvent.setup();
    renderSolo();
    await addMonster(user, 'Goblin');
    const card = await screen.findByRole('article', { name: 'Goblin' });

    await user.click(within(card).getByLabelText('Magic damage (ignores Defense)'));
    await user.type(within(card).getByLabelText('Weapon Amount'), '16');
    await user.click(within(card).getByRole('button', { name: 'Damage' }));

    expect(within(card).getAllByText('defeated').length).toBeGreaterThan(0);
    // 2d6 = 6 → "Weapon (30G…)" row of the Goblin's 4–9 band.
    vi.spyOn(Math, 'random').mockReturnValueOnce(face(3)).mockReturnValueOnce(face(3));
    await user.click(within(card).getByRole('button', { name: 'Roll loot' }));
    expect(within(card).getByText(/2d6 = 6/)).toHaveTextContent('Weapon (30G');
  });

  it('resolves a monster attack against the open character and lets the player apply it', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    await addMonster(user, 'Goblin'); // Accuracy 3 (10), damage 2d+2
    const card = await screen.findByRole('article', { name: 'Goblin' });

    // Goblin: 6+6 → auto hit, damage 6+6+2 = 14. The character's Evasion roll is 1+2.
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(face(6))
      .mockReturnValueOnce(face(6))
      .mockReturnValueOnce(face(1))
      .mockReturnValueOnce(face(2))
      .mockReturnValueOnce(face(6))
      .mockReturnValueOnce(face(6));
    await user.click(within(card).getByRole('button', { name: 'Goblin Weapon Attack' }));

    const report = within(card).getByRole('status');
    expect(report).toHaveTextContent('hit');
    expect(report).toHaveTextContent('= 14');

    await user.click(within(card).getByRole('button', { name: /Take 14 HP from Test Hero/ }));
    expect(store.get(charactersAtom)[0].hp.current).toBe(16);
  });

  it('uses fixed values when asked: a Fixed attack value against a Fixed evasion', async () => {
    const user = userEvent.setup();
    renderSolo();
    await addMonster(user, 'Goblin');
    await user.click(screen.getByLabelText('Fixed values instead of rolls'));
    const card = await screen.findByRole('article', { name: 'Goblin' });

    await user.click(within(card).getByRole('button', { name: 'Goblin Weapon Attack' }));

    // Fixed 10 against an Evasion of 1 + 7... the character has no armor, level 1 fighter, AGI 8 → Evasion 1 → 8.
    expect(within(card).getByRole('status')).toHaveTextContent('hit');
  });

  it('hides Initiative, saves and the Weak Point until Monster Knowledge reveals them', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    store.set(charactersAtom, [makeCharacter({ classes: [{ classId: 'sage', level: 1 }] })]);
    await addMonster(user, 'Goblin'); // Rep 5 / Weak 10; Sage 1 + INT bonus 1 = 2, Fixed value 9
    await user.click(screen.getByLabelText('Fixed values instead of rolls'));
    await user.click(screen.getByLabelText('Hide details until Monster Knowledge'));
    const card = await screen.findByRole('article', { name: 'Goblin' });
    expect(card).toHaveTextContent('Initiative: ?');
    expect(card).toHaveTextContent('Weak Point: ?');

    await user.click(within(card).getByRole('button', { name: 'Monster Knowledge' }));

    expect(card).toHaveTextContent('Initiative: 11');
    expect(card).toHaveTextContent('Weak Point: ?');
    expect(within(card).getByRole('status')).toHaveTextContent('identified · weak point unknown');
    expect(store.get(encounterAtom).monsters[0]).toMatchObject({ identified: true });
  });

  it('needs Sage levels for the check, but a Conjurer knows a golem without one', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    store.set(charactersAtom, [makeCharacter({ classes: [{ classId: 'conjurer', level: 1 }] })]);
    await addMonster(user, 'Oak Golem');
    await user.click(screen.getByLabelText('Hide details until Monster Knowledge'));
    const card = await screen.findByRole('article', { name: 'Oak Golem' });

    expect(within(card).getByRole('button', { name: 'Monster Knowledge' })).toBeDisabled();
    expect(card).toHaveTextContent('needs Sage levels');
    expect(card).toHaveTextContent('recognised by your class without a roll');
    expect(card).toHaveTextContent('Initiative: 9');
    expect(card).toHaveTextContent('Weak Point: ?');
  });

  it('rolls a Death Check for a downed monster section: survives, or dies', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    await addMonster(user, 'Goblin'); // HP 16, Fortitude 3 (10)
    await user.click(screen.getByLabelText('Fixed values instead of rolls'));
    const card = await screen.findByRole('article', { name: 'Goblin' });
    await user.click(within(card).getByLabelText('Magic damage (ignores Defense)'));

    await user.type(within(card).getByLabelText('Weapon Amount'), '24'); // -8
    await user.click(within(card).getByRole('button', { name: 'Damage' }));
    await user.click(within(card).getByRole('button', { name: 'Weapon Death Check' }));
    expect(within(card).getByText(/alive, unconscious/)).toBeInTheDocument();
    expect(store.get(encounterAtom).monsters[0].sections[0].fate).toBe('out');

    await user.type(within(card).getByLabelText('Weapon Amount'), '10'); // -18, the fate is open again
    await user.click(within(card).getByRole('button', { name: 'Damage' }));
    expect(store.get(encounterAtom).monsters[0].sections[0].fate).toBeUndefined();
    await user.click(within(card).getByRole('button', { name: 'Weapon Death Check' }));
    expect(within(card).getByText(/dies/)).toBeInTheDocument();
    expect(store.get(encounterAtom).monsters[0].sections[0].fate).toBe('dead');
  });

  it('rolls the open character a Death Check at 0 HP or less', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    store.set(charactersAtom, [makeCharacter({ hp: { current: -4 } })]);
    await user.click(screen.getByLabelText('Fixed values instead of rolls'));

    expect(screen.getByText(/Test Hero is at -4 HP and unconscious/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Death Check' })); // level 1 + VIT bonus 1, Fixed 9 against 4

    expect(screen.getByText(/alive, unconscious/)).toBeInTheDocument();
  });

  it('regenerates at the end of the round', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    await addMonster(user, 'Living Tree'); // Regeneration = 10, HP 105
    const card = await screen.findByRole('article', { name: 'Living Tree' });
    await user.click(within(card).getAllByLabelText(/Amount/)[0]);
    await user.keyboard('30');
    await user.click(within(card).getAllByRole('button', { name: 'Damage' })[0]);
    expect(store.get(encounterAtom).monsters[0].sections[0].hp).toBe(89);

    await user.click(screen.getByRole('button', { name: 'Next round' }));

    expect(store.get(encounterAtom).monsters[0].sections[0].hp).toBe(99);
    expect(screen.getByText('Regeneration at the end of the round: Living Tree +10.')).toBeInTheDocument();
  });

  it('adds a declared attack to the next attack only', async () => {
    const user = userEvent.setup();
    renderSolo();
    await addMonster(user, 'Ogre Berserker'); // 2d+18, Power Strike II = +12 damage
    await user.click(screen.getByLabelText('Fixed values instead of rolls'));
    const card = await screen.findByRole('article', { name: 'Ogre Berserker' });

    await user.selectOptions(within(card).getByLabelText('Weapon Declaration'), 'Power Strike II');
    await user.click(within(card).getByRole('button', { name: 'Ogre Berserker Weapon Attack' }));

    expect(within(card).getByRole('status')).toHaveTextContent('[Power Strike II]');
    expect(within(card).getByRole('status')).toHaveTextContent('= 37');
    expect(within(card).getByLabelText('Weapon Declaration')).toHaveValue('');
  });

  it('keeps the fight across a reload', async () => {
    const user = userEvent.setup();
    const store = renderSolo();
    await addMonster(user, 'Goblin');
    await screen.findByRole('article', { name: 'Goblin' });

    expect(JSON.parse(localStorage.getItem('sw25.encounter') ?? '{}').monsters).toHaveLength(1);
    expect(store.get(encounterAtom).monsters).toHaveLength(1);
  });

  it('says so when no character is open', async () => {
    renderSolo(false);

    expect(await screen.findByText(/No character is open on the sheet/)).toBeInTheDocument();
  });
});

describe('SoloView Fellows', () => {
  const wolfe = () =>
    makeCharacter({
      id: 'fellow-1',
      name: 'Wolfe',
      fellow: {
        ...EMPTY_FELLOW,
        selfIntroduction: 'Nice to meet you!',
        actions: [
          { id: 'a1', roll: '1-2', name: 'Attack with Sword', dialogue: 'Take this!', value: '12', effect: 'Power 25/Crit Value 10 + 4' },
          { id: 'a2', roll: '3-4', name: 'Scout Observation Check', value: '11' },
        ],
      },
    });

  async function invite(user: ReturnType<typeof userEvent.setup>) {
    await user.selectOptions(screen.getByLabelText('Invite a Fellow'), 'fellow-1');
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    return screen.findByRole('article', { name: 'Wolfe' });
  }

  it('invites another character of the roster, never the open one', async () => {
    const user = userEvent.setup();
    const store = renderSolo(true, [wolfe()]);

    const options = [...screen.getByLabelText('Invite a Fellow').querySelectorAll('option')].map((o) => o.value);
    expect(options).toEqual(['', 'fellow-1']);

    await invite(user);
    expect(store.get(partyAtom)).toEqual(['fellow-1']);
    expect(screen.getByText('Adventurers: 2 / 6')).toBeInTheDocument();
  });

  it('rolls the action table: a d6 of 3 lands on the observation row', async () => {
    const user = userEvent.setup();
    renderSolo(true, [wolfe()]);
    const card = await invite(user);

    vi.spyOn(Math, 'random').mockReturnValueOnce(face(3));
    await user.click(within(card).getByRole('button', { name: 'Wolfe acts' }));

    const report = within(card).getByRole('status');
    expect(report).toHaveTextContent('1d6 = 3');
    expect(report).toHaveTextContent('Scout Observation Check');
    expect(report).toHaveTextContent('Value: 11');
    expect(report).toHaveTextContent('A check, not an attack');
  });

  it('aims a Fellow attack after the roll and takes it out of the monster', async () => {
    const user = userEvent.setup();
    const store = renderSolo(true, [wolfe()]);
    await addMonster(user, 'Goblin'); // Evasion 3 (10), Defense 2, HP 16
    await screen.findByRole('article', { name: 'Goblin' });
    const card = await invite(user);

    // d6 = 1 → the attack row. The Goblin's Evasion 3 + a roll of 1+2 = 6, below the Value 12.
    // Damage: 3+3 on the Power 25 row, plus Extra Damage 4, less the Goblin's Defense 2.
    vi.spyOn(Math, 'random')
      .mockReturnValueOnce(face(1))
      .mockReturnValueOnce(face(1))
      .mockReturnValueOnce(face(2))
      .mockReturnValueOnce(face(3))
      .mockReturnValueOnce(face(3));
    await user.click(within(card).getByRole('button', { name: 'Wolfe acts' }));
    await user.click(within(card).getByRole('button', { name: "Resolve Wolfe's attack" }));

    expect(within(card).getByRole('status')).toHaveTextContent('Value 12 against Evasion 6');
    expect(within(card).getByRole('status')).toHaveTextContent('hit');
    expect(store.get(encounterAtom).monsters[0].sections[0].hp).toBeLessThan(16);
  });

  it('lets a Fellow act once a round', async () => {
    const user = userEvent.setup();
    renderSolo(true, [wolfe()]);
    const card = await invite(user);
    await user.click(screen.getByRole('button', { name: 'Next round' }));

    await user.click(within(card).getByRole('button', { name: 'Wolfe acts' }));

    expect(within(card).getByRole('button', { name: 'Wolfe acts' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Next round' }));
    expect(within(card).getByRole('button', { name: 'Wolfe acts' })).toBeEnabled();
  });

  it('splits a reward between the PC and the Fellows', async () => {
    const user = userEvent.setup();
    renderSolo(true, [wolfe()]);
    await invite(user);

    await user.type(screen.getByLabelText('Reward to split (G)'), '10000');

    expect(screen.getByText(/share: 5000 G/)).toBeInTheDocument();
  });

  it('says so when a Fellow has no table yet', async () => {
    const user = userEvent.setup();
    renderSolo(true, [{ ...wolfe(), fellow: EMPTY_FELLOW }]);
    await user.selectOptions(screen.getByLabelText('Invite a Fellow'), 'fellow-1');
    await user.click(screen.getByRole('button', { name: 'Invite' }));

    expect(await screen.findByText(/has no Fellow Action Table yet/)).toBeInTheDocument();
  });
});

describe('SoloView Fellow spells', () => {
  const caster = (mp: number) =>
    makeCharacter({
      id: 'fellow-1',
      name: 'Wolfe',
      classes: [{ classId: 'sorcerer', level: 3 }],
      mp: { current: mp },
      fellow: {
        ...EMPTY_FELLOW,
        actions: [
          { id: 'a1', roll: '1-2', name: '[Energy Bolt], MP5', value: '12', effect: 'Power 10+5' },
          { id: 'a2', roll: '3-4', name: '[Cure Wounds], MP3', value: '12', effect: 'Heal Power 20+5' },
        ],
      },
    });

  async function inviteCaster(user: ReturnType<typeof userEvent.setup>, mp: number) {
    const store = renderSolo(true, [caster(mp)]);
    await user.selectOptions(screen.getByLabelText('Invite a Fellow'), 'fellow-1');
    await user.click(screen.getByRole('button', { name: 'Invite' }));
    return { store, card: await screen.findByRole('article', { name: 'Wolfe' }) };
  }

  it('spends the MP of a spell row when it is rolled, and gives it back on cancel', async () => {
    const user = userEvent.setup();
    const { store, card } = await inviteCaster(user, 8);

    vi.spyOn(Math, 'random').mockReturnValueOnce(face(1));
    await user.click(within(card).getByRole('button', { name: 'Wolfe acts' }));
    expect(store.get(charactersAtom).find((c) => c.id === 'fellow-1')!.mp.current).toBe(3);
    expect(within(card).getByRole('status')).toHaveTextContent('5 MP spent');

    await user.click(within(card).getByRole('button', { name: 'Cancel the action' }));
    expect(store.get(charactersAtom).find((c) => c.id === 'fellow-1')!.mp.current).toBe(8);
  });

  it('forcibly cancels a spell the Fellow cannot pay for', async () => {
    const user = userEvent.setup();
    const { store, card } = await inviteCaster(user, 2);

    vi.spyOn(Math, 'random').mockReturnValueOnce(face(1));
    await user.click(within(card).getByRole('button', { name: 'Wolfe acts' }));

    expect(within(card).getByRole('status')).toHaveTextContent('needs 5 MP and the Fellow has 2');
    expect(within(card).queryByRole('button', { name: "Resolve Wolfe's attack" })).toBeNull();
    expect(store.get(charactersAtom).find((c) => c.id === 'fellow-1')!.mp.current).toBe(2);
  });

  it('casts a healing spell on the open character, never past their maximum HP', async () => {
    const user = userEvent.setup();
    const { store, card } = await inviteCaster(user, 8);
    store.set(charactersAtom, store.get(charactersAtom).map((c) => (c.id === 'char-1' ? { ...c, hp: { current: 1 } } : c)));

    vi.spyOn(Math, 'random').mockReturnValue(face(3)); // d6 = 3 → the heal row; 2d = 3+3
    await user.click(within(card).getByRole('button', { name: 'Wolfe acts' }));
    await user.click(within(card).getByRole('button', { name: 'Heal Test Hero' }));

    const hp = store.get(charactersAtom).find((c) => c.id === 'char-1')!.hp.current;
    expect(hp).toBeGreaterThan(1);
    expect(within(card).getByRole('status')).toHaveTextContent('HP restored');
  });
});

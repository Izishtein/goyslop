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

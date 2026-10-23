import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_ENCOUNTER, spawnMonster } from '../../lib/encounter';
import { loadMonsters } from '../../data/monsters';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { EMPTY_FIELD, fieldAtom } from '../../state/battlefield';
import { encounterAtom, showMonsterHpAtom } from '../../state/encounter';
import { partyAtom } from '../../state/party';
import { CharacterSchema, EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';
import { BattlefieldPanel } from './BattlefieldPanel';

// jsdom has no canvas: the downscaling is replaced by a map picture of 2000 x 1000, and everything after it runs for real
vi.mock('../../lib/image-store', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../../lib/image-store')>()),
  fileToBlob: vi.fn(async () => ({ blob: new Blob(['map'], { type: 'image/jpeg' }), width: 2000, height: 1000 })),
}));

beforeEach(() => localStorage.clear());

function makeCharacter(overrides: Record<string, unknown> = {}): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return CharacterSchema.parse({
    schemaVersion: 1,
    id: 'c1',
    name: 'Rudolf',
    raceId: 'dark-troll',
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


async function renderField(options: { monsters?: number; party?: Character[] } = {}) {
  const store = createStore();
  const hero = makeCharacter({ id: 'hero', name: 'Rudolf', raceId: 'human' });
  store.set(charactersAtom, [hero, ...(options.party ?? [])]);
  store.set(activeCharacterIdAtom, hero.id);
  store.set(partyAtom, (options.party ?? []).map((entry) => entry.id));
  store.set(fieldAtom, EMPTY_FIELD);
  store.set(showMonsterHpAtom, false);
  const monsters = await loadMonsters();
  const goblin = monsters.find((entry) => entry.name === 'Goblin')!;
  const instances: ReturnType<typeof spawnMonster>[] = [];
  for (let n = 0; n < (options.monsters ?? 0); n += 1) instances.push(spawnMonster(goblin, instances.map((entry) => entry.label), 'g' + n));
  store.set(encounterAtom, { ...EMPTY_ENCOUNTER, monsters: instances });
  render(
    <Provider store={store}>
      <BattlefieldPanel />
    </Provider>,
  );
  return store;
}

const token = (name: RegExp) => screen.findByRole('button', { name });

describe('BattlefieldPanel', () => {
  it('puts a token for the open character and one for each monster on the table, party above and foes below', async () => {
    await renderField({ monsters: 2 });
    expect(await token(/^Rudolf, party, column 1, row 1$/)).toBeInTheDocument();
    expect(await token(/^Goblin, enemy, column 1, row 14$/)).toBeInTheDocument();
    expect(await token(/^Goblin 2, enemy, column 2, row 14$/)).toBeInTheDocument();
  });

  it('moves the focused token with the arrow keys and remembers the cell', async () => {
    const user = userEvent.setup();
    const store = await renderField();
    const hero = await token(/^Rudolf/);
    hero.focus();
    await user.keyboard('{ArrowRight}{ArrowRight}{ArrowDown}');
    expect(hero).toHaveAccessibleName('Rudolf, party, column 3, row 2');
    expect(store.get(fieldAtom).positions['pc:hero']).toEqual({ col: 2, row: 1 });
    await user.keyboard('{ArrowLeft}{ArrowLeft}{ArrowLeft}{ArrowUp}{ArrowUp}');
    expect(hero).toHaveAccessibleName('Rudolf, party, column 1, row 1'); // stops at the edge
  });

  it('will not stand a token in an occupied cell', async () => {
    const user = userEvent.setup();
    const friend = makeCharacter({ id: 'friend', name: 'Torin' });
    const store = await renderField({ party: [friend] });
    const hero = await token(/^Rudolf/);
    expect(await token(/^Torin, party, column 2, row 1$/)).toBeInTheDocument();
    hero.focus();
    await user.keyboard('{ArrowRight}');
    expect(hero).not.toHaveAccessibleName(/column 2, row 1$/);
    const cells = Object.values(store.get(fieldAtom).positions).map((cell) => cell.col + ',' + cell.row);
    expect(new Set(cells).size).toBe(cells.length);
  });

  it('drags a token to the cell under the pointer', async () => {
    const store = await renderField();
    const hero = await token(/^Rudolf/);
    const field = screen.getByRole('group', { name: 'Battlefield' });
    field.getBoundingClientRect = () => ({ left: 0, top: 0, right: 400, bottom: 280, width: 400, height: 280, x: 0, y: 0, toJSON: () => ({}) });
    fireEvent.pointerDown(hero, { pointerId: 1, clientX: 10, clientY: 10 });
    fireEvent.pointerMove(hero, { pointerId: 1, clientX: 105, clientY: 85 });
    fireEvent.pointerUp(hero, { pointerId: 1, clientX: 105, clientY: 85 });
    expect(store.get(fieldAtom).positions['pc:hero']).toEqual({ col: 5, row: 4 }); // 20 columns x 14 rows, cells of 20 px
  });

  it('reads the distances from the selected token in metres, nearest first', async () => {
    const user = userEvent.setup();
    await renderField({ monsters: 1 });
    await user.click(await token(/^Rudolf/));
    const list = await screen.findByRole('list', { name: 'Distances from Rudolf' });
    expect(within(list).getByText(/^Goblin: 13 m$/)).toBeInTheDocument(); // 13 rows down, same column
  });

  it('adds a token by hand and takes it off again', async () => {
    const user = userEvent.setup();
    const store = await renderField();
    await user.type(screen.getByLabelText('Name of a new token'), 'Barrel');
    await user.click(screen.getByRole('button', { name: 'Add a token' }));
    expect(store.get(fieldAtom).custom.map((entry) => entry.label)).toEqual(['Barrel']);
    expect(await token(/^Barrel, other/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Remove the token' }));
    expect(store.get(fieldAtom).custom).toEqual([]);
  });

  it('keeps a monster’s HP off the token until the table’s HP switch is on', async () => {
    const user = userEvent.setup();
    const store = await renderField({ monsters: 1 });
    await user.click(await token(/^Goblin/));
    const info = screen.getByRole('region', { name: 'Selected token' });
    expect(info).not.toHaveTextContent('HP');
    store.set(showMonsterHpAtom, true);
    await waitFor(() => expect(info).toHaveTextContent('HP 16 / 16'));
  });

  it('greys the token of a monster that is down', async () => {
    const store = await renderField({ monsters: 1 });
    const goblin = await token(/^Goblin/);
    const current = store.get(encounterAtom);
    store.set(encounterAtom, { ...current, monsters: current.monsters.map((entry) => ({ ...entry, sections: entry.sections.map((section) => ({ ...section, hp: 0 })) })) });
    await waitFor(() => expect(goblin.className).toMatch(/down/));
  });

  it('resizes the grid and keeps every token on it', async () => {
    const user = userEvent.setup();
    const store = await renderField({ monsters: 1 });
    const columns = screen.getByLabelText('Columns');
    await user.clear(columns);
    await user.type(columns, '6');
    expect(store.get(fieldAtom).cols).toBe(6);
    expect(await token(/^Goblin, enemy, column 1, row 14$/)).toBeInTheDocument();
  });

  it('lays a map under the grid: rows follow the picture, and removing it gives them back', async () => {
    const user = userEvent.setup();
    const store = await renderField({ monsters: 1 });
    await user.upload(screen.getByLabelText('Map picture'), new File(['x'], 'map.png', { type: 'image/png' }));
    await waitFor(() => expect(store.get(fieldAtom).hasMap).toBe(true));
    expect(store.get(fieldAtom).mapRatio).toBe(0.5);
    expect(screen.getByLabelText('Rows')).toBeDisabled();
    expect(screen.getByLabelText('Rows')).toHaveValue(10); // 20 columns over a 2:1 picture
    expect(await token(/^Goblin, enemy, column 1, row 10$/)).toBeInTheDocument(); // the foes follow the new bottom edge
    await user.click(screen.getByRole('button', { name: 'Remove the map' }));
    await waitFor(() => expect(store.get(fieldAtom).hasMap).toBe(false));
    expect(screen.getByLabelText('Rows')).toBeEnabled();
  });

  const sizeField = () => {
    const field = screen.getByRole('group', { name: 'Battlefield' });
    field.getBoundingClientRect = () => ({ left: 0, top: 0, right: 400, bottom: 280, width: 400, height: 280, x: 0, y: 0, toJSON: () => ({}) });
  };

  it('lays a ruler between two cells and reads it in metres and cells', async () => {
    const user = userEvent.setup();
    await renderField();
    sizeField();
    await user.selectOptions(screen.getByLabelText('Tool'), 'ruler');
    const sheet = screen.getByTestId('field-capture');
    fireEvent.pointerDown(sheet, { clientX: 10, clientY: 10 }); // column 1, row 1
    fireEvent.pointerDown(sheet, { clientX: 70, clientY: 90 }); // column 4, row 5
    expect(await screen.findByText('Ruler: 5 m straight, 4 cells walking')).toBeInTheDocument();
  });

  it('names who stands within the radius of the selected token', async () => {
    const user = userEvent.setup();
    await renderField({ party: [makeCharacter({ id: 'friend', name: 'Torin' })] });
    await user.click(await token(/^Rudolf/));
    await user.click(screen.getByRole('button', { name: '3 m' }));
    expect(await screen.findByText('Within 3 m: Torin')).toBeInTheDocument();
  });

  it('hides a foe under fog until its cell is opened or the party sees it', async () => {
    const user = userEvent.setup();
    const store = await renderField({ monsters: 1 });
    expect(await token(/^Goblin/)).toBeInTheDocument();
    await user.click(screen.getByLabelText('Fog of war'));
    expect(screen.queryByRole('button', { name: /^Goblin/ })).not.toBeInTheDocument();

    sizeField();
    await user.selectOptions(screen.getByLabelText('Tool'), 'reveal');
    const sheet = screen.getByTestId('field-capture');
    fireEvent.pointerDown(sheet, { clientX: 10, clientY: 270 }); // column 1, row 14: where the goblin stands
    fireEvent.pointerUp(sheet);
    expect(store.get(fieldAtom).fog.revealed).toEqual(['0,13']);
    expect(await token(/^Goblin/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Cover all' }));
    expect(screen.queryByRole('button', { name: /^Goblin/ })).not.toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Party sight, m (0 = by hand only)'), { target: { value: '14' } });
    expect(await token(/^Goblin/)).toBeInTheDocument(); // 13 cells away, inside the sight
  });

  it('saves the field to a file and loads it back', async () => {
    const user = userEvent.setup();
    const created: Blob[] = [];
    vi.spyOn(URL, 'createObjectURL').mockImplementation((blob) => (created.push(blob as Blob), 'blob:x'));
    vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    const store = await renderField();
    await user.type(screen.getByLabelText('Name of a new token'), 'Barrel');
    await user.click(screen.getByRole('button', { name: 'Add a token' }));
    await user.click(screen.getByRole('button', { name: 'Save field' }));
    await waitFor(() => expect(created.length).toBeGreaterThan(0));
    const text = await created[created.length - 1].text();

    store.set(fieldAtom, EMPTY_FIELD);
    await waitFor(() => expect(screen.queryByRole('button', { name: /^Barrel/ })).not.toBeInTheDocument());
    await user.upload(screen.getByLabelText('Load field'), new File([text], 'f.json', { type: 'application/json' }));
    expect(await token(/^Barrel, other/)).toBeInTheDocument();

    await user.upload(screen.getByLabelText('Load field'), new File(['{}'], 'bad.json', { type: 'application/json' }));
    expect(await screen.findByRole('alert')).toHaveTextContent('not a battlefield file');
  });
});

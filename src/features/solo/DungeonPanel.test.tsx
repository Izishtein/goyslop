import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import raw from '../../data/monsters/monsters.json';
import type { Monster } from '../../data/monsters/types';
import { EMPTY_ENCOUNTER } from '../../lib/encounter';
import type { Dungeon, Room } from '../../lib/dungeon';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { dungeonAtom } from '../../state/dungeon';
import { encounterAtom } from '../../state/encounter';
import { DungeonPanel } from './DungeonPanel';
import { EMPTY_FELLOW, EMPTY_GEOMANCER_QI, EMPTY_INVENTORY, EMPTY_PERFORMANCE, type Character } from '../../types/character';

const goblin = (raw as unknown as Monster[]).find((m) => m.name === 'Goblin')!;

beforeEach(() => localStorage.clear());

const room = (id: number, x: number, patch: Partial<Room> = {}): Room => ({ id, x, y: 0, kind: 'empty', links: [], visited: false, seen: false, cleared: false, ...patch });

function crafted(): Dungeon {
  return {
    place: 'free',
    theme: 1,
    level: 1,
    levels: [
      {
        rooms: [
          room(0, 0, { kind: 'entrance', links: [1], visited: true, seen: true }),
          room(1, 1, { kind: 'treasure', links: [0, 2], seen: true, gold: 100, item: true }),
          room(2, 2, { kind: 'monsters', links: [1], monsterId: goblin.id, count: 2 }),
        ],
      },
    ],
    at: { level: 0, room: 0 },
  };
}

function character(): Character {
  const zero = { base: 8, correction: 0, growth: 0, itemBonus: 0 };
  return {
    schemaVersion: 1, id: 'c1', name: 'Hero', raceId: 'human', background: '',
    abilities: { DEX: zero, AGI: zero, STR: zero, VIT: zero, INT: zero, SPR: zero },
    classes: [{ classId: 'fighter', level: 1 }], hp: { current: 10 }, mp: { current: 0 }, statusEffects: [], abyssCorruptionLevel: 0, deity: '',
    equipment: { weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
    currency: { cash: 5, savings: 0, debt: 0, spendingLog: '' }, combatFeats: [], experience: { total: 0, spent: 0 }, spells: [], arts: [], evocations: [], materialCards: {}, mounts: [],
    performance: EMPTY_PERFORMANCE, growthLog: [], reputation: 0, profile: { gender: '', age: '', avatar: '' }, notes: { story: '', goals: '', gm: '' }, connections: [],
    fellow: EMPTY_FELLOW, workSkills: [], stunts: [], aspects: [], geomancerQi: EMPTY_GEOMANCER_QI, stratagems: [], maneuvers: [], tacticianEdge: 0, essenceWeavings: [], schools: [], schoolSecrets: [],
    aspectsKnown: undefined,
  } as unknown as Character;
}

function renderPanel(dungeon: Dungeon | null) {
  const store = createStore();
  store.set(dungeonAtom, dungeon);
  store.set(encounterAtom, EMPTY_ENCOUNTER);
  store.set(charactersAtom, [character()]);
  store.set(activeCharacterIdAtom, 'c1');
  render(
    <Provider store={store}>
      <DungeonPanel />
    </Provider>,
  );
  return store;
}

describe('DungeonPanel', () => {
  it('generates a dungeon for the open character\'s level', async () => {
    const user = userEvent.setup();
    const store = renderPanel(null);
    const button = screen.getByRole('button', { name: 'Generate a dungeon' });
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    const dungeon = store.get(dungeonAtom)!;
    expect(dungeon.level).toBe(1);
    expect(dungeon.levels[0].rooms[0].kind).toBe('entrance');
    expect(screen.getByText('The entrance')).toBeInTheDocument();
  });

  it('walks through a door, takes the gold into the wallet, and puts the monsters on the table', async () => {
    const user = userEvent.setup();
    const store = renderPanel(crafted());
    await waitFor(() => expect(screen.getByRole('group', { name: /Dungeon level map/ })).toBeInTheDocument());

    const map = screen.getByRole('group', { name: /Dungeon level map/ });
    await user.click(within(map).getByRole('button', { name: 'a room you have not entered' })); // room 1, the only one seen so far
    await user.click(screen.getByRole('button', { name: 'Take 100 G' }));
    expect(store.get(charactersAtom)[0].currency.cash).toBe(105);
    expect(screen.getByText('The hoard has been taken.')).toBeInTheDocument();

    await user.click(within(map).getByRole('button', { name: 'a room you have not entered' }));
    await user.click(await screen.findByRole('button', { name: 'Put on the table' }));
    expect(store.get(encounterAtom).monsters.map((m) => m.label)).toEqual(['Goblin', 'Goblin 2']);
    await user.click(screen.getByRole('button', { name: 'Mark cleared' }));
    expect(store.get(dungeonAtom)!.levels[0].rooms[2].cleared).toBe(true);
  });

  it('refuses a room with no door from here, and leaves by the entrance', async () => {
    const user = userEvent.setup();
    const store = renderPanel(crafted());
    const map = screen.getByRole('group', { name: /Dungeon level map/ });
    // only room 1 is seen from the entrance; room 2 is not drawn at all
    expect(within(map).getAllByRole('button', { name: 'a room you have not entered' })).toHaveLength(1);

    await user.click(screen.getByRole('button', { name: 'Leave the dungeon' }));
    expect(store.get(dungeonAtom)).toBeNull();
  });
});

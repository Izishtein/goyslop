import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_CAMPAIGN } from '../../lib/campaign';
import { EMPTY_ENCOUNTER } from '../../lib/encounter';
import { withFactions } from '../../lib/factions';
import { EMPTY_HEXMAP, generateHexMap, type HexMap } from '../../lib/hexmap';
import monsterData from '../../data/monsters/monsters.json';
import type { Monster } from '../../data/monsters/types';
import { campaignAtom } from '../../state/campaign';
import { encounterAtom } from '../../state/encounter';
import { dungeonAtom } from '../../state/dungeon';
import { hexMapAtom } from '../../state/hexmap';
import { HexMapPanel } from './HexMapPanel';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

function renderPanel() {
  const store = createStore();
  store.set(hexMapAtom, EMPTY_HEXMAP);
  store.set(campaignAtom, EMPTY_CAMPAIGN);
  store.set(encounterAtom, EMPTY_ENCOUNTER);
  const view = render(
    <Provider store={store}>
      <HexMapPanel />
    </Provider>,
  );
  return { store, container: view.container };
}

async function generate(user: ReturnType<typeof userEvent.setup>) {
  const button = screen.getByRole('button', { name: 'Generate a map' });
  await waitFor(() => expect(button).toBeEnabled());
  await user.click(button);
}

describe('HexMapPanel', () => {
  it('makes a map of 19 hexes with the party in the middle', async () => {
    const user = userEvent.setup();
    const { store } = renderPanel();

    await generate(user);

    expect(store.get(hexMapAtom).hexes).toHaveLength(19);
    expect(screen.getByText('Rations: 7')).toBeInTheDocument();
    expect(screen.getByText('You are here', { selector: 'strong' })).toBeInTheDocument();
  });

  it('walks into a neighbouring hex: a day passes and a ration is eaten', async () => {
    const user = userEvent.setup();
    const { store, container } = renderPanel();
    await generate(user);
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // no encounter on the road

    const reachable = container.querySelectorAll('[data-reachable]');
    expect(reachable).toHaveLength(6);
    await user.click(reachable[0] as Element);

    const map = store.get(hexMapAtom);
    expect(map.rations).toBe(6);
    expect(map.party).not.toEqual({ q: 0, r: 0 });
    expect(store.get(campaignAtom).day).toBe(2);
  });

  it('puts a wandering encounter on the table', async () => {
    const user = userEvent.setup();
    const { store, container } = renderPanel();
    await generate(user);
    vi.spyOn(Math, 'random').mockReturnValueOnce(0).mockReturnValue(0.99); // a 1 on the road, and no patrol

    await user.click(container.querySelectorAll('[data-reachable]')[0] as Element);
    const buttons = await screen.findAllByRole('button', { name: 'Put on the table' });
    await user.click(buttons[buttons.length - 1]);

    expect(store.get(encounterAtom).monsters.length).toBeGreaterThan(0);
  });

  it('forages a day for rations', async () => {
    const user = userEvent.setup();
    const { store } = renderPanel();
    await generate(user);
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // a 6: two rations

    await user.click(screen.getByRole('button', { name: 'Forage for a day' }));

    expect(store.get(hexMapAtom).rations).toBe(9);
    expect(store.get(campaignAtom).day).toBe(2);
  });

  it('lists a realm once its seat has been seen, rolls it an event and writes the event to the log', async () => {
    const user = userEvent.setup();
    const store = createStore();
    const base: HexMap = {
      ...EMPTY_HEXMAP,
      rations: 7,
      hexes: [
        { q: 0, r: 0, biome: 'grassland', feature: { kind: 'settlement', settlement: 'village' }, visited: true, seen: true },
        { q: 1, r: 0, biome: 'hills', feature: { kind: 'settlement', settlement: 'fortress' }, visited: false, seen: true },
        { q: 0, r: 1, biome: 'forest', feature: { kind: 'settlement', settlement: 'tower' }, visited: false, seen: false },
      ],
    };
    store.set(hexMapAtom, withFactions(base, []));
    store.set(campaignAtom, EMPTY_CAMPAIGN);
    store.set(encounterAtom, EMPTY_ENCOUNTER);
    render(
      <Provider store={store}>
        <HexMapPanel />
      </Provider>,
    );

    expect(screen.getByText('1. Fortress (1,0)')).toBeInTheDocument();
    expect(screen.getByText('1 more realm(s) are still unknown.')).toBeInTheDocument();
    vi.spyOn(Math, 'random').mockReturnValue(0); // event 1, long ago
    await user.click(screen.getByRole('button', { name: /^Event — Fortress/ }));
    expect(screen.getByText('the leader is murdered (it ended some time ago)')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Add to the log' }));

    expect(store.get(campaignAtom).entries[0]).toMatchObject({ kind: 'thread', title: 'Fortress (1,0): the leader is murdered' });
  });

  it('marches on without a day for a point of fatigue, and a camp takes it off again', async () => {
    const user = userEvent.setup();
    const { store, container } = renderPanel();
    await generate(user);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    await user.click(screen.getByLabelText('Forced march'));
    await user.click(container.querySelectorAll('[data-reachable]')[0] as Element);
    expect(store.get(hexMapAtom)).toMatchObject({ fatigue: 1, rations: 7 });
    expect(store.get(campaignAtom).day).toBe(1);
    expect(screen.getByText('Fatigue 1 / 5 · −1 to every check')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Make camp' }));
    const map = store.get(hexMapAtom);
    expect(map).toMatchObject({ fatigue: 0, rations: 6 });
    expect(map.hexes.filter((hex) => hex.camp)).toHaveLength(1);
    expect(store.get(campaignAtom).day).toBe(2);
  });

  it('shows the calendar date and its festival', async () => {
    renderPanel();
    expect(screen.getByText(/Year 1, month 1, day 1 — spring · Springtide festival/)).toBeInTheDocument();
  });

  it('enters the dungeon of the hex the party stands on, guarded by its own monster', async () => {
    const user = userEvent.setup();
    const goblin = (monsterData as unknown as Monster[]).find((m) => m.name === 'Goblin')!;
    const store = createStore();
    store.set(hexMapAtom, {
      ...EMPTY_HEXMAP,
      rations: 7,
      patches: [{ q: 0, r: 0 }],
      hexes: [{ q: 0, r: 0, biome: 'hills', feature: { kind: 'dungeon', monsterId: goblin.id, count: 3 }, visited: true, seen: true }],
    });
    store.set(dungeonAtom, null);
    store.set(campaignAtom, EMPTY_CAMPAIGN);
    store.set(encounterAtom, EMPTY_ENCOUNTER);
    render(
      <Provider store={store}>
        <HexMapPanel />
      </Provider>,
    );
    const enter = screen.getByRole('button', { name: 'Enter the dungeon' });
    await waitFor(() => expect(enter).toBeEnabled());

    await user.click(enter);

    const dungeon = store.get(dungeonAtom)!;
    expect(dungeon.place).toBe('0,0');
    const boss = dungeon.levels[dungeon.levels.length - 1].rooms.find((room) => room.kind === 'boss')!;
    expect(boss).toMatchObject({ monsterId: goblin.id, count: 3 });
    expect(screen.getByRole('button', { name: 'The dungeon is open below' })).toBeDisabled();
  });

  it('opens 19 more hexes beyond the edge', async () => {
    const user = userEvent.setup();
    const monsters = monsterData as unknown as Monster[];
    const store = createStore();
    const start = generateHexMap({ level: 1, monsters, rng: () => 0.4 });
    store.set(hexMapAtom, { ...start, party: { q: 2, r: 0 } });
    store.set(dungeonAtom, null);
    store.set(campaignAtom, EMPTY_CAMPAIGN);
    store.set(encounterAtom, EMPTY_ENCOUNTER);
    render(
      <Provider store={store}>
        <HexMapPanel />
      </Provider>,
    );
    const button = screen.getByRole('button', { name: 'Open the lands beyond' });
    await waitFor(() => expect(button).toBeEnabled());

    await user.click(button);

    expect(store.get(hexMapAtom).hexes).toHaveLength(38);
    expect(store.get(hexMapAtom).patches).toHaveLength(2);
  });
});

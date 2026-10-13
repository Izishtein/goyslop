import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_CAMPAIGN } from '../../lib/campaign';
import { EMPTY_ENCOUNTER } from '../../lib/encounter';
import { withFactions } from '../../lib/factions';
import { EMPTY_HEXMAP, generateHexMap, type HexMap } from '../../lib/hexmap';
import { goAshore, setSail } from '../../lib/voyage';
import { harbourMap } from '../../test/harbour-map';
import monsterData from '../../data/monsters/monsters.json';
import type { Monster } from '../../data/monsters/types';
import { campaignAtom } from '../../state/campaign';
import { encounterAtom } from '../../state/encounter';
import { dungeonAtom } from '../../state/dungeon';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { hexMapAtom } from '../../state/hexmap';
import { voyageAtom } from '../../state/voyage';
import type { Character } from '../../types/character';
import { HexMapPanel } from './HexMapPanel';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

/** The store of the panel just rendered: generating a map there drops its rivers, which would otherwise make a step cost a random extra day. */
let current: ReturnType<typeof createStore> | null = null;

function renderPanel() {
  const store = createStore();
  current = store;
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
  if (current) current.set(hexMapAtom, { ...current.get(hexMapAtom), hexes: current.get(hexMapAtom).hexes.map((hex) => ({ ...hex, river: undefined })) });
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
    // the sea beside the village cannot be walked
    const land = store.get(hexMapAtom).hexes.filter((hex) => Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(-hex.q - hex.r)) === 1 && hex.biome !== 'sea');
    expect(reachable).toHaveLength(land.length);
    expect(land.length).toBeLessThan(6);
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

  it('carries fatigue onto the open character as a status effect and lifts it with the rest', async () => {
    const user = userEvent.setup();
    const { store, container } = renderPanel();
    store.set(charactersAtom, [{ id: 'c1', name: 'Hero', classes: [{ classId: 'fighter', level: 1 }], statusEffects: [] } as unknown as Character]);
    store.set(activeCharacterIdAtom, 'c1');
    await generate(user);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    await user.click(screen.getByLabelText('Forced march'));
    await user.click(container.querySelectorAll('[data-reachable]')[0] as Element);

    await waitFor(() => expect(store.get(charactersAtom)[0].statusEffects).toHaveLength(1));
    const effect = store.get(charactersAtom)[0].statusEffects[0];
    expect(effect.modifiers).toContainEqual({ field: 'accuracy', value: -1 });
    expect(effect.modifiers).toContainEqual({ field: 'evasion', value: -1 });

    await user.click(screen.getByRole('button', { name: 'Make camp' }));
    await waitFor(() => expect(store.get(charactersAtom)[0].statusEffects).toHaveLength(0));
  });

  it('rolls a happening on a festival day and puts it in the campaign log', async () => {
    const user = userEvent.setup();
    const { store } = renderPanel();
    vi.spyOn(Math, 'random').mockReturnValue(0);

    await user.click(screen.getByRole('button', { name: 'What happens at the festival?' }));
    expect(screen.getByRole('status')).toHaveTextContent('A fair fills the square');

    await user.click(screen.getByRole('button', { name: 'To the log' }));
    expect(store.get(campaignAtom).entries[0]).toMatchObject({ kind: 'scene', title: 'Springtide festival' });
    expect(screen.getByRole('button', { name: 'To the log' })).toBeDisabled();
  });

  it('puts out to sea from the starting village, the ship at its quay on the same map', async () => {
    const user = userEvent.setup();
    const { store } = renderPanel();
    await generate(user);

    await user.click(screen.getByRole('button', { name: 'Put out to sea' }));

    expect(store.get(voyageAtom)).toMatchObject({ at: { q: 0, r: 0 }, aboard: true, day: 0 });
    expect(store.get(hexMapAtom).hexes.find((hex) => hex.q === 0 && hex.r === 0)?.market).toHaveLength(6);
    expect(screen.getByRole('button', { name: 'Put out to sea' })).toBeDisabled();
  });

  it('sails the ship over the sea with the party aboard, and refuses to walk onto water', async () => {
    const user = userEvent.setup();
    const { store, container } = renderPanel();
    await generate(user);
    await user.click(screen.getByRole('button', { name: 'Put out to sea' }));
    // no headway yet: the sea cannot be sailed
    expect([...container.querySelectorAll('[data-reachable]')].some((entry) => entry.getAttribute('data-biome') === 'sea')).toBe(false);

    act(() => store.set(voyageAtom, { ...store.get(voyageAtom)!, moves: 2 }));
    const cell = container.querySelectorAll('[data-reachable]');
    const seaCell = [...cell].find((entry) => entry.getAttribute('data-biome') === 'sea');
    expect(seaCell).toBeDefined();
    await user.click(seaCell as Element);

    const after = store.get(voyageAtom)!;
    expect(after.moves).toBe(1);
    expect(store.get(hexMapAtom).party).toEqual(after.at);
    expect(after.at).not.toEqual({ q: 0, r: 0 });
  });

  it('steps off the ship onto the beach, leaving it moored, and boards it again', async () => {
    const user = userEvent.setup();
    const { store, container } = renderPanel();
    await generate(user);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    await user.click(screen.getByRole('button', { name: 'Put out to sea' }));
    act(() => store.set(voyageAtom, { ...store.get(voyageAtom)!, moves: 1 }));
    const seaCell = [...container.querySelectorAll('[data-reachable]')].find((entry) => entry.getAttribute('data-biome') === 'sea') as Element;
    await user.click(seaCell);
    const moored = store.get(voyageAtom)!.at;

    const landCell = [...container.querySelectorAll('[data-reachable]')].find((entry) => entry.getAttribute('data-biome') !== 'sea') as Element | undefined;
    if (!landCell) return; // the dice put no dry land beside this sea hex
    await user.click(landCell);
    expect(store.get(voyageAtom)).toMatchObject({ aboard: false, at: moored });
    expect(store.get(hexMapAtom).party).not.toEqual(moored);

    const boardCell = [...container.querySelectorAll('[data-reachable]')].find((entry) => entry.getAttribute('aria-label')?.includes('the ship is here')) as Element;
    await user.click(boardCell);
    expect(store.get(voyageAtom)!.aboard).toBe(true);
    expect(store.get(hexMapAtom).party).toEqual(moored);
  });

  it('calls the ship left at another quay: she sails by water to the party, who spend the days and the rations', async () => {
    const user = userEvent.setup();
    const { store } = renderPanel();
    const map = harbourMap();
    store.set(hexMapAtom, map);
    store.set(voyageAtom, goAshore(setSail('cog', 3, { q: 3, r: -1, settlement: 'town' }, () => 0), map)!);

    await user.click(await screen.findByRole('button', { name: /Call the ship \(2 d\.\)/ }));

    expect(store.get(voyageAtom)).toMatchObject({ at: { q: 0, r: 0 }, aboard: false, day: 2 });
    expect(store.get(hexMapAtom).rations).toBe(5);
    expect(store.get(campaignAtom).day).toBe(EMPTY_CAMPAIGN.day + 2);
    expect(screen.getByText('The ship has come to hex 0,0 after 2 days.')).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Call the ship/ })).toBeNull();
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

describe('HexMapPanel — the place of the journal', () => {
  it('names the hex the party stands on and points the journal at it', async () => {
    const user = userEvent.setup();
    const { store } = renderPanel();
    await generate(user);

    await user.type(screen.getByLabelText('Name of this place'), 'Last Inn');
    await user.click(screen.getByRole('button', { name: 'Journal: the story is here' }));

    expect(store.get(campaignAtom).activePlace).toBe('Last Inn');
    expect(store.get(hexMapAtom).hexes.find((hex) => hex.q === 0 && hex.r === 0)?.place).toBe('Last Inn');
  });

  it('names a nameless hex after what is on it and its coordinates', async () => {
    const user = userEvent.setup();
    const { store } = renderPanel();
    await generate(user);
    store.set(hexMapAtom, { ...store.get(hexMapAtom), hexes: store.get(hexMapAtom).hexes.map((hex) => (hex.q === 0 && hex.r === 0 ? { ...hex, feature: { kind: 'empty' as const }, place: undefined } : hex)) });

    await user.click(screen.getByRole('button', { name: 'Journal: the story is here' }));

    expect(store.get(campaignAtom).activePlace.endsWith('(0,0)')).toBe(true);
    expect(store.get(hexMapAtom).hexes.find((hex) => hex.q === 0 && hex.r === 0)?.place).toBe(store.get(campaignAtom).activePlace);
  });

  it('follows the party onto a named hex, and stays put on bare country', async () => {
    const user = userEvent.setup();
    const { store, container } = renderPanel();
    await generate(user);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);
    const map = store.get(hexMapAtom);
    const neighbours = map.hexes.filter((hex) => Math.max(Math.abs(hex.q), Math.abs(hex.r), Math.abs(-hex.q - hex.r)) === 1);
    store.set(hexMapAtom, {
      ...map,
      hexes: map.hexes.map((hex) => (neighbours.includes(hex) ? { ...hex, feature: { kind: 'empty' as const }, place: undefined } : hex)),
    });
    await user.click(screen.getByLabelText('Journal follows the party'));
    store.set(campaignAtom, { ...EMPTY_CAMPAIGN, activePlace: 'Elsewhere' });

    await user.click(container.querySelectorAll('[data-reachable]')[0] as Element);
    expect(store.get(campaignAtom).activePlace).toBe('Elsewhere');

    const stepped = store.get(hexMapAtom);
    const next = stepped.hexes.filter((hex) => Math.abs(hex.q - stepped.party.q) + Math.abs(hex.r - stepped.party.r) > 0);
    store.set(hexMapAtom, { ...stepped, hexes: stepped.hexes.map((hex) => (next.includes(hex) ? { ...hex, place: 'Wayside Shrine' } : hex)) });
    await user.click(container.querySelectorAll('[data-reachable]')[0] as Element);
    expect(store.get(campaignAtom).activePlace).toBe('Wayside Shrine');
  });
});

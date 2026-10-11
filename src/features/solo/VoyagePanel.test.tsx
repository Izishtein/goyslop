import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import raw from '../../data/monsters/monsters.json';
import type { Monster } from '../../data/monsters/types';
import { EMPTY_CAMPAIGN } from '../../lib/campaign';
import { EMPTY_ENCOUNTER } from '../../lib/encounter';
import { generateHexMap } from '../../lib/hexmap';
import { HULL, setSail, type Voyage } from '../../lib/voyage';
import { dungeonAtom } from '../../state/dungeon';
import { hexMapAtom } from '../../state/hexmap';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { campaignAtom } from '../../state/campaign';
import { encounterAtom } from '../../state/encounter';
import { voyageAtom } from '../../state/voyage';
import type { Character } from '../../types/character';
import { VoyagePanel } from './VoyagePanel';

const monsters = raw as unknown as Monster[];

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

function renderPanel(voyage: Voyage | null = null, character?: Character) {
  const store = createStore();
  store.set(voyageAtom, voyage);
  store.set(campaignAtom, EMPTY_CAMPAIGN);
  store.set(encounterAtom, EMPTY_ENCOUNTER);
  render(
    <Provider store={store}>
      <VoyagePanel />
    </Provider>,
  );
  if (character) {
    // set after mounting: the stored roster is read through the full character schema, which a stub would not pass
    act(() => {
      store.set(charactersAtom, [character]);
      store.set(activeCharacterIdAtom, character.id);
    });
  }
  return store;
}

const hero = () =>
  ({ id: 'c1', name: 'Hero', classes: [{ classId: 'fighter', level: 1 }], statusEffects: [], currency: { cash: 0, savings: 0, debt: 0, spendingLog: '' } }) as unknown as Character;

describe('VoyagePanel', () => {
  it('sets sail onto a chart with the ship in its home harbour', async () => {
    const user = userEvent.setup();
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Set sail' }));

    const voyage = store.get(voyageAtom)!;
    expect(voyage).toMatchObject({ ship: 'cog', day: 0, hull: HULL.cog, moves: 0, hunger: 0 });
    expect(voyage.sea!.hexes).toHaveLength(37);
    expect(screen.getByRole('group', { name: 'Chart of the sea' })).toBeInTheDocument();
  });

  it('rolls the weather for headway and sails a hex with it', async () => {
    const user = userEvent.setup();
    const start = setSail('cog', 1);
    const store = renderPanel(start);
    const next = screen.getByRole('button', { name: 'Next day at sea' });
    await waitFor(() => expect(next).toBeEnabled());
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // fair weather, no monster

    await user.click(next);
    expect(store.get(voyageAtom)).toMatchObject({ day: 1, moves: 1, weather: 'fair' });
    expect(screen.getByText('Fair weather: a day of headway.')).toBeInTheDocument();

    const chart = screen.getByRole('group', { name: 'Chart of the sea' });
    const reachable = chart.querySelectorAll('[data-reachable]');
    expect(reachable.length).toBeGreaterThan(0);
    await user.click(reachable[0] as Element);
    const after = store.get(voyageAtom)!;
    expect(after.moves).toBe(0);
    expect(after.sea!.ship).not.toEqual(start.sea!.origin);
  });

  it('puts hunger on the open character as a status effect once the hold is empty', async () => {
    const user = userEvent.setup();
    const start = { ...setSail('cog', 1), supplies: 0 };
    const store = renderPanel(start, hero());
    const next = screen.getByRole('button', { name: 'Next day at sea' });
    await waitFor(() => expect(next).toBeEnabled());
    vi.spyOn(Math, 'random').mockReturnValue(0.5);

    await user.click(next);

    expect(store.get(voyageAtom)!.hunger).toBe(1);
    await waitFor(() => expect(store.get(charactersAtom)[0].statusEffects.map((effect) => effect.id)).toContain('voyage-hunger'));
    expect(store.get(charactersAtom)[0].statusEffects.find((effect) => effect.id === 'voyage-hunger')!.modifiers).toContainEqual({ field: 'accuracy', value: -1 });
    expect(screen.getByRole('alert')).toHaveTextContent('−1 to every check');
  });

  it('lets a sea monster strike the ship and takes the hull down', async () => {
    const user = userEvent.setup();
    const kraken = monsters.find((entry) => /sea|ocean/i.test(entry.habitat) && entry.sections[0]?.accuracy && entry.sections[0].damage)!;
    const start = { ...setSail('boat', kraken.level), encounter: { monsterId: kraken.id, count: 1 } };
    const store = renderPanel(start);
    await screen.findByText(new RegExp(kraken.name));
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // boxcars: an automatic hit

    await user.click(screen.getByRole('checkbox', { name: 'fixed' }));
    await user.click(screen.getByRole('button', { name: 'The monster strikes the ship' }));

    expect(store.get(voyageAtom)!.hull).toBeLessThan(HULL.boat);
    expect(screen.getByText(/the hull loses/)).toBeInTheDocument();
  });

  it('trades crates in a harbour against the open character\'s purse', async () => {
    const user = userEvent.setup();
    const store = renderPanel(setSail('cog', 1), { ...hero(), currency: { cash: 1000, savings: 0, debt: 0, spendingLog: '' } } as Character);

    await user.click(screen.getByRole('button', { name: 'Buy a crate of grain' }));
    expect(store.get(voyageAtom)!.cargo[0]).toBe(1);
    const spent = 1000 - store.get(charactersAtom)[0].currency.cash;
    expect(spent).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Sell a crate of grain' }));
    expect(store.get(voyageAtom)!.cargo[0]).toBe(0);
    expect(store.get(charactersAtom)[0].currency.cash).toBe(1000);
  });

  it('will not sell a crate it does not hold, nor buy one it cannot pay for', async () => {
    renderPanel(setSail('cog', 1), { ...hero(), currency: { cash: 10, savings: 0, debt: 0, spendingLog: '' } } as Character);

    expect(screen.getByRole('button', { name: 'Sell a crate of grain' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buy a crate of grain' })).toBeDisabled();
  });

  it('buys a second ship at the quay for its price', async () => {
    const user = userEvent.setup();
    const store = renderPanel(setSail('cog', 1), { ...hero(), currency: { cash: 5000, savings: 0, debt: 0, spendingLog: '' } } as Character);

    await user.click(screen.getByRole('button', { name: 'Buy the ship' }));

    expect(store.get(voyageAtom)!.escorts).toEqual([{ ship: 'boat', hull: HULL.boat }]);
    expect(store.get(charactersAtom)[0].currency.cash).toBe(2000);
  });

  it('opens the town ashore from a harbour', async () => {
    const user = userEvent.setup();
    const store = renderPanel(setSail('cog', 1));

    await user.click(screen.getByRole('button', { name: 'Go ashore' }));

    expect(store.get(dungeonAtom)).toMatchObject({ kind: 'settlement' });
  });

  it('counts voyage days on the campaign calendar', async () => {
    const user = userEvent.setup();
    const store = renderPanel(setSail('cog', 1));
    const before = store.get(campaignAtom).day;

    await user.click(screen.getByRole('button', { name: 'A day in port' }));

    expect(store.get(voyageAtom)!.day).toBe(1);
    expect(store.get(campaignAtom).day).toBe(before + 1);
  });

  it('fights a hostile sail: a broadside, grapples that put the crew on the table, then the prize', async () => {
    const user = userEvent.setup();
    const crew = monsters.find((entry) => entry.category === 'Humanoids' && entry.level >= 1)!;
    const chased: Voyage = { ...setSail('cog', crew.level), pursuit: { ship: 'boat', hull: 8, crewId: crew.id, crewCount: 3, crewLevel: crew.level, state: 'closing', round: 0 } };
    const store = renderPanel(chased, { ...hero(), currency: { cash: 0, savings: 0, debt: 0, spendingLog: '' } } as Character);
    await screen.findByText(/A sail is closing/);
    expect(screen.getByRole('button', { name: 'Next day at sea' })).toBeDisabled();

    vi.spyOn(Math, 'random').mockReturnValue(0.99); // boxcars on every die
    await user.click(screen.getByRole('button', { name: 'Fire a broadside' }));
    expect(store.get(voyageAtom)!.pursuit!.hull).toBeLessThan(8);

    await user.click(screen.getByRole('button', { name: 'Throw grapples' }));
    expect(store.get(voyageAtom)!.pursuit!.state).toBe('grappled');
    expect(store.get(encounterAtom).monsters).toHaveLength(3);

    await user.click(screen.getByRole('button', { name: 'The deck is ours: take the prize' }));
    expect(store.get(voyageAtom)!.pursuit!.state).toBe('taken');
    expect(store.get(charactersAtom)[0].currency.cash).toBeGreaterThan(0);
  });

  it('lets the party slip away from a hostile sail', async () => {
    const user = userEvent.setup();
    const crew = monsters.find((entry) => entry.category === 'Humanoids' && entry.level >= 1)!;
    const chased: Voyage = { ...setSail('cog', 3), moves: 2, pursuit: { ship: 'boat', hull: 8, crewId: crew.id, crewCount: 3, crewLevel: 2, state: 'closing', round: 0 } };
    const store = renderPanel(chased);
    await screen.findByText(/A sail is closing/);
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    await user.click(screen.getByRole('button', { name: 'Break away' }));

    expect(store.get(voyageAtom)!.pursuit!.state).toBe('fled');
  });

  it('takes a blow to the hull, and logs a shipwreck', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.click(screen.getByRole('button', { name: 'Set sail' }));

    await user.clear(screen.getByLabelText('Blow to the hull'));
    await user.type(screen.getByLabelText('Blow to the hull'), '99');
    await user.click(screen.getByRole('button', { name: 'Strike the hull' }));

    expect(store.get(voyageAtom)).toMatchObject({ hull: 0, wrecked: true });
    expect(screen.getByText('The hull gives way. The ship is lost.')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'To the log' }));
    expect(store.get(campaignAtom).entries[0]).toMatchObject({ kind: 'scene', title: 'Shipwreck' });

    await user.click(screen.getByRole('button', { name: 'Finish' }));
    expect(store.get(voyageAtom)).toBeNull();
  });
});

describe('VoyagePanel crew and landfall', () => {
  it('shows the crew, and a ship bought at the quay is short-handed until sailors are hired', async () => {
    const user = userEvent.setup();
    const store = renderPanel({ ...setSail('cog', 1), recruits: 6 }, { ...hero(), currency: { cash: 5000, savings: 0, debt: 0, spendingLog: '' } } as Character);
    expect(screen.getByText(/Crew 6\/6\./)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hire a sailor/ })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Buy the ship' }));
    expect(screen.getByText(/Crew 6\/8\. Short-handed/)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Hire a sailor (25 G)' }));
    expect(store.get(voyageAtom)!.crew).toBe(7);
    expect(store.get(charactersAtom)[0].currency.cash).toBe(2000 - 25);

    await user.click(screen.getByRole('button', { name: 'Hire 1 to a full crew (25 G)' }));
    expect(store.get(voyageAtom)!.crew).toBe(8);
    expect(screen.queryByText(/Short-handed/)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hire a sailor/ })).not.toBeInTheDocument();
  });

  it('will not hire what the purse cannot pay', () => {
    renderPanel({ ...setSail('cog', 1), crew: 3, recruits: 6 }, { ...hero(), currency: { cash: 40, savings: 0, debt: 0, spendingLog: '' } } as Character);
    expect(screen.getByRole('button', { name: 'Hire a sailor (25 G)' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Hire 3 to a full crew (75 G)' })).toBeDisabled();
  });

  it('offers only the sailors the quay has today', () => {
    renderPanel({ ...setSail('cog', 1), crew: 3, recruits: 2 }, { ...hero(), currency: { cash: 500, savings: 0, debt: 0, spendingLog: '' } } as Character);
    expect(screen.getByText(/Sailors on the quay today: 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hire 2 to a full crew (50 G)' })).toBeEnabled();
  });

  it('hires nobody from an empty quay and says to wait a day', () => {
    renderPanel({ ...setSail('cog', 1), crew: 3, recruits: 0 }, hero());
    expect(screen.getByText(/Nobody on the quay is looking for work/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hire a sailor/ })).not.toBeInTheDocument();
  });

  it('steps back ashore at the home harbour, onto the hex the party sailed from, and ends the voyage; it asks first', async () => {
    const user = userEvent.setup();
    const land = generateHexMap({ level: 1, monsters });
    const hexes = land.hexes.map((hex) => (hex.q === 1 && hex.r === 0 ? { ...hex, feature: { kind: 'settlement' as const, settlement: 'village' as const } } : hex));
    const store = renderPanel({ ...setSail('cog', 1, Math.random, { homeHex: '1,0', homeSettlement: 'village' }) });
    act(() => store.set(hexMapAtom, { ...land, hexes, rations: 1, fatigue: 3 }));

    await user.click(screen.getByRole('button', { name: 'Back ashore at home (hex 1,0)' }));
    expect(store.get(voyageAtom)).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Stay aboard' }));
    await user.click(screen.getByRole('button', { name: 'Back ashore at home (hex 1,0)' }));
    await user.click(screen.getByRole('button', { name: 'Step ashore' }));

    expect(store.get(voyageAtom)).toBeNull();
    const back = store.get(hexMapAtom);
    expect(back.party).toEqual({ q: 1, r: 0 });
    expect(back.rations).toBe(7);
    expect(back.fatigue).toBe(0);
    expect(back.hexes).toHaveLength(land.hexes.length);
  });

  it('has no way home once the land map was replaced and the hex is gone', () => {
    renderPanel({ ...setSail('cog', 1, Math.random, { homeHex: '9,9', homeSettlement: 'village' }) });
    expect(screen.queryByRole('button', { name: /Back ashore at home/ })).not.toBeInTheDocument();
  });

  it('lands in a new country: a fresh land map around the harbour town, the voyage put away; it asks first', async () => {
    const user = userEvent.setup();
    const voyage = setSail('cog', 2);
    const arrived = { ...voyage, arrived: true, sea: { ...voyage.sea!, ship: { ...voyage.sea!.destination } } };
    const store = renderPanel(arrived);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Land in the new country' })).toBeEnabled());

    await user.click(screen.getByRole('button', { name: 'Land in the new country' }));
    expect(store.get(voyageAtom)).not.toBeNull();
    await user.click(screen.getByRole('button', { name: 'Stay aboard' }));
    expect(screen.getByRole('button', { name: 'Land in the new country' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Land in the new country' }));
    await user.click(screen.getByRole('button', { name: 'Go ashore' }));

    expect(store.get(voyageAtom)).toBeNull();
    const land = store.get(hexMapAtom);
    expect(land.party).toEqual({ q: 0, r: 0 });
    expect(land.hexes.find((hex) => hex.q === 0 && hex.r === 0)?.feature.kind).toBe('settlement');
  });
});

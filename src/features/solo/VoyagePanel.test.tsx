import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import raw from '../../data/monsters/monsters.json';
import type { Monster } from '../../data/monsters/types';
import { EMPTY_CAMPAIGN } from '../../lib/campaign';
import { EMPTY_ENCOUNTER } from '../../lib/encounter';
import type { HexMap } from '../../lib/hexmap';
import { HULL, setSail, type Voyage } from '../../lib/voyage';
import { harbourMap } from '../../test/harbour-map';
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

/** A cog at the home village's quay (hex 0,0 of the test coast), the party aboard. */
const cog = (level = 1): Voyage => setSail('cog', level, { q: 0, r: 0, settlement: 'village' }, () => 0.5);

function renderPanel(voyage: Voyage | null = null, character?: Character, map: HexMap = harbourMap()) {
  const store = createStore();
  store.set(voyageAtom, voyage);
  store.set(hexMapAtom, map);
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

const purse = (cash: number) => ({ ...hero(), currency: { cash, savings: 0, debt: 0, spendingLog: '' } }) as Character;

describe('VoyagePanel', () => {
  it('sets sail from the harbour the party stands in, onto the same map, with the ship at its quay', async () => {
    const user = userEvent.setup();
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Set sail' }));

    expect(store.get(voyageAtom)).toMatchObject({ ship: 'cog', at: { q: 0, r: 0 }, aboard: true, day: 0, hull: HULL.cog, moves: 0, hunger: 0 });
    // the harbour has a market from the moment a ship calls
    expect(store.get(hexMapAtom).hexes.find((hex) => hex.q === 0 && hex.r === 0)?.market).toHaveLength(6);
  });

  it('cannot set sail from anywhere but a harbour, and says so', () => {
    renderPanel(null, undefined, { ...harbourMap(), party: { q: -1, r: 0 } });
    expect(screen.getByRole('button', { name: 'Set sail' })).toBeDisabled();
    expect(screen.getByText(/A ship sails from a harbour/)).toBeInTheDocument();
  });

  it('rolls the weather for headway', async () => {
    const user = userEvent.setup();
    const store = renderPanel(cog());
    const next = screen.getByRole('button', { name: 'Next day at sea' });
    await waitFor(() => expect(next).toBeEnabled());
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // fair weather, no monster

    await user.click(next);

    expect(store.get(voyageAtom)).toMatchObject({ day: 1, moves: 1, weather: 'fair' });
    expect(screen.getByText('Fair weather: a day of headway.')).toBeInTheDocument();
    expect(screen.getByText('Headway today: 1 hexes')).toBeInTheDocument();
  });

  it('lets the markets drift with the day at sea', async () => {
    const user = userEvent.setup();
    const map = { ...harbourMap(), hexes: harbourMap().hexes.map((hex) => (hex.q === 0 && hex.r === 0 ? { ...hex, market: [3, 3, 3, 3, 3, 3] } : hex)) };
    const store = renderPanel(cog(), undefined, map);
    const next = screen.getByRole('button', { name: 'Next day at sea' });
    await waitFor(() => expect(next).toBeEnabled());
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // a die of 6 everywhere: every price one dearer

    await user.click(next);

    expect(store.get(hexMapAtom).hexes.find((hex) => hex.q === 0 && hex.r === 0)?.market).toEqual([4, 4, 4, 4, 4, 4]);
  });

  it('puts hunger on the open character as a status effect once the hold is empty', async () => {
    const user = userEvent.setup();
    const start = { ...cog(), supplies: 0 };
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
    const start = { ...setSail('boat', kraken.level, { q: 0, r: 0 }), encounter: { monsterId: kraken.id, count: 1 } };
    const store = renderPanel(start);
    await screen.findByText(new RegExp(kraken.name));
    vi.spyOn(Math, 'random').mockReturnValue(0.99); // boxcars: an automatic hit

    await user.click(screen.getByRole('checkbox', { name: 'fixed' }));
    await user.click(screen.getByRole('button', { name: 'The monster strikes the ship' }));

    expect(store.get(voyageAtom)!.hull).toBeLessThan(HULL.boat);
    expect(screen.getByText(/the hull loses/)).toBeInTheDocument();
  });

  it("trades crates in a harbour against the open character's purse", async () => {
    const user = userEvent.setup();
    const store = renderPanel(cog(), purse(1000));

    await user.click(screen.getByRole('button', { name: 'Buy a crate of grain' }));
    expect(store.get(voyageAtom)!.cargo[0]).toBe(1);
    const spent = 1000 - store.get(charactersAtom)[0].currency.cash;
    expect(spent).toBeGreaterThan(0);

    await user.click(screen.getByRole('button', { name: 'Sell a crate of grain' }));
    expect(store.get(voyageAtom)!.cargo[0]).toBe(0);
    expect(store.get(charactersAtom)[0].currency.cash).toBe(1000);
  });

  it('will not sell a crate it does not hold, nor buy one it cannot pay for', async () => {
    renderPanel(cog(), purse(10));

    expect(screen.getByRole('button', { name: 'Sell a crate of grain' })).toBeDisabled();
    expect(screen.getByRole('button', { name: 'Buy a crate of grain' })).toBeDisabled();
  });

  it('has no market out on the water', () => {
    renderPanel({ ...cog(), at: { q: 1, r: 0 } }, purse(1000));
    expect(screen.queryByRole('button', { name: 'Buy a crate of grain' })).not.toBeInTheDocument();
  });

  it('buys a second ship at the quay for its price', async () => {
    const user = userEvent.setup();
    const store = renderPanel(cog(), purse(5000));

    await user.click(screen.getByRole('button', { name: 'Buy the ship' }));

    expect(store.get(voyageAtom)!.escorts).toEqual([{ ship: 'boat', hull: HULL.boat }]);
    expect(store.get(charactersAtom)[0].currency.cash).toBe(2000);
  });

  it('opens the streets of the harbour town', async () => {
    const user = userEvent.setup();
    const store = renderPanel(cog());

    await user.click(screen.getByRole('button', { name: 'Walk the streets' }));

    expect(store.get(dungeonAtom)).toMatchObject({ kind: 'settlement' });
  });

  it('counts voyage days on the campaign calendar', async () => {
    const user = userEvent.setup();
    const store = renderPanel(cog());
    const before = store.get(campaignAtom).day;

    await user.click(screen.getByRole('button', { name: 'A day in port' }));

    expect(store.get(voyageAtom)!.day).toBe(1);
    expect(store.get(campaignAtom).day).toBe(before + 1);
  });

  it('goes ashore at the quay, the ship waiting; the market and the quay stay open to the party beside it, and it comes aboard again', async () => {
    const user = userEvent.setup();
    const store = renderPanel(cog(), purse(1000));

    await user.click(screen.getByRole('button', { name: 'Go ashore (the ship waits at the quay)' }));
    expect(store.get(voyageAtom)).toMatchObject({ aboard: false, at: { q: 0, r: 0 } });
    expect(screen.getByText(/The ship waits at hex 0,0/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Buy a crate of grain' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Next day at sea' })).not.toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Go aboard' }));
    expect(store.get(voyageAtom)!.aboard).toBe(true);
  });

  it('leaves the ship alone when the party is away from it', () => {
    renderPanel({ ...cog(), aboard: false }, undefined, { ...harbourMap(), party: { q: -1, r: 0 } });
    expect(screen.getByText(/The ship waits at hex 0,0/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Go aboard' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Buy a crate of grain' })).not.toBeInTheDocument();
  });

  it('searches the island the ship lies at, once, and marks it on the map', async () => {
    const user = userEvent.setup();
    const store = renderPanel({ ...cog(), at: { q: 1, r: -1 } });
    await waitFor(() => expect(screen.getByRole('button', { name: 'Search the island' })).toBeEnabled());
    vi.spyOn(Math, 'random').mockReturnValue(0); // a spring

    await user.click(screen.getByRole('button', { name: 'Search the island' }));

    expect(store.get(hexMapAtom).hexes.find((hex) => hex.q === 1 && hex.r === -1)?.explored).toBe(true);
    expect(screen.queryByRole('button', { name: 'Search the island' })).not.toBeInTheDocument();
  });

  it('fights a hostile sail: a broadside, grapples that put the crew on the table, then the prize', async () => {
    const user = userEvent.setup();
    const crew = monsters.find((entry) => entry.category === 'Humanoids' && entry.level >= 1)!;
    const chased: Voyage = { ...cog(crew.level), pursuit: { ship: 'boat', hull: 8, crewId: crew.id, crewCount: 3, crewLevel: crew.level, state: 'closing', round: 0 } };
    const store = renderPanel(chased, purse(0));
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
    const chased: Voyage = { ...cog(3), moves: 2, pursuit: { ship: 'boat', hull: 8, crewId: crew.id, crewCount: 3, crewLevel: 2, state: 'closing', round: 0 } };
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

describe('VoyagePanel crew', () => {
  it('shows the crew, and a ship bought at the quay is short-handed until sailors are hired', async () => {
    const user = userEvent.setup();
    const store = renderPanel({ ...cog(), recruits: 6 }, purse(5000));
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
    renderPanel({ ...cog(), crew: 3, recruits: 6 }, purse(40));
    expect(screen.getByRole('button', { name: 'Hire a sailor (25 G)' })).toBeEnabled();
    expect(screen.getByRole('button', { name: 'Hire 3 to a full crew (75 G)' })).toBeDisabled();
  });

  it('offers only the sailors the quay has today', () => {
    renderPanel({ ...cog(), crew: 3, recruits: 2 }, purse(500));
    expect(screen.getByText(/Sailors on the quay today: 2/)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Hire 2 to a full crew (50 G)' })).toBeEnabled();
  });

  it('hires nobody from an empty quay and says to wait a day', () => {
    renderPanel({ ...cog(), crew: 3, recruits: 0 }, hero());
    expect(screen.getByText(/Nobody on the quay is looking for work/)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Hire a sailor/ })).not.toBeInTheDocument();
  });
});

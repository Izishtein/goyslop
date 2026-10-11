import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_ORACLE } from '../../lib/oracle';
import { addEntry, EMPTY_CAMPAIGN } from '../../lib/campaign';
import { campaignAtom } from '../../state/campaign';
import { oracleAtom } from '../../state/oracle';
import { OraclePanel } from './OraclePanel';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

function renderPanel() {
  const store = createStore();
  store.set(oracleAtom, EMPTY_ORACLE);
  render(
    <Provider store={store}>
      <OraclePanel />
    </Provider>,
  );
  return store;
}

describe('OraclePanel', () => {
  it('answers a question and logs it', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.29); // d100 = 30 ≤ 50, event roll 30 > 15
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Ask the oracle' }));

    expect(store.get(oracleAtom).log).toHaveLength(1);
    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('Yes');
  });

  it('changes the chance with the likelihood and the chaos', async () => {
    const user = userEvent.setup();
    const store = renderPanel();

    expect(screen.getByText('“yes” chance 50%')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Raise chaos' }));
    expect(store.get(oracleAtom).chaos).toBe(6);
    expect(screen.getByText('“yes” chance 55%')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Likelihood'), 'unlikely');
    expect(screen.getByText('“yes” chance 35%')).toBeInTheDocument();
  });

  it('counts scenes and keeps the state across a remount', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.95); // scene goes as expected
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));

    expect(store.get(oracleAtom).scene).toBe(1);
    expect(screen.getByText('Scenes so far: 1')).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('goes as expected');
  });

  it('resets', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.click(screen.getByRole('button', { name: 'Random event' }));
    await user.click(screen.getByRole('button', { name: 'Reset oracle' }));
    expect(store.get(oracleAtom)).toEqual(EMPTY_ORACLE);
  });
});

describe('OraclePanel and the journal', () => {
  function renderWithJournal() {
    const store = renderPanel();
    act(() => {
      store.set(campaignAtom, addEntry(EMPTY_CAMPAIGN, { kind: 'npc', title: 'Marta', text: '', scene: 0 }, 'm'));
    });
    return store;
  }

  it('names a journal entry in an event about a known character', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.15); // d11 = 2: a known character acts
    renderWithJournal();

    await user.click(screen.getByRole('button', { name: 'Random event' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('Marta (NPC)');
  });

  it('lets the player choose the focus instead of rolling', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.15);
    renderPanel();

    await user.selectOptions(screen.getByLabelText('Event focus'), 'A windfall');
    await user.click(screen.getByRole('button', { name: 'Random event' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('A windfall');
  });

  it('breaks in with an interrupted scene without a check', async () => {
    const user = userEvent.setup();
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Interrupted scene (stuck)' }));

    expect(store.get(oracleAtom).scene).toBe(1);
    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('interrupted');
    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('no check');
  });

  it('ends a scene: chaos moves, those who took part get heavier', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.95);
    const store = renderWithJournal();
    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));

    await user.click(screen.getByRole('button', { name: 'End the scene' }));
    await user.click(screen.getByLabelText(/Marta/));
    await user.click(screen.getByLabelText('The hero was in control of the scene'));
    await user.click(screen.getByRole('button', { name: 'Apply' }));

    expect(store.get(oracleAtom).chaos).toBe(6); // not in control: +1
    expect(store.get(campaignAtom).entries[0].weight).toBe(2);
    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('chaos 5 → 6');
  });

  it('keeps the chaos mode and offers no judging in random mode', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));

    await user.selectOptions(screen.getByLabelText('Chaos after a scene'), 'random');
    await user.click(screen.getByRole('button', { name: 'End the scene' }));

    expect(store.get(oracleAtom).chaosMode).toBe('random');
    expect(screen.queryByLabelText('The hero was in control of the scene')).not.toBeInTheDocument();
  });
});

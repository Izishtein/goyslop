import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_ORACLE } from '../../lib/oracle';
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

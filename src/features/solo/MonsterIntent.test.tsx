import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_ORACLE } from '../../lib/oracle';
import { oracleAtom } from '../../state/oracle';
import { MonsterIntent } from './MonsterIntent';

afterEach(() => vi.restoreAllMocks());

function renderIntent() {
  const store = createStore();
  store.set(oracleAtom, EMPTY_ORACLE);
  render(
    <Provider store={store}>
      <MonsterIntent label="Goblin 1" />
    </Provider>,
  );
}

describe('MonsterIntent', () => {
  it('says the monster carries on when the oracle says yes', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.5); // d100 = 51 ≤ 85, no event (51 > 15)
    renderIntent();

    await user.click(screen.getByRole('button', { name: 'What does Goblin 1 do now?' }));

    expect(screen.getByRole('status')).toHaveTextContent('It carries on');
  });

  it('names a new action when the oracle says no', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.9); // d100 = 91 > 85: no; d12 = 11
    renderIntent();

    await user.click(screen.getByRole('button', { name: 'What does Goblin 1 do now?' }));

    expect(screen.getByRole('status')).toHaveTextContent(/It changes its plan.*— flees/);
  });
});

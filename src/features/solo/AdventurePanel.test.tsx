import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_ORACLE } from '../../lib/oracle';
import { newKeyedScene } from '../../lib/keyed';
import { adventureAtom, EMPTY_ADVENTURE } from '../../state/adventure';
import { oracleAtom } from '../../state/oracle';
import { AdventurePanel } from './AdventurePanel';
import { OraclePanel } from './OraclePanel';

beforeEach(() => localStorage.clear());
afterEach(() => vi.restoreAllMocks());

function renderBoth(adventure = EMPTY_ADVENTURE) {
  const store = createStore();
  store.set(adventureAtom, adventure);
  store.set(oracleAtom, EMPTY_ORACLE);
  render(
    <Provider store={store}>
      <OraclePanel />
      <AdventurePanel />
    </Provider>,
  );
  return store;
}

describe('AdventurePanel', () => {
  it('writes a keyed scene, from a template and by hand', async () => {
    const user = userEvent.setup();
    const store = renderBoth();

    await user.selectOptions(screen.getByLabelText('Template'), 'The boss shows up');
    expect(screen.getByLabelText('From scene …')).toHaveValue(15);
    await user.click(screen.getByRole('button', { name: 'Add keyed scene' }));

    expect(store.get(adventureAtom).keyed[0]).toMatchObject({ title: 'The boss shows up', trigger: 'milestone', at: 15, chance: 3, repeat: false });
    expect(screen.getByLabelText('What happens')).toHaveValue('');
  });

  it('fires a counter in the scene it falls due and says so in the oracle log', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.95);
    const store = renderBoth({ ...EMPTY_ADVENTURE, keyed: [newKeyedScene({ title: 'Wolves howl', trigger: 'counter', every: 2, repeat: true }, 'k')] });

    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));
    expect(screen.getByText(/scene 1 of 2/)).toBeInTheDocument();
    expect(screen.getByRole('list', { name: 'Oracle log' })).not.toHaveTextContent('Wolves howl');
    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('Scene 2: keyed scene fired — Wolves howl');
    expect(store.get(adventureAtom).keyed[0].count).toBe(0);
  });

  it('lets a scene that happened by itself start over', async () => {
    const user = userEvent.setup();
    const store = renderBoth({ ...EMPTY_ADVENTURE, keyed: [newKeyedScene({ title: 'Boss', trigger: 'counter', every: 3 }, 'k')] });

    await user.click(screen.getByRole('button', { name: 'It happened by itself' }));

    expect(store.get(adventureAtom).keyed[0].done).toBe(true);
    expect(screen.queryByRole('button', { name: 'It happened by itself' })).not.toBeInTheDocument();
  });

  it('in a prepared adventure: features, the feature focus, no bent scenes, and the diminisher', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const store = renderBoth();
    expect(screen.queryByLabelText('Feature')).not.toBeInTheDocument();

    await user.click(screen.getByLabelText('Prepared adventure'));
    await user.type(screen.getByLabelText('Feature'), 'The fog thickens');
    await user.click(screen.getByRole('button', { name: 'Add feature' }));
    await user.click(screen.getByRole('button', { name: 'Random event' }));
    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('A feature of the adventure — The fog thickens');

    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));
    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('an extra event comes with it');

    await user.selectOptions(screen.getByLabelText('Hero’s strength compared with the party the module is written for'), 'half (1/2)');
    expect(store.get(adventureAtom).diminisher).toBe(0.5);
    expect(screen.getByText('Field 3 of them (the rest: weaker, or fewer HP and damage).')).toBeInTheDocument();
  });
});

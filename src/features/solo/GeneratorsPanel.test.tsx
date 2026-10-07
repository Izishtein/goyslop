import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { EMPTY_CAMPAIGN } from '../../lib/campaign';
import { campaignAtom } from '../../state/campaign';
import { GeneratorsPanel } from './GeneratorsPanel';

beforeEach(() => localStorage.clear());

function renderPanel() {
  const store = createStore();
  store.set(campaignAtom, EMPTY_CAMPAIGN);
  render(
    <Provider store={store}>
      <GeneratorsPanel />
    </Provider>,
  );
  return store;
}

describe('GeneratorsPanel', () => {
  it('draws an NPC and writes it to the log as an NPC entry', async () => {
    const user = userEvent.setup();
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'NPC' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Manner:.*Wants:.*Secret:/);
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));

    const entry = store.get(campaignAtom).entries[0];
    expect(entry.kind).toBe('npc');
    expect(entry.text).toContain('Secret:');
    expect(screen.getByRole('button', { name: 'Logged' })).toBeDisabled();
  });

  it('draws a tavern and a settlement with its inn', async () => {
    const user = userEvent.setup();
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Tavern' }));
    expect(screen.getByRole('status')).toHaveTextContent(/^The .* .*Keeper:.*House special:.*Rumour:/);

    await user.click(screen.getByRole('button', { name: 'Settlement' }));
    expect(screen.getByRole('status')).toHaveTextContent(/Known for.*Trouble:.*Worth meeting:.*Inn:/);
  });
});

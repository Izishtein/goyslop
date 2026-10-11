import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import '../../i18n';
import { EMPTY_CAMPAIGN } from '../../lib/campaign';
import { EMPTY_ORACLE } from '../../lib/oracle';
import { campaignAtom } from '../../state/campaign';
import { oracleAtom } from '../../state/oracle';
import { CampaignPanel } from './CampaignPanel';

beforeEach(() => localStorage.clear());

function renderPanel() {
  const store = createStore();
  store.set(campaignAtom, EMPTY_CAMPAIGN);
  store.set(oracleAtom, { ...EMPTY_ORACLE, scene: 3 });
  render(
    <Provider store={store}>
      <CampaignPanel />
    </Provider>,
  );
  return store;
}

describe('CampaignPanel', () => {
  it('writes an entry stamped with the day and the oracle scene', async () => {
    const user = userEvent.setup();
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Next day' }));
    await user.selectOptions(screen.getByLabelText('Kind'), 'threat');
    await user.type(screen.getByLabelText('Title'), 'Wolves');
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));

    expect(store.get(campaignAtom).entries[0]).toMatchObject({ kind: 'threat', title: 'Wolves', day: 2, scene: 3 });
    expect(screen.getByRole('list', { name: 'Campaign log entries' })).toHaveTextContent('day 2, scene 3');
    expect(screen.getByLabelText('Title')).toHaveValue('');
  });

  it('settles a threat and takes it off the "still open" list', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.selectOptions(screen.getByLabelText('Kind'), 'threat');
    await user.type(screen.getByLabelText('Title'), 'Wolves');
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));

    await user.selectOptions(screen.getByLabelText('Show'), 'open');
    expect(screen.getByText('Wolves')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Threat dealt with' }));

    expect(store.get(campaignAtom).entries[0].closed).toBe(true);
    expect(screen.getByText('Nothing matches.')).toBeInTheDocument();
  });

  it('removes an entry', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.type(screen.getByLabelText('Title'), 'Inn');
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));
    await user.click(screen.getByRole('button', { name: 'Remove Inn' }));
    expect(store.get(campaignAtom).entries).toEqual([]);
  });
});

describe('CampaignPanel weights', () => {
  it('raises and lowers how often the oracle picks an entry, within 1–3; scenes have no weight', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.selectOptions(screen.getByLabelText('Kind'), 'npc');
    await user.type(screen.getByLabelText('Title'), 'Marta');
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));

    await user.click(screen.getByRole('button', { name: 'More often: Marta' }));
    await user.click(screen.getByRole('button', { name: 'More often: Marta' }));
    expect(store.get(campaignAtom).entries[0].weight).toBe(3);
    expect(screen.getByRole('button', { name: 'More often: Marta' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Less often: Marta' }));
    expect(store.get(campaignAtom).entries[0].weight).toBe(2);

    await user.selectOptions(screen.getByLabelText('Kind'), 'scene');
    await user.type(screen.getByLabelText('Title'), 'Inn');
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));
    expect(screen.queryByRole('button', { name: 'More often: Inn' })).not.toBeInTheDocument();
  });

  it('reads an old saved log, written before weights existed, as weight 1', () => {
    localStorage.setItem(
      'sw25.campaign',
      JSON.stringify({ day: 3, entries: [{ id: 'a', kind: 'npc', title: 'Marta', text: '', closed: false, day: 1, scene: 0 }] }),
    );
    render(
      <Provider store={createStore()}>
        <CampaignPanel />
      </Provider>,
    );
    expect(screen.getByText('weight 1')).toBeInTheDocument();
  });
});

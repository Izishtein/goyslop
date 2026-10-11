import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

describe('CampaignPanel thread track', () => {
  async function addThread(user: ReturnType<typeof userEvent.setup>) {
    const store = renderPanel();
    await user.selectOptions(screen.getByLabelText('Kind'), 'thread');
    await user.type(screen.getByLabelText('Title'), 'Find the sister');
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));
    return store;
  }

  it('gives a thread a track, fills it, and keeps it unsettled until it is full', async () => {
    const user = userEvent.setup();
    const store = await addThread(user);

    await user.selectOptions(screen.getByLabelText('Progress track of Find the sister'), '10');
    expect(screen.getByRole('button', { name: 'Thread answered' })).toBeDisabled();

    for (let i = 0; i < 5; i += 1) {
      await user.click(screen.getByRole('button', { name: 'Step toward the goal (+2): Find the sister' }));
    }
    expect(store.get(campaignAtom).entries[0]).toMatchObject({ trackSize: 10, progress: 10 });
    expect(screen.getByRole('button', { name: 'Thread answered' })).toBeEnabled();
    expect(screen.getByText(/The track is full/)).toBeInTheDocument();
  });

  it('owes a flashpoint after a finished phase and logs a current-situation event for it', async () => {
    const user = userEvent.setup();
    const store = await addThread(user);
    await user.selectOptions(screen.getByLabelText('Progress track of Find the sister'), '15');
    for (let i = 0; i < 3; i += 1) {
      await user.click(screen.getByRole('button', { name: 'Step toward the goal (+2): Find the sister' }));
    }

    expect(screen.getByRole('button', { name: 'Flashpoint is due (+2): Find the sister' })).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Flashpoint is due (+2): Find the sister' }));

    expect(store.get(campaignAtom).entries[0]).toMatchObject({ progress: 8, flashpoints: 1 });
    expect(store.get(oracleAtom).log[0]).toMatchObject({ kind: 'event', event: { focus: 11, ref: { title: 'Find the sister' } } });
    expect(screen.getByRole('button', { name: 'Flashpoint (+2): Find the sister' })).toBeInTheDocument();
  });

  it('searches: logs the question and applies what it found', async () => {
    const user = userEvent.setup();
    const store = await addThread(user);
    await user.selectOptions(screen.getByLabelText('Progress track of Find the sister'), '20');
    vi.spyOn(Math, 'random').mockReturnValue(0.2); // d100 = 21 ≤ 50: yes (no event: 21 > 15); d10 = 3 → progress +2

    await user.click(screen.getByRole('button', { name: 'Discovery check: Find the sister' }));

    expect(store.get(campaignAtom).entries[0].progress).toBe(2);
    expect(store.get(oracleAtom).log[0]).toMatchObject({ kind: 'discovery', answer: 'yes', finds: [{ result: 'progress', points: 2 }] });
  });

  it('shuts the search for the rest of the scene after an exceptional no', async () => {
    const user = userEvent.setup();
    await addThread(user);
    await user.selectOptions(screen.getByLabelText('Progress track of Find the sister'), '10');
    vi.spyOn(Math, 'random').mockReturnValue(0.99);

    await user.click(screen.getByRole('button', { name: 'Discovery check: Find the sister' }));

    expect(screen.getByRole('button', { name: 'Discovery check: Find the sister' })).toBeDisabled();
  });
});

describe('CampaignPanel export', () => {
  it('hands the log to the browser as a Markdown file, and is off while the log is empty', async () => {
    const user = userEvent.setup();
    const created: Blob[] = [];
    vi.stubGlobal('URL', { ...URL, createObjectURL: (blob: Blob) => (created.push(blob), 'blob:log'), revokeObjectURL: () => {} });
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
    renderPanel();
    expect(screen.getByRole('button', { name: 'Download the log (.md)' })).toBeDisabled();

    await user.type(screen.getByLabelText('Title'), 'Arrival');
    await user.click(screen.getByRole('button', { name: 'Add to the log' }));
    await user.click(screen.getByRole('button', { name: 'Download the log (.md)' }));

    expect(created).toHaveLength(1);
    expect(await created[0].text()).toContain('**Arrival**');
    vi.unstubAllGlobals();
  });
});

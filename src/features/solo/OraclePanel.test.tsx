import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider, createStore } from 'jotai';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import '../../i18n';
import { EMPTY_ORACLE } from '../../lib/oracle';
import { addEntry, EMPTY_CAMPAIGN, updateEntry } from '../../lib/campaign';
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

describe('OraclePanel interpretation aids', () => {
  it('rolls a scene edit on demand', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.25); // d10 = 3
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Scene edit (d10)' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('weaken or remove an activity');
  });

  it('attaches the edit to an altered scene', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.25); // scene d10 = 3: altered; edit d10 = 3
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('Scene edit: weaken or remove an activity');
  });

  it('digs deeper with two more words and a connector', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0); // first words, first connector
    renderPanel();

    await user.click(screen.getByRole('button', { name: 'Dig deeper (two more words)' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('reveal of a debt');
  });

  it('answers as a rule: neutral chaos, plain answer, no event, and remembers the switch', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.01); // d100 = 1: would be an exceptional yes with an event
    const store = renderPanel();
    await user.click(screen.getByRole('button', { name: 'Raise chaos' }));
    await user.click(screen.getByLabelText('Oracle as a rule'));

    await user.click(screen.getByRole('button', { name: 'Ask the oracle' }));

    const log = screen.getByRole('list', { name: 'Oracle log' });
    expect(log).toHaveTextContent('as a rule: chaos 5, no events');
    expect(log).not.toHaveTextContent('strongly');
    expect(log).not.toHaveTextContent('Event');
    expect(store.get(oracleAtom).ruleMode).toBe(true);
  });

  it('keeps the reading tips at hand', () => {
    renderPanel();
    expect(screen.getByText('How to read the answers')).toBeInTheDocument();
  });
});

describe('OraclePanel weight of chaos', () => {
  it('changes the shown chances and is remembered', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.click(screen.getByRole('button', { name: 'Raise chaos' }));
    expect(screen.getByText('“yes” chance 55%')).toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Weight of chaos'), 'mild');
    expect(screen.getByText('“yes” chance 53%')).toBeInTheDocument();
    await user.selectOptions(screen.getByLabelText('Weight of chaos'), 'none');
    expect(screen.getByText('“yes” chance 50%')).toBeInTheDocument();
    expect(store.get(oracleAtom).chaosFlavor).toBe('none');
  });
});

describe('OraclePanel themed words', () => {
  it('rolls two words on the chosen theme', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0); // word 1 of each list
    renderPanel();

    await user.selectOptions(screen.getByLabelText('Theme'), 'Creature');
    await user.click(screen.getByRole('button', { name: 'Words on the theme' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('On the theme “Creature”: hunger / claws');
  });
});

describe('OraclePanel "I do not know"', () => {
  it('drops the person an event pointed at, and the journal can bring them back', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.15); // a known character acts
    const store = renderPanel();
    act(() => {
      store.set(campaignAtom, addEntry(EMPTY_CAMPAIGN, { kind: 'npc', title: 'Marta', text: '', scene: 0 }, 'm'));
    });
    await user.click(screen.getByRole('button', { name: 'Random event' }));

    await user.click(screen.getByRole('button', { name: 'I do not know — drop Marta from the log' }));

    expect(store.get(campaignAtom).entries[0].closed).toBe(true);
    expect(screen.queryByRole('button', { name: 'I do not know — drop Marta from the log' })).not.toBeInTheDocument();
  });

  it('keeps a thread under plot armor', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.45); // d11 = 5: a clue, from a thread
    const store = renderPanel();
    act(() => {
      let log = addEntry(EMPTY_CAMPAIGN, { kind: 'thread', title: 'Find the sister', text: '', scene: 0 }, 't');
      log = updateEntry(log, 't', { trackSize: 10, progress: 2 });
      store.set(campaignAtom, log);
    });
    await user.click(screen.getByRole('button', { name: 'Random event' }));

    expect(screen.getByRole('list', { name: 'Oracle log' })).toHaveTextContent('Find the sister');
    expect(screen.queryByRole('button', { name: /I do not know/ })).not.toBeInTheDocument();
  });
});

describe('OraclePanel style of play', () => {
  it('suggests ways to close a scene that suit the style', async () => {
    const user = userEvent.setup();
    const store = renderPanel();
    await user.click(screen.getByRole('button', { name: 'New scene (check)' }));
    await user.click(screen.getByRole('button', { name: 'End the scene' }));
    expect(screen.getByText(/Interest: stop where/)).toBeInTheDocument();
    expect(screen.queryByText(/Plot shift/)).not.toBeInTheDocument();

    await user.selectOptions(screen.getByLabelText('Style of play'), 'drama');

    expect(store.get(oracleAtom).style).toBe('drama');
    expect(screen.getByText(/Plot shift: stop on a turn/)).toBeInTheDocument();
    expect(screen.getByText(/Stuck\? Make the next scene/)).toBeInTheDocument();
  });
});

describe('OraclePanel opening', () => {
  it('begins the adventure: scene 1 without a check, and the four answers; the button is for the first scene only', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0);
    const store = renderPanel();

    await user.click(screen.getByRole('button', { name: 'Begin the adventure (who, what, where, why)' }));

    expect(store.get(oracleAtom).scene).toBe(1);
    const log = screen.getByRole('list', { name: 'Oracle log' });
    expect(log).toHaveTextContent('Who: pride / a rival');
    expect(log).toHaveTextContent('Where: dampness / a door');
    expect(log).toHaveTextContent('Scene 1 · goes as expected');
    expect(log).toHaveTextContent('no check');
    expect(screen.queryByRole('button', { name: /Begin the adventure/ })).not.toBeInTheDocument();
  });
});

describe('OraclePanel two-d10 answers', () => {
  it('switches the method, shows the modifier and logs the dice', async () => {
    const user = userEvent.setup();
    vi.spyOn(Math, 'random').mockReturnValue(0.55); // each d10 = 6 → 12, no doubles event (6 > 5? 6 is within no: chaos 5)
    const store = renderPanel();

    await user.selectOptions(screen.getByLabelText('Answer by'), 'fate');
    expect(store.get(oracleAtom).method).toBe('fate');
    expect(screen.getByText(/modifier 0; yes at 11\+/)).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Ask the oracle' }));

    const log = screen.getByRole('list', { name: 'Oracle log' });
    expect(log).toHaveTextContent('2d10 = 6+6, modifier 0 → 12');
    expect(log).toHaveTextContent('Yes');
  });

  it('spends, gains and refills Peril Points', async () => {
    const user = userEvent.setup();
    const store = renderPanel();

    expect(screen.getByText('Peril Points 2')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Spend 1' }));
    await user.click(screen.getByRole('button', { name: 'Spend 1' }));
    expect(store.get(oracleAtom).peril).toBe(0);
    expect(screen.getByRole('button', { name: 'Spend 1' })).toBeDisabled();
    await user.click(screen.getByRole('button', { name: 'Refill to 2' }));
    expect(store.get(oracleAtom).peril).toBe(2);
    await user.click(screen.getByRole('button', { name: '+1' }));
    expect(store.get(oracleAtom).peril).toBe(3);
    expect(screen.getByRole('button', { name: 'Refill to 2' })).toBeDisabled();
  });
});

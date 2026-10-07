import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import '../../i18n';
import { MonstersReference } from './MonstersReference';

describe('MonstersReference', () => {
  it('lists the catalogue once it has loaded, and narrows it by name', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);

    expect(await screen.findByText('Showing 375 of 375')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search'), 'goblin');

    expect(screen.getByRole('status')).toHaveTextContent(/Showing \d+ of 375/);
    expect(screen.getByRole('button', { name: /Goblin\b/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Wolf/ })).toBeNull();
  });

  it('filters by classification and level', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);
    await screen.findByText('Showing 375 of 375');

    await user.selectOptions(screen.getByLabelText('Classification'), 'Undead');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 43 of 375');

    await user.type(screen.getByLabelText('Level from'), '10');
    const count = Number(/Showing (\d+) of/.exec(screen.getByRole('status').textContent ?? '')?.[1]);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(43);
  });

  it('opens the stat block of one monster', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);
    await screen.findByText('Showing 375 of 375');

    await user.type(screen.getByLabelText('Search'), 'Goblin Shaman');
    await user.click(screen.getByRole('button', { name: /Goblin Shaman/ }));

    const card = screen.getByRole('article', { name: 'Goblin Shaman' });
    expect(within(card).getByText(/Reputation \/ Weakness/)).toBeInTheDocument();
    expect(within(card).getByRole('table', { name: 'Stat block' })).toBeInTheDocument();
    expect(card).toHaveTextContent('Unique Skills');
    expect(card).toHaveTextContent('Loot');
  });
});

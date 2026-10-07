import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it } from 'vitest';
import '../../i18n';
import { MonstersReference } from './MonstersReference';

describe('MonstersReference', () => {
  it('lists the catalogue once it has loaded, and narrows it by name', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);

    expect(await screen.findByText('Showing 401 of 401')).toBeInTheDocument();

    await user.type(screen.getByLabelText('Search'), 'goblin');

    expect(screen.getByRole('status')).toHaveTextContent(/Showing \d+ of 401/);
    expect(screen.getByRole('button', { name: /Goblin\b/ })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /Wolf/ })).toBeNull();
  });

  it('filters by classification and level', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);
    await screen.findByText('Showing 401 of 401');

    await user.selectOptions(screen.getByLabelText('Classification'), 'Undead');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 43 of 401');

    await user.type(screen.getByLabelText('Level from'), '10');
    const count = Number(/Showing (\d+) of/.exec(screen.getByRole('status').textContent ?? '')?.[1]);
    expect(count).toBeGreaterThan(0);
    expect(count).toBeLessThan(43);
  });

  it('opens the stat block of one monster', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);
    await screen.findByText('Showing 401 of 401');

    await user.type(screen.getByLabelText('Search'), 'Goblin Shaman');
    await user.click(screen.getByRole('button', { name: /Goblin Shaman/ }));

    const card = screen.getByRole('article', { name: 'Goblin Shaman' });
    expect(within(card).getByText(/Reputation \/ Weakness/)).toBeInTheDocument();
    expect(within(card).getByRole('table', { name: 'Stat block' })).toBeInTheDocument();
    expect(card).toHaveTextContent('Unique Skills');
    expect(card).toHaveTextContent('Loot');
  });
  it('shows a golem with its material and Enhancing Items, and the common abilities of its classification', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);
    await screen.findByText('Showing 401 of 401');

    await user.selectOptions(screen.getByLabelText('Classification'), 'Golems');
    expect(screen.getByRole('status')).toHaveTextContent('Showing 16 of 401');
    expect(screen.getByText('Common abilities of Golems')).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Oak Golem/ }));
    const card = screen.getByRole('article', { name: 'Oak Golem' });
    expect(card).toHaveTextContent('Enchanted Oak Branch (50/100)');
    expect(within(card).getByRole('heading', { name: /Enhancing Items — at most 4/ })).toBeInTheDocument();
    expect(card).toHaveTextContent('Garnet of Vitality (Small) (200)');
  });

  it('offers the table for changing a Humanoid into another race', async () => {
    const user = userEvent.setup();
    render(<MonstersReference />);
    await screen.findByText('Showing 401 of 401');

    await user.selectOptions(screen.getByLabelText('Classification'), 'Humanoids');

    const table = screen.getByRole('table', { name: 'Modifying Humanoid monsters (other races)' });
    expect(within(table).getByRole('rowheader', { name: 'Dwarf' })).toBeInTheDocument();
    expect(table).toHaveTextContent('Fortitude +1, Willpower +1, Accuracy +1, Damage +1, Evasion -2, Defense +2');
  });
});

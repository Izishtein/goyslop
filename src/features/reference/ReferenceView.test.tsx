import { render, screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import { ReferenceView } from './ReferenceView';

afterEach(async () => {
  await i18n.changeLanguage('en');
});

function renderReference() {
  render(<ReferenceView onClose={() => {}} />);
}

/** The row whose row-header cell carries this name. */
function rowFor(name: string): HTMLElement {
  return screen.getByRole('rowheader', { name }).closest('tr') as HTMLElement;
}

describe('ReferenceView', () => {
  it('opens on the races catalog', () => {
    renderReference();

    expect(screen.getByRole('heading', { name: 'Races' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Classes' })).toBeNull();
  });

  it('switches to the classes catalog and back', async () => {
    const user = userEvent.setup();
    renderReference();

    await user.click(screen.getByRole('button', { name: 'Classes' }));
    expect(screen.getByRole('heading', { name: 'Classes' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Races' })).toBeNull();

    await user.click(screen.getByRole('button', { name: 'Races' }));
    expect(screen.getByRole('heading', { name: 'Races' })).toBeInTheDocument();
  });

  it('prints each correction die with the span it can actually roll', () => {
    renderReference();

    // A Dwarf rolls 2d6+6 for SPR, which can only land between 8 and 18.
    expect(rowFor('Dwarf')).toHaveTextContent('2d6+6');
    expect(rowFor('Dwarf')).toHaveTextContent('8–18');
  });

  it('names the classes a race cannot take, which the app never showed before', () => {
    renderReference();

    expect(rowFor('Tabbit')).toHaveTextContent('Priest');
    expect(rowFor('Human')).not.toHaveTextContent('Priest');
  });

  it('says why a race has no dice instead of leaving six cells blank', () => {
    renderReference();

    // Outlaw races are built with the Vagrant system; two more wait on a sourcebook.
    expect(rowFor('Alv')).toHaveTextContent(/Vagrant/);
    expect(rowFor('Newman')).toHaveTextContent(/sourcebook/);
  });

  it('lists racial abilities with the level that unlocks them', () => {
    renderReference();

    expect(rowFor('Human')).toHaveTextContent("[Sword's Grace/Change Fate]");
    expect(rowFor('Human')).toHaveTextContent('Lv6+');
  });

  it('prices a class level from the XP tables', async () => {
    const user = userEvent.setup();
    renderReference();
    await user.click(screen.getByRole('button', { name: 'Classes' }));

    // Major classes start at 1000 XP a level, Minor at 500.
    expect(rowFor('Fighter')).toHaveTextContent('1000');
    expect(rowFor('Scout')).toHaveTextContent('500');
  });

  it('shows the magic school only for the wizard group', async () => {
    const user = userEvent.setup();
    renderReference();
    await user.click(screen.getByRole('button', { name: 'Classes' }));

    expect(rowFor('Sorcerer')).toHaveTextContent('Truespeech Magic');
    expect(within(rowFor('Fighter')).queryByText(/Magic/)).toBeNull();
  });

  it('describes a class in the reader-s own language', async () => {
    const user = userEvent.setup();
    renderReference();
    await user.click(screen.getByRole('button', { name: 'Classes' }));
    const english = rowFor('Fighter').textContent;

    await i18n.changeLanguage('ru');

    const russian = rowFor('Fighter').textContent;
    expect(russian).not.toBe(english);
    expect(russian).toMatch(/[а-яё]/i);
  });
});

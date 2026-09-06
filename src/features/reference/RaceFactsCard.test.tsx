import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../../i18n';
import { getRace } from '../../data/races';
import { RaceFactsCard } from './RaceFactsCard';

function renderCard(raceId: string, backgroundName?: string) {
  const race = getRace(raceId)!;
  const background = backgroundName
    ? [...(race.backgroundTables?.primary ?? []), ...(race.backgroundTables?.additional ?? [])].find((entry) => entry.name === backgroundName)
    : undefined;
  render(<RaceFactsCard race={race} background={background} />);
}

describe('RaceFactsCard', () => {
  it('shows every correction die with the span it can roll', () => {
    // Today this lives only in a title= tooltip on the Correction input.
    renderCard('tabbit');
    const card = screen.getByRole('complementary');

    expect(card).toHaveTextContent('2d6+6');
    expect(card).toHaveTextContent('8–18');
    expect(card).toHaveTextContent('1d6');
  });

  it('names the classes the race cannot take', () => {
    renderCard('tabbit');

    expect(screen.getByRole('complementary')).toHaveTextContent('Priest');
  });

  it('says nothing about restrictions when there are none', () => {
    renderCard('human');

    expect(screen.getByRole('complementary')).not.toHaveTextContent('Cannot take');
  });

  it('lists racial abilities with the level that unlocks them', () => {
    renderCard('human');

    expect(screen.getByRole('complementary')).toHaveTextContent("[Sword's Grace/Change Fate] Lv6+");
  });

  it('adds the starting class and the stat split once a background is chosen', () => {
    renderCard('human', 'Mercenary');
    const card = screen.getByRole('complementary');

    // Human "Mercenary" is Fighter *or* Grappler, split 7 / 10 / 4.
    expect(card).toHaveTextContent('Fighter or Grappler');
    expect(card).toHaveTextContent('Skill 7');
    expect(card).toHaveTextContent('Mind 4');
  });

  it('does not repeat what the background select already says', () => {
    renderCard('human', 'Mercenary');
    const card = screen.getByRole('complementary');

    // The option label already reads "Mercenary (8, 2000 XP)".
    expect(card).not.toHaveTextContent('Mercenary');
    expect(card).not.toHaveTextContent('2000');
  });

  it('explains a race that has no dice instead of showing an empty row', () => {
    renderCard('alv');

    expect(screen.getByRole('complementary')).toHaveTextContent(/Vagrant/);
  });
});

import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import i18n from '../../i18n';
import en from '../../i18n/locales/en.json';
import ru from '../../i18n/locales/ru.json';
import { RACES } from '../../data/races';
import { RacesReference } from './RacesReference';

type Descriptions = { reference: { raceDescription: Record<string, string> } };

describe('race descriptions', () => {
  it('exist in both languages for every race, and for no race that is not in the catalogue', () => {
    const ids = RACES.map((race) => race.id).sort();
    for (const locale of [en, ru] as unknown as Descriptions[]) {
      expect(Object.keys(locale.reference.raceDescription).sort()).toEqual(ids);
      for (const text of Object.values(locale.reference.raceDescription)) expect(text.length).toBeGreaterThan(60);
    }
  });

  it('are in the races table of the reference, in the language in use', async () => {
    await i18n.changeLanguage('en');
    render(<RacesReference />);
    const row = screen.getByRole('row', { name: /^Human/ });
    expect(within(row).getByText(/most numerous Humanoid race/)).toBeInTheDocument();
    await i18n.changeLanguage('ru');
    expect(within(screen.getByRole('row', { name: /^Human/ })).getByText(/Самая многочисленная раса/)).toBeInTheDocument();
    await i18n.changeLanguage('en');
  });
});

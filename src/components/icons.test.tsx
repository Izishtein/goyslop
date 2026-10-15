import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import '../i18n';
import { GAME_ICONS, ICON_PATHS } from '../data/game-icons.generated';
import { IconCredits } from './IconCredits';
import { catalogIconKey, gameIconAuthors } from './icon-info';
import { CatalogIcon, GameIcon } from './icons';

describe('game icons', () => {
  it('has path data for every icon the app names', () => {
    for (const [name, source] of Object.entries(GAME_ICONS)) {
      expect(ICON_PATHS[source], `${name} -> ${source}`).toMatch(/^M/);
    }
  });

  it('keeps no icon that nothing names', () => {
    const used = new Set<string>(Object.values(GAME_ICONS));
    expect(Object.keys(ICON_PATHS).filter((source) => !used.has(source))).toEqual([]);
  });

  it('draws decoration only: hidden from assistive technology, in the colour of the text', () => {
    const { container } = render(<GameIcon name="tab.combat" />);
    const svg = container.querySelector('svg');
    expect(svg).toHaveAttribute('aria-hidden', 'true');
    expect(svg).toHaveAttribute('fill', 'currentColor');
    expect(svg?.querySelector('path')?.getAttribute('d')).toBe(ICON_PATHS['lorc/crossed-swords']);
  });
});

describe('IconCredits', () => {
  it('credits the authors of the icons in use, the CC0 one marked, and both sources', () => {
    render(<IconCredits />);
    const footer = screen.getByRole('contentinfo');
    for (const author of gameIconAuthors()) expect(footer).toHaveTextContent(author.name);
    expect(footer).toHaveTextContent('Zeromancer (CC0)');
    expect(screen.getByRole('link', { name: 'Lucide' })).toHaveAttribute('href', 'https://lucide.dev');
    expect(screen.getByRole('link', { name: 'CC BY 3.0' })).toBeInTheDocument();
  });

  it('names every folder the spec draws from in the author table', () => {
    for (const author of gameIconAuthors()) expect(author.name).not.toMatch(/[a-z]-[a-z]/); // a raw folder name would mean a missing entry
  });
});

describe('catalogue icons', () => {
  it('has an icon for every race, class, weapon category, magic school and monster category', async () => {
    const { RACES } = await import('../data/races');
    const { CLASSES } = await import('../data/classes');
    const { WEAPON_CATEGORIES } = await import('../data/equipment');
    const { CATALOGUED_SCHOOLS } = await import('../data/spells');
    const en = (await import('../i18n/locales/en.json')).default as { reference: { monsters: { categories: Record<string, string> } } };
    const missing = [
      ...RACES.map((race) => ['race', race.id] as const),
      ...CLASSES.map((entry) => ['class', entry.id] as const),
      ...WEAPON_CATEGORIES.map((id) => ['weapon', id] as const),
      ...CATALOGUED_SCHOOLS.map((name) => ['school', name] as const),
      ...Object.keys(en.reference.monsters.categories).map((id) => ['monster', id] as const),
    ].filter(([kind, id]) => catalogIconKey(kind, id) === undefined);
    expect(missing).toEqual([]);
  });

  it('answers nothing for an entry it has no icon for', () => {
    expect(catalogIconKey('race', 'not-a-race')).toBeUndefined();
    const { container } = render(<CatalogIcon kind="race" id="not-a-race" />);
    expect(container).toBeEmptyDOMElement();
  });
});

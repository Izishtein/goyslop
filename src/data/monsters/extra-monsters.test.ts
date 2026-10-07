import { describe, expect, it } from 'vitest';
import extra from './extra-monsters.json';
import monsters from './monsters.json';
import { ALL_MONSTER_CATEGORIES, COMMON_ABILITIES, HUMANOID_RACES, loadMonsters, type Monster } from './index';

const cards = extra as unknown as Monster[];
const golems = cards.filter((m) => m.category === 'Golems');
const familiars = cards.filter((m) => m.category === 'Familiars');

describe('golem and familiar cards (Monstrous Lore pp. 227-238)', () => {
  it('holds 16 golems and 10 familiars, with ids that do not clash with the main catalogue', () => {
    expect(golems).toHaveLength(16);
    expect(familiars).toHaveLength(10);
    const ids = new Set((monsters as unknown as Monster[]).map((m) => m.id));
    for (const card of cards) expect(ids.has(card.id), card.id).toBe(false);
    expect(new Set(cards.map((m) => m.id)).size).toBe(cards.length);
  });

  it('joins the main catalogue under classifications the reference can filter by', async () => {
    const all = await loadMonsters();
    expect(all).toHaveLength((monsters as unknown[]).length + cards.length);
    for (const card of cards) expect(ALL_MONSTER_CATEGORIES).toContain(card.category);
  });

  it('gives every golem the printed stat block, material and enhancing items', () => {
    for (const golem of golems) {
      expect(golem.material, golem.name).toMatch(/^Enchanted /);
      expect(golem.sections.length, golem.name).toBeGreaterThan(0);
      for (const section of golem.sections) expect(typeof section.hp, `${golem.name} ${section.style}`).toBe('number');
      expect(golem.enhancements?.max, golem.name).toBeGreaterThan(0);
      expect(golem.enhancements?.entries.length, golem.name).toBeGreaterThan(0);
      expect(golem.loot.length, golem.name).toBeGreaterThan(0);
      expect(golem.initiative, golem.name).toBeTruthy();
    }
  });

  it('reads a few cards exactly as printed', () => {
    const oak = golems.find((m) => m.id === 'oak-golem')!;
    expect(oak).toMatchObject({ level: 2, reputation: 8, weakness: 12, weakPoint: 'Fire Damage +3 points', initiative: '9' });
    expect(oak.sections[0]).toMatchObject({ style: 'Smash', damage: '2d', defense: 2, hp: 18 });
    expect(oak.enhancements?.max).toBe(4);
    const dragon = golems.find((m) => m.id === 'platinum-dragon')!;
    expect(dragon.sections.map((s) => s.hp)).toEqual([100, 65, 65]);
    expect(dragon.mainSection).toBe('None');
    expect(golems.filter((m) => m.id === 'straw-bird')).toHaveLength(1);
  });

  it('keeps Fixed Value = Standard Value + 7 on every golem', () => {
    for (const golem of golems) {
      for (const value of [golem.fortitude, golem.willpower]) {
        const pair = value as { value: number; fixed: number | null };
        expect(pair.fixed, golem.name).toBe(pair.value + 7);
      }
    }
  });

  it('has no HP on a familiar — its Master takes the damage — but MP', () => {
    for (const familiar of familiars) {
      expect(familiar.sections[0].hp, familiar.name).toBeNull();
      expect(typeof familiar.sections[0].mp, familiar.name).toBe('number');
      expect(familiar.initiative, familiar.name).toBeTruthy();
    }
    expect(familiars.find((m) => m.id === 'familiar-ii-spider')?.initiative).toBe('16');
    // The common data of Familiars II (p. 238) must not have leaked into the last Familiar card.
    expect(familiars.find((m) => m.id === 'familiar-snake')?.skills.map((s) => s.name)).toEqual(["Snake's Body", 'Toxic Tooth']);
  });
});

describe('common abilities and race modifications', () => {
  it('has common abilities for the classifications whose cards leave them out', () => {
    for (const category of ['Undead', 'Constructs', 'Magitech', 'Fairies', 'Golems', 'Familiars']) {
      expect(COMMON_ABILITIES[category]?.length, category).toBeGreaterThan(0);
    }
  });

  it('lists the twelve races of the Humanoid table, Human first and unchanged', () => {
    expect(HUMANOID_RACES.map((r) => r.id)).toEqual(['human', 'elf', 'dwarf', 'tabbit', 'runefolk', 'nightmare', 'lykant', 'lildraken', 'grassrunner', 'meria', 'tiens', 'leprechaun']);
    expect(HUMANOID_RACES[0].modification).toBe('None');
  });
});

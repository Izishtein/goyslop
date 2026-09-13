import { describe, expect, it } from 'vitest';
import { getRace, racialAbilitiesFor, RACES } from './races';

const RARE_SPECIES_CATEGORIES: [string, string][] = [
  ['snow-elf', 'mist-elf'],
  ['pico-tabbit', 'lupus-tabbit'],
  ['guardian-runefolk', 'combat-runefolk'],
  ['shadowborn-nightmare', 'soleilborn-nightmare'],
  ['large-herbivore-lykant', 'small-herbivore-lykant'],
  ['small-winged-lildraken', 'hairy-lildraken'],
  ['alisha-grassrunner', 'crimenos-grassrunner'],
  ['carnivorous-meria', 'fungi-meria'],
  ['tech-tiens', 'daemonic-tiens'],
  ['leprechaun-nomad', 'leprechaun-explorer'],
];

describe('races catalog', () => {
  it('parses plain dice notation', () => {
    expect(getRace('human')?.abilityDice?.DEX).toEqual({ count: 2, bonus: 0 });
  });

  it('parses dice notation with a flat bonus', () => {
    expect(getRace('dwarf')?.abilityDice?.SPR).toEqual({ count: 2, bonus: 6 });
  });

  it('keeps usesVagrantSystem on republished Outlaw Profile Book races even though they now also have real dice', () => {
    // Arcane Relic pp. 26-33 gives Alv/Shadow/Soleil/Weakling standard PC correction dice
    // and background tables; the OPB Vagrant path stays valid alongside it, not replaced.
    const alv = getRace('alv');
    expect(alv?.abilityDice).not.toBeNull();
    expect(alv?.backgroundTables).not.toBeNull();
    expect(alv?.usesVagrantSystem).toBe(true);
  });

  it('has 41 races with unique ids', () => {
    expect(RACES).toHaveLength(41);
    expect(new Set(RACES.map((race) => race.id)).size).toBe(41);
  });

  it('races with ability dice also have background tables, and vice versa', () => {
    for (const race of RACES) {
      expect(Boolean(race.abilityDice)).toBe(Boolean(race.backgroundTables));
    }
  });

  it('every primary background stats triple sums to a plausible starting total', () => {
    for (const race of RACES) {
      for (const entry of race.backgroundTables?.primary ?? []) {
        if (!entry.stats) continue;
        const sum = entry.stats[0] + entry.stats[1] + entry.stats[2];
        expect(sum).toBeGreaterThanOrEqual(18);
        expect(sum).toBeLessThanOrEqual(32);
      }
    }
  });

  it('Human background table includes the GM-permission-only Adventurer row with no fixed stats', () => {
    const human = getRace('human');
    const adventurer = human?.backgroundTables?.primary.find((entry) => entry.name === 'Adventurer');
    expect(adventurer?.stats).toBeNull();
    expect(adventurer?.startingClasses).toBeNull();
  });

  it('Tabbit is restricted from Priest, matching its background tables never granting it', () => {
    const tabbit = getRace('tabbit');
    expect(tabbit?.restrictedClasses).toContain('priest');
    const allEntries = [...(tabbit?.backgroundTables?.primary ?? []), ...(tabbit?.backgroundTables?.additional ?? [])];
    const grantsPriest = allEntries.some((entry) => entry.startingClasses?.classIds.includes('priest'));
    expect(grantsPriest).toBe(false);
  });

  it('Fluorite is restricted from Enhancer, matching its background tables never granting it', () => {
    const fluorite = getRace('fluorite');
    expect(fluorite?.restrictedClasses).toContain('enhancer');
    const allEntries = [...(fluorite?.backgroundTables?.primary ?? []), ...(fluorite?.backgroundTables?.additional ?? [])];
    const grantsEnhancer = allEntries.some((entry) => entry.startingClasses?.classIds.includes('enhancer'));
    expect(grantsEnhancer).toBe(false);
  });

  it('unblocks the six races that previously had no correction dice at all (Arcane Relic pp. 16-33)', () => {
    for (const id of ['alv', 'shadow', 'soleil', 'weakling', 'abyssborn', 'newman']) {
      const race = getRace(id);
      expect(race?.abilityDice, `${id} should have dice`).not.toBeNull();
      expect(race?.backgroundTables, `${id} should have background tables`).not.toBeNull();
    }
  });

  it('adds the three races first published in Arcane Relic', () => {
    for (const id of ['spriggan', 'fluorite', 'dark-dwarf']) {
      const race = getRace(id);
      expect(race?.abilityDice, `${id} should have dice`).not.toBeNull();
      expect(race?.backgroundTables, `${id} should have background tables`).not.toBeNull();
      expect(race?.sourceBook).toBe('Arcane Relic');
    }
  });

  it('parses dice notation with a negative flat bonus (Rare Tabbit Species post-roll adjustments)', () => {
    expect(getRace('pico-tabbit')?.abilityDice?.STR).toEqual({ count: 1, bonus: -3 });
    expect(getRace('lupus-tabbit')?.abilityDice?.SPR).toEqual({ count: 2, bonus: -3 });
  });

  it('adds the 20 rare species subspecies (Arcane Relic pp. 34-53), two per parent race', () => {
    for (const [a, b] of RARE_SPECIES_CATEGORIES) {
      for (const id of [a, b]) {
        const race = getRace(id);
        expect(race?.abilityDice, `${id} should have dice`).not.toBeNull();
        expect(race?.backgroundTables, `${id} should have a background table`).not.toBeNull();
        expect(race?.backgroundTables?.additional, `${id} should have no additional table`).toBeUndefined();
        expect(race?.sourceBook).toBe('Arcane Relic');
      }
    }
    expect(RARE_SPECIES_CATEGORIES).toHaveLength(10);
  });

  it('each rare species pair shares one background table with its sibling', () => {
    for (const [a, b] of RARE_SPECIES_CATEGORIES) {
      const raceA = getRace(a);
      const raceB = getRace(b);
      expect(raceA?.backgroundTables?.primary, `${a}/${b}`).toEqual(raceB?.backgroundTables?.primary);
    }
  });

  it('each rare species pair shares one A-F die block, except the two Tabbit variants which each layer their own flat correction on top', () => {
    for (const [a, b] of RARE_SPECIES_CATEGORIES) {
      if (a === 'pico-tabbit') continue;
      expect(getRace(a)?.abilityDice, `${a}/${b}`).toEqual(getRace(b)?.abilityDice);
    }
    expect(getRace('pico-tabbit')?.abilityDice).not.toEqual(getRace('lupus-tabbit')?.abilityDice);
  });

  it('rare species dice mostly match their parent race, with two book-printed exceptions (Tiens Spirit, Leprechaun Vitality)', () => {
    const parentByRareId: Record<string, string> = {
      'snow-elf': 'elf',
      'guardian-runefolk': 'runefolk',
      'shadowborn-nightmare': 'nightmare',
      'large-herbivore-lykant': 'lykant',
      'small-winged-lildraken': 'lildraken',
      'alisha-grassrunner': 'grassrunner',
      'carnivorous-meria': 'meria',
    };
    for (const [rareId, parentId] of Object.entries(parentByRareId)) {
      expect(getRace(rareId)?.abilityDice, rareId).toEqual(getRace(parentId)?.abilityDice);
    }
    // Arcane Relic p. 50/52 prints these two stats one step lower than the Tiens/Leprechaun
    // entries already in the catalog (Core Rulebook III) — book value kept as printed, per
    // the project's "book wins on conflict" rule, not silently matched to the parent.
    expect(getRace('tech-tiens')?.abilityDice?.SPR).toEqual({ count: 2, bonus: 3 });
    expect(getRace('tiens')?.abilityDice?.SPR).toEqual({ count: 2, bonus: 6 });
    expect(getRace('leprechaun-nomad')?.abilityDice?.VIT).toEqual({ count: 1, bonus: 0 });
    expect(getRace('leprechaun')?.abilityDice?.VIT).toEqual({ count: 2, bonus: 0 });
  });

  it('Pico and Lupus Tabbit inherit the Priest restriction, matching their shared table never granting it', () => {
    for (const id of ['pico-tabbit', 'lupus-tabbit']) {
      const race = getRace(id);
      expect(race?.restrictedClasses).toContain('priest');
      const grantsPriest = (race?.backgroundTables?.primary ?? []).some((entry) => entry.startingClasses?.classIds.includes('priest'));
      expect(grantsPriest).toBe(false);
    }
  });

  it('Guardian and Combat Type Runefolk inherit the Priest restriction, matching their shared table never granting it', () => {
    for (const id of ['guardian-runefolk', 'combat-runefolk']) {
      const race = getRace(id);
      expect(race?.restrictedClasses).toContain('priest');
      const grantsPriest = (race?.backgroundTables?.primary ?? []).some((entry) => entry.startingClasses?.classIds.includes('priest'));
      expect(grantsPriest).toBe(false);
    }
  });

  it('each rare species replaces its named parent ability rather than keeping it alongside the new one', () => {
    const replacedAwayFrom: [string, string][] = [
      ['snow-elf', "Sword's Grace/Gentle Water"],
      ['mist-elf', "Sword's Grace/Gentle Water"],
      ['guardian-runefolk', 'HP Conversion'],
      ['combat-runefolk', 'HP Conversion'],
      ['large-herbivore-lykant', 'Beast Form'],
      ['small-herbivore-lykant', 'Beast Form'],
      ['small-winged-lildraken', "Sword's Grace/Wings of the Wind"],
      ['hairy-lildraken', 'Tail Whip'],
      ['hairy-lildraken', 'Scaly Hide'],
      ['carnivorous-meria', 'Thriving Life'],
      ['fungi-meria', 'Thriving Life'],
      ['tech-tiens', 'Intercommunication'],
      ['daemonic-tiens', 'Intercommunication'],
      ['leprechaun-nomad', 'Unseen Artisan'],
      ['leprechaun-explorer', 'Unseen Artisan'],
    ];
    for (const [id, oldName] of replacedAwayFrom) {
      const names = racialAbilitiesFor(id).map((a) => a.name);
      expect(names, `${id} should no longer list [${oldName}]`).not.toContain(oldName);
    }
  });

  describe('Battle Mastery supplemental background tables (pp. 13-14)', () => {
    // Every race that existed by Battle Mastery's release gets a third table opening access
    // to Warlock/Geomancer/Alchemist/Battle Dancer/Rider/Tactician/Druid. The four Outlaw
    // Profile Book races (Alv/Weakling/Shadow/Soleil) get a shorter 3-row version — only
    // Geomancer/Battle Dancer/Tactician — per the book's own note pointing to OPB for them.
    const FULL_TABLE_RACES = [
      'human',
      'elf',
      'dwarf',
      'tabbit',
      'runefolk',
      'nightmare',
      'lykant',
      'lildraken',
      'grassrunner',
      'meria',
      'tiens',
      'leprechaun',
    ];
    const SHORT_TABLE_RACES = ['alv', 'weakling', 'shadow', 'soleil'];

    it('gives each Core-era race five or more rows (Human alone gets all seven), and each OPB race the shorter three', () => {
      // Human is the only race whose table covers all seven classes; the other eleven each
      // cover five of them (which five varies by race — see the comments in races.ts).
      expect(getRace('human')?.backgroundTables?.supplemental).toHaveLength(7);
      for (const id of FULL_TABLE_RACES.filter((r) => r !== 'human')) {
        expect(getRace(id)?.backgroundTables?.supplemental, id).toHaveLength(5);
      }
      for (const id of SHORT_TABLE_RACES) {
        expect(getRace(id)?.backgroundTables?.supplemental, id).toHaveLength(3);
      }
    });

    it('never touches a race published after Battle Mastery (no supplemental table at all)', () => {
      for (const id of ['abyssborn', 'newman', 'spriggan', 'fluorite', 'dark-dwarf', 'snow-elf', 'pico-tabbit']) {
        expect(getRace(id)?.backgroundTables?.supplemental, id).toBeUndefined();
      }
    });

    it("sums every row's Skill+Body+Mind to the same total within a race's own table", () => {
      // A real internal-consistency check, not a tautology: it is what caught Tiens printing
      // "2-4" a second time for what has to be its "10-12" row (see the comment in races.ts) —
      // every other row of that same table sums to 28, and only the corrected range fits.
      for (const id of [...FULL_TABLE_RACES, ...SHORT_TABLE_RACES]) {
        const rows = getRace(id)?.backgroundTables?.supplemental ?? [];
        const sums = rows.map((row) => (row.stats ? row.stats[0] + row.stats[1] + row.stats[2] : null));
        expect(new Set(sums).size, `${id}: ${JSON.stringify(sums)}`).toBe(1);
      }
    });

    it('covers the full 2-12 roll range exactly once per race, with no gaps or overlaps', () => {
      for (const id of [...FULL_TABLE_RACES, ...SHORT_TABLE_RACES]) {
        const covered = new Set<number>();
        for (const row of getRace(id)?.backgroundTables?.supplemental ?? []) {
          const [lo, hi] = row.rollRange.includes('-') ? row.rollRange.split('-').map(Number) : [Number(row.rollRange), Number(row.rollRange)];
          for (let n = lo; n <= hi; n++) covered.add(n);
        }
        expect([...covered].sort((a, b) => a - b), id).toEqual([2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
      }
    });
  });
});

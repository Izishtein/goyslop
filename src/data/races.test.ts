import { describe, expect, it } from 'vitest';
import { getRace, RACES } from './races';

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

  it('has 21 races with unique ids', () => {
    expect(RACES).toHaveLength(21);
    expect(new Set(RACES.map((race) => race.id)).size).toBe(21);
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
});

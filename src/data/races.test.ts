import { describe, expect, it } from 'vitest';
import { getRace, RACES } from './races';

describe('races catalog', () => {
  it('parses plain dice notation', () => {
    expect(getRace('human')?.abilityDice?.DEX).toEqual({ count: 2, bonus: 0 });
  });

  it('parses dice notation with a flat bonus', () => {
    expect(getRace('dwarf')?.abilityDice?.SPR).toEqual({ count: 2, bonus: 6 });
  });

  it('leaves abilityDice null for Vagrant-system races', () => {
    const alv = getRace('alv');
    expect(alv?.abilityDice).toBeNull();
    expect(alv?.usesVagrantSystem).toBe(true);
  });

  it('has 18 races with unique ids', () => {
    expect(RACES).toHaveLength(18);
    expect(new Set(RACES.map((race) => race.id)).size).toBe(18);
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
});

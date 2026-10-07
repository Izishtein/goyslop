import { describe, expect, it } from 'vitest';
import raw from './monsters.json';
import { formatValue, MONSTER_CATEGORIES, type Monster } from './index';

const monsters = raw as unknown as Monster[];

describe('monster catalogue', () => {
  it('holds every card of Monstrous Lore pp. 73-224', () => {
    expect(monsters).toHaveLength(375);
  });

  it('counts each classification', () => {
    const counts = Object.fromEntries(MONSTER_CATEGORIES.map((category) => [category, monsters.filter((m) => m.category === category).length]));
    expect(counts).toEqual({
      Barbarous: 86,
      Animals: 47,
      Plants: 19,
      Undead: 43,
      Constructs: 27,
      Magitech: 31,
      'Mythical Beasts': 28,
      Fairies: 35,
      Daemons: 39,
      Humanoids: 20,
    });
  });

  it('gives every monster a unique id and a classification', () => {
    expect(new Set(monsters.map((m) => m.id)).size).toBe(monsters.length);
    for (const monster of monsters) expect(MONSTER_CATEGORIES, monster.name).toContain(monster.category);
  });

  it('prints every card with the fields the sheet is read from', () => {
    for (const m of monsters) {
      for (const key of ['intelligence', 'perception', 'disposition', 'language', 'habitat', 'initiative', 'movement', 'weakPoint'] as const) {
        expect(m[key], `${m.name} ${key}`).toBeTruthy();
      }
      expect(m.sections.length, `${m.name} sections`).toBeGreaterThan(0);
      for (const section of m.sections) {
        expect(section.style, m.name).toBeTruthy();
        expect(section.hp, `${m.name} ${section.style} HP`).not.toBeNull();
      }
    }
  });

  // Fixed Values are the Standard Value + 7 everywhere in the book. A few cards print something
  // else; they are kept as printed (the book wins) and listed here so a parse slip cannot hide
  // among them.
  it('keeps Fixed Value = Standard Value + 7, apart from the cards where the book itself differs', () => {
    const off: string[] = [];
    for (const m of monsters) {
      const check = (label: string, pair: unknown) => {
        if (typeof pair === 'object' && pair !== null && 'value' in pair) {
          const { value, fixed } = pair as { value: number; fixed: number | null };
          if (fixed !== null && fixed !== value + 7) off.push(`${m.name} ${label}`);
        }
      };
      check('Fortitude', m.fortitude);
      check('Willpower', m.willpower);
      for (const s of m.sections) {
        check(`${s.style} Accuracy`, s.accuracy);
        check(`${s.style} Evasion`, s.evasion);
      }
    }
    expect(off.sort()).toEqual([
      'Carnage Table Fortitude',
      'Carnage Table Willpower',
      'Crash Bear Fortitude',
      'Diablo Captain (Daemon Form) Bite (Head) Evasion',
      'Varg Bite Accuracy',
    ]);
  });

  it('reads loot rolls and skills into structure', () => {
    const goblin = monsters.find((m) => m.id === 'goblin')!;
    expect(goblin.loot.map((row) => row.roll)).toEqual(['2–3', '4–9', '10+']);
    const drake = monsters.find((m) => m.name === 'Drake (Dragon Form)')!;
    expect(drake.sections.map((s) => s.style)).toEqual(['Bite (Body)', 'Wing (Wing)', 'Wing (Wing)']);
    expect(drake.skills.some((s) => s.name === 'Instant Humanification' && s.section === 'Body')).toBe(true);
  });

  it('formats a Standard Value with its Fixed Value', () => {
    expect(formatValue({ value: 3, fixed: 10 })).toBe('3 (10)');
    expect(formatValue(null)).toBe('–');
    expect(formatValue({ raw: '※+2' })).toBe('※+2');
  });
});

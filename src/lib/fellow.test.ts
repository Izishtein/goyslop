import { describe, expect, it } from 'vitest';
import { EMPTY_FELLOW, EMPTY_INVENTORY, type Character, type FellowAction } from '../types/character';
import { bestDamageSpell, fellowActionFor, fellowAttack, fellowHeal, fellowValue, mpCostOf, parseFellowRoll, roundPower, suggestFellowActions, type SuggestedWording } from './fellow';

const action = (patch: Partial<FellowAction>): FellowAction => ({ id: 'a', roll: '1-2', name: 'x', ...patch });

describe('Fellow Action Table', () => {
  it('reads the faces a row answers to', () => {
    expect(parseFellowRoll('1-2')).toEqual([1, 2]);
    expect(parseFellowRoll('3 – 4')).toEqual([3, 4]);
    expect(parseFellowRoll('5')).toEqual([5]);
    expect(parseFellowRoll('1, 2')).toEqual([1, 2]);
    expect(parseFellowRoll('soon')).toEqual([]);
  });

  // The book's own Wolfe table (CR I p. 200): 1-2 attack, 3-4 observation, 5 [Power Strike], 6 movement.
  const wolfe: FellowAction[] = [
    action({ id: '1', roll: '1-2', name: 'Attack with Sword', value: '12', effect: 'Power 25/Crit Value 10 + 4' }),
    action({ id: '2', roll: '3-4', name: 'Scout Observation Check', value: '11' }),
    action({ id: '3', roll: '5', name: '[Power Strike]', value: '14', effect: 'Power 25/Crit Value 10 + 8, spend next turn recovering' }),
    action({ id: '4', roll: '6', name: 'Scout Movement Check', value: '13' }),
  ];

  it('finds the row a d6 lands on', () => {
    expect(fellowActionFor(wolfe, 2)?.name).toBe('Attack with Sword');
    expect(fellowActionFor(wolfe, 3)?.name).toBe('Scout Observation Check');
    expect(fellowActionFor(wolfe, 5)?.name).toBe('[Power Strike]');
    expect(fellowActionFor(wolfe, 6)?.name).toBe('Scout Movement Check');
    expect(fellowActionFor([wolfe[0]], 6)).toBeNull();
  });

  it('reads the check value', () => {
    expect(fellowValue(wolfe[0])).toBe(12);
    expect(fellowValue(action({ value: '' }))).toBeNull();
  });

  it('reads a weapon attack, a spell, and refuses a check', () => {
    expect(fellowAttack(wolfe[0])).toEqual({ power: 25, criticalValue: 10, extraDamage: 4, magic: false });
    expect(fellowAttack(wolfe[2])).toEqual({ power: 25, criticalValue: 10, extraDamage: 8, magic: false });
    expect(fellowAttack(action({ effect: 'Power 10+5' }))).toEqual({ power: 10, criticalValue: 10, extraDamage: 5, magic: true });
    expect(fellowAttack(wolfe[1])).toBeNull();
  });

  it('rounds Power the way the book does', () => {
    expect([10, 11, 12, 13, 17, 18, 19].map(roundPower)).toEqual([10, 10, 10, 15, 15, 20, 20]);
  });
});

const words: SuggestedWording = {
  weapon: 'weapon',
  attack: (weapon) => `Attack with ${weapon} (Melee Attack)`,
  spell: (spell, mp) => `Cast [${spell}], MP${mp}`,
  rangedAttack: (weapon, range) => `Shoot ${weapon} (Ranged Attack), range ${range}`,
  attackWithFeat: (weapon, feat) => `Attack with ${weapon} and [${feat}]`,
  observation: 'Search check',
  scoutObservation: 'Scout Observation Check',
  movement: 'Agility check',
  scoutMovement: 'Scout Movement Check',
  dialogue: { attack: 'a', feat: 'f', observation: 'o', movement: 'm', spell: 's' },
};

function sheet(patch: Partial<Character>): Character {
  const score = (base: number) => ({ base, correction: 0, growth: 0, itemBonus: 0 });
  return {
    abilities: { DEX: score(12), AGI: score(12), STR: score(12), VIT: score(12), INT: score(12), SPR: score(12) },
    classes: [{ classId: 'fighter', level: 3 }],
    statusEffects: [],
    combatFeats: [],
    equipment: { weapons: [], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
    fellow: EMPTY_FELLOW,
    spells: [],
    ...patch,
  } as unknown as Character;
}

const sword = { id: 'w', name: 'Sword', stance: '1H' as const, minStr: 10, accuracyBonus: 1, power: 28, criticalValue: 10, extraDamageBonus: 1, rank: 'B' as const, abyss: [] };

describe('suggested table', () => {
  let n = 0;
  const id = () => `id${(n += 1)}`;

  it('builds the four rows with Result + Standard Value as the Value', () => {
    // Fighter 3, DEX 12 (+2), STR 12 (+2), INT 12 (+2), AGI 12 (+2): Accuracy 3+2+1 = 6, Extra 3+2+1 = 6.
    const rows = suggestFellowActions(sheet({ equipment: { weapons: [sword], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY } }), words, id);

    expect(rows.map((row) => row.roll)).toEqual(['1-2', '3-4', '5', '6']);
    expect(rows[0]).toMatchObject({ name: 'Attack with Sword (Melee Attack)', value: '13', effect: 'Power 30/Crit Value 10 + 6' });
    expect(rows[1]).toMatchObject({ name: 'Search check', value: '13' }); // 8 + level 3 + INT 2
    expect(rows[2]).toMatchObject({ value: '15' }); // the same attack again, Result 9
    expect(rows[3]).toMatchObject({ name: 'Agility check', value: '15' }); // 10 + level 3 + AGI 2
  });

  it('puts [Power Strike I] into the fifth row as +4 damage', () => {
    const rows = suggestFellowActions(
      sheet({
        equipment: { weapons: [sword], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
        combatFeats: [{ id: 'f', name: 'Power Strike I', category: 'declaration' }],
      }),
      words,
      id,
    );

    expect(rows[2]).toMatchObject({ name: 'Attack with Sword and [Power Strike I]', effect: 'Power 30/Crit Value 10 + 10' });
  });

  it('lets a Scout answer with the Scout packages', () => {
    const rows = suggestFellowActions(sheet({ classes: [{ classId: 'scout', level: 2 }] }), words, id);

    expect(rows.map((row) => row.name)).toEqual(['Scout Observation Check', 'Scout Movement Check']);
    expect(rows[0].value).toBe('12'); // 8 + Scout 2 + INT 2
  });

  it('lowers the Critical Value for a Fencer, never below 8', () => {
    const rows = suggestFellowActions(
      sheet({ classes: [{ classId: 'fencer', level: 3 }], equipment: { weapons: [{ ...sword, criticalValue: 8 }], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY } }),
      words,
      id,
    );

    expect(rows[0].effect).toContain('Crit Value 8');
  });
});

const known = (id: string, name: string, mp: number, school = 'Truespeech Magic') => ({ id, name, school, circle: 1, mp });
const sorcerer = (spells: ReturnType<typeof known>[]) => sheet({ classes: [{ classId: 'sorcerer', level: 3 }], spells });

describe('Fellow spells', () => {
  let n = 0;
  const id = () => `s${(n += 1)}`;

  it('reads the MP cost from the action name and tells a healing row from an attack', () => {
    expect(mpCostOf(action({ name: '[Energy Bolt] Range 2 (30m), MP5' }))).toBe(5);
    expect(mpCostOf(action({ name: 'Attack with Sword' }))).toBe(0);
    expect(fellowHeal(action({ effect: 'Heal Power 20+5' }))).toEqual({ power: 20, bonus: 5 });
    expect(fellowAttack(action({ effect: 'Heal Power 20+5' }))).toBeNull();
    expect(fellowHeal(action({ effect: 'Power 10+5' }))).toBeNull();
  });

  it('picks the strongest damage spell the Fellow can pay for, never a heal', () => {
    const spells = [known('energy-bolt', 'Energy Bolt', 5), known('cure-wounds', 'Cure Wounds', 3, 'Spiritualism Magic'), known('lightning', 'Lightning', 7), known('blast', 'Blast', 99)];
    const best = bestDamageSpell(sorcerer(spells));
    // Sorcerer 3 + INT 2 = Magic Power 5; Lightning (Power 20, MP 7) beats Energy Bolt; Blast costs more than the whole pool.
    expect(best).toEqual({ name: 'Lightning', mp: 7, power: 20, magicPower: 5 });
    expect(bestDamageSpell(sorcerer([known('cure-wounds', 'Cure Wounds', 3)]))).toBeNull();
  });

  it('puts the spell into the table: Value = Result + Magic Power, Effect "Power N+Magic Power"', () => {
    const rows = suggestFellowActions(sorcerer([known('energy-bolt', 'Energy Bolt', 5)]), words, id);

    expect(rows.map((row) => row.roll)).toEqual(['1-2', '3-4', '5', '6']);
    expect(rows[0]).toMatchObject({ name: 'Cast [Energy Bolt], MP5', value: '12', effect: 'Power 10+5' });
    expect(rows[2]).toMatchObject({ name: 'Cast [Energy Bolt], MP5', value: '14' });
  });

  it('keeps the weapon first and gives the fifth row to a spell that out-powers it', () => {
    const rows = suggestFellowActions(
      sheet({
        classes: [{ classId: 'fighter', level: 3 }, { classId: 'sorcerer', level: 3 }],
        equipment: { weapons: [{ ...sword, power: 5 }], armor: [], shield: null, accessories: [], inventory: EMPTY_INVENTORY },
        spells: [known('energy-bolt', 'Energy Bolt', 5)],
      }),
      words,
      id,
    );

    expect(rows[0].name).toBe('Attack with Sword (Melee Attack)');
    expect(rows[2].name).toBe('Cast [Energy Bolt], MP5');
  });
});

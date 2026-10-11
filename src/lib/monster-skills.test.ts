import { describe, expect, it } from 'vitest';
import extra from '../data/monsters/extra-monsters.json';
import raw from '../data/monsters/monsters.json';
import type { Monster } from '../data/monsters';
import { damageSection, type EvasionRoll } from './encounter';
import { areaAttacksOf, chargeOf, damageTraitsOf, isBludgeoningCategory, poisonRiderOf, resolvePoison, rollChargeAttack, traitAdjustment } from './monster-skills';

const all = [...(raw as unknown as Monster[]), ...(extra as unknown as Monster[])];
const monster = (id: string): Monster => {
  const found = all.find((entry) => entry.id === id);
  if (!found) throw new Error(`no monster ${id}`);
  return found;
};

const dice = (...faces: number[]) => {
  let index = 0;
  return () => (faces[index++] - 1 + 0.5) / 6;
};

describe('areaAttacksOf', () => {
  it('reads [Cleave I] as 3 targets at -3 damage', () => {
    expect(areaAttacksOf(monster('minotaur'))).toEqual([{ name: 'Cleave I', max: 3, damage: -3, sectionIndex: 0, restriction: null }]);
  });

  it('reads [Cleave II] as 5 targets with no reduction, from the named section', () => {
    const captain = monster('diablo-captain-daemon-form');
    const [cleave] = areaAttacksOf(captain);
    expect(cleave).toMatchObject({ name: 'Cleave II', max: 5, damage: 0 });
    expect(captain.sections[cleave.sectionIndex].style).toMatch(/Weapon/);
  });

  it('reads Tail Sweep with its target count, its tail section and the no-consecutive-rounds rule', () => {
    const python = monster('python');
    const [sweep] = areaAttacksOf(python);
    expect(sweep).toMatchObject({ name: 'Tail Sweep', max: 5, restriction: 'consecutive' });
    expect(python.sections[sweep.sectionIndex].style).toMatch(/Tail/);
    expect(areaAttacksOf(monster('bone-hound'))[0].max).toBe(3);
  });

  it('is empty for a monster without them', () => {
    expect(areaAttacksOf(monster('shield-hoodling'))).toEqual([]);
  });
});

describe('chargeOf', () => {
  it('takes the printed target number and damage', () => {
    expect(chargeOf(monster('centaur'))).toMatchObject({ accuracy: 5, fixed: 12, damage: '2d+7', sectionIndex: 0 });
    expect(chargeOf(monster('shield-hoodling'))).toBeNull();
  });

  it('rolls its own Accuracy: 2d6 + 5, or the Fixed Value 12', () => {
    const charge = chargeOf(monster('centaur'))!;
    expect(rollChargeAttack(charge, false, dice(3, 4))?.successValue).toBe(12);
    expect(rollChargeAttack(charge, true)?.successValue).toBe(12);
  });
});

describe('poisonRiderOf', () => {
  const save = (value: number, outcome: EvasionRoll['outcome'] = null): EvasionRoll => ({ dice: null, value, outcome });

  it('belongs only to the section it names', () => {
    const scorpion = monster('androscorpion');
    const tail = scorpion.sections.findIndex((section) => section.style.includes('Lower Body'));
    expect(poisonRiderOf(scorpion, tail)).toMatchObject({ value: 5, fixed: 12, damage: { flat: 6 } });
    expect(poisonRiderOf(scorpion, 0)).toBeNull();
  });

  it('reads dice damage and the "needs applied damage" condition', () => {
    expect(poisonRiderOf(monster('phosphor-sphere'), 0)?.damage).toEqual({ dice: true, modifier: 0 });
    expect(poisonRiderOf(monster('desert-scorpion'), 3)?.needsDamage).toBe(true);
  });

  it('is cancelled when the target ties or beats the monster, and lands in full otherwise', () => {
    const rider = poisonRiderOf(monster('quepala-ula'), 0)!;
    // Fixed mode: the monster's Fixed Value 14.
    expect(resolvePoison(rider, save(14), true)).toMatchObject({ resisted: true, dealt: 0 });
    expect(resolvePoison(rider, save(13), true)).toMatchObject({ resisted: false, dealt: 6 });
    expect(resolvePoison(rider, save(2, 'critical'), true).resisted).toBe(true);
  });

  it('rolls 2d6 + the number for the monster when not fixed', () => {
    const rider = poisonRiderOf(monster('quepala-ula'), 0)!;
    // 3+4 + 7 = 14 against a Fortitude check of 15: resisted.
    expect(resolvePoison(rider, save(15), false, dice(3, 4))).toMatchObject({ resisted: true, dealt: 0 });
  });
});

describe('damage traits', () => {
  it('[Tough Skin] takes 3 off bludgeoning hits only', () => {
    const traits = damageTraitsOf(monster('diablo-cadet-human-form'), 0);
    expect(traits.bludgeoningReduction).toBe(3);
    expect(traitAdjustment(traits, { bludgeoning: true, fire: false })).toBe(-3);
    expect(traitAdjustment(traits, { bludgeoning: false, fire: false })).toBe(0);
  });

  it('[Fire Vulnerability] adds 3 to fire hits', () => {
    expect(traitAdjustment(damageTraitsOf(monster('mummy'), 0), { bludgeoning: false, fire: true })).toBe(3);
  });

  it('plain monsters have none', () => {
    expect(damageTraitsOf(monster('shield-hoodling'), 0)).toEqual({ bludgeoningReduction: 0, fireBonus: 0 });
  });

  it('applies after Defense and never turns an absorbed hit into damage', () => {
    const instance = { id: 'a', monsterId: 'x', label: 'x', sections: [{ hp: 30, mp: 0 }] };
    expect(damageSection(instance, 0, 12, 5, true, -3).dealt).toBe(4);
    expect(damageSection(instance, 0, 12, 5, true, 3).dealt).toBe(10);
    expect(damageSection(instance, 0, 5, 5, true, 3).dealt).toBe(0);
    expect(damageSection(instance, 0, 7, 5, true, -3).dealt).toBe(0);
  });

  it('counts mace, staff, flail, warhammer and wrestling as bludgeoning', () => {
    expect(['mace', 'staff', 'flail', 'warhammer', 'wrestling'].every(isBludgeoningCategory)).toBe(true);
    expect(isBludgeoningCategory('sword')).toBe(false);
    expect(isBludgeoningCategory(undefined)).toBe(false);
  });
});

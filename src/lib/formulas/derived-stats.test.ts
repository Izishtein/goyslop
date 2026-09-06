import { describe, expect, it } from 'vitest';
import {
  accuracy,
  bardicPower,
  dangerSense,
  enhancerPower,
  evasion,
  extraDamage,
  firstAid,
  fortitude,
  healingPower,
  initiative,
  magicPower,
  monsterKnowledge,
  willpower,
} from './derived-stats';

describe('derived combat stats', () => {
  it('fortitude = adventurer level + VIT modifier', () => {
    expect(fortitude(4, 2)).toBe(6);
  });

  it('willpower = adventurer level + SPR modifier', () => {
    expect(willpower(4, 3)).toBe(7);
  });

  it('accuracy = warrior-type class level + DEX modifier', () => {
    expect(accuracy(3, 2)).toBe(5);
  });

  it('evasion = warrior-type class level + AGI modifier', () => {
    expect(evasion(3, 1)).toBe(4);
  });

  it('extraDamage = warrior-type class level + STR modifier', () => {
    expect(extraDamage(3, 4)).toBe(7);
  });

  it('magicPower = wizard-type class level + INT modifier', () => {
    expect(magicPower(5, 3)).toBe(8);
  });

  it('bardicPower = Bard class level + INT modifier', () => {
    expect(bardicPower(5, 2)).toBe(7);
  });

  it('enhancerPower = Enhancer class level + INT modifier', () => {
    expect(enhancerPower(3, 2)).toBe(5);
  });
});

describe('check packages', () => {
  it('initiative = Scout (or Tactician) level + AGI modifier', () => {
    expect(initiative(4, 2)).toBe(6);
  });

  it('initiative falls back to the modifier alone without either class', () => {
    expect(initiative(0, 2)).toBe(2);
  });

  it('firstAid = adventurer level + DEX modifier, for every character', () => {
    expect(firstAid(5, 1)).toBe(6);
  });

  it('dangerSense = Scout level + INT modifier', () => {
    expect(dangerSense(3, 2)).toBe(5);
  });

  it('monsterKnowledge = Sage level + INT modifier', () => {
    expect(monsterKnowledge(6, 3)).toBe(9);
  });

  it('healingPower = Priest level + INT modifier', () => {
    expect(healingPower(4, 2)).toBe(6);
  });
});

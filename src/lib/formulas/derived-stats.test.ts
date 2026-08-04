import { describe, expect, it } from 'vitest';
import { accuracy, evasion, extraDamage, fortitude, magicPower, willpower } from './derived-stats';

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
});

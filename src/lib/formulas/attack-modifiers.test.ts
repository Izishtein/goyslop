import { describe, expect, it } from 'vitest';
import type { CombatFeat } from '../../types/character';
import { armorPiercerDefense, declaredAttackModifiers, effectiveCriticalValue, passiveAccuracyBonus, proficiencyDamage } from './attack-modifiers';

const feat = (name: string): CombatFeat => ({ id: name, name, category: 'declaration' });

describe('declaredAttackModifiers', () => {
  it('adds [Power Strike I] damage and nothing else', () => {
    expect(declaredAttackModifiers([feat('Power Strike I')], 0)).toMatchObject({ damage: 4, accuracy: 0, criticalValue: 0, lethal: false, applied: ['Power Strike I'] });
  });

  it('reads [Decoy Attack I] as -2 Accuracy and +2 damage', () => {
    expect(declaredAttackModifiers([feat('Decoy Attack I')], 0)).toMatchObject({ accuracy: -2, damage: 2 });
  });

  it('lets [Aimed Attack I] trade +1 Accuracy for +1 Critical Value, and II keep only the Accuracy', () => {
    expect(declaredAttackModifiers([feat('Aimed Attack I')], 0)).toMatchObject({ accuracy: 1, criticalValue: 1 });
    expect(declaredAttackModifiers([feat('Aimed Attack II')], 0)).toMatchObject({ accuracy: 2, criticalValue: 0 });
  });

  it('adds Magic Power for [Mana Strike]', () => {
    expect(declaredAttackModifiers([feat('Mana Strike')], 7).damage).toBe(7);
  });

  it('stacks several declarations and ignores feats it has no number for', () => {
    const result = declaredAttackModifiers([feat('Power Strike I'), feat('Lethal Strike I'), feat('Snipe')], 0);
    expect(result).toMatchObject({ damage: 4, lethal: true, applied: ['Power Strike I', 'Lethal Strike I'] });
  });
});

describe('declaredAttackModifiers — target-dependent feats', () => {
  it('reaches 3 targets under [Cleave I] (at -3 damage) and 5 under [Cleave II] (no reduction)', () => {
    expect(declaredAttackModifiers([feat('Cleave I')], 0)).toMatchObject({ targets: 3, damage: -3, applied: ['Cleave I'] });
    expect(declaredAttackModifiers([feat('Cleave II')], 0)).toMatchObject({ targets: 5, damage: 0, applied: [] });
    expect(declaredAttackModifiers([], 0).targets).toBe(1);
  });

  it('flags [Repeated Strike I] and II for a second Accuracy check without touching the numbers', () => {
    expect(declaredAttackModifiers([feat('Repeated Strike I')], 0)).toMatchObject({ repeatedStrike: true, repeatedStrikeII: false, damage: 0, applied: [] });
    expect(declaredAttackModifiers([feat('Repeated Strike II')], 0)).toMatchObject({ repeatedStrike: true, repeatedStrikeII: true });
  });
});

describe('effectiveCriticalValue', () => {
  // CR I p. 137: "the final Critical Value will never be 7 or less" — it becomes 8.
  it('never drops below 8', () => {
    expect(effectiveCriticalValue(8, -1)).toBe(8);
    expect(effectiveCriticalValue(9, -1)).toBe(8);
    expect(effectiveCriticalValue(10, -1)).toBe(9);
    expect(effectiveCriticalValue(12, 1)).toBe(13);
  });
});

describe('passive feats', () => {
  it('takes the higher Pinpoint Attack', () => {
    expect(passiveAccuracyBonus([])).toBe(0);
    expect(passiveAccuracyBonus([feat('Pinpoint Attack I')])).toBe(1);
    expect(passiveAccuracyBonus([feat('Pinpoint Attack I'), feat('pinpoint attack II')])).toBe(2);
  });

  it('matches Weapon Proficiency to its category however the player spelled it', () => {
    expect(proficiencyDamage([feat('Weapon Proficiency A/Swords')], 'sword')).toBe(1);
    expect(proficiencyDamage([feat('Weapon Proficiency S/Sword')], 'sword')).toBe(3);
    expect(proficiencyDamage([feat('Weapon Proficiency A/Axes')], 'axe')).toBe(1);
    expect(proficiencyDamage([feat('Weapon Proficiency A/War Hammers')], 'warhammer')).toBe(1);
    expect(proficiencyDamage([feat('Weapon Proficiency A/Axes')], 'sword')).toBe(0);
    expect(proficiencyDamage([feat('Weapon Proficiency A')], 'sword')).toBe(0);
    expect(proficiencyDamage([feat('Weapon Proficiency A/Swords')], undefined)).toBe(0);
  });
});

describe('Armor Piercer', () => {
  it('reports the highest tier declared', () => {
    expect(declaredAttackModifiers([feat('Armor Piercer I'), feat('Armor Piercer III')], 0).armorPiercer).toBe(3);
    expect(declaredAttackModifiers([feat('Power Strike I')], 0).armorPiercer).toBe(0);
  });

  it('halves Defense rounded up, and drops it to 0 on a critical from tier II', () => {
    expect(armorPiercerDefense(0, 7, false)).toBe(7);
    expect(armorPiercerDefense(1, 7, false)).toBe(4);
    expect(armorPiercerDefense(1, 7, true)).toBe(4);
    expect(armorPiercerDefense(2, 7, true)).toBe(0);
    expect(armorPiercerDefense(3, 7, false)).toBe(4);
  });
});

describe('Cleave and Snipe', () => {
  it('takes 3 off the damage under Cleave I but nothing under Cleave II', () => {
    expect(declaredAttackModifiers([feat('Cleave I')], 0).damage).toBe(-3);
    expect(declaredAttackModifiers([feat('Cleave II')], 0).damage).toBe(0);
  });

  it('flags a declared Snipe', () => {
    expect(declaredAttackModifiers([feat('Snipe')], 0).snipe).toBe(true);
    expect(declaredAttackModifiers([], 0).snipe).toBe(false);
  });
});

describe('Repeated Strike II', () => {
  it('is flagged, not folded into a flat bonus', () => {
    const result = declaredAttackModifiers([feat('Repeated Strike II')], 0);
    expect(result.repeatedStrikeII).toBe(true);
    expect(result.damage).toBe(0);
  });
});

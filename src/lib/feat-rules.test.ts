import { describe, expect, it } from 'vitest';
import { getClass } from '../data/classes';
import { COMBAT_FEAT_PREREQUISITES, CREATION_COMBAT_FEATS } from '../data/combat-feat-prerequisites';
import { COMBAT_FEATS } from '../data/combat-feats';
import type { CombatFeat } from '../types/character';
import { countsAsDeclaration, declarationLimit, holdsFeat, outsideCreationList, unmetRequirements } from './feat-rules';

const feat = (name: string, category: CombatFeat['category'] = 'passive'): CombatFeat => ({ id: name, name, category });
const sheet = (classes: [string, number][], ...feats: CombatFeat[]) => ({
  classes: classes.map(([classId, level]) => ({ classId, level })),
  combatFeats: feats,
});

describe('prerequisite data', () => {
  it('only names feats, classes and families that exist', () => {
    const names = COMBAT_FEATS.map((entry) => entry.name);
    for (const [name, requirements] of Object.entries(COMBAT_FEAT_PREREQUISITES)) {
      expect(names, name).toContain(name);
      for (const requirement of requirements) {
        if (requirement.kind === 'classLevel') for (const id of requirement.classIds) expect(getClass(id), `${name} → ${id}`).toBeDefined();
        if (requirement.kind === 'feat') {
          const target = requirement.name;
          expect(names.some((candidate) => holdsFeat(candidate, target) || (target.endsWith('/') && candidate.toLowerCase().startsWith(target.toLowerCase()))), `${name} → ${target}`).toBe(true);
        }
      }
    }
  });

  it('keeps the starting list inside the catalog', () => {
    const names = COMBAT_FEATS.map((entry) => entry.name);
    for (const name of CREATION_COMBAT_FEATS) expect(names).toContain(name);
  });
});

describe('holdsFeat', () => {
  it('lets a higher numeral stand in for a lower one, but not the reverse', () => {
    expect(holdsFeat('Cover II', 'Cover I')).toBe(true);
    expect(holdsFeat('Cover I', 'Cover II')).toBe(false);
    expect(holdsFeat('Cover II', 'Cover')).toBe(true);
  });

  it('accepts the category the player finished a "/**" name with', () => {
    expect(holdsFeat('Weapon Proficiency A/Swords', 'Weapon Proficiency A')).toBe(true);
    expect(holdsFeat('Weapon Proficiency S/Swords', 'Weapon Proficiency A')).toBe(false);
    expect(holdsFeat('Metamagic/Area', 'Metamagic/')).toBe(true);
    expect(holdsFeat('Universal Metamagic', 'Metamagic/')).toBe(false);
  });
});

describe('unmetRequirements', () => {
  it('reads "Prer. Adventurer Level 5 or higher, [Cover]" as both', () => {
    const guardian = feat('Guardian I');
    expect(unmetRequirements(sheet([['fighter', 5]], guardian), guardian)).toHaveLength(1);
    expect(unmetRequirements(sheet([['fighter', 5]], guardian, feat('Cover I', 'declaration')), guardian)).toHaveLength(0);
    expect(unmetRequirements(sheet([['fighter', 4]], guardian, feat('Cover I', 'declaration')), guardian)).toHaveLength(1);
  });

  it('takes Adventurer Level as the highest class level', () => {
    const dual = feat('Dual Technique');
    expect(unmetRequirements(sheet([['fighter', 3], ['scout', 2]], dual), dual)).toHaveLength(1);
    expect(unmetRequirements(sheet([['fighter', 3], ['scout', 5]], dual), dual)).toHaveLength(0);
  });

  it('wants two Wizard-type classes for Powerful Magic I', () => {
    const powerful = feat('Powerful Magic I');
    expect(unmetRequirements(sheet([['sorcerer', 6]], powerful), powerful)).toHaveLength(1);
    expect(unmetRequirements(sheet([['sorcerer', 6], ['conjurer', 6]], powerful), powerful)).toHaveLength(0);
  });

  it('checks the feats of the supplements: Magus Arts, Outlaw Profile Book, Tyrants Crypts', () => {
    const triad = feat('Dividing Triad');
    expect(unmetRequirements(sheet([['geomancer', 2]], triad), triad)).toHaveLength(1);
    expect(unmetRequirements(sheet([['geomancer', 3]], triad), triad)).toHaveLength(0);

    const second = feat('Additional Stratagem/Maneuver II');
    expect(unmetRequirements(sheet([['tactician', 5]], second), second)).toHaveLength(1); // the first one is missing
    expect(unmetRequirements(sheet([['tactician', 5]], second, feat('Additional Stratagem/Maneuver I')), second)).toHaveLength(0);

    const strike = feat('Desperate Strike II');
    expect(unmetRequirements(sheet([['fighter', 7]], strike, feat('Desperate Strike I')), strike)).toHaveLength(0);
    expect(unmetRequirements(sheet([['fighter', 6]], strike, feat('Desperate Strike I')), strike)).toHaveLength(1);

    const mastery = feat('Grimoire Mastery');
    expect(unmetRequirements(sheet([['bibliomancer', 11]], mastery, feat('Grimoire Proficiency S')), mastery)).toHaveLength(0);
    expect(unmetRequirements(sheet([['bibliomancer', 10]], mastery, feat('Grimoire Proficiency S')), mastery)).toHaveLength(1);
  });

  it('does not judge a feat the table does not cover', () => {
    const custom = feat('Homebrew Strike');
    expect(unmetRequirements(sheet([], custom), custom)).toEqual([]);
  });
});

describe('creation list', () => {
  it('applies at Adventurer Level 1 to catalog feats only', () => {
    expect(outsideCreationList(sheet([['fighter', 1]]), feat('Block'))).toBe(true);
    expect(outsideCreationList(sheet([['fighter', 1]]), feat('Dodge'))).toBe(false);
    expect(outsideCreationList(sheet([['fighter', 1]]), feat('Weapon Proficiency A/Swords'))).toBe(false);
    expect(outsideCreationList(sheet([['fighter', 1]]), feat('Homebrew Strike'))).toBe(false);
    expect(outsideCreationList(sheet([['fighter', 3]]), feat('Block'))).toBe(false);
  });
});

describe('declaration allowance', () => {
  it('is one, two with Ever-Changing I and three with II', () => {
    expect(declarationLimit([])).toBe(1);
    expect(declarationLimit([feat('Ever-Changing I')])).toBe(2);
    expect(declarationLimit([feat('Ever-Changing II')])).toBe(3);
  });

  it('exempts Cover II and anything that is not an active feat', () => {
    expect(countsAsDeclaration(feat('Cover II', 'declaration'))).toBe(false);
    expect(countsAsDeclaration(feat('Power Strike I', 'declaration'))).toBe(true);
    expect(countsAsDeclaration(feat('Snipe', 'majorAction'))).toBe(false);
  });
});

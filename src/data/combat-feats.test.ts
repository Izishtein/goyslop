import { describe, expect, it } from 'vitest';
import { COMBAT_FEATS, getCombatFeat, listCombatFeatsByCategory } from './combat-feats';

describe('combat feat catalog', () => {
  it('holds the feats each core book prints', () => {
    const byBook: Record<string, number> = {};
    for (const feat of COMBAT_FEATS) byBook[feat.sourceBook] = (byBook[feat.sourceBook] ?? 0) + 1;
    expect(byBook).toEqual({
      // Core I pp. 249-265, Core II pp. 198-211, Core III pp. 199-205.
      'Core Rulebook I': 47,
      'Core Rulebook II': 47,
      // 12 selectively acquired passive, 7 active, 8 automatic.
      'Core Rulebook III': 27,
      // Bibliomancer's grimoire-rank chain — see docs/sheet-content/17-arcane-magic.md.
      'Tyrants Crypts (fan wiki)': 3,
      // Geomancer's two (p. 22) and the Tactician's five (p. 34).
      'Magus Arts': 7,
      // Cleansing Dance, granted at Battle Dancer 7 (p. 41).
      'Battle Mastery': 1,
    });
    expect(COMBAT_FEATS).toHaveLength(121 + 3 + 7 + 1);
  });

  it('has unique ids', () => {
    expect(new Set(COMBAT_FEATS.map((feat) => feat.id)).size).toBe(COMBAT_FEATS.length);
  });

  it('files every feat under one of the four categories', () => {
    const counted =
      listCombatFeatsByCategory('passive').length +
      listCombatFeatsByCategory('declaration').length +
      listCombatFeatsByCategory('majorAction').length +
      listCombatFeatsByCategory('auto').length;
    expect(counted).toBe(COMBAT_FEATS.length);
  });

  it('looks a feat up by id', () => {
    expect(getCombatFeat('power-strike-iii')).toMatchObject({
      name: 'Power Strike III',
      category: 'declaration',
      sourceBook: 'Core Rulebook III',
    });
  });
});

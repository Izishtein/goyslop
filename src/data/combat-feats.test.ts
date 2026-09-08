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
      // Cleansing Dance (auto, p. 41) and Quick Cast (declaration, p. 37) — the only two
      // Battle Mastery combat feats not already covered by our catalog, found by a full pass
      // through the book's feat cards. Everything else the book prints or cross-references
      // (Chain Attack, Mana Resistance, Metamagic/**, the Vagrant-only options in Battle
      // Dancer's bonus feat list) is either already catalogued or belongs to Vagrant (§ 3).
      'Battle Mastery': 2,
      // Vagrant Combat Feats, pp. 138-141 — 3 passive, 12 declaration, 2 auto (Quick Cast is
      // also printed here but treated as the same feat already catalogued under Battle
      // Mastery, not a second entry). See docs/sheet-content/22-vagrant-misc.md.
      'Outlaw Profile Book': 17,
    });
    expect(COMBAT_FEATS).toHaveLength(121 + 3 + 7 + 2 + 17);
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

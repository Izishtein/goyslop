import { describe, expect, it } from 'vitest';
import raw from '../data/monsters/monsters.json';
import extraRaw from '../data/monsters/extra-monsters.json';
import type { Monster } from '../data/monsters/types';
import {
  attackHits,
  damageModifier,
  damageSection,
  healSection,
  applyDeathCheck,
  declarationsOf,
  autoIdentifies,
  isDefeated,
  knowledgeResult,
  lootFor,
  lootRowMatches,
  regenerate,
  regenerationOf,
  rollDeathCheck,
  rollKnowledge,
  rollMonsterAttack,
  rollMonsterDamage,
  spawnMonster,
} from './encounter';

const monsters = raw as unknown as Monster[];
const find = (name: string) => monsters.find((m) => m.name === name)!;

/** An Rng that yields the given d6 faces in order. */
const faces = (...values: number[]) => {
  let i = 0;
  return () => (values[i++] - 1) / 6;
};

describe('spawning', () => {
  it('starts every section at full HP and MP', () => {
    const drake = spawnMonster(find('Drake (Dragon Form)'), [], 'a');
    expect(drake.sections).toEqual([
      { hp: 62, mp: 46 },
      { hp: 38, mp: 16 },
      { hp: 38, mp: 16 },
    ]);
  });

  it('tells copies apart without renaming the first', () => {
    const goblin = find('Goblin');
    expect(spawnMonster(goblin, [], 'a').label).toBe('Goblin');
    expect(spawnMonster(goblin, ['Goblin'], 'b').label).toBe('Goblin 2');
    expect(spawnMonster(goblin, ['Goblin', 'Goblin 2'], 'c').label).toBe('Goblin 3');
  });
});

describe('damage to a monster', () => {
  const goblin = () => spawnMonster(find('Goblin'), [], 'a'); // Defense 2, HP 16

  it('takes Defense off physical damage but not off magic', () => {
    expect(damageSection(goblin(), 0, 10, 2, true)).toMatchObject({ dealt: 8, instance: { sections: [{ hp: 8 }] } });
    expect(damageSection(goblin(), 0, 10, 2, false).dealt).toBe(10);
  });

  it('never deals less than nothing, and lets HP go below zero', () => {
    expect(damageSection(goblin(), 0, 1, 2, true).dealt).toBe(0);
    expect(damageSection(goblin(), 0, 40, 2, false).instance.sections[0].hp).toBe(-24);
  });

  it('heals up to the maximum and no further', () => {
    const hurt = damageSection(goblin(), 0, 10, 0, false).instance;
    expect(healSection(hurt, 0, 100, 16).sections[0].hp).toBe(16);
  });

  it('is defeated when the main section — or every section, with none named — is down', () => {
    const drake = find('Drake (Dragon Form)');
    let instance = spawnMonster(drake, [], 'a');
    instance = damageSection(instance, 1, 99, 0, false).instance; // a wing
    expect(isDefeated(drake, instance)).toBe(false);
    instance = damageSection(instance, 0, 99, 0, false).instance; // the Body, its main section
    expect(isDefeated(drake, instance)).toBe(true);
  });
});

describe('monster attacks', () => {
  const goblin = find('Goblin').sections[0]; // Accuracy 3 (10), damage 2d+2

  it('rolls 2d6 + Accuracy', () => {
    expect(rollMonsterAttack(goblin, false, faces(4, 3))).toMatchObject({ successValue: 10, outcome: null });
  });

  it('uses the printed Fixed Value without rolling', () => {
    expect(rollMonsterAttack(goblin, true)).toMatchObject({ successValue: 10 });
  });

  it('hits only with a Success Value above the defender\'s, as in the Wolfe example', () => {
    const attack = (successValue: number) => ({ dice: [1, 1] as [number, number], successValue, outcome: null });
    expect(attackHits(attack(10), 10)).toBe(false);
    expect(attackHits(attack(11), 10)).toBe(true);
  });

  it('misses on snake eyes and hits on boxcars whatever the numbers', () => {
    expect(attackHits(rollMonsterAttack(goblin, false, faces(1, 1))!, 0)).toBe(false);
    expect(attackHits(rollMonsterAttack(goblin, false, faces(6, 6))!, 99)).toBe(true);
  });

  it('rolls 2d + X damage, with no critical chain', () => {
    expect(rollMonsterDamage(goblin, false, faces(6, 6))).toEqual({ dice: [6, 6], modifier: 2, total: 14 });
    expect(rollMonsterDamage(goblin, true)).toEqual({ dice: null, modifier: 2, total: 9 });
  });

  it('reads a damage expression', () => {
    expect(damageModifier('2d+12')).toBe(12);
    expect(damageModifier('2d-2')).toBe(-2);
    expect(damageModifier('2d')).toBe(0);
  });

  it('has no attack for a section that cannot make one', () => {
    const basilisk = find('Basilisk (Monstrous Form)').sections[0]; // "None (Evil Eye)": - -
    expect(rollMonsterAttack(basilisk, false)).toBeNull();
    expect(rollMonsterDamage(basilisk, false)).toBeNull();
  });
});

describe('loot', () => {
  it('matches a roll to its row', () => {
    expect(lootRowMatches('2–3', 3)).toBe(true);
    expect(lootRowMatches('2–3', 4)).toBe(false);
    expect(lootRowMatches('10+', 12)).toBe(true);
    expect(lootRowMatches('Always', 2)).toBe(true);
  });

  it('drops every "Always" row plus the row the roll lands in', () => {
    const loot = find('Steam Pod').loot; // Always …, 2–10 Nothing, 11+ …
    expect(lootFor(loot, 5).map((row) => row.roll)).toEqual(['Always', '2–10']);
    expect(lootFor(loot, 11).map((row) => row.roll)).toEqual(['Always', '11+']);
  });
});

describe('Monster Knowledge', () => {
  it('reveals the monster at Reputation and its weak point at Weakness', () => {
    const goblin = find('Goblin'); // 5 / 10
    expect(knowledgeResult(goblin, 4)).toEqual({ identified: false, weak: false });
    expect(knowledgeResult(goblin, 5)).toEqual({ identified: true, weak: false });
    expect(knowledgeResult(goblin, 10)).toEqual({ identified: true, weak: true });
  });

  it('rolls 2d6 plus the modifier, or takes the Fixed Value', () => {
    const goblin = find('Goblin');
    expect(rollKnowledge(goblin, 2, false, faces(3, 4))).toMatchObject({ value: 9, identified: true, weak: false });
    expect(rollKnowledge(goblin, 2, true)).toMatchObject({ dice: null, value: 9, identified: true, weak: false });
    expect(rollKnowledge(goblin, 3, true)).toMatchObject({ value: 10, identified: true, weak: true });
  });

  it('learns nothing on a natural 2 and everything on a natural 12', () => {
    const goblin = find('Goblin');
    expect(rollKnowledge(goblin, 20, false, faces(1, 1))).toMatchObject({ outcome: 'fumble', identified: false, weak: false });
    expect(rollKnowledge(goblin, -20, false, faces(6, 6))).toMatchObject({ outcome: 'critical', identified: true, weak: true });
  });

  it('lets the Conjurer, Sorcerer and Fairy Tamer recognise their own kind unrolled', () => {
    const extra = (id: string) => (extraRaw as unknown as Monster[]).find((m) => m.id === id)!;
    expect(autoIdentifies(extra('oak-golem'), ['conjurer'])).toBe(true);
    expect(autoIdentifies(extra('oak-golem'), ['sage'])).toBe(false);
    expect(autoIdentifies(extra('familiar-cat'), ['sorcerer'])).toBe(true);
    expect(autoIdentifies(find('Goblin'), ['conjurer', 'sorcerer', 'fairy-tamer'])).toBe(false);
    const fairies = monsters.filter((m) => m.category === 'Fairies');
    const olden = fairies.find((m) => m.skills.some((s) => s.name.startsWith('Olden')))!;
    const normal = fairies.find((m) => !m.skills.some((s) => s.name.startsWith('Olden')))!;
    expect(autoIdentifies(normal, ['fairy-tamer'])).toBe(true);
    expect(autoIdentifies(olden, ['fairy-tamer'])).toBe(false);
  });
});

describe('Death Check', () => {
  it('compares 2d6 + the Standard Value with the HP deficit', () => {
    expect(rollDeathCheck(3, -8, false, faces(3, 3))).toMatchObject({ value: 9, target: 8, result: 'survived' });
    expect(rollDeathCheck(3, -8, false, faces(2, 2))).toMatchObject({ value: 7, target: 8, result: 'dead' });
  });

  it('wakes on double 6s and dies on double 1s, whatever the numbers', () => {
    expect(rollDeathCheck(-20, -30, false, faces(6, 6)).result).toBe('revived');
    expect(rollDeathCheck(20, -2, false, faces(1, 1)).result).toBe('dead');
  });

  it('has no automatic outcomes with Fixed Values (CR I p. 383)', () => {
    expect(rollDeathCheck(3, -10, true)).toMatchObject({ dice: null, value: 10, result: 'survived' });
    expect(rollDeathCheck(3, -11, true).result).toBe('dead');
  });

  it('records the fate on the section, and fresh damage or healing clears it', () => {
    const goblin = spawnMonster(find('Goblin'), [], 'a');
    const down = damageSection(goblin, 0, 20, 0, false).instance; // -4
    const out = applyDeathCheck(down, 0, rollDeathCheck(3, -4, true));
    expect(out.sections[0].fate).toBe('out');
    expect(damageSection(out, 0, 1, 0, false).instance.sections[0].fate).toBeUndefined();
    expect(healSection(out, 0, 10, 16).sections[0]).toEqual({ hp: 6, mp: 12 });
    expect(applyDeathCheck(down, 0, { dice: [6, 6], value: 12, target: 4, result: 'revived' }).sections[0]).toEqual({ hp: 1, mp: 12 });
  });
});

describe('declared attacks', () => {
  it('offers the declarations whose effect is a plain number', () => {
    expect(declarationsOf(find('Ogre Berserker'), 0)).toEqual([{ name: 'Power Strike II', accuracy: 0, damage: 12 }]);
    expect(declarationsOf(find('Goblin'), 0)).toEqual([]);
  });

  it('keeps a section-bound declaration to its own rows', () => {
    const withSection = (monster: Monster) => ({ ...monster, skills: [{ section: 'Neck', icons: '🗨', name: 'Power Strike I', text: [] }] });
    const hydra = withSection(find('Hydra'));
    expect(declarationsOf(hydra, 0)).toEqual([]);
    expect(declarationsOf(hydra, 1).map((d) => d.name)).toEqual(['Power Strike I']);
  });
});

describe('regeneration', () => {
  it('reads the points and whether every section recovers', () => {
    expect(regenerationOf(find('Living Tree'))).toEqual({ amount: 10, allSections: false });
    expect(regenerationOf(find('Hydra'))).toEqual({ amount: 10, allSections: true });
    expect(regenerationOf(find('Goblin'))).toBeNull();
  });

  it('heals at the end of a round, up to the maximum, and never a section at 0 HP', () => {
    const hydra = find('Hydra');
    const spawned = spawnMonster(hydra, [], 'a'); // Body 106, Neck 86
    const hurt = { ...spawned, sections: [{ hp: 100, mp: 0 }, { hp: 0, mp: 0 }] };
    const { instance, healed } = regenerate(hydra, hurt);
    expect(instance.sections.map((s) => s.hp)).toEqual([106, 0]);
    expect(healed).toBe(6);
  });
});

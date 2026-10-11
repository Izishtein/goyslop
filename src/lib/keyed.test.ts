import { describe, expect, it } from 'vitest';
import { advanceScene, enemiesFor, happenedByItself, newKeyedScene } from './keyed';

const sequence = (...values: number[]) => {
  let i = 0;
  return () => values[i++ % values.length];
};
/** The fraction that makes a d10 land on `n`. */
const d10 = (n: number) => (n - 0.5) / 10;

describe('keyed scenes', () => {
  it('a counter fires after its N-th scene and, if it repeats, starts counting again', () => {
    let scenes = [newKeyedScene({ title: 'Wolves', trigger: 'counter', every: 3, repeat: true }, 'a')];
    const fired: number[] = [];
    for (let scene = 1; scene <= 7; scene += 1) {
      const result = advanceScene(scenes, scene);
      scenes = result.scenes;
      if (result.fired.length > 0) fired.push(scene);
    }
    expect(fired).toEqual([3, 6]);
    expect(scenes[0]).toMatchObject({ count: 1, done: false });
  });

  it('a one-off retires after it fires', () => {
    let scenes = [newKeyedScene({ title: 'Boss', trigger: 'counter', every: 1 }, 'a')];
    scenes = advanceScene(scenes, 1).scenes;
    expect(scenes[0].done).toBe(true);
    expect(advanceScene(scenes, 2).fired).toEqual([]);
  });

  it('a random trigger fires on a d10 at or under its chance', () => {
    const scenes = [newKeyedScene({ title: 'Trap', trigger: 'random', chance: 2, repeat: true }, 'a')];
    expect(advanceScene(scenes, 1, sequence(d10(2))).fired).toHaveLength(1);
    expect(advanceScene(scenes, 1, sequence(d10(3))).fired).toHaveLength(0);
  });

  it('a milestone is silent until its scene, then rolls', () => {
    const scenes = [newKeyedScene({ title: 'Boss', trigger: 'milestone', at: 5, chance: 3 }, 'a')];
    expect(advanceScene(scenes, 4, sequence(d10(1))).fired).toHaveLength(0);
    expect(advanceScene(scenes, 5, sequence(d10(1))).fired).toHaveLength(1);
    expect(advanceScene(scenes, 5, sequence(d10(4))).fired).toHaveLength(0);
  });

  it('"it happened by itself" resets a counter or retires a one-off', () => {
    const repeating = newKeyedScene({ title: 'A', trigger: 'counter', every: 4, repeat: true }, 'a');
    const oneOff = newKeyedScene({ title: 'B', trigger: 'counter', every: 4 }, 'b');
    const ticked = advanceScene([repeating, oneOff], 1).scenes;
    const after = happenedByItself(ticked, 'a');
    expect(after[0]).toMatchObject({ count: 0, done: false });
    expect(happenedByItself(ticked, 'b')[1]).toMatchObject({ count: 0, done: true });
  });

  it('keeps its numbers in range and trims the title', () => {
    const scene = newKeyedScene({ title: `  ${'x'.repeat(300)} `, trigger: 'random', chance: 99, every: 0 }, 'a');
    expect(scene.chance).toBe(10);
    expect(scene.every).toBe(1);
    expect(scene.title).toHaveLength(120);
  });
});

describe('diminisher', () => {
  it('scales the number of enemies and never leaves fewer than one', () => {
    expect(enemiesFor(6, 0.5)).toBe(3);
    expect(enemiesFor(6, 0.33)).toBe(2);
    expect(enemiesFor(2, 0.25)).toBe(1);
    expect(enemiesFor(6, 1)).toBe(6);
  });
});

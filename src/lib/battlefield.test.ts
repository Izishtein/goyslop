import { describe, expect, it } from 'vitest';
import {
  cellAt,
  cellKey,
  clampCell,
  distanceMeters,
  freeCellNear,
  initials,
  labelNumber,
  layoutTokens,
  nudge,
  rowsForImage,
  type FieldToken,
} from './battlefield';

describe('cells', () => {
  it('finds the cell under a point and keeps it on the field', () => {
    expect(cellAt(0, 0, 200, 100, 20, 10)).toEqual({ col: 0, row: 0 });
    expect(cellAt(55, 25, 200, 100, 20, 10)).toEqual({ col: 5, row: 2 });
    expect(cellAt(500, -30, 200, 100, 20, 10)).toEqual({ col: 19, row: 0 });
  });

  it('steps one cell and stops at the edge', () => {
    expect(nudge({ col: 0, row: 0 }, -1, 0, 20, 14)).toEqual({ col: 0, row: 0 });
    expect(nudge({ col: 19, row: 13 }, 1, 1, 20, 14)).toEqual({ col: 19, row: 13 });
    expect(nudge({ col: 3, row: 3 }, 1, -1, 20, 14)).toEqual({ col: 4, row: 2 });
    expect(clampCell({ col: 99, row: -4 }, 10, 8)).toEqual({ col: 9, row: 0 });
  });

  it('keeps cells square under a picture', () => {
    expect(rowsForImage(20, 2000, 1000)).toBe(10);
    expect(rowsForImage(20, 1000, 1000)).toBe(20);
    expect(rowsForImage(20, 100, 10000)).toBe(60); // never past the limit
    expect(rowsForImage(20, 0, 0)).toBe(14);
  });

  it('measures the straight line between cell centres in metres', () => {
    expect(distanceMeters({ col: 0, row: 0 }, { col: 3, row: 4 }, 1)).toBe(5);
    expect(distanceMeters({ col: 0, row: 0 }, { col: 3, row: 4 }, 1.5)).toBe(7.5);
    expect(distanceMeters({ col: 2, row: 2 }, { col: 2, row: 2 }, 5)).toBe(0);
  });
});

describe('free cells', () => {
  it('stays where it was told when the cell is free, else goes to the nearest free one', () => {
    const taken = new Set([cellKey({ col: 5, row: 5 })]);
    expect(freeCellNear({ col: 6, row: 6 }, taken, 20, 14)).toEqual({ col: 6, row: 6 });
    const near = freeCellNear({ col: 5, row: 5 }, taken, 20, 14);
    expect(Math.max(Math.abs(near.col - 5), Math.abs(near.row - 5))).toBe(1);
    expect(taken.has(cellKey(near))).toBe(false);
  });

  it('finds a cell on a crowded corner', () => {
    const taken = new Set([cellKey({ col: 0, row: 0 }), cellKey({ col: 1, row: 0 }), cellKey({ col: 0, row: 1 })]);
    expect(freeCellNear({ col: 0, row: 0 }, taken, 4, 4)).toEqual({ col: 1, row: 1 });
  });
});

describe('layoutTokens', () => {
  const token = (id: string, side: FieldToken['side']): FieldToken => ({ id, label: id, side });

  it('keeps stored cells and starts the rest: party at the top, foes at the bottom', () => {
    const placed = layoutTokens([token('a', 'party'), token('b', 'party'), token('f', 'foe'), token('g', 'foe')], { b: { col: 7, row: 7 } }, 10, 8);
    expect(placed.b).toEqual({ col: 7, row: 7 });
    expect(placed.a).toEqual({ col: 0, row: 0 });
    expect(placed.f).toEqual({ col: 0, row: 7 });
    expect(placed.g).toEqual({ col: 1, row: 7 });
  });

  it('never puts two tokens in one cell, even when a stored cell is taken by a new arrival', () => {
    const placed = layoutTokens([token('a', 'party'), token('b', 'party'), token('c', 'custom')], { a: { col: 1, row: 0 } }, 10, 8);
    const keys = Object.values(placed).map(cellKey);
    expect(new Set(keys).size).toBe(3);
  });

  it('wraps a long row and pulls a stored cell back onto a smaller field', () => {
    const many = Array.from({ length: 12 }, (_, index) => token(`f${index}`, 'foe'));
    const placed = layoutTokens(many, { f0: { col: 50, row: 50 } }, 10, 8);
    expect(placed.f0).toEqual({ col: 9, row: 7 });
    expect(new Set(Object.values(placed).map(cellKey)).size).toBe(12);
    expect(Object.values(placed).every((cell) => cell.col < 10 && cell.row < 8)).toBe(true);
  });
});

describe('token labels', () => {
  it('takes the trailing number of a copy and two letters of a name', () => {
    expect(labelNumber('Goblin 2')).toBe('2');
    expect(labelNumber('Goblin')).toBe('');
    expect(initials('Rudolf')).toBe('RU');
    expect(initials('Torin Stone Fist')).toBe('TS');
    expect(initials('  ')).toBe('?');
  });
});

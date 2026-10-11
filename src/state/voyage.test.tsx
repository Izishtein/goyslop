import { renderHook } from '@testing-library/react';
import { useAtomValue } from 'jotai';
import { beforeEach, describe, expect, it } from 'vitest';
import { setSail } from '../lib/voyage';
import { voyageAtom } from './voyage';

beforeEach(() => localStorage.clear());

const read = () => renderHook(() => useAtomValue(voyageAtom)).result.current;

describe('the saved voyage', () => {
  it('reads back a voyage on the shared map', () => {
    const voyage = setSail('cog', 2, { q: 3, r: -1, settlement: 'town' }, () => 0.5);
    localStorage.setItem('sw25.voyage', JSON.stringify(voyage));
    expect(read()).toMatchObject({ ship: 'cog', at: { q: 3, r: -1 }, aboard: true });
  });

  it('reads a voyage saved on the old separate chart as no voyage', () => {
    const old = { ship: 'cog', distance: 5, progress: 1, day: 2, hull: 14, supplies: 7, weather: 'fair', encounter: null, arrived: false, wrecked: false, level: 2, sea: null, moves: 1, hunger: 0, escorts: [], cargo: [0, 0, 0, 0, 0, 0], pursuit: null, homeHex: '0,0', crew: null };
    localStorage.setItem('sw25.voyage', JSON.stringify(old));
    expect(read()).toBeNull();
  });
});

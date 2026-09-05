import { describe, expect, it } from 'vitest';
import { AVATAR_MAX_PX, fitWithin } from './avatar';

describe('fitWithin', () => {
  it('leaves an already small image alone', () => {
    expect(fitWithin(120, 80, AVATAR_MAX_PX)).toEqual({ width: 120, height: 80 });
  });

  it('scales the longest side down to the limit, keeping the ratio', () => {
    expect(fitWithin(4000, 3000, 320)).toEqual({ width: 320, height: 240 });
    expect(fitWithin(1000, 2000, 320)).toEqual({ width: 160, height: 320 });
  });

  it('handles square images', () => {
    expect(fitWithin(900, 900, 320)).toEqual({ width: 320, height: 320 });
  });
});

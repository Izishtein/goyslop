import { describe, expect, it } from 'vitest';
import { RACES } from '../data/races';
import { RACE_ART_PARENTS, RACES_WITH_OWN_ART, raceArtUrl } from './race-art';

describe('race art', () => {
  const ids = new Set(RACES.map((race) => race.id));

  it('has a picture only for races the app knows', () => {
    for (const id of RACES_WITH_OWN_ART) expect(ids.has(id), id).toBe(true);
    for (const [variety, parent] of Object.entries(RACE_ART_PARENTS)) {
      expect(ids.has(variety), variety).toBe(true);
      expect(RACES_WITH_OWN_ART, parent).toContain(parent);
    }
  });

  it('gives a variety its parent’s picture and a race without one nothing', () => {
    expect(raceArtUrl('snow-elf')).toBe(raceArtUrl('elf'));
    expect(raceArtUrl('elf')).toBeTruthy();
    expect(raceArtUrl('fluorite')).toBeUndefined();
  });
});

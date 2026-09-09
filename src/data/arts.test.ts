import { describe, expect, it } from 'vitest';
import { ARTS, getArt, listArtsByKind } from './arts';

describe('arts catalog', () => {
  it('holds the counts the source tables print', () => {
    // Techniques: Core II pp. 182-186, two level bands (1st/5th).
    expect(listArtsByKind('technique')).toHaveLength(12 + 8);
    // Spellsongs: Core II pp. 187-194 (1st/5th) + Core III pp. 176-178 (10th) — see
    // docs/sheet-content/30-spellsongs-finales-additional.md.
    expect(listArtsByKind('spellsong')).toHaveLength(9 + 8 + 7);
    // Finales: Core II pp. 195-197 (1st/5th) + Core III pp. 178-179 (10th) — same doc.
    expect(listArtsByKind('finale')).toHaveLength(4 + 4 + 4);
    expect(ARTS).toHaveLength(20 + 24 + 12);
  });

  it('has unique ids', () => {
    expect(new Set(ARTS.map((art) => art.id)).size).toBe(ARTS.length);
  });

  it('looks an art up by id', () => {
    expect(getArt('clap')).toMatchObject({ kind: 'spellsong', requiredLevel: 10 });
    expect(getArt('bright-sunshine')).toMatchObject({ kind: 'finale', requiredLevel: 10 });
  });
});

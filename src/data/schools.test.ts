import { describe, expect, it } from 'vitest';
import { COMBAT_FEATS } from './combat-feats';
import { getSchool, getSchoolSecret, listSecretsBySchool, SCHOOL_SECRETS, SCHOOLS } from './schools';

describe('school catalog', () => {
  it('holds the count the book agrees on (Battle Mastery pp. 44-77)', () => {
    expect(SCHOOLS).toHaveLength(18);
    expect(SCHOOL_SECRETS).toHaveLength(64);
  });

  it('has unique school and secret ids', () => {
    expect(new Set(SCHOOLS.map((s) => s.id)).size).toBe(SCHOOLS.length);
    expect(new Set(SCHOOL_SECRETS.map((s) => s.id)).size).toBe(SCHOOL_SECRETS.length);
  });

  it('points every Secret at a School that actually exists in the catalog', () => {
    const schoolIds = new Set(SCHOOLS.map((s) => s.id));
    for (const s of SCHOOL_SECRETS) expect(schoolIds).toContain(s.schoolId);
  });

  it('points every prerequisite and basic feat at a Secret or Combat Feat that actually exists', () => {
    const secretNames = new Set(SCHOOL_SECRETS.map((s) => s.name));
    const feats = new Set(COMBAT_FEATS.map((f) => f.name));
    const known = new Set([...secretNames, ...feats]);
    for (const s of SCHOOL_SECRETS) {
      if (s.basicFeat) expect(feats).toContain(s.basicFeat);
      if (s.prerequisite && s.prerequisite !== 'None') {
        // Prerequisites are printed as plain lists ("X, Y" = both required) and/or "or" chains
        // ("X or Y" = either satisfies it) — split on both to check every named reference,
        // without trying to preserve the AND/OR distinction (the sheet shows it verbatim and
        // leaves enforcement to the table, same as every other prerequisite in this project).
        const parts = s.prerequisite.split(/, | or /);
        for (const part of parts) expect(known).toContain(part);
      }
    }
  });

  it('only gives Dikehorn Twin Ice Spirit Technique zero Secrets (it grants spells instead)', () => {
    const withoutSecrets = SCHOOLS.filter((s) => listSecretsBySchool(s.id).length === 0);
    expect(withoutSecrets.map((s) => s.name)).toEqual(['Dikehorn Twin Ice Spirit Technique']);
    expect(getSchool('dikehorn-twin-ice-spirit-technique')?.secretsNote).toBeTruthy();
  });

  it('looks up a school and a secret by id', () => {
    expect(getSchool('ivar-frenzy-style')).toMatchObject({ initiationReputation: 50 });
    expect(getSchoolSecret('angry-bear-strike')).toMatchObject({ requiredReputation: 20, type: 'declaration', basicFeat: 'Power Strike I' });
  });
});

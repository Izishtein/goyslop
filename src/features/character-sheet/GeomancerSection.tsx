import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { aspectSlots } from '../../lib/formulas/requirements';
import { ASPECT_DOMAINS, getAspect, listAspectsByLevel } from '../../data/aspects';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, GeomancerQi, KnownAspect } from '../../types/character';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

const ASPECT_LEVELS = [1, 5, 10] as const;

function geomancerLevel(character: Character): number {
  return character.classes.filter((entry) => entry.classId === 'geomancer').reduce((max, entry) => Math.max(max, entry.level), 0);
}

export function GeomancerSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [pick, setPick] = useState('');

  const level = geomancerLevel(character);
  const slots = aspectSlots(level);
  const known = new Set(character.aspects.map((a) => a.name));

  /* Geographs are Class-Specific Items with no use outside this class, so the section stays
     hidden for everyone else — a saved Aspect keeps it reachable after a class change. */
  const show = level > 0 || character.aspects.length > 0;
  if (!show) return null;

  function setAspects(next: (aspects: KnownAspect[]) => KnownAspect[]) {
    update((c) => ({ ...c, aspects: next(c.aspects) }));
  }
  function removeAspect(id: string) {
    setAspects((aspects) => aspects.filter((a) => a.id !== id));
  }
  function updateAspect(id: string, patch: Partial<KnownAspect>) {
    setAspects((aspects) => aspects.map((a) => (a.id === id ? { ...a, ...patch } : a)));
  }
  function addFromCatalog() {
    const found = getAspect(pick);
    if (!found) return;
    setAspects((aspects) => [...aspects, { id: crypto.randomUUID(), name: found.name, domain: found.domain, notes: '' }]);
    setPick('');
  }

  function setQi(patch: Partial<GeomancerQi>) {
    update((c) => ({ ...c, geomancerQi: { ...c.geomancerQi, ...patch } }));
  }

  return (
    <section className={styles.section} aria-labelledby="section-geomancer">
      <div className={styles.sectionHead}>
        <h3 id="section-geomancer">{t('sheet.geomancerAspects')}</h3>
        <p className={styles.sectionNote}>
          {level > 0 ? t('sheet.geomancerLevel', { level }) : t('sheet.noGeomancerClass')}
        </p>
      </div>

      <div className={styles.money}>
        {ASPECT_DOMAINS.map((domain) => (
          <label key={domain} className={styles.moneyField}>
            <span>{t(`sheet.qiDomain.${domain}`)}</span>
            <input
              type="number"
              min={0}
              value={character.geomancerQi[domain]}
              onChange={(e) => setQi({ [domain]: Number(e.target.value) } as Partial<GeomancerQi>)}
              aria-label={t(`sheet.qiDomain.${domain}`)}
            />
          </label>
        ))}
      </div>

      <div className={styles.subsection} data-print-empty={character.aspects.length === 0 || undefined}>
        <h4 className={styles.subHead}>
          {t('sheet.aspects')}{' '}
          <span className={`${styles.numeric} ${character.aspects.length > slots ? styles.overspent : ''}`}>
            ({character.aspects.length} / {slots})
          </span>
        </h4>

        {character.aspects.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.aspectDomain')}</th>
                  <th>{t('sheet.artNote')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {character.aspects.map((a) => (
                  <tr key={a.id}>
                    <td>{a.name}</td>
                    <td>{t(`sheet.qiDomain.${a.domain}`)}</td>
                    <td>
                      <PrintableField value={a.notes} onChange={(e) => updateAspect(a.id, { notes: e.target.value })} aria-label={t('sheet.artNote')} />
                    </td>
                    <td>
                      <button type="button" onClick={() => removeAspect(a.id)} aria-label={`${a.name} ${t('sheet.remove')}`}>
                        {t('sheet.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${styles.inlineRow} ${styles.controlRow}`}>
          <label htmlFor="add-aspect">{t('sheet.addAspectFromCatalog')}</label>
          <select id="add-aspect" value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {ASPECT_LEVELS.map((aspectLevel) => (
              <optgroup
                key={aspectLevel}
                label={`${t('sheet.levelRequired', { level: aspectLevel })}${aspectLevel > level ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
              >
                {listAspectsByLevel(aspectLevel).map((entry) => (
                  <option key={entry.id} value={entry.id} disabled={known.has(entry.name)}>
                    {entry.name} — {t(`sheet.qiDomain.${entry.domain}`)} ({entry.cost})
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addFromCatalog} disabled={!pick}>
            {t('sheet.addFromCatalog')}
          </button>
        </div>
      </div>
    </section>
  );
}

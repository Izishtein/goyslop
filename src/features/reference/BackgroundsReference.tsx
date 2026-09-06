import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getClass } from '../../data/classes';
import { RACES, type BackgroundEntry, type StartingClasses } from '../../data/races';
import { indexBackgroundsByName, listBackgroundOptions } from '../../lib/backgrounds';
import styles from './ReferenceView.module.css';

const MODES = ['byRace', 'byBackground'] as const;
type Mode = (typeof MODES)[number];

/** Races that actually print a table; the rest are Vagrant-system or pending a book. */
const RACES_WITH_TABLES = RACES.filter((race) => race.backgroundTables);

export function BackgroundsReference() {
  const { t } = useTranslation();
  const [mode, setMode] = useState<Mode>('byRace');
  const [raceId, setRaceId] = useState(RACES_WITH_TABLES[0]?.id ?? '');

  const race = RACES_WITH_TABLES.find((entry) => entry.id === raceId) ?? RACES_WITH_TABLES[0];

  function classNames(startingClasses: StartingClasses | null) {
    if (!startingClasses) return '—';
    const names = startingClasses.classIds.map((id) => getClass(id)?.name ?? id);
    return names.join(startingClasses.joiner === 'or' ? t('reference.joinerOr') : t('reference.joinerAnd'));
  }

  function roll(entry: BackgroundEntry) {
    return entry.rollRange === '*' ? t('creation.gmOnly') : entry.rollRange;
  }

  function splitCell(entry: BackgroundEntry) {
    // A null split means the row rolls its own — the form says the same thing.
    return entry.stats ? entry.stats.join(' / ') : t('reference.rollsOwn');
  }

  return (
    <section className={styles.panel} aria-labelledby="reference-backgrounds">
      <div className={styles.panelHead}>
        <h3 id="reference-backgrounds">{t('reference.tab.backgrounds')}</h3>
        <p className={styles.note}>{t('reference.backgroundsNote')}</p>
      </div>

      <div className={styles.tabs}>
        {MODES.map((name) => (
          <button
            key={name}
            type="button"
            className={`${styles.tab} ${mode === name ? styles.tabActive : ''}`}
            aria-pressed={mode === name}
            onClick={() => setMode(name)}
          >
            {t(`reference.${name}`)}
          </button>
        ))}
      </div>

      {mode === 'byRace' ? (
        <>
          <div className={styles.controlRow}>
            <label htmlFor="reference-race">{t('reference.race')}</label>
            <select id="reference-race" value={race?.id ?? ''} onChange={(event) => setRaceId(event.target.value)}>
              {RACES_WITH_TABLES.map((entry) => (
                <option key={entry.id} value={entry.id}>
                  {entry.name}
                </option>
              ))}
            </select>
          </div>

          {(['primary', 'additional'] as const).map((table) => {
            const rows = listBackgroundOptions(race!).filter((option) => option.table === table);
            if (rows.length === 0) return null;
            return (
              <div key={table} className={styles.group}>
                <h4>{t(`creation.backgroundTable.${table}`)}</h4>
                <div className={styles.tableWrap}>
                  <table className={styles.table}>
                    <thead>
                      <tr>
                        <th>{t('reference.roll')}</th>
                        <th>{t('creation.background')}</th>
                        <th>{t('creation.startingClass')}</th>
                        <th>
                          {t('creation.skill')} / {t('creation.body')} / {t('creation.mind')}
                        </th>
                        <th>{t('sheet.xpTotal')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {rows.map((option) => (
                        <tr key={option.key}>
                          <td>{roll(option.entry)}</td>
                          <th scope="row" className={styles.rowName}>
                            {option.entry.name}
                          </th>
                          <td>{classNames(option.entry.startingClasses)}</td>
                          <td className={styles.numeric}>{splitCell(option.entry)}</td>
                          <td className={styles.numeric}>{option.entry.xp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            );
          })}
        </>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('creation.background')}</th>
                <th>{t('reference.race')}</th>
                <th>{t('reference.roll')}</th>
                <th>{t('creation.startingClass')}</th>
                <th>
                  {t('creation.skill')} / {t('creation.body')} / {t('creation.mind')}
                </th>
                <th>{t('sheet.xpTotal')}</th>
              </tr>
            </thead>
            <tbody>
              {/* One line per race, never merged: Human's Cleric is 4/8/9 and Elf's is
                  9/5/12, so a single "Cleric" row would be a quiet lie. */}
              {indexBackgroundsByName().flatMap((background) =>
                background.occurrences.map((occurrence, index) => (
                  <tr key={`${background.name}-${occurrence.raceId}-${occurrence.entry.rollRange}`}>
                    {index === 0 ? (
                      <th scope="row" rowSpan={background.occurrences.length} className={styles.rowName}>
                        {background.name}
                      </th>
                    ) : null}
                    <td>{occurrence.raceName}</td>
                    <td>{roll(occurrence.entry)}</td>
                    <td>{classNames(occurrence.entry.startingClasses)}</td>
                    <td className={styles.numeric}>{splitCell(occurrence.entry)}</td>
                    <td className={styles.numeric}>{occurrence.entry.xp}</td>
                  </tr>
                )),
              )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

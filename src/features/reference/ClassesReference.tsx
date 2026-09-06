import { useTranslation } from 'react-i18next';
import { CLASSES, type ClassType } from '../../data/classes';
import { MAX_CLASS_LEVEL, classLevelXpCost, classLevelXpCumulative } from '../../lib/formulas/xp-cost';
import styles from './ReferenceView.module.css';

const GROUPS: ClassType[] = ['warrior', 'wizard', 'other'];

const LEVELS = Array.from({ length: MAX_CLASS_LEVEL }, (_, index) => index + 1);

export function ClassesReference() {
  const { t } = useTranslation();

  return (
    <section className={styles.panel} aria-labelledby="reference-classes">
      <div className={styles.panelHead}>
        <h3 id="reference-classes">{t('reference.tab.classes')}</h3>
        <p className={styles.note}>{t('reference.classesNote')}</p>
      </div>

      {GROUPS.map((group) => (
        <div key={group} className={styles.group}>
          <h4>{t(`sheet.classTypeName.${group}`)}</h4>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('reference.class')}</th>
                  <th>{t('sheet.rank')}</th>
                  <th>{t('reference.keyAbilities')}</th>
                  {group === 'wizard' && <th>{t('sheet.spellSchool')}</th>}
                  <th>{t('reference.xpLevel1')}</th>
                  <th>{t('reference.book')}</th>
                  <th>{t('reference.description')}</th>
                </tr>
              </thead>
              <tbody>
                {CLASSES.filter((classDef) => classDef.type === group).map((classDef) => (
                  <tr key={classDef.id}>
                    <th scope="row" className={styles.rowName}>
                      {classDef.name}
                    </th>
                    <td>{t(`sheet.classRankName.${classDef.rank}`)}</td>
                    <td>{classDef.keyAbilities.join(', ')}</td>
                    {group === 'wizard' && <td>{classDef.magicSchool}</td>}
                    <td className={styles.numeric}>{classLevelXpCost(classDef.rank, 1)}</td>
                    <td>{classDef.sourceBook}</td>
                    {/* The one place the app carries prose. It lives in the locale files, not
                        in data/classes.ts, so both languages get it — see the note there. */}
                    <td className={styles.prose}>{t(`reference.classDescription.${classDef.id}`)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ))}

      <div className={styles.group}>
        <h4>{t('reference.xpProgression')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.level')}</th>
                <th>{t('reference.majorLevelCost')}</th>
                <th>{t('reference.majorCumulative')}</th>
                <th>{t('reference.minorLevelCost')}</th>
                <th>{t('reference.minorCumulative')}</th>
              </tr>
            </thead>
            <tbody>
              {LEVELS.map((level) => (
                <tr key={level}>
                  <th scope="row" className={styles.numeric}>
                    {level}
                  </th>
                  <td className={styles.numeric}>{classLevelXpCost('major', level)}</td>
                  <td className={styles.numeric}>{classLevelXpCumulative('major', level)}</td>
                  <td className={styles.numeric}>{classLevelXpCost('minor', level)}</td>
                  <td className={styles.numeric}>{classLevelXpCumulative('minor', level)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

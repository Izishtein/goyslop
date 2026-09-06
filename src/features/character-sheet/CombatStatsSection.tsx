import { useTranslation } from 'react-i18next';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import {
  accuracy,
  dangerSense,
  evasion,
  extraDamage,
  firstAid,
  healingPower,
  initiative,
  magicPower,
  monsterKnowledge,
} from '../../lib/formulas/derived-stats';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { getClass } from '../../data/classes';
import type { Character } from '../../types/character';
import styles from './CharacterSheetView.module.css';

export function CombatStatsSection({ character }: { character: Character }) {
  const { t } = useTranslation();

  const dexMod = abilityModifier(abilityTotal(character.abilities.DEX));
  const agiMod = abilityModifier(abilityTotal(character.abilities.AGI));
  const strMod = abilityModifier(abilityTotal(character.abilities.STR));
  const intMod = abilityModifier(abilityTotal(character.abilities.INT));
  const accuracyStatusMod = sumModifiersForField(character.statusEffects, 'accuracy');
  const evasionStatusMod = sumModifiersForField(character.statusEffects, 'evasion');

  const warriorRows = character.classes
    .filter((classLevel) => getClass(classLevel.classId)?.type === 'warrior')
    .map((classLevel) => {
      // Marksman levels do not contribute to Evasion.
      const evasionLevel = classLevel.classId === 'marksman' ? 0 : classLevel.level;
      return {
        name: getClass(classLevel.classId)?.name ?? classLevel.classId,
        accuracy: accuracy(classLevel.level, dexMod) + accuracyStatusMod,
        evasion: evasion(evasionLevel, agiMod) + evasionStatusMod,
        extraDamage: extraDamage(classLevel.level, strMod),
      };
    });

  function levelOf(classId: string): number {
    return character.classes.filter((entry) => entry.classId === classId).reduce((max, entry) => Math.max(max, entry.level), 0);
  }

  /*
   * Check packages: the Standard Values a player rolls all session and currently adds up in
   * their head (docs/sheet-content/04-combat-and-scas.md). Initiative and First Aid are
   * universal, the other three come with a class and are left out when it is absent — a row
   * reading "Monster Knowledge 2" would be a lie on a sheet with no Sage on it.
   * Movement is deliberately absent: the docs give it no formula, only "depends on race and
   * equipment", and a made-up number is worse than none.
   */
  const advLevel = adventurerLevel(character.classes);
  const scoutLevel = Math.max(levelOf('scout'), levelOf('tactician'));
  const sageLevel = levelOf('sage');
  const priestLevel = levelOf('priest');

  const checkRows = [
    { key: 'initiative', value: initiative(scoutLevel, agiMod) },
    { key: 'firstAid', value: firstAid(advLevel, dexMod) },
    ...(levelOf('scout') > 0 ? [{ key: 'dangerSense', value: dangerSense(levelOf('scout'), intMod) }] : []),
    ...(sageLevel > 0 ? [{ key: 'monsterKnowledge', value: monsterKnowledge(sageLevel, intMod) }] : []),
    ...(priestLevel > 0 ? [{ key: 'healingPower', value: healingPower(priestLevel, intMod) }] : []),
  ];

  const wizardRows = character.classes
    .filter((classLevel) => getClass(classLevel.classId)?.type === 'wizard')
    .map((classLevel) => ({
      name: getClass(classLevel.classId)?.name ?? classLevel.classId,
      magicPower: magicPower(classLevel.level, intMod),
    }));

  return (
    <section className={styles.section} aria-labelledby="section-combat-stats">
      <div className={styles.sectionHead}>
        <h3 id="section-combat-stats">{t('sheet.combatStats')}</h3>
      </div>

      {warriorRows.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.class')}</th>
                <th>{t('sheet.accuracy')}</th>
                <th>{t('sheet.evasion')}</th>
                <th>{t('sheet.extraDamage')}</th>
              </tr>
            </thead>
            <tbody>
              {warriorRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td className={styles.numeric}>{row.accuracy}</td>
                  <td className={styles.numeric}>{row.evasion}</td>
                  <td className={styles.numeric}>{row.extraDamage}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {wizardRows.length > 0 && (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.class')}</th>
                <th>{t('sheet.magicPower')}</th>
              </tr>
            </thead>
            <tbody>
              {wizardRows.map((row) => (
                <tr key={row.name}>
                  <td>{row.name}</td>
                  <td className={styles.numeric}>{row.magicPower}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <div className={styles.subsection}>
        <h4 className={styles.subHead}>{t('sheet.checkPackages')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.check')}</th>
                <th>{t('sheet.standardValue')}</th>
              </tr>
            </thead>
            <tbody>
              {checkRows.map((row) => (
                <tr key={row.key}>
                  <td>{t(`sheet.check_${row.key}`)}</td>
                  <td className={styles.numeric}>{row.value}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

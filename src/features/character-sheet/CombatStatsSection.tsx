import { useTranslation } from 'react-i18next';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { accuracy, evasion, extraDamage, magicPower } from '../../lib/formulas/derived-stats';
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

  const wizardRows = character.classes
    .filter((classLevel) => getClass(classLevel.classId)?.type === 'wizard')
    .map((classLevel) => ({
      name: getClass(classLevel.classId)?.name ?? classLevel.classId,
      magicPower: magicPower(classLevel.level, intMod),
    }));

  if (warriorRows.length === 0 && wizardRows.length === 0) return null;

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3>{t('sheet.combatStats')}</h3>
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
    </section>
  );
}

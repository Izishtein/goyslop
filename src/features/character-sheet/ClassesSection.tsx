import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { CLASSES, getClass } from '../../data/classes';
import { getRace } from '../../data/races';
import { rankForReputation, reputationToNextRank } from '../../lib/formulas/adventurer-rank';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { classLevelXpCost, MAX_CLASS_LEVEL } from '../../lib/formulas/xp-cost';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import styles from './CharacterSheetView.module.css';

/**
 * Classes and the XP that buys them.
 *
 * Every automatic change to `spent` is the exact inverse of an explicit purchase made
 * here: +1 charges the level gained, -1 refunds that same level. Removing a class
 * deliberately refunds nothing — a background grants its starting classes for free, so
 * refunding on removal would invent XP the character never earned. `spent` stays
 * editable for those corrections and for XP spent on things this app does not model.
 */
export function ClassesSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [classToAdd, setClassToAdd] = useState('');

  const race = getRace(character.raceId);
  const taken = new Set(character.classes.map((classLevel) => classLevel.classId));
  const available = CLASSES.filter(
    (classDef) => !taken.has(classDef.id) && !(race?.restrictedClasses ?? []).includes(classDef.id),
  );

  const remaining = character.experience.total - character.experience.spent;
  const rank = rankForReputation(character.reputation);
  const nextRank = reputationToNextRank(character.reputation);

  function spend(amount: number) {
    update((c) => ({ ...c, experience: { ...c.experience, spent: Math.max(0, c.experience.spent + amount) } }));
  }

  function setExperience(field: 'total' | 'spent', value: number) {
    update((c) => ({ ...c, experience: { ...c.experience, [field]: Math.max(0, value) } }));
  }

  function setReputation(value: number) {
    update((c) => ({ ...c, reputation: Math.max(0, value) }));
  }

  function changeLevel(classId: string, delta: 1 | -1) {
    const classDef = getClass(classId);
    const current = character.classes.find((classLevel) => classLevel.classId === classId);
    if (!classDef || !current) return;
    const nextLevel = current.level + delta;
    if (nextLevel < 1 || nextLevel > MAX_CLASS_LEVEL) return;
    // Charge the level gained; refund the level given up.
    spend(delta === 1 ? classLevelXpCost(classDef.rank, nextLevel) : -classLevelXpCost(classDef.rank, current.level));
    update((c) => ({
      ...c,
      classes: c.classes.map((classLevel) => (classLevel.classId === classId ? { ...classLevel, level: nextLevel } : classLevel)),
    }));
  }

  function addClass() {
    const classDef = getClass(classToAdd);
    if (!classDef) return;
    spend(classLevelXpCost(classDef.rank, 1));
    update((c) => ({ ...c, classes: [...c.classes, { classId: classDef.id, level: 1 }] }));
    setClassToAdd('');
  }

  function removeClass(classId: string) {
    update((c) => ({ ...c, classes: c.classes.filter((classLevel) => classLevel.classId !== classId) }));
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3>{t('sheet.classes')}</h3>
        <p className={styles.sectionNote}>
          {t('sheet.adventurerLevel')}: <strong className={styles.numeric}>{adventurerLevel(character.classes)}</strong>
        </p>
      </div>

      <div className={styles.money}>
        <label className={styles.moneyField}>
          <span>{t('sheet.xpTotal')}</span>
          <input
            type="number"
            value={character.experience.total}
            onChange={(e) => setExperience('total', Number(e.target.value))}
            aria-label={t('sheet.xpTotal')}
          />
        </label>
        <label className={styles.moneyField}>
          <span>{t('sheet.xpSpent')}</span>
          <input
            type="number"
            value={character.experience.spent}
            onChange={(e) => setExperience('spent', Number(e.target.value))}
            aria-label={t('sheet.xpSpent')}
          />
        </label>
        <div className={styles.moneyField}>
          <span>{t('sheet.xpRemaining')}</span>
          <strong className={`${styles.numeric} ${remaining < 0 ? styles.overspent : ''}`} aria-label={t('sheet.xpRemaining')}>
            {remaining}
          </strong>
        </div>

        <label className={styles.moneyField}>
          <span>{t('sheet.reputation')}</span>
          <input
            type="number"
            value={character.reputation}
            onChange={(e) => setReputation(Number(e.target.value))}
            aria-label={t('sheet.reputation')}
          />
        </label>
        <div className={styles.moneyField}>
          <span>{t('sheet.adventurerRank')}</span>
          <strong aria-label={t('sheet.adventurerRank')}>{rank.name}</strong>
          <span className={styles.rankHint}>
            {t('sheet.freeRenown')}: {rank.free}
            {nextRank ? ` · ${t('sheet.toNextRank', { missing: nextRank.missing, rank: nextRank.rank.name })}` : ''}
          </span>
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={character.classes.length === 0 || undefined}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.class')}</th>
                <th>{t('sheet.classType')}</th>
                <th>{t('sheet.classRank')}</th>
                <th>{t('sheet.level')}</th>
                <th>{t('sheet.nextLevelCost')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.classes.map((classLevel) => {
                const classDef = getClass(classLevel.classId);
                const atCap = classLevel.level >= MAX_CLASS_LEVEL;
                const name = classDef?.name ?? classLevel.classId;
                return (
                  <tr key={classLevel.classId}>
                    <td>{name}</td>
                    <td>{classDef ? t(`sheet.classTypeName.${classDef.type}`) : '—'}</td>
                    <td>{classDef ? t(`sheet.classRankName.${classDef.rank}`) : '—'}</td>
                    <td className={styles.numeric} aria-label={`${name} ${t('sheet.level')}`}>
                      {classLevel.level}
                    </td>
                    <td className={styles.numeric}>
                      {classDef && !atCap ? classLevelXpCost(classDef.rank, classLevel.level + 1) : '—'}
                    </td>
                    <td>
                      <div className={styles.rowActions}>
                        <button
                          type="button"
                          onClick={() => changeLevel(classLevel.classId, 1)}
                          disabled={atCap}
                          aria-label={`${name} ${t('sheet.levelUp')}`}
                        >
                          +1
                        </button>
                        <button
                          type="button"
                          onClick={() => changeLevel(classLevel.classId, -1)}
                          disabled={classLevel.level <= 1}
                          aria-label={`${name} ${t('sheet.levelDown')}`}
                        >
                          -1
                        </button>
                        <button type="button" onClick={() => removeClass(classLevel.classId)} aria-label={`${name} ${t('sheet.remove')}`}>
                          {t('sheet.remove')}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {character.classes.length === 0 && <p className={styles.empty}>{t('sheet.noClasses')}</p>}

      {/* A <select> is data everywhere else on the sheet, so print can't hide it wholesale
          the way it hides buttons — this row is marked as chrome explicitly. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        <label htmlFor="add-class">{t('sheet.addClass')}</label>
        <select id="add-class" value={classToAdd} onChange={(e) => setClassToAdd(e.target.value)}>
          <option value="">{t('creation.selectPlaceholder')}</option>
          {available.map((classDef) => (
            <option key={classDef.id} value={classDef.id}>
              {classDef.name} — {classLevelXpCost(classDef.rank, 1)} XP
            </option>
          ))}
        </select>
        <button type="button" onClick={addClass} disabled={!classToAdd}>
          {t('sheet.addClassAction')}
        </button>
      </div>
    </section>
  );
}

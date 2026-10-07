import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { COMBAT_FEATS, getCombatFeat } from '../../data/combat-feats';
import { getClass } from '../../data/classes';
import type { FeatRequirement } from '../../data/combat-feat-prerequisites';
import { countsAsDeclaration, declarationLimit, MAJOR_ACTION_LIMIT, outsideCreationList, unmetRequirements } from '../../lib/feat-rules';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { battleDancerBonusFeatSlot, combatFeatSlots, combatFeatsSpendingSlots } from '../../lib/formulas/requirements';
import { COMBAT_FEAT_CATEGORIES, type CombatFeat, type CombatFeatCategory, type Character } from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import { useTurnFeats } from '../../state/turn';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

function newFeat(): CombatFeat {
  return { id: crypto.randomUUID(), name: '', category: 'passive' };
}

function battleDancerLevel(character: Character): number {
  return character.classes.filter((entry) => entry.classId === 'battle-dancer').reduce((max, entry) => Math.max(max, entry.level), 0);
}

/** Suggestion list shared by every feat row; a page only ever shows one sheet. */
const FEATS_LIST_ID = 'combat-feat-names';

export function CombatFeatsSection({ character }: { character: Character }) {
  const { t, i18n } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [featId, setFeatId] = useState('');

  const taken = new Set(character.combatFeats.map((feat) => feat.name));

  // The turn tracker: ids of the feats declared / used this turn. Session state, not part of
  // the character — a new turn clears it, and so would closing the page.
  const [used, setUsedState] = useTurnFeats(character.id);
  const setUsed = (next: string[] | ((current: string[]) => string[])) => setUsedState((current) => (typeof next === 'function' ? next(current) : next));
  const present = new Set(character.combatFeats.map((feat) => feat.id));
  const usedNow = used.filter((id) => present.has(id));
  const declaredCount = character.combatFeats.filter((feat) => usedNow.includes(feat.id) && countsAsDeclaration(feat)).length;
  const majorCount = character.combatFeats.filter((feat) => usedNow.includes(feat.id) && feat.category === 'majorAction').length;
  const limit = declarationLimit(character.combatFeats);

  function toggleUse(id: string) {
    setUsed((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  function describe(requirement: FeatRequirement): string {
    switch (requirement.kind) {
      case 'adventurerLevel':
        return t('sheet.featReq.adventurerLevel', { level: requirement.level });
      case 'classLevel':
        return t('sheet.featReq.classLevel', {
          classes: requirement.classIds.map((id) => getClass(id)?.name ?? id).join(' / '),
          level: requirement.level,
        });
      case 'wizardClasses':
        return t('sheet.featReq.wizardClasses', { count: requirement.count, level: requirement.level });
      case 'feat':
        return `[${requirement.name.replace(/\/$/, '/**')}]`;
    }
  }

  // Auto-acquired feats come with a class level and cost nothing, so the count is of the
  // ones actually chosen. Over the limit is a bookkeeping error worth seeing, not a block:
  // a sheet is often filled in a level ahead of the session that grants the slot.
  // Battle Dancer level 1 adds one more slot on top of the ordinary count (Battle Mastery
  // p. 12, "Bonus Active Combat Feat") — see requirements.ts for the restriction the book
  // puts on what can fill it, which this section does not enforce.
  const slots = combatFeatSlots(adventurerLevel(character.classes)) + battleDancerBonusFeatSlot(battleDancerLevel(character));
  const chosen = combatFeatsSpendingSlots(character.combatFeats);

  function updateFeat(id: string, patch: Partial<CombatFeat>) {
    update((c) => ({ ...c, combatFeats: c.combatFeats.map((f) => (f.id === id ? { ...f, ...patch } : f)) }));
  }
  function addFeat() {
    update((c) => ({ ...c, combatFeats: [...c.combatFeats, newFeat()] }));
  }
  function addFromCatalog() {
    const found = getCombatFeat(featId);
    if (!found) return;
    update((c) => ({ ...c, combatFeats: [...c.combatFeats, { id: crypto.randomUUID(), name: found.name, category: found.category }] }));
    setFeatId('');
  }
  function removeFeat(id: string) {
    update((c) => ({ ...c, combatFeats: c.combatFeats.filter((f) => f.id !== id) }));
  }

  return (
    <section className={styles.section} aria-labelledby="section-combat-feats">
      <div className={styles.sectionHead}>
        <h3 id="section-combat-feats">{t('sheet.combatFeats')}</h3>
        <p className={styles.sectionNote}>
          {t('sheet.featSlots')}:{' '}
          <strong className={`${styles.numeric} ${chosen > slots ? styles.overspent : ''}`}>
            {chosen} / {slots}
          </strong>
        </p>
      </div>

      {character.combatFeats.some((feat) => feat.category === 'declaration' || feat.category === 'majorAction') && (
        <div className={`${styles.inlineRow} ${styles.controlRow}`} data-testid="turn-tracker">
          <span>
            {t('sheet.turnDeclared')}:{' '}
            <strong className={`${styles.numeric} ${declaredCount > limit ? styles.overspent : ''}`}>
              {declaredCount} / {limit}
            </strong>
          </span>
          <span>
            {t('sheet.turnMajor')}:{' '}
            <strong className={`${styles.numeric} ${majorCount > MAJOR_ACTION_LIMIT ? styles.overspent : ''}`}>
              {majorCount} / {MAJOR_ACTION_LIMIT}
            </strong>
          </span>
          <button type="button" onClick={() => setUsed([])} disabled={usedNow.length === 0}>
            {t('sheet.newTurn')}
          </button>
        </div>
      )}

      {usedNow.length > 0 && (
        <div className={styles.turnLog} role="status" aria-live="polite" data-testid="turn-log">
          <h4>{t('sheet.turnActive')}</h4>
          <ul>
            {character.combatFeats
              .filter((feat) => usedNow.includes(feat.id))
              .map((feat) => {
                const key = `reference.combatFeatEffect.${COMBAT_FEATS.find((entry) => entry.name === feat.name)?.id}`;
                return (
                  <li key={feat.id}>
                    <strong>{feat.name}</strong> — {t(`sheet.combatFeatCategory.${feat.category}`)}
                    {i18n.exists(key) ? <p>{t(key)}</p> : <p>{t('sheet.turnNoEffectText')}</p>}
                  </li>
                );
              })}
          </ul>
        </div>
      )}

      {character.combatFeats.length === 0 ? (
        <p className={styles.empty}>{t('sheet.noCombatFeats')}</p>
      ) : (
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.category')}</th>
                <th></th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.combatFeats.map((feat) => {
                const unmet = unmetRequirements(character, feat);
                const creationOnly = outsideCreationList(character, feat);
                const isUsed = usedNow.includes(feat.id);
                const usable = feat.category === 'declaration' || feat.category === 'majorAction';
                const blocked =
                  !isUsed &&
                  ((feat.category === 'majorAction' && majorCount >= MAJOR_ACTION_LIMIT) ||
                    (countsAsDeclaration(feat) && declaredCount >= limit));
                return (
                <tr key={feat.id} data-problem={unmet.length > 0 || creationOnly || undefined}>
                  <td>
                    {/* Core III adds feats the docs do not cover yet, and the book's own
                        "/**" names are finished by hand, so this suggests and never binds. */}
                    <PrintableField
                      list={FEATS_LIST_ID}
                      value={feat.name}
                      onChange={(e) => updateFeat(feat.id, { name: e.target.value })}
                      aria-label={t('sheet.name')}
                    />
                    {unmet.length > 0 && (
                      <p className={`${styles.overspent} ${styles.ruleWarning}`} role="alert">
                        {t('sheet.featUnmet', { list: unmet.map(describe).join(', ') })}
                      </p>
                    )}
                    {creationOnly && (
                      <p className={`${styles.overspent} ${styles.ruleWarning}`} role="alert">
                        {t('sheet.featCreationOnly')}
                      </p>
                    )}
                  </td>
                  <td>
                    <select
                      value={feat.category}
                      onChange={(e) => updateFeat(feat.id, { category: e.target.value as CombatFeatCategory })}
                      aria-label={t('sheet.category')}
                    >
                      {COMBAT_FEAT_CATEGORIES.map((category) => (
                        <option key={category} value={category}>
                          {t(`sheet.combatFeatCategory.${category}`)}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    {usable && (
                      <button
                        type="button"
                        aria-pressed={isUsed}
                        disabled={blocked}
                        title={blocked ? t('sheet.turnLimitReached') : undefined}
                        onClick={() => toggleUse(feat.id)}
                        aria-label={`${feat.name} ${isUsed ? t('sheet.featWithdraw') : t('sheet.featDeclare')}`}
                      >
                        {isUsed ? t('sheet.featWithdraw') : t('sheet.featDeclare')}
                      </button>
                    )}
                  </td>
                  <td>
                    <button type="button" onClick={() => removeFeat(feat.id)} aria-label={`${feat.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      <datalist id={FEATS_LIST_ID}>
        {COMBAT_FEATS.map((feat) => (
          <option key={feat.id} value={feat.name} />
        ))}
      </datalist>

      {/* Selects are data elsewhere on the sheet, so this picker is marked as chrome for print. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        <label htmlFor="add-feat">{t('sheet.addFeatFromCatalog')}</label>
        <select id="add-feat" value={featId} onChange={(e) => setFeatId(e.target.value)}>
          <option value="">{t('creation.selectPlaceholder')}</option>
          {COMBAT_FEAT_CATEGORIES.map((category) => (
            <optgroup key={category} label={t(`sheet.combatFeatCategory.${category}`)}>
              {COMBAT_FEATS.filter((feat) => feat.category === category).map((feat) => (
                <option key={feat.id} value={feat.id} disabled={taken.has(feat.name)}>
                  {feat.name}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button type="button" onClick={addFromCatalog} disabled={!featId}>
          {t('sheet.addCombatFeat')}
        </button>
        <button type="button" onClick={addFeat}>
          {t('sheet.addCustomCombatFeat')}
        </button>
      </div>
    </section>
  );
}

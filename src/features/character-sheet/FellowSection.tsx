import { useTranslation } from 'react-i18next';
import { getClass } from '../../data/classes';
import { getRace } from '../../data/races';
import { adventurerLevel, wizardLevelSum } from '../../lib/formulas/character-levels';
import { abilityTotal } from '../../lib/formulas/abilities';
import { mpMax } from '../../lib/formulas/hp-mp';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, FellowAction } from '../../types/character';
import { autoGrow } from './autoGrow';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

function newAction(): FellowAction {
  return { id: crypto.randomUUID(), roll: '', name: '', dialogue: '', value: '', effect: '' };
}

export function FellowSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  // Read straight off the sheet, exactly as the book copies them from the PC — nothing
  // here is stored a second time in the Fellow schema.
  const race = getRace(character.raceId);
  const level = adventurerLevel(character.classes);
  const sprTotal = abilityTotal(character.abilities.SPR);
  const mp = mpMax(wizardLevelSum(character.classes), sprTotal);
  const classSummary = character.classes
    .map((classLevel) => `${getClass(classLevel.classId)?.name ?? classLevel.classId} ${classLevel.level}`)
    .join(', ');

  function updateFellow(patch: Partial<Character['fellow']>) {
    update((c) => ({ ...c, fellow: { ...c.fellow, ...patch } }));
  }

  function addAction() {
    update((c) => ({ ...c, fellow: { ...c.fellow, actions: [...c.fellow.actions, newAction()] } }));
  }

  function updateAction(id: string, patch: Partial<FellowAction>) {
    update((c) => ({
      ...c,
      fellow: { ...c.fellow, actions: c.fellow.actions.map((action) => (action.id === id ? { ...action, ...patch } : action)) },
    }));
  }

  function removeAction(id: string) {
    update((c) => ({ ...c, fellow: { ...c.fellow, actions: c.fellow.actions.filter((action) => action.id !== id) } }));
  }

  function yesNoField(value: boolean, onChange: (next: boolean) => void, label: string) {
    return (
      <select value={value ? 'yes' : 'no'} onChange={(event) => onChange(event.target.value === 'yes')} aria-label={label}>
        <option value="yes">{t('sheet.yes')}</option>
        <option value="no">{t('sheet.no')}</option>
      </select>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="section-fellow">
      <div className={styles.sectionHead}>
        <h3 id="section-fellow">{t('sheet.fellow')}</h3>
        <p className={styles.sectionNote}>{t('sheet.fellowIntro')}</p>
      </div>

      <p className={styles.sectionNote}>
        {race?.name ?? character.raceId} · {character.profile.gender} · {character.profile.age} ·{' '}
        {t('sheet.adventurerLevel')} {level} · {t('sheet.mp')} {mp} · {classSummary}
      </p>

      <div className={styles.subsection}>
        <label className={styles.noteField}>
          <span>{t('sheet.fellowSelfIntroduction')}</span>
          <textarea
            value={character.fellow.selfIntroduction}
            onChange={(event) => {
              updateFellow({ selfIntroduction: event.target.value });
              autoGrow(event.target);
            }}
            ref={autoGrow}
            rows={2}
            aria-label={t('sheet.fellowSelfIntroduction')}
          />
        </label>
        <label className={styles.noteField}>
          <span>{t('sheet.fellowLanguages')}</span>
          <textarea
            value={character.fellow.languages}
            onChange={(event) => {
              updateFellow({ languages: event.target.value });
              autoGrow(event.target);
            }}
            ref={autoGrow}
            rows={1}
            aria-label={t('sheet.fellowLanguages')}
          />
        </label>
        <div className={styles.inlineRow}>
          <label htmlFor="fellow-wants-experience">{t('sheet.fellowWantsExperience')}</label>
          <span id="fellow-wants-experience">
            {yesNoField(character.fellow.wantsExperience, (next) => updateFellow({ wantsExperience: next }), t('sheet.fellowWantsExperience'))}
          </span>
          <label htmlFor="fellow-wants-reward">{t('sheet.fellowWantsReward')}</label>
          <span id="fellow-wants-reward">
            {yesNoField(character.fellow.wantsReward, (next) => updateFellow({ wantsReward: next }), t('sheet.fellowWantsReward'))}
          </span>
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={character.fellow.actions.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.fellowActions')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.fellowRoll')}</th>
                <th>{t('sheet.fellowActionName')}</th>
                <th>{t('sheet.fellowDialogue')}</th>
                <th>{t('sheet.fellowValue')}</th>
                <th>{t('sheet.fellowEffect')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.fellow.actions.map((action) => (
                <tr key={action.id}>
                  <td>
                    <PrintableField value={action.roll} onChange={(e) => updateAction(action.id, { roll: e.target.value })} aria-label={t('sheet.fellowRoll')} />
                  </td>
                  <td>
                    <PrintableField value={action.name} onChange={(e) => updateAction(action.id, { name: e.target.value })} aria-label={t('sheet.fellowActionName')} />
                  </td>
                  <td>
                    <PrintableField value={action.dialogue ?? ''} onChange={(e) => updateAction(action.id, { dialogue: e.target.value })} aria-label={t('sheet.fellowDialogue')} />
                  </td>
                  <td>
                    <PrintableField value={action.value ?? ''} onChange={(e) => updateAction(action.id, { value: e.target.value })} aria-label={t('sheet.fellowValueLabel')} />
                  </td>
                  <td>
                    <PrintableField value={action.effect ?? ''} onChange={(e) => updateAction(action.id, { effect: e.target.value })} aria-label={t('sheet.fellowEffect')} />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeAction(action.id)} aria-label={`${action.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {character.fellow.actions.length === 0 && <p className={styles.empty}>{t('sheet.noFellowActions')}</p>}

      <div className={styles.rowActions}>
        <button type="button" onClick={addAction}>
          {t('sheet.addFellowAction')}
        </button>
      </div>
    </section>
  );
}

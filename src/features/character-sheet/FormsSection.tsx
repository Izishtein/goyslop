import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formOf, type FormSection } from '../../data/sections';
import type { DeathCheckRoll } from '../../lib/encounter';
import {
  deathCheckPart,
  enterForm,
  ensureParts,
  healPart,
  hurtPart,
  inForm,
  leaveForm,
  restorePart,
  scorpionBodyArtEvasion,
  sectionSheet,
  setPartBonus,
  setPartMp,
  wakePart,
} from '../../lib/forms';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import { DiceRoll } from './DiceRoll';
import { WeaponDamageRoll } from './WeaponDamageRoll';
import styles from './CharacterSheetView.module.css';
import { GameIcon } from '../../components/icons';

/**
 * The sections of a Diablo, Drake, Basilisk or Scissorscorpion (Barbarous Rage pp. 53-57, 63-64): the
 * shapeshift and its way back, each section's HP, MP and Defense from the Heritor table, its innate weapon
 * with the rolls, and the Death Check of an other section that went down.
 */
export function FormsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const form = formOf(character.raceId);
  const [amounts, setAmounts] = useState<Record<string, string>>({});
  const [magic, setMagic] = useState(false);
  const [checks, setChecks] = useState<Record<string, DeathCheckRoll>>({});

  const standing = inForm(character);
  // A Scissorscorpion has its sections from the start: their state is made the first time the sheet is open.
  const needsParts = !!form?.always && (form.sections.some((entry) => !entry.main && !character.form?.parts[entry.id]));
  useEffect(() => {
    if (needsParts) update((c) => ensureParts(c));
  }, [needsParts, update]);

  if (!form) return null;

  const minor = form.minorFromLevel !== null && adventurerLevel(character.classes) >= form.minorFromLevel;
  const evasionArt = form.always ? scorpionBodyArtEvasion(character) : null;

  function amountOf(id: string): number {
    return Math.max(0, Math.floor(Number(amounts[id])) || 0);
  }
  function clearAmount(id: string) {
    setAmounts((current) => ({ ...current, [id]: '' }));
  }
  function check(id: string) {
    const result = deathCheckPart(character, id, false);
    if (!result) return;
    setChecks((current) => ({ ...current, [id]: result.check }));
    update(() => result.character);
  }

  function row(section: FormSection) {
    const sheet = sectionSheet(character, section);
    const state = sheet.state;
    const down = !!state && state.hp <= 0;
    const name = t(`sheet.forms.sections.${section.id.replace(/-\d$/, '')}`);
    const label = `${name}${section.id.endsWith('-2') ? ' 2' : section.id.endsWith('-1') ? ' 1' : ''}`;
    const weapon = sheet.weapon;
    return (
      <tr key={section.id} data-state={state?.status}>
        <td>
          <strong>{label}</strong>
          {section.main && <div className={styles.sectionNote}>{t('sheet.forms.main')}</div>}
          {state && state.status !== 'ok' && <div className={styles.overspent}>{t(`sheet.forms.status.${state.status}`)}</div>}
        </td>
        <td className={styles.numeric}>
          {section.main ? (
            <>
              {character.hp.current} / {sheet.maxHp}
              <div className={styles.sectionNote}>{t('sheet.forms.mainVitals')}</div>
            </>
          ) : (
            <>
              <span className={down ? styles.overspent : undefined}>{state?.hp ?? sheet.maxHp}</span> / {sheet.maxHp}
            </>
          )}
        </td>
        <td className={styles.numeric}>
          {section.main ? (
            `${character.mp.current} / ${sheet.maxMp}`
          ) : (
            <>
              <input
                type="number"
                min={0}
                max={sheet.maxMp}
                value={state?.mp ?? sheet.maxMp}
                onChange={(e) => update((c) => setPartMp(c, section.id, Number(e.target.value)))}
                aria-label={`${label} MP`}
                style={{ width: '4em' }}
              />{' '}
              / {sheet.maxMp}
            </>
          )}
        </td>
        <td className={styles.numeric}>{sheet.defense === null ? t('sheet.forms.armor') : sheet.defense}</td>
        <td>
          {weapon ? (
            <>
              {weapon.name}{' '}
              <span className={styles.sectionNote}>
                {weapon.stance} · {t('sheet.power')} {weapon.power} · {t('sheet.criticalValue')} {weapon.criticalValue}
              </span>
              {!section.main && sheet.accuracy !== null && sheet.extraDamage !== null && (
                <div>
                  {t('sheet.forms.accuracy')} {sheet.accuracy + weapon.accuracy}{' '}
                  <DiceRoll modifier={sheet.accuracy + weapon.accuracy} label={`${label} ${weapon.name} ${t('sheet.forms.accuracy')}`} />{' '}
                  <WeaponDamageRoll power={weapon.power} criticalValue={weapon.criticalValue} extraDamage={sheet.extraDamage} label={`${label} ${weapon.name}`} />
                </div>
              )}
            </>
          ) : (
            '—'
          )}
        </td>
        <td>
          {section.main ? (
            evasionArt !== null && (
              <>
                {t('sheet.forms.evasion')} {evasionArt} <DiceRoll modifier={evasionArt} label={`${label} ${t('sheet.forms.evasion')}`} />
              </>
            )
          ) : (
            <>
              {t('sheet.forms.evasion')} {sheet.evasion}
              {sheet.evasion === 0 && ` (${t('sheet.forms.straight')})`} <DiceRoll modifier={sheet.evasion ?? 0} label={`${label} ${t('sheet.forms.evasion')}`} />
            </>
          )}
        </td>
        <td className={styles.controlRow}>
          {!section.main && state && (
            <>
              <input
                type="number"
                min={0}
                value={amounts[section.id] ?? ''}
                onChange={(e) => setAmounts((current) => ({ ...current, [section.id]: e.target.value }))}
                aria-label={`${label} ${t('solo.amount')}`}
                style={{ width: '4em' }}
              />{' '}
              <button
                type="button"
                onClick={() => {
                  update((c) => hurtPart(c, section.id, amountOf(section.id), !magic));
                  clearAmount(section.id);
                }}
              >
                {t('solo.hurt')}
              </button>{' '}
              <button
                type="button"
                onClick={() => {
                  update((c) => healPart(c, section.id, amountOf(section.id)));
                  clearAmount(section.id);
                }}
              >
                {t('solo.heal')}
              </button>
              {down && state.status === 'ok' && (
                <>
                  {' '}
                  <button type="button" onClick={() => check(section.id)}>
                    {t('solo.deathCheck')}
                  </button>
                </>
              )}
              {state.status === 'unconscious' && (
                <>
                  {' '}
                  <button type="button" onClick={() => update((c) => wakePart(c, section.id))}>
                    {t('sheet.forms.wake')}
                  </button>
                </>
              )}
              {state.status === 'disabled' && (
                <>
                  {' '}
                  <button type="button" onClick={() => update((c) => restorePart(c, section.id))}>
                    {t('sheet.forms.restore')}
                  </button>
                </>
              )}
              {checks[section.id] && state.status !== 'ok' && (
                <div className={styles.sectionNote} role="status">
                  {checks[section.id].dice ? `${checks[section.id].dice![0]}+${checks[section.id].dice![1]}` : t('solo.fixed')} → {checks[section.id].value} / {checks[section.id].target}
                </div>
              )}
              <details>
                <summary>{t('sheet.forms.bonus')}</summary>
                {(['hp', 'mp', 'defense'] as const).map((field) => (
                  <label key={field}>
                    {t(`sheet.forms.bonusField.${field}`)}{' '}
                    <input
                      type="number"
                      value={state.bonus[field]}
                      onChange={(e) => update((c) => setPartBonus(c, section.id, { [field]: Math.floor(Number(e.target.value)) || 0 }))}
                      aria-label={`${label} ${t(`sheet.forms.bonusField.${field}`)}`}
                      style={{ width: '4em' }}
                    />{' '}
                  </label>
                ))}
              </details>
            </>
          )}
        </td>
      </tr>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="section-forms">
      <div className={styles.sectionHead}>
        <h3 id="section-forms"><GameIcon name="section.forms" />{t('sheet.forms.title')}</h3>
        <p className={styles.sectionNote}>{form.formName ? t(`sheet.forms.formName.${form.raceId}`) : t('sheet.forms.always')}</p>
      </div>

      {!form.always && (
        <div className={styles.controlRow}>
          {!standing ? (
            <button type="button" onClick={() => update((c) => enterForm(c))}>
              {t(minor ? 'sheet.forms.enterMinor' : 'sheet.forms.enterMajor', { form: t(`sheet.forms.formName.${form.raceId}`) })}
            </button>
          ) : (
            <button type="button" onClick={() => update((c) => leaveForm(c))}>
              {t('sheet.forms.leave')}
            </button>
          )}{' '}
          <span className={styles.sectionNote}>
            {t('sheet.forms.item', { item: form.item })} · {t('sheet.forms.lock', { hours: form.lockHours })}
            {form.cooldownHours !== null && ` · ${t('sheet.forms.cooldown', { hours: form.cooldownHours })}`}
          </span>
        </div>
      )}
      <p className={styles.sectionNote}>
        {t('sheet.forms.weakPoint')}: {t(`sheet.forms.weak.${form.raceId}`)}
        {form.intelligencePenalty > 0 && standing && ` · ${t('sheet.forms.intPenalty', { points: form.intelligencePenalty })}`}
      </p>

      {standing && (
        <div className={styles.subsection}>
          <label className={styles.controlRow}>
            <input type="checkbox" checked={magic} onChange={(e) => setMagic(e.target.checked)} /> {t('solo.magicDamage')}
          </label>
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.forms.section')}</th>
                  <th>{t('sheet.hp')}</th>
                  <th>{t('sheet.mp')}</th>
                  <th>{t('sheet.defense')}</th>
                  <th>{t('sheet.forms.innate')}</th>
                  <th>{t('sheet.forms.evasion')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>{form.sections.map(row)}</tbody>
            </table>
          </div>
        </div>
      )}
      <details className={styles.controlRow}>
        <summary>{t('sheet.forms.rulesTitle')}</summary>
        <ul>
          {['hands', 'accessories', 'armor', 'mount', 'narrow', 'noHands', 'heritor'].map((key) => (
            <li key={key}>{t(`sheet.forms.rules.${key}`)}</li>
          ))}
        </ul>
      </details>
    </section>
  );
}

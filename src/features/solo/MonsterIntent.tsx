import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { rollMonsterAction, type MonsterAction } from '../../lib/monster-action';
import { oracleAtom } from '../../state/oracle';
import styles from './SoloView.module.css';

/** "What does it do now?" — a question to the oracle, answered under the monster's card. */
export function MonsterIntent({ label }: { label: string }) {
  const { t } = useTranslation();
  const chaos = useAtomValue(oracleAtom).chaos;
  const [result, setResult] = useState<MonsterAction | null>(null);

  return (
    <div className={styles.controls}>
      <button type="button" onClick={() => setResult(rollMonsterAction(chaos))} aria-label={t('solo.intent.ask', { label })}>
        {t('solo.intent.button')}
      </button>
      {result && (
        <span role="status" aria-live="polite">
          <strong>{t(`solo.intent.answer.${result.answer}`)}</strong> ({t('solo.oracle.rollLine', { roll: result.roll, chance: result.chance })})
          {result.action !== null && ` — ${t(`solo.intent.actions.${result.action}`)}${result.strong ? ` ${t('solo.intent.harder')}` : ''}`}
          {result.action === null && result.strong && ` — ${t('solo.intent.harder')}`}
          {result.extra !== null && ` · ${t('solo.intent.extra')}: ${t(`solo.intent.actions.${result.extra}`)}`}
        </span>
      )}
    </div>
  );
}

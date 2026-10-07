import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  askOracle,
  checkScene,
  clampChaos,
  eventChance,
  LIKELIHOODS,
  pushEntry,
  rollEvent,
  yesChance,
  EMPTY_ORACLE,
  type Likelihood,
  type OracleEntry,
  type RandomEvent,
} from '../../lib/oracle';
import { oracleAtom } from '../../state/oracle';
import styles from './SoloView.module.css';

function EventLine({ event }: { event: RandomEvent }) {
  const { t } = useTranslation();
  return (
    <p>
      <strong>{t('solo.oracle.eventLabel')}:</strong> {t(`solo.oracle.focus.${event.focus}`)} — {t(`solo.oracle.action.${event.action}`)} /{' '}
      {t(`solo.oracle.subject.${event.subject}`)}
    </p>
  );
}

function EntryLine({ entry }: { entry: OracleEntry }) {
  const { t } = useTranslation();
  if (entry.kind === 'question') {
    return (
      <li>
        <p>
          <strong>{t(`solo.oracle.answer.${entry.answer}`)}</strong> · {t(`solo.oracle.likelihood.${entry.likelihood}`)}, {t('solo.oracle.chaos', { chaos: entry.chaos })},{' '}
          {t('solo.oracle.rollLine', { roll: entry.roll, chance: entry.chance })}
        </p>
        {entry.event && <EventLine event={entry.event} />}
      </li>
    );
  }
  if (entry.kind === 'scene') {
    return (
      <li>
        <p>
          <strong>{t('solo.oracle.sceneN', { scene: entry.scene })}</strong> · {t(`solo.oracle.twist.${entry.twist}`)} ({t('solo.oracle.chaos', { chaos: entry.chaos })}, d10 = {entry.roll})
        </p>
        {entry.event && <EventLine event={entry.event} />}
      </li>
    );
  }
  return (
    <li>
      <EventLine event={entry.event} />
    </li>
  );
}

export function OraclePanel() {
  const { t } = useTranslation();
  const [oracle, setOracle] = useAtom(oracleAtom);
  const [likelihood, setLikelihood] = useState<Likelihood>('even');

  const setChaos = (chaos: number) => setOracle((current) => ({ ...current, chaos: clampChaos(chaos) }));
  const add = (entry: Omit<OracleEntry, 'id'>) => (state: typeof oracle) => pushEntry(state, { ...entry, id: crypto.randomUUID() } as OracleEntry);

  return (
    <section className={styles.panel} aria-labelledby="solo-oracle">
      <div className={styles.panelHead}>
        <h3 id="solo-oracle">{t('solo.oracle.title')}</h3>
        <p className={styles.note}>{t('solo.oracle.note')}</p>
      </div>

      <div className={styles.toolbar}>
        <span className={styles.round}>{t('solo.oracle.chaos', { chaos: oracle.chaos })}</span>
        <button type="button" aria-label={t('solo.oracle.chaosDown')} onClick={() => setChaos(oracle.chaos - 1)} disabled={oracle.chaos <= 1}>
          −
        </button>
        <button type="button" aria-label={t('solo.oracle.chaosUp')} onClick={() => setChaos(oracle.chaos + 1)} disabled={oracle.chaos >= 9}>
          +
        </button>
        <span className={styles.numeric}>{t('solo.oracle.eventChance', { chance: eventChance(oracle.chaos) })}</span>
        <button type="button" onClick={() => setOracle(EMPTY_ORACLE)} disabled={oracle.log.length === 0 && oracle.scene === 0 && oracle.chaos === 5}>
          {t('solo.oracle.reset')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('solo.oracle.likelihoodLabel')}
          <select value={likelihood} onChange={(e) => setLikelihood(e.target.value as Likelihood)}>
            {LIKELIHOODS.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.oracle.likelihood.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.numeric}>{t('solo.oracle.yesChance', { chance: yesChance(likelihood, oracle.chaos) })}</span>
        <button type="button" onClick={() => setOracle((state) => add(askOracle(likelihood, state.chaos))(state))}>
          {t('solo.oracle.ask')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <span className={styles.numeric}>{t('solo.oracle.scene', { scene: oracle.scene })}</span>
        <button
          type="button"
          onClick={() =>
            setOracle((state) => add(checkScene(state.scene + 1, state.chaos))({ ...state, scene: state.scene + 1 }))
          }
        >
          {t('solo.oracle.newScene')}
        </button>
        <button type="button" onClick={() => setOracle((state) => add({ kind: 'event', event: rollEvent() })(state))}>
          {t('solo.oracle.rollEvent')}
        </button>
      </div>

      {oracle.log.length === 0 ? (
        <p className={styles.note}>{t('solo.oracle.empty')}</p>
      ) : (
        <ol className={styles.oracleLog} aria-label={t('solo.oracle.log')}>
          {oracle.log.map((entry) => (
            <EntryLine key={entry.id} entry={entry} />
          ))}
        </ol>
      )}
    </section>
  );
}

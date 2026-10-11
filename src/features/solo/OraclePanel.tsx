import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isEventSource, raiseWeights } from '../../lib/campaign';
import {
  askOracle,
  CHAOS_MODES,
  chaosAfterScene,
  checkScene,
  CHOOSE_FOCUS_EVERY,
  clampChaos,
  EMPTY_ORACLE,
  eventChance,
  FOCUS_COUNT,
  interruptScene,
  LIKELIHOODS,
  pushEntry,
  rollEvent,
  yesChance,
  type ChaosMode,
  type EventOptions,
  type Likelihood,
  type OracleAnswer,
  type OracleEntry,
  type OracleState,
  type RandomEvent,
  type SceneCheck,
  type SceneEnd,
  type EventEntry,
} from '../../lib/oracle';
import { campaignAtom } from '../../state/campaign';
import { oracleAtom } from '../../state/oracle';
import styles from './SoloView.module.css';

type NewEntry = OracleAnswer | SceneCheck | EventEntry | SceneEnd;

function EventLine({ event }: { event: RandomEvent }) {
  const { t } = useTranslation();
  return (
    <p>
      <strong>{t('solo.oracle.eventLabel')}:</strong> {t(`solo.oracle.focus.${event.focus}`)}
      {event.ref && ` — ${event.ref.title} (${t(`solo.campaign.kinds.${event.ref.kind}`)})`} — {t(`solo.oracle.action.${event.action}`)} /{' '}
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
          <strong>{t('solo.oracle.sceneN', { scene: entry.scene })}</strong> · {t(`solo.oracle.twist.${entry.twist}`)} (
          {t('solo.oracle.chaos', { chaos: entry.chaos })}, {entry.roll > 0 ? `d10 = ${entry.roll}` : t('solo.oracle.noCheck')})
        </p>
        {entry.event && <EventLine event={entry.event} />}
      </li>
    );
  }
  if (entry.kind === 'sceneEnd') {
    return (
      <li>
        <p>
          <strong>{t('solo.oracle.sceneEnded', { scene: entry.scene })}</strong> · {t('solo.oracle.chaosMoved', { from: entry.from, to: entry.to })}
          {entry.controlled !== null && ` · ${t(entry.controlled ? 'solo.oracle.inControl' : 'solo.oracle.outOfControl')}`}
        </p>
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
  const [campaign, setCampaign] = useAtom(campaignAtom);
  const [likelihood, setLikelihood] = useState<Likelihood>('even');
  /** 0 = roll for the event's focus; otherwise the focus the player picked. */
  const [focus, setFocus] = useState(0);
  const [ending, setEnding] = useState(false);
  const [controlled, setControlled] = useState(true);
  const [present, setPresent] = useState<string[]>([]);

  const eventOptions = (): EventOptions => ({ journal: campaign.entries, focus: focus || null });
  const setChaos = (chaos: number) => setOracle((current) => ({ ...current, chaos: clampChaos(chaos) }));
  const add = (entry: NewEntry) => (state: OracleState) => pushEntry(state, { ...entry, id: crypto.randomUUID() } as OracleEntry);

  const candidates = campaign.entries.filter((entry) => isEventSource(entry.kind) && !entry.closed);
  const mode = oracle.chaosMode;
  const chooseFocusNow = oracle.scene > 0 && oracle.scene % CHOOSE_FOCUS_EVERY === 0;

  function finishScene() {
    const to = chaosAfterScene(mode, oracle.chaos, controlled);
    setOracle((state) =>
      add({ kind: 'sceneEnd', scene: state.scene, from: state.chaos, to, controlled: mode === 'random' ? null : controlled })({ ...state, chaos: to }),
    );
    if (present.length > 0) setCampaign((current) => raiseWeights(current, present));
    setPresent([]);
    setEnding(false);
  }

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
        <button
          type="button"
          onClick={() => setOracle((state) => ({ ...EMPTY_ORACLE, chaosMode: state.chaosMode }))}
          disabled={oracle.log.length === 0 && oracle.scene === 0 && oracle.chaos === 5}
        >
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
        <button type="button" onClick={() => setOracle((state) => add(askOracle(likelihood, state.chaos, Math.random, eventOptions()))(state))}>
          {t('solo.oracle.ask')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('solo.oracle.focusLabel')}
          <select value={focus} onChange={(e) => setFocus(Number(e.target.value))}>
            <option value={0}>{t('solo.oracle.focusRoll')}</option>
            {Array.from({ length: FOCUS_COUNT }, (_, i) => i + 1).map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.oracle.focus.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        {chooseFocusNow && <span className={styles.note}>{t('solo.oracle.chooseFocusHint', { count: CHOOSE_FOCUS_EVERY })}</span>}
      </div>

      <div className={styles.toolbar}>
        <span className={styles.numeric}>{t('solo.oracle.scene', { scene: oracle.scene })}</span>
        <button
          type="button"
          onClick={() =>
            setOracle((state) => add(checkScene(state.scene + 1, state.chaos, Math.random, eventOptions()))({ ...state, scene: state.scene + 1 }))
          }
        >
          {t('solo.oracle.newScene')}
        </button>
        <button
          type="button"
          onClick={() =>
            setOracle((state) => add(interruptScene(state.scene + 1, state.chaos, Math.random, eventOptions()))({ ...state, scene: state.scene + 1 }))
          }
        >
          {t('solo.oracle.interruptScene')}
        </button>
        <button type="button" onClick={() => setOracle((state) => add({ kind: 'event', event: rollEvent(Math.random, eventOptions()) })(state))}>
          {t('solo.oracle.rollEvent')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('solo.oracle.chaosMode')}
          <select value={mode} onChange={(e) => setOracle((state) => ({ ...state, chaosMode: e.target.value as ChaosMode }))}>
            {CHAOS_MODES.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.oracle.chaosModes.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setEnding((open) => !open)} aria-expanded={ending} disabled={oracle.scene === 0}>
          {t('solo.oracle.endScene')}
        </button>
      </div>
      <p className={styles.note}>{t(`solo.oracle.chaosModeNote.${mode}`)}</p>

      {ending && (
        <fieldset className={styles.toolbar}>
          <legend>{t('solo.oracle.endSceneTitle', { scene: oracle.scene })}</legend>
          {mode !== 'random' && (
            <label>
              <input type="checkbox" checked={controlled} onChange={(e) => setControlled(e.target.checked)} />
              {t('solo.oracle.wasInControl')}
            </label>
          )}
          <p className={styles.note}>{t('solo.oracle.whoTookPart')}</p>
          {candidates.length === 0 ? (
            <p className={styles.note}>{t('solo.oracle.nobodyToRaise')}</p>
          ) : (
            candidates.map((entry) => (
              <label key={entry.id}>
                <input
                  type="checkbox"
                  checked={present.includes(entry.id)}
                  onChange={(e) => setPresent((ids) => (e.target.checked ? [...ids, entry.id] : ids.filter((id) => id !== entry.id)))}
                />
                {entry.title} ({t(`solo.campaign.kinds.${entry.kind}`)}, {t('solo.campaign.weight', { weight: entry.weight })})
              </label>
            ))
          )}
          <button type="button" onClick={finishScene}>
            {t('solo.oracle.applyEnd')}
          </button>
        </fieldset>
      )}

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

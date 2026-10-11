import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { isEventSource, raiseWeights, updateEntry } from '../../lib/campaign';
import { plotArmor } from '../../lib/thread';
import { advanceScene } from '../../lib/keyed';
import {
  askFate,
  askOracle,
  CHAOS_FLAVORS,
  CHAOS_MODES,
  chaosAfterScene,
  checkScene,
  CHOOSE_FOCUS_EVERY,
  clampChaos,
  EMPTY_ORACLE,
  eventChance,
  fateModifier,
  FOCUS_COUNT,
  FOCUS_FEATURE,
  interruptScene,
  LIKELIHOODS,
  openingScene,
  ORACLE_METHODS,
  type OracleMethod,
  rollOpening,
  type OpeningEntry,
  PLAY_STYLES,
  pushEntry,
  rollAdjustment,
  rollEvent,
  rollThemed,
  rollWords,
  STRATEGIES,
  THEMES,
  type PlayStyle,
  type Theme,
  type ThemedEntry,
  yesChance,
  type ChaosFlavor,
  type ChaosMode,
  type EventOptions,
  type Likelihood,
  type AdjustmentEntry,
  type DiscoveryEntry,
  type OracleAnswer,
  type OracleEntry,
  type OracleState,
  type RandomEvent,
  type SceneCheck,
  type SceneEnd,
  type EventEntry,
  type KeyedEntry,
  type SceneAdjustment,
  type WordsEntry,
} from '../../lib/oracle';
import { adventureAtom } from '../../state/adventure';
import { campaignAtom } from '../../state/campaign';
import { oracleAtom } from '../../state/oracle';
import styles from './SoloView.module.css';

type NewEntry = OracleAnswer | SceneCheck | EventEntry | SceneEnd | AdjustmentEntry | WordsEntry | DiscoveryEntry | KeyedEntry | ThemedEntry | OpeningEntry;

const signed = (value: number): string => (value > 0 ? `+${value}` : String(value));

function AdjustmentLine({ adjustment }: { adjustment: SceneAdjustment }) {
  const { t } = useTranslation();
  return (
    <p>
      <strong>{t('solo.oracle.adjustmentLabel')}:</strong> {adjustment.edits.map((edit) => t(`solo.oracle.adjustments.${edit}`)).join('; ')}
    </p>
  );
}

function EventLine({ event }: { event: RandomEvent }) {
  const { t } = useTranslation();
  const [campaign, setCampaign] = useAtom(campaignAtom);
  /** "I do not know": an event about someone the story cannot fit may drop them from the log (not a thread under plot armor). */
  const target = event.ref ? campaign.entries.find((entry) => entry.kind === event.ref?.kind && entry.title === event.ref.title && !entry.closed) : undefined;
  const droppable = target !== undefined && !plotArmor(target);
  return (
    <p>
      <strong>{t('solo.oracle.eventLabel')}:</strong> {t(`solo.oracle.focus.${event.focus}`)}
      {event.ref && ` — ${event.ref.title} (${t(`solo.campaign.kinds.${event.ref.kind}`)})`}
      {event.note && ` — ${event.note}`} — {t(`solo.oracle.action.${event.action}`)} /{' '}
      {t(`solo.oracle.subject.${event.subject}`)}
      {droppable && (
        <>
          {' '}
          <button
            type="button"
            aria-label={t('solo.oracle.dontKnowFor', { title: target.title })}
            onClick={() => setCampaign((current) => updateEntry(current, target.id, { closed: true }))}
          >
            {t('solo.oracle.dontKnow')}
          </button>
        </>
      )}
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
          {entry.fate
            ? t('solo.oracle.fateLine', { a: entry.fate.dice[0], b: entry.fate.dice[1], modifier: signed(entry.fate.modifier), total: entry.fate.total })
            : t('solo.oracle.rollLine', { roll: entry.roll, chance: entry.chance })}
          {entry.asRule && ` · ${t('solo.oracle.asRuleTag')}`}
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
        {entry.adjustment && <AdjustmentLine adjustment={entry.adjustment} />}
      </li>
    );
  }
  if (entry.kind === 'discovery') {
    return (
      <li>
        <p>
          <strong>{t('solo.thread.discoveryLine', { title: entry.title })}</strong> · {t(`solo.oracle.answer.${entry.answer}`)},{' '}
          {t('solo.oracle.rollLine', { roll: entry.roll, chance: entry.chance })}
        </p>
        {entry.finds.map((find, index) => (
          <p key={index}>
            {t(`solo.thread.found.${find.result}`, { points: find.points })} (d10 + {t('solo.thread.progressWord')} = {find.total})
          </p>
        ))}
        {entry.deadEnd && <p>{t('solo.thread.deadEnd')}</p>}
        {entry.event && <EventLine event={entry.event} />}
      </li>
    );
  }
  if (entry.kind === 'opening') {
    return (
      <li>
        <p>
          <strong>{t('solo.oracle.openingLabel')}</strong>
        </p>
        {entry.parts.map((part, index) => (
          <p key={index}>
            {t(`solo.oracle.openingParts.${index}`)}: {t(`solo.oracle.themes.${part.theme}.a.${part.a}`)} / {t(`solo.oracle.themes.${part.theme}.b.${part.b}`)}
          </p>
        ))}
      </li>
    );
  }
  if (entry.kind === 'themed') {
    return (
      <li>
        <p>
          <strong>{t('solo.oracle.themedLabel', { theme: t(`solo.oracle.themes.${entry.theme}.name`) })}:</strong>{' '}
          {t(`solo.oracle.themes.${entry.theme}.a.${entry.a}`)} / {t(`solo.oracle.themes.${entry.theme}.b.${entry.b}`)}
        </p>
      </li>
    );
  }
  if (entry.kind === 'keyed') {
    return (
      <li>
        <p>
          <strong>{t('solo.adventure.keyedFired', { scene: entry.scene })}</strong> {entry.titles.join('; ')}
        </p>
      </li>
    );
  }
  if (entry.kind === 'adjustment') {
    return (
      <li>
        <AdjustmentLine adjustment={entry} />
      </li>
    );
  }
  if (entry.kind === 'words') {
    return (
      <li>
        <p>
          <strong>{t('solo.oracle.wordsLabel')}:</strong> {t(`solo.oracle.action.${entry.action}`)} {t(`solo.oracle.connector.${entry.connector}`)}{' '}
          {t(`solo.oracle.subject.${entry.subject}`)}
        </p>
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
  const [theme, setTheme] = useState<Theme>('character');
  const [ending, setEnding] = useState(false);
  const [controlled, setControlled] = useState(true);
  const [present, setPresent] = useState<string[]>([]);

  const [adventure, setAdventure] = useAtom(adventureAtom);
  const eventOptions = (): EventOptions => ({
    journal: campaign.entries,
    place: campaign.activePlace,
    focus: focus || null,
    prepared: adventure.prepared,
    features: adventure.features,
  });

  /** A new scene: check it, tick the keyed scenes, and say which of them fired. */
  function startScene(mode: 'check' | 'stuck' | 'opening') {
    const scene = oracle.scene + 1;
    const opening = mode === 'opening' ? rollOpening() : null;
    const check =
      mode === 'opening'
        ? openingScene(oracle.chaos)
        : mode === 'stuck'
          ? interruptScene(scene, oracle.chaos, Math.random, eventOptions())
          : checkScene(scene, oracle.chaos, Math.random, eventOptions());
    const { scenes, fired } = advanceScene(adventure.keyed, scene);
    if (adventure.keyed.length > 0) setAdventure((current) => ({ ...current, keyed: scenes }));
    setOracle((state) => {
      const started = add(check)({ ...state, scene });
      const next = opening ? add({ kind: 'opening', ...opening })(started) : started;
      return fired.length > 0 ? add({ kind: 'keyed', scene, titles: fired.map((keyed) => keyed.title) })(next) : next;
    });
  }
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
        <span className={styles.numeric}>{t('solo.oracle.eventChance', { chance: eventChance(oracle.chaos, oracle.chaosFlavor) })}</span>
        <button
          type="button"
          onClick={() => setOracle((state) => ({ ...EMPTY_ORACLE, chaosMode: state.chaosMode, chaosFlavor: state.chaosFlavor, method: state.method, style: state.style, ruleMode: state.ruleMode }))}
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
        <label>
          {t('solo.oracle.method')}
          <select value={oracle.method} onChange={(e) => setOracle((state) => ({ ...state, method: e.target.value as OracleMethod }))}>
            {ORACLE_METHODS.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.oracle.methods.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.numeric}>
          {oracle.method === 'fate'
            ? t('solo.oracle.fateModifier', { modifier: signed(fateModifier(likelihood, oracle.chaos, oracle.chaosFlavor)) })
            : t('solo.oracle.yesChance', { chance: yesChance(likelihood, oracle.chaos, oracle.chaosFlavor) })}
        </span>
        <label>
          <input type="checkbox" checked={oracle.ruleMode} onChange={(e) => setOracle((state) => ({ ...state, ruleMode: e.target.checked }))} />
          {t('solo.oracle.asRule')}
        </label>
        <button type="button" onClick={() => setOracle((state) => add((state.method === 'fate' ? askFate : askOracle)(likelihood, state.chaos, Math.random, { ...eventOptions(), asRule: state.ruleMode, flavor: state.chaosFlavor }))(state))}>
          {t('solo.oracle.ask')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('solo.oracle.focusLabel')}
          <select value={focus} onChange={(e) => setFocus(Number(e.target.value))}>
            <option value={0}>{t('solo.oracle.focusRoll')}</option>
            {[...Array.from({ length: FOCUS_COUNT }, (_, i) => i + 1), ...(adventure.prepared ? [FOCUS_FEATURE] : [])].map((entry) => (
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
        {oracle.scene === 0 && (
          <button type="button" onClick={() => startScene('opening')}>
            {t('solo.oracle.beginAdventure')}
          </button>
        )}
        <button type="button" onClick={() => startScene('check')}>
          {t('solo.oracle.newScene')}
        </button>
        <button type="button" onClick={() => startScene('stuck')}>
          {t('solo.oracle.interruptScene')}
        </button>
        <button type="button" onClick={() => setOracle((state) => add({ kind: 'event', event: rollEvent(Math.random, eventOptions()) })(state))}>
          {t('solo.oracle.rollEvent')}
        </button>
        <button type="button" onClick={() => setOracle((state) => add({ kind: 'adjustment', ...rollAdjustment() })(state))}>
          {t('solo.oracle.rollAdjustment')}
        </button>
        <button type="button" onClick={() => setOracle((state) => add({ kind: 'words', ...rollWords() })(state))}>
          {t('solo.oracle.digDeeper')}
        </button>
        <label>
          {t('solo.oracle.themeLabel')}
          <select value={theme} onChange={(e) => setTheme(e.target.value as Theme)}>
            {THEMES.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.oracle.themes.${entry}.name`)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setOracle((state) => add({ kind: 'themed', ...rollThemed(theme) })(state))}>
          {t('solo.oracle.rollTheme')}
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
        <label>
          {t('solo.oracle.style')}
          <select value={oracle.style} onChange={(e) => setOracle((state) => ({ ...state, style: e.target.value as PlayStyle }))}>
            {PLAY_STYLES.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.oracle.styles.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        <button type="button" onClick={() => setEnding((open) => !open)} aria-expanded={ending} disabled={oracle.scene === 0}>
          {t('solo.oracle.endScene')}
        </button>
      </div>
      <p className={styles.note}>{t(`solo.oracle.chaosModeNote.${mode}`)}</p>
      <div className={styles.toolbar}>
        <label>
          {t('solo.oracle.flavor')}
          <select value={oracle.chaosFlavor} onChange={(e) => setOracle((state) => ({ ...state, chaosFlavor: e.target.value as ChaosFlavor }))}>
            {CHAOS_FLAVORS.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.oracle.flavors.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        <span className={styles.note}>{t(`solo.oracle.flavorNote.${oracle.chaosFlavor}`)}</span>
      </div>

      {ending && (
        <fieldset className={styles.toolbar}>
          <legend>{t('solo.oracle.endSceneTitle', { scene: oracle.scene })}</legend>
          {mode !== 'random' && (
            <label>
              <input type="checkbox" checked={controlled} onChange={(e) => setControlled(e.target.checked)} />
              {t('solo.oracle.wasInControl')}
            </label>
          )}
          <p className={styles.note}>{t('solo.oracle.strategiesHead')}</p>
          <ul>
            {STRATEGIES[oracle.style].map((strategy) => (
              <li key={strategy}>{t(`solo.oracle.strategies.${strategy}`)}</li>
            ))}
          </ul>
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

      <details>
        <summary>{t('solo.oracle.tipsTitle')}</summary>
        <ul>
          {['dontKnow', 'twoQuestions', 'yes', 'no', 'exceptional', 'tension', 'connectors', 'verify', 'reliable', 'goWithIt', 'extraKnowledge'].map((tip) => (
            <li key={tip}>{t(`solo.oracle.tips.${tip}`)}</li>
          ))}
        </ul>
      </details>

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

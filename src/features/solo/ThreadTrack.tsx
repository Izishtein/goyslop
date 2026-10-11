import { useAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { updateEntry, type CampaignEntry } from '../../lib/campaign';
import { FOCUS_SITUATION, pushEntry, rollEvent, type NewOracleEntry, type OracleEntry } from '../../lib/oracle';
import {
  addFlashpoint,
  addProgress,
  applyDiscovery,
  discoveryCheck,
  flashpointDue,
  plotArmor,
  STEP_POINTS,
  TRACK_SIZES,
} from '../../lib/thread';
import { campaignAtom } from '../../state/campaign';
import { oracleAtom } from '../../state/oracle';
import styles from './SoloView.module.css';

/** The progress track of one thread of the campaign log: steps, flashpoints and discovery checks. */
export function ThreadTrack({ entry }: { entry: CampaignEntry }) {
  const { t } = useTranslation();
  const [campaign, setCampaign] = useAtom(campaignAtom);
  const [oracle, setOracle] = useAtom(oracleAtom);
  /** The scene in which an exceptional "no" closed the searching; searching reopens with the next scene. */
  const [deadEndScene, setDeadEndScene] = useState<number | null>(null);

  const tracked = entry.trackSize > 0;
  const full = tracked && !plotArmor(entry);
  const due = flashpointDue(entry);
  const searchLocked = deadEndScene === oracle.scene;

  const patch = ({ trackSize, progress, flashpoints }: Pick<CampaignEntry, 'trackSize' | 'progress' | 'flashpoints'>) =>
    setCampaign((current) => updateEntry(current, entry.id, { trackSize, progress, flashpoints }));
  const log = (item: NewOracleEntry) =>
    setOracle((state) => pushEntry(state, { ...item, id: crypto.randomUUID() } as OracleEntry));

  function flashpoint() {
    patch(addFlashpoint(entry, STEP_POINTS));
    // A flashpoint is an event about "the current situation" that involves this thread in a dramatic way.
    const event = { ...rollEvent(Math.random, { focus: FOCUS_SITUATION }), ref: { kind: entry.kind, title: entry.title } };
    log({ kind: 'event', event });
  }

  function discover() {
    const check = discoveryCheck(entry, oracle.chaos, Math.random, { journal: campaign.entries });
    patch(applyDiscovery(entry, check));
    if (check.deadEnd) setDeadEndScene(oracle.scene);
    const { question } = check;
    log({
      kind: 'discovery',
      title: entry.title,
      chaos: question.chaos,
      chance: question.chance,
      roll: question.roll,
      answer: question.answer,
      deadEnd: check.deadEnd,
      finds: check.finds.map(({ d10, total, result }) => ({ d10, total, result: result.kind, points: result.points })),
      event: question.event,
    });
  }

  if (entry.closed) {
    return full ? <p className={styles.note}>{t('solo.thread.session')}</p> : null;
  }

  return (
    <div className={styles.controls}>
      <label>
        {t('solo.thread.track')}
        <select
          value={entry.trackSize}
          aria-label={t('solo.thread.trackFor', { title: entry.title })}
          onChange={(e) => patch({ trackSize: Number(e.target.value), progress: 0, flashpoints: 0 })}
        >
          {TRACK_SIZES.map((size) => (
            <option key={size} value={size}>
              {size === 0 ? t('solo.thread.noTrack') : t('solo.thread.points', { count: size })}
            </option>
          ))}
        </select>
      </label>
      {tracked && (
        <>
          <progress max={entry.trackSize} value={entry.progress} aria-label={t('solo.thread.progressOf', { title: entry.title })} />
          <span className={styles.numeric}>{t('solo.thread.progress', { progress: entry.progress, size: entry.trackSize })}</span>
          {!full && (
            <>
              <button type="button" onClick={() => patch(addProgress(entry, STEP_POINTS))}>
                {t('solo.thread.step', { points: STEP_POINTS, title: entry.title })}
              </button>
              <button type="button" onClick={flashpoint}>
                {t(due ? 'solo.thread.flashpointDue' : 'solo.thread.flashpoint', { points: STEP_POINTS, title: entry.title })}
              </button>
              <button type="button" onClick={discover} disabled={searchLocked}>
                {t('solo.thread.discover', { title: entry.title })}
              </button>
            </>
          )}
          <span className={styles.note}>
            {full ? t('solo.thread.conclusion') : due ? t('solo.thread.dueNote') : t('solo.thread.armorHint')}
            {searchLocked && ` ${t('solo.thread.deadEnd')}`}
          </span>
        </>
      )}
    </div>
  );
}

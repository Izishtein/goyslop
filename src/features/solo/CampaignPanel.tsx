import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  addEntry,
  ENTRY_KINDS,
  filterEntries,
  isSettleable,
  removeEntry,
  setDay,
  TEXT_LIMIT,
  TITLE_LIMIT,
  updateEntry,
  type EntryKind,
  type KindFilter,
} from '../../lib/campaign';
import { calendarOf } from '../../lib/calendar';
import { campaignAtom } from '../../state/campaign';
import { oracleAtom } from '../../state/oracle';
import styles from './SoloView.module.css';

export function CampaignPanel() {
  const { t } = useTranslation();
  const [campaign, setCampaign] = useAtom(campaignAtom);
  const oracle = useAtomValue(oracleAtom);
  const [kind, setKind] = useState<EntryKind>('scene');
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [filter, setFilter] = useState<KindFilter>('all');
  const [search, setSearch] = useState('');

  const date = calendarOf(campaign.day);
  const shown = filterEntries(campaign.entries, filter, search);

  function add() {
    if (!title.trim()) return;
    setCampaign((current) => addEntry(current, { kind, title, text, scene: oracle.scene }, crypto.randomUUID()));
    setTitle('');
    setText('');
  }

  return (
    <section className={styles.panel} aria-labelledby="solo-campaign">
      <div className={styles.panelHead}>
        <h3 id="solo-campaign">{t('solo.campaign.title')}</h3>
        <p className={styles.note}>{t('solo.campaign.note')}</p>
      </div>

      <div className={styles.toolbar}>
        <span className={styles.round}>{t('solo.campaign.day', { day: campaign.day })}</span>
        <span className={styles.numeric}>
          {t('solo.hex.date', { year: date.year, month: date.month, day: date.dayOfMonth, season: t(`solo.hex.seasons.${date.season}`) })}
          {date.festival && ` · ${t(`solo.hex.festivals.${date.festival}`)}`}
        </span>
        <button type="button" onClick={() => setCampaign((current) => setDay(current, current.day + 1))}>
          {t('solo.campaign.nextDay')}
        </button>
        <button type="button" onClick={() => setCampaign((current) => setDay(current, current.day - 1))} disabled={campaign.day <= 1}>
          {t('solo.campaign.prevDay')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('solo.campaign.kind')}
          <select value={kind} onChange={(e) => setKind(e.target.value as EntryKind)}>
            {ENTRY_KINDS.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.campaign.kinds.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('solo.campaign.entryTitle')}
          <input type="text" value={title} maxLength={TITLE_LIMIT} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          {t('solo.campaign.entryText')}
          <textarea value={text} maxLength={TEXT_LIMIT} rows={2} onChange={(e) => setText(e.target.value)} />
        </label>
        <button type="button" onClick={add} disabled={!title.trim()}>
          {t('solo.campaign.add')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('solo.campaign.show')}
          <select value={filter} onChange={(e) => setFilter(e.target.value as KindFilter)}>
            <option value="all">{t('solo.campaign.all')}</option>
            <option value="open">{t('solo.campaign.open')}</option>
            {ENTRY_KINDS.map((entry) => (
              <option key={entry} value={entry}>
                {t(`solo.campaign.kinds.${entry}`)}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('solo.campaign.search')}
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} />
        </label>
      </div>

      {shown.length === 0 ? (
        <p className={styles.note}>{t(campaign.entries.length === 0 ? 'solo.campaign.empty' : 'solo.campaign.nothingShown')}</p>
      ) : (
        <ul className={styles.oracleLog} aria-label={t('solo.campaign.list')}>
          {shown.map((entry) => (
            <li key={entry.id}>
              <p>
                <strong style={entry.closed ? { textDecoration: 'line-through' } : undefined}>{entry.title}</strong> ·{' '}
                {t(`solo.campaign.kinds.${entry.kind}`)} · {t('solo.campaign.stamp', { day: entry.day, scene: entry.scene })}
              </p>
              <textarea
                aria-label={t('solo.campaign.editText', { title: entry.title })}
                value={entry.text}
                maxLength={TEXT_LIMIT}
                rows={2}
                onChange={(e) => setCampaign((current) => updateEntry(current, entry.id, { text: e.target.value }))}
              />
              <div className={styles.controls}>
                {isSettleable(entry.kind) && (
                  <button type="button" onClick={() => setCampaign((current) => updateEntry(current, entry.id, { closed: !entry.closed }))}>
                    {t(entry.closed ? 'solo.campaign.reopen' : entry.kind === 'threat' ? 'solo.campaign.settleThreat' : 'solo.campaign.settleThread')}
                  </button>
                )}
                <button
                  type="button"
                  aria-label={t('solo.campaign.removeEntry', { title: entry.title })}
                  onClick={() => setCampaign((current) => removeEntry(current, entry.id))}
                >
                  {t('solo.remove')}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

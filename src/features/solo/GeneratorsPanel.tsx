import { useSetAtom } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { addEntry, type EntryKind } from '../../lib/campaign';
import {
  joinName,
  rollNpc,
  rollSettlement,
  rollTavern,
  type GeneratedName,
  type GeneratedNpc,
  type GeneratedSettlement,
  type GeneratedTavern,
} from '../../lib/generators';
import { campaignAtom } from '../../state/campaign';
import styles from './SoloView.module.css';

type Result =
  | { kind: 'npc'; value: GeneratedNpc }
  | { kind: 'tavern'; value: GeneratedTavern }
  | { kind: 'settlement'; value: GeneratedSettlement };

/** A line without its closing full stop, to be set inside another sentence. */
const plain = (line: string): string => line.replace(/.$/, '');

export function GeneratorsPanel() {
  const { t } = useTranslation();
  const setCampaign = useSetAtom(campaignAtom);
  const [result, setResult] = useState<Result | null>(null);
  const [logged, setLogged] = useState(false);

  const name = (value: GeneratedName) =>
    joinName({
      start: t(`solo.gen.nameStart.${value.start}`),
      middle: value.middle === null ? null : t(`solo.gen.nameMiddle.${value.middle}`),
      end: t(`solo.gen.nameEnd.${value.end}`),
    });

  const npcLines = (npc: GeneratedNpc): string[] => [
    `${name(npc.name)} — ${t(`solo.gen.occupation.${npc.occupation}`)}`,
    t('solo.gen.line.trait', { text: t(`solo.gen.trait.${npc.trait}`) }),
    t('solo.gen.line.want', { text: t(`solo.gen.want.${npc.want}`) }),
    t('solo.gen.line.secret', { text: t(`solo.gen.secret.${npc.secret}`) }),
  ];

  const tavernTitle = (tavern: GeneratedTavern) => t('solo.gen.tavernName', { adjective: t(`solo.gen.tavernAdjective.${tavern.adjective}`), noun: t(`solo.gen.tavernNoun.${tavern.noun}`) });
  const tavernLines = (tavern: GeneratedTavern): string[] => [
    tavernTitle(tavern),
    t('solo.gen.line.keeper', { name: name(tavern.keeper) }),
    t('solo.gen.line.specialty', { text: t(`solo.gen.specialty.${tavern.specialty}`) }),
    t('solo.gen.line.patron', { text: t(`solo.gen.patron.${tavern.patron}`) }),
    t('solo.gen.line.rumor', { text: t(`solo.gen.rumor.${tavern.rumor}`) }),
  ];

  const settlementLines = (settlement: GeneratedSettlement): string[] => [
    name(settlement.name),
    t('solo.gen.line.knownFor', { text: t(`solo.gen.knownFor.${settlement.knownFor}`) }),
    t('solo.gen.line.trouble', { text: t(`solo.gen.trouble.${settlement.trouble}`) }),
    t('solo.gen.line.notable', { text: npcLines(settlement.notable).map(plain).join('; ') }),
    t('solo.gen.line.inn', { text: tavernLines(settlement.tavern).map(plain).join('; ') }),
  ];

  const lines = !result ? [] : result.kind === 'npc' ? npcLines(result.value) : result.kind === 'tavern' ? tavernLines(result.value) : settlementLines(result.value);

  function toLog() {
    if (!result) return;
    const kind: EntryKind = result.kind === 'npc' ? 'npc' : 'scene';
    const [title, ...rest] = lines;
    setCampaign((current) => addEntry(current, { kind, title, text: rest.join('\n'), scene: 0 }, crypto.randomUUID()));
    setLogged(true);
  }

  function roll(next: Result) {
    setResult(next);
    setLogged(false);
  }

  return (
    <section className={styles.panel} aria-labelledby="solo-gen">
      <div className={styles.panelHead}>
        <h3 id="solo-gen">{t('solo.gen.title')}</h3>
        <p className={styles.note}>{t('solo.gen.note')}</p>
      </div>
      <div className={styles.toolbar}>
        <button type="button" onClick={() => roll({ kind: 'npc', value: rollNpc() })}>
          {t('solo.gen.npc')}
        </button>
        <button type="button" onClick={() => roll({ kind: 'tavern', value: rollTavern() })}>
          {t('solo.gen.tavern')}
        </button>
        <button type="button" onClick={() => roll({ kind: 'settlement', value: rollSettlement() })}>
          {t('solo.gen.settlement')}
        </button>
      </div>
      {result && (
        <div className={styles.report} role="status">
          {lines.map((line, index) => (
            <p key={index}>{index === 0 ? <strong>{line}</strong> : line}</p>
          ))}
          <button type="button" onClick={toLog} disabled={logged}>
            {logged ? t('solo.gen.logged') : t('solo.gen.toLog')}
          </button>
        </div>
      )}
    </section>
  );
}

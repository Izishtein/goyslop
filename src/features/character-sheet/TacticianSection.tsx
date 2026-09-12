import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { tacticianSlots } from '../../lib/formulas/requirements';
import { getManeuver, getStratagem, listManeuversByLevel, listStratagemsByLevel } from '../../data/tactician';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownManeuver, KnownStratagem } from '../../types/character';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

const STRATAGEM_LEVELS = [1, 5, 10] as const;
const MANEUVER_LEVELS = [1, 5] as const;

function tacticianLevel(character: Character): number {
  return character.classes.filter((entry) => entry.classId === 'tactician').reduce((max, entry) => Math.max(max, entry.level), 0);
}

export function TacticianSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [stratagemPick, setStratagemPick] = useState('');
  const [maneuverPick, setManeuverPick] = useState('');

  const level = tacticianLevel(character);
  const used = character.stratagems.length + character.maneuvers.length;
  const slots = tacticianSlots(level);
  const knownStratagems = new Set(character.stratagems.map((s) => s.name));
  const knownManeuvers = new Set(character.maneuvers.map((m) => m.name));

  /* The Strategist Insignia this class needs has no use outside it, so the section stays
     hidden for everyone else — a saved entry keeps it reachable after a class change. */
  const show = level > 0 || character.stratagems.length > 0 || character.maneuvers.length > 0;
  if (!show) return null;

  function setStratagems(next: (stratagems: KnownStratagem[]) => KnownStratagem[]) {
    update((c) => ({ ...c, stratagems: next(c.stratagems) }));
  }
  function updateStratagem(id: string, patch: Partial<KnownStratagem>) {
    setStratagems((stratagems) => stratagems.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }
  function removeStratagem(id: string) {
    setStratagems((stratagems) => stratagems.filter((s) => s.id !== id));
  }
  function addStratagemFromCatalog() {
    const found = getStratagem(stratagemPick);
    if (!found) return;
    setStratagems((stratagems) => [...stratagems, { id: crypto.randomUUID(), name: found.name, type: found.type, rank: found.rank, notes: '' }]);
    setStratagemPick('');
  }

  function setManeuvers(next: (maneuvers: KnownManeuver[]) => KnownManeuver[]) {
    update((c) => ({ ...c, maneuvers: next(c.maneuvers) }));
  }
  function updateManeuver(id: string, patch: Partial<KnownManeuver>) {
    setManeuvers((maneuvers) => maneuvers.map((m) => (m.id === id ? { ...m, ...patch } : m)));
  }
  function removeManeuver(id: string) {
    setManeuvers((maneuvers) => maneuvers.filter((m) => m.id !== id));
  }
  function addManeuverFromCatalog() {
    const found = getManeuver(maneuverPick);
    if (!found) return;
    setManeuvers((maneuvers) => [...maneuvers, { id: crypto.randomUUID(), name: found.name, notes: '' }]);
    setManeuverPick('');
  }

  function setEdge(value: number) {
    update((c) => ({ ...c, tacticianEdge: Math.max(0, value) }));
  }

  return (
    <section className={styles.section} aria-labelledby="section-tactician">
      <div className={styles.sectionHead}>
        <h3 id="section-tactician">{t('sheet.tacticianStratagems')}</h3>
        <p className={styles.sectionNote}>{level > 0 ? t('sheet.tacticianLevel', { level }) : t('sheet.noTacticianClass')}</p>
      </div>

      <label className={styles.field}>
        <span>{t('sheet.edge')}</span>
        <input type="number" min={0} value={character.tacticianEdge} onChange={(e) => setEdge(Number(e.target.value))} aria-label={t('sheet.edge')} />
      </label>

      <p className={styles.sectionNote}>
        {t('sheet.tacticianSlots')}: <span className={`${styles.numeric} ${used > slots ? styles.overspent : ''}`}>({used} / {slots})</span>
      </p>

      <div className={styles.subsection} data-print-empty={character.stratagems.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.stratagems')}</h4>

        {character.stratagems.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.stratagemType')}</th>
                  <th>{t('sheet.stratagemRank')}</th>
                  <th>{t('sheet.artNote')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {character.stratagems.map((s) => (
                  <tr key={s.id}>
                    <td>{s.name}</td>
                    <td>{t(`sheet.stratagemTypeName.${s.type}`)}</td>
                    <td className={styles.numeric}>{s.rank}</td>
                    <td>
                      <PrintableField value={s.notes} onChange={(e) => updateStratagem(s.id, { notes: e.target.value })} aria-label={t('sheet.artNote')} />
                    </td>
                    <td>
                      <button type="button" onClick={() => removeStratagem(s.id)} aria-label={`${s.name} ${t('sheet.remove')}`}>
                        {t('sheet.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${styles.inlineRow} ${styles.controlRow}`}>
          <label htmlFor="add-stratagem">{t('sheet.addStratagemFromCatalog')}</label>
          <select id="add-stratagem" value={stratagemPick} onChange={(e) => setStratagemPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {STRATAGEM_LEVELS.map((stratagemLevel) => (
              <optgroup
                key={stratagemLevel}
                label={`${t('sheet.levelRequired', { level: stratagemLevel })}${stratagemLevel > level ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
              >
                {listStratagemsByLevel(stratagemLevel).map((entry) => (
                  <option key={entry.id} value={entry.id} disabled={knownStratagems.has(entry.name)}>
                    {entry.name} — {t(`sheet.stratagemTypeName.${entry.type}`)}, {t('sheet.stratagemRank')} {entry.rank}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addStratagemFromCatalog} disabled={!stratagemPick}>
            {t('sheet.addFromCatalog')}
          </button>
        </div>
      </div>

      <div className={styles.subsection} data-print-empty={character.maneuvers.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.maneuvers')}</h4>

        {character.maneuvers.length > 0 && (
          <div className={styles.tableWrap}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th>{t('sheet.name')}</th>
                  <th>{t('sheet.artNote')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {character.maneuvers.map((m) => (
                  <tr key={m.id}>
                    <td>{m.name}</td>
                    <td>
                      <PrintableField value={m.notes} onChange={(e) => updateManeuver(m.id, { notes: e.target.value })} aria-label={t('sheet.artNote')} />
                    </td>
                    <td>
                      <button type="button" onClick={() => removeManeuver(m.id)} aria-label={`${m.name} ${t('sheet.remove')}`}>
                        {t('sheet.remove')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className={`${styles.inlineRow} ${styles.controlRow}`}>
          <label htmlFor="add-maneuver">{t('sheet.addManeuverFromCatalog')}</label>
          <select id="add-maneuver" value={maneuverPick} onChange={(e) => setManeuverPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {MANEUVER_LEVELS.map((maneuverLevel) => (
              <optgroup
                key={maneuverLevel}
                label={`${t('sheet.levelRequired', { level: maneuverLevel })}${maneuverLevel > level ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
              >
                {listManeuversByLevel(maneuverLevel).map((entry) => (
                  <option
                    key={entry.id}
                    value={entry.id}
                    disabled={knownManeuvers.has(entry.name)}
                    title={entry.prerequisite ? `${t('sheet.stuntPrerequisite')}: ${entry.prerequisite}` : undefined}
                  >
                    {entry.name}
                    {entry.prerequisite ? ` (${t('sheet.stuntPrerequisite')}: ${entry.prerequisite})` : ''}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button type="button" onClick={addManeuverFromCatalog} disabled={!maneuverPick}>
            {t('sheet.addFromCatalog')}
          </button>
        </div>
      </div>
    </section>
  );
}

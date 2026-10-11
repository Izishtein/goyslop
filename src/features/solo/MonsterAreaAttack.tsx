import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { Monster } from '../../data/monsters';
import {
  painfulStrikeOf,
  resolveAttack,
  rollEvasion,
  rollMonsterAttack,
  rollMonsterDamage,
  withPainfulStrike,
  type EvasionRoll,
  type MonsterAttackRoll,
  type MonsterDamageRoll,
} from '../../lib/encounter';
import { characterDefense, characterEvasion } from '../../lib/formulas/character-defense';
import { areaAttacksOf } from '../../lib/monster-skills';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { partyAtom } from '../../state/party';
import styles from './SoloView.module.css';

interface Row {
  id: string;
  name: string;
  evasion: EvasionRoll;
  hit: boolean;
  damage: MonsterDamageRoll | null;
  total: number;
  defense: number;
  landed: number;
}

interface Report {
  section: string;
  skill: string;
  attack: MonsterAttackRoll;
  rows: Row[];
}

/**
 * [Cleave I/II] and Tail Sweep: one Accuracy check against every character the monster reaches, each
 * answering with its own Evasion check, and damage rolled separately for each one hit. The targets are
 * the open character and the Fellows of the party.
 */
export function MonsterAreaAttack({ monster, fixed }: { monster: Monster; fixed: boolean }) {
  const { t } = useTranslation();
  const [characters, setCharacters] = useAtom(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const party = useAtomValue(partyAtom);
  const [skill, setSkill] = useState('');
  const [picked, setPicked] = useState<string[]>([]);
  const [report, setReport] = useState<Report | null>(null);
  const [applied, setApplied] = useState<string[]>([]);

  const attacks = areaAttacksOf(monster);
  const ids = [...new Set([activeId, ...party].filter((id): id is string => !!id))];
  const roster = ids.flatMap((id) => characters.find((entry) => entry.id === id) ?? []);
  if (attacks.length === 0 || roster.length < 2) return null;

  const area = attacks.find((entry) => entry.name === skill) ?? attacks[0];
  const chosen = roster.filter((entry) => picked.includes(entry.id)).slice(0, area.max);

  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  function run() {
    const section = monster.sections[area.sectionIndex];
    const attack = rollMonsterAttack(section, fixed);
    if (!attack) return;
    const painful = painfulStrikeOf(monster);
    const rows = chosen.map((target): Row => {
      const evasion = rollEvasion(characterEvasion(target), fixed);
      const hit = resolveAttack(attack, evasion);
      const struck = hit ? rollMonsterDamage(section, fixed) : null;
      const rolled = struck ? withPainfulStrike(struck, painful) : null;
      const total = rolled ? Math.max(0, rolled.total + area.damage) : 0;
      const defense = characterDefense(target);
      return { id: target.id, name: target.name, evasion, hit, damage: rolled, total, defense, landed: rolled ? Math.max(0, total - defense) : 0 };
    });
    setReport({ section: section.style, skill: area.name, attack, rows });
    setApplied([]);
  }

  function apply(row: Row) {
    setCharacters((current) => current.map((entry) => (entry.id === row.id ? { ...entry, hp: { current: entry.hp.current - row.landed } } : entry)));
    setApplied((current) => [...current, row.id]);
  }

  const dice = (pair: [number, number] | null) => (pair && pair[0] ? `${pair[0]}+${pair[1]}` : t('solo.fixed'));

  return (
    <div className={styles.section} role="group" aria-label={t('solo.areaAttack.title')}>
      <div className={styles.sectionHead}>
        <strong>{t('solo.areaAttack.title')}</strong>
      </div>
      <div className={styles.controls}>
        {attacks.length > 1 && (
          <select aria-label={t('solo.areaAttack.skill')} value={area.name} onChange={(event) => setSkill(event.target.value)}>
            {attacks.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name}
              </option>
            ))}
          </select>
        )}
        <span className={styles.numeric}>
          {t('solo.areaAttack.reach', { max: area.max, damage: area.damage === 0 ? '' : ` (${area.damage > 0 ? '+' : ''}${area.damage})` })}
          {area.restriction && ` · ${t('solo.areaAttack.consecutive')}`}
        </span>
      </div>
      <div className={styles.controls}>
        {roster.map((entry) => {
          const on = chosen.some((candidate) => candidate.id === entry.id);
          return (
            <label key={entry.id} className={styles.inline}>
              <input type="checkbox" checked={on} disabled={!on && chosen.length >= area.max} onChange={() => toggle(entry.id)} />
              {entry.name}
            </label>
          );
        })}
        <button type="button" onClick={run} disabled={chosen.length === 0}>
          {t('solo.areaAttack.attack', { name: area.name })}
        </button>
      </div>
      {report && (
        <div className={styles.report} role="status" aria-live="polite">
          <p>
            {report.skill} ({report.section}): {t('solo.attackLine', { roll: dice(report.attack.dice), value: report.attack.successValue })}
            {report.attack.outcome === 'fumble' && ` — ${t('solo.fumble')}`}
            {report.attack.outcome === 'critical' && ` — ${t('solo.autoHit')}`}
          </p>
          {report.rows.map((row) => (
            <p key={row.id}>
              <strong>{row.name}</strong>: {t('solo.evasionLine', { roll: dice(row.evasion.dice), value: row.evasion.value })} — {row.hit ? t('solo.hit') : t('solo.miss')}
              {row.damage && (
                <>
                  {'. '}
                  {t('solo.damageLine', { roll: dice(row.damage.dice), modifier: row.damage.modifier + area.damage, total: row.total, defense: row.defense, landed: row.landed })}
                  {row.landed > 0 && (
                    <>
                      {' '}
                      <button type="button" onClick={() => apply(row)} disabled={applied.includes(row.id)}>
                        {applied.includes(row.id) ? t('solo.applied') : t('solo.applyDamage', { landed: row.landed, name: row.name })}
                      </button>
                    </>
                  )}
                </>
              )}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

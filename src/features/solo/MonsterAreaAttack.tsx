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
import { areaAttacksOf, areaDeclarationsOf, declarationRecipient } from '../../lib/monster-skills';
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
  /** The declaration's damage bonus fell on this one of those hit. */
  boosted: boolean;
}

interface Report {
  section: string;
  skill: string;
  declaration: string | null;
  /** What the declared feat adds to the one target it fell on. */
  bonus: number;
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
  const [declared, setDeclared] = useState('');
  const [report, setReport] = useState<Report | null>(null);
  const [applied, setApplied] = useState<string[]>([]);

  const attacks = areaAttacksOf(monster);
  const ids = [...new Set([activeId, ...party].filter((id): id is string => !!id))];
  const roster = ids.flatMap((id) => characters.find((entry) => entry.id === id) ?? []);
  if (attacks.length === 0 || roster.length < 2) return null;

  const area = attacks.find((entry) => entry.name === skill) ?? attacks[0];
  const chosen = roster.filter((entry) => picked.includes(entry.id)).slice(0, area.max);
  const declarations = areaDeclarationsOf(monster, area.sectionIndex);
  const declaration = declarations.find((entry) => entry.name === declared);

  function toggle(id: string) {
    setPicked((current) => (current.includes(id) ? current.filter((entry) => entry !== id) : [...current, id]));
  }

  function run() {
    const section = monster.sections[area.sectionIndex];
    const base = rollMonsterAttack(section, fixed);
    if (!base) return;
    // a declared feat changes the one Accuracy check; its damage goes to a single target of those hit
    const attack = declaration ? { ...base, successValue: base.successValue + declaration.accuracy } : base;
    const painful = painfulStrikeOf(monster);
    const checks = chosen.map((target) => {
      const evasion = rollEvasion(characterEvasion(target), fixed);
      return { target, evasion, hit: resolveAttack(attack, evasion) };
    });
    // chosen at random from those hit, before any damage is rolled
    const hitIds = checks.filter((check) => check.hit).map((check) => check.target.id);
    const recipientIndex = declaration && declaration.damage !== 0 ? declarationRecipient(hitIds.length) : null;
    const recipient = recipientIndex === null ? null : hitIds[recipientIndex];
    const rows = checks.map(({ target, evasion, hit }): Row => {
      const struck = hit ? rollMonsterDamage(section, fixed) : null;
      const rolled = struck ? withPainfulStrike(struck, painful) : null;
      const boosted = !!rolled && target.id === recipient;
      const total = rolled ? Math.max(0, rolled.total + area.damage + (boosted && declaration ? declaration.damage : 0)) : 0;
      const defense = characterDefense(target);
      return { id: target.id, name: target.name, evasion, hit, damage: rolled, total, defense, landed: rolled ? Math.max(0, total - defense) : 0, boosted };
    });
    setReport({ section: section.style, skill: area.name, declaration: declaration?.name ?? null, bonus: declaration?.damage ?? 0, attack, rows });
    setApplied([]);
    setDeclared('');
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
        {declarations.length > 0 && (
          <select aria-label={t('solo.areaAttack.declaration')} value={declared} onChange={(event) => setDeclared(event.target.value)}>
            <option value="">{t('solo.noDeclaration')}</option>
            {declarations.map((entry) => (
              <option key={entry.name} value={entry.name}>
                {entry.name} ({t('solo.declarationEffect', { accuracy: entry.accuracy >= 0 ? '+' + entry.accuracy : entry.accuracy, damage: entry.damage >= 0 ? '+' + entry.damage : entry.damage })})
              </option>
            ))}
          </select>
        )}
        <button type="button" onClick={run} disabled={chosen.length === 0}>
          {t('solo.areaAttack.attack', { name: area.name })}
        </button>
      </div>
      {report && (
        <div className={styles.report} role="status" aria-live="polite">
          <p>
            {report.skill} ({report.section}): {report.declaration && `[${report.declaration}] `}{t('solo.attackLine', { roll: dice(report.attack.dice), value: report.attack.successValue })}
            {report.attack.outcome === 'fumble' && ` — ${t('solo.fumble')}`}
            {report.attack.outcome === 'critical' && ` — ${t('solo.autoHit')}`}
          </p>
          {report.rows.map((row) => (
            <p key={row.id}>
              <strong>{row.name}</strong>: {t('solo.evasionLine', { roll: dice(row.evasion.dice), value: row.evasion.value })} — {row.hit ? t('solo.hit') : t('solo.miss')}
              {row.damage && (
                <>
                  {'. '}
                  {row.boosted && `[${report.declaration}] ${t('solo.areaAttack.boosted')} `}
                  {t('solo.damageLine', { roll: dice(row.damage.dice), modifier: row.damage.modifier + area.damage + (row.boosted ? report.bonus : 0), total: row.total, defense: row.defense, landed: row.landed })}
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

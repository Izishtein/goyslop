import { useAtom, useAtomValue } from 'jotai';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { getClass } from '../../data/classes';
import { isValuePair, type Monster } from '../../data/monsters';
import { damageSection, isDown, numberOf, rollD6, rollEvasion, type EncounterMonster } from '../../lib/encounter';
import { fellowActionFor, fellowAttack, fellowValue } from '../../lib/fellow';
import { rollWeaponDamage, type DamageRoll } from '../../lib/formulas/damage-roll';
import { adventurerLevel } from '../../lib/formulas/character-levels';
import { activeCharacterIdAtom, charactersAtom } from '../../state/characters';
import { encounterAtom } from '../../state/encounter';
import { partyAtom } from '../../state/party';
import type { Character, FellowAction } from '../../types/character';
import styles from './SoloView.module.css';
import { useMonsters } from './useMonsters';

/** "The adventurers" of a scenario: the PC and every Fellow, six at most (CR I p. 195). */
const PARTY_LIMIT = 6;

interface FellowTurn {
  die: number;
  action: FellowAction | null;
  /** Filled once an attack has been aimed and resolved. */
  result?: {
    target: string;
    value: number;
    evasion: number;
    evasionDice: [number, number] | null;
    hit: boolean;
    damage?: DamageRoll;
    dealt?: number;
    magic: boolean;
  };
}

/** A target for a Fellow's attack: one section of one monster that is still standing. */
interface Target {
  key: string;
  monsterIndex: number;
  sectionIndex: number;
  label: string;
}

function targetsOf(monsters: EncounterMonster[], byId: Map<string, Monster>): Target[] {
  return monsters.flatMap((instance, monsterIndex) => {
    const monster = byId.get(instance.monsterId);
    if (!monster) return [];
    return monster.sections.flatMap((section, sectionIndex) =>
      isDown(instance.sections[sectionIndex]) ? [] : [{ key: `${instance.id}:${sectionIndex}`, monsterIndex, sectionIndex, label: `${instance.label} — ${section.style} (${instance.sections[sectionIndex].hp})` }],
    );
  });
}

function FellowCard({
  fellow,
  fixed,
  acted,
  onActed,
  onRemove,
  byId,
}: {
  fellow: Character;
  fixed: boolean;
  acted: boolean;
  onActed: () => void;
  onRemove: () => void;
  byId: Map<string, Monster>;
}) {
  const { t } = useTranslation();
  const [encounter, setEncounter] = useAtom(encounterAtom);
  const [turn, setTurn] = useState<FellowTurn | null>(null);
  const [targetKey, setTargetKey] = useState('');

  const targets = targetsOf(encounter.monsters, byId);
  const target = targets.find((entry) => entry.key === targetKey) ?? targets[0];
  const attack = turn?.action ? fellowAttack(turn.action) : null;
  const value = turn?.action ? fellowValue(turn.action) : null;

  function act() {
    const die = rollD6();
    setTurn({ die, action: fellowActionFor(fellow.fellow.actions, die) });
    onActed();
  }

  /** The Fellow's check value is fixed by its table; the monster's Evasion is rolled (or Fixed).
   *  A hit needs a value above the monster's Success Value, then Power Table damage as for a PC. */
  function resolve() {
    if (!turn?.action || !attack || value === null || !target) return;
    const instance = encounter.monsters[target.monsterIndex];
    const monster = byId.get(instance.monsterId);
    if (!monster) return;
    const section = monster.sections[target.sectionIndex];
    const standard = isValuePair(section.evasion) ? section.evasion.value : 0;
    const evasion = rollEvasion(standard, fixed);
    const hit = evasion.outcome === 'critical' ? false : evasion.outcome === 'fumble' ? true : value > evasion.value;
    const base = { target: target.label, value, evasion: evasion.value, evasionDice: evasion.dice, magic: attack.magic };
    if (!hit) {
      setTurn({ ...turn, result: { ...base, hit } });
      return;
    }
    const damage = rollWeaponDamage(attack.power, attack.criticalValue, attack.extraDamage);
    const applied = damageSection(instance, target.sectionIndex, damage.calculatedDamage, numberOf(section.defense), !attack.magic);
    setEncounter((current) => ({ ...current, monsters: current.monsters.map((entry) => (entry.id === applied.instance.id ? applied.instance : entry)) }));
    setTurn({ ...turn, result: { ...base, hit, damage, dealt: applied.dealt } });
  }

  const classes = fellow.classes.map((entry) => `${getClass(entry.classId)?.name ?? entry.classId} ${entry.level}`).join(', ');

  return (
    <article className={styles.card} aria-label={fellow.name}>
      <header className={styles.cardHead}>
        <h4>
          {fellow.name} <span className={styles.level}>{t('solo.level', { level: adventurerLevel(fellow.classes) })}</span>
        </h4>
        <button type="button" onClick={onRemove} aria-label={t('solo.party.removeFellow', { name: fellow.name })}>
          {t('solo.remove')}
        </button>
      </header>
      <p className={styles.facts}>
        <span>{classes}</span>
        {fellow.fellow.selfIntroduction && <span>“{fellow.fellow.selfIntroduction}”</span>}
      </p>

      {fellow.fellow.actions.length === 0 ? (
        <p className={styles.note}>{t('solo.party.noTable', { name: fellow.name })}</p>
      ) : (
        <div className={styles.controls}>
          <button type="button" onClick={act} disabled={acted} aria-label={t('solo.party.actAria', { name: fellow.name })}>
            {acted ? t('solo.party.actedThisRound') : t('solo.party.act')}
          </button>
          {turn && (
            <button type="button" onClick={() => setTurn(null)}>
              {t('solo.party.cancel')}
            </button>
          )}
        </div>
      )}

      {turn && (
        <div className={styles.report} role="status" aria-live="polite">
          <p>
            1d6 = {turn.die}:{' '}
            {turn.action ? (
              <>
                <strong>{turn.action.name}</strong>
                {turn.action.dialogue && <> — “{turn.action.dialogue}”</>}
              </>
            ) : (
              t('solo.party.noRow')
            )}
          </p>
          {turn.action && (
            <p>
              {t('solo.party.value')}: <strong>{value ?? '–'}</strong>
              {turn.action.effect ? ` · ${turn.action.effect}` : ''}
            </p>
          )}

          {attack && !turn.result && (
            <div className={styles.controls}>
              {targets.length === 0 ? (
                <span className={styles.note}>{t('solo.party.noTarget')}</span>
              ) : (
                <>
                  <select value={target?.key ?? ''} onChange={(e) => setTargetKey(e.target.value)} aria-label={t('solo.party.target')}>
                    {targets.map((entry) => (
                      <option key={entry.key} value={entry.key}>
                        {entry.label}
                      </option>
                    ))}
                  </select>
                  <button type="button" onClick={resolve} aria-label={t('solo.party.resolveAria', { name: fellow.name })}>
                    {t('solo.party.resolve')}
                  </button>
                </>
              )}
            </div>
          )}
          {!attack && turn.action && <p className={styles.note}>{t('solo.party.checkNote')}</p>}

          {turn.result && (
            <>
              <p>
                {turn.result.target}: {t('solo.party.attackLine', { value: turn.result.value, evasion: turn.result.evasion })} —{' '}
                <strong>{turn.result.hit ? t('solo.hit') : t('solo.miss')}</strong>
              </p>
              {turn.result.damage && (
                <p>
                  {turn.result.damage.steps.map((step) => `${step.d1}+${step.d2}→${step.value}`).join(' · ')} ={' '}
                  {turn.result.damage.calculatedDamage}
                  {turn.result.magic ? ` (${t('solo.party.magic')})` : ''} → <strong>{turn.result.dealt}</strong> {t('solo.party.dealt')}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </article>
  );
}

export function PartyPanel({ fixed }: { fixed: boolean }) {
  const { t } = useTranslation();
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const encounter = useAtomValue(encounterAtom);
  const [party, setParty] = useAtom(partyAtom);
  const { byId } = useMonsters();
  const [pick, setPick] = useState('');
  const [reward, setReward] = useState('');
  // The round each Fellow last acted in: one turn per round, like a PC (CR I p. 201).
  const [actedRound, setActedRound] = useState<Record<string, number>>({});

  const members = party.flatMap((id) => characters.filter((entry) => entry.id === id && entry.id !== activeId));
  const eligible = characters.filter((entry) => entry.id !== activeId && !party.includes(entry.id));
  const adventurers = 1 + members.length;
  const total = Number(reward) || 0;
  const share = Math.floor(total / adventurers);

  return (
    <section className={styles.panel} aria-labelledby="solo-party">
      <div className={styles.panelHead}>
        <h3 id="solo-party">{t('solo.party.title')}</h3>
        <p className={styles.note}>{t('solo.party.note')}</p>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('solo.party.pick')}
          <select value={pick} onChange={(e) => setPick(e.target.value)}>
            <option value="">{t('creation.selectPlaceholder')}</option>
            {eligible.map((entry) => (
              <option key={entry.id} value={entry.id}>
                {entry.name} · {t('solo.level', { level: adventurerLevel(entry.classes) })}
                {entry.fellow.actions.length === 0 ? ` · ${t('solo.party.noTableShort')}` : ''}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          onClick={() => {
            setParty((current) => [...current, pick]);
            setPick('');
          }}
          disabled={!pick}
        >
          {t('solo.party.add')}
        </button>
        <span className={styles.numeric}>{t('solo.party.size', { count: adventurers, limit: PARTY_LIMIT })}</span>
      </div>
      {adventurers > PARTY_LIMIT && <p className={styles.defeated}>{t('solo.party.tooMany', { limit: PARTY_LIMIT })}</p>}
      {eligible.length === 0 && members.length === 0 && <p className={styles.note}>{t('solo.party.nobody')}</p>}

      {members.length > 0 && (
        <div className={styles.cards}>
          {members.map((fellow) => (
            <FellowCard
              key={fellow.id}
              fellow={fellow}
              fixed={fixed}
              byId={byId}
              acted={actedRound[fellow.id] === encounter.round && encounter.round > 0}
              onActed={() => setActedRound((current) => ({ ...current, [fellow.id]: encounter.round }))}
              onRemove={() => setParty((current) => current.filter((id) => id !== fellow.id))}
            />
          ))}
        </div>
      )}

      {members.length > 0 && (
        <div className={styles.toolbar}>
          <label>
            {t('solo.party.reward')}
            <input type="number" min={0} value={reward} onChange={(e) => setReward(e.target.value)} />
          </label>
          {total > 0 && (
            <span role="status">
              {t('solo.party.share', { share, count: adventurers })}
              {members.some((entry) => !entry.fellow.wantsReward) &&
                ` ${t('solo.party.shareNote', { names: members.filter((entry) => !entry.fellow.wantsReward).map((entry) => entry.name).join(', ') })}`}
            </span>
          )}
        </div>
      )}
    </section>
  );
}

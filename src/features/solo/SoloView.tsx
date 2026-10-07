import { useAtom, useAtomValue } from 'jotai';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { formatValue, type Monster } from '../../data/monsters';
import {
  damageSection,
  healSection,
  isDefeated,
  isDown,
  lootFor,
  numberOf,
  resolveAttack,
  rollD6,
  rollEvasion,
  rollMonsterAttack,
  rollMonsterDamage,
  spawnMonster,
  type EncounterMonster,
  type EvasionRoll,
  type MonsterAttackRoll,
  type MonsterDamageRoll,
} from '../../lib/encounter';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { characterDefense, characterEvasion } from '../../lib/formulas/character-defense';
import { initiative } from '../../lib/formulas/derived-stats';
import { activeCharacterIdAtom, charactersAtom, useUpdateCharacter } from '../../state/characters';
import { encounterAtom } from '../../state/encounter';
import type { Character } from '../../types/character';
import { PartyPanel } from './PartyPanel';
import styles from './SoloView.module.css';
import { useMonsters } from './useMonsters';

function levelOf(character: Character, classId: string): number {
  return character.classes.filter((entry) => entry.classId === classId).reduce((max, entry) => Math.max(max, entry.level), 0);
}

interface AttackReport {
  sectionIndex: number;
  attack: MonsterAttackRoll;
  evasion: EvasionRoll;
  hit: boolean;
  damage: MonsterDamageRoll | null;
  /** Damage left after the target's Defense; what the character loses if the player applies it. */
  landed: number;
}

function MonsterCard({
  monster,
  instance,
  fixed,
  character,
  onChange,
  onRemove,
}: {
  monster: Monster;
  instance: EncounterMonster;
  fixed: boolean;
  character: Character | undefined;
  onChange: (next: EncounterMonster) => void;
  onRemove: () => void;
}) {
  const { t } = useTranslation();
  const updateCharacter = useUpdateCharacter(character?.id ?? '');
  const [amounts, setAmounts] = useState<string[]>([]);
  const [magic, setMagic] = useState(false);
  const [report, setReport] = useState<AttackReport | null>(null);
  const [applied, setApplied] = useState(false);
  const [loot, setLoot] = useState<{ sum: number; items: string[] } | null>(null);

  const defeated = isDefeated(monster, instance);

  function hurt(index: number) {
    const amount = Number(amounts[index]) || 0;
    if (amount <= 0) return;
    const section = monster.sections[index];
    onChange(damageSection(instance, index, amount, numberOf(section.defense), !magic).instance);
    setAmounts((list) => list.map((value, i) => (i === index ? '' : value)));
  }

  function heal(index: number) {
    const amount = Number(amounts[index]) || 0;
    if (amount <= 0) return;
    onChange(healSection(instance, index, amount, numberOf(monster.sections[index].hp)));
    setAmounts((list) => list.map((value, i) => (i === index ? '' : value)));
  }

  /** One monster attack against the active character: the monster's Accuracy check against the
   *  character's Evasion check (rolled here, or the Fixed Value), then damage less Defense. */
  function attack(index: number) {
    const section = monster.sections[index];
    const roll = rollMonsterAttack(section, fixed);
    if (!roll) return;
    const evasion = rollEvasion(character ? characterEvasion(character) : 0, fixed);
    const hit = resolveAttack(roll, evasion);
    const damage = hit ? rollMonsterDamage(section, fixed) : null;
    const landed = damage ? Math.max(0, damage.total - (character ? characterDefense(character) : 0)) : 0;
    setReport({ sectionIndex: index, attack: roll, evasion, hit, damage, landed });
    setApplied(false);
  }

  function applyToCharacter() {
    if (!character || !report) return;
    updateCharacter((c) => ({ ...c, hp: { current: c.hp.current - report.landed } }));
    setApplied(true);
  }

  function rollLoot() {
    const sum = rollD6() + rollD6();
    setLoot({ sum, items: lootFor(monster.loot, sum).map((row) => row.item) });
  }

  return (
    <article className={`${styles.card} ${defeated ? styles.cardDefeated : ''}`} aria-label={instance.label}>
      <header className={styles.cardHead}>
        <h4>
          {instance.label} <span className={styles.level}>{t('solo.level', { level: monster.level })}</span>
        </h4>
        {defeated && <span className={styles.defeated}>{t('solo.defeated')}</span>}
        <button type="button" onClick={onRemove} aria-label={t('solo.removeMonster', { name: instance.label })}>
          {t('solo.remove')}
        </button>
      </header>
      <p className={styles.facts}>
        <span>
          {t('reference.monsters.initiative')}: {monster.initiative}
        </span>
        <span>
          {t('reference.monsters.fortitude')}: {formatValue(monster.fortitude)}
        </span>
        <span>
          {t('reference.monsters.willpower')}: {formatValue(monster.willpower)}
        </span>
        <span>
          {t('reference.monsters.weakPoint')}: {monster.weakPoint}
        </span>
      </p>

      {monster.sections.map((section, index) => {
        const state = instance.sections[index];
        const max = numberOf(section.hp);
        const down = isDown(state);
        const attackable = section.accuracy !== null && 'value' in section.accuracy && section.damage !== null;
        return (
          <div key={`${section.style}-${index}`} className={`${styles.section} ${down ? styles.sectionDown : ''}`}>
            <div className={styles.sectionHead}>
              <strong>{section.style}</strong>
              <span className={styles.numeric}>
                {t('reference.monsters.defense')} {section.defense ?? '–'} · {t('reference.monsters.evasion')} {formatValue(section.evasion)}
                {section.mp !== null && ` · MP ${state.mp}/${numberOf(section.mp)}`}
              </span>
              {down && <span className={styles.defeated}>{t('solo.down')}</span>}
            </div>
            <div className={styles.bar} role="meter" aria-label={`${section.style} HP`} aria-valuemin={0} aria-valuemax={max} aria-valuenow={Math.max(0, state.hp)}>
              <div className={styles.barFill} style={{ width: `${max > 0 ? Math.max(0, Math.min(100, (state.hp / max) * 100)) : 0}%` }} />
              <span className={styles.barText}>
                {state.hp} / {max}
              </span>
            </div>
            <div className={styles.controls}>
              <input
                type="number"
                min={0}
                value={amounts[index] ?? ''}
                onChange={(e) => setAmounts((list) => Object.assign([...list], { [index]: e.target.value }))}
                aria-label={`${section.style} ${t('solo.amount')}`}
                placeholder={t('solo.amount')}
              />
              <button type="button" onClick={() => hurt(index)}>
                {t('solo.hurt')}
              </button>
              <button type="button" onClick={() => heal(index)}>
                {t('solo.heal')}
              </button>
              {attackable && (
                <button type="button" onClick={() => attack(index)} aria-label={`${instance.label} ${section.style} ${t('solo.attack')}`}>
                  {t('solo.attack')} ({formatValue(section.accuracy)} · {section.damage})
                </button>
              )}
            </div>
          </div>
        );
      })}

      <label className={styles.inline}>
        <input type="checkbox" checked={magic} onChange={(e) => setMagic(e.target.checked)} />
        {t('solo.magicDamage')}
      </label>

      {report && (
        <div className={styles.report} role="status" aria-live="polite">
          <p>
            {monster.sections[report.sectionIndex].style}: {t('solo.attackLine', {
              roll: report.attack.dice[0] ? `${report.attack.dice[0]}+${report.attack.dice[1]}` : t('solo.fixed'),
              value: report.attack.successValue,
            })}
            {report.attack.outcome === 'fumble' && ` — ${t('solo.fumble')}`}
            {report.attack.outcome === 'critical' && ` — ${t('solo.autoHit')}`}
          </p>
          <p>
            {t('solo.evasionLine', {
              roll: report.evasion.dice ? `${report.evasion.dice[0]}+${report.evasion.dice[1]}` : t('solo.fixed'),
              value: report.evasion.value,
            })}{' '}
            — <strong>{report.hit ? t('solo.hit') : t('solo.miss')}</strong>
          </p>
          {report.damage && (
            <p>
              {t('solo.damageLine', {
                roll: report.damage.dice ? `${report.damage.dice[0]}+${report.damage.dice[1]}` : t('solo.fixed'),
                modifier: report.damage.modifier,
                total: report.damage.total,
                defense: character ? characterDefense(character) : 0,
                landed: report.landed,
              })}
            </p>
          )}
          {report.hit && character && report.landed > 0 && (
            <button type="button" onClick={applyToCharacter} disabled={applied}>
              {applied ? t('solo.applied') : t('solo.applyDamage', { landed: report.landed, name: character.name })}
            </button>
          )}
        </div>
      )}

      {defeated && monster.loot.length > 0 && (
        <div className={styles.loot}>
          <button type="button" onClick={rollLoot}>
            {t('solo.rollLoot')}
          </button>
          {loot && (
            <p role="status">
              2d6 = {loot.sum}: {loot.items.filter((item) => item !== 'Nothing').join('; ') || t('solo.nothing')}
            </p>
          )}
        </div>
      )}
    </article>
  );
}

function EncounterPanel({ fixed, onFixedChange }: { fixed: boolean; onFixedChange: (next: boolean) => void }) {
  const { t } = useTranslation();
  const [encounter, setEncounter] = useAtom(encounterAtom);
  const characters = useAtomValue(charactersAtom);
  const activeId = useAtomValue(activeCharacterIdAtom);
  const character = characters.find((entry) => entry.id === activeId);

  const { monsters, byId } = useMonsters();
  const [search, setSearch] = useState('');
  const [pick, setPick] = useState('');
  const [count, setCount] = useState('1');
  const [initiativeRoll, setInitiativeRoll] = useState<{ dice: [number, number]; value: number } | null>(null);

  const options = useMemo(() => {
    const query = search.trim().toLowerCase();
    return (monsters ?? []).filter((monster) => !query || monster.name.toLowerCase().includes(query)).slice(0, 80);
  }, [monsters, search]);

  function addMonsters() {
    const monster = byId.get(pick);
    if (!monster) return;
    setEncounter((current) => {
      const labels = current.monsters.map((entry) => entry.label);
      const added: EncounterMonster[] = [];
      const copies = Math.max(1, Math.min(12, Math.floor(Number(count)) || 1));
      for (let i = 0; i < copies; i += 1) {
        const next = spawnMonster(monster, [...labels, ...added.map((entry) => entry.label)], crypto.randomUUID());
        added.push(next);
      }
      return { ...current, monsters: [...current.monsters, ...added] };
    });
  }

  const monsterInitiative = Math.max(0, ...encounter.monsters.map((entry) => Number.parseInt(byId.get(entry.monsterId)?.initiative ?? '0', 10) || 0));

  function rollInitiative() {
    if (!character) return;
    const dice: [number, number] = [rollD6(), rollD6()];
    const agiMod = abilityModifier(abilityTotal(character.abilities.AGI));
    const value = dice[0] + dice[1] + initiative(Math.max(levelOf(character, 'scout'), levelOf(character, 'tactician')), agiMod);
    setInitiativeRoll({ dice, value });
  }

  return (
    <section className={styles.panel} aria-labelledby="solo-encounter">
      <div className={styles.panelHead}>
        <h3 id="solo-encounter">{t('solo.encounter')}</h3>
        <p className={styles.note}>{t('solo.encounterNote')}</p>
      </div>

      <div className={styles.toolbar}>
        <span className={styles.round}>{t('solo.round', { round: encounter.round })}</span>
        <button type="button" onClick={() => setEncounter((current) => ({ ...current, round: current.round + 1 }))}>
          {t('solo.nextRound')}
        </button>
        <label className={styles.inline}>
          <input type="checkbox" checked={fixed} onChange={(e) => onFixedChange(e.target.checked)} />
          {t('solo.fixedValues')}
        </label>
        <button type="button" onClick={() => setEncounter({ round: 0, monsters: [] })} disabled={encounter.monsters.length === 0 && encounter.round === 0}>
          {t('solo.endEncounter')}
        </button>
      </div>

      <div className={styles.toolbar}>
        <label>
          {t('reference.monsters.search')}
          <input type="search" value={search} onChange={(e) => setSearch(e.target.value)} placeholder={t('solo.searchHint')} />
        </label>
        <label>
          {t('solo.monster')}
          <select value={pick} onChange={(e) => setPick(e.target.value)} disabled={!monsters}>
            <option value="">{monsters ? t('creation.selectPlaceholder') : t('reference.monsters.loading')}</option>
            {options.map((monster) => (
              <option key={monster.id} value={monster.id}>
                {monster.level}
                {monster.levelPlus ? '+' : ''} · {monster.name}
              </option>
            ))}
          </select>
        </label>
        <label>
          {t('solo.count')}
          <input type="number" min={1} max={12} value={count} onChange={(e) => setCount(e.target.value)} />
        </label>
        <button type="button" onClick={addMonsters} disabled={!pick}>
          {t('solo.addMonsters')}
        </button>
      </div>

      {encounter.monsters.length > 0 && (
        <div className={styles.toolbar}>
          <span>{t('solo.monsterInitiative', { value: monsterInitiative })}</span>
          <button type="button" onClick={rollInitiative} disabled={!character}>
            {t('solo.rollInitiative')}
          </button>
          {initiativeRoll && (
            <span role="status">
              {initiativeRoll.dice[0]}+{initiativeRoll.dice[1]} → {initiativeRoll.value} ·{' '}
              <strong>{initiativeRoll.value >= monsterInitiative ? t('solo.youFirst') : t('solo.monstersFirst')}</strong>
            </span>
          )}
        </div>
      )}

      {!character && <p className={styles.note}>{t('solo.noCharacter')}</p>}

      {encounter.monsters.length === 0 ? (
        <p className={styles.note}>{t('solo.emptyEncounter')}</p>
      ) : (
        <div className={styles.cards}>
          {encounter.monsters.map((instance) => {
            const monster = byId.get(instance.monsterId);
            if (!monster) return null;
            return (
              <MonsterCard
                key={instance.id}
                monster={monster}
                instance={instance}
                fixed={fixed}
                character={character}
                onChange={(next) =>
                  setEncounter((current) => ({ ...current, monsters: current.monsters.map((entry) => (entry.id === next.id ? next : entry)) }))
                }
                onRemove={() => setEncounter((current) => ({ ...current, monsters: current.monsters.filter((entry) => entry.id !== instance.id) }))}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}

export function SoloView({ onClose }: { onClose: () => void }) {
  const { t } = useTranslation();
  // One setting for both panels: whether the table rolls dice or uses the printed Fixed Values.
  const [fixed, setFixed] = useState(false);

  return (
    <div className={styles.solo}>
      <div className={styles.head}>
        <div>
          <h2>{t('solo.title')}</h2>
          <p className={styles.note}>{t('solo.intro')}</p>
        </div>
        <button type="button" onClick={onClose}>
          {t('reference.close')}
        </button>
      </div>
      <EncounterPanel fixed={fixed} onFixedChange={setFixed} />
      <PartyPanel fixed={fixed} />
    </div>
  );
}

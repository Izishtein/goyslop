import { useTranslation } from 'react-i18next';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel, wizardLevelSum } from '../../lib/formulas/character-levels';
import { fortitude, willpower } from '../../lib/formulas/derived-stats';
import { hpMax, mpMax } from '../../lib/formulas/hp-mp';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { getClass } from '../../data/classes';
import { getRace, racialAbilitiesFor } from '../../data/races';
import type { Character } from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import { AbilitySection } from './AbilitySection';
import { AvatarField } from './AvatarField';
import { ClassesSection } from './ClassesSection';
import { CombatStatsSection } from './CombatStatsSection';
import { EquipmentSection } from './EquipmentSection';
import { CombatFeatsSection } from './CombatFeatsSection';
import { SpellsSection } from './SpellsSection';
import { NotesSection } from './NotesSection';
import { StatusEffectsSection } from './StatusEffectsSection';
import styles from './CharacterSheetView.module.css';

/** HP bar colour doubles as an at-a-glance danger read. */
function hpFillClass(current: number, max: number): string {
  const ratio = max > 0 ? current / max : 0;
  if (ratio > 0.5) return styles.hpOk;
  if (ratio > 0.25) return styles.hpWarn;
  return styles.hpDanger;
}

function percent(current: number, max: number): string {
  if (max <= 0) return '0%';
  return `${Math.max(0, Math.min(100, (current / max) * 100))}%`;
}

export function CharacterSheetView({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const race = getRace(character.raceId);
  const racialAbilities = racialAbilitiesFor(character.raceId);
  const advLevel = adventurerLevel(character.classes);
  const wizLevels = wizardLevelSum(character.classes);

  const vitMod = abilityModifier(abilityTotal(character.abilities.VIT));
  const sprMod = abilityModifier(abilityTotal(character.abilities.SPR));
  const vitTotal = abilityTotal(character.abilities.VIT);
  const sprTotal = abilityTotal(character.abilities.SPR);

  const hp = { current: character.hp.current, max: hpMax(advLevel, vitTotal) };
  const mp = { current: character.mp.current, max: mpMax(wizLevels, sprTotal) };

  function updateCurrent(field: 'hp' | 'mp', value: number) {
    update((c) => ({ ...c, [field]: { current: value } }));
  }

  function updateProfile(field: 'gender' | 'age', value: string) {
    update((c) => ({ ...c, profile: { ...c.profile, [field]: value } }));
  }

  return (
    <section className={styles.sheet}>
      <header className={styles.identity}>
        <AvatarField character={character} />

        <div className={styles.identityMain}>
          <h2>{character.name}</h2>
          <p className={styles.meta}>
            {race?.name ?? character.raceId} · {character.background} · {t('sheet.adventurerLevel')} {advLevel}
          </p>

          <div className={styles.profileFields}>
            <label className={styles.profileField}>
              <span>{t('sheet.gender')}</span>
              <input
                value={character.profile.gender}
                onChange={(event) => updateProfile('gender', event.target.value)}
                aria-label={t('sheet.gender')}
              />
            </label>
            <label className={styles.profileField}>
              <span>{t('sheet.age')}</span>
              <input
                value={character.profile.age}
                onChange={(event) => updateProfile('age', event.target.value)}
                aria-label={t('sheet.age')}
              />
            </label>
          </div>
          <ul className={styles.classBadges}>
            {character.classes.map((classLevel) => (
              <li key={classLevel.classId} className={styles.classBadge}>
                {getClass(classLevel.classId)?.name ?? classLevel.classId} {classLevel.level}
              </li>
            ))}
          </ul>

          {/* Racial abilities unlock at Adventurer Level 6 and 11, so the ones still out of
              reach are shown dimmed with their level rather than hidden. */}
          {racialAbilities.length > 0 && (
            <ul className={styles.racialAbilities} aria-label={t('sheet.racialAbilities')}>
              {racialAbilities.map((ability, index) => {
                const locked = advLevel < ability.fromLevel;
                return (
                  <li key={`${ability.name}-${index}`} className={locked ? styles.racialAbilityLocked : undefined}>
                    [{ability.name}]{ability.fromLevel > 0 ? ` Lv${ability.fromLevel}+` : ''}
                  </li>
                );
              })}
            </ul>
          )}
        </div>
        <button type="button" onClick={() => window.print()}>
          {t('sheet.print')}
        </button>
      </header>

      <div className={styles.vitals}>
        <div className={styles.gauge}>
          <div className={styles.gaugeHead}>
            <span className={styles.gaugeLabel}>{t('sheet.hp')}</span>
            <span className={styles.gaugeValue}>
              <input
                type="number"
                value={hp.current}
                onChange={(event) => updateCurrent('hp', Number(event.target.value))}
                aria-label={t('sheet.hp')}
              />
              <span className={styles.gaugeMax}>/ {hp.max}</span>
              <button type="button" onClick={() => updateCurrent('hp', hp.max)} title={t('sheet.resetToMax')}>
                {t('sheet.resetToMaxShort')}
              </button>
            </span>
          </div>
          <div className={styles.track}>
            <div className={`${styles.fill} ${hpFillClass(hp.current, hp.max)}`} style={{ width: percent(hp.current, hp.max) }} />
          </div>
        </div>

        <div className={styles.gauge}>
          <div className={styles.gaugeHead}>
            <span className={styles.gaugeLabel}>{t('sheet.mp')}</span>
            <span className={styles.gaugeValue}>
              <input
                type="number"
                value={mp.current}
                onChange={(event) => updateCurrent('mp', Number(event.target.value))}
                aria-label={t('sheet.mp')}
              />
              <span className={styles.gaugeMax}>/ {mp.max}</span>
              <button type="button" onClick={() => updateCurrent('mp', mp.max)} title={t('sheet.resetToMax')}>
                {t('sheet.resetToMaxShort')}
              </button>
            </span>
          </div>
          <div className={styles.track}>
            <div className={`${styles.fill} ${styles.mpFill}`} style={{ width: percent(mp.current, mp.max) }} />
          </div>
        </div>

        <div className={styles.saves}>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{t('sheet.fortitude')}</span>
            <span className={styles.statValue} aria-label={t('sheet.fortitude')}>
              {fortitude(advLevel, vitMod) + sumModifiersForField(character.statusEffects, 'fortitude')}
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statLabel}>{t('sheet.willpower')}</span>
            <span className={styles.statValue} aria-label={t('sheet.willpower')}>
              {willpower(advLevel, sprMod) + sumModifiersForField(character.statusEffects, 'willpower')}
            </span>
          </div>
        </div>
      </div>

      <AbilitySection character={character} />

      <ClassesSection character={character} />

      <CombatStatsSection character={character} />

      <EquipmentSection character={character} />

      <SpellsSection character={character} />

      <CombatFeatsSection character={character} />

      <StatusEffectsSection character={character} />

      <NotesSection character={character} />
    </section>
  );
}

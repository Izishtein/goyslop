import { useTranslation } from 'react-i18next';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { adventurerLevel, wizardLevelSum } from '../../lib/formulas/character-levels';
import { fortitude, willpower } from '../../lib/formulas/derived-stats';
import { hpMax, mpMax } from '../../lib/formulas/hp-mp';
import { sumModifiersForField } from '../../lib/formulas/status-effects';
import { getClass } from '../../data/classes';
import { getRace } from '../../data/races';
import type { Character } from '../../types/character';
import { useUpdateCharacter } from '../../state/characters';
import { AbilitySection } from './AbilitySection';
import { CombatStatsSection } from './CombatStatsSection';
import { EquipmentSection } from './EquipmentSection';
import { CombatFeatsSection } from './CombatFeatsSection';
import { StatusEffectsSection } from './StatusEffectsSection';
import styles from './CharacterSheetView.module.css';

export function CharacterSheetView({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  const race = getRace(character.raceId);
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

  function resetToMax(field: 'hp' | 'mp') {
    updateCurrent(field, field === 'hp' ? hp.max : mp.max);
  }

  return (
    <section className={styles.sheet}>
      <header>
        <h2>{character.name}</h2>
        <p>
          {race?.name ?? character.raceId} · {character.background} · {t('sheet.adventurerLevel')} {advLevel}
        </p>
        <button type="button" onClick={() => window.print()}>
          {t('sheet.print')}
        </button>
      </header>

      <ul className={styles.classList}>
        {character.classes.map((classLevel) => (
          <li key={classLevel.classId}>
            {getClass(classLevel.classId)?.name ?? classLevel.classId} Lv{classLevel.level}
          </li>
        ))}
      </ul>

      <div className={styles.trackers}>
        <div>
          <strong>{t('sheet.hp')}</strong>{' '}
          <input
            type="number"
            value={hp.current}
            onChange={(event) => updateCurrent('hp', Number(event.target.value))}
            aria-label={t('sheet.hp')}
          />{' '}
          / {hp.max}
          <button type="button" onClick={() => resetToMax('hp')}>
            {t('sheet.resetToMax')}
          </button>
        </div>
        <div>
          <strong>{t('sheet.mp')}</strong>{' '}
          <input
            type="number"
            value={mp.current}
            onChange={(event) => updateCurrent('mp', Number(event.target.value))}
            aria-label={t('sheet.mp')}
          />{' '}
          / {mp.max}
          <button type="button" onClick={() => resetToMax('mp')}>
            {t('sheet.resetToMax')}
          </button>
        </div>
      </div>

      <p>
        {t('sheet.fortitude')}: {fortitude(advLevel, vitMod) + sumModifiersForField(character.statusEffects, 'fortitude')} ·{' '}
        {t('sheet.willpower')}: {willpower(advLevel, sprMod) + sumModifiersForField(character.statusEffects, 'willpower')}
      </p>

      <AbilitySection character={character} />

      <CombatStatsSection character={character} />

      <EquipmentSection character={character} />

      <CombatFeatsSection character={character} />

      <StatusEffectsSection character={character} />
    </section>
  );
}

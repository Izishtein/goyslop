import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  CARD_RANKS,
  cardKey,
  cardStockValue,
  EVOCATION_CLASS_ID,
  formatCards,
  getEvocation,
  listEvocations,
  MATERIAL_COLORS,
  type EvocationDefinition,
} from '../../data/evocations';
import { abilityModifier, abilityTotal } from '../../lib/formulas/abilities';
import { evocationPower } from '../../lib/formulas/derived-stats';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, KnownEvocation } from '../../types/character';
import { PrintableField } from './PrintableField';
import styles from './CharacterSheetView.module.css';

function alchemistLevel(character: Character): number {
  return character.classes
    .filter((entry) => entry.classId === EVOCATION_CLASS_ID)
    .reduce((max, entry) => Math.max(max, entry.level), 0);
}

function rowFromCatalog(entry: EvocationDefinition): KnownEvocation {
  return {
    id: crypto.randomUUID(),
    name: entry.name,
    requiredLevel: entry.requiredLevel,
    cards: formatCards(entry.cards),
    minorAction: entry.minorAction,
    preparation: entry.preparation,
    notes: '',
  };
}

function blankRow(): KnownEvocation {
  return { id: crypto.randomUUID(), name: '', requiredLevel: 1, cards: '', minorAction: false, preparation: false, notes: '' };
}

export function EvocationsSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const [evocationId, setEvocationId] = useState('');

  const level = alchemistLevel(character);
  const intMod = abilityModifier(abilityTotal(character.abilities.INT));

  // One Minor class owns the whole system, so nobody else carries an empty card grid.
  // Rows already recorded keep the section reachable if the class is ever dropped.
  if (level === 0 && character.evocations.length === 0) return null;

  const known = new Set(character.evocations.map((entry) => entry.name));
  const options = listEvocations();
  const stockValue = cardStockValue(character.materialCards);

  function addFromCatalog() {
    const found = getEvocation(evocationId);
    if (!found) return;
    update((c) => ({ ...c, evocations: [...c.evocations, rowFromCatalog(found)] }));
    setEvocationId('');
  }

  function addBlank() {
    update((c) => ({ ...c, evocations: [...c.evocations, blankRow()] }));
  }

  function updateRow(id: string, patch: Partial<KnownEvocation>) {
    update((c) => ({ ...c, evocations: c.evocations.map((row) => (row.id === id ? { ...row, ...patch } : row)) }));
  }

  function removeRow(id: string) {
    update((c) => ({ ...c, evocations: c.evocations.filter((row) => row.id !== id) }));
  }

  function setCards(key: string, count: number) {
    update((c) => ({ ...c, materialCards: { ...c.materialCards, [key]: Math.max(0, count) } }));
  }

  /* Booleans are selects rather than checkboxes for the same reason as in the Arts
     section: print strips a control down to its value, and a checkbox prints as an
     empty box whatever its state. */
  function marker(value: boolean, onChange: (next: boolean) => void, label: string, mark: string) {
    return (
      <select value={value ? 'yes' : 'no'} onChange={(e) => onChange(e.target.value === 'yes')} aria-label={label}>
        <option value="yes">{mark}</option>
        <option value="no">—</option>
      </select>
    );
  }

  return (
    <section className={styles.section} aria-labelledby="section-evocations">
      <div className={styles.sectionHead}>
        <h3 id="section-evocations">{t('sheet.evocations')}</h3>
        <p className={styles.sectionNote}>
          {t('sheet.evocationSv')}: <strong className={styles.numeric}>{evocationPower(level, intMod)}</strong>
          {' · '}
          {/* The book grants one Evocation per Alchemist level, so the count is worth showing
              next to the class level the same way SCA slots are. */}
          {t('sheet.evocationsKnown', { known: character.evocations.length, level })}
        </p>
      </div>

      <div className={styles.subsection} data-print-empty={character.evocations.length === 0 || undefined}>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.name')}</th>
                <th>{t('sheet.requiredLevel')}</th>
                <th>{t('sheet.materialCards')}</th>
                <th>{t('sheet.minorAction')}</th>
                <th>{t('sheet.preparation')}</th>
                <th>{t('sheet.artNote')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.evocations.map((row) => (
                <tr key={row.id}>
                  <td>
                    <PrintableField value={row.name} onChange={(e) => updateRow(row.id, { name: e.target.value })} aria-label={t('sheet.name')} />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      value={row.requiredLevel}
                      onChange={(e) => updateRow(row.id, { requiredLevel: Number(e.target.value) })}
                      aria-label={t('sheet.requiredLevel')}
                    />
                  </td>
                  <td>
                    <PrintableField value={row.cards} onChange={(e) => updateRow(row.id, { cards: e.target.value })} aria-label={t('sheet.materialCards')} />
                  </td>
                  <td>{marker(row.minorAction, (next) => updateRow(row.id, { minorAction: next }), t('sheet.minorAction'), '▶▶')}</td>
                  <td>{marker(row.preparation, (next) => updateRow(row.id, { preparation: next }), t('sheet.preparation'), '△')}</td>
                  <td>
                    <PrintableField value={row.notes} onChange={(e) => updateRow(row.id, { notes: e.target.value })} aria-label={t('sheet.artNote')} />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeRow(row.id)} aria-label={`${row.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {character.evocations.length === 0 && <p className={styles.empty}>{t('sheet.noEvocations')}</p>}

      {/* The card stock is ammunition: five colours by four ranks. A grid of twenty loose
          fields would fall apart on paper, so it stays one table with its own header row. */}
      <div className={styles.subsection}>
        <h4 className={styles.subHead}>{t('sheet.materialCardStock')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.cardColor')}</th>
                {CARD_RANKS.map((rank) => (
                  <th key={rank}>{rank}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATERIAL_COLORS.map((color) => (
                <tr key={color}>
                  <th scope="row">{t(`sheet.cardColor_${color}`)}</th>
                  {CARD_RANKS.map((rank) => {
                    const key = cardKey(color, rank);
                    return (
                      <td key={rank}>
                        <input
                          type="number"
                          min={0}
                          value={character.materialCards[key] ?? 0}
                          onChange={(e) => setCards(key, Number(e.target.value))}
                          aria-label={`${t(`sheet.cardColor_${color}`)} ${rank}`}
                        />
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={styles.sectionNote}>
          {t('sheet.cardStockValue')}: <strong className={styles.numeric}>{stockValue}</strong> {t('sheet.gamels')}
        </p>
      </div>

      {/* Selects are data elsewhere on the sheet, so this picker is marked as chrome for print. */}
      <div className={`${styles.inlineRow} ${styles.controlRow}`}>
        <label htmlFor="add-evocation">{t('sheet.addEvocation')}</label>
        <select id="add-evocation" value={evocationId} onChange={(e) => setEvocationId(e.target.value)}>
          <option value="">{t('creation.selectPlaceholder')}</option>
          {[...new Set(options.map((entry) => entry.requiredLevel))].map((required) => (
            <optgroup
              key={required}
              // Flagged rather than hidden above the class level, exactly like spells and arts.
              label={`${t('sheet.levelRequired', { level: required })}${required > level ? ` — ${t('sheet.aboveClassLevel')}` : ''}`}
            >
              {options
                .filter((entry) => entry.requiredLevel === required)
                .map((entry) => (
                  <option key={entry.id} value={entry.id} disabled={known.has(entry.name)}>
                    {entry.name} — {formatCards(entry.cards)}
                    {entry.minorAction ? ' ▶▶' : ''}
                    {entry.preparation ? ' △' : ''}
                  </option>
                ))}
            </optgroup>
          ))}
        </select>
        <button type="button" onClick={addFromCatalog} disabled={!evocationId}>
          {t('sheet.addEvocationAction')}
        </button>
        <button type="button" onClick={addBlank}>
          {t('sheet.addCustomEvocation')}
        </button>
      </div>
    </section>
  );
}

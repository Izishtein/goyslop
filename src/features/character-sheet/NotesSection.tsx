import { useTranslation } from 'react-i18next';
import { useUpdateCharacter } from '../../state/characters';
import type { Character, Connection, Notes } from '../../types/character';
import styles from './CharacterSheetView.module.css';

/** Textareas clip whatever does not fit their box, and print has no scrollbar — so each
 *  one grows to its content, on screen and on paper alike. */
function autoGrow(element: HTMLTextAreaElement | null) {
  if (!element) return;
  element.style.height = 'auto';
  // scrollHeight is the content box; with border-box sizing the borders have to be added
  // back, or the last line ends up a pixel or two under the bottom edge.
  const borders = element.offsetHeight - element.clientHeight;
  element.style.height = `${element.scrollHeight + borders}px`;
}

const NOTE_FIELDS: Array<{ key: keyof Notes; label: string }> = [
  { key: 'story', label: 'sheet.noteStory' },
  { key: 'goals', label: 'sheet.noteGoals' },
  { key: 'gm', label: 'sheet.noteGm' },
];

export function NotesSection({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);

  function setNote(field: keyof Notes, value: string) {
    update((c) => ({ ...c, notes: { ...c.notes, [field]: value } }));
  }

  function addConnection() {
    update((c) => ({ ...c, connections: [...c.connections, { id: crypto.randomUUID(), name: '', relation: '' }] }));
  }

  function updateConnection(id: string, patch: Partial<Connection>) {
    update((c) => ({
      ...c,
      connections: c.connections.map((connection) => (connection.id === id ? { ...connection, ...patch } : connection)),
    }));
  }

  function removeConnection(id: string) {
    update((c) => ({ ...c, connections: c.connections.filter((connection) => connection.id !== id) }));
  }

  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <h3>{t('sheet.notes')}</h3>
      </div>

      {NOTE_FIELDS.map((field) => (
        <div key={field.key} className={styles.subsection} data-print-empty={character.notes[field.key] === '' || undefined}>
          <label className={styles.noteField}>
            <span>{t(field.label)}</span>
            <textarea
              value={character.notes[field.key]}
              onChange={(event) => {
                setNote(field.key, event.target.value);
                autoGrow(event.target);
              }}
              ref={autoGrow}
              rows={2}
              aria-label={t(field.label)}
            />
          </label>
        </div>
      ))}

      <div className={styles.subsection} data-print-empty={character.connections.length === 0 || undefined}>
        <h4 className={styles.subHead}>{t('sheet.connections')}</h4>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t('sheet.connectionName')}</th>
                <th>{t('sheet.connectionRelation')}</th>
                <th>{t('sheet.spellNotes')}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {character.connections.map((connection) => (
                <tr key={connection.id}>
                  <td>
                    <input
                      value={connection.name}
                      onChange={(event) => updateConnection(connection.id, { name: event.target.value })}
                      aria-label={t('sheet.connectionName')}
                    />
                  </td>
                  <td>
                    <input
                      value={connection.relation}
                      onChange={(event) => updateConnection(connection.id, { relation: event.target.value })}
                      aria-label={t('sheet.connectionRelation')}
                    />
                  </td>
                  <td>
                    <input
                      value={connection.notes ?? ''}
                      onChange={(event) => updateConnection(connection.id, { notes: event.target.value })}
                      aria-label={t('sheet.spellNotes')}
                    />
                  </td>
                  <td>
                    <button type="button" onClick={() => removeConnection(connection.id)} aria-label={`${connection.name} ${t('sheet.remove')}`}>
                      {t('sheet.remove')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className={styles.rowActions}>
        <button type="button" onClick={addConnection}>
          {t('sheet.addConnection')}
        </button>
      </div>
    </section>
  );
}

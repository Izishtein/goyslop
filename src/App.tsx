import { useState } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { charactersAtom, activeCharacterIdAtom } from './state/characters';
import { CharacterCreationForm } from './features/character-creation/CharacterCreationForm';
import { CharacterSheetView } from './features/character-sheet/CharacterSheetView';
import { downloadCharacter } from './features/character-io/downloadCharacter';
import { ImportCharacterButton } from './features/character-io/ImportCharacterButton';
import styles from './App.module.css';

function App() {
  const { t, i18n } = useTranslation();
  const [characters, setCharacters] = useAtom(charactersAtom);
  const [activeId, setActiveId] = useAtom(activeCharacterIdAtom);
  const activeCharacter = characters.find((character) => character.id === activeId);

  /* Deleting is irreversible (localStorage only), so it takes two clicks. Inline rather
     than a modal: the roster row is where the mistake happens, and it keeps the sheet
     free of dialog machinery. */
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  function deleteCharacter(id: string) {
    setCharacters((prev) => prev.filter((character) => character.id !== id));
    if (activeId === id) setActiveId(null);
    setPendingDeleteId(null);
  }

  return (
    <main className={styles.app}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <h1>{t('app.title')}</h1>
        </div>
        {/* Label beside the select, not around it: wrapping it made the accessible name
            "Language" + every option's text ("LanguageENRU"), the same trap the creation
            form fell into. */}
        <div className={styles.langSwitch}>
          <label htmlFor="lang-switch">{t('app.language')}</label>
          {/* resolvedLanguage, not language: a detected "ru-RU" resolves to the "ru"
              resource, and only the resolved value matches an option below. */}
          <select
            id="lang-switch"
            value={i18n.resolvedLanguage ?? 'en'}
            onChange={(event) => void i18n.changeLanguage(event.target.value)}
          >
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </div>
      </header>

      {characters.length > 0 ? (
        <nav className={styles.roster}>
          <ul className={styles.rosterList}>
            {characters.map((character) => (
              <li
                key={character.id}
                className={`${styles.rosterItem} ${character.id === activeId ? styles.active : ''}`}
              >
                <button type="button" className={styles.rosterName} onClick={() => setActiveId(character.id)}>
                  {character.name}
                </button>
                <button
                  type="button"
                  className={styles.rosterAction}
                  onClick={() => downloadCharacter(character)}
                  title={t('io.export')}
                >
                  {t('io.exportShort')}
                </button>
                {pendingDeleteId === character.id ? (
                  <>
                    <button
                      type="button"
                      className={`${styles.rosterAction} ${styles.danger}`}
                      onClick={() => deleteCharacter(character.id)}
                    >
                      {t('app.confirmDelete', { name: character.name })}
                    </button>
                    <button type="button" className={styles.rosterAction} onClick={() => setPendingDeleteId(null)}>
                      {t('app.cancel')}
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    className={`${styles.rosterAction} ${styles.danger}`}
                    onClick={() => setPendingDeleteId(character.id)}
                    title={t('app.delete')}
                  >
                    {t('app.deleteShort')}
                  </button>
                )}
              </li>
            ))}
          </ul>
          <div className={styles.rosterTools}>
            <button type="button" onClick={() => setActiveId(null)}>
              {t('app.newCharacter')}
            </button>
            <ImportCharacterButton />
          </div>
        </nav>
      ) : (
        <div className={styles.emptyState}>
          <ImportCharacterButton />
        </div>
      )}

      {activeCharacter ? (
        <CharacterSheetView character={activeCharacter} />
      ) : (
        <CharacterCreationForm onCreated={(id) => setActiveId(id)} />
      )}
    </main>
  );
}

export default App;

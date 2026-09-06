import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { charactersAtom, activeCharacterIdAtom, STORAGE_ERROR_EVENT } from './state/characters';
import { CharacterCreationForm } from './features/character-creation/CharacterCreationForm';
import { CharacterSheetView } from './features/character-sheet/CharacterSheetView';
import { downloadCharacter } from './features/character-io/downloadCharacter';
import { ImportCharacterButton } from './features/character-io/ImportCharacterButton';
import { ReferenceView } from './features/reference/ReferenceView';
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

  /* The reference is a lookup, not a place you live, so this is plain state and never
     reaches localStorage: persisted, the app would reopen on a catalog with the roster's
     character hidden behind it. */
  const [showReference, setShowReference] = useState(false);

  /** Picking a character — or starting a new one — always lands on that character. */
  function openCharacter(id: string | null) {
    setActiveId(id);
    setShowReference(false);
  }

  /* The storage layer cannot render anything, so it shouts and the shell listens. Not
     dismissable on a timer: if saving is broken the player needs to know for as long as
     it stays broken, and the only real cure is exporting the character to a file. */
  const [saveFailed, setSaveFailed] = useState(false);
  useEffect(() => {
    const onError = () => setSaveFailed(true);
    window.addEventListener(STORAGE_ERROR_EVENT, onError);
    return () => window.removeEventListener(STORAGE_ERROR_EVENT, onError);
  }, []);

  function deleteCharacter(id: string) {
    const remaining = characters.filter((character) => character.id !== id);
    setCharacters(remaining);
    /* A null active id is how "New character" opens the creation form, so falling back to
       it after a delete dropped the player into that form with a full roster behind them.
       Move to whoever is left instead, and only go to the form when nobody is. */
    if (activeId === id) setActiveId(remaining[0]?.id ?? null);
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
        <button type="button" onClick={() => setShowReference((open) => !open)} aria-pressed={showReference}>
          {t('reference.open')}
        </button>
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

      {saveFailed && (
        <p className={styles.saveError} role="alert">
          {t('app.saveFailed')}
        </p>
      )}

      {characters.length > 0 ? (
        <nav className={styles.roster}>
          <ul className={styles.rosterList}>
            {characters.map((character) => (
              <li
                key={character.id}
                className={`${styles.rosterItem} ${character.id === activeId ? styles.active : ''}`}
              >
                <button type="button" className={styles.rosterName} onClick={() => openCharacter(character.id)}>
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
            <button type="button" onClick={() => openCharacter(null)}>
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

      {showReference ? (
        <ReferenceView onClose={() => setShowReference(false)} />
      ) : activeCharacter ? (
        <CharacterSheetView character={activeCharacter} />
      ) : (
        <CharacterCreationForm onCreated={(id) => openCharacter(id)} />
      )}
    </main>
  );
}

export default App;

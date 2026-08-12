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

  function deleteCharacter(id: string) {
    setCharacters((prev) => prev.filter((character) => character.id !== id));
    if (activeId === id) setActiveId(null);
  }

  return (
    <main className={styles.app}>
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <h1>{t('app.title')}</h1>
        </div>
        <label className={styles.langSwitch} htmlFor="lang-switch">
          {t('app.language')}
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
        </label>
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
                <button
                  type="button"
                  className={`${styles.rosterAction} ${styles.danger}`}
                  onClick={() => deleteCharacter(character.id)}
                  title={t('app.delete')}
                >
                  {t('app.deleteShort')}
                </button>
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

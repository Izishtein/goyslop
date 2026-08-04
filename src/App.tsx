import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { charactersAtom, activeCharacterIdAtom } from './state/characters';
import { CharacterCreationForm } from './features/character-creation/CharacterCreationForm';
import { CharacterSheetView } from './features/character-sheet/CharacterSheetView';
import { downloadCharacter } from './features/character-io/downloadCharacter';
import { ImportCharacterButton } from './features/character-io/ImportCharacterButton';
import './App.css';

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
    <main>
      <header>
        <h1>{t('app.title')}</h1>
        <label>
          {t('language.en')} / {t('language.ru')}:{' '}
          <select value={i18n.language} onChange={(event) => void i18n.changeLanguage(event.target.value)}>
            <option value="en">EN</option>
            <option value="ru">RU</option>
          </select>
        </label>
      </header>

      {characters.length > 0 && (
        <nav>
          <ul>
            {characters.map((character) => (
              <li key={character.id}>
                <button type="button" onClick={() => setActiveId(character.id)}>
                  {character.name}
                </button>
                <button type="button" onClick={() => downloadCharacter(character)}>
                  {t('io.export')}
                </button>
                <button type="button" onClick={() => deleteCharacter(character.id)}>
                  {t('app.delete')}
                </button>
              </li>
            ))}
          </ul>
          <button type="button" onClick={() => setActiveId(null)}>
            {t('app.newCharacter')}
          </button>
          <ImportCharacterButton />
        </nav>
      )}
      {characters.length === 0 && <ImportCharacterButton />}

      {activeCharacter ? (
        <CharacterSheetView character={activeCharacter} />
      ) : (
        <CharacterCreationForm onCreated={(id) => setActiveId(id)} />
      )}
    </main>
  );
}

export default App;

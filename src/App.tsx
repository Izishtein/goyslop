import { useEffect, useState } from 'react';
import { useAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { charactersAtom, activeCharacterIdAtom, duplicateCharacter, STORAGE_ERROR_EVENT } from './state/characters';
import { themeAtom, type ThemePreference } from './state/theme';
import { CharacterCreationForm } from './features/character-creation/CharacterCreationForm';
import { CharacterSheetView } from './features/character-sheet/CharacterSheetView';
import { ImportCharacterButton } from './features/character-io/ImportCharacterButton';
import { ReferenceView } from './features/reference/ReferenceView';
import { GuideView } from './features/guide/GuideView';
import { QuickStartView } from './features/quick-start/QuickStartView';
import { RosterView } from './features/roster/RosterView';
import { FreeDiceRoller } from './features/dice-roller/FreeDiceRoller';
import type { Character } from './types/character';
import styles from './App.module.css';

function App() {
  const { t, i18n } = useTranslation();
  const [characters, setCharacters] = useAtom(charactersAtom);
  const [activeId, setActiveId] = useAtom(activeCharacterIdAtom);
  const activeCharacter = characters.find((character) => character.id === activeId);

  const [theme, setTheme] = useAtom(themeAtom);
  /* 'system' means no override: clearing the attribute lets index.css's prefers-color-scheme
     media query decide, the same as before this switch existed. index.html applies the
     stored choice before first paint already, so this effect only handles later changes. */
  useEffect(() => {
    if (theme === 'system') {
      delete document.documentElement.dataset.theme;
    } else {
      document.documentElement.dataset.theme = theme;
    }
  }, [theme]);

  /* The reference is a lookup, not a place you live, so this is plain state and never
     reaches localStorage: persisted, the app would reopen on a catalog with the roster's
     character hidden behind it. The roster is the same kind of screen — somewhere you go
     between sessions, not something that sits over the sheet all session long. */
  const [showReference, setShowReference] = useState(false);
  const [showGuide, setShowGuide] = useState(false);
  const [showQuickStart, setShowQuickStart] = useState(false);
  const [showRoster, setShowRoster] = useState(false);

  /** Opening one screen closes the others — they all stand in the sheet's place. */
  function openScreen(screen: 'reference' | 'guide' | 'quickStart' | 'roster' | 'sheet') {
    setShowReference(screen === 'reference');
    setShowGuide(screen === 'guide');
    setShowQuickStart(screen === 'quickStart');
    setShowRoster(screen === 'roster');
  }

  /** Picking a character — or starting a new one — always lands on that character. */
  function openCharacter(id: string | null) {
    setActiveId(id);
    openScreen('sheet');
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

  /** Copies land right after the original and become active, ready for the "what if" edits
   *  they exist for (spending experience, swapping a class) without touching the source. */
  function handleDuplicate(character: Character) {
    const copy = duplicateCharacter(character, t('app.copySuffix'));
    setCharacters((prev) => {
      const index = prev.findIndex((c) => c.id === character.id);
      const next = [...prev];
      next.splice(index + 1, 0, copy);
      return next;
    });
    openCharacter(copy.id);
  }

  function deleteCharacter(id: string) {
    const remaining = characters.filter((character) => character.id !== id);
    setCharacters(remaining);
    /* A null active id is how "New character" opens the creation form, so falling back to
       it after a delete dropped the player into that form with a full roster behind them.
       Move to whoever is left instead, and only go to the form when nobody is. */
    if (activeId === id) setActiveId(remaining[0]?.id ?? null);
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
        {/* The roster used to be a strip of buttons under this bar, on every screen and
            growing a line taller with every character. It is a screen of its own now, and
            this is the way in and out of it. */}
        <button
          type="button"
          onClick={() => openScreen(showRoster ? 'sheet' : 'roster')}
          aria-pressed={showRoster}
        >
          {t('app.roster')} ({characters.length})
        </button>
        <button
          type="button"
          onClick={() => openScreen(showReference ? 'sheet' : 'reference')}
          aria-pressed={showReference}
        >
          {t('reference.open')}
        </button>
        <button type="button" onClick={() => openScreen(showGuide ? 'sheet' : 'guide')} aria-pressed={showGuide}>
          {t('guide.open')}
        </button>
        <button
          type="button"
          onClick={() => openScreen(showQuickStart ? 'sheet' : 'quickStart')}
          aria-pressed={showQuickStart}
        >
          {t('quickStart.open')}
        </button>
        <div className={styles.langSwitch}>
          <label htmlFor="theme-switch">{t('app.theme')}</label>
          <select
            id="theme-switch"
            value={theme}
            onChange={(event) => setTheme(event.target.value as ThemePreference)}
          >
            <option value="system">{t('app.themeSystem')}</option>
            <option value="light">{t('app.themeLight')}</option>
            <option value="dark">{t('app.themeDark')}</option>
          </select>
        </div>
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

      {/* With nobody in the roster there is no roster screen worth opening, so importing a
          file has to be reachable straight from the creation form's page. */}
      {characters.length === 0 && (
        <div className={styles.emptyState}>
          <ImportCharacterButton />
        </div>
      )}

      {showRoster ? (
        <RosterView
          activeId={activeId}
          onOpen={openCharacter}
          onNew={() => openCharacter(null)}
          onDuplicate={handleDuplicate}
          onDelete={deleteCharacter}
          onClose={() => openScreen('sheet')}
        />
      ) : showReference ? (
        <ReferenceView onClose={() => openScreen('sheet')} />
      ) : showGuide ? (
        <GuideView onClose={() => openScreen('sheet')} />
      ) : showQuickStart ? (
        <QuickStartView onClose={() => openScreen('sheet')} />
      ) : activeCharacter ? (
        <CharacterSheetView character={activeCharacter} />
      ) : (
        <>
          <p className={styles.guidePrompt}>
            {t('guide.creationPrompt')}{' '}
            <button type="button" className={styles.guidePromptLink} onClick={() => setShowGuide(true)}>
              {t('guide.creationPromptLink')}
            </button>
          </p>
          <p className={styles.guidePrompt}>
            {t('quickStart.creationPrompt')}{' '}
            <button type="button" className={styles.guidePromptLink} onClick={() => setShowQuickStart(true)}>
              {t('quickStart.creationPromptLink')}
            </button>
          </p>
          <CharacterCreationForm onCreated={(id) => openCharacter(id)} />
        </>
      )}

      <FreeDiceRoller />
    </main>
  );
}

export default App;

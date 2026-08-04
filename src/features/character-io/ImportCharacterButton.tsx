import { useRef, useState } from 'react';
import { useSetAtom } from 'jotai';
import { useTranslation } from 'react-i18next';
import { charactersAtom, activeCharacterIdAtom } from '../../state/characters';
import { parseImportedCharacter } from './characterIo';

export function ImportCharacterButton() {
  const { t } = useTranslation();
  const setCharacters = useSetAtom(charactersAtom);
  const setActiveId = useSetAtom(activeCharacterIdAtom);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const text = await file.text();
    const result = parseImportedCharacter(text);
    if (!result.success) {
      setError(t(`io.error.${result.error}`));
      return;
    }

    setError(null);
    setCharacters((prev) => {
      const withoutDuplicate = prev.filter((c) => c.id !== result.character.id);
      return [...withoutDuplicate, result.character];
    });
    setActiveId(result.character.id);
  }

  return (
    <span>
      <button type="button" onClick={() => inputRef.current?.click()}>
        {t('io.import')}
      </button>
      <input ref={inputRef} type="file" accept="application/json" onChange={handleFileChange} style={{ display: 'none' }} aria-label={t('io.import')} />
      {error && <span role="alert"> {error}</span>}
    </span>
  );
}

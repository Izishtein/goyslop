import { useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { fileToAvatarDataUrl } from '../../lib/avatar';
import { useUpdateCharacter } from '../../state/characters';
import type { Character } from '../../types/character';
import styles from './CharacterSheetView.module.css';

export function AvatarField({ character }: { character: Character }) {
  const { t } = useTranslation();
  const update = useUpdateCharacter(character.id);
  const inputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState('');

  async function pick(file: File | undefined) {
    if (!file) return;
    setError('');
    try {
      const avatar = await fileToAvatarDataUrl(file);
      update((c) => ({ ...c, profile: { ...c.profile, avatar } }));
    } catch {
      // A picked file can be anything — a PDF renamed to .png, a corrupt download.
      setError(t('sheet.avatarError'));
    }
  }

  function clear() {
    update((c) => ({ ...c, profile: { ...c.profile, avatar: '' } }));
    if (inputRef.current) inputRef.current.value = '';
  }

  return (
    <div className={styles.avatarBlock}>
      {character.profile.avatar ? (
        <img className={styles.avatar} src={character.profile.avatar} alt={t('sheet.avatarOf', { name: character.name })} />
      ) : (
        <div className={styles.avatarEmpty} aria-hidden="true" />
      )}

      <div className={`${styles.avatarActions} ${styles.controlRow}`}>
        <label className={styles.avatarPick}>
          {character.profile.avatar ? t('sheet.avatarReplace') : t('sheet.avatarAdd')}
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            onChange={(event) => void pick(event.target.files?.[0])}
            aria-label={t('sheet.avatar')}
          />
        </label>
        {character.profile.avatar && (
          <button type="button" onClick={clear}>
            {t('sheet.remove')}
          </button>
        )}
      </div>

      {error && (
        <p className={styles.empty} role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

import { Info } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { gameIconAuthors, UI_ICON } from './icon-info';
import styles from './IconCredits.module.css';

/**
 * The credit CC BY 3.0 asks for ("Icons made by {author}") and the interface icons' source; lists exactly the authors of
 * the icons in use. Folded into a lone info icon at the foot of the page, so it is one click away and never in the way.
 */
export function IconCredits() {
  const { t } = useTranslation();
  const authors = gameIconAuthors();
  return (
    <footer className={styles.credits}>
      <details>
        <summary aria-label={t('app.credits.title')} title={t('app.credits.title')}>
          <Info {...UI_ICON} />
        </summary>
        <p>
          {t('app.credits.ui')}{' '}
          <a href="https://lucide.dev" target="_blank" rel="noreferrer">
            Lucide
          </a>{' '}
          (ISC) · {t('app.credits.game')}{' '}
          <a href="https://game-icons.net" target="_blank" rel="noreferrer">
            game-icons.net
          </a>{' '}
          (
          <a href="https://creativecommons.org/licenses/by/3.0/" target="_blank" rel="noreferrer">
            CC BY 3.0
          </a>
          ): {t('app.credits.madeBy')} {authors.map((author) => (author.cc0 ? `${author.name} (CC0)` : author.name)).join(', ')}.
        </p>
      </details>
    </footer>
  );
}

import { useTranslation } from 'react-i18next';
import enAbilities from '../../assets/guide/en-abilities.png';
import enRaceBackground from '../../assets/guide/en-race-background.png';
import enSheet from '../../assets/guide/en-sheet.png';
import ruAbilities from '../../assets/guide/ru-abilities.png';
import ruRaceBackground from '../../assets/guide/ru-race-background.png';
import ruSheet from '../../assets/guide/ru-sheet.png';
import styles from './GuideView.module.css';

/* Screenshots are language-specific (the UI text in them is baked in), so the guide swaps
   the whole set rather than trying to caption one language's screenshot for the other. */
const SCREENSHOTS = {
  en: { raceBackground: enRaceBackground, abilities: enAbilities, sheet: enSheet },
  ru: { raceBackground: ruRaceBackground, abilities: ruAbilities, sheet: ruSheet },
};

export function GuideView({ onClose }: { onClose: () => void }) {
  const { t, i18n } = useTranslation();
  const lang = i18n.resolvedLanguage === 'ru' ? 'ru' : 'en';
  const shots = SCREENSHOTS[lang];

  return (
    <article className={styles.guide} aria-labelledby="guide-title">
      <div className={styles.head}>
        <div>
          <h2 id="guide-title">{t('guide.title')}</h2>
          <p className={styles.note}>{t('guide.intro')}</p>
        </div>
        <button type="button" onClick={onClose}>
          {t('guide.close')}
        </button>
      </div>

      <section className={styles.step}>
        <h3>{t('guide.step1Title')}</h3>
        <p>{t('guide.step1Body')}</p>
      </section>

      <section className={styles.step}>
        <h3>{t('guide.step2Title')}</h3>
        <p>{t('guide.step2Body')}</p>
        <figure className={styles.figure}>
          <img src={shots.raceBackground} alt={t('guide.step2ImageAlt')} className={styles.screenshot} />
          <figcaption>{t('guide.step2Caption')}</figcaption>
        </figure>
      </section>

      <section className={styles.step}>
        <h3>{t('guide.step3Title')}</h3>
        <p>{t('guide.step3Body')}</p>
        <p>{t('guide.step3PointBuy')}</p>
        <figure className={styles.figure}>
          <img src={shots.abilities} alt={t('guide.step3ImageAlt')} className={styles.screenshot} />
          <figcaption>{t('guide.step3Caption')}</figcaption>
        </figure>
      </section>

      <section className={styles.step}>
        <h3>{t('guide.step4Title')}</h3>
        <p>{t('guide.step4Body')}</p>
      </section>

      <section className={styles.step}>
        <h3>{t('guide.step5Title')}</h3>
        <p>{t('guide.step5Body')}</p>
        <figure className={styles.figure}>
          <img src={shots.sheet} alt={t('guide.step5ImageAlt')} className={styles.screenshot} />
          <figcaption>{t('guide.step5Caption')}</figcaption>
        </figure>
      </section>

      <section className={styles.step}>
        <h3>{t('guide.nextTitle')}</h3>
        <p>{t('guide.nextBody')}</p>
      </section>
    </article>
  );
}

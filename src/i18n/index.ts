import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import en from './locales/en.json';
import ru from './locales/ru.json';

void i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ru: { translation: ru },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ru'],
    // Without this, a browser reporting "ru-RU" finds no exact resource and falls
    // back to English; languageOnly strips the region so it resolves to "ru".
    load: 'languageOnly',
    interpolation: { escapeValue: false },
  });

export default i18n;

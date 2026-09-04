import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ru from './locales/ru.json';
import tg from './locales/tg.json';

export const SUPPORTED_LANGUAGES = [
  { code: 'ru', label: 'RU' },
  { code: 'tg', label: 'ТҶ' },
] as const;

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      ru: { translation: ru },
      tg: { translation: tg },
    },
    fallbackLng: 'ru',
    supportedLngs: ['ru', 'tg'],
    interpolation: {
      escapeValue: false,
    },
    detection: {
      // Порядок определения языка: сначала то, что пользователь выбрал сам
      // и сохранил, затем язык браузера, и в конце — русский по умолчанию.
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'enter-tj-language',
    },
  });

export default i18n;

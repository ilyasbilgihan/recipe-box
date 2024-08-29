import * as Localization from 'expo-localization';
import { LanguageDetectorModule } from 'i18next';

export const languageDetector: LanguageDetectorModule = {
  type: 'languageDetector',
  detect: () => {
    // const locales = Localization.getLocales(); // default system language
    const firstLanguageCode = 'en';
    return firstLanguageCode;
  },
  init: () => {},
  cacheUserLanguage: () => {},
};

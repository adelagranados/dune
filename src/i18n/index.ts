import * as Localization from 'expo-localization';
import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

import en from './locales/en.json';
import es from './locales/es.json';

const supportedLanguages = ['en', 'es'] as const;
type SupportedLanguage = (typeof supportedLanguages)[number];

function isSupportedLanguage(value: string | undefined): value is SupportedLanguage {
  return supportedLanguages.includes(value as SupportedLanguage);
}

function resolveDeviceLanguage(): SupportedLanguage {
  const deviceLanguage = Localization.getLocales()[0]?.languageCode ?? undefined;
  return isSupportedLanguage(deviceLanguage) ? deviceLanguage : 'en';
}

export function initI18n(languagePreference: 'system' | SupportedLanguage): void {
  const language = languagePreference === 'system' ? resolveDeviceLanguage() : languagePreference;

  if (i18next.isInitialized) {
    // eslint-disable-next-line import/no-named-as-default-member -- documented i18next usage pattern
    void i18next.changeLanguage(language);
    return;
  }

  // eslint-disable-next-line import/no-named-as-default-member -- documented i18next usage pattern
  void i18next.use(initReactI18next).init({
    resources: {
      en: { translation: en },
      es: { translation: es },
    },
    lng: language,
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
}

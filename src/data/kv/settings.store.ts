import { createMMKV } from 'react-native-mmkv';

export type ThemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = 'system' | 'en' | 'es';

const storage = createMMKV({ id: 'dune.settings' });

const KEYS = {
  themePreference: 'themePreference',
  language: 'language',
} as const;

export function getThemePreference(): ThemePreference {
  return (storage.getString(KEYS.themePreference) as ThemePreference | undefined) ?? 'system';
}

export function setThemePreference(value: ThemePreference): void {
  storage.set(KEYS.themePreference, value);
}

export function getLanguagePreference(): LanguagePreference {
  return (storage.getString(KEYS.language) as LanguagePreference | undefined) ?? 'system';
}

export function setLanguagePreference(value: LanguagePreference): void {
  storage.set(KEYS.language, value);
}

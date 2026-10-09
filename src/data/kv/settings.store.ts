import { readValue, writeValue } from '@/data/kv/kvStore';

export type ThemePreference = 'system' | 'light' | 'dark';
export type LanguagePreference = 'system' | 'en' | 'es';

const KEYS = {
  themePreference: 'settings.themePreference',
  language: 'settings.language',
} as const;

export function getThemePreference(): ThemePreference {
  return (readValue(KEYS.themePreference) as ThemePreference | null) ?? 'system';
}

export function setThemePreference(value: ThemePreference): void {
  writeValue(KEYS.themePreference, value);
}

export function getLanguagePreference(): LanguagePreference {
  return (readValue(KEYS.language) as LanguagePreference | null) ?? 'system';
}

export function setLanguagePreference(value: LanguagePreference): void {
  writeValue(KEYS.language, value);
}

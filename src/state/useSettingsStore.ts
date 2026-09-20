import { create } from 'zustand';

import {
  getLanguagePreference,
  getThemePreference,
  setLanguagePreference,
  setThemePreference,
  type LanguagePreference,
  type ThemePreference,
} from '@/data/kv/settings.store';

type SettingsState = {
  themePreference: ThemePreference;
  language: LanguagePreference;
  setThemePreference: (value: ThemePreference) => void;
  setLanguage: (value: LanguagePreference) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themePreference: getThemePreference(),
  language: getLanguagePreference(),
  setThemePreference: (value) => {
    setThemePreference(value);
    set({ themePreference: value });
  },
  setLanguage: (value) => {
    setLanguagePreference(value);
    set({ language: value });
  },
}));

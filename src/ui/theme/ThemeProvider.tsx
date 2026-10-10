import { createContext, useContext, useMemo, type PropsWithChildren } from 'react';
import { useColorScheme } from 'react-native';

import { useSettingsStore } from '@/state/useSettingsStore';

import {
  darkColors,
  fontFamily,
  fontSize,
  lightColors,
  lineHeight,
  projectColors,
  radius,
  spacing,
  type ColorTokens,
  type ProjectColorTokens,
} from './tokens';

type Theme = {
  colorScheme: 'light' | 'dark';
  colors: ColorTokens;
  spacing: typeof spacing;
  radius: typeof radius;
  fontSize: typeof fontSize;
  fontFamily: typeof fontFamily;
  lineHeight: typeof lineHeight;
  /** Project swatches already resolved for the active theme. */
  projectColors: ProjectColorTokens;
};

const ThemeContext = createContext<Theme | null>(null);

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const themePreference = useSettingsStore((state) => state.themePreference);

  const colorScheme =
    themePreference === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : themePreference;

  const theme = useMemo<Theme>(
    () => ({
      colorScheme,
      colors: colorScheme === 'dark' ? darkColors : lightColors,
      spacing,
      radius,
      fontSize,
      fontFamily,
      lineHeight,
      projectColors: colorScheme === 'dark' ? projectColors.dark : projectColors.light,
    }),
    [colorScheme],
  );

  return <ThemeContext.Provider value={theme}>{children}</ThemeContext.Provider>;
}

export function useTheme(): Theme {
  const theme = useContext(ThemeContext);
  if (!theme) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return theme;
}

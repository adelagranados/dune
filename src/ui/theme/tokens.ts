export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const radius = {
  sm: 12,
  md: 18,
  lg: 26,
  xl: 28,
  full: 32,
} as const;

export const fontSize = {
  label: 11,
  secondary: 13,
  body: 15,
  heading2: 24,
  heading1: 39,
} as const;

export const fontFamily = {
  display: 'DMSerifDisplay_400Regular',
  displayItalic: 'DMSerifDisplay_400Regular_Italic',
  body: 'Manrope_400Regular',
  bodyMedium: 'Manrope_500Medium',
  bodySemiBold: 'Manrope_600SemiBold',
  bodyBold: 'Manrope_700Bold',
} as const;

export type ColorTokens = {
  background: string;
  surface: string;
  surfaceElevated: string;
  textPrimary: string;
  textSecondary: string;
  divider: string;
  primary: string;
};

export const lightColors: ColorTokens = {
  background: '#FCFAF7',
  surface: '#F4F1ED',
  // No distinct "Elevated/Light" swatch exists in the Figma Design System page
  // (only Dark defines one) — light mode leans on shadow for elevation, so it
  // reuses `surface` until a real elevated surface shows up in a design pass.
  surfaceElevated: '#F4F1ED',
  textPrimary: '#29231F',
  textSecondary: '#6D625B',
  divider: '#E9E3DC',
  primary: '#C86F52',
};

export const darkColors: ColorTokens = {
  background: '#1E1A18',
  surface: '#29231F',
  surfaceElevated: '#342D29',
  textPrimary: '#FAF4EC',
  textSecondary: '#B9ADA5',
  divider: '#453B36',
  primary: '#D98568',
};

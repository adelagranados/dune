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
  lg: 24,
  xl: 26,
  '2xl': 28,
  full: 32,
} as const;

export const fontSize = {
  label: 11,
  secondary: 13,
  button: 14,
  body: 15,
  wordmark: 18,
  heading3: 20,
  heading2: 26,
  heading1: 34,
  display: 40,
  displayLarge: 48,
} as const;

export const fontFamily = {
  display: 'DMSerifDisplay_400Regular',
  displayItalic: 'DMSerifDisplay_400Regular_Italic',
  // The brand wordmark is the one place that uses Playfair Display.
  wordmark: 'PlayfairDisplay_400Regular',
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
  /**
   * Hint text inside an input. Deliberately dimmer than `textSecondary`: a
   * placeholder drawn in the same colour as real content is indistinguishable
   * from an entered value, which is a question of legibility rather than taste.
   */
  textPlaceholder: string;
  divider: string;
  primary: string;
  /**
   * Primary used as *text*. The brand terracotta only reaches 3.44:1 on the
   * light background, under the 4.5:1 AA needs for normal text, so small
   * accent text and links use this darker variant while fills keep `primary`.
   */
  primaryText: string;
  /** Text/icons rendered on top of `primary` — not simply white. */
  onPrimary: string;
  /**
   * Destructive actions. Not in the Figma palette: deleting only became
   * possible later, and the terracotta primary is too close to a warning
   * colour to carry the meaning on its own. Sits at hue ~6-9 against the
   * primary's ~15, so it reads as red rather than as the brand.
   */
  danger: string;
};

export const lightColors: ColorTokens = {
  background: '#FCFAF7',
  surface: '#E7DCD1',
  surfaceElevated: '#FCFAF7',
  textPrimary: '#29231F',
  textSecondary: '#665A52',
  // Recalibrated when `surface` darkened: it is tuned against the input
  // surface, not against the page, so moving one moves the other.
  textPlaceholder: '#8D8077',
  divider: '#C9B9AC',
  primary: '#C86F52',
  primaryText: '#954A34',
  // Ink rather than cream: cream on terracotta is only 3.28:1, under AA.
  onPrimary: '#1E1A18',
  danger: '#A8372A',
};

export const darkColors: ColorTokens = {
  background: '#1E1A18',
  surface: '#3B322C',
  surfaceElevated: '#4A3D36',
  textPrimary: '#FAF4EC',
  textSecondary: '#B9ADA5',
  textPlaceholder: '#897C73',
  divider: '#5B4D45',
  primary: '#D98568',
  // Dark needs no darker variant: the brand colour already clears AA there.
  primaryText: '#D98568',
  onPrimary: '#1E1A18',
  // Lifted when `surface` lightened, which had pushed this under AA.
  danger: '#EE8271',
};

/**
 * Explicit line heights for the serif display sizes.
 *
 * Android measures a Text from the font's own metrics, and DM Serif Display
 * overshoots them, so large serif text is clipped at the view bounds without
 * one of these. iOS lays the same text out fine, which is why it only showed
 * up for some testers.
 */
export const lineHeight = {
  heading2: 34,
  heading1: 44,
  display: 52,
  displayLarge: 62,
} as const;

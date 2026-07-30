export const palette = {
  primary: '#00D09C',
  primaryLight: '#00D09C20',
  blue: '#0A84FF',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
  indigo: '#5E5CE6',
  red: '#FF453A',
  activityOrange: '#FF9F43',
  activityGreen: '#34C759',
} as const;

export type ThemeMode = 'light' | 'dark';

export interface ThemeColors {
  background: string;
  backgroundGradientStart: string;
  backgroundGradientEnd: string;
  card: string;
  cardAlt: string;
  input: string;
  inputFocusedBorder: string;
  primary: string;
  primaryLight: string;
  textPrimary: string;
  textSecondary: string;
  textTertiary: string;
  border: string;
  error: string;
  errorBackground: string;
  success: string;
  successBackground: string;
  warning: string;
  warningBackground: string;
  blue: string;
  orange: string;
  purple: string;
  indigo: string;
  red: string;
  activityOrange: string;
  activityGreen: string;
}

export const lightColors: ThemeColors = {
  background: '#F5F5F7',
  backgroundGradientStart: '#F5F5F7',
  backgroundGradientEnd: '#EBEBF0',
  card: '#FFFFFF',
  cardAlt: '#F5F5F7',
  input: '#EBEBF0',
  inputFocusedBorder: '#00D09C',
  primary: '#00D09C',
  primaryLight: '#00D09C20',
  textPrimary: '#0B0B0F',
  textSecondary: '#6B6B78',
  textTertiary: '#9E9EAA',
  border: '#E5E5EA',
  error: '#FF453A',
  errorBackground: '#FF453A15',
  success: '#00D09C',
  successBackground: '#00D09C15',
  warning: '#FF9F0A',
  warningBackground: '#FF9F0A15',
  blue: '#0A84FF',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
  indigo: '#5E5CE6',
  red: '#FF453A',
  activityOrange: '#FF9F43',
  activityGreen: '#34C759',
};

export const darkColors: ThemeColors = {
  background: '#0B0B0F',
  backgroundGradientStart: '#0B0B0F',
  backgroundGradientEnd: '#15151C',
  card: '#15151C',
  cardAlt: '#1C1C24',
  input: '#1E1E27',
  inputFocusedBorder: '#00D09C',
  primary: '#00D09C',
  primaryLight: '#00D09C20',
  textPrimary: '#FFFFFF',
  textSecondary: '#8E8E9C',
  textTertiary: '#6B6B78',
  border: '#2C2C35',
  error: '#FF453A',
  errorBackground: '#FF453A15',
  success: '#00D09C',
  successBackground: '#00D09C15',
  warning: '#FF9F0A',
  warningBackground: '#FF9F0A15',
  blue: '#0A84FF',
  orange: '#FF9F0A',
  purple: '#BF5AF2',
  indigo: '#5E5CE6',
  red: '#FF453A',
  activityOrange: '#FF9F43',
  activityGreen: '#34C759',
};

export function getColors(mode: ThemeMode): ThemeColors {
  return mode === 'dark' ? darkColors : lightColors;
}

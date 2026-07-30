import { useColorScheme } from 'react-native';
import { getColors, type ThemeColors, type ThemeMode } from './colors.js';
import { fontSizes, fontWeights, lineHeights } from './typography.js';
import { spacing, radii } from './spacing.js';

export interface Theme {
  mode: ThemeMode;
  colors: ThemeColors;
  fontSizes: typeof fontSizes;
  fontWeights: typeof fontWeights;
  lineHeights: typeof lineHeights;
  spacing: typeof spacing;
  radii: typeof radii;
}

export function useTheme(): Theme {
  const colorScheme = useColorScheme();
  const mode: ThemeMode = colorScheme === 'dark' ? 'dark' : 'light';
  return {
    mode,
    colors: getColors(mode),
    fontSizes,
    fontWeights,
    lineHeights,
    spacing,
    radii,
  };
}

export function createStaticTheme(mode: ThemeMode): Theme {
  return {
    mode,
    colors: getColors(mode),
    fontSizes,
    fontWeights,
    lineHeights,
    spacing,
    radii,
  };
}

export * from './colors.js';
export * from './typography.js';
export * from './spacing.js';

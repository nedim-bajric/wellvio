import { getColors, type ThemeColors, type ThemeMode } from './colors';
import { fontSizes, fontWeights, lineHeights } from './typography';
import { spacing, radii } from './spacing';
import { useThemeMode } from './ThemeProvider';

export { ThemeProvider, useThemeMode } from './ThemeProvider';

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
  const { mode } = useThemeMode();

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

export * from './colors';
export * from './typography';
export * from './spacing';

import { useColorScheme, type ColorSchemeName } from 'react-native';
import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from 'react';
import * as SecureStore from 'expo-secure-store';
import type { ThemeMode } from './colors';

const THEME_STORAGE_KEY = 'wellvio-theme-mode';

function resolveMode(colorScheme: ColorSchemeName): ThemeMode {
  return colorScheme === 'dark' ? 'dark' : 'light';
}

interface ThemeContextValue {
  /** The currently active theme mode (never 'system'). */
  mode: ThemeMode;
  /** Set the active theme mode and persist the choice. */
  setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextValue | null>(null);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const colorScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>(resolveMode(colorScheme));

  useEffect(() => {
    let mounted = true;

    async function loadStoredTheme() {
      try {
        const stored = await SecureStore.getItemAsync(THEME_STORAGE_KEY);
        if (stored === 'dark' || stored === 'light') {
          if (mounted) {
            setModeState(stored);
          }
        }
      } catch {
        // Ignore read failures and fall back to the system color scheme.
      }
    }

    loadStoredTheme();

    return () => {
      mounted = false;
    };
  }, []);

  const setMode = useCallback(async (nextMode: ThemeMode) => {
    setModeState(nextMode);
    try {
      await SecureStore.setItemAsync(THEME_STORAGE_KEY, nextMode);
    } catch {
      // Ignore write failures (e.g. device without secure hardware).
    }
  }, []);

  return (
    <ThemeContext.Provider value={{ mode, setMode }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useThemeMode(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  const colorScheme = useColorScheme();

  if (!ctx) {
    return {
      mode: resolveMode(colorScheme),
      setMode: () => {},
    };
  }

  return ctx;
}

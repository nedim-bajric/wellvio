import { View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../theme/index';
import { spacing } from '../theme/spacing';
import { TAB_BAR_HEIGHT } from '../constants/layout';

interface SafeScreenProps {
  children: React.ReactNode;
  /** Set to true when this screen sits behind the Main tab bar. */
  hasTabBar?: boolean;
}

/**
 * Wrapper that applies the top safe-area inset and, for screens without
 * the bottom tab bar, the bottom safe-area inset. Screens that live inside
 * the tab navigator should use `hasTabBar` and add {@link useTabBarPadding}
 * to their ScrollView content so the last items are not hidden behind the
 * floating tab bar.
 *
 * The screen's default background color matches the current theme.
 */
export function SafeScreen({
  children,
  hasTabBar = false,
}: SafeScreenProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  return (
    <View
      style={[
        styles.container,
        {
          paddingTop: insets.top,
          paddingBottom: hasTabBar ? 0 : insets.bottom,
          backgroundColor: theme.colors.background,
        },
      ]}
    >
      {children}
    </View>
  );
}

/**
 * Returns the bottom padding a tab screen's ScrollView needs so its content
 * clears the floating tab bar plus a small margin.
 */
export function useTabBarPadding(): number {
  const insets = useSafeAreaInsets();
  return TAB_BAR_HEIGHT + insets.bottom + spacing[4];
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

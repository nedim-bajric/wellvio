import { TouchableOpacity, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Plus } from 'lucide-react-native';
import { useTheme } from '../theme/index';
import { TAB_BAR_HEIGHT } from '../constants/layout';

interface FloatingAddButtonProps {
  onPress: () => void;
}

export function FloatingAddButton({ onPress }: FloatingAddButtonProps) {
  const theme = useTheme();
  const insets = useSafeAreaInsets();

  // Position the FAB above the floating tab bar so it stays visible.
  const bottomOffset = TAB_BAR_HEIGHT + insets.bottom + 12;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      style={[
        styles.button,
        {
          backgroundColor: theme.colors.primary,
          bottom: bottomOffset,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.2,
          shadowRadius: 8,
          elevation: 6,
        },
      ]}
      accessibilityLabel="Add food"
      accessibilityRole="button"
    >
      <Plus size={28} color="#000000" strokeWidth={2.5} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    position: 'absolute',
    right: 20,
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

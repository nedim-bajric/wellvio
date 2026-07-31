import {
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { useTheme } from '../../theme/index';

interface WvToggleProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
}

export function WvToggle({ value, onValueChange }: WvToggleProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={() => onValueChange(!value)}
      activeOpacity={0.9}
      style={[
        styles.track,
        {
          backgroundColor: value ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      <View
        style={[
          styles.thumb,
          {
            transform: [{ translateX: value ? 20 : 2 }],
          },
        ]}
      />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  track: {
    width: 48,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    padding: 2,
  },
  thumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
});

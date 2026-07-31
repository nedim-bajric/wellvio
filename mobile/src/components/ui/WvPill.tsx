import {
  TouchableOpacity,
  Text,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/index';

interface WvPillProps<T extends string> {
  label: string;
  selected: boolean;
  onPress: () => void;
  style?: ViewStyle;
  value?: T;
}

export function WvPill<T extends string>({
  label,
  selected,
  onPress,
  style,
}: WvPillProps<T>) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.pill,
        {
          backgroundColor: selected
            ? theme.colors.primaryLight
            : theme.colors.input,
          borderColor: selected ? theme.colors.primary : 'transparent',
          borderWidth: 2,
        },
        style,
      ]}
    >
      <Text
        style={[
          styles.text,
          {
            color: selected ? theme.colors.primary : theme.colors.textSecondary,
          },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 14,
    fontWeight: '500',
  },
});

import {
  TouchableOpacity,
  View,
  StyleSheet,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { useTheme } from '../../theme/index';

interface WvCheckboxProps {
  checked: boolean;
  onPress: () => void;
  size?: number;
}

export function WvCheckbox({ checked, onPress, size = 24 }: WvCheckboxProps) {
  const theme = useTheme();
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.box,
        {
          width: size,
          height: size,
          borderRadius: size / 5,
          backgroundColor: checked ? theme.colors.primary : 'transparent',
          borderColor: checked ? theme.colors.primary : theme.colors.border,
        },
      ]}
    >
      {checked && <Check size={size * 0.6} color="#000000" strokeWidth={3} />}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  box: {
    borderWidth: 2,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

import {
  TouchableOpacity,
  StyleSheet,
  type ViewStyle,
} from 'react-native';
import { useTheme } from '../../theme/index.js';

interface WvIconButtonProps {
  icon: React.ReactNode;
  onPress: () => void;
  size?: 'sm' | 'md';
  variant?: 'default' | 'filled';
  style?: ViewStyle;
}

export function WvIconButton({
  icon,
  onPress,
  size = 'md',
  variant = 'filled',
  style,
}: WvIconButtonProps) {
  const theme = useTheme();
  const buttonSize = size === 'md' ? 44 : 32;

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          width: buttonSize,
          height: buttonSize,
          borderRadius: buttonSize / 2,
          backgroundColor:
            variant === 'filled' ? theme.colors.input : 'transparent',
        },
        style,
      ]}
    >
      {icon}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});

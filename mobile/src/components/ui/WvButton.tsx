import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  type ViewStyle,
  type TextStyle,
} from 'react-native';
import { useTheme } from '../../theme/index';

interface WvButtonProps {
  title?: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  icon?: React.ReactNode;
  children?: React.ReactNode;
}

export function WvButton({
  title,
  onPress,
  variant = 'primary',
  size = 'lg',
  disabled = false,
  loading = false,
  style,
  textStyle,
  icon,
  children,
}: WvButtonProps) {
  const theme = useTheme();

  const backgroundColor =
    variant === 'primary'
      ? theme.colors.primary
      : variant === 'secondary'
        ? theme.mode === 'dark'
          ? theme.colors.card
          : '#FFFFFF'
        : variant === 'danger'
          ? theme.colors.red
          : 'transparent';

  const borderColor =
    variant === 'outline'
      ? theme.colors.border
      : variant === 'secondary'
        ? theme.colors.border
        : 'transparent';

  const color =
    variant === 'primary' || variant === 'danger'
      ? '#000000'
      : theme.colors.textPrimary;

  const height = size === 'lg' ? 56 : size === 'md' ? 48 : 40;
  const fontSize = size === 'lg' ? 17 : size === 'md' ? 15 : 14;

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.button,
        {
          height,
          backgroundColor,
          borderColor,
          borderWidth: variant === 'outline' || variant === 'secondary' ? 1 : 0,
          opacity: disabled || loading ? 0.6 : 1,
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={color} />
      ) : children ? (
        children
      ) : (
        <>
          {icon}
          <Text
            style={[
              styles.text,
              {
                color,
                fontSize,
                marginLeft: icon ? 8 : 0,
              },
              textStyle,
            ]}
          >
            {title}
          </Text>
        </>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  button: {
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  text: {
    fontWeight: '600',
  },
});

import {
  View,
  StyleSheet,
  type ViewStyle,
  type ViewProps,
} from 'react-native';
import { useTheme } from '../../theme/index';

interface WvCardProps extends ViewProps {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  variant?: 'default' | 'alt';
}

export function WvCard({ children, style, variant = 'default', ...rest }: WvCardProps) {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.card,
        {
          backgroundColor:
            variant === 'alt' ? theme.colors.cardAlt : theme.colors.card,
          borderColor: theme.colors.border,
        },
        style,
      ]}
      {...rest}
    >
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
  },
});

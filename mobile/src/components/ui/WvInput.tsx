import {
  View,
  TextInput,
  Text,
  TouchableOpacity,
  StyleSheet,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react-native';
import { useTheme } from '../../theme/index';

interface WvInputProps {
  label?: string;
  value: string;
  onChangeText?: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  keyboardType?: 'default' | 'email-address' | 'number-pad' | 'decimal-pad' | 'phone-pad';
  error?: string;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  size?: 'md' | 'lg';
  textAlign?: 'left' | 'center' | 'right';
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  editable?: boolean;
}

export function WvInput({
  label,
  value,
  onChangeText,
  placeholder,
  secureTextEntry = false,
  keyboardType = 'default',
  error,
  style,
  inputStyle,
  size = 'lg',
  textAlign = 'left',
  autoCapitalize,
  autoCorrect,
  maxLength,
  multiline = false,
  numberOfLines,
  editable = true,
}: WvInputProps) {
  const theme = useTheme();
  const [showPassword, setShowPassword] = useState(false);
  const isPassword = secureTextEntry;
  const height = size === 'lg' ? 56 : 48;
  const fontSize = size === 'lg' ? 17 : 16;

  return (
    <View style={style}>
      {label && (
        <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
          {label}
        </Text>
      )}
      <View
        style={[
          styles.container,
          {
            height: multiline ? undefined : height,
            minHeight: multiline ? height : undefined,
            backgroundColor: theme.colors.input,
            borderColor: error
              ? theme.colors.error
              : theme.colors.inputFocusedBorder,
            borderWidth: error ? 2 : 2,
          },
        ]}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.colors.textTertiary}
          secureTextEntry={isPassword && !showPassword}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={numberOfLines}
          textAlign={textAlign}
          editable={editable}
          style={[
            styles.input,
            {
              color: editable ? theme.colors.textPrimary : theme.colors.textTertiary,
              fontSize,
            },
            inputStyle,
          ]}
        />
        {isPassword && (
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            {showPassword ? (
              <EyeOff size={20} color={theme.colors.textTertiary} />
            ) : (
              <Eye size={20} color={theme.colors.textTertiary} />
            )}
          </TouchableOpacity>
        )}
      </View>
      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  label: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 6,
  },
  container: {
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    paddingVertical: 0,
    textAlignVertical: 'center',
  },
  eyeButton: {
    marginLeft: 12,
  },
  error: {
    fontSize: 12,
    marginTop: 6,
  },
});

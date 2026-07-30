import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { WvInput } from '../../components/ui/WvInput.js';
import { WvButton } from '../../components/ui/WvButton.js';
import { WvBackButton } from '../../components/ui/WvBackButton.js';
import { useTheme } from '../../theme/index.js';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { AuthStackParamList } from '../../navigation/types.js';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<AuthStackParamList, 'ForgotPassword'>;
}

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSend = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setSent(true);
    }, 1000);
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvBackButton onPress={() => navigation.navigate('Login')} />
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        {!sent ? (
          <>
            <View style={styles.intro}>
              <Text
                style={[
                  styles.title,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Reset password
              </Text>
              <Text
                style={[
                  styles.subtitle,
                  { color: theme.colors.textSecondary },
                ]}
              >
                Enter your email and we&apos;ll send you a link.
              </Text>
            </View>

            <WvInput
              label="Email"
              value={email}
              onChangeText={setEmail}
              placeholder="you@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <View style={styles.actions}>
              <WvButton
                title="Send link"
                onPress={handleSend}
                loading={loading}
                disabled={!email}
              />
            </View>
          </>
        ) : (
          <View style={styles.success}>
            <View
              style={[
                styles.iconCircle,
                { backgroundColor: theme.colors.successBackground },
              ]}
            >
              <Check size={40} color={theme.colors.primary} strokeWidth={3} />
            </View>
            <View style={styles.successText}>
              <Text
                style={[
                  styles.successTitle,
                  { color: theme.colors.textPrimary },
                ]}
              >
                Check your email
              </Text>
              <Text
                style={[
                  styles.successBody,
                  { color: theme.colors.textSecondary },
                ]}
              >
                We sent a reset link to{' '}
                <Text style={{ color: theme.colors.textPrimary }}>{email}</Text>
              </Text>
            </View>
            <WvButton
              title="Back to sign in"
              onPress={() => navigation.navigate('Login')}
            />
          </View>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
  },
  intro: {
    gap: 8,
    marginBottom: 32,
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
  },
  actions: {
    marginTop: 24,
  },
  success: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    paddingHorizontal: 16,
  },
  iconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  successText: {
    alignItems: 'center',
    gap: 8,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
  },
  successBody: {
    fontSize: 17,
    textAlign: 'center',
    lineHeight: 24,
  },
});

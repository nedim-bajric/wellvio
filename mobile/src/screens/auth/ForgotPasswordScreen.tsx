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
import { WvInput } from '../../components/ui/WvInput';
import { WvButton } from '../../components/ui/WvButton';
import { WvBackButton } from '../../components/ui/WvBackButton';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { supabase } from '../../lib/supabase';
import { showAuthErrorToast } from '../../errors';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface ForgotPasswordScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ForgotPassword'>;
}

const RESET_PASSWORD_REDIRECT_URL = 'wellvio://reset-password';

export function ForgotPasswordScreen({ navigation }: ForgotPasswordScreenProps) {
  const theme = useTheme();
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [emailError, setEmailError] = useState<string | undefined>(undefined);

  const handleSend = async () => {
    if (!email) {
      setEmailError('Email is required.');
      return;
    }
    setEmailError(undefined);
    setLoading(true);
    const { error: resetError } = await supabase.auth.resetPasswordForEmail(
      email,
      { redirectTo: RESET_PASSWORD_REDIRECT_URL },
    );
    setLoading(false);
    if (resetError) {
      showAuthErrorToast(resetError);
      return;
    }
    setSent(true);
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
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
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) {
                    setEmailError(undefined);
                  }
                }}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                error={emailError}
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
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 20,
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

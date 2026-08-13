import { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Linking,
} from 'react-native';
import { WvInput } from '../../components/ui/WvInput';
import { WvButton } from '../../components/ui/WvButton';
import { WvBackButton } from '../../components/ui/WvBackButton';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { supabase } from '../../lib/supabase';
import { showAuthErrorToast } from '../../errors';
import { MIN_PASSWORD_LENGTH } from '../../constants/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface ResetPasswordScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ResetPassword'>;
}

function parseHashParams(url: string): Record<string, string> {
  const hashIndex = url.indexOf('#');
  const hash = hashIndex >= 0 ? url.slice(hashIndex + 1) : '';
  const params: Record<string, string> = {};
  for (const pair of hash.split('&')) {
    const [key, ...valueParts] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = valueParts.length
        ? decodeURIComponent(valueParts.join('='))
        : '';
    }
  }
  return params;
}

function parseSearchParams(url: string): Record<string, string> {
  const queryIndex = url.indexOf('?');
  const query = queryIndex >= 0 ? url.slice(queryIndex + 1) : '';
  const params: Record<string, string> = {};
  for (const pair of query.split('&')) {
    const [key, ...valueParts] = pair.split('=');
    if (key) {
      params[decodeURIComponent(key)] = valueParts.length
        ? decodeURIComponent(valueParts.join('='))
        : '';
    }
  }
  return params;
}

export function ResetPasswordScreen({ navigation }: ResetPasswordScreenProps) {
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [sessionError, setSessionError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | undefined>(undefined);
  const [confirmError, setConfirmError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function handleDeepLink(url: string | null) {
      if (!url) {
        if (active) setSessionLoading(false);
        return;
      }

      // PKCE flow: Supabase sends ?code=...&type=recovery in the redirect URL.
      const searchParams = parseSearchParams(url);
      const code = searchParams.code;
      const type = searchParams.type;
      if (code && type === 'recovery') {
        const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
        if (active) {
          if (exchangeError) {
            setError(exchangeError.message);
          }
          setSessionLoading(false);
        }
        return;
      }

      // Legacy implicit flow: tokens are in the URL hash fragment.
      const hashParams = parseHashParams(url);
      const accessToken = hashParams.access_token;
      const refreshToken = hashParams.refresh_token;
      if (!accessToken || !refreshToken) {
        if (active) {
          setSessionError('Invalid or expired password reset link.');
          setSessionLoading(false);
        }
        return;
      }
      const { error: sessionError } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      });
      if (active) {
        if (sessionError) {
          setSessionError(sessionError.message);
        }
        setSessionLoading(false);
      }
    }

    Linking.getInitialURL().then(handleDeepLink);
    const subscription = Linking.addEventListener('url', (event) => {
      handleDeepLink(event.url);
    });

    return () => {
      active = false;
      subscription.remove();
    };
  }, []);

  const handleSubmit = async () => {
    setPasswordError(undefined);
    setConfirmError(undefined);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setPasswordError(
        `Password must be at least ${MIN_PASSWORD_LENGTH} characters.`,
      );
      return;
    }
    if (password !== confirm) {
      setConfirmError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);
    if (updateError) {
      showAuthErrorToast(updateError);
      return;
    }
    setSuccess(true);
    setTimeout(() => {
      navigation.navigate('Login');
    }, 1500);
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
          <View style={styles.intro}>
            <Text
              style={[
                styles.title,
                { color: theme.colors.textPrimary },
              ]}
            >
              Create new password
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Enter a new password for your account.
            </Text>
          </View>

          {sessionLoading ? (
            <Text style={[styles.status, { color: theme.colors.textSecondary }]}>
              Checking reset link…
            </Text>
          ) : sessionError ? (
            <Text style={[styles.status, { color: theme.colors.error }]}>
              {sessionError}
            </Text>
          ) : success ? (
            <Text style={[styles.status, { color: theme.colors.primary }]}>
              Password updated. Redirecting to sign in…
            </Text>
          ) : (
            <>
              <View style={styles.form}>
                <WvInput
                  label="New password"
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    if (passwordError) {
                      setPasswordError(undefined);
                    }
                  }}
                  placeholder={`Min. ${MIN_PASSWORD_LENGTH} characters`}
                  secureTextEntry
                  error={passwordError}
                />
                <WvInput
                  label="Confirm new password"
                  value={confirm}
                  onChangeText={(text) => {
                    setConfirm(text);
                    if (confirmError) {
                      setConfirmError(undefined);
                    }
                  }}
                  placeholder="Repeat password"
                  secureTextEntry
                  error={confirmError}
                />
              </View>

              <View style={styles.actions}>
                <WvButton
                  title="Update password"
                  onPress={handleSubmit}
                  loading={loading}
                  disabled={!password || !confirm}
                />
              </View>
            </>
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
  status: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 24,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  actions: {
    marginTop: 'auto',
  },
});

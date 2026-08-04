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

export function ResetPasswordScreen({ navigation }: ResetPasswordScreenProps) {
  const theme = useTheme();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    let active = true;

    async function handleDeepLink(url: string | null) {
      if (!url) {
        if (active) setSessionLoading(false);
        return;
      }
      const params = parseHashParams(url);
      const accessToken = params.access_token;
      const refreshToken = params.refresh_token;
      if (!accessToken || !refreshToken) {
        if (active) {
          setError('Invalid or expired password reset link.');
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
          setError(sessionError.message);
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
    setError(null);
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }
    if (password !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({
      password,
    });
    setLoading(false);
    if (updateError) {
      setError(updateError.message);
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
                  onChangeText={setPassword}
                  placeholder={`Min. ${MIN_PASSWORD_LENGTH} characters`}
                  secureTextEntry
                />
                <WvInput
                  label="Confirm new password"
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder="Repeat password"
                  secureTextEntry
                  error={
                    confirm && confirm !== password
                      ? 'Passwords do not match'
                      : undefined
                  }
                />
                {error && (
                  <Text style={[styles.error, { color: theme.colors.error }]}>
                    {error}
                  </Text>
                )}
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
  error: {
    fontSize: 14,
    textAlign: 'center',
  },
});

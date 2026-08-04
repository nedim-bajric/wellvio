import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
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

interface ChangePasswordScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'ChangePassword'>;
}

export function ChangePasswordScreen({ navigation }: ChangePasswordScreenProps) {
  const theme = useTheme();
  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    setError(null);
    if (currentPassword.length < MIN_PASSWORD_LENGTH) {
      setError('Please enter your current password.');
      return;
    }
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
  };

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <WvBackButton onPress={() => navigation.goBack()} />
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
              Change password
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              Choose a new password for your account.
            </Text>
          </View>

          {success ? (
            <Text style={[styles.success, { color: theme.colors.primary }]}>
              Your password has been updated.
            </Text>
          ) : (
            <>
              <View style={styles.form}>
                <WvInput
                  label="Current password"
                  value={currentPassword}
                  onChangeText={setCurrentPassword}
                  placeholder="Your current password"
                  secureTextEntry
                />
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
                  disabled={!currentPassword || !password || !confirm}
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
  success: {
    fontSize: 17,
    textAlign: 'center',
    marginTop: 24,
  },
});

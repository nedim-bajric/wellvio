import { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import { WvInput } from '../../components/ui/WvInput';
import { WvButton } from '../../components/ui/WvButton';
import { WvBackButton } from '../../components/ui/WvBackButton';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { accountApi } from '../../api/accountApi';
import { MIN_PASSWORD_LENGTH } from '../../constants/auth';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface DeleteAccountScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'DeleteAccount'>;
}

export function DeleteAccountScreen({ navigation }: DeleteAccountScreenProps) {
  const theme = useTheme();
  const { user, signOut } = useAuth();
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleDelete = async () => {
    setError(null);

    if (password.length < MIN_PASSWORD_LENGTH) {
      setError('Please enter your password.');
      return;
    }

    const email = user?.email;
    if (!email) {
      setError('User email is missing.');
      return;
    }

    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setLoading(false);
      setError('Password is incorrect.');
      return;
    }

    try {
      await accountApi.delete();
    } catch (apiError) {
      setLoading(false);
      setError(apiError instanceof Error ? apiError.message : 'Failed to wipe account data.');
      return;
    }

    const { error: rpcError } = await supabase.rpc('delete_user');

    if (rpcError) {
      setLoading(false);
      const message = rpcError.message;
      if (message.toLowerCase().includes('could not find the function')) {
        setError(
          'Account deletion is not configured yet. Please apply the latest Supabase migration and try again.',
        );
      } else {
        setError(message);
      }
      return;
    }

    const { error: signOutError } = await signOut();
    setLoading(false);

    if (signOutError) {
      setError(signOutError.message);
      return;
    }

    navigation.getParent()?.navigate('Welcome');
  };

  const confirmDelete = () => {
    Alert.alert(
      'Delete your account?',
      'This will permanently delete all your data and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete account',
          style: 'destructive',
          onPress: handleDelete,
        },
      ],
      { cancelable: true },
    );
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
              Delete account
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              This will permanently remove your profile, foods, log entries,
              weight history, and account. This action cannot be undone.
            </Text>
          </View>

          <View style={styles.form}>
            <WvInput
              label="Confirm your password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              secureTextEntry
            />
            {error && (
              <Text style={[styles.error, { color: theme.colors.error }]}>
                {error}
              </Text>
            )}
          </View>

          <View style={styles.actions}>
            <WvButton
              title="Delete my account"
              onPress={confirmDelete}
              loading={loading}
              disabled={!password || loading}
              variant="danger"
            />
          </View>
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
});

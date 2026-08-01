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
import { WvProgressBar } from '../../components/ui/WvProgressBar';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface RegisterScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'Register'>;
}

export function RegisterScreen({ navigation }: RegisterScreenProps) {
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const passwordStrength =
    password.length === 0 ? 0 : password.length < 6 ? 1 : password.length < 10 ? 2 : 3;
  const strengthColors = [theme.colors.red, theme.colors.orange, theme.colors.primary];
  const strengthLabels = ['Weak', 'Fair', 'Strong'];

  const handleContinue = () => {
    if (step === 1) {
      setStep(2);
      return;
    }
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      navigation.navigate('Onboarding');
    }, 1000);
  };

  const stepValid =
    step === 1
      ? email.length > 0 && password.length >= 6 && password === confirm
      : name.length > 0;

  return (
    <SafeScreen>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.container}
      >
        <View style={styles.header}>
          <WvBackButton
            onPress={() =>
              step === 1
                ? navigation.navigate('Welcome')
                : setStep(1)
            }
          />
          <Text style={[styles.step, { color: theme.colors.textSecondary }]}>
            Step {step} of 2
          </Text>
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
              {step === 1 ? 'Create account' : 'Your name'}
            </Text>
            <Text
              style={[
                styles.subtitle,
                { color: theme.colors.textSecondary },
              ]}
            >
              {step === 1 ? 'Set up your credentials' : 'How should we address you?'}
            </Text>
          </View>

          <WvProgressBar
            progress={step === 1 ? 0.5 : 1}
            color={theme.colors.primary}
            bgColor={theme.colors.input}
            height={4}
            style={styles.progress}
          />

          {step === 1 ? (
            <View style={styles.form}>
              <WvInput
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <WvInput
                label="Password"
                value={password}
                onChangeText={setPassword}
                placeholder="Min. 8 characters"
                secureTextEntry
              />
              {password.length > 0 && (
                <View style={styles.strength}>
                  <View style={styles.strengthBars}>
                    {[1, 2, 3].map((i) => (
                      <View
                        key={i}
                        style={[
                          styles.strengthBar,
                          {
                            backgroundColor:
                              i <= passwordStrength
                                ? strengthColors[passwordStrength - 1]
                                : theme.colors.border,
                          },
                        ]}
                      />
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.strengthLabel,
                      { color: theme.colors.textSecondary },
                    ]}
                  >
                    {strengthLabels[passwordStrength - 1] ?? ''}
                  </Text>
                </View>
              )}
              <WvInput
                label="Confirm password"
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
            </View>
          ) : (
            <View style={styles.form}>
              <WvInput
                label="Full name"
                value={name}
                onChangeText={setName}
                placeholder="Your name"
              />
            </View>
          )}

          <View style={styles.actions}>
            <WvButton
              title={step === 1 ? 'Continue' : 'Create account'}
              onPress={handleContinue}
              loading={loading}
              disabled={!stepValid}
            />
            <WvButton
              title="Already have an account? Sign in"
              variant="secondary"
              onPress={() => navigation.navigate('Login')}
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  step: {
    fontSize: 14,
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
  progress: {
    marginBottom: 32,
  },
  form: {
    gap: 16,
    marginBottom: 24,
  },
  strength: {
    gap: 6,
  },
  strengthBars: {
    flexDirection: 'row',
    gap: 4,
  },
  strengthBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  strengthLabel: {
    fontSize: 12,
  },
  actions: {
    gap: 12,
    marginTop: 'auto',
  },
});

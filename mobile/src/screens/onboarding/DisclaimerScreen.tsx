import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WvBackButton } from '../../components/ui/WvBackButton';
import { WvButton } from '../../components/ui/WvButton';
import { WvCheckbox } from '../../components/ui/WvCheckbox';
import { WvProgressBar } from '../../components/ui/WvProgressBar';
import { WvCard } from '../../components/ui/WvCard';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { useOnboarding } from '../../contexts/OnboardingContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';

interface DisclaimerScreenProps {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'Disclaimer'>;
}

const bullets = [
  'wellvio is for general wellness and information only.',
  'It is not medical advice, diagnosis, or treatment.',
  'Consult a healthcare professional before starting any diet or exercise program.',
  'Do not use if pregnant or under 18 without professional supervision.',
  'Calorie targets are estimates. Individual needs vary based on many factors.',
];

export function DisclaimerScreen({ navigation }: DisclaimerScreenProps) {
  const theme = useTheme();
  const { form, updateForm, createProfile, loading, error } = useOnboarding();

  const handleContinue = async () => {
    const created = await createProfile();
    if (created) {
      navigation.navigate('Success');
    }
  };

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvBackButton onPress={() => navigation.navigate('PersonalProfile')} />
        <Text style={[styles.step, { color: theme.colors.textSecondary }]}>
          2 of 2
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <WvProgressBar
          progress={1}
          color={theme.colors.primary}
          bgColor={theme.colors.input}
          height={4}
          style={styles.progress}
        />

        <View style={styles.intro}>
          <Text
            style={[
              styles.title,
              { color: theme.colors.textPrimary },
            ]}
          >
            Health disclaimer
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Please read before continuing
          </Text>
        </View>

        <WvCard style={styles.card}>
          {bullets.map((text, i) => (
            <View key={i} style={styles.bulletRow}>
              <View
                style={[
                  styles.bullet,
                  { backgroundColor: theme.colors.primary },
                ]}
              />
              <Text
                style={[
                  styles.bulletText,
                  { color: theme.colors.textSecondary },
                ]}
              >
                {text}
              </Text>
            </View>
          ))}
        </WvCard>

        <TouchableOpacity
          activeOpacity={0.8}
          style={styles.checkboxRow}
          onPress={() =>
            updateForm(
              'healthDisclaimerAcknowledged',
              !form.healthDisclaimerAcknowledged,
            )
          }
        >
          <WvCheckbox
            checked={form.healthDisclaimerAcknowledged}
            onPress={() =>
              updateForm(
                'healthDisclaimerAcknowledged',
                !form.healthDisclaimerAcknowledged,
              )
            }
          />
          <Text
            style={[
              styles.checkboxLabel,
              { color: theme.colors.textPrimary },
            ]}
          >
            I understand and agree
          </Text>
        </TouchableOpacity>

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title={loading ? 'Saving...' : 'Continue'}
          onPress={handleContinue}
          disabled={!form.healthDisclaimerAcknowledged || loading}
        />
      </View>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingBottom: 8,
  },
  step: {
    fontSize: 14,
    fontWeight: '500',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 16,
    gap: 20,
  },
  progress: {
    marginBottom: 16,
  },
  intro: {
    gap: 4,
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 15,
  },
  card: {
    padding: 20,
    gap: 16,
  },
  bulletRow: {
    flexDirection: 'row',
    gap: 12,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginTop: 6,
  },
  bulletText: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkboxLabel: {
    fontSize: 15,
  },
  error: {
    fontSize: 14,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
});

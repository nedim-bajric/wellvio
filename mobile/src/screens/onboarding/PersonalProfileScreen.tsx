import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { WvBackButton } from '../../components/ui/WvBackButton';
import { WvButton } from '../../components/ui/WvButton';
import { WvInput } from '../../components/ui/WvInput';
import { WvProgressBar } from '../../components/ui/WvProgressBar';
import { useTheme } from '../../theme/index';
import { useOnboarding } from '../../contexts/OnboardingContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import type { Gender } from '../../types/onboarding';

interface PersonalProfileScreenProps {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'PersonalProfile'>;
}

const genders: { id: Gender; label: string }[] = [
  { id: 'female', label: 'Female' },
  { id: 'male', label: 'Male' },
];

export function PersonalProfileScreen({ navigation }: PersonalProfileScreenProps) {
  const theme = useTheme();
  const { form, updateForm } = useOnboarding();

  const canContinue =
    form.age !== '' &&
    form.heightCm !== '' &&
    form.currentWeightKg !== '' &&
    form.goalWeightKg !== '' &&
    form.targetDate !== '';

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvBackButton onPress={() => navigation.navigate('Carousel')} />
        <Text style={[styles.step, { color: theme.colors.textSecondary }]}>
          1 of 3
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <WvProgressBar
          progress={1 / 3}
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
            About you
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            Help us personalize your plan
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Gender
          </Text>
          <View style={styles.genderGrid}>
            {genders.map((g) => (
              <WvButton
                key={g.id}
                title={g.label}
                variant={form.gender === g.id ? 'primary' : 'secondary'}
                size="md"
                onPress={() => updateForm('gender', g.id)}
                style={styles.genderButton}
              />
            ))}
          </View>
        </View>

        <WvInput
          label="Age"
          value={form.age}
          onChangeText={(value) => updateForm('age', value)}
          placeholder="Years"
          keyboardType="number-pad"
        />

        <WvInput
          label="Height (cm)"
          value={form.heightCm}
          onChangeText={(value) => updateForm('heightCm', value)}
          placeholder="cm"
          keyboardType="decimal-pad"
        />

        <View style={styles.row}>
          <WvInput
            label="Current weight (kg)"
            value={form.currentWeightKg}
            onChangeText={(value) => updateForm('currentWeightKg', value)}
            placeholder="kg"
            keyboardType="decimal-pad"
            style={styles.half}
          />
          <WvInput
            label="Goal weight (kg)"
            value={form.goalWeightKg}
            onChangeText={(value) => updateForm('goalWeightKg', value)}
            placeholder="kg"
            keyboardType="decimal-pad"
            style={styles.half}
          />
        </View>

        <WvInput
          label="Target date"
          value={form.targetDate}
          onChangeText={(value) => updateForm('targetDate', value)}
          placeholder="YYYY-MM-DD"
        />
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Continue"
          onPress={() => navigation.navigate('ActivityGoals')}
          disabled={!canContinue}
        />
      </View>
    </KeyboardAvoidingView>
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
    paddingTop: 8,
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
    gap: 16,
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
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  genderGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  genderButton: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
});

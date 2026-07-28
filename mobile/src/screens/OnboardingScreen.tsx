import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { onboardingApi } from '../api/onboardingApi.js';
import { getErrorMessage } from '../utils/errorMessage.js';
import type {
  ActivityLevel,
  CreateProfileData,
  Gender,
  PlanOption,
  PlanRate,
  Profile,
} from '../types/onboarding.js';

const GENDERS: Gender[] = ['male', 'female'];

const ACTIVITY_LEVELS: ActivityLevel[] = [
  'sedentary',
  'light',
  'moderate',
  'active',
  'veryActive',
];

interface OnboardingScreenProps {
  onOnboardingComplete: () => void;
}

type OnboardingStep = 'profile' | 'plans';

interface ProfileFormState {
  gender: Gender;
  age: string;
  heightCm: string;
  currentWeightKg: string;
  goalWeightKg: string;
  activityLevel: ActivityLevel;
  targetDate: string;
  healthDisclaimerAcknowledged: boolean;
}

const INITIAL_FORM_STATE: ProfileFormState = {
  gender: 'male',
  age: '',
  heightCm: '',
  currentWeightKg: '',
  goalWeightKg: '',
  activityLevel: 'moderate',
  targetDate: '',
  healthDisclaimerAcknowledged: false,
};

function setFirstPlanOption(
  options: PlanOption[],
  setOptions: (options: PlanOption[]) => void,
  setSelectedRate: (rate: PlanRate | null) => void,
  setStep: (step: OnboardingStep) => void,
): void {
  setOptions(options);
  if (options.length > 0) {
    setSelectedRate(options[0].rate);
  }
  setStep('plans');
}

function profileToFormState(profile: Profile): ProfileFormState {
  return {
    gender: profile.gender,
    age: String(profile.age),
    heightCm: String(profile.heightCm),
    currentWeightKg: String(profile.currentWeightKg),
    goalWeightKg: String(profile.goalWeightKg),
    activityLevel: profile.activityLevel,
    targetDate: profile.targetDate.slice(0, 10),
    healthDisclaimerAcknowledged: profile.healthDisclaimerAcknowledged,
  };
}

function parseProfileForm(
  form: ProfileFormState,
): { data: CreateProfileData } | { error: string } {
  const parsedAge = parseInt(form.age, 10);
  const parsedHeight = parseFloat(form.heightCm);
  const parsedCurrentWeight = parseFloat(form.currentWeightKg);
  const parsedGoalWeight = parseFloat(form.goalWeightKg);

  if (
    Number.isNaN(parsedAge) ||
    Number.isNaN(parsedHeight) ||
    Number.isNaN(parsedCurrentWeight) ||
    Number.isNaN(parsedGoalWeight) ||
    !form.targetDate
  ) {
    return { error: 'Please fill in all fields with valid values' };
  }

  const targetDate = new Date(`${form.targetDate}T12:00:00Z`);
  const todayStart = new Date();
  todayStart.setHours(0, 0, 0, 0);
  if (targetDate.getTime() < todayStart.getTime()) {
    return { error: 'Target date must be today or in the future' };
  }

  return {
    data: {
      gender: form.gender,
      age: parsedAge,
      heightCm: parsedHeight,
      currentWeightKg: parsedCurrentWeight,
      goalWeightKg: parsedGoalWeight,
      activityLevel: form.activityLevel,
      targetDate: targetDate.toISOString(),
      healthDisclaimerAcknowledged: form.healthDisclaimerAcknowledged,
    },
  };
}

interface SelectableOptionProps<T extends string> {
  options: T[];
  selected: T;
  onSelect: (value: T) => void;
  layout?: 'row' | 'column';
}

function SelectableOption<T extends string>({
  options,
  selected,
  onSelect,
  layout = 'row',
}: SelectableOptionProps<T>) {
  return (
    <View style={layout === 'row' ? styles.optionsRow : styles.optionsColumn}>
      {options.map((value) => (
        <TouchableOpacity
          key={value}
          style={[
            styles.optionButton,
            selected === value && styles.optionButtonActive,
          ]}
          onPress={() => onSelect(value)}
        >
          <Text
            style={[
              styles.optionButtonText,
              selected === value && styles.optionButtonTextActive,
            ]}
          >
            {value}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

function useLoading() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async <T,>(
      operation: () => Promise<T>,
      errorMessage: string,
    ): Promise<T | null> => {
      setLoading(true);
      setError(null);
      try {
        return await operation();
      } catch (err) {
        setError(getErrorMessage(err, errorMessage));
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  return { loading, error, run };
}

export function OnboardingScreen({
  onOnboardingComplete,
}: OnboardingScreenProps) {
  const [step, setStep] = useState<OnboardingStep>('profile');
  const [initializing, setInitializing] = useState(true);
  const [form, setForm] = useState<ProfileFormState>(INITIAL_FORM_STATE);
  const [planOptions, setPlanOptions] = useState<PlanOption[]>([]);
  const [selectedRate, setSelectedRate] = useState<PlanRate | null>(null);
  const { loading, error, run } = useLoading();

  const loadExistingProfile = useCallback(async () => {
    const existingProfile = await run(
      () => onboardingApi.getProfile(),
      'Failed to load profile',
    );

    if (!existingProfile) {
      return;
    }

    setForm(profileToFormState(existingProfile));

    const options = await run(
      () => onboardingApi.getPlanOptions(),
      'Failed to load plan options',
    );
    if (options) {
      setFirstPlanOption(
        options.options,
        setPlanOptions,
        setSelectedRate,
        setStep,
      );
    }
  }, [run]);

  useEffect(() => {
    void loadExistingProfile().finally(() => setInitializing(false));
  }, [loadExistingProfile]);

  const updateForm = useCallback(
    <K extends keyof ProfileFormState>(key: K, value: ProfileFormState[K]) => {
      setForm((prev) => ({ ...prev, [key]: value }));
    },
    [],
  );

  const handleContinue = async () => {
    if (!form.healthDisclaimerAcknowledged) {
      Alert.alert('Please acknowledge the health disclaimer');
      return;
    }

    const parsed = parseProfileForm(form);
    if ('error' in parsed) {
      Alert.alert(parsed.error);
      return;
    }

    const created = await run(
      () => onboardingApi.createProfile(parsed.data),
      'Failed to save profile',
    );
    if (!created) {
      return;
    }

    const options = await run(
      () => onboardingApi.getPlanOptions(),
      'Failed to generate plan options',
    );
    if (!options) {
      return;
    }

    setFirstPlanOption(
      options.options,
      setPlanOptions,
      setSelectedRate,
      setStep,
    );
  };

  const handleActivatePlan = async () => {
    if (!selectedRate) {
      Alert.alert('Please select a plan');
      return;
    }

    const activated = await run(
      () => onboardingApi.activatePlan(selectedRate),
      'Failed to activate plan',
    );
    if (activated) {
      onOnboardingComplete();
    }
  };

  if (initializing) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Let&apos;s set up your plan</Text>

      {error && <Text style={styles.error}>{error}</Text>}

      {step === 'profile' ? (
        <>
          <Text style={styles.sectionTitle}>Your profile</Text>

          <Text style={styles.label}>Gender</Text>
          <SelectableOption
            options={GENDERS}
            selected={form.gender}
            onSelect={(gender) => updateForm('gender', gender)}
            layout="row"
          />

          <Text style={styles.label}>Age</Text>
          <TextInput
            style={styles.input}
            placeholder="Years"
            value={form.age}
            onChangeText={(age) => updateForm('age', age)}
            keyboardType="number-pad"
          />

          <Text style={styles.label}>Height</Text>
          <TextInput
            style={styles.input}
            placeholder="cm"
            value={form.heightCm}
            onChangeText={(heightCm) => updateForm('heightCm', heightCm)}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Current weight</Text>
          <TextInput
            style={styles.input}
            placeholder="kg"
            value={form.currentWeightKg}
            onChangeText={(weight) => updateForm('currentWeightKg', weight)}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Goal weight</Text>
          <TextInput
            style={styles.input}
            placeholder="kg"
            value={form.goalWeightKg}
            onChangeText={(weight) => updateForm('goalWeightKg', weight)}
            keyboardType="decimal-pad"
          />

          <Text style={styles.label}>Activity level</Text>
          <SelectableOption
            options={ACTIVITY_LEVELS}
            selected={form.activityLevel}
            onSelect={(level) => updateForm('activityLevel', level)}
            layout="column"
          />

          <Text style={styles.label}>Target date</Text>
          <TextInput
            style={styles.input}
            placeholder="YYYY-MM-DD"
            value={form.targetDate}
            onChangeText={(date) => updateForm('targetDate', date)}
          />

          <TouchableOpacity
            style={styles.disclaimerRow}
            onPress={() =>
              updateForm(
                'healthDisclaimerAcknowledged',
                !form.healthDisclaimerAcknowledged,
              )
            }
          >
            <View
              style={[
                styles.checkbox,
                form.healthDisclaimerAcknowledged && styles.checkboxChecked,
              ]}
            />
            <Text style={styles.disclaimerText}>
              I understand this app is not medical advice and I should consult a
              healthcare provider before changing my diet or exercise plan.
            </Text>
          </TouchableOpacity>

          <View style={styles.submitRow}>
            <Button
              title={loading ? 'Loading...' : 'See plan options'}
              onPress={handleContinue}
              disabled={loading}
            />
          </View>
        </>
      ) : (
        <>
          <Text style={styles.sectionTitle}>Choose your plan</Text>

          {planOptions.map((option) => {
            const { protein, carbs, fat } = option.targetNutrients;
            return (
              <TouchableOpacity
                key={option.rate}
                style={[
                  styles.planCard,
                  selectedRate === option.rate && styles.planCardSelected,
                ]}
                onPress={() => setSelectedRate(option.rate)}
              >
                <View style={styles.planHeader}>
                  <Text style={styles.planRate}>{option.rate}</Text>
                  <Text style={styles.planCalories}>
                    {option.targetCalories} kcal/day
                  </Text>
                </View>
                <Text style={styles.planMacros}>
                  P {protein}g · C {carbs}g · F {fat}g
                </Text>
                <Text style={styles.planMeta}>
                  {option.dailyDeficit.toFixed(0)} kcal deficit ·{' '}
                  {option.daysToTarget} days to goal
                </Text>
              </TouchableOpacity>
            );
          })}

          <Text style={styles.disclaimerReminder}>
            By activating a plan, you confirm that this app is not medical
            advice and that you should consult a healthcare provider before
            changing your diet or exercise plan.
          </Text>

          <View style={styles.submitRow}>
            <Button
              title={loading ? 'Activating...' : 'Activate plan'}
              onPress={handleActivatePlan}
              disabled={loading}
            />
          </View>

          <Button
            title="Back"
            onPress={() => setStep('profile')}
            disabled={loading}
          />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginTop: 12,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
  },
  optionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  optionsColumn: {
    gap: 8,
  },
  optionButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#ccc',
    alignItems: 'center',
  },
  optionButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  optionButtonText: {
    textTransform: 'capitalize',
  },
  optionButtonTextActive: {
    color: '#fff',
  },
  disclaimerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginTop: 20,
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#007AFF',
    marginTop: 2,
  },
  checkboxChecked: {
    backgroundColor: '#007AFF',
  },
  disclaimerText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: '#444',
  },
  submitRow: {
    marginTop: 24,
    marginBottom: 12,
  },
  planCard: {
    padding: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 12,
    backgroundColor: '#fafafa',
  },
  planCardSelected: {
    borderColor: '#007AFF',
    backgroundColor: '#f0f7ff',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  planRate: {
    fontSize: 16,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  planCalories: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  planMacros: {
    fontSize: 14,
    color: '#333',
    marginBottom: 4,
  },
  planMeta: {
    fontSize: 12,
    color: '#666',
  },
  disclaimerReminder: {
    fontSize: 12,
    color: '#666',
    marginTop: 8,
    lineHeight: 18,
  },
});

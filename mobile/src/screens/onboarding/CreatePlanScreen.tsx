import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { WvBackButton } from '../../components/ui/WvBackButton';
import { WvButton } from '../../components/ui/WvButton';
import { WvInput } from '../../components/ui/WvInput';
import { WvProgressBar } from '../../components/ui/WvProgressBar';
import { WvCard } from '../../components/ui/WvCard';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import { computeAge, formatToday } from '../../utils/date';
import {
  calculateMacroTargets,
  generatePlanOptions,
  type ActivityLevel,
  type Plan,
} from '../../utils/diet';
import { getErrorMessage } from '../../utils/errorMessage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type {
  OnboardingStackParamList,
  RootStackParamList,
} from '../../navigation/types';
import type { SupabaseProfile } from '../../types/profile';

type CreatePlanNavigationProp = NativeStackNavigationProp<
  RootStackParamList & OnboardingStackParamList,
  'CreatePlan'
>;

interface CreatePlanScreenProps {
  navigation: CreatePlanNavigationProp;
  route: { params?: { returnToMain?: boolean } };
}

const activities: { id: ActivityLevel; label: string }[] = [
  { id: 'sedentary', label: 'Sedentary' },
  { id: 'light', label: 'Light' },
  { id: 'moderate', label: 'Moderate' },
  { id: 'active', label: 'Active' },
  { id: 'veryActive', label: 'Very active' },
];

function parseDate(value: string): Date | null {
  const match = /^\d{4}-\d{2}-\d{2}$/.exec(value);
  if (!match) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function toDateInputValue(date: Date): string {
  return date.toISOString().split('T')[0];
}

export function CreatePlanScreen({
  navigation,
  route,
}: CreatePlanScreenProps) {
  const theme = useTheme();
  const { user } = useAuth();
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [goalWeight, setGoalWeight] = useState('');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel | null>(null);
  const [targetDate, setTargetDate] = useState<Date>(addDays(new Date(), 30));
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [options, setOptions] = useState<Plan[]>([]);
  const [selectedRate, setSelectedRate] = useState<Plan['rate'] | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    if (!user) return;
    setLoadingProfile(true);
    const { data, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (fetchError) {
      setError(fetchError.message);
    } else {
      setProfile(data as SupabaseProfile | null);
    }
    setLoadingProfile(false);
  }, [user]);

  useEffect(() => {
    void loadProfile();
  }, [loadProfile]);

  const canGenerate =
    profile !== null &&
    profile.gender !== null &&
    profile.date_of_birth !== null &&
    profile.height_cm !== null &&
    profile.weight_kg !== null &&
    activityLevel !== null &&
    goalWeight !== '' &&
    !Number.isNaN(parseFloat(goalWeight));

  const handleGenerate = async () => {
    if (!canGenerate || !profile) return;
    setGenerating(true);
    setError(null);

    const age = computeAge(profile.date_of_birth!);
    if (age === null) {
      setError('Invalid date of birth in profile.');
      setGenerating(false);
      return;
    }

    const parsedGoalWeight = parseFloat(goalWeight);
    try {
      const generated = generatePlanOptions({
        gender: profile.gender!,
        age,
        heightCm: profile.height_cm!,
        currentWeightKg: profile.weight_kg!,
        goalWeightKg: parsedGoalWeight,
        activityLevel,
        targetDate,
      });

      if (generated.length === 0) {
        setError(
          'The selected goal and date cannot be achieved safely. Please choose a later target date or a different goal weight.',
        );
      } else {
        setOptions(generated);
        setSelectedRate(generated[0]?.rate ?? null);
      }
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to generate plan options'));
    } finally {
      setGenerating(false);
    }
  };

  const handleSelectPlan = async () => {
    if (!user || !profile || !selectedRate) return;
    const selected = options.find((o) => o.rate === selectedRate);
    if (!selected) return;

    setSaving(true);
    setError(null);

    const { error: deactivateError } = await supabase
      .from('plans')
      .update({ active: false })
      .eq('user_id', user.id);

    if (deactivateError) {
      setError(deactivateError.message);
      setSaving(false);
      return;
    }

    const { data: planData, error: planError } = await supabase
      .from('plans')
      .insert({
        user_id: user.id,
        profile_id: profile.id,
        target_calories: selected.targetCalories,
        target_protein: selected.targetNutrients.protein,
        target_carbs: selected.targetNutrients.carbs,
        target_fat: selected.targetNutrients.fat,
        daily_deficit: selected.dailyDeficit,
        days_to_target: selected.daysToTarget,
        rate: selected.rate,
        safe: selected.safe,
        active: true,
      })
      .select()
      .single();

    if (planError) {
      setError(planError.message);
      setSaving(false);
      return;
    }

    const { error: profileError } = await supabase
      .from('profiles')
      .update({
        goal_weight_kg: parseFloat(goalWeight),
        activity_level: activityLevel,
        target_date: toDateInputValue(targetDate),
        active_plan_id: planData.id,
      })
      .eq('user_id', user.id);

    if (profileError) {
      setError(profileError.message);
      setSaving(false);
      return;
    }

    setSaving(false);
    if (route.params?.returnToMain) {
      navigation.navigate('Main');
    } else {
      navigation.navigate('Success');
    }
  };

  const onDateChange = (_event: unknown, date?: Date) => {
    setShowDatePicker(false);
    if (date) {
      setTargetDate(date);
    }
  };

  if (loadingProfile) {
    return (
      <SafeScreen>
        <View style={styles.centered}>
          <ActivityIndicator color={theme.colors.primary} />
        </View>
      </SafeScreen>
    );
  }

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvBackButton onPress={() => navigation.navigate('Disclaimer')} />
        <Text style={[styles.step, { color: theme.colors.textSecondary }]}>
          3 of 3
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
            style={[styles.title, { color: theme.colors.textPrimary }]}
          >
            Your goal
          </Text>
          <Text
            style={[styles.subtitle, { color: theme.colors.textSecondary }]}
          >
            Choose a target weight, activity level, and date
          </Text>
        </View>

        <WvInput
          label="Goal weight (kg)"
          value={goalWeight}
          onChangeText={setGoalWeight}
          placeholder="kg"
          keyboardType="decimal-pad"
        />

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Activity level
          </Text>
          <View style={styles.activityGrid}>
            {activities.map((a) => (
              <WvButton
                key={a.id}
                title={a.label}
                variant={activityLevel === a.id ? 'primary' : 'secondary'}
                size="sm"
                onPress={() => setActivityLevel(a.id)}
                style={styles.activityButton}
              />
            ))}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Target date
          </Text>
          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            style={[
              styles.dateButton,
              { backgroundColor: theme.colors.input },
            ]}
          >
            <Text
              style={[styles.dateValue, { color: theme.colors.textPrimary }]}
            >
              {targetDate.toLocaleDateString('en-US', {
                month: 'long',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </TouchableOpacity>
          {showDatePicker && (
            <DateTimePicker
              value={targetDate}
              mode="date"
              display="spinner"
              minimumDate={addDays(new Date(), 1)}
              onChange={onDateChange}
            />
          )}
        </View>

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <WvButton
          title={generating ? 'Generating...' : 'Generate plans'}
          onPress={handleGenerate}
          disabled={!canGenerate || generating}
        />

        {options.length > 0 && (
          <View style={styles.optionsSection}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Choose a plan
            </Text>
            {options.map((option) => {
              const macros = calculateMacroTargets(option.targetCalories);
              const selected = selectedRate === option.rate;
              return (
                <TouchableOpacity
                  key={option.rate}
                  activeOpacity={0.8}
                  onPress={() => setSelectedRate(option.rate)}
                >
                  <WvCard
                    style={[
                      styles.optionCard,
                      {
                        borderColor: selected
                          ? theme.colors.primary
                          : theme.colors.border,
                        borderWidth: selected ? 2 : 1,
                      },
                    ]}
                  >
                    <View style={styles.optionHeader}>
                      <Text
                        style={[
                          styles.optionRate,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {option.rate.charAt(0).toUpperCase() +
                          option.rate.slice(1)}
                      </Text>
                      <Text
                        style={[
                          styles.optionCalories,
                          { color: theme.colors.primary },
                        ]}
                      >
                        {option.targetCalories} kcal
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.optionMacros,
                        { color: theme.colors.textSecondary },
                      ]}
                    >
                      P{Math.round(macros.protein)}g · C
                      {Math.round(macros.carbs)}g · F{Math.round(macros.fat)}g
                    </Text>
                    <Text
                      style={[
                        styles.optionDays,
                        { color: theme.colors.textTertiary },
                      ]}
                    >
                      {option.daysToTarget} days to goal
                    </Text>
                  </WvCard>
                </TouchableOpacity>
              );
            })}

            <WvButton
              title={saving ? 'Saving...' : 'Activate plan'}
              onPress={handleSelectPlan}
              loading={saving}
              disabled={!selectedRate || saving}
            />
          </View>
        )}
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '500',
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 32,
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
  activityGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  activityButton: {
    minWidth: '30%',
  },
  dateButton: {
    height: 56,
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  dateValue: {
    fontSize: 17,
    fontWeight: '500',
  },
  error: {
    fontSize: 14,
  },
  optionsSection: {
    gap: 12,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  optionCard: {
    padding: 16,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  optionRate: {
    fontSize: 16,
    fontWeight: '600',
  },
  optionCalories: {
    fontSize: 16,
    fontWeight: '700',
  },
  optionMacros: {
    fontSize: 13,
    marginBottom: 4,
  },
  optionDays: {
    fontSize: 12,
  },
});

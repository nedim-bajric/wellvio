import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Check } from 'lucide-react-native';
import { WvBackButton } from '../../components/ui/WvBackButton.js';
import { WvButton } from '../../components/ui/WvButton.js';
import { WvProgressBar } from '../../components/ui/WvProgressBar.js';
import { WvCard } from '../../components/ui/WvCard.js';
import { useTheme } from '../../theme/index.js';
import { useOnboarding, type WeeklyRate } from '../../contexts/OnboardingContext.js';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types.js';
import type { ActivityLevel } from '../../types/onboarding.js';

interface ActivityGoalsScreenProps {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'ActivityGoals'>;
}

interface ActivityOption {
  id: ActivityLevel;
  label: string;
  desc: string;
}

const activityLevels: ActivityOption[] = [
  { id: 'sedentary', label: 'Sedentary', desc: 'Little or no exercise' },
  { id: 'light', label: 'Lightly active', desc: '1–3 days/week' },
  { id: 'moderate', label: 'Moderately active', desc: '3–5 days/week' },
  { id: 'veryActive', label: 'Very active', desc: '6–7 days/week' },
];

interface RateOption {
  id: WeeklyRate;
  label: string;
}

const rates: RateOption[] = [
  { id: '0.5lb', label: '0.5 lb/week' },
  { id: '1lb', label: '1 lb/week' },
  { id: '1.5lb', label: '1.5 lb/week' },
  { id: 'maintain', label: 'Maintain' },
];

const tdeeMap: Record<ActivityLevel, number> = {
  sedentary: 1880,
  light: 2160,
  moderate: 2440,
  active: 2620,
  veryActive: 2900,
};

const deficitMap: Record<WeeklyRate, number> = {
  '0.5lb': 250,
  '1lb': 500,
  '1.5lb': 750,
  maintain: 0,
};

export function ActivityGoalsScreen({ navigation }: ActivityGoalsScreenProps) {
  const theme = useTheme();
  const { form, updateForm, weeklyRate, setWeeklyRate } = useOnboarding();

  const tdee = tdeeMap[form.activityLevel] ?? 2000;
  const deficit = deficitMap[weeklyRate] ?? 0;
  const target = tdee - deficit;
  const protein = Math.round((target * 0.3) / 4);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvBackButton onPress={() => navigation.navigate('PersonalProfile')} />
        <Text style={[styles.step, { color: theme.colors.textSecondary }]}>
          2 of 3
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <WvProgressBar
          progress={2 / 3}
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
            Activity & goals
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            We&apos;ll calculate your daily calorie target
          </Text>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Activity level
          </Text>
          <View style={styles.activityList}>
            {activityLevels.map((a) => {
              const selected = form.activityLevel === a.id;
              return (
                <WvButton
                  key={a.id}
                  title=""
                  onPress={() => updateForm('activityLevel', a.id)}
                  variant={selected ? 'primary' : 'secondary'}
                  style={styles.activityButton}
                >
                  <View style={styles.activityContent}>
                    <View>
                      <Text
                        style={[
                          styles.activityLabel,
                          { color: theme.colors.textPrimary },
                        ]}
                      >
                        {a.label}
                      </Text>
                      <Text
                        style={[
                          styles.activityDesc,
                          { color: theme.colors.textTertiary },
                        ]}
                      >
                        {a.desc}
                      </Text>
                    </View>
                    {selected && (
                      <Check
                        size={18}
                        color={theme.colors.primary}
                        strokeWidth={3}
                      />
                    )}
                  </View>
                </WvButton>
              );
            })}
          </View>
        </View>

        <View style={styles.field}>
          <Text style={[styles.label, { color: theme.colors.textSecondary }]}>
            Weekly goal
          </Text>
          <View style={styles.rateGrid}>
            {rates.map((r) => (
              <WvButton
                key={r.id}
                title={r.label}
                variant={weeklyRate === r.id ? 'primary' : 'secondary'}
                size="md"
                onPress={() => setWeeklyRate(r.id)}
                style={styles.rateButton}
              />
            ))}
          </View>
        </View>

        <WvCard variant="alt" style={styles.preview}>
          <Text
            style={[
              styles.previewLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Your estimated targets
          </Text>
          <View style={styles.previewRow}>
            <View style={styles.previewItem}>
              <Text style={[styles.previewValue, { color: theme.colors.primary }]}>
                {tdee}
              </Text>
              <Text style={[styles.previewUnit, { color: theme.colors.textTertiary }]}>
                TDEE
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text
                style={[
                  styles.previewValue,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {target}
              </Text>
              <Text style={[styles.previewUnit, { color: theme.colors.textTertiary }]}>
                Daily target
              </Text>
            </View>
            <View style={styles.previewItem}>
              <Text style={[styles.previewValue, { color: theme.colors.blue }]}>
                {protein}g
              </Text>
              <Text style={[styles.previewUnit, { color: theme.colors.textTertiary }]}>
                Protein
              </Text>
            </View>
          </View>
        </WvCard>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Continue"
          onPress={() => navigation.navigate('Disclaimer')}
        />
      </View>
    </View>
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
  field: {
    gap: 8,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
  },
  activityList: {
    gap: 8,
  },
  activityButton: {
    paddingHorizontal: 0,
  },
  activityContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    width: '100%',
  },
  activityLabel: {
    fontSize: 15,
    fontWeight: '500',
  },
  activityDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  rateGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rateButton: {
    flex: 1,
    minWidth: '45%',
  },
  preview: {
    padding: 16,
  },
  previewLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  previewRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  previewItem: {
    alignItems: 'center',
    gap: 4,
  },
  previewValue: {
    fontSize: 24,
    fontWeight: '700',
  },
  previewUnit: {
    fontSize: 12,
  },
  footer: {
    paddingHorizontal: 20,
    paddingBottom: 32,
    paddingTop: 12,
  },
});

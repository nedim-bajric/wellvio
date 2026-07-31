import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { WvBackButton } from '../../components/ui/WvBackButton';
import { WvButton } from '../../components/ui/WvButton';
import { WvProgressBar } from '../../components/ui/WvProgressBar';
import { WvCard } from '../../components/ui/WvCard';
import { useTheme } from '../../theme/index';
import { useOnboarding } from '../../contexts/OnboardingContext';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { OnboardingStackParamList } from '../../navigation/types';
import type { PlanOption, PlanRate } from '../../types/onboarding';

interface PlanSelectionScreenProps {
  navigation: NativeStackNavigationProp<OnboardingStackParamList, 'PlanSelection'>;
}

interface PlanDisplay {
  id: PlanRate;
  name: string;
  desc: string;
  recommended?: boolean;
  warning?: string;
}

const planDisplays: PlanDisplay[] = [
  {
    id: 'mild',
    name: 'Steady',
    desc: 'Gentle, sustainable pace',
  },
  {
    id: 'moderate',
    name: 'Balanced',
    desc: 'Recommended for most people',
    recommended: true,
  },
  {
    id: 'aggressive',
    name: 'Focused',
    desc: 'Faster results, more commitment',
    warning: 'Near minimum safe threshold',
  },
];

const macroMeta = [
  { label: 'P', max: 180, color: '#0A84FF' as const },
  { label: 'C', max: 300, color: '#FF9F0A' as const },
  { label: 'F', max: 90, color: '#BF5AF2' as const },
];

export function PlanSelectionScreen({ navigation }: PlanSelectionScreenProps) {
  const theme = useTheme();
  const { planOptions, selectedRate, setSelectedRate, activatePlan, loading, error } =
    useOnboarding();

  const findOption = (rate: PlanRate): PlanOption | undefined =>
    planOptions.find((o) => o.rate === rate);

  const handleStartPlan = async () => {
    const activated = await activatePlan();
    if (activated) {
      navigation.navigate('Success');
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvBackButton onPress={() => navigation.navigate('Disclaimer')} />
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
            Choose your plan
          </Text>
          <Text
            style={[
              styles.subtitle,
              { color: theme.colors.textSecondary },
            ]}
          >
            All plans are based on your profile
          </Text>
        </View>

        <View style={styles.plans}>
          {planDisplays.map((display) => {
            const option = findOption(display.id);
            if (!option) return null;
            const selected = selectedRate === display.id;
            return (
              <TouchableOpacity
                key={display.id}
                activeOpacity={0.8}
                onPress={() => setSelectedRate(display.id)}
              >
                <WvCard
                  style={[
                    styles.planCard,
                    {
                      borderColor: selected
                        ? theme.colors.primary
                        : theme.colors.border,
                      backgroundColor: selected
                        ? theme.colors.primaryLight
                        : theme.colors.card,
                    },
                  ]}
                >
                  <View style={styles.planHeader}>
                    <View>
                      <View style={styles.planNameRow}>
                        <Text
                          style={[
                            styles.planName,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {display.name}
                        </Text>
                        {display.recommended && (
                          <View
                            style={[
                              styles.badge,
                              { backgroundColor: theme.colors.primaryLight },
                            ]}
                          >
                            <Text
                              style={[
                                styles.badgeText,
                                { color: theme.colors.primary },
                              ]}
                            >
                              Recommended
                            </Text>
                          </View>
                        )}
                      </View>
                      <Text
                        style={[
                          styles.planDesc,
                          { color: theme.colors.textTertiary },
                        ]}
                      >
                        {display.desc}
                      </Text>
                    </View>
                    <View style={styles.planCalories}>
                      <Text
                        style={[
                          styles.caloriesValue,
                          {
                            color: selected
                              ? theme.colors.primary
                              : theme.colors.textPrimary,
                          },
                        ]}
                      >
                        {option.targetCalories}
                      </Text>
                      <Text
                        style={[
                          styles.caloriesUnit,
                          { color: theme.colors.textTertiary },
                        ]}
                      >
                        kcal/day
                      </Text>
                    </View>
                  </View>

                  <View style={styles.macroBars}>
                    {macroMeta.map((m) => {
                      const value = option.targetNutrients[
                        m.label === 'P'
                          ? 'protein'
                          : m.label === 'C'
                            ? 'carbs'
                            : 'fat'
                      ];
                      return (
                        <View key={m.label} style={styles.macroBarRow}>
                          <Text
                            style={[
                              styles.macroLabel,
                              { color: m.color },
                            ]}
                          >
                            {m.label}
                          </Text>
                          <View
                            style={[
                              styles.macroTrack,
                              { backgroundColor: theme.colors.border },
                            ]}
                          >
                            <View
                              style={[
                                styles.macroFill,
                                {
                                  width: `${Math.min((value / m.max) * 100, 100)}%`,
                                  backgroundColor: m.color,
                                },
                              ]}
                            />
                          </View>
                          <Text
                            style={[
                              styles.macroValue,
                              { color: theme.colors.textTertiary },
                            ]}
                          >
                            {value}g
                          </Text>
                        </View>
                      );
                    })}
                  </View>

                  <View style={styles.planFooter}>
                    <Text
                      style={[
                        styles.planRate,
                        { color: theme.colors.textTertiary },
                      ]}
                    >
                      {option.dailyDeficit.toFixed(0)} kcal deficit ·{' '}
                      {option.daysToTarget} days to goal
                    </Text>
                    {display.warning && (
                      <Text
                        style={[
                          styles.warning,
                          { color: theme.colors.warning },
                        ]}
                      >
                        {display.warning}
                      </Text>
                    )}
                  </View>
                </WvCard>
              </TouchableOpacity>
            );
          })}
        </View>

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title={loading ? 'Starting...' : 'Start my plan'}
          onPress={handleStartPlan}
          disabled={!selectedRate || loading}
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
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 8,
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
  plans: {
    gap: 12,
  },
  planCard: {
    padding: 16,
    gap: 12,
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  planNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '500',
  },
  planDesc: {
    fontSize: 12,
    marginTop: 4,
  },
  planCalories: {
    alignItems: 'flex-end',
  },
  caloriesValue: {
    fontSize: 20,
    fontWeight: '700',
  },
  caloriesUnit: {
    fontSize: 12,
  },
  macroBars: {
    gap: 8,
  },
  macroBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  macroLabel: {
    width: 16,
    fontSize: 11,
    fontWeight: '700',
  },
  macroTrack: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    overflow: 'hidden',
  },
  macroFill: {
    height: '100%',
    borderRadius: 2,
  },
  macroValue: {
    width: 36,
    fontSize: 11,
    textAlign: 'right',
  },
  planFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  planRate: {
    fontSize: 12,
  },
  warning: {
    fontSize: 11,
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

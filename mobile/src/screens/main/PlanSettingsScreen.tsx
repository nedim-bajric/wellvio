import { useMemo, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { ArrowLeft, Apple, AlertTriangle } from 'lucide-react-native';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { WvCard } from '../../components/ui/WvCard';
import { WvPill } from '../../components/ui/WvPill';
import { WvButton } from '../../components/ui/WvButton';
import { useTheme } from '../../theme/index';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';

interface PlanSettingsScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'PlanSettings'>;
}

const goals = [
  { key: 'lose', label: 'Lose weight' },
  { key: 'maintain', label: 'Maintain' },
  { key: 'gain', label: 'Gain weight' },
] as const;

const rates = ['0.25', '0.5', '0.75', '1.0'] as const;

type GoalKey = typeof goals[number]['key'];

export function PlanSettingsScreen({ navigation }: PlanSettingsScreenProps) {
  const theme = useTheme();
  const [goal, setGoal] = useState<GoalKey>('lose');
  const [rate, setRate] = useState<string>('0.5');

  const { calories, isAggressive } = useMemo(() => {
    const base = 2200;
    const r = parseFloat(rate);
    let target = base;
    if (goal === 'lose') target = base - r * 1000;
    if (goal === 'gain') target = base + r * 1000;
    return {
      calories: Math.round(target),
      isAggressive: goal !== 'maintain' && r >= 1.0,
    };
  }, [goal, rate]);

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Plan settings
        </Text>
      </View>

      <ScrollView contentContainerStyle={styles.scroll}>
        <WvCard style={styles.currentPlanCard}>
          <View
            style={[
              styles.planIcon,
              { backgroundColor: `${theme.colors.purple}15` },
            ]}
          >
            <Apple size={24} color={theme.colors.purple} />
          </View>
          <View style={styles.planInfo}>
            <Text
              style={[styles.planLabel, { color: theme.colors.textTertiary }]}
            >
              Current plan
            </Text>
            <Text
              style={[styles.planName, { color: theme.colors.textPrimary }]}
            >
              Balanced
            </Text>
            <Text
              style={[styles.planCalories, { color: theme.colors.textSecondary }]}
            >
              {calories} kcal / day
            </Text>
          </View>
        </WvCard>

        <View style={styles.section}>
          <Text
            style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
          >
            Goal
          </Text>
          <View style={styles.pillRow}>
            {goals.map((g) => (
              <WvPill
                key={g.key}
                label={g.label}
                selected={goal === g.key}
                onPress={() => setGoal(g.key)}
              />
            ))}
          </View>
        </View>

        {goal !== 'maintain' && (
          <View style={styles.section}>
            <Text
              style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}
            >
              Weekly rate
            </Text>
            <View style={styles.rateRow}>
              {rates.map((r) => (
                <WvPill
                  key={r}
                  label={`${r} kg`}
                  selected={rate === r}
                  onPress={() => setRate(r)}
                />
              ))}
            </View>
          </View>
        )}

        {isAggressive && (
          <View
            style={[
              styles.warningCard,
              {
                backgroundColor: `${theme.colors.warning}15`,
                borderColor: `${theme.colors.warning}40`,
              },
            ]}
          >
            <AlertTriangle size={18} color={theme.colors.warning} />
            <Text
              style={[
                styles.warningText,
                { color: theme.colors.textPrimary },
              ]}
            >
              This rate is aggressive. Make sure it is safe for your body and
              consult a professional if unsure.
            </Text>
          </View>
        )}
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title="Save changes"
          onPress={() => navigation.goBack()}
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
    gap: 12,
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  scroll: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 20,
  },
  currentPlanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 14,
  },
  planIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  planInfo: {
    flex: 1,
  },
  planLabel: {
    fontSize: 12,
    marginBottom: 2,
  },
  planName: {
    fontSize: 17,
    fontWeight: '600',
  },
  planCalories: {
    fontSize: 14,
    marginTop: 2,
  },
  section: {
    gap: 12,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '600',
  },
  pillRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  rateRow: {
    flexDirection: 'row',
    gap: 8,
  },
  warningCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  warningText: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});

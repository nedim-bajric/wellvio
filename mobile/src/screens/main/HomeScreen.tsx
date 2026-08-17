import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
  Alert,
} from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { ChevronRight, TrendingDown } from 'lucide-react-native';
import { WvMacroChip } from '../../components/ui/WvMacroChip';
import { WvCard } from '../../components/ui/WvCard';
import { WvSectionHeader } from '../../components/ui/WvSectionHeader';
import { WvProgressBar } from '../../components/ui/WvProgressBar';
import { SafeScreen, useTabBarPadding } from '../../components/SafeScreen';
import { FloatingAddButton } from '../../components/FloatingAddButton';
import {
  LogEntryBottomSheet,
  type LogEntryBottomSheetRef,
} from '../../components/LogEntryBottomSheet';
import { LogEntryListItem } from '../../components/LogEntryListItem';
import { useTheme } from '../../theme/index';
import { logEntryApi, isToday } from '../../api/logEntryApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatToday } from '../../utils/date';
import { useAuth } from '../../contexts/AuthContext';
import { supabase } from '../../lib/supabase';
import type { DailyDashboard, LogEntry } from '../../types/logEntry';
import type { Plan } from '../../types/weight';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

function formatDateLabel(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
}

function getInitials(name = 'User'): string {
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

export function HomeScreen({ navigation }: HomeScreenProps) {
  const theme = useTheme();
  const { width } = useWindowDimensions();
  const tabBarPadding = useTabBarPadding();
  const { user } = useAuth();
  const sheetRef = useRef<LogEntryBottomSheetRef>(null);
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [activePlan, setActivePlan] = useState<Plan | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadActivePlan = useCallback(async () => {
    if (!user) {
      setActivePlan(null);
      return;
    }
    const { data } = await supabase
      .from('profiles')
      .select('active_plan_id')
      .eq('user_id', user.id)
      .maybeSingle();

    if (!data?.active_plan_id) {
      setActivePlan(null);
      return;
    }

    const { data: plan } = await supabase
      .from('plans')
      .select('*')
      .eq('id', data.active_plan_id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (plan) {
      setActivePlan({
        id: plan.id,
        userId: plan.user_id,
        profileId: plan.profile_id,
        targetCalories: plan.target_calories,
        targetNutrients: {
          calories: plan.target_calories,
          protein: plan.target_protein,
          carbs: plan.target_carbs,
          fat: plan.target_fat,
        },
        dailyDeficit: plan.daily_deficit,
        daysToTarget: plan.days_to_target,
        rate: plan.rate,
        safe: plan.safe,
        active: plan.active,
        createdAt: plan.created_at,
        updatedAt: plan.updated_at,
      });
    } else {
      setActivePlan(null);
    }
  }, [user]);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [dash, list] = await Promise.all([
        logEntryApi.getDashboard(formatToday()),
        logEntryApi.list(formatToday()),
      ]);
      setDashboard(dash);
      setEntries(list);
      await loadActivePlan();
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, [loadActivePlan]);

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const handleDeleteEntry = useCallback(
    (entry: LogEntry) => {
      if (!isToday(entry.loggedAt)) {
        Alert.alert('You can only delete today’s entries');
        return;
      }
      Alert.alert('Delete entry', `Delete "${entry.foodName}"?`, [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await logEntryApi.remove(entry.id);
              await loadData();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err, 'Failed to delete entry'));
            }
          },
        },
      ]);
    },
    [loadData],
  );

  const totals = dashboard?.totals ?? {
    calories: 0,
    protein: 0,
    carbs: 0,
    fat: 0,
  };
  const targets = dashboard?.targets ?? {
    calories: 2000,
    protein: 150,
    carbs: 250,
    fat: 70,
  };
  const remaining = dashboard?.remaining ?? {
    calories: targets.calories - totals.calories,
    protein: targets.protein - totals.protein,
    carbs: targets.carbs - totals.carbs,
    fat: targets.fat - totals.fat,
  };

  const consumedCalories = totals.calories;
  const caloriesTarget = targets.calories;
  const caloriesLeft = Math.max(remaining.calories, 0);
  const calorieProgress = caloriesTarget > 0 ? consumedCalories / caloriesTarget : 0;
  const proteinProgress = targets.protein > 0 ? totals.protein / targets.protein : 0;
  const carbsProgress = targets.carbs > 0 ? totals.carbs / targets.carbs : 0;
  const fatProgress = targets.fat > 0 ? totals.fat / targets.fat : 0;

  const ringSize = Math.min(width - 80, 260);
  const center = ringSize / 2;
  const outerR = ringSize * 0.42;
  const midR = ringSize * 0.325;
  const innerR = ringSize * 0.24;
  const fatR = ringSize * 0.155;
  const outerC = 2 * Math.PI * outerR;
  const midC = 2 * Math.PI * midR;
  const innerC = 2 * Math.PI * innerR;
  const fatC = 2 * Math.PI * fatR;

  const recentEntries = entries.slice(0, 3);
  const hasMoreEntries = entries.length > 3;

  return (
    <SafeScreen hasTabBar>
      <ScrollView
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarPadding + 96 },
        ]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <View style={styles.topBar}>
          <View>
            <Text style={[styles.date, { color: theme.colors.textSecondary }]}>
              {formatDateLabel(new Date())}
            </Text>
            <Text style={[styles.greeting, { color: theme.colors.textPrimary }]}>
              {getGreeting()}
            </Text>
          </View>
        </View>

        {activePlan === null && (
          <TouchableOpacity
            onPress={() => navigation.navigate('CreatePlan', { returnToMain: true })}
            activeOpacity={0.8}
          >
            <WvCard style={styles.createPlanPrompt}>
              <View style={styles.createPlanInner}>
                <View>
                  <Text
                    style={[
                      styles.createPlanTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Create your plan
                  </Text>
                  <Text
                    style={[
                      styles.createPlanSubtitle,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    Set a goal to start tracking
                  </Text>
                </View>
                <ChevronRight size={18} color={theme.colors.textTertiary} />
              </View>
            </WvCard>
          </TouchableOpacity>
        )}

        <View style={styles.hero}>
          <View style={styles.rings}>
            <Svg width={ringSize} height={ringSize} style={styles.svg}>
              <Circle
                cx={center}
                cy={center}
                r={outerR}
                fill="none"
                stroke={theme.mode === 'dark' ? '#1E1E27' : '#E5E5EA'}
                strokeWidth={ringSize * 0.065}
              />
              <Circle
                cx={center}
                cy={center}
                r={outerR}
                fill="none"
                stroke={theme.colors.primary}
                strokeWidth={ringSize * 0.065}
                strokeDasharray={outerC}
                strokeDashoffset={outerC * (1 - Math.min(calorieProgress, 1))}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
              <Circle
                cx={center}
                cy={center}
                r={midR}
                fill="none"
                stroke={theme.mode === 'dark' ? '#1E1E27' : '#E5E5EA'}
                strokeWidth={ringSize * 0.05}
              />
              <Circle
                cx={center}
                cy={center}
                r={midR}
                fill="none"
                stroke={theme.colors.blue}
                strokeWidth={ringSize * 0.05}
                strokeDasharray={midC}
                strokeDashoffset={midC * (1 - Math.min(proteinProgress, 1))}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
              <Circle
                cx={center}
                cy={center}
                r={innerR}
                fill="none"
                stroke={theme.mode === 'dark' ? '#1E1E27' : '#E5E5EA'}
                strokeWidth={ringSize * 0.05}
              />
              <Circle
                cx={center}
                cy={center}
                r={innerR}
                fill="none"
                stroke={theme.colors.orange}
                strokeWidth={ringSize * 0.05}
                strokeDasharray={innerC}
                strokeDashoffset={innerC * (1 - Math.min(carbsProgress, 1))}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
              <Circle
                cx={center}
                cy={center}
                r={fatR}
                fill="none"
                stroke={theme.mode === 'dark' ? '#1E1E27' : '#E5E5EA'}
                strokeWidth={ringSize * 0.05}
              />
              <Circle
                cx={center}
                cy={center}
                r={fatR}
                fill="none"
                stroke={theme.colors.purple}
                strokeWidth={ringSize * 0.05}
                strokeDasharray={fatC}
                strokeDashoffset={fatC * (1 - Math.min(fatProgress, 1))}
                strokeLinecap="round"
                transform={`rotate(-90 ${center} ${center})`}
              />
            </Svg>
            <View style={styles.ringCenter}>
              <Text
                style={[
                  styles.ringCalories,
                  { color: theme.colors.textPrimary },
                ]}
              >
                {Math.round(caloriesLeft)}
              </Text>
              <Text
                style={[
                  styles.ringLabel,
                  { color: theme.colors.textSecondary },
                ]}
              >
                kcal left
              </Text>
              <Text
                style={[
                  styles.ringGoal,
                  { color: theme.colors.textTertiary },
                ]}
              >
                of {Math.round(caloriesTarget)} goal
              </Text>
            </View>
          </View>

          <View style={styles.macroChips}>
            <WvMacroChip
              label="Protein"
              value={Math.round(totals.protein)}
              target={Math.round(targets.protein)}
              color={theme.colors.blue}
            />
            <WvMacroChip
              label="Carbs"
              value={Math.round(totals.carbs)}
              target={Math.round(targets.carbs)}
              color={theme.colors.orange}
            />
            <WvMacroChip
              label="Fat"
              value={Math.round(totals.fat)}
              target={Math.round(targets.fat)}
              color={theme.colors.purple}
            />
          </View>
        </View>

        <WvCard style={styles.summaryCard}>
          <View style={styles.summaryRow}>
            {[
              { label: 'Calories', value: Math.round(totals.calories), unit: 'kcal', color: theme.colors.primary },
              { label: 'Protein', value: Math.round(totals.protein), unit: 'g', color: theme.colors.blue },
              { label: 'Carbs', value: Math.round(totals.carbs), unit: 'g', color: theme.colors.orange },
              { label: 'Fat', value: Math.round(totals.fat), unit: 'g', color: theme.colors.purple },
            ].map((m) => (
              <View key={m.label} style={styles.summaryItem}>
                <Text style={[styles.summaryValue, { color: m.color }]}>
                  {m.value}
                </Text>
                <Text style={[styles.summaryUnit, { color: theme.colors.textTertiary }]}>
                  {m.unit}
                </Text>
                <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        </WvCard>

        <View style={styles.insightCard}>
          <View
            style={[
              styles.insightInner,
              {
                backgroundColor: theme.colors.successBackground,
                borderColor: `${theme.colors.success}30`,
              },
            ]}
          >
            <TrendingDown size={18} color={theme.colors.primary} />
            <Text style={[styles.insightText, { color: theme.colors.textPrimary }]}>
              You're on track to hit your weekly goal. Keep it up!
            </Text>
          </View>
        </View>

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}

        <View style={styles.mealsSection}>
          <WvSectionHeader
            title="Today's food"
            actionLabel="View diary"
            onAction={() => navigation.navigate('Diary')}
          />

          {recentEntries.length === 0 ? (
            <WvCard style={styles.emptyCard}>
              <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
                Nothing logged yet. Tap + to add your first entry.
              </Text>
            </WvCard>
          ) : (
            <WvCard style={styles.entriesCard}>
              {recentEntries.map((entry) => (
                <LogEntryListItem
                  key={entry.id}
                  entry={entry}
                  compact
                  onPress={() => sheetRef.current?.presentForEdit(entry)}
                  onLongPress={() => handleDeleteEntry(entry)}
                />
              ))}
              {hasMoreEntries && (
                <TouchableOpacity
                  onPress={() => navigation.navigate('Diary')}
                  style={styles.moreRow}
                >
                  <Text style={[styles.moreText, { color: theme.colors.primary }]}>
                    +{entries.length - 3} more
                  </Text>
                </TouchableOpacity>
              )}
            </WvCard>
          )}
        </View>

        <TouchableOpacity
          onPress={() => navigation.navigate('WeightLog')}
          activeOpacity={0.8}
        >
          <WvCard style={styles.weightPrompt}>
            <View style={styles.weightPromptInner}>
              <View style={styles.weightPromptLeft}>
                <View
                  style={[
                    styles.weightIcon,
                    { backgroundColor: theme.colors.successBackground },
                  ]}
                >
                  <TrendingDown size={18} color={theme.colors.primary} />
                </View>
                <View>
                  <Text
                    style={[
                      styles.weightPromptTitle,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    Log today's weight
                  </Text>
                  <Text
                    style={[
                      styles.weightPromptSubtitle,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    Last logged 2 days ago
                  </Text>
                </View>
              </View>
              <ChevronRight size={18} color={theme.colors.textTertiary} />
            </View>
          </WvCard>
        </TouchableOpacity>
      </ScrollView>

      <FloatingAddButton onPress={() => sheetRef.current?.present()} />
      <LogEntryBottomSheet ref={sheetRef} onSaved={loadData} />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 32,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  date: {
    fontSize: 12,
  },
  greeting: {
    fontSize: 22,
    fontWeight: '700',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
  hero: {
    alignItems: 'center',
    paddingVertical: 16,
  },
  rings: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 260,
    height: 260,
  },
  svg: {
    position: 'absolute',
  },
  ringCenter: {
    alignItems: 'center',
  },
  ringCalories: {
    fontSize: 48,
    fontWeight: '700',
    lineHeight: 52,
  },
  ringLabel: {
    fontSize: 13,
  },
  ringGoal: {
    fontSize: 11,
    marginTop: 4,
  },
  macroChips: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    paddingHorizontal: 32,
    marginTop: 8,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    gap: 2,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
  },
  summaryUnit: {
    fontSize: 10,
  },
  summaryLabel: {
    fontSize: 10,
  },
  insightCard: {
    marginBottom: 16,
  },
  insightInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderWidth: 1,
  },
  insightText: {
    flex: 1,
    fontSize: 13,
  },
  error: {
    marginBottom: 12,
  },
  mealsSection: {
    marginBottom: 8,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  entriesCard: {
    overflow: 'hidden',
  },
  moreRow: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  moreText: {
    fontSize: 13,
    fontWeight: '600',
  },
  weightPrompt: {
    marginTop: 4,
  },
  weightPromptInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  weightPromptLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  weightIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  weightPromptTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  weightPromptSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  createPlanPrompt: {
    marginBottom: 16,
  },
  createPlanInner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  createPlanTitle: {
    fontSize: 15,
    fontWeight: '500',
  },
  createPlanSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
});

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  useWindowDimensions,
} from 'react-native';
import Svg, { Circle, Text as SvgText } from 'react-native-svg';
import { ChevronRight, Plus, TrendingDown } from 'lucide-react-native';
import { WvMacroChip } from '../../components/ui/WvMacroChip.js';
import { WvCard } from '../../components/ui/WvCard.js';
import { WvSectionHeader } from '../../components/ui/WvSectionHeader.js';
import { WvProgressBar } from '../../components/ui/WvProgressBar.js';
import { useTheme } from '../../theme/index.js';
import { logEntryApi } from '../../api/logEntryApi.js';
import { getErrorMessage } from '../../utils/errorMessage.js';
import { formatToday } from '../../utils/date.js';
import type { DailyDashboard, LogEntry, MealSlot } from '../../types/logEntry.js';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types.js';

type HomeScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Home'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface HomeScreenProps {
  navigation: HomeScreenNavigationProp;
}

const slotBudgetRatios: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.35,
  snacks: 0.05,
};

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
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

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

  const entriesBySlot: Record<MealSlot, LogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  entries.forEach((entry) => {
    entriesBySlot[entry.mealSlot].push(entry);
  });

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

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
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
          <TouchableOpacity
            onPress={() => navigation.navigate('Profile')}
            style={styles.avatar}
          >
            <View
              style={[
                styles.avatarGradient,
                {
                  backgroundColor: theme.colors.primary,
                },
              ]}
            >
              <Text style={styles.avatarText}>{getInitials()}</Text>
            </View>
          </TouchableOpacity>
        </View>

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
              You&apos;re on track to hit your weekly goal. Keep it up!
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
            title="Today's meals"
            actionLabel="View diary"
            onAction={() => navigation.navigate('Diary')}
          />

          {dashboard?.mealSlots.map((slot) => {
            const budget = Math.round(caloriesTarget * slotBudgetRatios[slot.mealSlot]);
            const consumed = Math.round(slot.nutrients.calories);
            const slotEntries = entriesBySlot[slot.mealSlot];
            const progress = budget > 0 ? consumed / budget : 0;
            const over = consumed > budget;

            return (
              <WvCard key={slot.mealSlot} style={styles.mealCard}>
                <View style={styles.mealHeader}>
                  <View>
                    <Text
                      style={[
                        styles.mealName,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {slot.mealSlot.charAt(0).toUpperCase() + slot.mealSlot.slice(1)}
                    </Text>
                    <Text
                      style={[
                        styles.mealBudget,
                        { color: theme.colors.textTertiary },
                      ]}
                    >
                      {consumed} / {budget} kcal
                    </Text>
                  </View>
                  <View style={styles.mealActions}>
                    <TouchableOpacity
                      onPress={() => navigation.navigate('Diary')}
                      style={[
                        styles.viewAllButton,
                        { backgroundColor: theme.colors.input },
                      ]}
                    >
                      <Text
                        style={[
                          styles.viewAllText,
                          { color: theme.colors.textSecondary },
                        ]}
                      >
                        View all
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() =>
                        navigation.navigate('AddFood', {
                          mealSlot: slot.mealSlot,
                        })
                      }
                      style={[
                        styles.addButton,
                        { backgroundColor: theme.colors.primary },
                      ]}
                    >
                      <Plus size={16} color="#000000" />
                    </TouchableOpacity>
                  </View>
                </View>

                <WvProgressBar
                  progress={progress}
                  color={over ? theme.colors.red : theme.colors.primary}
                  bgColor={theme.colors.border}
                  height={6}
                  style={styles.mealProgress}
                />

                {slotEntries.length === 0 ? (
                  <Text
                    style={[
                      styles.emptyMeal,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    Nothing logged yet
                  </Text>
                ) : (
                  <View style={styles.foodList}>
                    {slotEntries.slice(0, 3).map((entry) => (
                      <View key={entry.id} style={styles.foodRow}>
                        <Text
                          style={[
                            styles.foodName,
                            { color: theme.colors.textSecondary },
                          ]}
                        >
                          {entry.foodName}
                        </Text>
                        <Text
                          style={[
                            styles.foodKcal,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {Math.round(entry.nutrients.calories)} kcal
                        </Text>
                      </View>
                    ))}
                    {slotEntries.length > 3 && (
                      <Text style={[styles.moreText, { color: theme.colors.primary }]}>
                        +{slotEntries.length - 3} more
                      </Text>
                    )}
                  </View>
                )}
              </WvCard>
            );
          })}
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
                    Log today&apos;s weight
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
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
  mealCard: {
    padding: 16,
    marginBottom: 12,
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealBudget: {
    fontSize: 12,
    marginTop: 2,
  },
  mealActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  viewAllButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  viewAllText: {
    fontSize: 12,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealProgress: {
    marginBottom: 12,
  },
  emptyMeal: {
    fontSize: 13,
    textAlign: 'center',
    paddingVertical: 4,
  },
  foodList: {
    gap: 4,
  },
  foodRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  foodName: {
    fontSize: 13,
  },
  foodKcal: {
    fontSize: 13,
    fontWeight: '500',
  },
  moreText: {
    fontSize: 11,
    marginTop: 2,
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
});

import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { ChevronLeft, ChevronRight, Plus, Edit2 } from 'lucide-react-native';
import { WvCard } from '../../components/ui/WvCard';
import { WvProgressBar } from '../../components/ui/WvProgressBar';
import { useTheme } from '../../theme/index';
import { logEntryApi } from '../../api/logEntryApi';
import { getErrorMessage } from '../../utils/errorMessage';
import { formatToday } from '../../utils/date';
import type { DailyDashboard, LogEntry, MealSlot } from '../../types/logEntry';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { CompositeNavigationProp } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { MainTabParamList, RootStackParamList } from '../../navigation/types';

type DiaryScreenNavigationProp = CompositeNavigationProp<
  BottomTabNavigationProp<MainTabParamList, 'Diary'>,
  NativeStackNavigationProp<RootStackParamList>
>;

interface DiaryScreenProps {
  navigation: DiaryScreenNavigationProp;
}

const slotBudgetRatios: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.35,
  dinner: 0.35,
  snacks: 0.05,
};

const mealSlots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snacks'];

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function formatDayChip(date: Date): string {
  return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
}

function formatDateKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}

export function DiaryScreen({ navigation }: DiaryScreenProps) {
  const theme = useTheme();
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [entries, setEntries] = useState<LogEntry[]>([]);
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const dateKey = formatDateKey(selectedDate);
    try {
      const [list, dash] = await Promise.all([
        logEntryApi.list(dateKey),
        logEntryApi.getDashboard(dateKey),
      ]);
      setEntries(list);
      setDashboard(dash);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load diary'));
    } finally {
      setLoading(false);
    }
  }, [selectedDate]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const totalTarget = dashboard?.targets?.calories ?? 2000;

  const dates = [-2, -1, 0, 1, 2].map((offset) => addDays(selectedDate, offset));

  const entriesBySlot: Record<MealSlot, LogEntry[]> = {
    breakfast: [],
    lunch: [],
    dinner: [],
    snacks: [],
  };
  entries.forEach((entry) => {
    entriesBySlot[entry.mealSlot].push(entry);
  });

  const totals = dashboard?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: theme.colors.background },
      ]}
    >
      <View
        style={[
          styles.dateNav,
          {
            backgroundColor: theme.colors.card,
            borderBottomColor: theme.colors.border,
          },
        ]}
      >
        <TouchableOpacity
          onPress={() => setSelectedDate((d) => addDays(d, -1))}
          style={[
            styles.navButton,
            { backgroundColor: theme.colors.input },
          ]}
        >
          <ChevronLeft size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>

        <View style={styles.daysRow}>
          {dates.map((date, i) => {
            const selected = i === 2;
            return (
              <TouchableOpacity
                key={date.toISOString()}
                onPress={() => setSelectedDate(date)}
                style={[
                  styles.dayChip,
                  {
                    backgroundColor: selected
                      ? theme.colors.primary
                      : 'transparent',
                  },
                ]}
              >
                <Text
                  style={[
                    styles.dayChipText,
                    {
                      color: selected
                        ? '#000000'
                        : theme.colors.textSecondary,
                    },
                  ]}
                >
                  {formatDayChip(date)}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity
          onPress={() => setSelectedDate((d) => addDays(d, 1))}
          style={[
            styles.navButton,
            { backgroundColor: theme.colors.input },
          ]}
        >
          <ChevronRight size={16} color={theme.colors.textPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        {mealSlots.map((slot) => {
          const budget = Math.round(totalTarget * slotBudgetRatios[slot]);
          const slotEntries = entriesBySlot[slot];
          const totalKcal = Math.round(
            slotEntries.reduce((sum, e) => sum + e.nutrients.calories, 0),
          );
          const progress = budget > 0 ? totalKcal / budget : 0;

          return (
            <WvCard key={slot} style={styles.mealCard}>
              <View style={styles.mealHeader}>
                <View>
                  <Text
                    style={[
                      styles.mealName,
                      { color: theme.colors.textPrimary },
                    ]}
                  >
                    {slot.charAt(0).toUpperCase() + slot.slice(1)}
                  </Text>
                  <Text
                    style={[
                      styles.mealBudget,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    {totalKcal} / {budget} kcal
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate('AddFood', { mealSlot: slot })
                  }
                  style={[
                    styles.addButton,
                    { backgroundColor: theme.colors.primary },
                  ]}
                >
                  <Plus size={16} color="#000000" />
                </TouchableOpacity>
              </View>

              {slotEntries.length > 0 && (
                <View
                  style={[
                    styles.foodList,
                    {
                      borderTopColor: theme.colors.border,
                    },
                  ]}
                >
                  {slotEntries.map((entry) => (
                    <View key={entry.id} style={styles.foodRow}>
                      <View style={styles.foodInfo}>
                        <Text
                          style={[
                            styles.foodName,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {entry.foodName}
                        </Text>
                        <Text
                          style={[
                            styles.foodMeta,
                            { color: theme.colors.textTertiary },
                          ]}
                        >
                          {entry.grams}g · P{Math.round(entry.nutrients.protein)}{' '}
                          C{Math.round(entry.nutrients.carbs)} F
                          {Math.round(entry.nutrients.fat)}
                        </Text>
                      </View>
                      <View style={styles.foodRight}>
                        <Text
                          style={[
                            styles.foodKcal,
                            { color: theme.colors.textPrimary },
                          ]}
                        >
                          {Math.round(entry.nutrients.calories)}
                        </Text>
                        <TouchableOpacity
                          onPress={() => {}}
                          style={styles.editButton}
                        >
                          <Edit2 size={14} color={theme.colors.textTertiary} />
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}

              {slotEntries.length === 0 && (
                <View
                  style={[
                    styles.emptyRow,
                    { borderTopColor: theme.colors.border },
                  ]}
                >
                  <Text
                    style={[
                      styles.emptyText,
                      { color: theme.colors.textTertiary },
                    ]}
                  >
                    Nothing logged yet
                  </Text>
                </View>
              )}
            </WvCard>
          );
        })}

        <WvCard style={styles.totalCard}>
          <Text
            style={[
              styles.totalLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Daily total
          </Text>
          <View style={styles.totalRow}>
            {[
              { label: 'Calories', value: `${Math.round(totals.calories)}`, color: theme.colors.primary },
              { label: 'Protein', value: `${Math.round(totals.protein)}g`, color: theme.colors.blue },
              { label: 'Carbs', value: `${Math.round(totals.carbs)}g`, color: theme.colors.orange },
              { label: 'Fat', value: `${Math.round(totals.fat)}g`, color: theme.colors.purple },
            ].map((m) => (
              <View key={m.label} style={styles.totalItem}>
                <Text
                  style={[
                    styles.totalValue,
                    { color: m.color },
                  ]}
                >
                  {m.value}
                </Text>
                <Text
                  style={[
                    styles.totalUnit,
                    { color: theme.colors.textTertiary },
                  ]}
                >
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        </WvCard>

        {error && (
          <Text style={[styles.error, { color: theme.colors.error }]}>
            {error}
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  dateNav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  navButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  daysRow: {
    flexDirection: 'row',
    gap: 4,
  },
  dayChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
  dayChipText: {
    fontSize: 13,
    fontWeight: '500',
  },
  scroll: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    gap: 12,
  },
  mealCard: {
    overflow: 'hidden',
  },
  mealHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  mealName: {
    fontSize: 16,
    fontWeight: '600',
  },
  mealBudget: {
    fontSize: 12,
    marginTop: 2,
  },
  addButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  foodList: {
    borderTopWidth: 1,
  },
  foodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 15,
    fontWeight: '500',
  },
  foodMeta: {
    fontSize: 12,
    marginTop: 2,
  },
  foodRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  foodKcal: {
    fontSize: 15,
    fontWeight: '600',
  },
  editButton: {
    padding: 4,
  },
  emptyRow: {
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  emptyText: {
    fontSize: 13,
  },
  totalCard: {
    padding: 16,
    marginTop: 4,
  },
  totalLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  totalItem: {
    alignItems: 'center',
    gap: 4,
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  totalUnit: {
    fontSize: 10,
  },
  error: {
    marginTop: 8,
  },
});

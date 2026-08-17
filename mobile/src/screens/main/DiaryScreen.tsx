import { useCallback, useRef, useState } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { ChevronLeft, ChevronRight } from 'lucide-react-native';
import { WvCard } from '../../components/ui/WvCard';
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
import type { DailyDashboard, LogEntry } from '../../types/logEntry';
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

function formatFullDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });
}

export function DiaryScreen({ navigation }: DiaryScreenProps) {
  const theme = useTheme();
  const tabBarPadding = useTabBarPadding();
  const sheetRef = useRef<LogEntryBottomSheetRef>(null);
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

  const handleEditEntry = useCallback((entry: LogEntry) => {
    sheetRef.current?.presentForEdit(entry);
  }, []);

  const handleDeleteEntry = useCallback(
    async (entry: LogEntry) => {
      try {
        await logEntryApi.remove(entry.id);
        await loadData();
      } catch (err) {
        Alert.alert('Error', getErrorMessage(err, 'Failed to delete entry'));
      }
    },
    [loadData],
  );

  const handleEntryLongPress = useCallback(
    (entry: LogEntry) => {
      const canDelete = isToday(entry.loggedAt);
      const options: { text: string; style?: 'cancel' | 'destructive'; onPress?: () => void }[] = [
        { text: 'Edit', onPress: () => handleEditEntry(entry) },
      ];
      if (canDelete) {
        options.push({
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert('Delete entry', `Delete "${entry.foodName}"?`, [
              { text: 'Cancel', style: 'cancel' },
              {
                text: 'Delete',
                style: 'destructive',
                onPress: () => void handleDeleteEntry(entry),
              },
            ]);
          },
        });
      }
      options.push({ text: 'Cancel', style: 'cancel' });
      Alert.alert(entry.foodName, undefined, options);
    },
    [handleEditEntry, handleDeleteEntry],
  );

  useFocusEffect(
    useCallback(() => {
      void loadData();
    }, [loadData]),
  );

  const totals = dashboard?.totals ?? { calories: 0, protein: 0, carbs: 0, fat: 0 };
  const targets = dashboard?.targets;
  const remaining = dashboard?.remaining ?? {
    calories: (targets?.calories ?? 0) - totals.calories,
    protein: (targets?.protein ?? 0) - totals.protein,
    carbs: (targets?.carbs ?? 0) - totals.carbs,
    fat: (targets?.fat ?? 0) - totals.fat,
  };

  const calorieTarget = targets?.calories ?? 0;
  const calorieProgress = calorieTarget > 0 ? totals.calories / calorieTarget : 0;

  const dates = [-2, -1, 0, 1, 2].map((offset) => addDays(selectedDate, offset));

  const selectedIsToday = formatDateKey(selectedDate) === formatDateKey(new Date());

  return (
    <SafeScreen hasTabBar>
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

      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        contentContainerStyle={[
          styles.scroll,
          { paddingBottom: tabBarPadding + 96 },
        ]}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        ListHeaderComponent={
          <View>
            <Text style={[styles.dateTitle, { color: theme.colors.textPrimary }]}>
              {selectedIsToday ? 'Today' : formatFullDate(selectedDate)}
            </Text>

            <WvCard style={styles.summaryCard}>
              <View style={styles.summaryHeader}>
                <View>
                  <Text
                    style={[styles.summaryValue, { color: theme.colors.textPrimary }]}
                  >
                    {Math.round(totals.calories)}
                    <Text style={[styles.summaryUnit, { color: theme.colors.textTertiary }]}>
                      {' '}
                      / {calorieTarget > 0 ? Math.round(calorieTarget) : '-'} kcal
                    </Text>
                  </Text>
                  <Text style={[styles.summaryLabel, { color: theme.colors.textSecondary }]}>
                    {Math.max(remaining.calories, 0)} kcal remaining
                  </Text>
                </View>
                <View style={styles.macroPills}>
                  {[
                    { label: 'P', value: Math.round(totals.protein), target: targets?.protein, color: theme.colors.blue },
                    { label: 'C', value: Math.round(totals.carbs), target: targets?.carbs, color: theme.colors.orange },
                    { label: 'F', value: Math.round(totals.fat), target: targets?.fat, color: theme.colors.purple },
                  ].map((m) => (
                    <View key={m.label} style={styles.macroPill}>
                      <Text style={[styles.macroPillValue, { color: m.color }]}>
                        {m.value}
                      </Text>
                      <Text style={[styles.macroPillUnit, { color: theme.colors.textTertiary }]}>
                        {m.label}
                        {m.target !== undefined && m.target !== null ? ` / ${Math.round(m.target)}` : ''}
                      </Text>
                    </View>
                  ))}
                </View>
              </View>
              <WvProgressBar
                progress={calorieProgress}
                color={calorieProgress > 1 ? theme.colors.red : theme.colors.primary}
                bgColor={theme.colors.border}
                height={8}
                style={styles.progressBar}
              />
            </WvCard>

            <Text style={[styles.sectionTitle, { color: theme.colors.textPrimary }]}>
              Entries
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <LogEntryListItem
            entry={item}
            onPress={handleEditEntry}
            onLongPress={handleEntryLongPress}
          />
        )}
        ListEmptyComponent={
          <WvCard style={styles.emptyCard}>
            <Text style={[styles.emptyText, { color: theme.colors.textTertiary }]}>
              Nothing logged yet. Tap + to add an entry.
            </Text>
          </WvCard>
        }
      />

      {error && (
        <Text style={[styles.error, { color: theme.colors.error }]}>
          {error}
        </Text>
      )}

      <FloatingAddButton onPress={() => sheetRef.current?.present()} />
      <LogEntryBottomSheet ref={sheetRef} onSaved={loadData} />
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
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
    paddingTop: 16,
    gap: 12,
  },
  dateTitle: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
  },
  summaryCard: {
    padding: 16,
    marginBottom: 16,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  summaryValue: {
    fontSize: 28,
    fontWeight: '700',
  },
  summaryUnit: {
    fontSize: 14,
    fontWeight: '500',
  },
  summaryLabel: {
    fontSize: 12,
    marginTop: 2,
  },
  macroPills: {
    flexDirection: 'row',
    gap: 12,
  },
  macroPill: {
    alignItems: 'center',
  },
  macroPillValue: {
    fontSize: 16,
    fontWeight: '700',
  },
  macroPillUnit: {
    fontSize: 10,
  },
  progressBar: {
    marginTop: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  emptyCard: {
    padding: 24,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 14,
    textAlign: 'center',
  },
  error: {
    position: 'absolute',
    bottom: 100,
    left: 20,
    right: 20,
  },
});

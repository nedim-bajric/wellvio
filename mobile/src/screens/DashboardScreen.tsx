import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  Button,
  FlatList,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { logEntryApi } from '../api/logEntryApi.js';
import { getErrorMessage } from '../utils/errorMessage.js';
import { formatToday } from '../utils/date.js';
import type { DailyDashboard, MealSlotSummary } from '../types/logEntry.js';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { RootTabParamList } from '../../App.js';

type DashboardNavigationProp = BottomTabNavigationProp<
  RootTabParamList,
  'Dashboard'
>;

interface DashboardScreenProps {
  navigation: DashboardNavigationProp;
}

function formatMacro(value: number): string {
  return value.toFixed(1);
}

export function DashboardScreen({ navigation }: DashboardScreenProps) {
  const [dashboard, setDashboard] = useState<DailyDashboard | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await logEntryApi.getDashboard(formatToday());
      setDashboard(data);
    } catch (err) {
      setError(getErrorMessage(err, 'Failed to load dashboard'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Today</Text>
      {error && <Text style={styles.error}>{error}</Text>}
      <Button title="Log food" onPress={() => navigation.navigate('Log')} />

      <View style={styles.summaryCard}>
        <Text style={styles.cardTitle}>Totals</Text>
        {dashboard ? (
          <>
            <MacroRow
              label="Calories"
              value={dashboard.totals.calories}
              target={dashboard.targets?.calories}
            />
            <MacroRow
              label="Protein"
              value={dashboard.totals.protein}
              target={dashboard.targets?.protein}
              unit="g"
            />
            <MacroRow
              label="Carbs"
              value={dashboard.totals.carbs}
              target={dashboard.targets?.carbs}
              unit="g"
            />
            <MacroRow
              label="Fat"
              value={dashboard.totals.fat}
              target={dashboard.targets?.fat}
              unit="g"
            />
          </>
        ) : (
          <Text>Loading...</Text>
        )}
      </View>

      <Text style={styles.sectionTitle}>Meal slots</Text>
      <FlatList
        data={dashboard?.mealSlots ?? []}
        keyExtractor={(item) => item.mealSlot}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadDashboard} />
        }
        renderItem={({ item }) => <MealSlotRow summary={item} />}
        ListEmptyComponent={
          <Text style={styles.empty}>No entries logged today.</Text>
        }
      />
    </View>
  );
}

function MacroRow({
  label,
  value,
  target,
  unit = '',
}: {
  label: string;
  value: number;
  target?: number;
  unit?: string;
}) {
  const targetText = target !== undefined ? ` / ${formatMacro(target)}${unit}` : '';
  return (
    <View style={styles.macroRow}>
      <Text style={styles.macroLabel}>{label}</Text>
      <Text style={styles.macroValue}>
        {formatMacro(value)}
        {unit}
        {targetText}
      </Text>
    </View>
  );
}

function MealSlotRow({ summary }: { summary: MealSlotSummary }) {
  const { mealSlot, nutrients } = summary;
  return (
    <View style={styles.slotRow}>
      <Text style={styles.slotName}>{mealSlot}</Text>
      <Text style={styles.slotMacros}>
        {formatMacro(nutrients.calories)} kcal · P {formatMacro(nutrients.protein)} · C{' '}
        {formatMacro(nutrients.carbs)} · F {formatMacro(nutrients.fat)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 48,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 12,
  },
  summaryCard: {
    marginTop: 16,
    padding: 16,
    borderRadius: 8,
    backgroundColor: '#f5f5f5',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
  },
  macroLabel: {
    fontSize: 16,
  },
  macroValue: {
    fontSize: 16,
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  slotRow: {
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  slotName: {
    fontSize: 16,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  slotMacros: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});

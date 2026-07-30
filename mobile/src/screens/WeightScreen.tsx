import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Button,
  FlatList,
  StyleSheet,
  Alert,
  RefreshControl,
} from 'react-native';
import { weightApi } from '../api/weightApi.js';
import { getErrorMessage } from '../utils/errorMessage.js';
import { formatToday } from '../utils/date.js';
import type {
  PlanAdjustmentSuggestion,
  WeightLog,
  WeightTrendAnalysis,
} from '../types/weight.js';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import type { MainTabParamList } from '../navigation/types.js';

type WeightNavigationProp = BottomTabNavigationProp<MainTabParamList, 'Home'>;

interface WeightScreenProps {
  navigation: WeightNavigationProp;
}

export function WeightScreen({ navigation }: WeightScreenProps) {
  const [entries, setEntries] = useState<WeightLog[]>([]);
  const [weight, setWeight] = useState('');
  const [trend, setTrend] = useState<WeightTrendAnalysis | null>(null);
  const [suggestion, setSuggestion] = useState<PlanAdjustmentSuggestion | null>(null);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [entryList, trendAnalysis, adjustmentSuggestion] = await Promise.all([
        weightApi.list(),
        weightApi.getTrend(),
        weightApi.getAdjustmentSuggestion(),
      ]);
      setEntries(entryList);
      setTrend(trendAnalysis);
      setSuggestion(adjustmentSuggestion);
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to load weight data'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async () => {
    const parsedWeight = parseFloat(weight);
    if (Number.isNaN(parsedWeight) || parsedWeight <= 0) {
      Alert.alert('Enter a valid weight in kg');
      return;
    }

    setSubmitting(true);
    try {
      await weightApi.create({
        weightKg: parsedWeight,
        loggedAt: new Date().toISOString(),
      });
      setWeight('');
      await loadData();
    } catch (err) {
      Alert.alert('Error', getErrorMessage(err, 'Failed to log weight'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyAdjustment = async () => {
    if (!suggestion?.suggestedPlan) return;

    const suggestedPlan = suggestion.suggestedPlan;

    Alert.alert(
      'Apply adjustment?',
      `${suggestion.reason}\n\nNew plan: ${suggestedPlan.rate} (${suggestedPlan.targetCalories} kcal/day)`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Approve',
          onPress: async () => {
            setLoading(true);
            try {
              await weightApi.applyAdjustment(suggestedPlan.rate);
              Alert.alert('Adjustment applied');
              await loadData();
            } catch (err) {
              Alert.alert('Error', getErrorMessage(err, 'Failed to apply adjustment'));
            } finally {
              setLoading(false);
            }
          },
        },
      ],
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Weight</Text>

      <TextInput
        style={styles.input}
        placeholder="Weight (kg)"
        value={weight}
        onChangeText={setWeight}
        keyboardType="decimal-pad"
      />

      <Button
        title={submitting ? 'Saving...' : 'Log weight'}
        onPress={handleSubmit}
        disabled={submitting}
      />

      {trend && (
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Trend</Text>
          <Text>Latest: {trend.latestWeightKg.toFixed(1)} kg</Text>
          <Text>Actual: {trend.actualWeeklyChangeKg.toFixed(2)} kg/week</Text>
          <Text>Planned: {trend.plannedWeeklyChangeKg.toFixed(2)} kg/week</Text>
          <Text style={styles.trendLabel}>{formatTrend(trend.trend)}</Text>
        </View>
      )}

      {suggestion?.suggestedPlan && (
        <View style={styles.summaryCard}>
          <Text style={styles.cardTitle}>Suggested adjustment</Text>
          <Text style={styles.reason}>{suggestion.reason}</Text>
          <Text>
            Current: {suggestion.currentPlan.rate} ({suggestion.currentPlan.targetCalories} kcal)
          </Text>
          <Text>
            Suggested: {suggestion.suggestedPlan.rate} ({suggestion.suggestedPlan.targetCalories} kcal)
          </Text>
          <View style={styles.approveButton}>
            <Button title="Approve adjustment" onPress={handleApplyAdjustment} />
          </View>
        </View>
      )}

      <Text style={styles.sectionTitle}>History</Text>
      <FlatList
        data={entries}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
        renderItem={({ item }) => (
          <View style={styles.entryRow}>
            <Text style={styles.entryWeight}>{item.weightKg.toFixed(1)} kg</Text>
            <Text style={styles.entryDate}>{formatDate(item.loggedAt)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.empty}>No weight entries logged yet.</Text>
        }
      />
    </View>
  );
}

function formatTrend(trend: WeightTrendAnalysis['trend']): string {
  switch (trend) {
    case 'ahead':
      return 'Losing faster than planned';
    case 'behind':
      return 'Losing slower than planned';
    case 'onTrack':
      return 'On track';
    case 'insufficientData':
      return 'Log weight more often to see a trend';
  }
}

function formatDate(isoDate: string): string {
  return new Date(isoDate).toLocaleDateString();
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
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
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
    marginBottom: 8,
  },
  trendLabel: {
    marginTop: 8,
    fontWeight: '600',
    color: '#007AFF',
  },
  reason: {
    marginBottom: 8,
  },
  approveButton: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginTop: 24,
    marginBottom: 12,
  },
  entryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  entryWeight: {
    fontSize: 16,
    fontWeight: '500',
  },
  entryDate: {
    fontSize: 14,
    color: '#666',
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    color: '#666',
  },
});

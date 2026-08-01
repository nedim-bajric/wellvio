import { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Alert,
} from 'react-native';
import { ArrowLeft, TrendingDown } from 'lucide-react-native';
import Svg, { Polyline, Circle } from 'react-native-svg';
import { WvButton } from '../../components/ui/WvButton';
import { WvIconButton } from '../../components/ui/WvIconButton';
import { WvCard } from '../../components/ui/WvCard';
import { SafeScreen } from '../../components/SafeScreen';
import { useTheme } from '../../theme/index';
import { weightApi } from '../../api/weightApi';
import { getErrorMessage } from '../../utils/errorMessage';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import type { RootStackParamList } from '../../navigation/types';
import type { WeightLog, WeightTrendAnalysis } from '../../types/weight';

interface WeightLogScreenProps {
  navigation: NativeStackNavigationProp<RootStackParamList, 'WeightLog'>;
}

type WeightUnit = 'kg' | 'lb';

const LB_PER_KG = 2.20462;

function kgToLb(kg: number): number {
  return kg * LB_PER_KG;
}

function lbToKg(lb: number): number {
  return lb / LB_PER_KG;
}

function formatWeight(value: number, unit: WeightUnit): string {
  return unit === 'kg' ? value.toFixed(1) : value.toFixed(1);
}

export function WeightLogScreen({ navigation }: WeightLogScreenProps) {
  const theme = useTheme();
  const [entries, setEntries] = useState<WeightLog[]>([]);
  const [trend, setTrend] = useState<WeightTrendAnalysis | null>(null);
  const [weight, setWeight] = useState('');
  const [unit, setUnit] = useState<WeightUnit>('kg');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [entryList, trendAnalysis] = await Promise.all([
        weightApi.list(),
        weightApi.getTrend(),
      ]);
      setEntries(entryList);
      setTrend(trendAnalysis);
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
    const parsed = parseFloat(weight);
    if (Number.isNaN(parsed) || parsed <= 0) {
      Alert.alert('Enter a valid weight');
      return;
    }
    const weightKg = unit === 'kg' ? parsed : lbToKg(parsed);

    setSubmitting(true);
    try {
      await weightApi.create({
        weightKg,
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

  const chartEntries = entries.slice(0, 7).reverse();
  const values = chartEntries.map((e) =>
    unit === 'kg' ? e.weightKg : kgToLb(e.weightKg),
  );
  const maxW = values.length > 0 ? Math.max(...values) : 0;
  const minW = values.length > 0 ? Math.min(...values) : 0;
  const range = maxW - minW || 1;

  const trendValue = trend?.actualWeeklyChangeKg ?? 0;
  const trendDisplay =
    unit === 'kg' ? trendValue.toFixed(2) : kgToLb(trendValue).toFixed(2);

  return (
    <SafeScreen>
      <View style={styles.header}>
        <WvIconButton
          icon={<ArrowLeft size={20} color={theme.colors.textPrimary} />}
          onPress={() => navigation.goBack()}
        />
        <Text style={[styles.title, { color: theme.colors.textPrimary }]}>
          Weight
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={styles.scroll}
        refreshControl={
          <RefreshControl refreshing={loading} onRefresh={loadData} />
        }
      >
        <View
          style={[
            styles.unitToggle,
            { backgroundColor: theme.colors.input },
          ]}
        >
          {(['kg', 'lb'] as WeightUnit[]).map((u) => (
            <TouchableOpacity
              key={u}
              onPress={() => setUnit(u)}
              style={[
                styles.unitButton,
                {
                  backgroundColor:
                    unit === u ? theme.colors.card : 'transparent',
                  shadowOpacity: unit === u ? 0.1 : 0,
                },
              ]}
            >
              <Text
                style={[
                  styles.unitButtonText,
                  {
                    color:
                      unit === u
                        ? theme.colors.textPrimary
                        : theme.colors.textTertiary,
                  },
                ]}
              >
                {u}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.inputSection}>
          <View style={styles.weightRow}>
            <TextInput
              value={weight}
              onChangeText={setWeight}
              placeholder="0.0"
              placeholderTextColor={theme.colors.textTertiary}
              keyboardType="decimal-pad"
              style={[
                styles.weightInput,
                { color: theme.colors.textPrimary },
              ]}
            />
            <Text
              style={[
                styles.weightUnit,
                { color: theme.colors.textSecondary },
              ]}
            >
              {unit}
            </Text>
          </View>
          <Text
            style={[
              styles.dateLabel,
              { color: theme.colors.textTertiary },
            ]}
          >
            Today, {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}
          </Text>
        </View>

        <View
          style={[
            styles.trendCard,
            {
              backgroundColor: theme.colors.successBackground,
              borderColor: `${theme.colors.success}30`,
            },
          ]}
        >
          <TrendingDown size={18} color={theme.colors.primary} />
          <View>
            <Text
              style={[
                styles.trendTitle,
                { color: theme.colors.textPrimary },
              ]}
            >
              7-day trend: {trendDisplay} {unit}/week
            </Text>
            <Text
              style={[
                styles.trendSubtitle,
                { color: theme.colors.textTertiary },
              ]}
            >
              {trend ? formatTrend(trend.trend) : 'Log weight more often to see a trend'}
            </Text>
          </View>
        </View>

        <WvCard style={styles.chartCard}>
          <Text
            style={[
              styles.chartLabel,
              { color: theme.colors.textSecondary },
            ]}
          >
            Last {chartEntries.length} entries
          </Text>
          {chartEntries.length > 1 ? (
            <>
              <View style={styles.chart}>
                <Svg
                  width="100%"
                  height={100}
                  viewBox={`0 0 ${chartEntries.length * 40} 100`}
                  preserveAspectRatio="none"
                >
                  <Polyline
                    points={values
                      .map(
                        (v, i) =>
                          `${i * 40 + 20},${90 - ((v - minW) / range) * 70}`,
                      )
                      .join(' ')}
                    fill="none"
                    stroke={theme.colors.primary}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  {values.map((v, i) => (
                    <Circle
                      key={i}
                      cx={i * 40 + 20}
                      cy={90 - ((v - minW) / range) * 70}
                      r="5"
                      fill={theme.colors.primary}
                    />
                  ))}
                </Svg>
              </View>
              <View style={styles.chartLabels}>
                {chartEntries.map((entry, i) => (
                  <View key={entry.id} style={styles.chartLabelItem}>
                    <Text
                      style={[
                        styles.chartValue,
                        { color: theme.colors.textPrimary },
                      ]}
                    >
                      {formatWeight(values[i], unit)}
                    </Text>
                    <Text
                      style={[
                        styles.chartDate,
                        { color: theme.colors.textTertiary },
                      ]}
                    >
                      {new Date(entry.loggedAt).toLocaleDateString('en-US', {
                        day: 'numeric',
                      })}
                    </Text>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <Text
              style={[
                styles.chartEmpty,
                { color: theme.colors.textTertiary },
              ]}
            >
              Log weight a few times to see your trend chart.
            </Text>
          )}
        </WvCard>
      </ScrollView>

      <View style={styles.footer}>
        <WvButton
          title={submitting ? 'Saving...' : 'Log weight'}
          onPress={handleSubmit}
          loading={submitting}
        />
      </View>
    </SafeScreen>
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
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
  unitToggle: {
    flexDirection: 'row',
    padding: 4,
    borderRadius: 12,
  },
  unitButton: {
    flex: 1,
    height: 36,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  unitButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  inputSection: {
    alignItems: 'center',
    gap: 8,
  },
  weightRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 8,
  },
  weightInput: {
    width: 160,
    fontSize: 56,
    fontWeight: '700',
    textAlign: 'right',
  },
  weightUnit: {
    fontSize: 24,
    fontWeight: '500',
    marginBottom: 10,
  },
  dateLabel: {
    fontSize: 13,
  },
  trendCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 16,
    borderWidth: 1,
  },
  trendTitle: {
    fontSize: 14,
    fontWeight: '500',
  },
  trendSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  chartCard: {
    padding: 16,
  },
  chartLabel: {
    fontSize: 12,
    fontWeight: '500',
    marginBottom: 16,
  },
  chart: {
    height: 100,
  },
  chartLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  chartLabelItem: {
    alignItems: 'center',
    gap: 2,
  },
  chartValue: {
    fontSize: 11,
    fontWeight: '600',
  },
  chartDate: {
    fontSize: 9,
  },
  chartEmpty: {
    fontSize: 14,
    textAlign: 'center',
    paddingVertical: 24,
  },
  footer: {
    paddingHorizontal: 16,
    paddingBottom: 32,
    paddingTop: 12,
  },
});
